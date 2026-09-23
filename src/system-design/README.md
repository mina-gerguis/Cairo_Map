# 🎨 دليل نظام التصميم المعياري (Tailwind-Standard Design System)

تم بناء وتحديث نظام التصميم في `src/system-design/` بالكامل ليتوافق بدقة 100% مع معايير وتسميات **Tailwind CSS (Utility-First Naming Conventions)**، مع الحفاظ على التوافقية العكسية (Backward Compatibility) للمشاريع الحالية.

---

## 📁 بنية المجلد والملفات (Directory Architecture)

```text
src/system-design/
├── tokens/                  # طبقة متغيرات التصميم (Design Tokens)
│   ├── colors.css           # لوحات الألوان، الخلفيات، والحدود (Dark & Light)
│   ├── spacing.css          # مقياس المسافات والزوايا (Radii) بمعايير Tailwind
│   ├── shadows.css          # مستويات الظلال المعيارية
│   ├── typography.css       # عائلات الخطوط، الأحجام، والأوزان
│   └── transition.css       # الترانزيشن ومعدلات التوقيت (Easing & Durations)
├── components/              # كلاسات المكونات الجاهزة (Base Components)
│   ├── buttons.css          # الأزرار بمختلف أنواعها وأحجامها وحالات الـ Focus
│   ├── inputs.css           # حقول الإدخال، البحث، وحالات التحقق والخطأ
│   └── cards.css            # الكروت والأسطح الزجاجية والـ Modals
├── utilities/               # كلاسات الأدوات المساعدة الذرية (Tailwind Atomic Utilities)
│   ├── typography.css       # font-*, text-*, leading-*, tracking-*, whitespace-*
│   ├── spacing.css          # p-*, m-*, gap-*, space-x-*, space-y-*
│   ├── sizing.css           # w-*, h-*, min-w-*, max-w-*, min-h-*, max-h-*
│   ├── layout.css           # flex, grid, items-*, justify-*, absolute, relative, z-*
│   ├── borders.css          # rounded-*, border-*, divide-*, outline-*
│   ├── effects.css          # shadow-*, opacity-*, transition-*, cursor-*, blur-*
│   └── colors.css           # bg-*, text-*, border-*
├── index.css                # نقطة التجميع الرئيسية للنظام بالترتيب المعياري
└── README.md                # الدليل الشامل ومرجع الكلاسات (Cheat Sheet)
```

---

## 🚀 جدول مرجع الكلاسات السريع (Cheat Sheet)

### 1. الخطوط والنصوص (Typography)
| الفئة | الكلاسات (Tailwind Style) | الوصف |
| :--- | :--- | :--- |
| **الأحجام** | `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-3xl`, `.text-4xl`, `.text-5xl` | أحجام الخطوط من 12px حتى 48px+ |
| **الأوزان** | `.font-light`, `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`, `.font-black` | أوزان الخط (300 إلى 900) |
| **المحاذاة** | `.text-left`, `.text-center`, `.text-right`, `.text-justify`, `.text-start`, `.text-end` | محاذاة واتجاه النص |
| **الارتفاع** | `.leading-none`, `.leading-tight`, `.leading-snug`, `.leading-normal`, `.leading-loose` | Line-Height |
| **الاقتطاع** | `.truncate`, `.text-ellipsis`, `.break-words`, `.whitespace-nowrap` | التحكم في الالتفاف وتجاوز النص |

---

### 2. المسافات والهوامش (Spacing)
| الفئة | الكلاسات | الوصف |
| :--- | :--- | :--- |
| **الهامش الداخلي** | `.p-0` إلى `.p-24`, `.px-4`, `.py-2`, `.pt-4`, `.pb-4`, `.ps-4`, `.pe-4` | Padding كامل، أفقي، رأسي، وموجه |
| **الهامش الخارجي** | `.m-0` إلى `.m-24`, `.mx-auto`, `.my-4`, `.mt-6`, `.mb-2`, `.-mt-4` | Margin والهوامش التلقائية والسالبة |
| **الفجوات** | `.gap-1`, `.gap-2`, `.gap-4`, `.gap-6`, `.gap-8`, `.gap-x-4`, `.gap-y-6` | Flex/Grid Gap |
| **المسافة بين العناصر** | `.space-x-2`, `.space-x-4`, `.space-y-3`, `.space-y-6` | Space between child elements |

---

### 3. الأبعاد والمقاسات (Sizing)
| الفئة | الكلاسات | الوصف |
| :--- | :--- | :--- |
| **العرض** | `.w-full`, `.w-auto`, `.w-screen`, `.w-fit`, `.w-1/2`, `.w-1/3`, `.w-1/4`, `.w-12` | العرض الثابت والنسبي |
| **أقصى عرض** | `.max-w-xs`, `.max-w-sm`, `.max-w-md`, `.max-w-lg`, `.max-w-xl`, `.max-w-full` | Max-Width للحاويات |
| **الارتفاع** | `.h-full`, `.h-auto`, `.h-screen`, `.h-fit`, `.min-h-screen`, `.max-h-full` | الارتفاع الثابت والنسبي |

