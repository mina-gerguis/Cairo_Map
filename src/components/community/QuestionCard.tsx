"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Share2,
  MapPin,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  CommunityQuestion,
  CommunityAnswer,
  ReactionType,
  COMMUNITY_CATEGORIES,
  resolveUserAvatar,
  PRESET_AVATARS,
} from "@/types/community";
import ReactionPicker from "./ReactionPicker";
import AnswerCard from "./AnswerCard";
import styles from "@/app/had-yaaraf/had-yaaraf.module.css";

interface QuestionCardProps {
  question: CommunityQuestion;
  answers?: CommunityAnswer[];
  currentUserId?: string | null;
  onReactQuestion: (questionId: string, type: ReactionType) => void;
  onReactAnswer?: (answerId: string, type: ReactionType) => void;
  onSubmitAnswer?: (questionId: string, text: string) => Promise<boolean>;
  onToggleBestAnswer?: (questionId: string, answerId: string, currentStatus: boolean) => void;
  onDeleteQuestion?: (questionId: string) => void;
  onDeleteAnswer?: (questionId: string, answerId: string) => void;
  isDetailedView?: boolean;
}

export default function QuestionCard({
  question,
  answers = [],
  currentUserId,
  onReactQuestion,
  onReactAnswer,
  onSubmitAnswer,
  onToggleBestAnswer,
  onDeleteQuestion,
  onDeleteAnswer,
  isDetailedView = false,
}: QuestionCardProps) {
  const [showAnswers, setShowAnswers] = useState(isDetailedView);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isQuestionAuthor = Boolean(
    currentUserId && question.user_id && currentUserId === question.user_id
  );

  const categoryObj = COMMUNITY_CATEGORIES.find((c) => c.name === question.category);

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

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/had-yaaraf/${question.id}`;
      if (navigator.share) {
        await navigator.share({
          title: question.title,
          text: question.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        const url = `${window.location.origin}/had-yaaraf/${question.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim() || isSubmitting || !onSubmitAnswer) return;

    setIsSubmitting(true);
    const success = await onSubmitAnswer(question.id, newAnswerText.trim());
    if (success) {
      setNewAnswerText("");
      setShowAnswers(true);
    }
    setIsSubmitting(false);
  };

  return (
    <article className={styles.questionCard}>
      {/* Header: User Info (Avatar + Name + Username Underneath) + Badges */}
      <div className={styles.cardHeader}>
        <div className={styles.userInfoRow}>
          <div className={styles.userAvatarWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveUserAvatar(question.author_avatar, question.author_username || question.author_name)}
              alt={question.author_name}
              className={styles.avatarImg}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
              }}
            />
          </div>

          <div className={styles.userMetaCol}>
            <span className={styles.userName}>{question.author_name}</span>
            <span className={styles.userUsername}>@{question.author_username}</span>
          </div>
        </div>

        <div className={styles.badgesRow}>
          {question.is_solved && (
            <span className={styles.solvedBadge}>
              <CheckCircle style={{ width: "13px", height: "13px" }} />
              <span>تمت الإجابة</span>
            </span>
          )}

          <span className={styles.categoryTag}>
            {categoryObj?.icon && <i className={categoryObj.icon} style={{ fontSize: "11px" }} />}
            <span>{question.category}</span>
          </span>

          <span className={styles.timestamp}>{formatDate(question.created_at)}</span>

          {isQuestionAuthor && onDeleteQuestion && (
            <button
              type="button"
              onClick={() => onDeleteQuestion(question.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              title="حذف السؤال"
            >
              <Trash2 style={{ width: "16px", height: "16px" }} />
            </button>
          )}
        </div>
      </div>

      {/* Question Title & Content */}
      <Link href={`/had-yaaraf/${question.id}`} className={styles.questionTitleLink}>
        <h2 className={styles.questionTitle}>{question.title}</h2>
      </Link>

      {question.content && (
        <p className={styles.questionContent}>{question.content}</p>
      )}

      {/* Location tag & Hashtags */}
      <div className={styles.tagsAndLocation}>
        {question.location_tag && (
          <span className={styles.locationTag}>
            <MapPin style={{ width: "12px", height: "12px" }} />
            <span>{question.location_tag}</span>
          </span>
        )}

        {question.tags?.map((tag) => (
          <span key={tag} className={styles.hashtag}>
            #{tag.replace(/^#/, "")}
          </span>
        ))}
      </div>

      {/* Action Footer */}
      <div className={styles.cardActions}>
        <div className={styles.actionsGroup}>
          <ReactionPicker
            userReaction={question.user_reaction}
            reactionsCount={question.reactions_count}
            onSelectReaction={(type) => onReactQuestion(question.id, type)}
          />

          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className={styles.answersToggleBtn}
          >
            <MessageSquare style={{ width: "16px", height: "16px", color: "var(--color-primary)" }} />
            <span>
              {question.answers_count > 0
                ? `${question.answers_count} ${question.answers_count === 1 ? "إجابة" : "إجابات"}`
                : "أضف إجابة"}
            </span>
            {showAnswers ? (
              <ChevronUp style={{ width: "14px", height: "14px" }} />
            ) : (
              <ChevronDown style={{ width: "14px", height: "14px" }} />
            )}
          </button>
        </div>

        <button type="button" onClick={handleShare} className={styles.shareBtn}>
          <Share2 style={{ width: "14px", height: "14px" }} />
          <span>{copied ? "تم النسخ!" : "مشاركة"}</span>
        </button>
      </div>

      {/* Replies List */}
      {showAnswers && (
        <div className={styles.answersSection}>
          <div className={styles.answersHeader}>
            <h3 className={styles.answersTitle}>
              <span>الردود والإجابات</span>
              <span className={styles.answersCountBadge}>{answers.length}</span>
            </h3>

            {!isDetailedView && (
              <Link
                href={`/had-yaaraf/${question.id}`}
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                عرض في صفحة منفصلة
              </Link>
            )}
          </div>

          {answers.length > 0 ? (
            <div>
              {answers.map((ans) => (
                <AnswerCard
                  key={ans.id}
                  answer={ans}
                  isQuestionAuthor={isQuestionAuthor}
                  currentUserId={currentUserId}
                  onReact={(ansId, type) => onReactAnswer && onReactAnswer(ansId, type)}
                  onToggleBest={(ansId, cur) =>
                    onToggleBestAnswer && onToggleBestAnswer(question.id, ansId, cur)
                  }
                  onDelete={(ansId) =>
                    onDeleteAnswer && onDeleteAnswer(question.id, ansId)
                  }
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px 16px",
                borderRadius: "14px",
                border: "1px dashed var(--border-glass)",
                color: "var(--text-muted)",
                fontSize: "0.88rem",
              }}
            >
              لا توجد إجابات بعد على هذا السؤال. كن أول من يساعد ويجيب!
            </div>
          )}

          {/* Add Reply Form */}
          {onSubmitAnswer && (
            <form onSubmit={handleAnswerSubmit} className={styles.replyForm}>
              <div className={styles.replyInputWrapper}>
                <textarea
                  value={newAnswerText}
                  onChange={(e) => setNewAnswerText(e.target.value)}
                  placeholder="اكتب ردك أو نصيحتك هنا... (بيظهر اسمك وصورتك والـ username)"
                  rows={2}
                  className={styles.replyTextarea}
                />
                <button
                  type="submit"
                  disabled={!newAnswerText.trim() || isSubmitting}
                  className={styles.replySendBtn}
                >
                  {isSubmitting ? (
                    <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <>
                      <span>رد</span>
                      <Send style={{ width: "14px", height: "14px", transform: "scaleX(-1)" }} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
