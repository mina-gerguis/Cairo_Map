import { CATEGORIES_STRUCTURE } from "@/data/places";

export const CATEGORY_ICONS: Record<string, string> = {
  all: "bx-grid-alt",
};

CATEGORIES_STRUCTURE.forEach((main) => {
  CATEGORY_ICONS[main.name] = main.icon;
  main.subCategories.forEach((sub) => {
    CATEGORY_ICONS[sub.name] = sub.icon;
  });
});

export const CATEGORY_LABELS: Record<string, string> = {};

CATEGORIES_STRUCTURE.forEach((main) => {
  CATEGORY_LABELS[main.name] = main.label;
  main.subCategories.forEach((sub) => {
    CATEGORY_LABELS[sub.name] = sub.label;
  });
});

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case "restaurant":
      return "#ff9500";
    case "cafe":
      return "#5856d6";
    case "pharmacy":
      return "#34c759";
    case "hospital":
      return "#ff3b30";
    case "garden":
      return "#30b0c7";
    default:
      return "#007aff";
  }
};
