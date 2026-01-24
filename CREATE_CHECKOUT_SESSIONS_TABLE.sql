-- ============================================
-- CREATE CHECKOUT_SESSIONS TABLE
-- This table stores temporary checkout data to avoid URL length limits
-- ============================================

CREATE TABLE IF NOT EXISTS checkout_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL,
  subtotal DECIMAL NOT NULL DEFAULT 0,
  tax DECIMAL NOT NULL DEFAULT 0,
  shipping DECIMAL NOT NULL DEFAULT 0,
  total DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_id ON checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires_at ON checkout_sessions(expires_at);

-- Auto-cleanup expired sessions (optional, can be run periodically)
-- DELETE FROM checkout_sessions WHERE expires_at < NOW();

