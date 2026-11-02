-- Add bilingual (English) fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS kind_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS did_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS result_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_en TEXT;

