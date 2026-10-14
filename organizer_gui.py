"""
================================================================================
منظّم الملفات الذكي وكاشف المكررات — الإصدار 2.1
================================================================================
ما الجديد في 2.1 (إصلاحات أمان قبل أي شيء):
  1. المكررات لا تُحذف نهائياً أبداً: تذهب إلى سلة المحذوفات في ويندوز
     (ويمكن استرجاعها)، وفي غير ويندوز تُنقل إلى مجلد مراجعة داخل مجلد الإخراج.
  2. معاينة قبل التنفيذ: يفحص البرنامج أولاً ويعرض لك ما سيحدث بالتفصيل،
     ولا يلمس أي ملف حتى تضغط «تنفيذ».
  3. المكرر لا يُرمى إلا إذا نجح حفظ نسخته الأصلية في المجلد الجديد.
  4. تجاهل ملفات النظام (desktop.ini و Thumbs.db وغيرها) والملفات الفارغة
     لأنها متطابقة دائماً وليست تكراراً حقيقياً.
  5. تقرير صادق: يذكر كل خطأ حدث، ولا يقول «بنجاح تام» إلا إذا لم يحدث خطأ.
  6. الواجهة لا تتجمد: الفحص يعمل في الخلفية ويرسل التحديثات عبر قائمة انتظار.
  7. الفحص ثلاثي المراحل فعلياً: الحجم ← بصمة أول 64KB ← SHA-256 كامل.
  8. زر إيقاف، وإزالة المجلدات التي أصبحت فارغة بعد النقل.
  9. يعمل بشكل صحيح كملف EXE (المجلد الافتراضي هو مجلد البرنامج نفسه).
================================================================================
"""

import hashlib
import os
import queue
import shutil
import sys
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path

APP_VERSION = "2.1.0"
REPORT_NAME = "تقرير_تنظيم_الملفات.txt"
REVIEW_FOLDER = "_مكررات_للمراجعة"

# ملفات ينشئها النظام تلقائياً في كل مجلد، فهي «متطابقة» دائماً وليست تكراراً حقيقياً
SYSTEM_FILE_NAMES = {"desktop.ini", "thumbs.db", ".ds_store", "ehthumbs.db", "icon\r"}
SYSTEM_PREFIXES = ("~$", ".~lock.")  # ملفات أوفيس/ليبر أوفيس المؤقتة


# ============================================================================
# أدوات مساعدة
# ============================================================================

def app_directory() -> Path:
    """مجلد البرنامج: مجلد ملف EXE عند التشغيل كملف تنفيذي، أو مجلد السكربت."""
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def own_files() -> set:
    """ملفات البرنامج نفسه حتى لا ينقلها أو يحذفها."""
    paths = {Path(__file__).resolve()}
    if getattr(sys, "frozen", False):
        paths.add(Path(sys.executable).resolve())
    return paths


def format_size(bytes_size: float) -> str:
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} PB"


def partial_hash(path: Path, size: int = 65536):
    """بصمة أول 64KB: فرز سريع قبل الحساب الكامل."""
    try:
        with open(path, "rb") as f:
            return hashlib.sha256(f.read(size)).hexdigest()
    except OSError:
        return None


def full_hash(path: Path, block: int = 1024 * 1024, cancel=None):
    try:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(block), b""):
                if cancel is not None and cancel.is_set():
                    return None
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None


def is_system_file(name: str) -> bool:
    low = name.lower()
    return low in SYSTEM_FILE_NAMES or low.startswith(SYSTEM_PREFIXES)


