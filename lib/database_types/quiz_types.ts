// ----------------------------------------------------------------------------
// NIGERIA CELEBRATES - RELATIONAL SQL QUIZ TYPES (NEW)
// ----------------------------------------------------------------------------

export type QuizCategory = "music" | "movies" | "geography" | "art";
export type DifficultyLevel = "easy" | "moderate" | "difficult";
export type QuizStatus = "upcoming" | "active" | "ended" | "scheduled";
export type QuizType = "demo" | "weekly";
export type SessionStatus = "in_progress" | "completed" | "timed_out";

export interface DifficultyDistribution {
  level: DifficultyLevel;
  question_amount: number;
}

export interface Quiz {
  id: string; // UUID primary key
  title: string;
  category: QuizCategory;
  quiz_type: QuizType;
  start_time: Date;
  end_time: Date;
  quiz_duration: number; // in milliseconds
  question_amount: number;
  difficulty_distribution?: DifficultyDistribution[] | null;
  status: QuizStatus;
  created_at?: Date;
}

export interface Question {
  id: string; // UUID primary key
  question_text: string;
  context?: string | null;
  correct_option_id?: string | null; // UUID referencing options.id
  explanation?: string | null;
  difficulty: DifficultyLevel;
  category: QuizCategory;
  created_at?: Date;
}

export interface Option {
  id: string; // UUID primary key
  question_id: string; // UUID referencing questions.id
  option_text: string;
  created_at?: Date;
}

export interface QuizSession {
  id: string; // UUID primary key
  user_id: string; // UUID referencing auth.users.id
  quiz_id: string; // UUID referencing quizzes.id
  started_at: Date;
  ended_at?: Date | null;
  status: SessionStatus;
  generated_question_ids: string[]; // UUID[]
  score?: number | null;
  created_at?: Date;
}

export interface SessionQuestion {
  id: string; // UUID primary key
  session_id: string; // UUID referencing quiz_sessions.id
  question_id: string; // UUID referencing questions.id
  selected_option_id?: string | null; // UUID referencing options.id
  is_correct?: boolean | null;
  answered_at?: Date | null;
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
  completed_at: Date;
}

export interface LeaderboardEntry {
  id: string; // UUID primary key
  quiz_id: string; // UUID referencing quizzes.id
  user_id: string; // UUID referencing auth.users.id
  session_id: string; // UUID referencing quiz_sessions.id
  score: number;
  rank?: number | null;
  completed_at: Date;
}

export interface CategoryChampion {
  id: string; // UUID primary key
  category: QuizCategory;
  user_id: string; // UUID referencing auth.users.id
  best_score: number;
  leaderboard_entry_id: string; // UUID referencing leaderboard_entries.id
  achieved_at: Date;
}

// ----------------------------------------------------------------------------
// BACKWARD COMPATIBILITY TYPES (DOCUMENT STYLE / MONGODB LOOK)
// ----------------------------------------------------------------------------

export type categories = QuizCategory;
export type difficulty_level = DifficultyLevel;
export type quiz_status = QuizStatus;
export type quiz_types = QuizType;
export type session_status = SessionStatus;
export type duration_ms = number;

export interface difficulty {
  level: difficulty_level;
  question_amount: number;
}

export interface quiz {
  _id: string;
  title: string;
  category: categories;
  quiz_type: quiz_types;
  start_time: Date;
  end_time: Date;
  quiz_duration: duration_ms;
  question_amount: number;
  difficulty_distribution: Array<difficulty>;
  status: quiz_status;
  created_at?: Date;
}

export interface option {
  _id: string;
  option_text: string;
}

export interface question {
  _id: string;
  question_text: string;
  context?: string;
  options: Array<option>;
  correct_option_id: string;
  explanation: string;
  difficulty: difficulty_level;
  category: categories;
  created_at?: Date;
}

export interface question_pool {
  _id: string;
  category: categories;
  questions: Array<string>; // question ids
}

export interface quiz_session {
  _id: string;
  user_id: string;
  quiz_id: string;
  started_at: Date;
  ended_at?: Date;
  status: session_status;
  generated_question_ids: Array<string>;
  score?: number;
  created_at?: Date;
}

export interface session_question {
  _id: string;
  session_id: string;
  question_id: string;
  selected_answer?: option;
  is_correct?: boolean;
  answered_at?: Date;
}

export interface quiz_result {
  _id: string;
  session_id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
  completed_at: Date;
}

export interface leaderboard_entry {
  _id: string;
  quiz_id: string;
  user_id: string;
  session_id: string;
  score: number;
  rank: number;
  completed_at: Date;
}

export interface category_champion {
  _id: string;
  category: categories;
  user_id: string;
  best_score: number;
  leaderboard_entry_id: string;
  achieved_at: Date;
}

export interface general_quiz_settings {
  quiz_duration: duration_ms;
  question_amount: number;
  difficulty_distribution: Array<difficulty>;
  start_time: Date;
  end_time: Date;
}
