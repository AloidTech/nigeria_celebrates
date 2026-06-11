// ----------------------------------------------------------------------------
// NIGERIA CELEBRATES - RELATIONAL SQL QUIZ TYPES (NEW)
// ----------------------------------------------------------------------------

export type QuizCategory = "music" | "movies" | "geography" | "art";
export type DifficultyLevel = "easy" | "moderate" | "difficult";
export type QuizStatus = "active" | "ended" | "scheduled";
export type QuizType = "demo" | "weekly";
export type SessionStatus = "in_progress" | "completed" | "timed_out";
export type DurationMs = number;

export interface DifficultyDistribution {
  level: DifficultyLevel;
  question_amount: number;
}

export interface Quiz {
  id: string; // UUID primary key
  title: string;
  category: QuizCategory;
  quiz_type: QuizType;
  start_time: string;
  end_time: string;
  quiz_duration: DurationMs; // in milliseconds
  question_amount: number;
  difficulty_distribution?: DifficultyDistribution[] | null;
  status: QuizStatus;
  created_at?: string;
}

export interface GeneralQuizSettings {
  quiz_duration: DurationMs;
  question_amount: number;
  difficulty_distribution: DifficultyDistribution[];
  start_time: string;
  end_time: string;
}

export interface Question {
  id: string; // UUID primary key
  question_text: string;
  context?: string | null;
  correct_option_id?: string | null; // UUID referencing options.id
  explanation?: string | null;
  difficulty: DifficultyLevel;
  category: QuizCategory;
  created_at?: string;
}

export interface Option {
  id: string; // UUID primary key
  question_id: string; // UUID referencing questions.id
  option_text: string;
  created_at?: string;
}

export interface QuestionWithOptions extends Question {
  options: Option[];
}

export interface QuizSession {
  id: string; // UUID primary key
  user_id: string; // UUID referencing auth.users.id
  quiz_id: string; // UUID referencing quizzes.id
  started_at: string;
  ended_at?: string | null;
  status: SessionStatus;
  generated_question_ids: string[]; // UUID[]
  score?: number | null;
  created_at?: string;
}

export interface SessionQuestion {
  id: string; // UUID primary key
  session_id: string; // UUID referencing quiz_sessions.id
  question_id: string; // UUID referencing questions.id
  selected_option_id?: string | null; // UUID referencing options.id
  is_correct?: boolean | null;
  answered_at?: string | null;
}

export interface QuizResult {
  id: string; // UUID primary key
  session_id: string; // UUID referencing quiz_sessions.id (unique)
  user_id: string; // UUID referencing auth.users.id
  quiz_id: string; // UUID referencing quizzes.id
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
  completed_at: string;
}

export interface LeaderboardEntry {
  id: string; // UUID primary key
  quiz_id: string; // UUID referencing quizzes.id
  user_id: string; // UUID referencing auth.users.id
  session_id: string; // UUID referencing quiz_sessions.id
  score: number;
  rank?: number | null;
  completed_at: string;
}

export interface CategoryChampion {
  id: string; // UUID primary key
  category: QuizCategory;
  user_id: string; // UUID referencing auth.users.id
  best_score: number;
  leaderboard_entry_id: string; // UUID referencing leaderboard_entries.id
  achieved_at: string;
}