def send_to_recycle_bin(paths):
    """
    إرسال ملفات إلى سلة المحذوفات في ويندوز (قابلة للاسترجاع).
    تُرجع قائمة (المسار، رسالة الخطأ) للملفات التي فشلت.
    """
    import ctypes
    from ctypes import wintypes

    class SHFILEOPSTRUCTW(ctypes.Structure):
        _fields_ = [
            ("hwnd", wintypes.HWND),
            ("wFunc", wintypes.UINT),
            ("pFrom", wintypes.LPCWSTR),
            ("pTo", wintypes.LPCWSTR),
            ("fFlags", ctypes.c_ushort),
            ("fAnyOperationsAborted", wintypes.BOOL),
            ("hNameMappings", ctypes.c_void_p),
            ("lpszProgressTitle", wintypes.LPCWSTR),
        ]

    FO_DELETE = 0x0003
    FOF_SILENT, FOF_NOCONFIRMATION, FOF_ALLOWUNDO = 0x0004, 0x0010, 0x0040
    FOF_NOERRORUI = 0x0400
    failed = []
    for p in paths:
        op = SHFILEOPSTRUCTW()
        op.wFunc = FO_DELETE
        op.pFrom = str(p) + "\0"  # يجب أن ينتهي بصفرين
        op.fFlags = FOF_ALLOWUNDO | FOF_NOCONFIRMATION | FOF_SILENT | FOF_NOERRORUI
        rc = ctypes.windll.shell32.SHFileOperationW(ctypes.byref(op))
        if rc != 0 or op.fAnyOperationsAborted or Path(p).exists():
            failed.append((p, f"رمز الخطأ {rc}"))
    return failed


def drive_has_recycle_bin(path: Path) -> bool:
    """
    سلة المحذوفات موجودة فقط على الأقراص الثابتة في ويندوز. على الفلاش ومجلدات الشبكة
    يتحول «الإرسال إلى السلة» إلى حذف نهائي صامت، فنستخدم مجلد المراجعة بدلاً منها.
    """
    if os.name != "nt":
        return False
    p = str(Path(path).resolve())
    if p.startswith("\\\\"):  # مسار شبكة \\server\share
        return False
    drive = os.path.splitdrive(p)[0]
    if not drive:
        return False
    import ctypes
    DRIVE_FIXED = 3
    return ctypes.windll.kernel32.GetDriveTypeW(drive + "\\") == DRIVE_FIXED


def duplicates_destination_label(src: Path) -> str:
    return "سلة المحذوفات (يمكن استرجاعها)" if drive_has_recycle_bin(src) else f"المجلد {REVIEW_FOLDER} داخل مجلد الإخراج"


def unique_destination(dest: Path) -> Path:
    if not dest.exists():
        return dest
    n = 1
    while True:
        alt = dest.with_name(f"{dest.stem}_v{n}{dest.suffix}")
        if not alt.exists():
            return alt
        n += 1


# ============================================================================
# المرحلة 1: الفحص وبناء الخطة (لا يلمس أي ملف)
# ============================================================================

@dataclass
class Plan:
    src: Path
    target: Path
    total_files: int = 0
    total_bytes: int = 0
    keep: list = field(default_factory=list)        # (المسار، الحجم)
    duplicates: list = field(default_factory=list)  # (المكرر، الحجم، الأصل المحتفظ به)
    skipped_system: list = field(default_factory=list)
    unreadable: list = field(default_factory=list)  # (المسار، السبب)

    @property
    def keep_bytes(self):
        return sum(s for _, s in self.keep)

    @property
    def dup_bytes(self):
        return sum(s for _, s, _ in self.duplicates)


