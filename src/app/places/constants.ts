import { CATEGORIES_STRUCTURE } from "@/data/places";

export const CATEGORY_EMOJIS: Record<string, string> = {
  all: "🗂️",
};

export const CATEGORY_ICONS: Record<string, string> = {
  all: "bx-grid-alt",
};

export const CATEGORY_LABELS: Record<string, string> = {
  all: "الكل",
};

CATEGORIES_STRUCTURE.forEach((main) => {
  CATEGORY_EMOJIS[main.name] = main.emoji;
  CATEGORY_ICONS[main.name] = main.icon;
  CATEGORY_LABELS[main.name] = main.label;

  main.subCategories.forEach((sub) => {
    CATEGORY_EMOJIS[sub.name] = main.emoji;
    CATEGORY_ICONS[sub.name] = sub.icon;
    CATEGORY_LABELS[sub.name] = sub.label;
  });
});

export function getCategoryColor(cat: string): string {
  const mainCat = CATEGORIES_STRUCTURE.find(
    (m) => m.name === cat || m.subCategories.some((s) => s.name === cat)
  );
  return mainCat?.color ?? "#2f80ed";
}

export const STOP_WORDS = [
  "في",
  "من",
  "ب",
  "بـ",
  "بمنطقة",
  "بمحافظة",
  "مدينة",
  "حي",
  "علي",
  "الي",
  "التي",
  "الذي",
  "مع",
];
