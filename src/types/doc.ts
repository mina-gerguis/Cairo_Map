export type DocType = "update" | "feature" | "roadmap";

export type DocRoadmapStatus =
  | "released"
  | "testing"
  | "in_progress"
  | "planned";

export interface SiteDoc {
  id: string;
  title: string;
  slug: string | null;
  doc_type: DocType;
  version: string | null;
  summary: string | null;
  content: string;
  highlights: string[];
  tags: string[];
  cover_image?: string | null;
  roadmap_status: DocRoadmapStatus;
  progress_percent: number;
  release_date: string;
  is_pinned: boolean;
  is_published: boolean;
  sort_order: number;
  author_name: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteDocPayload {
  title: string;
  slug: string;
  doc_type: DocType;
  version: string;
  summary: string;
  content: string;
  highlights: string[];
  tags: string[];
  cover_image?: string | null;
  roadmap_status: DocRoadmapStatus;
  progress_percent: number;
  release_date: string;
  is_pinned: boolean;
  is_published: boolean;
  sort_order: number;
  author_name: string;
  created_by?: string | null;
  updated_at?: string;
}