def build_plan(src: Path, target: Path, *, skip_system=True, report=None, cancel=None) -> Plan:
    """
    يفحص المجلد ويحدد الملفات الفريدة والمكررة. لا ينقل ولا يحذف شيئاً.
    report(msg=None, progress=None): دالة اختيارية لإرسال التقدم.
    """
    report = report or (lambda **kw: None)
    src = src.resolve()
    target_c = target.resolve()
    mine = own_files()
    plan = Plan(src=src, target=target)

    report(msg="1. استكشاف المجلدات...")
    files = []  # (المسار، الحجم، وقت التعديل)
    for root, dirs, names in os.walk(src):
        if cancel is not None and cancel.is_set():
            return plan
        cur = Path(root)
        # لا ندخل مجلد الإخراج أبداً (يمنع الحلقة المفرغة)
        dirs[:] = [d for d in dirs if (cur / d).resolve() != target_c]
        for name in names:
            p = cur / name
            try:
                if p.is_symlink() or p.resolve() in mine:
                    continue
                if target_c in p.resolve().parents:
                    continue
                if skip_system and is_system_file(name):
                    plan.skipped_system.append(p)
                    continue
                st = p.stat()
                files.append((p, st.st_size, st.st_mtime))
            except OSError as e:
                plan.unreadable.append((p, str(e)))

    plan.total_files = len(files)
    plan.total_bytes = sum(s for _, s, _ in files)
    report(msg=f"   وُجد {plan.total_files} ملف ({format_size(plan.total_bytes)})")

    report(msg="2. مقارنة الأحجام ثم البصمات الرقمية...")
    by_size = {}
    for f in files:
        by_size.setdefault(f[1], []).append(f)

    done = 0
    for size, group in by_size.items():
        if cancel is not None and cancel.is_set():
            return plan
        # حجم فريد، أو ملفات فارغة (متطابقة دائماً وليست تكراراً حقيقياً): كلها تُحفظ
        if len(group) == 1 or (skip_system and size == 0):
            plan.keep.extend((p, s) for p, s, _ in group)
            done += len(group)
            report(progress=(done, plan.total_files))
            continue

        # بصمة جزئية لتقسيم المجموعة
        by_partial = {}
        for f in group:
            ph = partial_hash(f[0])
            if ph is None:
                plan.unreadable.append((f[0], "تعذرت قراءة الملف"))
                continue
            by_partial.setdefault(ph, []).append(f)

        for sub in by_partial.values():
            if len(sub) == 1:
                plan.keep.append((sub[0][0], sub[0][1]))
                continue
            by_full = {}
            for f in sub:
                fh = full_hash(f[0], cancel=cancel)
                if fh is None:
                    if cancel is not None and cancel.is_set():
                        return plan
                    plan.unreadable.append((f[0], "تعذرت قراءة الملف"))
                    continue
                by_full.setdefault(fh, []).append(f)
            for same in by_full.values():
                # نحتفظ بالأقدم تعديلاً (الأرجح أنه الأصل)، وعند التساوي بأقصر مسار
                same.sort(key=lambda f: (f[2], len(str(f[0])), str(f[0])))
                original = same[0]
                plan.keep.append((original[0], original[1]))
                for d in same[1:]:
                    plan.duplicates.append((d[0], d[1], original[0]))
        done += len(group)
        report(progress=(done, plan.total_files))

    return plan


# ============================================================================
# المرحلة 2: التنفيذ بعد موافقة المستخدم
# ============================================================================

@dataclass
class Result:
    saved: int = 0
    duplicates_removed: int = 0
    duplicates_kept_safe: int = 0  # مكررات لم تُرمَ لأن أصلها لم يُحفظ
    errors: list = field(default_factory=list)  # (المسار، السبب)
    removed_empty_dirs: int = 0
    dup_destination: str = ""
    cancelled: bool = False