---

### 4. التخطيط والتموضع (Layout & Flex/Grid)
| الفئة | الكلاسات | الوصف |
| :--- | :--- | :--- |
| **Display** | `.block`, `.inline-block`, `.flex`, `.inline-flex`, `.grid`, `.hidden` | نوع عرض العنصر |
| **Flex Direction** | `.flex-row`, `.flex-col`, `.flex-wrap`, `.grow`, `.shrink` | اتجاه وتدفق الفليكس |
| **Flex Alignment** | `.items-center`, `.items-start`, `.items-end`, `.items-stretch` | محاذاة العناصر عمودياً |
| **Flex Justify** | `.justify-between`, `.justify-center`, `.justify-start`, `.justify-end` | توزيع العناصر أفقياً |
| **CSS Grid** | `.grid-cols-1` إلى `.grid-cols-12`, `.col-span-1` إلى `.col-span-full` | أعمدة وتقسيمات الجريد |
| **Positioning** | `.relative`, `.absolute`, `.fixed`, `.sticky`, `.inset-0`, `.top-0`, `.z-10`, `.z-50` | التموضع وطبقات الـ Z-Index |

---

### 5. الحواف والإطارات (Borders & Radius)
| الفئة | الكلاسات | الوصف |
| :--- | :--- | :--- |
| **استدارة الحواف** | `.rounded-none`, `.rounded-sm`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`, `.rounded-2xl`, `.rounded-full` | Border Radius |
| **سمك الإطار** | `.border`, `.border-0`, `.border-2`, `.border-t`, `.border-b`, `.border-x` | Border Widths |
| **نمط الإطار** | `.border-solid`, `.border-dashed`, `.border-dotted`, `.border-none` | Border Styles |
| **الفواصل** | `.divide-y`, `.divide-x` | فواصل بين العناصر الأبناء |

---

### 6. التأثيرات والشفافية والحركة (Effects & Transitions)
| الفئة | الكلاسات | الوصف |
| :--- | :--- | :--- |
| **الظلال** | `.shadow-sm`, `.shadow`, `.shadow-md`, `.shadow-lg`, `.shadow-xl`, `.shadow-none` | Box Shadows |
| **الشفافية** | `.opacity-0`, `.opacity-25`, `.opacity-50`, `.opacity-75`, `.opacity-100` | Opacity |
| **الانتقالات** | `.transition`, `.transition-all`, `.duration-150`, `.duration-300`, `.ease-in-out` | Transitions |
| **المؤشر** | `.cursor-pointer`, `.cursor-not-allowed`, `.select-none`, `.pointer-events-none` | تفاعل الفأرة والتحديد |
| **الضبابية** | `.backdrop-blur-sm`, `.backdrop-blur-md`, `.backdrop-blur-lg` | Glassmorphism Blur |

---

### 7. الألوان والثيمات (Colors)
| الفئة | الكلاسات | الوصف |
| :--- | :--- | :--- |
| **الخلفيات** | `.bg-primary`, `.bg-surface`, `.bg-mode`, `.bg-glass`, `.bg-white`, `.bg-black` | ألوان الخلفيات للثيم |
| **النصوص** | `.text-primary`, `.text-secondary`, `.text-muted`, `.text-brand`, `.text-white` | ألوان النصوص |
| **الإطارات** | `.border-border`, `.border-subtle`, `.border-glass`, `.border-brand` | ألوان الحدود |

---

## 💡 مثال تطبيقي (Component Composition Example)

```html
<!-- بطاقة حديثة مطبقة بالكامل بكلاسات الـ Tailwind من نظام التصميم -->
<div class="glass-card flex flex-col p-6 rounded-2xl shadow-lg border border-glass space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-bold text-primary font-heading">عنوان البطاقة</h3>
    <span class="text-xs font-semibold px-3 py-1 bg-primary text-white rounded-full">مميز</span>
  </div>
  
  <p class="text-sm text-secondary leading-relaxed font-body">
    هذا نص وصفي توضيحي يعتمد على كلاسات نظام التصميم الجديد المتوافق مع معايير Tailwind CSS.
  </p>
  
  <div class="flex items-center gap-3 pt-2">
    <button class="btn btn-primary px-4 py-2 text-sm rounded-lg font-medium">
      تأكيد الإجراء
    </button>
    <button class="btn btn-secondary px-4 py-2 text-sm rounded-lg font-medium">
      إلغاء
    </button>
  </div>
</div>
```
