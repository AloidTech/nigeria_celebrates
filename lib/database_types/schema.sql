-- ============================================================================
-- NIGERIA CELEBRATES - QUIZ MODULE SCHEMA DDL
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_category') THEN
        CREATE TYPE quiz_category AS ENUM ('music', 'movies', 'geography', 'art');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'difficult');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_status') THEN
        CREATE TYPE quiz_status AS ENUM ('scheduled', 'active', 'ended', 'inactive');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_type') THEN
        CREATE TYPE quiz_type AS ENUM ('demo', 'weekly');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'timed_out');
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

-- 1. GENERAL SETTINGS
CREATE TABLE IF NOT EXISTS general_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_category quiz_category NOT NULL,
    quiz_type quiz_type NOT NULL DEFAULT 'weekly',
    quiz_duration INTEGER NOT NULL DEFAULT 600000, -- Duration in milliseconds (default 10 mins)
    question_amount INTEGER NOT NULL DEFAULT 10,
    difficulty_distribution JSONB, -- Config distribution, e.g., [{"level": "easy", "question_amount": 3}]
    auto_generation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    interval_duration INTERVAL NOT NULL DEFAULT INTERVAL '7 days',
    start_day INTEGER NOT NULL DEFAULT 1 CHECK (start_day BETWEEN 1 AND 7),
    weekly_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    weekly_end_time TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '8 days',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. QUIZZES
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settings_id UUID REFERENCES general_settings(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category quiz_category, -- Nullable to inherit from general_settings
    quiz_type quiz_type NOT NULL DEFAULT 'weekly',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    quiz_duration INTEGER, -- Nullable to inherit from general_settings
    question_amount INTEGER, -- Nullable to inherit from general_settings
    difficulty_distribution JSONB, -- Nullable to inherit from general_settings
    status quiz_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe migrations for existing tables
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS settings_id UUID REFERENCES general_settings(id) ON DELETE SET NULL;
ALTER TABLE quizzes ALTER COLUMN category DROP NOT NULL;
ALTER TABLE quizzes ALTER COLUMN quiz_duration DROP NOT NULL;
ALTER TABLE quizzes ALTER COLUMN question_amount DROP NOT NULL;
ALTER TABLE general_settings ADD COLUMN IF NOT EXISTS start_day INTEGER NOT NULL DEFAULT 1;
ALTER TABLE general_settings ADD COLUMN IF NOT EXISTS weekly_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE general_settings ADD COLUMN IF NOT EXISTS weekly_end_time TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '8 days';

-- ----------------------------------------------------------------------------
-- TRIGGERS & AUTOMATION
-- ----------------------------------------------------------------------------

-- Trigger to freeze settings from general_settings when a quiz starts (status -> active)
CREATE OR REPLACE FUNCTION freeze_settings_on_start()
RETURNS TRIGGER AS $$
DECLARE
    gs record;
BEGIN
    -- If settings_id is not provided, look it up by quiz_type
    IF NEW.settings_id IS NULL THEN
        SELECT * INTO gs FROM general_settings WHERE quiz_type = NEW.quiz_type LIMIT 1;
        NEW.settings_id := gs.id;
    ELSE
        SELECT * INTO gs FROM general_settings WHERE id = NEW.settings_id;
    END IF;

    -- Freeze settings only when the quiz becomes active
    IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'scheduled')) THEN
        IF gs.id IS NOT NULL THEN
            IF NEW.category IS NULL THEN
                NEW.category := gs.weekly_category;
            END IF;
            IF NEW.quiz_duration IS NULL THEN
                NEW.quiz_duration := gs.quiz_duration;
            END IF;
            IF NEW.question_amount IS NULL THEN
                NEW.question_amount := gs.question_amount;
            END IF;
            IF NEW.difficulty_distribution IS NULL THEN
                NEW.difficulty_distribution := gs.difficulty_distribution;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_freeze_settings_on_start
