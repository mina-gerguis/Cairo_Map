"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Award, Trash2 } from "lucide-react";
import { CommunityAnswer, ReactionType, resolveUserAvatar, PRESET_AVATARS } from "@/types/community";
import ReactionPicker from "./ReactionPicker";
import styles from "@/app/had-yaaraf/had-yaaraf.module.css";

interface AnswerCardProps {
  answer: CommunityAnswer;
  isQuestionAuthor: boolean;
  currentUserId?: string | null;
  onReact: (answerId: string, type: ReactionType) => void;
  onToggleBest?: (answerId: string, currentStatus: boolean) => void;
  onDelete?: (answerId: string) => void;
}

export default function AnswerCard({
  answer,
  isQuestionAuthor,
  currentUserId,
  onReact,
  onToggleBest,
  onDelete,
}: AnswerCardProps) {
  const [imageError, setImageError] = useState(false);
  const isAuthor = currentUserId && answer.user_id && currentUserId === answer.user_id;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return "الآن";
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return "أمس";
      if (diffDays < 7) return `منذ ${diffDays} أيام`;
      return date.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
    } catch {
      return "مؤخراً";
    }
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={`${styles.answerCard} ${answer.is_best_answer ? styles.answerCardBest : ""}`}
    >
      {/* Best Answer Badge */}
      {answer.is_best_answer && (
        <div className={styles.bestAnswerBadge}>
          <Award style={{ width: "14px", height: "14px" }} />
          <span>أفضل إجابة مختارة</span>
          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
        </div>
      )}

      {/* Answer Header: Avatar + Full Name + Username underneath */}
      <div className={styles.answerHeader}>
        <div className={styles.userInfoRow}>
          {/* Avatar (صورة المستخدم) */}
          <div className={styles.userAvatarWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveUserAvatar(answer.author_avatar, answer.author_username || answer.author_name)}
              alt={answer.author_name}
              className={styles.avatarImg}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
              }}
            />
          </div>

          {/* Name & Username Underneath (اسمه والـ username تحت اسمه) */}
          <div className={styles.userMetaCol}>
            <span className={styles.userName}>{answer.author_name}</span>
            <span className={styles.userUsername}>@{answer.author_username}</span>
          </div>
        </div>

        {/* Date & Delete */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={styles.timestamp}>{formatDate(answer.created_at)}</span>

          {isAuthor && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(answer.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              title="حذف الرد"
            >
              <Trash2 style={{ width: "16px", height: "16px" }} />
            </button>
          )}
        </div>
      </div>

      {/* Reply Body */}
      <div className={styles.answerContent}>{answer.content}</div>

      {/* Answer Actions */}
      <div className={styles.answerActions}>
        <ReactionPicker
          size="sm"
          userReaction={answer.user_reaction}
          reactionsCount={answer.reactions_count}
          onSelectReaction={(type) => onReact(answer.id, type)}
        />

        {isQuestionAuthor && onToggleBest && (
          <button
            type="button"
            onClick={() => onToggleBest(answer.id, answer.is_best_answer)}
            className={styles.markBestBtn}
          >
            <CheckCircle2 style={{ width: "14px", height: "14px" }} />
            <span>
              {answer.is_best_answer ? "إلغاء اختيار كأفضل إجابة" : "اختيار كأفضل إجابة"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
