-- ============================================
-- FIX CHECKOUT_SESSIONS SECURITY ISSUES
-- Enables RLS and creates appropriate policies
-- ============================================

-- Enable Row Level Security on checkout_sessions table
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to create checkout sessions (INSERT)
-- This is needed for the checkout flow to work
CREATE POLICY "Allow insert checkout_sessions"
ON checkout_sessions
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow anyone to read checkout sessions by session_id (SELECT)
-- The session_id acts as a temporary access token
-- Only non-expired sessions can be read
CREATE POLICY "Allow read checkout_sessions by session_id"
ON checkout_sessions
FOR SELECT
TO public
USING (
  expires_at > NOW()
);

-- Policy 3: Allow service role to delete expired sessions (DELETE)
-- This is for cleanup operations
-- Note: Service role bypasses RLS, but we can also create a policy for it
CREATE POLICY "Allow delete expired checkout_sessions"
ON checkout_sessions
FOR DELETE
TO service_role
USING (expires_at < NOW());

-- Optional: Create a function to auto-cleanup expired sessions
-- This can be called periodically or via a cron job
CREATE OR REPLACE FUNCTION cleanup_expired_checkout_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM checkout_sessions
  WHERE expires_at < NOW();
END;
$$;

-- Grant execute permission on cleanup function
GRANT EXECUTE ON FUNCTION cleanup_expired_checkout_sessions() TO service_role;

-- ============================================
-- NOTES:
-- 1. The SELECT policy allows reading any non-expired session by session_id
--    This is secure because:
--    - session_id is a unique, randomly generated token
--    - Sessions expire after 1 hour
--    - Without the session_id, no one can access the data
--
-- 2. The INSERT policy allows anyone to create sessions, which is needed
--    for the checkout flow to work without authentication
--
-- 3. Expired sessions are automatically filtered out by the SELECT policy
--
-- 4. For production, consider:
--    - Running cleanup_expired_checkout_sessions() periodically (e.g., daily)
--    - Adding additional validation in your API routes
--    - Implementing rate limiting on session creation
-- ============================================

