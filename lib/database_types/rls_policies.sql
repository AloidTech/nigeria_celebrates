-- ============================================================================
-- NIGERIA CELEBRATES - RLS POLICIES & ADMIN SECURITY
-- ============================================================================

-- 1. Helper function to securely check if a user is an admin
-- It reads the 'role' claim from the user's JWT metadata (which is populated by the Edge Function)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_champions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
-- CRITICAL: Allow 'anon' to insert a profile. Because we create the profile
-- immediately after sign-up (before email verification), the user does not 
-- have a logged-in session yet (auth.uid() is null). 
CREATE POLICY "Allow public to insert profile during signup" 
ON profiles FOR INSERT TO public 
WITH CHECK (true);

-- Users can read and update their own profile. Admins can manage all.
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id OR is_admin());

-- ============================================================================
-- 2. GAME SETTINGS & CONTENT (Quizzes, Settings, Questions, Options)
-- ============================================================================
-- Everyone can read the content
CREATE POLICY "Public can view settings" ON general_settings FOR SELECT USING (true);
CREATE POLICY "Public can view quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public can view options" ON options FOR SELECT USING (true);

-- ONLY Admins can create, update, or delete content
CREATE POLICY "Admins can manage settings" ON general_settings FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage quizzes" ON quizzes FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage questions" ON questions FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage options" ON options FOR ALL USING (is_admin());

-- ============================================================================
-- 3. GAMEPLAY (Quiz Sessions & Session Questions)
-- ============================================================================
-- Users can only see and modify their own active quiz sessions
CREATE POLICY "Users can view own sessions" 
ON quiz_sessions FOR SELECT 
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own sessions" 
ON quiz_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON quiz_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only answer questions in their own sessions
CREATE POLICY "Users can view own session questions" 
ON session_questions FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id = auth.uid()) 
  OR is_admin()
);

CREATE POLICY "Users can insert own session questions" 
ON session_questions FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update own session questions" 
ON session_questions FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM quiz_sessions WHERE id = session_id AND user_id = auth.uid())
);

-- ============================================================================
-- 4. LEADERBOARDS & RESULTS
-- ============================================================================
-- Everyone can view leaderboards and results (publicly visible)
CREATE POLICY "Public can view results" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Public can view leaderboards" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Public can view champions" ON category_champions FOR SELECT USING (true);

-- The 'complete_quiz_session' database trigger runs under the user's permissions, 
-- so they need INSERT/UPDATE rights to their own results.
CREATE POLICY "Users can insert own results" 
ON quiz_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" 
ON quiz_results FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard" 
ON leaderboard_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard" 
ON leaderboard_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage champions" 
ON category_champions FOR ALL 
USING (is_admin());

-- ============================================================================
-- 5. TALENT ZONE - SUBMISSIONS
-- ============================================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved submissions (public talent feed)
CREATE POLICY "Public can view approved submissions"
ON submissions FOR SELECT
USING (is_approved = true);

-- Authenticated users can also view their own submissions (including unapproved drafts)
CREATE POLICY "Users can view own submissions"
ON submissions FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
ON submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all submissions (approve, delete, etc.)
CREATE POLICY "Admins can manage submissions"
ON submissions FOR ALL
USING (is_admin());

-- ============================================================================
-- 6. TALENT ZONE - VOTES
-- ============================================================================
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (needed for vote count aggregation and user vote status)
CREATE POLICY "Public can view votes"
ON votes FOR SELECT
USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can insert own votes"
ON votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own votes (for upsert/vote-type change)
CREATE POLICY "Users can update own votes"
ON votes FOR UPDATE
USING (auth.uid() = user_id);

-- Authenticated users can delete their own votes (for undo/remove vote)
CREATE POLICY "Users can delete own votes"
ON votes FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all votes
CREATE POLICY "Admins can manage votes"
ON votes FOR ALL
USING (is_admin());
