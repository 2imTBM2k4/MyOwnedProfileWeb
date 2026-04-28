-- Migration: Add Steam fields to games table
-- Safe to re-run (uses IF NOT EXISTS guards)

ALTER TABLE games ADD COLUMN IF NOT EXISTS steam_appid text;
ALTER TABLE games ADD COLUMN IF NOT EXISTS steam_id    text;
