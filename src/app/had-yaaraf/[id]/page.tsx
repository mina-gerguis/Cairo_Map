"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CommunityQuestion,
  CommunityAnswer,
  ReactionType,
} from "@/types/community";
import {
  getCommunityQuestionById,
  createCommunityAnswer,
  toggleCommunityReaction,
  toggleBestAnswer,
  deleteCommunityQuestion,
  deleteCommunityAnswer,
} from "@/lib/community";
import QuestionCard from "@/components/community/QuestionCard";
import { ArrowRight, Loader2, HelpCircle } from "lucide-react";
import styles from "../had-yaaraf.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SingleQuestionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const questionId = resolvedParams.id;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [question, setQuestion] = useState<CommunityQuestion | null>(null);
  const [answers, setAnswers] = useState<CommunityAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestionData = useCallback(async () => {
    setLoading(true);
    try {
      const { question: q, answers: aList } = await getCommunityQuestionById(
        questionId,
        user?.id
      );
      setQuestion(q);
      setAnswers(aList);
    } catch (e) {
      console.error("Error loading question detail:", e);
    } finally {
      setLoading(false);
    }
  }, [questionId, user?.id]);

  useEffect(() => {
    loadQuestionData();
  }, [loadQuestionData]);

  const handleReactQuestion = async (qId: string, type: ReactionType) => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للتفاعل مع السؤال. هل ترغب بالذهاب لتسجيل الدخول؟")) {
        window.location.href = "/login";
      }
      return;
    }

    if (!question) return;

    const { nextReaction, nextCount } = await toggleCommunityReaction({
      targetType: "question",
      targetId: qId,
      reactionType: type,
      currentReaction: question.user_reaction,
      reactionsCount: question.reactions_count,
      user,
    });

    setQuestion({
      ...question,
      user_reaction: nextReaction,
      reactions_count: nextCount,
    });
  };

  const handleReactAnswer = async (answerId: string, type: ReactionType) => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للتفاعل مع الرد. هل ترغب بالذهاب لتسجيل الدخول؟")) {
        window.location.href = "/login";
      }
      return;
    }

    const target = answers.find((a) => a.id === answerId);
    if (!target) return;

    const { nextReaction, nextCount } = await toggleCommunityReaction({
      targetType: "answer",
      targetId: answerId,
      reactionType: type,
      currentReaction: target.user_reaction,
      reactionsCount: target.reactions_count,
      user,
    });

    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? {
              ...a,
              user_reaction: nextReaction,
              reactions_count: nextCount,
            }
          : a
      )
    );
  };

  const handleSubmitAnswer = async (qId: string, content: string): Promise<boolean> => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للرد على السؤال. هل ترغب بالذهاب لصفحة الدخول؟")) {
        window.location.href = "/login";
      }
      return false;
    }

    const { answer, success } = await createCommunityAnswer({
      question_id: qId,
      content,
      user,
      profile,
    });

    if (success) {
      setAnswers((prev) => [...prev, answer]);
      if (question) {
        setQuestion({
          ...question,
          answers_count: (question.answers_count || 0) + 1,
        });
      }
      return true;
    }
    return false;
  };

  const handleToggleBestAnswer = async (
    qId: string,
    answerId: string,
    currentStatus: boolean
  ) => {
    await toggleBestAnswer({
      questionId: qId,
      answerId,
      currentStatus,
      user,
    });

    setAnswers((prev) =>
      prev.map((a) => {
        if (a.id === answerId) {
          return { ...a, is_best_answer: !currentStatus };
        }
        return currentStatus ? a : { ...a, is_best_answer: false };
      })
    );

    if (question) {
      setQuestion({ ...question, is_solved: !currentStatus });
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!user?.id) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا السؤال؟")) return;

    await deleteCommunityQuestion(qId, user.id);
    router.push("/had-yaaraf");
  };

  const handleDeleteAnswer = async (qId: string, answerId: string) => {
    if (!user?.id) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الرد؟")) return;

    await deleteCommunityAnswer(answerId, qId, user.id);
    setAnswers((prev) => prev.filter((a) => a.id !== answerId));
    if (question) {
      setQuestion({
        ...question,
        answers_count: Math.max(0, (question.answers_count || 0) - 1),
      });
    }
  };

  return (
    <main className={styles.pageShell}>
      <div className={styles.container} style={{ maxWidth: "780px" }}>
        {/* Back Link */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            href="/had-yaaraf"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            <ArrowRight style={{ width: "16px", height: "16px" }} />
            <span>العودة لجميع أسئلة مجتمع "حد يعرف؟"</span>
          </Link>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 20px",
              color: "var(--text-muted)",
              gap: "12px",
            }}
          >
            <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
            <p style={{ fontSize: "0.95rem" }}>جاري جلب تفاصيل السؤال والردود...</p>
          </div>
        ) : question ? (
          <QuestionCard
            question={question}
            answers={answers}
            currentUserId={user?.id}
            onReactQuestion={handleReactQuestion}
            onReactAnswer={handleReactAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onToggleBestAnswer={handleToggleBestAnswer}
            onDeleteQuestion={handleDeleteQuestion}
            onDeleteAnswer={handleDeleteAnswer}
            isDetailedView={true}
          />
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              borderRadius: "20px",
              border: "1px solid var(--border-glass)",
              background: "var(--cardGlassBg)",
            }}
          >
            <HelpCircle style={{ width: "48px", height: "48px", color: "var(--text-muted)", margin: "0 auto 12px" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-foreground)", marginBottom: "8px" }}>
              السؤال غير موجود أو قد تم حذفه
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px" }}>
              ربما تم حذف السؤال بواسطة صاحبه أو نقل الرابط.
            </p>
            <Link
              href="/had-yaaraf"
              className={styles.askBtnPrimary}
              style={{ textDecoration: "none", display: "inline-flex" }}
            >
              تصفح أسئلة المجتمع
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
