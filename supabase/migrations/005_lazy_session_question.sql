-- Allow session_items.question to be NULL (lazy generation)
ALTER TABLE session_items ALTER COLUMN question DROP NOT NULL;
