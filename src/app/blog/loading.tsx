import React from "react";
import BlogLoader from "@/components/blog/BlogLoader";

export default function BlogLoading() {
  return (
    <div style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <BlogLoader
        title="جاري تحميل المدونة..."
        subtitle="نجهز لك أحدث الأدلة والمقالات والنصائح في القاهرة"
        icon="bx bx-news"
        minHeight="80vh"
      />
    </div>
  );
}
