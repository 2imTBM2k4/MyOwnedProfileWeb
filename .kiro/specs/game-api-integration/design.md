# Design Document — Game API Integration (Steam + HoYoLAB)

## Overview

Tích hợp Steam Web API vào trang gaming profile cá nhân (Next.js 14 + Supabase), song song với luồng HoYoLAB hiện có. Tính năng bao gồm:

- Mở rộng schema database với hai cột mới (`steam_appid`, `steam_id`)
- Proxy endpoint `/api/games/search` để tìm kiếm Steam Store (tránh CORS)
- Server-side endpoint `/api/steam` để lấy stats cá nhân (bảo vệ API key)
- Component `SteamStats` hiển thị giờ chơi, achievements, lần chơi gần nhất
- Cập nhật admin form với platform selector (None / Steam / HoYoLAB) và Steam search dropdown

Thiết kế bám sát pattern hiện có của `/api/hoyolab` (in-memory cache, `enabled: false` khi thiếu credentials, silent hide ở client).

---

## Architecture

```mermaid
graph TD
    subgraph Client
        HP[Homepage - page.tsx]
        AP[Admin Panel - admin/page.tsx]
        SS[SteamStats component]
        HS[HoYoStats component]
    end

    subgraph API Routes
        GS[/api/games/search - Steam Store proxy]
        ST[/api/steam - Steam Stats]
        HY[/api/hoyolab - HoYoLAB Stats]
        GM[/api/games - CRUD]
    end

    subgraph External
        SStore[Steam Store Search API - public]
        SWeb[Steam Web API - requires key]
        HoYo[HoYoLAB API]
    end

    subgraph Database
        DB[(Supabase - games table)]
    end

    AP -->|search query| GS
    GS -->|proxy| SStore
    AP -->|save game| GM
    GM -->|read/write| DB

    HP -->|fetch games| GM
    HP -->|render| SS
    HP -->|render| HS
    SS -->|fetch stats| ST
    HS -->|fetch stats| HY
    ST -->|Steam Web API| SWeb
    HY -->|HoYoLAB API| HoYo
```

**Luồng dữ liệu chính:**

1. Admin tìm game → `/api/games/search` proxy → Steam Store → dropdown
2. Admin chọn game → auto-fill title, steam_appid, image_url → lưu vào DB
3. Homepage load → `/api/games` trả về records kèm steam_appid/steam_id
4. SteamStats fetch `/api/steam?appid=X&steamid=Y` → server gọi Steam Web API → trả về stats đã format

---

## Components and Interfaces

### `/api/games/search` (mới)

Proxy endpoint để tránh CORS khi gọi Steam Store Search từ browser.

```typescript
// GET /api/games/search?term={query}
// Response:
type SteamSearchResult = {
  appid: number;
  name: string;
  // image_url được tính từ CDN: https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg
};

type SearchResponse = {
  results: SteamSearchResult[];
};
```

Middleware cần cho phép GET requests tới `/api/games/search` (hiện tại GET đã được allow theo rule chung — không cần thay đổi middleware).

### `/api/steam` (mới)

Server-side endpoint bảo vệ `STEAM_API_KEY`. Pattern giống `/api/hoyolab`.

```typescript
// GET /api/steam?appid={appid}&steamid={steamid}

// Khi STEAM_API_KEY không được set:
type DisabledResponse = { enabled: false };

// Khi thành công:
type SteamStatsResponse = {
  enabled: true;
  cached: boolean;
  hours_total: number; // tổng giờ chơi, làm tròn 1 chữ số thập phân
  hours_2weeks: number; // giờ chơi 2 tuần gần nhất
  last_played: number; // Unix timestamp
  achievements_unlocked: number;
  achievements_total: number;
};

// Khi lỗi:
type ErrorResponse = { error: string };
```

Cache key: `${appid}:${steamid}`, TTL: 30 phút (khớp với HoYoLAB pattern nhưng TTL ngắn hơn vì stats thay đổi thường xuyên hơn).

