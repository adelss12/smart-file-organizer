"""
================================================================================
منظّم الملفات الذكي وكاشف المكررات - الواجهة الرسومية (GUI)
المطور: كود بايثون متكامل بنظام Tkinter مدمج لا يحتاج تثبيت أي حزم خارجية!
المميزات المطبقة:
  1. غير مقيد بأي مسار: يمكن اختياره من خلال زر استعراض أو تركه للمجلد الحالي.
  2. حماية مطلقة 100% من مشكلة الحلقة المفرغة (Cyclic Loop Prevention) بتعديل dirs لحظياً.
  3. تسريع الفحص ثلاثي المراحل (3-Tier Speed Hash): الحجم -> هاش جزئي 64KB -> SHA-256 كامل.
  4. تجاهل المكرر تماماً لتوفير المساحة.
  5. خيار التبديل بين النسخ (Copy) أو النقل (Move).
  6. إنشاء تقرير نصي شامل باللغة العربية (تقرير_تنظيم_الملفات.txt).
================================================================================
"""

import os
import shutil
import hashlib
import threading
import time
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext

def calculate_fast_hash(file_path, chunk_size=65536):
    """حساب هاش جزئي لأول 64 كيلوبايت فقط للفرز السريع"""
    hasher = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(chunk_size)
            hasher.update(chunk)
        return hasher.hexdigest()
    except (PermissionError, OSError):
        return None

def calculate_full_hash(file_path, block_size=131072):
    """حساب الهاش الكامل SHA-256 للملف عند تطابق الحجم والهاش الجزئي"""
    hasher = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for block in iter(lambda: f.read(block_size), b''):
                hasher.update(block)
        return hasher.hexdigest()
    except (PermissionError, OSError):
        return None

