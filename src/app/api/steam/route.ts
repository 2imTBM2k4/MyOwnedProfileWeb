import { NextResponse } from "next/server";

const cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 30 * 60 * 1000;

// Convert Steam vanity URL or custom ID to Steam ID 64
async function resolveSteamId(input: string): Promise<string> {
  // If already a numeric Steam ID, return it
  if (/^\d+$/.test(input)) {
    return input;
  }

  // Extract vanity name from URL or use input directly
  let vanityName = input;

  // Handle various Steam URL formats
  const urlPatterns = [
    /steamcommunity\.com\/id\/([^\/]+)/,
    /steamcommunity\.com\/profiles\/([^\/]+)/,
  ];

  for (const pattern of urlPatterns) {
    const match = input.match(pattern);
    if (match) {
      vanityName = match[1];
      // If it's already a numeric ID from /profiles/, return it
      if (/^\d+$/.test(vanityName)) {
        return vanityName;
      }
      break;
    }
  }

  // Resolve vanity name to Steam ID using Steam API
  const key = process.env.STEAM_API_KEY!;
  const resolveUrl =
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/` +
    `?key=${key}&vanityurl=${vanityName}`;

  const response = await fetch(resolveUrl);
  const data = await response.json();

  if (data.response?.success === 1) {
    return data.response.steamid;
  }

  throw new Error(`Could not resolve Steam ID from: ${input}`);
}

async function fetchSteamStats(appid: string, steamid: string) {
  const cacheKey = `${appid}:${steamid}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL) {
    return { ...cache[cacheKey].data, cached: true };
  }

  const key = process.env.STEAM_API_KEY!;

  // GetOwnedGames: trả về TẤT CẢ games (không giới hạn 2 tuần)
  const ownedUrl =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/` +
    `?key=${key}&steamid=${steamid}&include_appinfo=false&format=json`;

  // GetRecentlyPlayedGames: để lấy playtime_2weeks và last_played
  const recentUrl =
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/` +
    `?key=${key}&steamid=${steamid}&format=json`;

  // GetUserStatsForGame: achievements
  const statsUrl =
    `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/` +
    `?key=${key}&steamid=${steamid}&appid=${appid}&format=json`;

  const [ownedRes, recentRes, statsRes] = await Promise.all([
    fetch(ownedUrl, { next: { revalidate: 0 } }),
    fetch(recentUrl, { next: { revalidate: 0 } }),
    fetch(statsUrl, { next: { revalidate: 0 } }),
  ]);

  if (!ownedRes.ok) {
    throw new Error(`Steam API error: ${ownedRes.status}`);
  }

  const ownedJson = await ownedRes.json();
  const ownedGames: any[] = ownedJson.response?.games || [];
  const ownedGame = ownedGames.find(
    (g: any) => String(g.appid) === String(appid),
  );

  if (!ownedGame) {
    throw new Error("Game not found in library");
  }

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const hours_total = round1((ownedGame.playtime_forever || 0) / 60);

  // Lấy playtime_2weeks và last_played từ recently played (nếu có)
  let hours_2weeks = 0;
  let last_played = 0;
  if (recentRes.ok) {
    try {
      const recentJson = await recentRes.json();
      const recentGames: any[] = recentJson.response?.games || [];
      const recentGame = recentGames.find(
        (g: any) => String(g.appid) === String(appid),
      );
      if (recentGame) {
        hours_2weeks = round1((recentGame.playtime_2weeks || 0) / 60);
        last_played = recentGame.rtime_last_played || 0;
      }
    } catch {}
  }

  // Achievements
  let achievements_unlocked = 0;
  let achievements_total = 0;
  if (statsRes.ok) {
    try {
      const statsJson = await statsRes.json();
      const achievements: any[] = statsJson.playerstats?.achievements || [];
      achievements_total = achievements.length;
      achievements_unlocked = achievements.filter(
        (a: any) => a.achieved > 0,
      ).length;
    } catch {}
  }

  const data = {
    enabled: true,
    cached: false,
    hours_total,
    hours_2weeks,
    last_played,
    achievements_unlocked,
    achievements_total,
  };

  cache[cacheKey] = { data, ts: now };
  return data;
}

export async function GET(request: Request) {
  if (!process.env.STEAM_API_KEY) {
    return NextResponse.json({ enabled: false });
  }

  const { searchParams } = new URL(request.url);
  const appid = searchParams.get("appid");
  const steamidInput = searchParams.get("steamid");

  if (!appid || !steamidInput) {
    return NextResponse.json(
      { error: "Missing appid or steamid" },
      { status: 400 },
    );
  }

  try {
    // Resolve Steam ID from URL or vanity name
    const steamid = await resolveSteamId(steamidInput);
    const result = await fetchSteamStats(appid, steamid);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Steam stats error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch Steam stats" },
      { status: 500 },
    );
  }
}