### `SteamStats` component (mới)

```typescript
type Props = {
  appid: string;
  steamid: string;
};
```

Behavior:

- Fetch `/api/steam?appid={appid}&steamid={steamid}` khi mount
- Loading: spinner + "Loading stats..."
- `enabled: false` → render null (silent hide)
- Error → render null, log to console
- Success → hiển thị stats grid (style giống HoYoStats)

### Admin Game Form (cập nhật)

Thêm state mới vào `gameForm`:

```typescript
type GameFormState = {
  // existing
  title: string;
  profile_url: string;
  status: "online" | "offline";
  image_url: string;
  hoyolab_game: string;
  hoyolab_uid: string;
  hoyolab_server: string;
  // new
  steam_appid: string;
  steam_id: string;
  // UI-only (không lưu DB)
  platform: "none" | "steam" | "hoyolab";
  steamSearchQuery: string;
  steamSearchResults: SteamSearchResult[];
  steamSearchLoading: boolean;
  steamSearchError: string | null;
};
```

Platform selector logic:

- Khi switch sang "steam" → clear hoyolab fields
- Khi switch sang "hoyolab" → clear steam fields
- Khi switch sang "none" → clear cả hai

Steam ID extraction (client-side helper):

```typescript
function extractSteamId(input: string): string {
  // Nếu input chứa steamcommunity.com và có numeric ID trong URL
  // e.g. https://steamcommunity.com/profiles/76561198XXXXXXXXX
  const match = input.match(/\/profiles\/(\d{17})/);
  if (match) return match[1];
  // Nếu là numeric string thuần túy → trả về as-is
  if (/^\d+$/.test(input.trim())) return input.trim();
  return input; // fallback
}
```

### Middleware (cập nhật nhỏ)

Middleware hiện tại đã cho phép tất cả GET requests. `/api/games/search` là GET-only nên không cần thay đổi. Tuy nhiên, cần thêm comment rõ ràng để document điều này.

---

## Data Models

### Database Schema

```sql
-- sql/add_steam_fields.sql
ALTER TABLE games ADD COLUMN IF NOT EXISTS steam_appid text;
ALTER TABLE games ADD COLUMN IF NOT EXISTS steam_id    text;
```

### Updated `Game` type (client-side)

```typescript
type Game = {
  id: string;
  title: string;
  profile_url: string | null;
  status: "online" | "offline" | null;
  image_url: string | null;
  // HoYoLAB (existing)
  hoyolab_game: "genshin" | "hsr" | "hi3" | "zzz" | null;
  hoyolab_uid: string | null;
  hoyolab_server: string | null;
  // Steam (new)
  steam_appid: string | null;
  steam_id: string | null;
};
```

### Steam API Response Mapping

```
IPlayerService/GetRecentlyPlayedGames/v0001
  → response.games[].appid          → match với target appid
  → response.games[].playtime_forever → hours_total (/ 60, round 1dp)
  → response.games[].playtime_2weeks  → hours_2weeks (/ 60, round 1dp)
  → response.games[].rtime_last_played → last_played (Unix timestamp)

ISteamUserStats/GetUserStatsForGame/v0002
  → response.playerstats.achievements[].achieved === 1 → achievements_unlocked
  → response.playerstats.achievements.length           → achievements_total
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

Sau khi phân tích prework, các properties có thể gộp/loại bỏ:

- **1.4 + 3.5**: Cả hai đều test rằng dữ liệu được lưu và trả về đúng → gộp thành một "data round-trip" property
- **2.3 + 2.6-2.9**: Cả hai liên quan đến rendering/selection của search results → gộp thành một "selection populates fields" property
- **5.4 + 5.5**: Cả hai test transformation logic của `/api/steam` → gộp thành một "stats transformation" property
- **6.3 + 6.4 + 6.5 + 6.6**: Tất cả test formatting functions của SteamStats → gộp thành một "stats display formatting" property
- **7.5 + 7.6**: Cả hai test platform switch clearing → gộp thành một "platform switch clears fields" property

---

### Property 1: Steam fields round-trip through API

_For any_ game record stored in the database with `steam_appid` and `steam_id` values, a GET request to `/api/games` should return those exact values in the corresponding record — neither truncated, transformed, nor omitted.

**Validates: Requirements 1.4, 3.5**

---

### Property 2: Steam search result selection populates all fields correctly

_For any_ Steam search result object `{ appid, name }`, selecting it in the admin form should set `title = name`, `steam_appid = String(appid)`, and `image_url = "https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg"`, and the search dropdown should be closed.

**Validates: Requirements 2.3, 2.6, 2.7, 2.8, 2.9, 4.1**

---

### Property 3: Steam ID extraction from profile URLs

_For any_ Steam profile URL of the form `https://steamcommunity.com/profiles/{17-digit-id}`, the `extractSteamId` function should return only the 17-digit numeric string. For any input that is already a purely numeric string, the function should return it unchanged.