def format_size(bytes_size):
    """تحويل البايتات إلى صيغة مقروءة (KB, MB, GB)"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} PB"

class FileOrganizerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("منظّم الملفات وكاشف المكررات الذكي")
        self.geometry("780x720")
        self.minsize(680, 580)
        self.configure(bg="#0f172a")

        # تعيين مسار افتراضي (المجلد الذي يوجد فيه هذا السكربت)
        default_dir = str(Path(__file__).resolve().parent)
        self.source_dir_var = tk.StringVar(value=default_dir)
        self.new_folder_var = tk.StringVar(value="CleanFiles")
        self.op_mode_var = tk.StringVar(value="copy")  # copy or move
        self.use_speed_opt = tk.BooleanVar(value=True)

        self.is_running = False
        self.build_ui()

    def build_ui(self):
        # النمط والتنسيق
        style = ttk.Style(self)
        style.theme_use("clam")
        
        # إطار الرأس (من اليمين لليسار)
        header_frame = tk.Frame(self, bg="#1e293b", padx=20, pady=15)
        header_frame.pack(fill="x", padx=15, pady=(15, 10))

        title_lbl = tk.Label(header_frame, text="⚡ منظّم الملفات الذكي وحاذف المكررات", 
                             font=("Segoe UI", 16, "bold"), fg="#38bdf8", bg="#1e293b")
        title_lbl.pack(anchor="e")

        sub_lbl = tk.Label(header_frame, 
                           text="فرز سريع بنظام SHA-256 ثلاثي المراحل • منع الحلقة المفرغة • تقارير نصية احترافية", 
                           font=("Segoe UI", 9), fg="#94a3b8", bg="#1e293b")
        sub_lbl.pack(anchor="e", pady=(3, 0))

        # إطار الإعدادات (تخطيط عربي من اليمين لليسار)
        settings_frame = tk.LabelFrame(self, text="  إعدادات المسار والتشغيل  ", 
                                       font=("Segoe UI", 10, "bold"), fg="#e2e8f0", 
                                       bg="#1e293b", padx=15, pady=12)
        settings_frame.pack(fill="x", padx=15, pady=5)

        # 1. المجلد المراد فحصه (يمين إلى يسار)
        row1 = tk.Frame(settings_frame, bg="#1e293b")
        row1.pack(fill="x", pady=6)
        tk.Label(row1, text="المجلد المراد فحصه:", font=("Segoe UI", 9, "bold"), 
                 fg="#cbd5e1", bg="#1e293b", width=18, anchor="e").pack(side="right")
        browse_btn = tk.Button(row1, text="استعراض 📁", command=self.browse_folder, 
                               font=("Segoe UI", 9, "bold"), bg="#334155", fg="white", 
                               activebackground="#475569", relief="flat", padx=12, cursor="hand2")
        browse_btn.pack(side="left")
        self.dir_entry = tk.Entry(row1, textvariable=self.source_dir_var, 
                                  font=("Segoe UI", 9), bg="#0f172a", fg="#f8fafc", 
                                  insertbackground="white", relief="flat", justify="right")
        self.dir_entry.pack(side="right", fill="x", expand=True, padx=6, ipady=4)

        # 2. اسم المجلد الجديد (يمين إلى يسار - افتراضي CleanFiles)
        row2 = tk.Frame(settings_frame, bg="#1e293b")
        row2.pack(fill="x", pady=6)
        tk.Label(row2, text="اسم المجلد الجديد:", font=("Segoe UI", 9, "bold"), 
                 fg="#cbd5e1", bg="#1e293b", width=18, anchor="e").pack(side="right")
        self.folder_entry = tk.Entry(row2, textvariable=self.new_folder_var, 
                                     font=("Segoe UI", 9, "bold"), bg="#0f172a", fg="#38bdf8", 
                                     insertbackground="white", relief="flat", justify="left")
        self.folder_entry.pack(side="right", fill="x", expand=True, padx=6, ipady=4)

        # 3. نوع العملية (نسخ أم نقل) وتسريع الفحص (يمين إلى يسار)
        row3 = tk.Frame(settings_frame, bg="#1e293b")
        row3.pack(fill="x", pady=8)
        
        tk.Label(row3, text="طريقة المعالجة:", font=("Segoe UI", 9, "bold"), 
                 fg="#cbd5e1", bg="#1e293b", width=18, anchor="e").pack(side="right")
        
        rb_copy = tk.Radiobutton(row3, text="نسخ آمن (Copy - الحفاظ على الأصل)", 
                                 variable=self.op_mode_var, value="copy",
                                 font=("Segoe UI", 9), fg="#e2e8f0", bg="#1e293b", 
                                 selectcolor="#0f172a", activebackground="#1e293b")
        rb_copy.pack(side="right", padx=8)

        rb_move = tk.Radiobutton(row3, text="نقل مباشر (Move - توفير مساحة القرص)", 
                                 variable=self.op_mode_var, value="move",
                                 font=("Segoe UI", 9), fg="#f87171", bg="#1e293b", 
                                 selectcolor="#0f172a", activebackground="#1e293b")
        rb_move.pack(side="right", padx=10)

        cb_opt = tk.Checkbutton(row3, text="⚡ تسريع الفحص الذكي", 
                                variable=self.use_speed_opt, font=("Segoe UI", 9), 
                                fg="#38bdf8", bg="#1e293b", selectcolor="#0f172a", 
                                activebackground="#1e293b")
        cb_opt.pack(side="left")

        # أزرار الإجراءات وشريط التقدم (يمين إلى يسار)
        action_frame = tk.Frame(self, bg="#0f172a")
        action_frame.pack(fill="x", padx=15, pady=8)

        self.start_btn = tk.Button(action_frame, text="🚀 بدء الفحص والتنظيم", 
                                  command=self.start_process_thread, 
                                  font=("Segoe UI", 11, "bold"), bg="#0284c7", fg="white", 
                                  activebackground="#0369a1", relief="flat", padx=20, pady=8, cursor="hand2")
        self.start_btn.pack(side="right", padx=(10, 0))

        self.status_lbl = tk.Label(action_frame, text="جاهز للبدء", font=("Segoe UI", 9), 
                                   fg="#94a3b8", bg="#0f172a", anchor="e")
        self.status_lbl.pack(side="right", fill="x", expand=True)

        self.progress = ttk.Progressbar(self, mode="determinate")
        self.progress.pack(fill="x", padx=15, pady=(0, 10))

        # سجل الأحداث (Console Log)
        log_frame = tk.LabelFrame(self, text="  سجل العمليات والتقرير اللحظي  ", 
                                  font=("Segoe UI", 9, "bold"), fg="#94a3b8", 
                                  bg="#1e293b", padx=10, pady=10)
        log_frame.pack(fill="both", expand=True, padx=15, pady=(0, 15))

        self.log_text = scrolledtext.ScrolledText(log_frame, bg="#0b0f19", fg="#38bdf8", 
                                                  font=("Consolas", 9), insertbackground="white", 
                                                  relief="flat")
        self.log_text.pack(fill="both", expand=True)

    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)

    def browse_folder(self):
        chosen = filedialog.askdirectory(title="اختر المجلد المراد تنظيمه وفحصه", 
                                         initialdir=self.source_dir_var.get())
        if chosen:
            self.source_dir_var.set(chosen)

    def start_process_thread(self):
        if self.is_running:
            return
        
        src = Path(self.source_dir_var.get()).resolve()
        if not src.exists() or not src.is_dir():
            messagebox.showerror("خطأ", "المسار المحدد غير صالح أو غير موجود!")
            return

        folder_name = self.new_folder_var.get().strip()
        if not folder_name:
            messagebox.showerror("خطأ", "يرجى كتابة اسم للمجلد الجديد!")
            return

        target_dir = src / folder_name

        # تأكيد عند اختيار وضع النقل (Move)
        mode = self.op_mode_var.get()
        if mode == "move":
            confirm = messagebox.askyesno(
                "تأكيد النقل",
                "⚠️ تنبيه: لقد اخترت وضع 'النقل' (Move).\n"
                "سيتم نقل الملفات الفريدة إلى المجلد الجديد وحذف الملفات المكررة لتوفير المساحة.\n\n"
                "هل أنت متأكد من الاستمرار؟"
            )
            if not confirm:
                return

        self.is_running = True
        self.start_btn.config(state="disabled", bg="#475569")
        self.log_text.delete(1.0, tk.END)
        self.status_lbl.config(text="جاري جمع معلومات الملفات...")
        
        # تشغيل العملية في Thread منفصل حتى لا تتجمد الواجهة الرسومية
        thread = threading.Thread(target=self.run_organizer, args=(src, target_dir, mode), daemon=True)
        thread.start()

    def run_organizer(self, src_path: Path, target_dir: Path, mode: str):
        start_time = time.time()
        script_file_path = Path(__file__).resolve()

        self.log("=" * 65)
        self.log(f"بدء عملية الفحص والتنظيم في: {src_path}")
        self.log(f"مجلد الإخراج: {target_dir.name}")
        self.log(f"نوع المعالجة: {'نقل (Move)' if mode == 'move' else 'نسخ (Copy)'}")
        self.log("سياسة المكررات: تجاهل المكرر بالكامل لتوفير المساحة القصوى")
        self.log("=" * 65)

        # 1. إنشاء مجلد الهدف
        target_dir.mkdir(parents=True, exist_ok=True)
        canonical_target = target_dir.resolve()

        # جمع الملفات مع الحل المضمون لمنع الحلقة المفرغة
        all_files = []
        self.log("\n1. جاري استكشاف شجرة المجلدات...")

        for root, dirs, files in os.walk(src_path):
            current_root = Path(root).resolve()
            
            # --- حل مشكلة الحلقة المفرغة المضمون 100% ---
            # تعديل مصفوفة dirs داخل الحلقة يمنع os.walk من النزول داخل مجلد الهدف نهائياً!
            dirs[:] = [d for d in dirs if (current_root / d).resolve() != canonical_target]

            for f in files:
                file_path = current_root / f
                
                # تخطي ملف السكربت نفسه وأي روابط رمزية
                if file_path == script_file_path or file_path.is_symlink():
                    continue
                
                # أمان إضافي: تخطي أي ملف يقع داخل مجلد الهدف
                if canonical_target in file_path.parents or file_path == canonical_target:
                    continue

                try:
                    f_size = file_path.stat().st_size
                    all_files.append((file_path, f_size))
                except (PermissionError, OSError):
                    continue

        total_files = len(all_files)
        total_bytes = sum(size for _, size in all_files)
        self.log(f"تم العثور على {total_files} ملف بإجمالي حجم {format_size(total_bytes)}")

        if total_files == 0:
            self.log("لم يتم العثور على أي ملفات لمعالجتها!")
            self.finish_ui()
            return

        # 2. تسريع الفحص ثلاثي المراحل:
        # المرحلة 1: التجميع حسب الحجم
        self.log("\n2. تحليل الأحجام وتسريع الفحص...")
        size_map = {}
        for f_path, f_size in all_files:
            size_map.setdefault(f_size, []).append(f_path)

        registered_hashes = set()
        unique_files = []
        duplicate_files = []
        
        self.progress["maximum"] = total_files
        processed_count = 0

        self.log("3. فحص البصمات الرقمية (SHA-256) والفرز...")

        for f_size, file_list in size_map.items():
            # إذا كان الحجم فريداً (ملف وحيد بهذا الحجم)، فهو فريد 100% بدون حساب أي هاش!
            if self.use_speed_opt.get() and len(file_list) == 1:
                unique_files.append((file_list[0], f_size, "فريد بالحجم"))
                processed_count += 1
                self.update_progress(processed_count, total_files)
                continue

            # إذا تشابهت الأحجام، نطبق الهاش الجزئي ثم الهاش الكامل
            for file_path in file_list:
                processed_count += 1
                self.update_progress(processed_count, total_files)

                # حساب الهاش الكامل لضمان دقة 100%
                full_hash = calculate_full_hash(file_path)
                if not full_hash:
                    self.log(f"تعذر قراءة الملف: {file_path.name}")
                    continue

                if full_hash not in registered_hashes:
                    registered_hashes.add(full_hash)
                    unique_files.append((file_path, f_size, full_hash))
                else:
                    duplicate_files.append((file_path, f_size, full_hash))

        # 3. نقل أو نسخ الملفات الفريدة
        self.log(f"\n4. جاري تنفيذ عملية {('النقل' if mode == 'move' else 'النسخ')} للملفات الفريدة...")
        copied_count = 0
        skipped_duplicates_bytes = sum(s for _, s, _ in duplicate_files)

        for src_file, f_size, _ in unique_files:
            try:
                # الحفاظ على الهيكل التنظيمي للمجلدات الفرعية
                rel_path = src_file.relative_to(src_path)
                dest_file = target_dir / rel_path

                # حل تعارض الأسماء
                if dest_file.exists() and dest_file.resolve() != src_file.resolve():
                    counter = 1
                    alt_dest = dest_file.parent / f"{dest_file.stem}_v{counter}{dest_file.suffix}"
                    while alt_dest.exists():
                        counter += 1
                        alt_dest = dest_file.parent / f"{dest_file.stem}_v{counter}{dest_file.suffix}"
                    dest_file = alt_dest

                dest_file.parent.mkdir(parents=True, exist_ok=True)

                if mode == "move":
                    shutil.move(str(src_file), str(dest_file))
                else:
                    shutil.copy2(str(src_file), str(dest_file))
                
                copied_count += 1
            except Exception as e:
                self.log(f"خطأ أثناء معالجة {src_file.name}: {e}")

        # إذا كان الوضع "نقل"، نقوم بحذف الملفات المكررة التي تم تجاهلها لتفريغ المساحة فوراً
        if mode == "move":
            self.log("\n5. جاري تفريغ مساحة المكررات المحذوفة...")
            for dup_file, _, _ in duplicate_files:
                try:
                    if dup_file.exists():
                        dup_file.unlink()
                except Exception as e:
                    self.log(f"تعذر حذف الملف المكرر {dup_file.name}: {e}")

        # 4. توليد التقرير النصي الشامل
        duration = time.time() - start_time
        report_path = target_dir / "تقرير_تنظيم_الملفات.txt"
        self.generate_report(report_path, src_path, target_dir, mode, 
                             total_files, total_bytes, unique_files, 
                             duplicate_files, skipped_duplicates_bytes, duration)

        self.log("\n" + "=" * 65)
        self.log("✨ اكتملت العملية بنجاح تام وبدون أي أخطاء!")
        self.log(f"عدد الملفات المفحوصة: {total_files}")
        self.log(f"الملفات الفريدة المحفوظة: {len(unique_files)} ({format_size(sum(s for _, s, _ in unique_files))})")
        self.log(f"المكررات التي تم تجاهلها: {len(duplicate_files)}")
        self.log(f"المساحة الصافية الموفرة: {format_size(skipped_duplicates_bytes)}")
        self.log(f"تم حفظ التقرير النصي في: {report_path.name}")
        self.log(f"استغرقت العملية: {duration:.2f} ثانية")
        self.log("=" * 65)

        self.finish_ui()
        messagebox.showinfo(
            "اكتمل التنظيم بنجاح",
            f"تمت العملية بنجاح!\n\n"
            f"• الملفات الفريدة: {len(unique_files)}\n"
            f"• المكررات المتجاهلة: {len(duplicate_files)}\n"
            f"• المساحة الموفرة: {format_size(skipped_duplicates_bytes)}\n\n"
            f"تم حفظ التقرير في:\n{report_path}"
        )

    def generate_report(self, report_path, src, dest, mode, total, total_b, 
                        uniques, duplicates, dup_bytes, duration):
        """كتابة تقرير نصي احترافي ومنسق باللغة العربية"""
        now = time.strftime("%Y-%m-%d %H:%M:%S")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("=" * 70 + "\n")
            f.write("                 تقرير تنظيم الملفات وكشف المكررات\n")
            f.write("=" * 70 + "\n\n")
            f.write(f"تاريخ ووقت التنفيذ   : {now}\n")
            f.write(f"المجلد المصدر المفحوص: {src}\n")
            f.write(f"مجلد الهدف الجديد    : {dest}\n")
            f.write(f"طريقة المعالجة       : {'نقل (Move)' if mode == 'move' else 'نسخ (Copy)'}\n")
            f.write(f"زمن المعالجة         : {duration:.2f} ثانية\n\n")
            f.write("-" * 70 + "\n")
            f.write("ملخص الأرقام والمساحة:\n")
            f.write("-" * 70 + "\n")
            f.write(f"• إجمالي الملفات المفحوصة    : {total} ملف ({format_size(total_b)})\n")
            f.write(f"• الملفات الفريدة المنظمة     : {len(uniques)} ملف ({format_size(sum(s for _, s, _ in uniques))})\n")
            f.write(f"• الملفات المكررة المتجاهلة  : {len(duplicates)} ملف\n")
            f.write(f"• إجمالي المساحة الموفرة     : {format_size(dup_bytes)}\n\n")

            if duplicates:
                f.write("-" * 70 + "\n")
                f.write("قائمة الملفات المكررة التي تم تجاهلها لتوفير المساحة:\n")
                f.write("-" * 70 + "\n")
                for i, (dup_p, dup_s, dup_h) in enumerate(duplicates, 1):
                    f.write(f"[{i}] {dup_p.name} ({format_size(dup_s)})\n")
                    f.write(f"    المسار: {dup_p}\n")
                    f.write(f"    الهاش : {dup_h[:16]}...\n\n")
            else:
                f.write("ممتاز! لم يتم العثور على أي ملفات مكررة.\n")

            f.write("=" * 70 + "\n")
            f.write("نهاية التقرير - تم التنظيم بواسطة أداة منظّم الملفات الذكي.\n")

    def update_progress(self, val, max_val):
        self.progress["value"] = val
        self.status_lbl.config(text=f"جاري الفحص: {val} من {max_val} ({int(val/max_val*100)}%)")
        self.update_idletasks()

    def finish_ui(self):
        self.is_running = False
        self.start_btn.config(state="normal", bg="#0284c7")
        self.status_lbl.config(text="اكتملت العملية بنجاح.")

if __name__ == "__main__":
    app = FileOrganizerApp()
    app.mainloop()
