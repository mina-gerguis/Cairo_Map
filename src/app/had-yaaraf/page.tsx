"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  CommunityQuestion,
  CommunityAnswer,
  UserAnswerWithQuestion,
  ReactionType,
  CommunityViewTab,
  COMMUNITY_CATEGORIES,
  COMMUNITY_REACTIONS,
} from "@/types/community";
import {
  getCommunityQuestions,
  getCommunityQuestionById,
  getUserQuestions,
  getUserAnswers,
  createCommunityQuestion,
  createCommunityAnswer,
  toggleCommunityReaction,
  toggleBestAnswer,
  deleteCommunityQuestion,
  deleteCommunityAnswer,
} from "@/lib/community";
import CommunityStatsBanner from "@/components/community/CommunityStatsBanner";
import QuestionCard from "@/components/community/QuestionCard";
import AskQuestionModal from "@/components/community/AskQuestionModal";
import {
  Sparkles,
  Database,
  Flame,
  Clock,
  HelpCircle,
  Loader2,
  PlusCircle,
  MessageSquare,
  Award,
  CheckCircle2,
  ExternalLink,
  LogIn,
  ListFilter,
  CheckCircle,
} from "lucide-react";
import styles from "./had-yaaraf.module.css";

export default function HadYaarafPage() {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<CommunityViewTab>("feed");
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [myQuestions, setMyQuestions] = useState<CommunityQuestion[]>([]);
  const [myAnswers, setMyAnswers] = useState<UserAnswerWithQuestion[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, CommunityAnswer[]>>({});
  const [loading, setLoading] = useState(true);
  const [fromCloud, setFromCloud] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load questions and user data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { questions: qList, fromCloud: isCloud } = await getCommunityQuestions({
        category: selectedCategory,
        sort: selectedSort,
        search: searchQuery,
        currentUserId: user?.id,
      });

      setQuestions(qList);
      setFromCloud(isCloud);

      // Pre-fetch answers for questions
      const answersAcc: Record<string, CommunityAnswer[]> = {};
      await Promise.all(
        qList.map(async (q) => {
          const detail = await getCommunityQuestionById(q.id, user?.id);
          answersAcc[q.id] = detail.answers;
        })
      );
      setAnswersMap(answersAcc);

      // If user is logged in, also fetch user specific questions and answers
      if (user?.id) {
        const [userQ, userA] = await Promise.all([
          getUserQuestions(user.id),
          getUserAnswers(user.id),
        ]);
        setMyQuestions(userQ);
        setMyAnswers(userA);
      } else {
        setMyQuestions([]);
        setMyAnswers([]);
      }
    } catch (e) {
      console.error("Error loading community data:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSort, searchQuery, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Question Reaction
  const handleReactQuestion = async (questionId: string, type: ReactionType) => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للتفاعل مع السؤال. هل ترغب بالذهاب لتسجيل الدخول؟")) {
        window.location.href = "/login";
      }
      return;
    }

    const target = questions.find((q) => q.id === questionId);
    if (!target) return;

    const { nextReaction, nextCount } = await toggleCommunityReaction({
      targetType: "question",
      targetId: questionId,
      reactionType: type,
      currentReaction: target.user_reaction,
      reactionsCount: target.reactions_count,
      user,
    });

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              user_reaction: nextReaction,
              reactions_count: nextCount,
            }
          : q
      )
    );
  };

  // Handle Answer Reaction
  const handleReactAnswer = async (answerId: string, type: ReactionType) => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للتفاعل مع الرد. هل ترغب بالذهاب لتسجيل الدخول؟")) {
        window.location.href = "/login";
      }
      return;
    }

    let qId: string | null = null;
    let targetAns: CommunityAnswer | null = null;

    for (const [key, answers] of Object.entries(answersMap)) {
      const found = answers.find((a) => a.id === answerId);
      if (found) {
        qId = key;
        targetAns = found;
        break;
      }
    }

    if (!qId || !targetAns) return;

    const { nextReaction, nextCount } = await toggleCommunityReaction({
      targetType: "answer",
      targetId: answerId,
      reactionType: type,
      currentReaction: targetAns.user_reaction,
      reactionsCount: targetAns.reactions_count,
      user,
    });

    setAnswersMap((prev) => ({
      ...prev,
      [qId!]: prev[qId!].map((a) =>
        a.id === answerId
          ? {
              ...a,
              user_reaction: nextReaction,
              reactions_count: nextCount,
            }
          : a
      ),
    }));
  };

  // Handle Submit Answer (Reply)
  const handleSubmitAnswer = async (questionId: string, content: string): Promise<boolean> => {
    if (!user) {
      if (confirm("يرجى تسجيل الدخول أولاً للرد على السؤال. هل ترغب بالذهاب لصفحة الدخول؟")) {
        window.location.href = "/login";
      }
      return false;
    }

    const { answer, success } = await createCommunityAnswer({
      question_id: questionId,
      content,
      user,
      profile,
    });

    if (success) {
      setAnswersMap((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), answer],
      }));

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers_count: (q.answers_count || 0) + 1 }
            : q
        )
      );

      // Refresh my answers
      if (user?.id) {
        getUserAnswers(user.id).then((res) => setMyAnswers(res));
      }

      return true;
    }
    return false;
  };

  // Handle Mark Best Answer
  const handleToggleBestAnswer = async (
    questionId: string,
    answerId: string,
    currentStatus: boolean
  ) => {
    await toggleBestAnswer({
      questionId,
      answerId,
      currentStatus,
      user,
    });

    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || []).map((a) => {
        if (a.id === answerId) {
          return { ...a, is_best_answer: !currentStatus };
        }
        return currentStatus ? a : { ...a, is_best_answer: false };
      }),
    }));

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, is_solved: !currentStatus } : q
      )
    );

    if (user?.id) {
      getUserAnswers(user.id).then((res) => setMyAnswers(res));
    }
  };

  // Handle Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!user?.id) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا السؤال؟")) return;

    await deleteCommunityQuestion(questionId, user.id);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setMyQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  // Handle Delete Answer
  const handleDeleteAnswer = async (questionId: string, answerId: string) => {
    if (!user?.id) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الرد؟")) return;

    await deleteCommunityAnswer(answerId, questionId, user.id);
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || []).filter((a) => a.id !== answerId),
    }));

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, answers_count: Math.max(0, (q.answers_count || 0) - 1) }
          : q
      )
    );

    setMyAnswers((prev) => prev.filter((a) => a.id !== answerId));
  };

  // Handle Create Question from Modal
  const handleCreateQuestion = async (data: {
    title: string;
    content?: string;
    category: string;
    tags: string[];
    location_tag?: string;
  }): Promise<boolean> => {
    const { question, success } = await createCommunityQuestion({
      ...data,
      user,
      profile,
    });

    if (success) {
      setQuestions((prev) => [question, ...prev]);
      setMyQuestions((prev) => [question, ...prev]);
      setAnswersMap((prev) => ({ ...prev, [question.id]: [] }));
      return true;
    }
    return false;
  };

  const totalQuestions = questions.length;
  const totalAnswers = Object.values(answersMap).reduce((sum, list) => sum + list.length, 0);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
    } catch {
      return "مؤخراً";
    }
  };

  return (
    <main className={styles.pageShell}>
      <div className={styles.container}>
        {/* Hero Stats & Search Banner */}
        <CommunityStatsBanner
          totalQuestions={totalQuestions}
          totalAnswers={totalAnswers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAskModal={() => setIsModalOpen(true)}
        />

        {/* Cloud database fallback notice */}
        {!fromCloud && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "16px",
              background: "rgba(37, 99, 235, 0.12)",
              border: "1px solid rgba(37, 99, 235, 0.25)",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.85rem",
              marginBottom: "24px",
            }}
          >
            <Database style={{ width: "20px", height: "20px", flexShrink: 0 }} />
            <span>
              <strong>قاعدة بيانات سحابية (Supabase):</strong> ملف الـ SQL السحابي جاهز في المسار{" "}
              <code style={{ background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: "6px" }}>
                supabase/supabase_had_yaaraf_schema.sql
              </code>
              . شغّله في Supabase لتفعيل التزامن السحابي المباشر.
            </span>
          </div>
        )}

        {/* Primary View Tabs: "جميع الأسئلة", "أسئلتي", "أجوبتي" */}
        <div className={styles.mainViewTabs}>
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`${styles.mainViewTab} ${activeTab === "feed" ? styles.mainViewTabActive : ""}`}
          >
            <ListFilter style={{ width: "16px", height: "16px" }} />
            <span>جميع الأسئلة</span>
            {questions.length > 0 && <span className={styles.tabBadge}>{questions.length}</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my-questions")}
            className={`${styles.mainViewTab} ${activeTab === "my-questions" ? styles.mainViewTabActive : ""}`}
          >
            <HelpCircle style={{ width: "16px", height: "16px" }} />
            <span>أسئلتي</span>
            {user && myQuestions.length > 0 && (
              <span className={styles.tabBadge}>{myQuestions.length}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my-answers")}
            className={`${styles.mainViewTab} ${activeTab === "my-answers" ? styles.mainViewTabActive : ""}`}
          >
            <MessageSquare style={{ width: "16px", height: "16px" }} />
            <span>أجوبتي</span>
            {user && myAnswers.length > 0 && (
              <span className={styles.tabBadge}>{myAnswers.length}</span>
            )}
          </button>
        </div>

        {/* ── VIEW 1: FEED (جميع الأسئلة) ── */}
        {activeTab === "feed" && (
          <>
            {/* Categories Bar */}
            <div className={styles.categoryBar}>
              {COMMUNITY_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === (cat.id === "all" ? "all" : cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id === "all" ? "all" : cat.name)}
                    className={`${styles.categoryPill} ${isSelected ? styles.categoryPillActive : ""}`}
                  >
                    <i className={cat.icon} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Sorting Tabs & Action */}
            <div className={styles.sortBar}>
              <div className={styles.sortTabs}>
                <button
                  type="button"
                  onClick={() => setSelectedSort("latest")}
                  className={`${styles.sortTabBtn} ${selectedSort === "latest" ? styles.sortTabBtnActive : ""}`}
                >
                  <Clock style={{ width: "15px", height: "15px" }} />
                  <span>الأحدث</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSort("answers")}
                  className={`${styles.sortTabBtn} ${selectedSort === "answers" ? styles.sortTabBtnActive : ""}`}
                >
                  <Flame style={{ width: "15px", height: "15px", color: "#f59e0b" }} />
                  <span>الأكثر تفاعلاً</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSort("unanswered")}
                  className={`${styles.sortTabBtn} ${selectedSort === "unanswered" ? styles.sortTabBtnActive : ""}`}
                >
                  <HelpCircle style={{ width: "15px", height: "15px", color: "#60a5fa" }} />
                  <span>بانتظار إجابة</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={styles.quickAskBtn}
              >
                <PlusCircle style={{ width: "16px", height: "16px" }} />
                <span>اسأل المجتمع</span>
              </button>
            </div>

            {/* Questions Feed */}
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 20px",
                  color: "var(--text-muted)",
                  gap: "12px",
                }}
              >
                <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite", color: "var(--color-primary)" }} />
                <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>جاري تحميل أسئلة مجتمع قريب...</p>
              </div>
            ) : questions.length > 0 ? (
              <div>
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    answers={answersMap[question.id] || []}
                    currentUserId={user?.id}
                    onReactQuestion={handleReactQuestion}
                    onReactAnswer={handleReactAnswer}
                    onSubmitAnswer={handleSubmitAnswer}
                    onToggleBestAnswer={handleToggleBestAnswer}
                    onDeleteQuestion={handleDeleteQuestion}
                    onDeleteAnswer={handleDeleteAnswer}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  borderRadius: "20px",
                  border: "1px dashed var(--border-glass)",
                  background: "var(--bg-secondary)",
                }}
              >
                <HelpCircle style={{ width: "48px", height: "48px", color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-foreground)", marginBottom: "6px" }}>
                  لا توجد أسئلة تطابق البحث أو التصنيف
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 20px" }}>
                  كن أول من يطرح سؤالاً في هذا القسم وشارك استفسارك مع الآلاف من أعضاء مجتمع قريب.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={styles.askBtnPrimary}
                  style={{ margin: "0 auto" }}
                >
                  <Sparkles style={{ width: "16px", height: "16px" }} />
                  <span>طرح سؤال جديد</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── VIEW 2: "أسئلتي" (My Questions) ── */}
        {activeTab === "my-questions" && (
          <div>
            {!user ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 24px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-glass)",
                  background: "var(--cardGlassBg)",
                }}
              >
                <LogIn style={{ width: "44px", height: "44px", color: "var(--color-primary)", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>
                  سجل دخولك لعرض أسئلتك
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 20px" }}>
                  يمكنك متابعة الأسئلة التي طرحتها والردود التي وصلتك بمجرد تسجيل الدخول.
                </p>
                <Link
                  href="/login"
                  className={styles.askBtnPrimary}
                  style={{ textDecoration: "none", display: "inline-flex" }}
                >
                  تسجيل الدخول الآن
                </Link>
              </div>
            ) : myQuestions.length > 0 ? (
              <div>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                    الأسئلة التي قمت بطرحها ({myQuestions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className={styles.quickAskBtn}
                  >
                    <PlusCircle style={{ width: "15px", height: "15px" }} />
                    <span>طرح سؤال جديد</span>
                  </button>
                </div>

                {myQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    answers={answersMap[q.id] || []}
                    currentUserId={user?.id}
                    onReactQuestion={handleReactQuestion}
                    onReactAnswer={handleReactAnswer}
                    onSubmitAnswer={handleSubmitAnswer}
                    onToggleBestAnswer={handleToggleBestAnswer}
                    onDeleteQuestion={handleDeleteQuestion}
                    onDeleteAnswer={handleDeleteAnswer}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  borderRadius: "20px",
                  border: "1px dashed var(--border-glass)",
                  background: "var(--bg-secondary)",
                }}
              >
                <HelpCircle style={{ width: "44px", height: "44px", color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "6px" }}>
                  لم تطرح أي أسئلة بعد
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 20px" }}>
                  هل تبحث عن مواصلة معينة، طريقة للوصول، أو أفضل مكان للخروج؟ اسأل المجتمع الآن!
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={styles.askBtnPrimary}
                  style={{ margin: "0 auto" }}
                >
                  <Sparkles style={{ width: "16px", height: "16px" }} />
                  <span>اسأل سؤالك الأول</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 3: "أجوبتي" (My Answers) ── */}
        {activeTab === "my-answers" && (
          <div>
            {!user ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 24px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-glass)",
                  background: "var(--cardGlassBg)",
                }}
              >
                <LogIn style={{ width: "44px", height: "44px", color: "var(--color-primary)", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>
                  سجل دخولك لعرض إجاباتك
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 20px" }}>
                  تابع جميع الردود والمساعدات التي قدمتها للناس والتفاعلات التي حصلت عليها.
                </p>
                <Link
                  href="/login"
                  className={styles.askBtnPrimary}
                  style={{ textDecoration: "none", display: "inline-flex" }}
                >
                  تسجيل الدخول الآن
                </Link>
              </div>
            ) : myAnswers.length > 0 ? (
              <div>
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                    إجمالي ردودك ومشاركاتك ({myAnswers.length})
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {myAnswers.map((ans) => {
                    const totalReactions = Object.values(ans.reactions_count || {}).reduce(
                      (a, b) => a + b,
                      0
                    );

                    return (
                      <article key={ans.id} className={styles.userAnswerCard}>
                        {/* Parent Question Context Header */}
                        <div className={styles.parentQuestionHeader}>
                          <div>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                              رداً على السؤال:
                            </span>
                            <Link
                              href={`/had-yaaraf/${ans.question_id}`}
                              className={styles.parentQuestionTitle}
                            >
                              <span>{ans.question?.title || "سؤال في المجتمع"}</span>
                              <ExternalLink style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                            </Link>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {ans.question?.category && (
                              <span className={styles.categoryTag}>
                                {ans.question.category}
                              </span>
                            )}
                            {ans.is_best_answer && (
                              <span className={styles.solvedBadge} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                                <Award style={{ width: "13px", height: "13px" }} />
                                <span>أفضل إجابة</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* My Answer Body */}
                        <div className={styles.myAnswerContentBox}>
                          {ans.content}
                        </div>

                        {/* Footer / Meta */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {totalReactions > 0 && (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                <span>👍 ❤️</span>
                                <span>{totalReactions} تفاعل من المستخدمين</span>
                              </div>
                            )}

                            <span className={styles.timestamp}>
                              بتاريخ {formatDate(ans.created_at)}
                            </span>
                          </div>

                          <Link
                            href={`/had-yaaraf/${ans.question_id}`}
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "var(--color-primary)",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>عرض السؤال والردود كاملة</span>
                            <ExternalLink style={{ width: "13px", height: "13px" }} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  borderRadius: "20px",
                  border: "1px dashed var(--border-glass)",
                  background: "var(--bg-secondary)",
                }}
              >
                <MessageSquare style={{ width: "44px", height: "44px", color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "6px" }}>
                  لم تقم بالرد على أي سؤال بعد
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 20px" }}>
                  تصفح أسئلة الأعضاء وساعد الناس بمعرفتك بمواصلات القاهرة والأماكن والخدمات.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("feed")}
                  className={styles.askBtnPrimary}
                  style={{ margin: "0 auto" }}
                >
                  <ListFilter style={{ width: "16px", height: "16px" }} />
                  <span>تصفح الأسئلة المطروحة</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <AskQuestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateQuestion}
          user={user}
          profile={profile}
        />
      </div>
    </main>
  );
}
