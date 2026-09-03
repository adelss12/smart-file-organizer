export const GITHUB_GUIDE_DOC_CONTENT = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>دليل رفع المشروع إلى GitHub للمبتدئين</title>
<style>
  @page {
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2cm;
  }
  body {
    font-family: 'Segoe UI', 'Arial', Tahoma, sans-serif;
    direction: rtl;
    text-align: right;
    color: #1e293b;
    line-height: 1.6;
  }
  h1 {
    color: #0284c7;
    font-size: 22pt;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 8px;
    margin-bottom: 20px;
    text-align: center;
  }
  h2 {
    color: #0f172a;
    background-color: #f1f5f9;
    padding: 8px 12px;
    border-right: 5px solid #0284c7;
    font-size: 15pt;
    margin-top: 25px;
    margin-bottom: 12px;
  }
  h3 {
    color: #334155;
    font-size: 12pt;
    margin-top: 15px;
    margin-bottom: 8px;
  }
  p, li {
    font-size: 11pt;
  }
  ul, ol {
    margin-right: 20px;
    margin-bottom: 15px;
  }
  li {
    margin-bottom: 6px;
  }
  .command-box {
    background-color: #0f172a;
    color: #38bdf8;
    font-family: 'Consolas', 'Courier New', monospace;
    direction: ltr;
    text-align: left;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 10.5pt;
    margin: 5px 0 10px 0;
  }
  .alert-box {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-right: 5px solid #ef4444;
    padding: 10px 15px;
    margin: 15px 0;
    font-size: 10.5pt;
    color: #991b1b;
  }
  .tip-box {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-right: 5px solid #22c55e;
    padding: 10px 15px;
    margin: 15px 0;
    font-size: 10.5pt;
    color: #166534;
  }
  .footer {
    margin-top: 40px;
    border-top: 1px solid #cbd5e1;
    padding-top: 10px;
    text-align: center;
    font-size: 9pt;
    color: #64748b;
  }
</style>
</head>
<body>

<h1>📘 الدليل الشامل لرفع المشروع إلى GitHub (خطوة بخطوة للمبتدئين)</h1>

<p>هذا الدليل تم إعداده خصيصاً لمساعدتك في حفظ مشروعك <strong>"منظّم الملفات وكاشف المكررات الذكي"</strong> ونقله من منصة <strong>Google AI Studio</strong> إلى حسابك الشخصي على منصة <strong>GitHub</strong> لتوثيقه ومشاركته وتطويره مستقبلاً.</p>

<div class="tip-box">
  <strong>نصيحة:</strong> أمامك طريقتان؛ الطريقة الأولى تلقائية وسريعة بضغطة زر، والطريقة الثانية يدوية عبر حاسوبك وهي الأفضل لتعلم أوامر البرمجة والتحكم بالملفات.
</div>

<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

<h2>🟢 الطريقة الأولى: التصدير المباشر التلقائي (الأسرع)</h2>
<ol>
  <li>في واجهة موقع <strong>Google AI Studio</strong>، انظر إلى شريط الأدوات العلوي (في الزاوية اليمنى أو اليسرى).</li>
  <li>اضغط على زر <strong>Export</strong> (الذي ظهر في صورتك).</li>
  <li>اختر من القائمة: <strong>Push to GitHub</strong> (مزامنة مع مستودع جيت هب).</li>
  <li>ستظهر لك نافذة تطلب منك الإذن للاتصال بحسابك في GitHub، اضغط على <strong>Authorize</strong> لتسجيل الدخول.</li>
  <li>اكتب اسماً للمستودع (مثال: <code>smart-file-organizer</code>).</li>
  <li>اختر نوع المستودع: <strong>Public</strong> (عام يستطيع الجميع رؤيته) أو <strong>Private</strong> (خاص بك فقط).</li>
  <li>اضغط على <strong>Create Repository / Push</strong>.</li>
  <li>سيتم رفع المشروع فوراً وتوليد رابط لمستودعك على GitHub.</li>
</ol>

<br>

<h2>🔵 الطريقة الثانية: تنزيل المشروع ورفعه من الكمبيوتر (خطوة بخطوة)</h2>

<h3>الخطوة 1: تنزيل المشروع من Google AI Studio</h3>
<ol>
  <li>من نفس قائمة <strong>Export</strong>، اضغط على <strong>Download as .zip file</strong> (الخيار الثالث في صورتك).</li>
  <li>سينزل ملف مضغوط في مجلد التنزيلات (Downloads) على جهازك.</li>
  <li>اضغط بزر الفأرة الأيمن على الملف المضغوط واختر <strong>Extract All (استخراج الكل)</strong> لفك الضغط في مجلد مستقل (مثلاً على سطح المكتب).</li>
</ol>

