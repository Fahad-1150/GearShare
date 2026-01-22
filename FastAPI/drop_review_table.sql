-- Quick Drop Script for Review Table
-- Run this to remove the existing review table

DROP TABLE IF EXISTS review CASCADE;

-- Verify it's deleted
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'review';
-- Should return no rows if successfully deleted