**Validates: Requirements 3.2, 3.3**

---

### Property 4: Steam stats transformation correctness

_For any_ raw Steam API response from `GetRecentlyPlayedGames` containing the target game, the `/api/steam` route's transformation logic should produce:

- `hours_total` = `playtime_forever / 60` rounded to 1 decimal place
- `hours_2weeks` = `playtime_2weeks / 60` rounded to 1 decimal place (0 if field absent)
- `last_played` = `rtime_last_played` unchanged

_For any_ array of achievement objects from `GetUserStatsForGame`, the transformation should produce:

- `achievements_unlocked` = count of objects where `achieved > 0`
- `achievements_total` = total array length

**Validates: Requirements 5.4, 5.5**

---

### Property 5: Steam stats cache prevents duplicate API calls

_For any_ `appid:steamid` pair, calling `/api/steam` twice within 30 minutes should result in exactly one call to the Steam Web API, with the second response returning `cached: true` and identical data.

**Validates: Requirements 5.8**

---

### Property 6: SteamStats display formatting

_For any_ `SteamStatsResponse` object, the rendered SteamStats component should:

- Display `hours_total` as the string `"{hours_total} giờ"`
- Display `hours_2weeks` as `"{hours_2weeks} giờ / 2 tuần"` when `hours_2weeks > 0`
- Display achievements as `"{achievements_unlocked}/{achievements_total} achievements"` when both are present
- Display `last_played` as a non-empty relative time string when present

**Validates: Requirements 6.3, 6.4, 6.5, 6.6**

---

### Property 7: Platform switch clears opposing fields

_For any_ form state where Steam fields (`steam_appid`, `steam_id`) have non-empty values, switching the platform selector to "HoYoLAB" or "Không có" should result in both Steam fields being cleared to empty string/null.

_For any_ form state where HoYoLAB fields (`hoyolab_game`, `hoyolab_uid`, `hoyolab_server`) have non-empty values, switching the platform selector to "Steam" or "Không có" should result in all three HoYoLAB fields being cleared.

**Validates: Requirements 7.5, 7.6**

---

## Error Handling

| Scenario                                    | Behavior                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `STEAM_API_KEY` not set                     | `/api/steam` returns `{ enabled: false }`, SteamStats renders null                        |
| Steam API network error                     | `/api/steam` returns HTTP 500 with error message, SteamStats renders null + console.error |
| Game not found in user's library            | `/api/steam` returns HTTP 500 "Game not found in library", SteamStats renders null        |
| Steam search network error                  | Admin panel shows "Lỗi tìm kiếm Steam, thử lại sau"                                       |
| Steam search returns empty                  | Admin panel shows "Không tìm thấy game nào"                                               |
| `steam_appid` set but `steam_id` empty      | Record saved with `steam_id = null`, SteamStats not rendered (condition requires both)    |
| Invalid Steam profile URL format            | `extractSteamId` returns input as-is (fallback), admin can correct manually               |
| Supabase column missing (migration not run) | `/api/games` returns records without steam fields (null), no crash — graceful degradation |