def execute_plan(plan: Plan, mode: str, *, report=None, cancel=None, recycle=None) -> Result:
    """
    mode: "copy" ينسخ الفريد ولا يلمس الأصل. "move" ينقل الفريد، ويرسل المكررات
    إلى سلة المحذوفات (أو مجلد مراجعة) فقط إذا نجح حفظ أصلها.
    """
    report = report or (lambda **kw: None)
    res = Result()
    plan.target.mkdir(parents=True, exist_ok=True)
    saved_ok = set()
    total = len(plan.keep)

    report(msg=f"3. {'نقل' if mode == 'move' else 'نسخ'} الملفات الفريدة إلى المجلد الجديد...")
    for i, (src_file, _) in enumerate(plan.keep, 1):
        if cancel is not None and cancel.is_set():
            res.cancelled = True
            break
        try:
            dest = unique_destination(plan.target / src_file.relative_to(plan.src))
            dest.parent.mkdir(parents=True, exist_ok=True)
            if mode == "move":
                shutil.move(str(src_file), str(dest))
            else:
                shutil.copy2(str(src_file), str(dest))
            saved_ok.add(src_file)
            res.saved += 1
        except Exception as e:  # نسجل ونكمل؛ لا نوقف كل العملية بسبب ملف واحد
            res.errors.append((src_file, str(e)))
        report(progress=(i, total))

    if mode == "move" and not res.cancelled and plan.duplicates:
        removable = [d for d, _, orig in plan.duplicates if orig in saved_ok]
        res.duplicates_kept_safe = len(plan.duplicates) - len(removable)
        if res.duplicates_kept_safe:
            report(msg=f"   تُركت {res.duplicates_kept_safe} نسخة مكررة في مكانها لأن أصلها لم يُحفظ (حماية لبياناتك).")

        use_bin = recycle if recycle is not None else drive_has_recycle_bin(plan.src)
        if use_bin:
            report(msg="4. إرسال المكررات إلى سلة المحذوفات (يمكن استرجاعها)...")
            res.dup_destination = "سلة المحذوفات"
            failed = send_to_recycle_bin(removable)
            failed_set = {p for p, _ in failed}
            res.errors.extend(failed)
            res.duplicates_removed = len(removable) - len(failed_set)
        else:
            review = plan.target / REVIEW_FOLDER
            report(msg=f"4. نقل المكررات إلى مجلد المراجعة: {review.name}")
            res.dup_destination = str(review)
            for d in removable:
                try:
                    dest = unique_destination(review / d.relative_to(plan.src))
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(d), str(dest))
                    res.duplicates_removed += 1
                except Exception as e:
                    res.errors.append((d, str(e)))

    if mode == "move" and not res.cancelled:
        res.removed_empty_dirs = remove_empty_dirs(plan.src, plan.target)

    return res


def remove_empty_dirs(src: Path, target: Path) -> int:
    """يحذف المجلدات التي أصبحت فارغة تماماً بعد النقل (rmdir يرفض أي مجلد غير فارغ)."""
    target_c = target.resolve()
    removed = 0
    for root, dirs, files in os.walk(src, topdown=False):
        p = Path(root)
        if p.resolve() == src.resolve() or p.resolve() == target_c or target_c in p.resolve().parents:
            continue
        try:
            p.rmdir()
            removed += 1
        except OSError:
            pass
    return removed


def write_report(path: Path, plan: Plan, res: Result, mode: str, duration: float):
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    ok = not res.errors and not res.cancelled
    lines = [
        "=" * 70,
        f"          تقرير تنظيم الملفات وكشف المكررات (الإصدار {APP_VERSION})",
        "=" * 70,
        "",
        f"تاريخ ووقت التنفيذ   : {now}",
        f"المجلد المصدر        : {plan.src}",
        f"مجلد الإخراج         : {plan.target}",
        f"طريقة المعالجة       : {'نقل (Move)' if mode == 'move' else 'نسخ (Copy)'}",
        f"زمن المعالجة         : {duration:.1f} ثانية",
        f"النتيجة              : {'اكتملت بلا أخطاء' if ok else ('أُوقفت قبل الانتهاء' if res.cancelled else f'اكتملت مع {len(res.errors)} خطأ — راجع القسم الأخير')}",
        "",
        "-" * 70,
        "الملخص:",
        "-" * 70,
        f"• الملفات المفحوصة            : {plan.total_files} ({format_size(plan.total_bytes)})",
        f"• الملفات الفريدة المحفوظة     : {res.saved} من {len(plan.keep)} ({format_size(plan.keep_bytes)})",
        f"• الملفات المكررة              : {len(plan.duplicates)} ({format_size(plan.dup_bytes)})",
    ]
    if mode == "move":
        lines.append(f"• مكررات أُزيلت إلى            : {res.dup_destination or '—'} ({res.duplicates_removed} ملف)")
        if res.duplicates_kept_safe:
            lines.append(f"• مكررات تُركت في مكانها       : {res.duplicates_kept_safe} (لأن أصلها لم يُحفظ)")
        lines.append(f"• مجلدات فارغة أُزيلت          : {res.removed_empty_dirs}")
    else:
        lines.append("• في وضع النسخ لا يُلمس أي ملف أصلي؛ المكررات لم تُنسخ فقط.")
    lines.append(f"• ملفات نظام تم تجاهلها         : {len(plan.skipped_system)}")
    lines.append(f"• ملفات تعذرت قراءتها            : {len(plan.unreadable)}")
    lines.append("")

    if plan.duplicates:
        lines += ["-" * 70, "الملفات المكررة (والنسخة الأصلية التي احتُفظ بها):", "-" * 70]
        for i, (d, s, orig) in enumerate(plan.duplicates, 1):
            lines += [f"[{i}] {d}  ({format_size(s)})", f"     الأصل: {orig}"]
        lines.append("")
    if res.errors or plan.unreadable:
        lines += ["-" * 70, "الأخطاء والملفات التي لم تُعالج:", "-" * 70]
        for p, why in plan.unreadable + res.errors:
            lines.append(f"• {p}\n    السبب: {why}")
        lines.append("")
    lines += ["=" * 70, "نهاية التقرير — منظّم الملفات الذكي"]
    path.write_text("\n".join(lines), encoding="utf-8-sig")  # BOM ليفتح بالعربي في المفكرة


