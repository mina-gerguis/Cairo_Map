---
name: qareeb-design-system
description: الدليل الشامل والمعياري لنظام تصميم موقع قريب (Qareeb Map) لإنشاء ميزات وصفحات ومكونات جديدة متناسقة 100% مع الهوية البصرية، الألوان، الخطوط، التخطيط، والـ Dark/Light mode.
---

# 🗺️ دليل نظام تصميم موقع "قريب" (Qareeb Design System Skill)

هذا الملف يمثل المرجع الشامل والأساسي عند إنشاء أي **صفحة جديدة (Page)**، **ميزة (Feature)**، أو **مكون (Component)** في مشروع قريب (`cairo_map / website`).

---

## 🚨 قاعدة التنسيق الذهبية والإلزامية (STRICT STYLING RULES)

1. **التنسيق الداخلي فقط عبر `className` (Inline Utility-First Classes)**:
   - **يُمنع منعاً باتاً** إنشاء ملفات CSS جديدة لكل صفحة أو مكون (مثل `Feature.css` أو `Component.module.css`).
   - كافة التنسيقات تكتب مباشرة داخل خصائص `className` باستخدام كلاسات **Tailwind CSS** المعيارية وكلاسات الأدوات المساعدة الموجودة في نظام التصميم.
   - **الاستثناء الوحيد لإنشاء ملف CSS مستقل**: Animations معقدة جداً بمؤثرات Keyframes مخصصة أو 3D Canvases التي يستحيل تمثيلها بـ utility classes ولا توجد بالفعل في النظام.

2. **حصرية ملفات التنسيق داخل مجلد `src/system-design/` فقط**:
   - لا يتم إضافة أي كلاسات CSS عامة أو مشتركة خارج مسار `src/system-design/`.
   - مجلد `src/system-design/` هو المصدر الوحيد والحصري لجميع:
     - متغيرات التصميم (Tokens): `src/system-design/tokens/`
     - كلاسات المكونات الأساسية: `src/system-design/components/`
     - الأدوات المساعدة: `src/system-design/utilities/`

---

## 📌 1. المبادئ الجوهرية (Core Principles)

1. **RTL First (العربية والاتجاه من اليمين لليسار)**:
   - الموقع موجه أساساً للمستخدم العربي والمصري (`dir="rtl"`, `lang="ar"`).
   - استخدام Logical Properties دائماً: `ps-*` / `pe-*` و `ms-*` / `me-*`، أو الانتباه التام لمواقع الأيقونات والتجاويف.
2. **Dual Theme (الوضع الداكن والفاتح)**:
   - الوضع الافتراضي هو الداكن (`dark`)، ويوجد وضع نهاري (`light` عبر الكلاس `html.light`).
   - ممنوع استخدام ألوان صلبة مثل `bg-black`, `bg-white`, `#000` بدون CSS Variables أو كلاسات النظام المتوافقة مع الثيمين (مثل `bg-[var(--color-bg)]`, `text-[var(--color-fg)]`).
3. **Glassmorphism & iOS Human Interface Aesthetic**:
   - إحساس زجاجي ناعم (`backdrop-blur-md`، حدود زجاجية خفيفة `border-[var(--border-glass)]`، زوايا مستديرة ناعمة `rounded-2xl` أو `rounded-3xl`).
   - سلاسة في التفاعل والحركة باستخدام Framer Motion و GSAP.
4. **Mobile & PWA Ready**:
   - واجهات متجاوبة بالكامل.
   - وجود شريط تنقل سفلي (`mobile-bottom-nav`) على الجوال يقتضي دائماً إضافة حشو سفلي كافٍ للصفحة (`pb-24 md:pb-16`).

---

## 🎨 2. منظومة الألوان ورموز التصميم (Color Tokens)

تم تعريف الألوان في `src/system-design/tokens/colors.css`. استخدم المتغيرات التالية مباشرة داخل `className` كـ Arbitrary Values أو الكلاسات المقابلة:

### الألوان الأساسية والهوية (Brand & Accent)
- **Primary Blue (اللون الأساسي)**: `--color-primary: #2727ff;` (استخدم: `text-primary`, `bg-primary`, `text-[var(--color-primary)]`, `bg-[var(--color-primary)]`)
- **Secondary Blue**: `--color-secondary: #3b82f6;`
- **Accent Blue**: `--colorAccent: #1a3eff;`
- **Muted Gray**: `--colorMuted: #a1a1aa;`

### ألوان الحالات (Feedback & Status)
- **نجاح (Success)**: `--color-success: #00d37b;` (في Light mode: `#008a50`)
- **تحذير (Warning)**: `--color-warning: #ffe600;` / `--warningBtn: #ffa500;`
- **خطر/خطأ (Danger/Error)**: `--color-danger: #ff0000;` / `--btn-danger`
- **معلومات (Info)**: `--color-info: #006eff;`

