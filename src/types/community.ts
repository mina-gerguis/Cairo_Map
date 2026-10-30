export type ReactionType = "like" | "dislike" | "laugh" | "love" | "sad" | "angry";

export interface ReactionMeta {
  type: ReactionType;
  emoji: string;
  label: string;
  activeColor: string;
  bgLight: string;
}

export const COMMUNITY_REACTIONS: Record<ReactionType, ReactionMeta> = {
  like: {
    type: "like",
    emoji: "👍",
    label: "إعجاب",
    activeColor: "#2563eb",
    bgLight: "rgba(37, 99, 235, 0.12)",
  },
  dislike: {
    type: "dislike",
    emoji: "👎",
    label: "لم يعجبني",
    activeColor: "#64748b",
    bgLight: "rgba(100, 116, 139, 0.12)",
  },
  laugh: {
    type: "laugh",
    emoji: "😂",
    label: "ضحك",
    activeColor: "#eab308",
    bgLight: "rgba(234, 179, 8, 0.15)",
  },
  love: {
    type: "love",
    emoji: "❤️",
    label: "حب",
    activeColor: "#ef4444",
    bgLight: "rgba(239, 68, 68, 0.12)",
  },
  sad: {
    type: "sad",
    emoji: "😢",
    label: "زعل",
    activeColor: "#3b82f6",
    bgLight: "rgba(59, 130, 246, 0.12)",
  },
  angry: {
    type: "angry",
    emoji: "😡",
    label: "غضب",
    activeColor: "#ea580c",
    bgLight: "rgba(234, 88, 12, 0.12)",
  },
};

export const COMMUNITY_CATEGORIES = [
  { id: "all", name: "الكل", icon: "fa-solid fa-layer-group" },
  { id: "transit", name: "مواصلات وترانزيت", icon: "fa-solid fa-train-subway" },
  { id: "places", name: "أماكن وخروجات", icon: "fa-solid fa-compass" },
  { id: "food", name: "مطاعم وكافيهات", icon: "fa-solid fa-utensils" },
  { id: "services", name: "خدمات وأوراق", icon: "fa-solid fa-file-lines" },
  { id: "housing", name: "سكن ومناطق", icon: "fa-solid fa-house" },
  { id: "general", name: "استفسارات عامة", icon: "fa-solid fa-circle-question" },
] as const;

export type CommunityViewTab = "feed" | "my-questions" | "my-answers";

export interface CommunityQuestion {
  id: string;
  user_id?: string | null;
  author_name: string;
  author_username: string;
  author_avatar?: string | null;
  title: string;
  content?: string;
  category: string;
  tags: string[];
  location_tag?: string | null;
  is_solved: boolean;
  views_count: number;
  answers_count: number;
  reactions_count: Record<ReactionType, number>;
  user_reaction?: ReactionType | null;
  created_at: string;
  updated_at?: string;
}

export interface CommunityAnswer {
  id: string;
  question_id: string;
  user_id?: string | null;
  author_name: string;
  author_username: string;
  author_avatar?: string | null;
  content: string;
  is_best_answer: boolean;
  reactions_count: Record<ReactionType, number>;
  user_reaction?: ReactionType | null;
  created_at: string;
  updated_at?: string;
}

export interface UserAnswerWithQuestion extends CommunityAnswer {
  question?: {
    id: string;
    title: string;
    category: string;
    is_solved: boolean;
  } | null;
}

export interface CommunityReaction {
  id: string;
  target_type: "question" | "answer";
  target_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

// Preset default avatars used across the application
export const PRESET_AVATARS: string[] = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Omar&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Tarek&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Youssef&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ali&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Nour&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Layla&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Hala&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mona&backgroundColor=ffdfbf",
];

export function resolveUserAvatar(avatarUrl?: string | null, seedString?: string | null): string {
  if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim() !== "") {
    return avatarUrl.trim();
  }
  const seed = encodeURIComponent(seedString || "CairoUser");
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4`;
}