def preview_text(plan: Plan, mode: str, limit: int = 400) -> str:
    out = [
        f"المجلد: {plan.src}",
        f"مجلد الإخراج: {plan.target}",
        "",
        f"• ملفات مفحوصة: {plan.total_files} ({format_size(plan.total_bytes)})",
        f"• ستُ{'نقل' if mode == 'move' else 'نسخ'} إلى المجلد الجديد: {len(plan.keep)} ملف ({format_size(plan.keep_bytes)})",
        f"• مكررات: {len(plan.duplicates)} ملف ({format_size(plan.dup_bytes)})",
    ]
    if mode == "move":
        out.append(f"  ← ستذهب المكررات إلى {duplicates_destination_label(plan.src)}، بعد التأكد من حفظ أصلها.")
    else:
        out.append("  ← وضع النسخ: لن يُلمس أي ملف في مكانه الأصلي.")
    if plan.skipped_system:
        out.append(f"• ملفات نظام لن تُلمس: {len(plan.skipped_system)}")
    if plan.unreadable:
        out.append(f"• ملفات تعذرت قراءتها ولن تُلمس: {len(plan.unreadable)}")
    if plan.duplicates:
        out += ["", "─" * 50, "المكررات (المكرر ← الأصل الذي سيُحتفظ به):", "─" * 50]
        for d, s, orig in plan.duplicates[:limit]:
            out.append(f"✗ {d.relative_to(plan.src)}  ({format_size(s)})\n   ✓ {orig.relative_to(plan.src)}")
        if len(plan.duplicates) > limit:
            out.append(f"… و {len(plan.duplicates) - limit} مكرر آخر (القائمة كاملة في التقرير بعد التنفيذ)")
    return "\n".join(out)


# ============================================================================
# الواجهة الرسومية
# ============================================================================

try:
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox, scrolledtext
except ImportError:  # يسمح باستيراد المنطق واختباره على أجهزة بلا واجهة رسومية
    tk = None


