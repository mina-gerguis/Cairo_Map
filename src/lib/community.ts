import { supabase } from "@/lib/supabase";
import {
  CommunityQuestion,
  CommunityAnswer,
  UserAnswerWithQuestion,
  ReactionType,
  resolveUserAvatar,
} from "@/types/community";

// Local storage keys
const STORAGE_QUESTIONS_KEY = "dftry_had_yaaraf_questions";
const STORAGE_ANSWERS_KEY = "dftry_had_yaaraf_answers";

export const SEED_QUESTIONS: CommunityQuestion[] = [];
export const SEED_ANSWERS: Record<string, CommunityAnswer[]> = {};

const DUMMY_IDS = [
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
  "33333333-3333-3333-3333-333333333333",
  "44444444-4444-4444-4444-444444444444",
];

function getLocalQuestions(): CommunityQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_QUESTIONS_KEY);
    if (raw) {
      const parsed: CommunityQuestion[] = JSON.parse(raw);
      const filtered = parsed.filter((q) => !DUMMY_IDS.includes(q.id));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
  } catch {}
  return [];
}

function saveLocalQuestions(items: CommunityQuestion[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(items));
  } catch {}
}

function getLocalAnswers(qId: string): CommunityAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_ANSWERS_KEY}_${qId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveLocalAnswers(qId: string, items: CommunityAnswer[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_ANSWERS_KEY}_${qId}`, JSON.stringify(items));
  } catch {}
}

// ── 1. Fetch Questions ──
export async function getCommunityQuestions({
  category = "all",
  sort = "latest",
  search = "",
  currentUserId = null,
}: {
  category?: string;
  sort?: string;
  search?: string;
  currentUserId?: string | null;
} = {}): Promise<{ questions: CommunityQuestion[]; fromCloud: boolean }> {
  if (supabase) {
    try {
      let query = supabase.from("community_questions").select("*");

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(`title.ilike.${s},content.ilike.${s},location_tag.ilike.${s}`);
      }

      if (sort === "latest") {
        query = query.order("created_at", { ascending: false });
      } else if (sort === "answers") {
        query = query.order("answers_count", { ascending: false });
      } else if (sort === "unanswered") {
        query = query.eq("answers_count", 0).order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (!error && data !== null) {
        const realData = data.filter((item) => !DUMMY_IDS.includes(item.id));

        let userReactionsMap: Record<string, ReactionType> = {};

        if (currentUserId && realData.length > 0) {
          const qIds = realData.map((q) => q.id);
          const { data: userReactions } = await supabase
            .from("community_reactions")
            .select("target_id, reaction_type")
            .eq("target_type", "question")
            .eq("user_id", currentUserId)
            .in("target_id", qIds);

          if (userReactions) {
            userReactions.forEach((r) => {
              userReactionsMap[r.target_id] = r.reaction_type as ReactionType;
            });
          }
        }

        const questions: CommunityQuestion[] = realData.map((item) => ({
          ...item,
          author_avatar: resolveUserAvatar(item.author_avatar, item.author_username),
          reactions_count: item.reactions_count || {
            like: 0,
            dislike: 0,
            laugh: 0,
            love: 0,
            sad: 0,
            angry: 0,
          },
          user_reaction: userReactionsMap[item.id] || null,
        }));

        return { questions, fromCloud: true };
      }
    } catch (e) {
      console.warn("Supabase community_questions fetch error, falling back:", e);
    }
  }

  // Fallback to local
  let list = getLocalQuestions();

  if (category && category !== "all") {
    list = list.filter((q) => q.category === category);
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    list = list.filter(
      (q) =>
        q.title.toLowerCase().includes(term) ||
        (q.content && q.content.toLowerCase().includes(term)) ||
        (q.location_tag && q.location_tag.toLowerCase().includes(term)) ||
        q.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  if (sort === "latest") {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === "answers") {
    list.sort((a, b) => b.answers_count - a.answers_count);
  } else if (sort === "unanswered") {
    list = list.filter((q) => q.answers_count === 0);
  }

  return { questions: list, fromCloud: false };
}

// ── 2. Fetch Single Question + Answers ──
export async function getCommunityQuestionById(
  id: string,
  currentUserId?: string | null
): Promise<{ question: CommunityQuestion | null; answers: CommunityAnswer[]; fromCloud: boolean }> {
  if (supabase) {
    try {
      const { data: qData, error: qErr } = await supabase
        .from("community_questions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!qErr && qData) {
        supabase
          .from("community_questions")
          .update({ views_count: (qData.views_count || 0) + 1 })
          .eq("id", id)
          .then();

        const { data: aData } = await supabase
          .from("community_answers")
          .select("*")
          .eq("question_id", id)
          .order("is_best_answer", { ascending: false })
          .order("created_at", { ascending: true });

        let questionReaction: ReactionType | null = null;
        let answerReactionsMap: Record<string, ReactionType> = {};

        if (currentUserId) {
          const { data: qReact } = await supabase
            .from("community_reactions")
            .select("reaction_type")
            .eq("target_type", "question")
            .eq("target_id", id)
            .eq("user_id", currentUserId)
            .maybeSingle();
          if (qReact) questionReaction = qReact.reaction_type as ReactionType;

          if (aData && aData.length > 0) {
            const aIds = aData.map((a) => a.id);
            const { data: aReacts } = await supabase
              .from("community_reactions")
              .select("target_id, reaction_type")
              .eq("target_type", "answer")
              .eq("user_id", currentUserId)
              .in("target_id", aIds);

            if (aReacts) {
              aReacts.forEach((r) => {
                answerReactionsMap[r.target_id] = r.reaction_type as ReactionType;
              });
            }
          }
        }

        const question: CommunityQuestion = {
          ...qData,
          author_avatar: resolveUserAvatar(qData.author_avatar, qData.author_username),
          views_count: (qData.views_count || 0) + 1,
          reactions_count: qData.reactions_count || {
            like: 0,
            dislike: 0,
            laugh: 0,
            love: 0,
            sad: 0,
            angry: 0,
          },
          user_reaction: questionReaction,
        };

        const answers: CommunityAnswer[] = (aData || []).map((ans) => ({
          ...ans,
          author_avatar: resolveUserAvatar(ans.author_avatar, ans.author_username),
          reactions_count: ans.reactions_count || {
            like: 0,
            dislike: 0,
            laugh: 0,
            love: 0,
            sad: 0,
            angry: 0,
          },
          user_reaction: answerReactionsMap[ans.id] || null,
        }));

        return { question, answers, fromCloud: true };
      }
    } catch (e) {
      console.warn("Supabase question detail fetch failed, using fallback:", e);
    }
  }

  // Fallback
  const allQ = getLocalQuestions();
  const foundQ = allQ.find((q) => q.id === id);
  if (!foundQ) return { question: null, answers: [], fromCloud: false };

  const answers = getLocalAnswers(id);
  return { question: foundQ, answers, fromCloud: false };
}

// ── 3. Post a Question ──
export async function createCommunityQuestion({
  title,
  content,
  category,
  tags,
  location_tag,
  user,
  profile,
}: {
  title: string;
  content?: string;
  category: string;
  tags?: string[];
  location_tag?: string;
  user: any;
  profile: any;
}): Promise<{ question: CommunityQuestion; success: boolean }> {
  const authorName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "مستخدم قريب";
  const authorUsername =
    profile?.username ||
    user?.user_metadata?.preferred_username ||
    user?.email?.split("@")[0] ||
    `user_${Math.random().toString(36).substring(2, 7)}`;
  const authorAvatar = resolveUserAvatar(
    profile?.avatar_url || user?.user_metadata?.avatar_url,
    authorUsername
  );

  const newQuestion: CommunityQuestion = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `q_${Date.now()}`,
    user_id: user?.id || null,
    author_name: authorName,
    author_username: authorUsername,
    author_avatar: authorAvatar,
    title: title.trim(),
    content: content?.trim() || "",
    category,
    tags: tags || [],
    location_tag: location_tag || null,
    is_solved: false,
    views_count: 0,
    answers_count: 0,
    reactions_count: {
      like: 0,
      dislike: 0,
      laugh: 0,
      love: 0,
      sad: 0,
      angry: 0,
    },
    created_at: new Date().toISOString(),
  };

  if (supabase && user?.id) {
    try {
      const { data, error } = await supabase
        .from("community_questions")
        .insert({
          user_id: user.id,
          author_name: authorName,
          author_username: authorUsername,
          author_avatar: authorAvatar,
          title: newQuestion.title,
          content: newQuestion.content,
          category: newQuestion.category,
          tags: newQuestion.tags,
          location_tag: newQuestion.location_tag,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          question: {
            ...data,
            author_avatar: resolveUserAvatar(data.author_avatar, data.author_username),
          } as CommunityQuestion,
          success: true,
        };
      }
    } catch (e) {
      console.warn("Supabase insert question error:", e);
    }
  }

  const currentList = getLocalQuestions();
  const updatedList = [newQuestion, ...currentList];
  saveLocalQuestions(updatedList);
  return { question: newQuestion, success: true };
}

// ── 4. Post an Answer (Reply) ──
export async function createCommunityAnswer({
  question_id,
  content,
  user,
  profile,
}: {
  question_id: string;
  content: string;
  user: any;
  profile: any;
}): Promise<{ answer: CommunityAnswer; success: boolean }> {
  const authorName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "مستخدم قريب";
  const authorUsername =
    profile?.username ||
    user?.user_metadata?.preferred_username ||
    user?.email?.split("@")[0] ||
    `user_${Math.random().toString(36).substring(2, 7)}`;
  const authorAvatar = resolveUserAvatar(
    profile?.avatar_url || user?.user_metadata?.avatar_url,
    authorUsername
  );

  const newAnswer: CommunityAnswer = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `a_${Date.now()}`,
    question_id,
    user_id: user?.id || null,
    author_name: authorName,
    author_username: authorUsername,
    author_avatar: authorAvatar,
    content: content.trim(),
    is_best_answer: false,
    reactions_count: {
      like: 0,
      dislike: 0,
      laugh: 0,
      love: 0,
      sad: 0,
      angry: 0,
    },
    created_at: new Date().toISOString(),
  };

  if (supabase && user?.id) {
    try {
      const { data, error } = await supabase
        .from("community_answers")
        .insert({
          question_id,
          user_id: user.id,
          author_name: authorName,
          author_username: authorUsername,
          author_avatar: authorAvatar,
          content: newAnswer.content,
        })
        .select()
        .single();

      if (!error && data) {
        try {
          const { count } = await supabase
            .from("community_answers")
            .select("*", { count: "exact", head: true })
            .eq("question_id", question_id);
          if (count !== null) {
            await supabase
              .from("community_questions")
              .update({ answers_count: count })
              .eq("id", question_id);
          }
        } catch {}

        return {
          answer: {
            ...data,
            author_avatar: resolveUserAvatar(data.author_avatar, data.author_username),
          } as CommunityAnswer,
          success: true,
        };
      }
    } catch (e) {
      console.warn("Supabase insert answer error:", e);
    }
  }

  const currentAnswers = getLocalAnswers(question_id);
  const updatedAnswers = [...currentAnswers, newAnswer];
  saveLocalAnswers(question_id, updatedAnswers);

  const questions = getLocalQuestions();
  const qIdx = questions.findIndex((q) => q.id === question_id);
  if (qIdx !== -1) {
    questions[qIdx].answers_count = (questions[qIdx].answers_count || 0) + 1;
    saveLocalQuestions(questions);
  }

  return { answer: newAnswer, success: true };
}

// ── 5. User Specific: "أسئلتي" (My Questions) ──
export async function getUserQuestions(userId: string): Promise<CommunityQuestion[]> {
  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from("community_questions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((q) => ({
          ...q,
          author_avatar: resolveUserAvatar(q.author_avatar, q.author_username),
          reactions_count: q.reactions_count || {
            like: 0,
            dislike: 0,
            laugh: 0,
            love: 0,
            sad: 0,
            angry: 0,
          },
        }));
      }
    } catch (e) {
      console.warn("Error fetching user questions:", e);
    }
  }

  return getLocalQuestions().filter((q) => q.user_id === userId);
}

// ── 6. User Specific: "أجوبتي" (My Answers) ──
export async function getUserAnswers(userId: string): Promise<UserAnswerWithQuestion[]> {
  if (supabase && userId) {
    try {
      const { data: answersData, error } = await supabase
        .from("community_answers")
        .select("*, community_questions(id, title, category, is_solved)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && answersData) {
        return answersData.map((item: any) => ({
          ...item,
          author_avatar: resolveUserAvatar(item.author_avatar, item.author_username),
          question: item.community_questions || null,
        }));
      }
    } catch (e) {
      console.warn("Error fetching user answers from supabase:", e);
    }
  }

  // Fallback to local
  const questions = getLocalQuestions();
  const result: UserAnswerWithQuestion[] = [];
  questions.forEach((q) => {
    const qAnswers = getLocalAnswers(q.id);
    qAnswers.forEach((a) => {
      if (a.user_id === userId) {
        result.push({
          ...a,
          author_avatar: resolveUserAvatar(a.author_avatar, a.author_username),
          question: {
            id: q.id,
            title: q.title,
            category: q.category,
            is_solved: q.is_solved,
          },
        });
      }
    });
  });
  return result;
}

// ── 7. Toggle Reaction ──
export async function toggleCommunityReaction({
  targetType,
  targetId,
  reactionType,
  currentReaction,
  reactionsCount,
  user,
}: {
  targetType: "question" | "answer";
  targetId: string;
  reactionType: ReactionType;
  currentReaction?: ReactionType | null;
  reactionsCount: Record<ReactionType, number>;
  user: any;
}): Promise<{
  nextReaction: ReactionType | null;
  nextCount: Record<ReactionType, number>;
}> {
  const nextCount = { ...reactionsCount };
  let nextReaction: ReactionType | null = null;

  if (currentReaction === reactionType) {
    nextReaction = null;
    nextCount[reactionType] = Math.max(0, (nextCount[reactionType] || 0) - 1);
  } else {
    if (currentReaction) {
      nextCount[currentReaction] = Math.max(0, (nextCount[currentReaction] || 0) - 1);
    }
    nextReaction = reactionType;
    nextCount[reactionType] = (nextCount[reactionType] || 0) + 1;
  }

  if (supabase && user?.id) {
    try {
      if (nextReaction === null) {
        await supabase
          .from("community_reactions")
          .delete()
          .eq("target_type", targetType)
          .eq("target_id", targetId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("community_reactions").upsert(
          {
            target_type: targetType,
            target_id: targetId,
            user_id: user.id,
            reaction_type: nextReaction,
          },
          { onConflict: "target_type,target_id,user_id" }
        );
      }

      const targetTable = targetType === "question" ? "community_questions" : "community_answers";
      await supabase.from(targetTable).update({ reactions_count: nextCount }).eq("id", targetId);
    } catch (e) {
      console.warn("Supabase reaction sync error:", e);
    }
  }

  return { nextReaction, nextCount };
}

// ── 8. Mark Best Answer ──
export async function toggleBestAnswer({
  questionId,
  answerId,
  currentStatus,
  user,
}: {
  questionId: string;
  answerId: string;
  currentStatus: boolean;
  user: any;
}): Promise<boolean> {
  const nextStatus = !currentStatus;

  if (supabase && user?.id) {
    try {
      if (nextStatus) {
        await supabase
          .from("community_answers")
          .update({ is_best_answer: false })
          .eq("question_id", questionId);
      }

      await supabase
        .from("community_answers")
        .update({ is_best_answer: nextStatus })
        .eq("id", answerId);

      await supabase
        .from("community_questions")
        .update({ is_solved: nextStatus })
        .eq("id", questionId);

      return true;
    } catch (e) {
      console.warn("Supabase best answer error:", e);
    }
  }

  const answers = getLocalAnswers(questionId);
  answers.forEach((a) => {
    if (a.id === answerId) {
      a.is_best_answer = nextStatus;
    } else if (nextStatus) {
      a.is_best_answer = false;
    }
  });
  saveLocalAnswers(questionId, answers);

  const questions = getLocalQuestions();
  const q = questions.find((item) => item.id === questionId);
  if (q) {
    q.is_solved = nextStatus;
    saveLocalQuestions(questions);
  }

  return true;
}

// ── 9. Delete Question ──
export async function deleteCommunityQuestion(id: string, userId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("community_questions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (!error) return true;
    } catch {}
  }
  const questions = getLocalQuestions().filter((q) => q.id !== id);
  saveLocalQuestions(questions);
  return true;
}

// ── 10. Delete Answer ──
export async function deleteCommunityAnswer(
  id: string,
  questionId: string,
  userId: string
): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("community_answers")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (!error) return true;
    } catch {}
  }
  const answers = getLocalAnswers(questionId).filter((a) => a.id !== id);
  saveLocalAnswers(questionId, answers);
  return true;
}
