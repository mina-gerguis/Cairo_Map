export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string[];
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  status: "published" | "draft";
  views_count: number;
  likes_count: number;
  comments_count: number;
  reading_time: number;
  created_at: string;
}

export interface BlogComment {
  id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}