if tk is not None:

    class FileOrganizerApp(tk.Tk):
        BG, PANEL, ENTRY = "#0f172a", "#1e293b", "#0b0f19"

        def __init__(self):
            super().__init__()
            self.title(f"منظّم الملفات وكاشف المكررات الذكي — {APP_VERSION}")
            self.geometry("820x740")
            self.minsize(700, 600)
            self.configure(bg=self.BG)

            self.source_dir_var = tk.StringVar(value=str(app_directory()))
            self.new_folder_var = tk.StringVar(value="CleanFiles")
            self.op_mode_var = tk.StringVar(value="copy")
            self.skip_system_var = tk.BooleanVar(value=True)

            self.events = queue.Queue()      # كل تحديثات الخيط الخلفي تمر من هنا
            self.cancel = threading.Event()
            self.is_running = False
            self.build_ui()
            self.after(100, self.drain_events)

        # ------------------------------------------------------------ الواجهة
        def build_ui(self):
            style = ttk.Style(self)
            style.theme_use("clam")

            header = tk.Frame(self, bg=self.PANEL, padx=20, pady=15)
            header.pack(fill="x", padx=15, pady=(15, 10))
            tk.Label(header, text="⚡ منظّم الملفات الذكي وكاشف المكررات",
                     font=("Segoe UI", 16, "bold"), fg="#38bdf8", bg=self.PANEL).pack(anchor="e")
            tk.Label(header, text="يفحص أولاً ويعرض عليك النتيجة • لا يحذف شيئاً نهائياً • المكررات إلى سلة المحذوفات",
                     font=("Segoe UI", 9), fg="#94a3b8", bg=self.PANEL).pack(anchor="e", pady=(3, 0))

            box = tk.LabelFrame(self, text="  إعدادات المسار والتشغيل  ", font=("Segoe UI", 10, "bold"),
                                fg="#e2e8f0", bg=self.PANEL, padx=15, pady=12)
            box.pack(fill="x", padx=15, pady=5)

            row1 = tk.Frame(box, bg=self.PANEL); row1.pack(fill="x", pady=6)
            self.label(row1, "المجلد المراد فحصه:")
            tk.Button(row1, text="استعراض 📁", command=self.browse_folder, font=("Segoe UI", 9, "bold"),
                      bg="#334155", fg="white", activebackground="#475569", relief="flat",
                      padx=12, cursor="hand2").pack(side="left")
            tk.Entry(row1, textvariable=self.source_dir_var, font=("Segoe UI", 9), bg=self.BG, fg="#f8fafc",
                     insertbackground="white", relief="flat", justify="right"
                     ).pack(side="right", fill="x", expand=True, padx=6, ipady=4)

            row2 = tk.Frame(box, bg=self.PANEL); row2.pack(fill="x", pady=6)
            self.label(row2, "اسم المجلد الجديد:")
            tk.Entry(row2, textvariable=self.new_folder_var, font=("Segoe UI", 9, "bold"), bg=self.BG,
                     fg="#38bdf8", insertbackground="white", relief="flat", justify="left"
                     ).pack(side="right", fill="x", expand=True, padx=6, ipady=4)

            row3 = tk.Frame(box, bg=self.PANEL); row3.pack(fill="x", pady=8)
            self.label(row3, "طريقة المعالجة:")
            for text, val, color in (("نسخ آمن (Copy — الأصل يبقى كما هو)", "copy", "#e2e8f0"),
                                     ("نقل (Move — المكررات إلى سلة المحذوفات)", "move", "#fbbf24")):
                tk.Radiobutton(row3, text=text, variable=self.op_mode_var, value=val, font=("Segoe UI", 9),
                               fg=color, bg=self.PANEL, selectcolor=self.BG, activebackground=self.PANEL
                               ).pack(side="right", padx=8)

            row4 = tk.Frame(box, bg=self.PANEL); row4.pack(fill="x", pady=(2, 0))
            self.label(row4, "")
            tk.Checkbutton(row4, text="تجاهل ملفات النظام (desktop.ini …) والملفات الفارغة",
                           variable=self.skip_system_var, font=("Segoe UI", 9), fg="#38bdf8", bg=self.PANEL,
                           selectcolor=self.BG, activebackground=self.PANEL).pack(side="right", padx=8)

            actions = tk.Frame(self, bg=self.BG); actions.pack(fill="x", padx=15, pady=8)
            self.start_btn = tk.Button(actions, text="🔍 فحص ومعاينة", command=self.start_scan,
                                       font=("Segoe UI", 11, "bold"), bg="#0284c7", fg="white",
                                       activebackground="#0369a1", relief="flat", padx=20, pady=8, cursor="hand2")
            self.start_btn.pack(side="right", padx=(10, 0))
            self.stop_btn = tk.Button(actions, text="⏹ إيقاف", command=self.stop, state="disabled",
                                      font=("Segoe UI", 10, "bold"), bg="#475569", fg="white",
                                      relief="flat", padx=14, pady=8, cursor="hand2")
            self.stop_btn.pack(side="right")
            self.status_lbl = tk.Label(actions, text="جاهز. لن يُلمس أي ملف قبل أن توافق على المعاينة.",
                                       font=("Segoe UI", 9), fg="#94a3b8", bg=self.BG, anchor="e")
            self.status_lbl.pack(side="right", fill="x", expand=True, padx=8)

            self.progress = ttk.Progressbar(self, mode="determinate")
            self.progress.pack(fill="x", padx=15, pady=(0, 10))

            log_box = tk.LabelFrame(self, text="  سجل العمليات  ", font=("Segoe UI", 9, "bold"),
                                    fg="#94a3b8", bg=self.PANEL, padx=10, pady=10)
            log_box.pack(fill="both", expand=True, padx=15, pady=(0, 15))
            self.log_text = scrolledtext.ScrolledText(log_box, bg=self.ENTRY, fg="#38bdf8",
                                                      font=("Consolas", 9), relief="flat")
            self.log_text.pack(fill="both", expand=True)

        def label(self, parent, text):
            tk.Label(parent, text=text, font=("Segoe UI", 9, "bold"), fg="#cbd5e1", bg=self.PANEL,
                     width=18, anchor="e").pack(side="right")

        # --------------------------------------------- تحديثات من الخيط الخلفي
        def post(self, **event):
            self.events.put(event)

        def drain_events(self):
            try:
                while True:
                    ev = self.events.get_nowait()
                    if "msg" in ev and ev["msg"]:
                        self.log_text.insert(tk.END, ev["msg"] + "\n")
                        self.log_text.see(tk.END)
                    if ev.get("progress"):
                        val, mx = ev["progress"]
                        self.progress["maximum"] = max(mx, 1)
                        self.progress["value"] = val
                        self.status_lbl.config(text=f"{val} من {mx} ({int(val / max(mx, 1) * 100)}%)")
                    if "done" in ev:
                        ev["done"]()
            except queue.Empty:
                pass
            self.after(100, self.drain_events)

        # ----------------------------------------------------------- الأوامر
        def browse_folder(self):
            chosen = filedialog.askdirectory(title="اختر المجلد المراد تنظيمه وفحصه",
                                             initialdir=self.source_dir_var.get())
            if chosen:
                self.source_dir_var.set(chosen)

        def set_running(self, running, text=None):
            self.is_running = running
            self.start_btn.config(state="disabled" if running else "normal",
                                  bg="#475569" if running else "#0284c7")
            self.stop_btn.config(state="normal" if running else "disabled",
                                 bg="#b91c1c" if running else "#475569")
            if text:
                self.status_lbl.config(text=text)

        def stop(self):
            self.cancel.set()
            self.status_lbl.config(text="جارٍ الإيقاف بعد الملف الحالي…")

        def start_scan(self):
            if self.is_running:
                return
            src = Path(self.source_dir_var.get().strip().strip('"'))
            if not src.is_dir():
                messagebox.showerror("خطأ", "المسار المحدد غير صالح أو غير موجود!")
                return
            name = self.new_folder_var.get().strip()
            if not name or any(c in name for c in '\\/:*?"<>|'):
                messagebox.showerror("خطأ", "اكتب اسماً صالحاً للمجلد الجديد (بدون \\ / : * ? \" < > |).")
                return
            self.cancel.clear()
            self.log_text.delete(1.0, tk.END)
            self.progress["value"] = 0
            self.set_running(True, "جارٍ الفحص… لم يُلمس أي ملف بعد.")
            mode, skip = self.op_mode_var.get(), self.skip_system_var.get()
            threading.Thread(target=self.scan_worker, args=(src, src / name, mode, skip), daemon=True).start()

        def scan_worker(self, src, target, mode, skip):
            t0 = time.time()
            try:
                plan = build_plan(src, target, skip_system=skip, report=self.post, cancel=self.cancel)
            except Exception as e:
                self.post(msg=f"خطأ غير متوقع أثناء الفحص: {e}",
                          done=lambda: self.set_running(False, "توقف الفحص بسبب خطأ."))
                return
            if self.cancel.is_set():
                self.post(msg="أُوقف الفحص. لم يُلمس أي ملف.", done=lambda: self.set_running(False, "أُوقف."))
                return
            self.post(msg=f"اكتمل الفحص في {time.time() - t0:.1f} ثانية.",
                      done=lambda: self.show_preview(plan, mode))

        def show_preview(self, plan, mode):
            self.set_running(False, "راجع المعاينة ثم اختر التنفيذ أو الإلغاء.")
            win = tk.Toplevel(self)
            win.title("معاينة قبل التنفيذ")
            win.geometry("760x560")
            win.configure(bg=self.PANEL)
            win.transient(self)
            win.grab_set()
            tk.Label(win, text="هذا ما سيحدث إذا ضغطت «تنفيذ». لم يُلمس أي ملف حتى الآن.",
                     font=("Segoe UI", 11, "bold"), fg="#fbbf24", bg=self.PANEL).pack(anchor="e", padx=15, pady=(12, 6))
            txt = scrolledtext.ScrolledText(win, bg=self.ENTRY, fg="#e2e8f0", font=("Consolas", 9), relief="flat")
            txt.pack(fill="both", expand=True, padx=15, pady=6)
            txt.insert(tk.END, preview_text(plan, mode))
            txt.config(state="disabled")
            bar = tk.Frame(win, bg=self.PANEL); bar.pack(fill="x", padx=15, pady=12)

            def go():
                win.destroy()
                self.start_execute(plan, mode)

            nothing = not plan.keep and not plan.duplicates
            tk.Button(bar, text="✔ تنفيذ", command=go, state="disabled" if nothing else "normal",
                      font=("Segoe UI", 10, "bold"), bg="#16a34a", fg="white", relief="flat",
                      padx=18, pady=6, cursor="hand2").pack(side="right")
            tk.Button(bar, text="إلغاء", command=win.destroy, font=("Segoe UI", 10), bg="#475569", fg="white",
                      relief="flat", padx=18, pady=6, cursor="hand2").pack(side="right", padx=8)

        def start_execute(self, plan, mode):
            self.cancel.clear()
            self.progress["value"] = 0
            self.set_running(True, "جارٍ التنفيذ…")
            threading.Thread(target=self.execute_worker, args=(plan, mode), daemon=True).start()

        def execute_worker(self, plan, mode):
            t0 = time.time()
            try:
                res = execute_plan(plan, mode, report=self.post, cancel=self.cancel)
            except Exception as e:
                self.post(msg=f"خطأ غير متوقع أثناء التنفيذ: {e}",
                          done=lambda: self.set_running(False, "توقف التنفيذ بسبب خطأ."))
                return
            duration = time.time() - t0
            report_path = plan.target / REPORT_NAME
            try:
                write_report(report_path, plan, res, mode, duration)
            except OSError as e:
                res.errors.append((report_path, f"تعذرت كتابة التقرير: {e}"))
            self.post(done=lambda: self.finish(plan, res, mode, report_path))

        def finish(self, plan, res, mode, report_path):
            ok = not res.errors and not res.cancelled
            title = "اكتمل التنظيم" if ok else ("أُوقفت العملية" if res.cancelled else "اكتمل مع أخطاء")
            self.set_running(False, title)
            lines = [f"• الملفات المحفوظة في المجلد الجديد: {res.saved} من {len(plan.keep)}"]
            if mode == "move":
                lines.append(f"• مكررات أُرسلت إلى {res.dup_destination or '—'}: {res.duplicates_removed}")
                if res.duplicates_kept_safe:
                    lines.append(f"• مكررات تُركت في مكانها لحمايتها: {res.duplicates_kept_safe}")
            else:
                lines.append(f"• مكررات لم تُنسخ: {len(plan.duplicates)} ({format_size(plan.dup_bytes)})")
            if res.errors:
                lines.append(f"• أخطاء: {len(res.errors)} (التفاصيل في التقرير)")
            lines.append(f"\nالتقرير: {report_path}")
            self.post(msg="\n" + title + "\n" + "\n".join(lines))
            (messagebox.showinfo if ok else messagebox.showwarning)(title, "\n".join(lines))


def main():
    if tk is None:
        print("هذا البرنامج يحتاج واجهة Tkinter (متوفرة مع Python في ويندوز).")
        sys.exit(1)
    FileOrganizerApp().mainloop()


if __name__ == "__main__":
    main()
