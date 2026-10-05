import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { BlogArticle } from "@/types/blog";
import { SAMPLE_ARTICLES, SAVED_ARTICLES_CATEGORY } from "@/data/blogData";

export function useBlogArticles() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("الكل");

  useEffect(() => {
    let isMounted = true;

    const fetchPublishedBlogs = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          if (isMounted) setBlogs(SAMPLE_ARTICLES);
          return;
        }

        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (isMounted) {
          if (error || !data || data.length === 0) {
            setBlogs(SAMPLE_ARTICLES);
          } else {
            setBlogs(data);
          }
        }

        if (user && supabase) {
          const { data: bookmarkData } = await supabase
            .from("blog_bookmarks")
            .select("blog_id")
            .eq("user_id", user.id);

          if (isMounted && bookmarkData) {
            setBookmarkedIds(bookmarkData.map((b) => b.blog_id));
          }
        }
      } catch {
        if (isMounted) setBlogs(SAMPLE_ARTICLES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPublishedBlogs();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isSavedCategory = activeCategory === SAVED_ARTICLES_CATEGORY;

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesSearch =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.excerpt.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (isSavedCategory) {
        return bookmarkedIds.includes(blog.id);
      }

      return activeCategory === "الكل" || blog.category === activeCategory;
    });
  }, [blogs, searchQuery, activeCategory, isSavedCategory, bookmarkedIds]);

  const featuredPost = useMemo(() => {
    return !searchQuery && activeCategory === "الكل" ? blogs[0] ?? null : null;
  }, [blogs, searchQuery, activeCategory]);

  return {
    user,
    blogs,
    filteredBlogs,
    featuredPost,
    bookmarkedIds,
    loading,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    isSavedCategory,
  };
}
