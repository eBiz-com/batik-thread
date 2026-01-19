-- Get the FULL view definition (works in Supabase SQL Editor)
-- This will show the complete definition in the results
SELECT pg_get_viewdef('public.blocked_submissions', true) AS full_definition;

