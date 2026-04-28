# Requirements Document

## Introduction

Tích hợp Steam API và cải thiện luồng HoYoLAB vào trang gaming profile cá nhân (Next.js 14 + Supabase).
Tính năng bao gồm: tìm kiếm game Steam trong admin panel, tự động điền ảnh bìa từ Steam CDN, lưu Steam App ID và Steam ID vào database, hiển thị stats Steam (giờ chơi, achievements, lần chơi gần nhất) trên homepage, và tích hợp cả hai nền tảng vào một luồng thêm/sửa game thống nhất.

## Glossary

- **Admin_Panel**: Trang `/admin` dùng để quản lý games, gears, profile, social links.
- **Steam_Search_API**: Endpoint công khai `https://store.steampowered.com/api/storesearch/` — không cần API key.
- **Steam_Stats_API**: Các endpoint của Steam Web API yêu cầu `STEAM_API_KEY` (server-side).
- **Steam_CDN**: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg` — URL ảnh bìa game Steam.
- **HoYoLAB_API**: API hiện có tại `/api/hoyolab` phục vụ stats cho Genshin Impact, HSR, HI3, ZZZ.
- **Game_Form**: Dialog thêm/sửa game trong Admin_Panel.
- **GameCard**: Component hiển thị thông tin một game trên homepage (tab GAMES).
- **SteamStats**: Component mới hiển thị stats Steam trên GameCard.
- **HoYoStats**: Component hiện có hiển thị stats HoYoLAB trên GameCard.
- **steam_appid**: Cột mới trong bảng `games` (kiểu `text`) — lưu Steam App ID.
- **steam_id**: Cột mới trong bảng `games` (kiểu `text`) — lưu Steam ID 64-bit của người dùng.
- **STEAM_API_KEY**: Biến môi trường server-side (không có prefix `NEXT_PUBLIC_`).

---

## Requirements

### Requirement 1: Database Schema Extension

**User Story:** As a developer, I want to store Steam-related fields in the games table, so that Steam integration data persists across sessions.

#### Acceptance Criteria

1. THE Database SHALL contain a `steam_appid` column of type `text` (nullable) in the `games` table.
2. THE Database SHALL contain a `steam_id` column of type `text` (nullable) in the `games` table.
3. WHEN a game record is created or updated without Steam fields, THE Database SHALL accept null values for `steam_appid` and `steam_id`.
4. THE Games_API (`/api/games`) SHALL return `steam_appid` and `steam_id` fields in all game records.

---

### Requirement 2: Steam Game Search in Admin Panel

**User Story:** As an admin, I want to search for a game by name in the Steam store, so that I can quickly find and select the correct game without manually entering details.

#### Acceptance Criteria

1. WHEN the admin opens the Game_Form, THE Admin_Panel SHALL display a text input labeled "Tìm game trên Steam" for searching.
2. WHEN the admin types at least 2 characters in the Steam search input, THE Admin_Panel SHALL call the Steam_Search_API with the entered term.
3. WHEN the Steam_Search_API returns results, THE Admin_Panel SHALL display a dropdown list showing each result's game name and cover image thumbnail.
4. WHEN the Steam_Search_API returns no results, THE Admin_Panel SHALL display the message "Không tìm thấy game nào".
5. IF the Steam_Search_API call fails, THEN THE Admin_Panel SHALL display the message "Lỗi tìm kiếm Steam, thử lại sau".
6. WHEN the admin selects a game from the dropdown, THE Admin_Panel SHALL populate the `title` field with the selected game's name.
7. WHEN the admin selects a game from the dropdown, THE Admin_Panel SHALL populate the `steam_appid` field with the selected game's App ID.
8. WHEN the admin selects a game from the dropdown, THE Admin_Panel SHALL populate the `image_url` field with the Steam_CDN URL for that App ID.
9. WHEN the admin selects a game from the dropdown, THE Admin_Panel SHALL close the search dropdown.
10. WHERE the admin has already selected a Steam game, THE Admin_Panel SHALL display the current `steam_appid` value in a read-only field labeled "Steam App ID".

---

### Requirement 3: Steam ID Input in Admin Panel

**User Story:** As an admin, I want to enter my Steam ID or profile URL when adding a Steam game, so that the homepage can fetch and display my personal play stats.

#### Acceptance Criteria

1. WHEN the Game_Form is open and `steam_appid` is set, THE Admin_Panel SHALL display an input field labeled "Steam ID (64-bit)" for entering the Steam user ID.
2. WHEN the admin enters a Steam profile URL (containing `steamcommunity.com`) in the Steam ID field, THE Admin_Panel SHALL extract and store only the 64-bit numeric Steam ID.
3. WHEN the admin enters a plain 64-bit numeric Steam ID, THE Admin_Panel SHALL store it as-is.
4. IF the admin submits the Game_Form with `steam_appid` set but `steam_id` empty, THEN THE Admin_Panel SHALL save the record with `steam_id` as null (Steam stats will not be shown).
5. THE Admin_Panel SHALL save `steam_id` to the `steam_id` column in the `games` table upon form submission.

---

### Requirement 4: Auto Cover Image from Steam CDN

**User Story:** As an admin, I want the cover image to be automatically filled when I select a Steam game, so that I don't have to manually find and paste image URLs.

#### Acceptance Criteria

1. WHEN the admin selects a game from the Steam search dropdown, THE Admin_Panel SHALL set `image_url` to `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg`.
2. WHEN the admin manually edits the `image_url` field after auto-fill, THE Admin_Panel SHALL use the manually entered URL instead.
3. WHERE a HoYoLAB game is selected (not Steam), THE Admin_Panel SHALL allow the admin to manually enter or upload a cover image (existing behavior unchanged).
4. WHEN the admin clears the Steam search and selects a different game, THE Admin_Panel SHALL update `image_url` to the new game's Steam CDN URL.

---

### Requirement 5: Server-side Steam Stats API Route

**User Story:** As a developer, I want a secure server-side API route for Steam stats, so that the STEAM_API_KEY is never exposed to the client.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint at `/api/steam` accepting query parameters `appid` and `steamid`.
2. WHEN `/api/steam` is called with valid `appid` and `steamid`, THE Steam_Stats_API SHALL fetch recently played games data from `IPlayerService/GetRecentlyPlayedGames/v0001`.
3. WHEN `/api/steam` is called with valid `appid` and `steamid`, THE Steam_Stats_API SHALL fetch user stats from `ISteamUserStats/GetUserStatsForGame/v0002`.
4. WHEN the target game is found in recently played data, THE `/api/steam` route SHALL return `hours_total` (total playtime in hours, rounded to 1 decimal), `hours_2weeks` (playtime in last 2 weeks in hours), and `last_played` (Unix timestamp of last play session).
5. WHEN the stats API returns achievement data, THE `/api/steam` route SHALL return `achievements_unlocked` (count of achievements with value > 0) and `achievements_total` (total achievement count).
6. IF `STEAM_API_KEY` is not set, THEN THE `/api/steam` route SHALL return `{ "enabled": false }`.
7. IF the Steam API returns an error or the game is not found in the user's library, THEN THE `/api/steam` route SHALL return an appropriate error message with HTTP status 500.
8. THE `/api/steam` route SHALL cache responses in memory for 30 minutes per `appid:steamid` key to reduce Steam API calls.
9. THE System SHALL read `STEAM_API_KEY` exclusively from server-side environment variables (no `NEXT_PUBLIC_` prefix).

---

### Requirement 6: Steam Stats Display on Homepage

**User Story:** As a visitor, I want to see Steam play stats on game cards, so that I can see how much time the profile owner has invested in each Steam game.

#### Acceptance Criteria

1. WHEN a GameCard has both `steam_appid` and `steam_id` set, THE Homepage SHALL render a SteamStats component below the game title.
2. WHEN SteamStats is loading, THE SteamStats SHALL display a loading indicator with the text "Loading stats...".
3. WHEN SteamStats data is loaded successfully, THE SteamStats SHALL display `hours_total` formatted as "{N} giờ".
4. WHEN `hours_2weeks` is greater than 0, THE SteamStats SHALL display `hours_2weeks` formatted as "{N} giờ / 2 tuần".
5. WHEN `achievements_unlocked` and `achievements_total` are available, THE SteamStats SHALL display them formatted as "{unlocked}/{total} achievements".
6. WHEN `last_played` is available, THE SteamStats SHALL display the last played date formatted as a relative time string (e.g., "3 ngày trước").
7. IF the `/api/steam` route returns `{ "enabled": false }`, THEN THE SteamStats SHALL render nothing (silent hide).
8. IF the `/api/steam` route returns an error, THEN THE SteamStats SHALL render nothing (silent hide, log error to console).
9. WHEN a GameCard has HoYoLAB fields set (`hoyolab_game`, `hoyolab_uid`, `hoyolab_server`), THE Homepage SHALL render the existing HoYoStats component (behavior unchanged).
10. WHEN a GameCard has both Steam fields and HoYoLAB fields set, THE Homepage SHALL render both SteamStats and HoYoStats.

---

### Requirement 7: Unified Game Form — Platform Selection

**User Story:** As an admin, I want a clear platform selector in the game form, so that I can configure Steam or HoYoLAB fields without confusion.

#### Acceptance Criteria

1. WHEN the Game_Form is open, THE Admin_Panel SHALL display a platform selector with options: "Không có" (none), "Steam", "HoYoLAB".
2. WHEN the admin selects "Steam", THE Admin_Panel SHALL show the Steam search input and Steam ID field, and hide HoYoLAB fields.
3. WHEN the admin selects "HoYoLAB", THE Admin_Panel SHALL show HoYoLAB fields (`hoyolab_game`, `hoyolab_uid`, `hoyolab_server`), and hide Steam search fields.
4. WHEN the admin selects "Không có", THE Admin_Panel SHALL hide both Steam and HoYoLAB fields.
5. WHEN the admin switches platform from "Steam" to "HoYoLAB", THE Admin_Panel SHALL clear `steam_appid` and `steam_id` values.
6. WHEN the admin switches platform from "HoYoLAB" to "Steam", THE Admin_Panel SHALL clear `hoyolab_game`, `hoyolab_uid`, and `hoyolab_server` values.
7. WHEN editing an existing game that has `steam_appid` set, THE Admin_Panel SHALL pre-select "Steam" in the platform selector.
8. WHEN editing an existing game that has `hoyolab_game` set, THE Admin_Panel SHALL pre-select "HoYoLAB" in the platform selector.

---

### Requirement 8: SQL Migration Script

**User Story:** As a developer, I want a SQL migration script for the new columns, so that I can apply the schema changes to Supabase easily.

#### Acceptance Criteria

1. THE System SHALL provide a SQL file at `sql/add_steam_fields.sql` containing `ALTER TABLE` statements to add `steam_appid text` and `steam_id text` columns to the `games` table.
2. THE SQL migration SHALL use `IF NOT EXISTS` guards (or equivalent) to be safely re-runnable.
