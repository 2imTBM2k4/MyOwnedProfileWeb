# Implementation Plan: Game API Integration (Steam + HoYoLAB)

## Overview

Tích hợp Steam API vào gaming profile: mở rộng DB schema, thêm proxy search endpoint, server-side stats endpoint, SteamStats component, và cập nhật admin form với platform selector + Steam search.

## Tasks

- [x] 1. SQL migration — add steam fields to games table
  - Create `sql/add_steam_fields.sql` with `ALTER TABLE games ADD COLUMN IF NOT EXISTS steam_appid text` and `steam_id text`
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2_

- [x] 2. Update Game type in supabase.ts
  - Add `steam_appid: string | null` and `steam_id: string | null` to `games` Row, Insert, and Update types
  - _Requirements: 1.4_

- [x] 3. Add STEAM_API_KEY to .env.example
  - Append `STEAM_API_KEY=your-steam-api-key-here` (no NEXT*PUBLIC* prefix)
  - _Requirements: 5.9_

- [x] 4. Create `/api/games/search` proxy route
  - [x] 4.1 Implement GET handler that accepts `?term=` query param and proxies to `https://store.steampowered.com/api/storesearch/?term={term}&l=english&cc=US`
    - Return `{ results: [{ appid, name }] }` — image_url computed client-side from CDN pattern
    - Return 400 if `term` missing
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 5. Create `/api/steam` stats route
  - [x] 5.1 Implement GET handler accepting `?appid=` and `?steamid=` params
    - Return `{ enabled: false }` when `STEAM_API_KEY` not set
    - Return 400 if params missing
    - _Requirements: 5.1, 5.6_
  - [x] 5.2 Implement in-memory cache (30 min TTL, key = `appid:steamid`)
    - _Requirements: 5.8_
  - [x] 5.3 Fetch `IPlayerService/GetRecentlyPlayedGames/v0001` and `ISteamUserStats/GetUserStatsForGame/v0002`, transform to `SteamStatsResponse`
    - `hours_total` = `playtime_forever / 60` rounded to 1dp
    - `hours_2weeks` = `playtime_2weeks / 60` rounded to 1dp (0 if absent)
    - `last_played` = `rtime_last_played` unchanged
    - `achievements_unlocked` = count where `achieved > 0`
    - `achievements_total` = array length
    - Return HTTP 500 with error message if game not found or API error
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.7_

- [x] 6. Checkpoint — verify API routes compile and respond correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create `SteamStats` component
  - [x] 7.1 Implement `SteamStats` component following HoYoStats pattern
    - Props: `{ appid: string; steamid: string }`
    - Fetch `/api/steam?appid={appid}&steamid={steamid}` on mount
    - Loading: spinner + "Loading stats..."
    - `enabled: false` → render null (silent hide)
    - Error → render null + `console.error`
    - Success → stats grid showing hours_total, hours_2weeks (if > 0), achievements (if present), last_played as relative time
    - Style: blue/cyan theme matching HoYoStats layout
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 8. Update `src/app/page.tsx` — add SteamStats to game cards
  - Add `steam_appid` and `steam_id` to the `Game` type in page.tsx
  - Import `SteamStats` component
  - In both online and offline game card sections, render `<SteamStats>` when `game.steam_appid && game.steam_id`
  - Keep existing HoYoStats rendering unchanged
  - _Requirements: 6.1, 6.9, 6.10_

- [x] 9. Update `src/app/admin/page.tsx` — platform selector + Steam integration
  - [x] 9.1 Add `steam_appid`, `steam_id`, `platform`, `steamSearchQuery`, `steamSearchResults`, `steamSearchLoading`, `steamSearchError` to `gameForm` state and `Game` type in admin
    - Add `extractSteamId` helper function
    - _Requirements: 3.2, 3.3_
  - [x] 9.2 Add platform selector (Không có / Steam / HoYoLAB) to game form dialog
    - Pre-select based on existing game data when editing
    - Switching platform clears opposing fields
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  - [x] 9.3 Add Steam search input with 300ms debounce, results dropdown, and auto-fill on selection
    - Show only when platform = "steam"
    - Display "Không tìm thấy game nào" on empty results
    - Display "Lỗi tìm kiếm Steam, thử lại sau" on error
    - On select: set title, steam_appid, image_url (CDN URL), close dropdown
    - Show read-only steam_appid field after selection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 4.1, 4.2, 4.4_
  - [x] 9.4 Add Steam ID input field (shown when platform = "steam")
    - Use `extractSteamId` to handle profile URLs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 9.5 Update `handleGameSubmit` and `openAddGame`/`editGame` to include steam fields
    - Send `steam_appid` and `steam_id` (null when empty) in request body
    - _Requirements: 1.4, 3.5_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- No property-based tests are included as this is primarily UI/API integration work without a dedicated test framework set up
- The design has Correctness Properties but they require a test framework (fast-check) not yet installed — tests can be added separately
- Middleware.ts must NOT be modified — GET requests are already allowed