### أسطح الخلفيات (Canvas & Surfaces)
| العنصر | Dark Mode (الافتراضي) | Light Mode (`html.light`) | الاستخدام الموصى به في `className` |
| :--- | :--- | :--- | :--- |
| **خلفية الصفحة الأساسية** | `#000000` | `#ffffff` | `bg-[var(--color-bg)]` |
| **الخلفية الثانوية (Cards / Sections)** | `#070707` | `#f4f4f5` | `bg-[var(--bg-secondary)]` |
| **الطبقة الثالثة (Inputs / Insets)** | `#121212` | `#f8f8f8` | `bg-[var(--bgThird)]` أو `bg-[var(--bg-third)]` |
| **الأسطح الزجاجية (Glass Cards)** | `rgba(24, 24, 27, 0.70)` | `rgba(255, 255, 255, 0.80)` | `bg-[var(--cardGlassBg)] backdrop-blur-md` أو `.glass-card` |
| **شريط التنقل/الهيدر** | `rgba(0, 0, 0, 0.70)` | `rgba(255, 255, 255, 0.80)` | `bg-[var(--bg-glass)]` |

### النصوص والطباعة (Text Hierarchy)
- **العناوين والنصوص الرئيسية**: `text-[var(--color-fg)]` أو `text-foreground`
- **النصوص الثانوية**: `text-[var(--text-secondary)]`
- **النصوص الخافتة / التلميحات**: `text-[var(--text-muted)]` أو `text-muted-foreground`

### الحدود والإطارات (Borders & Dividers)
- **حدود زجاجية ناعمة**: `border border-[var(--border-glass)]`
- **حدود واضحة للكروت**: `border border-[var(--border-primary)]`
- **فواصل الأقسام**: `border-b border-[var(--border-glass)]`

---

## 🔤 3. الخطوط والطباعة (Typography)

- **الخط الأساسي للموقع**: **Almarai** عبر متغير CSS: `var(--font-almarai)` وتطبيقه العام `var(--font-sub)` و `var(--font-body)`.
- **أوزان الخطوط المدعومة في `className`**:
  - `font-light` (300)
  - `font-normal` (400)
  - `font-bold` (700)
  - `font-extrabold` (800)
- **أحجام النصوص المعتمدة داخل `className`**:
  - **عنوان صفحة البطل (Hero Title)**: `text-2xl sm:text-3xl md:text-5xl font-extrabold text-[var(--color-fg)] tracking-tight` (أو استخدام فئة `.title-ios`).
  - **عنوان القسم (Section Title)**: `text-xl md:text-2xl font-bold text-[var(--color-fg)] flex items-center gap-2` (أو فئة `.section-title`).
  - **عنوان الكارت (Card Title)**: `text-base md:text-lg font-bold text-[var(--color-fg)]`.
  - **الوصف أو المتن**: `text-sm text-[var(--text-secondary)] leading-relaxed`.

---

## 📐 4. هيكل وتخطيط الصفحات الجديد (Page Standard Template)

كل صفحة جديدة يجب أن تعتمد على التنسيق المضمن في `className` دون استدعاء أي ملف CSS خارجي:

```tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import { ASSETS } from "@/constants/assets";

export default function FeaturePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] pb-24 md:pb-16 pt-6 transition-colors duration-200">
      {/* 1. الحاوية العامة الموحدة بتنسيق داخلي كامل */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. قسم البطل (Hero Header) */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--color-fg)] flex items-center gap-3">
              <span>اسم الميزة أو الصفحة</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              وصف موجز للميزة معتمد بالكامل على تنسيقات className الداخلية.
            </p>
          </div>

          {/* أزرار الإجراء السريع */}
          <div className="flex items-center gap-3">
            <PrimaryButton icon={<i className="bx bx-plus text-lg" />}>
              إجراء سريع
            </PrimaryButton>
          </div>
        </header>

        {/* 3. شريط الفلاتر والبحث (إن وجد) */}
        <section className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="ابحث هنا..."
              className="w-full bg-[var(--inputBg)] border border-[var(--inputBorder)] rounded-xl px-4 py-2.5 pe-10 text-sm text-[var(--color-fg)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200 shadow-sm"
            />
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-lg" />
          </div>
        </section>

        {/* 4. شبكة المحتوى أو الكروت (Content Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* كروت المحتوى */}
        </section>

      </div>
    </main>
  );
}
```

---

## 🧩 5. أنماط المكونات الشائعة بـ `className` (Component Patterns)

