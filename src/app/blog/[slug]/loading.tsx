import React from "react";
import BlogLoader from "@/components/blog/BlogLoader";

export default function SingleBlogLoading() {
  return (
    <div style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <BlogLoader
        title="جاري تجهيز المقال..."
        subtitle="لحظات ونعرض لك كامل تفاصيل المقال والمعلومات"
        icon="bx bx-book-open"
        minHeight="80vh"
      />
    </div>
  );
}
