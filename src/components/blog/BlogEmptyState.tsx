import React from "react";
import Link from "next/link";
import styles from "@/app/blog/blog.module.css";

interface BlogEmptyStateProps {
  isSavedCategory?: boolean;
  isUnauthenticated?: boolean;
}

export default function BlogEmptyState({
  isSavedCategory,
  isUnauthenticated,
}: BlogEmptyStateProps) {
  if (isSavedCategory && isUnauthenticated) {
    return (
      <div className={styles.loginPromptCard}>
        <i className="bx bx-bookmark-heart" />
        <h4>سجل دخولك لعرض مقالاتك المحفوظة</h4>
        <p>
          يمكنك حفظ أي مقال بالضغط على زر الحفظ (🔖) في الصفحة وقراءته في أي
          وقت.
        </p>
        <Link href="/login" className={styles.loginBtn}>
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.emptyGrid}>
      <i className={isSavedCategory ? "bx bx-bookmark" : "bx bx-news"} />
      <h4>
        {isSavedCategory
          ? "لم تقم بحفظ أي مقالات بعد"
          : "لم نجد أي مقال يطابق بحثك"}
      </h4>
      <p>
        {isSavedCategory
          ? "إقرأ أي مقال واضغط على زر «حفظ المقال» لتجده في هذه القائمة."
          : "جرّب البحث باسم موضوع آخر أو اختيار قسم مختلف."}
      </p>
    </div>
  );
}