### أ) الكروت الزجاجية (Glass Cards)
يتم تطبيقها بالكامل عبر `className` بدون ملفات إضافية:
```tsx
<div className="bg-[var(--cardGlassBg)] backdrop-blur-md border border-[var(--border-glass)] rounded-2xl p-5 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
  <div>
    <div className="flex items-center justify-between mb-3 gap-2">
      <h3 className="font-bold text-base md:text-lg text-[var(--color-fg)] line-clamp-1">
        عنوان الكارت
      </h3>
      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
        مميز
      </span>
    </div>
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
      نص وصفي مختصر يتم التحكم في التافه وحجمه عبر كلاسات Tailwind فقط.
    </p>
  </div>
  
  <div className="mt-4 pt-3 border-t border-[var(--border-glass)] flex items-center justify-between">
    <span className="text-xs text-[var(--text-muted)]">تفاصيل إضافية</span>
    <button className="text-xs text-primary font-bold hover:underline">
      عرض المزيد
    </button>
  </div>
</div>
```

### ب) أزرار النظام (Buttons)
استخدم المكونات الموحدة في `src/components/ui/button/`:
- `PrimaryButton`: الزر الأساسي المعتمد في المشروع.
- `CancelButton`: لأزرار الإلغاء.
- `SubmitButton`: لنماذج الإرسال.

### ج) كبسولات التصنيف (Category Pills)
تنسيق داخلي كامل مع حالات النشط (Active):
```tsx
<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
  {categories.map((cat) => {
    const isActive = selectedCategory === cat.id;
    return (
      <button
        key={cat.id}
        onClick={() => setSelectedCategory(cat.id)}
        className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-[var(--color-fg)] text-[var(--color-bg)] font-bold shadow-md"
            : "bg-[var(--cardGlassBg)] border border-[var(--border-glass)] text-[var(--color-fg)] hover:bg-[var(--hoverBtn)]"
        }`}
      >
        {cat.name}
      </button>
    );
  })}
</div>
```

### د) الشيت السفلي للجوال (Mobile Sheet)
بدل فتح مودال ضخم يغطي شاشات الجوال:
```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center">
  <div className="w-full md:max-w-lg bg-[var(--bg-secondary)] border-t md:border border-[var(--border-glass)] rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
    <div className="w-10 h-1 bg-[var(--text-muted)] rounded-full mx-auto mb-4 md:hidden" />
    {/* محتوى الشيت */}
  </div>
</div>
```

---

## ⚡ 6. الأيقونات والصور والـ Assets

1. **مكتبات الأيقونات المعتمدة**:
   - **Boxicons**: كلاسات `bx bx-*` (مثل `bx bx-map`, `bx bx-heart`, `bx bx-time`).
   - **Lucide Icons**: مكونات React من `lucide-react` (مثل `ChevronDown`, `Search`, `Share2`).
   - **FontAwesome**: مدعومة في شريط التنقل (`fa-solid fa-*`).
2. **استيراد الأصول والصور**:
   - ممنوع وضع مسارات صور نصية عشوائية.
   - استورد دائماً من الملف الموحد:
     ```tsx
     import { ASSETS } from "@/constants/assets";
     ```

---

## 🔒 7. فحص المصادقة والاشتراكات (Auth & Permissions)

إذا كانت الميزة تتطلب صلاحيات خاصة أو اشتراكاً:
```tsx
import { useAuth } from "@/context/AuthContext";

const { user, profile, isPageOpen } = useAuth();
const promoStatus = isPageOpen("/my-feature");
const hasAccess = Boolean(
  profile?.is_admin ||
  promoStatus?.isOpen ||
  profile?.subscription_tier === "gold" ||
  profile?.subscription_tier === "silver"
);
```

---

## ✅ 8. قائمة المراجعة السريعة (Checklist قبل إنهاء أي عمل)

- [ ] **هل التنسيقات كلها داخل `className` دون إنشاء أي ملفات CSS جديدة للميزة؟**
- [ ] **هل تم التأكد من عدم إضافة أي ملفات تنسيق عامة خارج `src/system-design/`؟**
- [ ] هل تم اختبار الواجهة في **Dark Mode** و **Light Mode** باستخدام متغيرات النظام (`var(--color-bg)`, `var(--color-fg)`)؟
- [ ] هل التخطيط متوافق مع الاتجاه العربي **RTL** تماماً؟
- [ ] هل تم فحص التجاوب على شاشات الجوال وترك هامش سفلي (`pb-24`) لتجنب تغطية شريط التنقل السفلي؟
- [ ] هل تم استيراد الشعارات والصور من `@/constants/assets`؟