---

## Testing Strategy

### Unit Tests (example-based)

Tập trung vào các behaviors cụ thể không phù hợp với PBT:

- `extractSteamId`: test với URL hợp lệ, URL không hợp lệ, numeric string, empty string
- `/api/steam` khi `STEAM_API_KEY` không set → `{ enabled: false }`
- `/api/steam` khi Steam API trả về lỗi → HTTP 500
- SteamStats loading state, enabled=false state, error state
- Admin form: platform selector rendering, conditional field visibility
- Admin form: pre-selection khi edit game có steam_appid hoặc hoyolab_game

### Property-Based Tests

Sử dụng **fast-check** (TypeScript PBT library). Mỗi property test chạy tối thiểu 100 iterations.

**Property 1 — Steam fields round-trip:**

```
// Feature: game-api-integration, Property 1: steam fields round-trip through API
fc.property(fc.record({ steam_appid: fc.string(), steam_id: fc.string() }), ...)
```

**Property 2 — Search result selection:**

```
// Feature: game-api-integration, Property 2: steam search result selection populates all fields correctly
fc.property(fc.record({ appid: fc.integer({ min: 1 }), name: fc.string({ minLength: 1 }) }), ...)
```

**Property 3 — Steam ID extraction:**

```
// Feature: game-api-integration, Property 3: steam ID extraction from profile URLs
fc.property(fc.bigInt({ min: 76561197960265729n, max: 76561202255233023n }), ...)
// Test both URL format and plain numeric format
```

**Property 4 — Stats transformation:**

```
// Feature: game-api-integration, Property 4: steam stats transformation correctness
fc.property(
  fc.record({
    playtime_forever: fc.integer({ min: 0 }),
    playtime_2weeks: fc.option(fc.integer({ min: 0 })),
    rtime_last_played: fc.integer({ min: 0 }),
  }),
  fc.array(fc.record({ achieved: fc.integer({ min: 0, max: 1 }) })),
  ...
)
```

**Property 5 — Cache behavior:**

```
// Feature: game-api-integration, Property 5: steam stats cache prevents duplicate API calls
fc.property(
  fc.record({ appid: fc.string(), steamid: fc.string() }),
  ...
)
// Mock Steam API call counter, verify called exactly once for two requests
```

**Property 6 — Display formatting:**

```
// Feature: game-api-integration, Property 6: SteamStats display formatting
fc.property(
  fc.record({
    hours_total: fc.float({ min: 0 }),
    hours_2weeks: fc.float({ min: 0 }),
    achievements_unlocked: fc.integer({ min: 0 }),
    achievements_total: fc.integer({ min: 0 }),
    last_played: fc.integer({ min: 0 }),
  }),
  ...
)
```

**Property 7 — Platform switch:**

```
// Feature: game-api-integration, Property 7: platform switch clears opposing fields
fc.property(
  fc.record({
    steam_appid: fc.string({ minLength: 1 }),
    steam_id: fc.string({ minLength: 1 }),
    hoyolab_game: fc.string({ minLength: 1 }),
    hoyolab_uid: fc.string({ minLength: 1 }),
    hoyolab_server: fc.string({ minLength: 1 }),
  }),
  ...
)
```

### Integration Tests

- `/api/games/search` proxy: verify request forwarded to Steam Store URL với đúng `term` param
- `/api/steam` với mocked Steam Web API: verify cả hai endpoints được gọi, response được format đúng
- Admin form submit: verify `steam_appid` và `steam_id` được gửi trong request body

### Smoke Tests

- SQL migration file tồn tại và chứa `IF NOT EXISTS` guards
- `STEAM_API_KEY` không có prefix `NEXT_PUBLIC_` trong codebase
- `/api/steam` endpoint tồn tại và trả về response (không 404)
