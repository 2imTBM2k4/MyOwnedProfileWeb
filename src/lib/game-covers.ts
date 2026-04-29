// Default cover images for popular games
// These are fallback images if RAWG API fails or is not configured
export const GAME_COVERS: Record<string, string> = {
  // HoYoverse Games - High quality official art
  "genshin impact": "https://i.imgur.com/8zmHq5L.jpg",
  "honkai: star rail": "https://i.imgur.com/9YqJZ5M.jpg",
  "honkai impact 3rd": "https://i.imgur.com/3KqLp8N.jpg",
  "zenless zone zero": "https://i.imgur.com/7RqMn9P.jpg",

  // Alternative shorter names
  genshin: "https://i.imgur.com/8zmHq5L.jpg",
  hsr: "https://i.imgur.com/9YqJZ5M.jpg",
  "star rail": "https://i.imgur.com/9YqJZ5M.jpg",
  hi3: "https://i.imgur.com/3KqLp8N.jpg",
  zzz: "https://i.imgur.com/7RqMn9P.jpg",
  zenless: "https://i.imgur.com/7RqMn9P.jpg",

  // Popular Games - Using Steam CDN
  "league of legends":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg",
  valorant: "https://i.imgur.com/5KqNp7Q.jpg",
  minecraft:
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/header.jpg",
  fortnite: "https://i.imgur.com/2LqRm8S.jpg",
  "apex legends":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
  "counter-strike 2":
    "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  cs2: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  "dota 2": "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
  "overwatch 2": "https://i.imgur.com/4MqPn6R.jpg",
  pubg: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
  "call of duty": "https://i.imgur.com/6NqQo5T.jpg",
  roblox: "https://i.imgur.com/1OqSr4U.jpg",
};

/**
 * Get cover image URL for a game by title (from static list)
 * Returns null if no cover found
 */
export function getGameCover(title: string): string | null {
  const normalized = title.toLowerCase().trim();

  // Direct match
  if (GAME_COVERS[normalized]) {
    return GAME_COVERS[normalized];
  }

  // Partial match
  for (const [key, url] of Object.entries(GAME_COVERS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  return null;
}

/**
 * Search for game cover using RAWG API
 * This is an async function that fetches from the API
 */
export async function searchGameCover(title: string): Promise<string | null> {
  try {
    // First try static list
    const staticCover = getGameCover(title);
    if (staticCover) {
      return staticCover;
    }

    // Then try RAWG API
    const response = await fetch(
      `/api/games/search-rawg?query=${encodeURIComponent(title)}`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the first result's image
      return data.results[0].image;
    }

    return null;
  } catch (error) {
    console.error("Failed to search game cover:", error);
    return null;
  }
}
