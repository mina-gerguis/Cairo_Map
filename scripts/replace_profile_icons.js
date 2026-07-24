const fs = require('fs');

const files = [
  'src/app/profile/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/directory/page.tsx',
  'src/app/page.tsx',
  'src/app/directory/page.tsx',
  'src/app/favorites/page.tsx',
  'src/components/Navbar.tsx',
  'src/app/admin/notifications/page.tsx',
  'src/app/metro/page.tsx'
];

const replacements = [
  { regex: />\s*إلغاء\s*<\/(button|Link)>/g, icon: "bx bx-x" },
  { regex: />\s*إغلاق\s*<\/(button|Link)>/g, icon: "bx bx-x" },
  { regex: />\s*حفظ التغييرات\s*<\/(button|Link)>/g, icon: "bx bx-save" },
  { regex: />\s*حفظ\s*<\/(button|Link)>/g, icon: "bx bx-save" },
  { regex: />\s*تعديل البيانات\s*<\/(button|Link)>/g, icon: "bx bx-edit-alt" },
  { regex: />\s*أضف الآن\s*<\/(button|Link)>/g, icon: "bx bx-plus-circle" },
  { regex: />\s*إضافة\s*<\/(button|Link)>/g, icon: "bx bx-plus" },
  { regex: />\s*إضافة مكان جديد\s*<\/(button|Link)>/g, icon: "bx bx-plus-circle" },
  { regex: />\s*حذف الحساب\s*<\/(button|Link)>/g, icon: "bx bx-trash" },
  { regex: />\s*تسجيل الخروج\s*<\/(button|Link)>/g, icon: "bx bx-log-out" },
  { regex: />\s*حذف الحساب نهائياً\s*<\/(button|Link)>/g, icon: "bx bx-trash" },
  { regex: />\s*جعل الكل مقروء\s*<\/(button|Link)>/g, icon: "bx bx-check-double" },
  { regex: />\s*حذف الكل\s*<\/(button|Link)>/g, icon: "bx bx-trash" },
  { regex: />\s*تفعيل الآن\s*<\/(button|Link)>/g, icon: "bx bx-shield-quarter" },
  { regex: />\s*إلغاء التفعيل\s*<\/(button|Link)>/g, icon: "bx bx-shield-x" },
  { regex: />\s*تعديل\s*<\/(button|Link)>/g, icon: "bx bx-edit" },
  { regex: />\s*تحديث\s*<\/(button|Link)>/g, icon: "bx bx-refresh" },
  { regex: />\s*حذف\s*<\/(button|Link)>/g, icon: "bx bx-trash" },
  { regex: />\s*رجوع\s*<\/(button|Link)>/g, icon: "bx bx-right-arrow-alt" },
  { regex: />\s*العودة للرئيسية\s*<\/(button|Link)>/g, icon: "bx bx-home" },
  { regex: />\s*العودة\s*<\/(button|Link)>/g, icon: "bx bx-arrow-back" },
  { regex: />\s*التالي\s*<\/(button|Link)>/g, icon: "bx bx-left-arrow-alt" },
  { regex: />\s*متابعة\s*<\/(button|Link)>/g, icon: "bx bx-right-arrow-alt" },
  { regex: />\s*البحث\s*<\/(button|Link)>/g, icon: "bx bx-search" },
  { regex: />\s*بحث\s*<\/(button|Link)>/g, icon: "bx bx-search" },
  { regex: />\s*إضافة جديد\s*<\/(button|Link)>/g, icon: "bx bx-plus" },
  { regex: />\s*طرح السؤال\s*<\/(button|Link)>/g, icon: "bx bx-send" },
  { regex: />\s*إرسال الرسالة\s*<\/(button|Link)>/g, icon: "bx bx-send" },
  { regex: />\s*إرسال رسالة أخرى\s*<\/(button|Link)>/g, icon: "bx bx-refresh" },
  { regex: />\s*استكشف الأماكن\s*<\/(button|Link)>/g, icon: "bx bx-map-alt" },
  { regex: />\s*المفضلة\s*<\/(button|Link)>/g, icon: "bx bx-heart" },
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(({ regex, icon }) => {
      content = content.replace(regex, (match) => {
        const textMatch = match.match(/>\s*(.+?)\s*<\/(button|Link)>/);
        if (textMatch) {
          const text = textMatch[1].trim();
          const tag = textMatch[2];
          return `><i className="${icon}" style={{ fontSize: "1.2rem" }}></i> ${text}</${tag}>`;
        }
        return match;
      });
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
