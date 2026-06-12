import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionWithOptions, QuizCategory, DifficultyLevel, Quiz } from "@/lib/database_types/quiz_types";
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient, signUp } from '@/lib/supabase/client';
import { error } from "console";

export type { QuizCategory };

type LeaderboardJoinedRow = {
  score: number;
  user_id: string;
  quiz: {
    category: QuizCategory;
  } | null;
};

export type CategoryChampion = {
  category: QuizCategory;
  userId: string;
  topScore: number;
};

//-- ----------------------------------------------------------------------------
//-- AUTH
//-- ----------------------------------------------------------------------------
export async function signUpUser(supabase: SupabaseClient, email: string, password: string, name: string[], birthday: string) {

  try {
    const { data, error } = await signUp(supabase, email, password);

    if (error) {
      throw error;
    }

    const { profile, error: profileError } = await createProfile(supabase, data.user?.id, email, name, birthday);

    if (profileError) {
      throw profileError;
    }

    return { data, profile };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function createProfile(supabase: SupabaseClient, id: string, email: string, name: string[], birthday: string) {
  const profile: Profile = {
    id,
    email,
    first_name: name[0],
    last_name: name[1],
    birthday,
  }
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile);
  if (error) {
    return { profile: null, error };
  }
  return { profile: data, error: null };
}

//-- ----------------------------------------------------------------------------
//-- QUIZ
//-- ----------------------------------------------------------------------------

export async function getCategoryChampions(
  supabase: SupabaseClient,
): Promise<CategoryChampion[]> {
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("score,user_id,quiz:quizzes!inner(category)")
    .order("score", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as LeaderboardJoinedRow[];
  const topByCategory = new Map<QuizCategory, CategoryChampion>();

  for (const row of rows) {
    if (!row.quiz?.category) {
      continue;
    }

    if (!topByCategory.has(row.quiz.category)) {
      topByCategory.set(row.quiz.category, {
        category: row.quiz.category,
        userId: row.user_id,
        topScore: row.score,
      });
    }
  }

  return Array.from(topByCategory.values());
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
      .limit(5);

    if (error || !data || data.length === 0) {
      console.warn("No questions found in database");
      return [];
    }

    return data as QuestionWithOptions[];
  } catch (err) {
    console.error("Failed to fetch from database:", err);
    return [];
  }
}


export async function getWeeklyQuiz(supabase: SupabaseClient): Promise<{ quizData: Quiz | null, err: Error | null }> {
  try {
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes_resolved")
      .select("*")
      .eq("quiz_type", "weekly")
      .eq("status", "scheduled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (quizError) {
      return { quizData: null, err: quizError };
    }
    if (!quizData) {
      return { quizData: null, err: new Error("No scheduled weekly quiz found in database") };
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