<h3>الخطوة 2: إنشاء مستودع جديد على موقع GitHub</h3>
<ol>
  <li>افتح متصفح الإنترنت وادخل على حسابك في موقع: <span dir="ltr"><strong>https://github.com</strong></span></li>
  <li>في أعلى الصفحة بجانب صورة ملفك الشخصي، اضغط على علامة الزائد <strong>(+)</strong> ثم اختر <strong>New repository</strong>.</li>
  <li>في خانة اسم المستودع (<strong>Repository name</strong>)، اكتب اسماً إنجليزياً بدون مسافات، مثل:
    <div class="command-box">smart-file-organizer</div>
  </li>
  <li>
    <div class="alert-box">
      <strong>⚠️ تنبيه مهم جداً للمبتدئين:</strong><br>
      تأكد من <u>عدم وضع علامة صح</u> أمام أي من الخيارات التالية (اتركها فارغة):<br>
      • ❌ Add a README file<br>
      • ❌ Add .gitignore<br>
      *(لأن هذه الملفات تم إنشاؤها وتجهيزها لك مسبقاً داخل مجلد المشروع)*.
    </div>
  </li>
  <li>اضغط على الزر الأخضر بالأسفل: <strong>Create repository</strong>.</li>
  <li>ستفتح لك صفحة جديدة تحتوي على رابط مستودعك، سيكون بهذا الشكل (انسخه):
    <div class="command-box">https://github.com/YourUsername/smart-file-organizer.git</div>
  </li>
</ol>

<h3>الخطوة 3: التأكد من وجود برنامج Git على جهازك</h3>
<ul>
  <li>إذا لم تكن أداة Git مثبتة لديك على الويندوز، حملها مجاناً من الرابط الرسمي: <span dir="ltr"><strong>https://git-scm.com/download/win</strong></span></li>
  <li>افتح ملف التثبيت واضغط <strong>Next</strong> حتى تنتهي عملية التثبيت الافتراضية.</li>
</ul>

<h3>الخطوة 4: كتابة أوامر الرفع على جهازك</h3>
<ol>
  <li>افتح المجلد الذي قمت بفك ضغط ملفات المشروع داخله.</li>
  <li>اضغط بزر الفأرة الأيمن داخل مساحة فارغة في المجلد واختر <strong>Open Git Bash here</strong> أو <strong>Open in Terminal</strong> (أو افتح CMD في نفس المجلد).</li>
  <li>اكتب الأوامر التالية بالترتيب واضغط <strong>Enter</strong> بعد كل سطر:</li>
</ol>

<p><strong>1. تهيئة المجلد كمستودع Git محلي:</strong></p>
<div class="command-box">git init</div>

<p><strong>2. تجهيز كافة ملفات المشروع للرفع:</strong></p>
<div class="command-box">git add .</div>

<p><strong>3. حفظ النسخة الأولى مع كتابة تعليق وصفي:</strong></p>
<div class="command-box">git commit -m "Initial commit: Smart File Organizer"</div>

<p><strong>4. تعيين اسم الفرع الرئيسي ليكون main:</strong></p>
<div class="command-box">git branch -M main</div>

<p><strong>5. ربط المجلد المحلي برابط مستودعك على GitHub:</strong><br>
<small style="color: #64748b;">(استبدل الرابط التالي برابط مستودعك الذي نسخته من الخطوة 2)</small></p>
<div class="command-box">git remote add origin https://github.com/YourUsername/smart-file-organizer.git</div>

<p><strong>6. إرسال ورفع الملفات إلى GitHub:</strong></p>
<div class="command-box">git push -u origin main</div>

<div class="tip-box">
  <strong>ملاحظة للمرة الأولى:</strong> إذا كانت هذه أول مرة تستخدم فيها Git على كمبيوترك، ستظهر لك نافذة صغيرة تسألك تسجيل الدخول في GitHub، اضغط على <strong>Sign in with your browser</strong> وسيتم الربط بنجاح وفوراً.
</div>

<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">

<h2>🎉 النتيجة النهائية</h2>
<p>قم بتحديث صفحة المستودع على موقع GitHub، وستجد كل ملفات المشروع مرفوعة بنجاح مع ملف الشرح العربي <strong>README.md</strong> وسكربت بايثون <strong>organizer_gui.py</strong>، وبذلك تكون وثّقت عملك كالمحترفين!</p>

<div class="footer">
  تم إعداد هذا الدليل لمشروع: <strong>منظّم الملفات الذكي وكاشف المكررات</strong>
</div>

</body>
</html>`;

export function downloadWordDoc() {
  const blob = new Blob(['\ufeff', GITHUB_GUIDE_DOC_CONTENT], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'دليل_رفع_المشروع_الى_GitHub.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
