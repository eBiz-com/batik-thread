-- Create submission_logs table to track all form submission attempts
-- This helps identify bot patterns and block malicious IPs

CREATE TABLE IF NOT EXISTS submission_logs (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  email TEXT,
  customer_name TEXT,
  form_fill_time INTEGER,
  captcha_passed BOOLEAN DEFAULT false,
  honeypot_triggered BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  success BOOLEAN DEFAULT false,
  request_id BIGINT REFERENCES custom_requests(id) ON DELETE SET NULL,
  device_fingerprint TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_submission_logs_ip ON submission_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_submission_logs_email ON submission_logs(email);
CREATE INDEX IF NOT EXISTS idx_submission_logs_created_at ON submission_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_logs_success ON submission_logs(success);
CREATE INDEX IF NOT EXISTS idx_submission_logs_device_fingerprint ON submission_logs(device_fingerprint);

-- Create a view to see blocked attempts
CREATE OR REPLACE VIEW blocked_submissions AS
SELECT 
  ip_address,
  email,
  COUNT(*) as attempt_count,
  MAX(created_at) as last_attempt,
  STRING_AGG(DISTINCT blocked_reason, ', ') as reasons
FROM submission_logs
WHERE success = false
GROUP BY ip_address, email
ORDER BY attempt_count DESC;