BEFORE INSERT OR UPDATE ON quizzes
FOR EACH ROW
EXECUTE FUNCTION freeze_settings_on_start();

-- Trigger to activate scheduled quizzes when their start time is reached
CREATE OR REPLACE FUNCTION activate_scheduled_quizzes()
RETURNS void
AS $$

BEGIN
    -- End quizzes whose end time has passed
    UPDATE quizzes
    SET status = 'ended'
    WHERE end_time <= NOW()
      AND status = 'active';
    -- Activate quizzes whose start time has arrived
    UPDATE quizzes
    SET status = 'active'
    WHERE start_time <= NOW()
        AND end_time > NOW()
        AND status = 'scheduled';
    END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
    'activate-quizzes',
    '* * * * *',
    $$SELECT activate_scheduled_quizzes();$$
);

CREATE OR REPLACE FUNCTION auto_generate_next_quiz()
RETURNS TRIGGER AS $$
DECLARE
    gs record;
    upcoming_count INTEGER;
    next_start TIMESTAMPTZ;
    next_end TIMESTAMPTZ;
    next_title VARCHAR(255);
    dow_diff INTEGER;
    categories quiz_category[] := ARRAY['music', 'movies', 'geography', 'art']::quiz_category[];
    next_cat quiz_category;
BEGIN
    -- Only trigger auto-generation when status transitions to 'ended'
    IF NEW.status = 'ended' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'active')) THEN
        -- Fetch the settings referenced by the quiz
        SELECT * INTO gs FROM general_settings WHERE id = NEW.settings_id;

        -- Only auto-generate if enabled in settings
        IF gs.id IS NOT NULL AND gs.auto_generation_enabled = TRUE THEN
            -- Pick a random category that is NOT the current one
            SELECT unnest INTO next_cat FROM unnest(categories) WHERE unnest != gs.weekly_category ORDER BY random() LIMIT 1;
            
            -- Update general_settings
            UPDATE general_settings SET weekly_category = next_cat WHERE id = gs.id;
            gs.weekly_category := next_cat; -- Update local record

            -- Check if we already have the next quiz scheduled starting after this one ends
            SELECT COUNT(*) INTO upcoming_count 
            FROM quizzes 
            WHERE quiz_type = NEW.quiz_type 
              AND start_time >= NEW.end_time;

            -- We only want to pre-generate exactly ONE future quiz
            IF upcoming_count = 0 THEN
                -- If start_day is defined, find the next occurrence of gs.start_day after NEW.end_time
                IF gs.start_day IS NOT NULL THEN
                    dow_diff := gs.start_day - EXTRACT(ISODOW FROM NEW.end_time)::integer;
                    -- If the target day is today or in the past relative to the end time, move to next week
                    IF dow_diff <= 0 THEN
                        dow_diff := dow_diff + 7;
                    END IF;
                    next_start := (date_trunc('day', NEW.end_time + (dow_diff * INTERVAL '1 day'))::date + gs.weekly_start_time)::timestamptz;
                ELSE
                    next_start := (date_trunc('day', NEW.end_time)::date + gs.weekly_start_time)::timestamptz;
                END IF;
                
                next_end := (date_trunc('day', next_start + gs.interval_duration)::date + gs.weekly_end_time)::timestamptz;
                next_title := INITCAP(NEW.quiz_type::text) || ' Quiz - ' || TO_CHAR(next_start, 'DD Mon YYYY');

                -- Note: config columns are left NULL to dynamically inherit until this next quiz starts
                INSERT INTO quizzes (
                    title,
                    category,
                    quiz_type,
                    settings_id,
                    start_time,
                    end_time,
                    quiz_duration,
                    question_amount,
                    difficulty_distribution,
                    status
                ) VALUES (
                    next_title,
                    NULL, -- category inherited dynamically
                    NEW.quiz_type,
                    gs.id,
                    next_start,
                    next_end,
                    NULL, -- quiz_duration inherited dynamically
                    NULL, -- question_amount inherited dynamically
                    NULL, -- difficulty_distribution inherited dynamically
                    'scheduled'
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_generate_next_quiz
AFTER INSERT OR UPDATE ON quizzes
FOR EACH ROW
EXECUTE FUNCTION auto_generate_next_quiz();

-- View to query resolved quiz settings (either frozen or dynamic)
CREATE OR REPLACE VIEW quizzes_resolved AS
SELECT 
    q.id,
    q.settings_id,
    q.title,
    COALESCE(q.category, gs.weekly_category) AS category,
    q.quiz_type,
    q.start_time,
        q.end_time,
    COALESCE(q.quiz_duration, gs.quiz_duration) AS quiz_duration,
    COALESCE(q.question_amount, gs.question_amount) AS question_amount,
    COALESCE(q.difficulty_distribution, gs.difficulty_distribution) AS difficulty_distribution,
    q.status,
    q.created_at
FROM quizzes q
LEFT JOIN general_settings gs ON q.settings_id = gs.id;

-- 2. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    correct_option_id UUID, -- Foreign key reference to options(id) defined later to avoid circular dependency
    explanation TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'moderate',
    category quiz_category NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. OPTIONS
CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Circular Foreign Key for Questions Correct Option
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_questions_correct_option'
    ) THEN
        ALTER TABLE questions 
        ADD CONSTRAINT fk_questions_correct_option 
        FOREIGN KEY (correct_option_id) REFERENCES options(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. QUIZ SESSIONS
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status session_status NOT NULL DEFAULT 'in_progress',
    generated_question_ids UUID[] NOT NULL DEFAULT '{}', -- Tracks sequence of question IDs served to the user
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SESSION QUESTIONS
CREATE TABLE IF NOT EXISTS session_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES options(id) ON DELETE SET NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMPTZ,
    CONSTRAINT unique_session_question UNIQUE (session_id, question_id)
);

