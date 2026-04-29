-- Add publisher column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS publisher TEXT;
