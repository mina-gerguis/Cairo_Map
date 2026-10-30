"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, HelpCircle, Send, Sparkles, MapPin, Tag, LogIn, Loader2 } from "lucide-react";
import { COMMUNITY_CATEGORIES, resolveUserAvatar, PRESET_AVATARS } from "@/types/community";
import styles from "@/app/had-yaaraf/had-yaaraf.module.css";

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content?: string;
    category: string;
    tags: string[];
    location_tag?: string;
  }) => Promise<boolean>;
  user: any;
  profile: any;
}

const COMMON_TAGS = [
  "مترو",
  "مواصلات",
  "التجمع_الخامس",
  "المعادي",
  "مدينة_نصر",
  "وسط_البلد",
  "خروجات",
  "كافيهات",
  "أوراق_حكومية",
];

export default function AskQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  profile,
}: AskQuestionModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("مواصلات وترانزيت");
  const [locationTag, setLocationTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const authorName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "مستخدم قريب";
  const authorUsername =
    profile?.username ||
    user?.user_metadata?.preferred_username ||
    user?.email?.split("@")[0] ||
    "user";
  const authorAvatar = resolveUserAvatar(
    profile?.avatar_url || user?.user_metadata?.avatar_url,
    authorUsername
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = customTagInput.trim().replace(/^#/, "");
      if (val && !selectedTags.includes(val)) {
        setSelectedTags([...selectedTags, val]);
        setCustomTagInput("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("يرجى تسجيل الدخول أولاً لتتمكن من طرح سؤالك.");
      return;
    }

    if (!title.trim() || title.trim().length < 10) {
      setErrorMsg("يرجى كتابة سؤال واضح لا يقل عن 10 أحرف (مثال: حد يعرف أسرع طريقة لـ...؟)");
      return;
    }

    setLoading(true);
    const success = await onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      category,
      tags: selectedTags,
      location_tag: locationTag.trim() || undefined,
    });

    setLoading(false);

    if (success) {
      setTitle("");
      setContent("");
      setLocationTag("");
      setSelectedTags([]);
      onClose();
    } else {
      setErrorMsg("حدث خطأ أثناء حفظ السؤال، يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" onClick={onClose} className={styles.modalCloseBtn}>
          <X style={{ width: "20px", height: "20px" }} />
        </button>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalIconCircle}>
            <HelpCircle style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <h2 className={styles.modalTitle}>
              اسأل المجتمع (حد يعرف؟) <Sparkles style={{ width: "16px", height: "16px", color: "#f59e0b", display: "inline" }} />
            </h2>
            <p className={styles.modalDesc}>
              اطرح استفسارك وسيجيبك المستخدمين ذوي الخبرة في القاهرة الكبرى
            </p>
          </div>
        </div>

        {/* Not Logged In Notice */}
        {!user && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "18px",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <LogIn style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>يتطلب طرح السؤال تسجيل الدخول ليظهر اسمك وصورتك في المجتمع.</span>
            </div>
            <Link
              href="/login"
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                background: "#f59e0b",
                color: "#000",
                fontWeight: 800,
                textDecoration: "none",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              }}
            >
              تسجيل الدخول
            </Link>
          </div>
        )}

        {/* User preview identity */}
        {user && (
          <div className={styles.authorIdentityCard}>
            <div className={styles.userAvatarWrapper} style={{ width: "40px", height: "40px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={authorAvatar}
                alt={authorName}
                className={styles.avatarImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                }}
              />
            </div>
            <div className={styles.userMetaCol}>
              <span className={styles.userName} style={{ fontSize: "0.9rem" }}>
                سيُنشر السؤال باسم: {authorName}
              </span>
              <span className={styles.userUsername}>@{authorUsername}</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#ef4444",
              fontSize: "0.82rem",
              marginBottom: "16px",
              fontWeight: 700,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmit}>
          {/* Question Title */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              عنوان السؤال <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حد يعرف أسرع طريق للتجمع الخامس من رمسيس بالمترو؟"
              className={styles.formInput}
              required
            />
          </div>

          {/* Details / Content */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>تفاصيل إضافية (اختياري)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب أي معلومات إضافية توضح استفسارك..."
              rows={3}
              className={styles.formTextarea}
            />
          </div>

          {/* Category & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
            <div>
              <label className={styles.formLabel}>القسم / التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.formSelect}
              >
                {COMMUNITY_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin style={{ width: "14px", height: "14px" }} />
                <span>المنطقة أو الحي (اختياري)</span>
              </label>
              <input
                type="text"
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                placeholder="مثال: التجمع، المعادي، الدقي"
                className={styles.formInput}
              />
            </div>
          </div>

          {/* Tags */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Tag style={{ width: "14px", height: "14px" }} />
              <span>وسوم شائعة (اختر ما يناسبك)</span>
            </label>
            <div className={styles.tagsGrid}>
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`${styles.tagChip} ${isSelected ? styles.tagChipSelected : ""}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="أو اكتب وسماً إضافياً واضغط Enter..."
              className={styles.formInput}
            />
          </div>

          {/* Modal Actions */}
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              إلغاء
            </button>
            <button type="submit" disabled={loading || !user} className={styles.submitBtn}>
              {loading ? (
                <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
              ) : (
                <>
                  <span>نشر السؤال الآن</span>
                  <Send style={{ width: "16px", height: "16px", transform: "scaleX(-1)" }} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
