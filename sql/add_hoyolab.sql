-- Add HoYoLAB columns to games table
-- Run this in Supabase SQL Editor

ALTER TABLE games ADD COLUMN IF NOT EXISTS hoyolab_game   text;
ALTER TABLE games ADD COLUMN IF NOT EXISTS hoyolab_uid    text;
ALTER TABLE games ADD COLUMN IF NOT EXISTS hoyolab_server text;

-- hoyolab_game valid values: 'genshin', 'hsr', 'hi3', 'zzz'
-- hoyolab_uid: your in-game UID (e.g. '805842362')
-- hoyolab_server: server region
--   Genshin: os_asia | os_euro | os_usa | os_cht
--   HSR:     prod_official_asia | prod_official_euro | prod_official_usa | prod_official_cht
--   HI3:     overseas01 | overseas02
--   ZZZ:     prod_gf_us | prod_gf_eu | prod_gf_asia | prod_gf_jp