-- 6. QUIZ RESULTS
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. LEADERBOARD ENTRIES
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_quiz_user_leaderboard UNIQUE (quiz_id, user_id)
);

-- 8. CATEGORY CHAMPIONS
CREATE TABLE IF NOT EXISTS category_champions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category quiz_category NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    best_score INTEGER NOT NULL,
    leaderboard_entry_id UUID NOT NULL REFERENCES leaderboard_entries(id) ON DELETE CASCADE,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_quiz ON quiz_sessions(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_quiz_score ON leaderboard_entries(quiz_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);

-- ----------------------------------------------------------------------------
-- AUTOMATED GRADING & SESSION WRITING TRIGGERS
-- ----------------------------------------------------------------------------

-- Trigger to automatically evaluate correct answers on session_questions insert/update
CREATE OR REPLACE FUNCTION check_session_question_correctness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_correct := (NEW.selected_option_id = (SELECT correct_option_id FROM questions WHERE id = NEW.question_id));
    NEW.answered_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_session_question_correctness
BEFORE INSERT OR UPDATE ON session_questions
FOR EACH ROW
EXECUTE FUNCTION check_session_question_correctness();

-- Trigger to automatically score, generate results, and update leaderboard on completed sessions
CREATE OR REPLACE FUNCTION complete_quiz_session()
RETURNS TRIGGER AS $$
DECLARE
    v_total_questions INTEGER;
    v_correct_answers INTEGER;
    v_incorrect_answers INTEGER;
    v_score INTEGER;
    v_accuracy NUMERIC(5,2);
BEGIN
    -- Only run when status changes to 'completed'
    IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
        -- Count total questions in this session
        SELECT COALESCE(array_length(NEW.generated_question_ids, 1), 0) INTO v_total_questions;
        
        -- Count correct answers
        SELECT COUNT(*) INTO v_correct_answers
        FROM session_questions
        WHERE session_id = NEW.id AND is_correct = TRUE;
        
        v_incorrect_answers := v_total_questions - v_correct_answers;
        v_score := v_correct_answers * 100;
        
        IF v_total_questions > 0 THEN
            v_accuracy := (v_correct_answers::numeric / v_total_questions::numeric) * 100.00;
        ELSE
            v_accuracy := 0.00;
        END IF;

        -- Update the score on the session record
        NEW.score := v_score;
        NEW.ended_at := NOW();

        -- 1. Insert into quiz_results
        INSERT INTO quiz_results (
            session_id,
            user_id,
            quiz_id,
            score,
            total_questions,
            correct_answers,
            incorrect_answers,
            accuracy_percentage,
            completed_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            NEW.quiz_id,
            v_score,
            v_total_questions,
            v_correct_answers,
            v_incorrect_answers,
            v_accuracy,
            NOW()
        ) ON CONFLICT (session_id) DO NOTHING;

        -- 2. Insert or Update Leaderboard Entry
        INSERT INTO leaderboard_entries (
            quiz_id,
            user_id,
            session_id,
            score,
            completed_at
        ) VALUES (
            NEW.quiz_id,
            NEW.user_id,
            NEW.id,
            v_score,
            NOW()
        ) ON CONFLICT (quiz_id, user_id) DO UPDATE
        SET score = GREATEST(leaderboard_entries.score, EXCLUDED.score),
            session_id = EXCLUDED.session_id,
            completed_at = EXCLUDED.completed_at;
            
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_complete_quiz_session
BEFORE UPDATE ON quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION complete_quiz_session();

-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS / RPCs
-- ----------------------------------------------------------------------------

-- Function to start a new quiz session for a user, auto-generating question sequence
CREATE OR REPLACE FUNCTION start_quiz_session(p_user_id UUID, p_quiz_id UUID)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_category quiz_category;
    v_question_amount INTEGER;
    v_diff_dist JSONB;
    v_question_ids UUID[] := '{}';
    v_dist_item RECORD;
    v_item_ids UUID[];
BEGIN
    -- Get quiz configuration from the resolved view
    SELECT category, question_amount, difficulty_distribution
    INTO v_category, v_question_amount, v_diff_dist
    FROM quizzes_resolved
    WHERE id = p_quiz_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quiz not found';
    END IF;

    -- If there's a difficulty distribution configured, pull questions matching the distribution
    IF v_diff_dist IS NOT NULL AND jsonb_array_length(v_diff_dist) > 0 THEN
        FOR v_dist_item IN 
            SELECT * FROM jsonb_to_recordset(v_diff_dist) AS x(level difficulty_level, question_amount int)
        LOOP
            SELECT array_agg(id) INTO v_item_ids FROM (
                SELECT id FROM questions
                WHERE category = v_category
                  AND difficulty = v_dist_item.level
                ORDER BY random()
                LIMIT v_dist_item.question_amount
            ) q;

            IF v_item_ids IS NOT NULL THEN
                v_question_ids := v_question_ids || v_item_ids;
            END IF;
        END LOOP;
    END IF;

    -- Fallback: If no distribution or not enough questions selected, pick random questions from the category
    IF array_length(v_question_ids, 1) IS NULL OR array_length(v_question_ids, 1) < v_question_amount THEN
        SELECT array_agg(id) INTO v_item_ids FROM (
            SELECT id FROM questions
            WHERE category = v_category
              AND NOT (id = ANY(v_question_ids))
            ORDER BY random()
            LIMIT (v_question_amount - COALESCE(array_length(v_question_ids, 1), 0))
        ) q;

        IF v_item_ids IS NOT NULL THEN
            v_question_ids := v_question_ids || v_item_ids;
        END IF;
    END IF;

    -- Create the quiz session
    INSERT INTO quiz_sessions (
        user_id,
        quiz_id,
        status,
        generated_question_ids
    ) VALUES (
        p_user_id,
        p_quiz_id,
        'in_progress',
        v_question_ids
    ) RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;
