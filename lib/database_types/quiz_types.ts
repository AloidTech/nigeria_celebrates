type categories = "music" | "movies";

type difficulty_level = "difficult" | "moderate" | "easy";

type quiz_status = "upcoming" | "active" | "ended";

type session_status = "in_progress" | "completed" | "timed_out";

type duration_ms = number;

// --------------------------------------------------
// QUIZ
// --------------------------------------------------

// The structure of a Quiz in this app
interface quiz {
  _id: string;

  title: string;
  category: categories;

  start_time: Date;
  end_time: Date;

  quiz_duration: duration_ms;

  question_amount: number;

  difficulty_distribution: Array<difficulty>;

  status: quiz_status;
}

interface difficulty {
  level: difficulty_level;
  question_amount: number;
}

// --------------------------------------------------
// QUESTION
// --------------------------------------------------

// This is the structure of a question within the question pool
interface question {
  _id: string;

  question_text: string;

  options: Array<option>;

  correct_option_id: string;

  explanation: string;

  difficulty: difficulty_level;

  category: categories;
}

interface option {
  _id: string;
  option_text: string;
}

// --------------------------------------------------
// QUESTION POOL
// --------------------------------------------------

// Collection of questions belonging to a category
interface question_pool {
  _id: string;

  category: categories;

  questions: Array<string>; // question ids
}

// --------------------------------------------------
// QUIZ SESSION
// --------------------------------------------------

// Represents one participant's attempt at a quiz
interface quiz_session {
  _id: string;

  user_id: string;

  quiz_id: string;

  started_at: Date;

  ended_at?: Date;

  status: session_status;

  generated_question_ids: Array<string>;

  score?: number;
}

// --------------------------------------------------
// SESSION QUESTION
// --------------------------------------------------

// Represents a question inside a user's session
interface session_question {
  _id: string;

  session_id: string;

  question_id: string;

  selected_answer?: option;

  is_correct?: boolean;

  answered_at?: Date;
}

// --------------------------------------------------
// QUIZ RESULT
// --------------------------------------------------

// Snapshot of a completed session's performance
interface quiz_result {
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

// --------------------------------------------------
// LEADERBOARD ENTRY
// --------------------------------------------------

// Represents a user's position in a specific quiz
interface leaderboard_entry {
  _id: string;

  quiz_id: string;

  user_id: string;

  session_id: string;

  score: number;

  rank: number;

  completed_at: Date;
}

// --------------------------------------------------
// CATEGORY CHAMPION
// --------------------------------------------------

// Stores the all-time top performer for a category
interface category_champion {
  _id: string;

  category: categories;

  user_id: string;

  best_score: number;

  leaderboard_entry_id: string;

  achieved_at: Date;
}
