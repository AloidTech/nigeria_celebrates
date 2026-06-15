import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionWithOptions, QuizCategory, Quiz } from "@/lib/database_types/quiz_types";
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export type { QuizCategory };

type LeaderboardJoinedRow = {
  score: number;
  user_id: string;
  quiz: {
    category: QuizCategory;
  } | null;
  profile?: {
    handle: string;
    avatar_url: string | null;
  } | null;
};

export type CategoryChampion = {
  category: QuizCategory;
  userId: string;
  topScore: number;
  participantName: string;
  avatarUrl: string | null;
};

export type LeaderboardEntryData = {
  rank: number;
  name: string;
  score: number;
  streak: string;
  userId: string;
};

export async function getCategoryChampions(
  supabase: SupabaseClient,
): Promise<CategoryChampion[]> {
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("score,user_id,quiz:quizzes!inner(category)")
    .order("score", { ascending: false });

  if (error) {
    console.warn("Failed to fetch category champions:", error);
    return [];
  }

  const rows = (data ?? []) as any[];

  // Fetch profiles separately because there's no direct FK between leaderboard_entries and profiles
  const userIds = [...new Set(rows.map(d => d.user_id))];
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, handle, avatar_url")
    .in("id", userIds);
    
  const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

  const topByCategory = new Map<QuizCategory, CategoryChampion>();

  for (const row of rows) {
    if (!row.quiz?.category) {
      continue;
    }

    if (!topByCategory.has(row.quiz.category)) {
      const profile = profileMap.get(row.user_id);
      topByCategory.set(row.quiz.category, {
        category: row.quiz.category,
        userId: row.user_id,
        topScore: row.score,
        participantName: profile?.handle || "Anonymous",
        avatarUrl: profile?.avatar_url || null,
      });
    }
  }

  return Array.from(topByCategory.values());
}

export async function getLeaderboard(
  supabase: SupabaseClient,
  limit: number = 10
): Promise<LeaderboardEntryData[]> {
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("score,user_id")
    .order("score", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.warn("Failed to fetch leaderboard:", error);
    return [];
  }

  // Fetch profiles separately
  const userIds = [...new Set(data.map(d => d.user_id))];
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, handle")
    .in("id", userIds);
    
  const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

  return data.map((row, idx: number) => {
    const profile = profileMap.get(row.user_id);
    
    return {
      rank: idx + 1,
      name: profile?.handle || "Anonymous",
      score: row.score,
      streak: "Active", // Streak logic not implemented in schema yet
      userId: row.user_id,
    };
  });
}

export async function getShortQuizByCategory(
  supabase: SupabaseClient,
  category: QuizCategory,
): Promise<QuestionWithOptions[]> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*, options!options_question_id_fkey(*)")
      .eq("category", category)
      .limit(50); // Fetch up to 50 questions

    if (error || !data || data.length === 0) {
      console.warn("No questions found in database");
      return [];
    }

    // Shuffle and pick 5 random questions
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    return selected as QuestionWithOptions[];
  } catch (err) {
    console.error("Failed to fetch from database:", err);
    return [];
  }
}


export async function getWeeklyQuiz(supabase: SupabaseClient): Promise<{ quizData: Quiz | null, err: Error | null }> {
  try {
    // Fetch the most recent weekly quiz that is either active or scheduled.
    // 'active' takes priority over 'scheduled' via created_at ordering.
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes_resolved")
      .select("*")
      .eq("quiz_type", "weekly")
      .in("status", ["scheduled", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (quizError) {
      return { quizData: null, err: quizError };
    }
    if (!quizData) {
      return { quizData: null, err: new Error("No active or scheduled weekly quiz found in database") };
    }

    return { quizData, err: null };
  } catch (err) {
    return { quizData: null, err: err as Error };
  }
}

export async function getWeeklyQuestions(supabase: SupabaseClient): Promise<{ quizQuestions: QuestionWithOptions[], err: Error | null }> {
  try {
    const { quizData, err } = await getWeeklyQuiz(supabase);

    if (err || !quizData) {
      throw new Error("No weekly quiz scheduled")
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*, options!options_question_id_fkey(*)")
      .eq("category", quizData.category)
      .limit(5);

    if (questionsError || !questionsData || questionsData.length === 0) {
      console.warn("No questions found for the weekly quiz category:", quizData.category, questionsError);
      return { quizQuestions: [], err: questionsError };
    }

    return { quizQuestions: questionsData as QuestionWithOptions[], err: null };
  } catch (err) {
    console.error("Failed to fetch weekly quiz questions:", err);
    return { quizQuestions: [], err: err as Error };
  }
}

export function useLiveWeeklyQuiz() {
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // 1. Initial fetch using your centralized query
    const fetchInitialData = async () => {
      setLoading(true);
      const { quizData: fetchedQuiz } = await getWeeklyQuiz(supabase);
      setQuizData(fetchedQuiz);
      setLoading(false);
    };

    fetchInitialData();

    // 2. Set up realtime listener
    const channel = supabase
      .channel('public:quizzes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quizzes' },
        () => {
          // 3. When a change happens, re-run your centralized fetch function!
          console.log('Quiz changed! Re-fetching data...');
          fetchInitialData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { quizData, loading };
}

