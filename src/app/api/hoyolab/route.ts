import { NextResponse } from "next/server";
import { createHash } from "crypto";

const GAME_IDS: Record<string, number> = {
  genshin: 2,
  hsr: 6,
  hi3: 1,
  zzz: 8,
};

const ENDPOINTS: Record<string, string> = {
  genshin: "https://bbs-api-os.hoyolab.com/game_record/genshin/api/index",
  hsr: "https://bbs-api-os.hoyolab.com/game_record/hkrpg/api/index",
  hi3: "https://bbs-api-os.hoyolab.com/game_record/honkai3rd/api/index",
  // ZZZ endpoint - alternative
  zzz: "https://bbs-api-os.hoyolab.com/game_record/zzz/api/index",
};

const DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";

function generateDS(): string {
  const t = Math.floor(Date.now() / 1000);
  const r = Math.random().toString(36).slice(2, 8);
  const h = createHash("md5")
    .update(`salt=${DS_SALT}&t=${t}&r=${r}`)
    .digest("hex");
  return `${t},${r},${h}`;
}

const cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 60 * 60 * 1000;

async function fetchHoYoStats(game: string, uid: string, server: string) {
  const cacheKey = `${game}:${uid}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL) {
    return { data: cache[cacheKey].data, cached: true };
  }

  const ltoken = process.env.HOYOLAB_LTOKEN;
  const ltuid = process.env.HOYOLAB_LTUID;

  if (!ltoken || !ltuid) return { error: "HoYoLAB credentials not configured" };

  const endpoint = ENDPOINTS[game];
  if (!endpoint) return { error: "Unknown game" };

  const url = `${endpoint}?server=${server}&role_id=${uid}`;

  try {
    console.log(`Fetching HoYoLAB ${game} data from:`, url);

    const res = await fetch(url, {
      headers: {
        Cookie: `ltoken_v2=${ltoken}; ltuid_v2=${ltuid}`,
        DS: generateDS(),
        "x-rpc-app_version": "1.5.0",
        "x-rpc-client_type": "5",
        "x-rpc-language": "en-us",
        Origin: "https://act.hoyolab.com",
        Referer: "https://act.hoyolab.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log(`HoYoLAB ${game} fetch status:`, res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HoYoLAB ${game} HTTP error:`, res.status, errorText);
      return {
        error: `HTTP ${res.status}: ${res.statusText}`,
        retcode: res.status,
      };
    }

    const json = await res.json();
    console.log(
      `HoYoLAB ${game.toUpperCase()} response:`,
      JSON.stringify({
        retcode: json.retcode,
        message: json.message,
        hasData: !!json.data,
        dataKeys: json.data ? Object.keys(json.data) : [],
      }),
    );

    if (json.retcode !== 0) {
      console.error(`HoYoLAB ${game} error details:`, json);
      return {
        error: json.message || "HoYoLAB API error",
        retcode: json.retcode,
      };
    }

    cache[cacheKey] = { data: json.data, ts: now };
    return { data: json.data, cached: false };
  } catch (err) {
    console.error(`HoYoLAB ${game} fetch error:`, err);
    console.error(`Error details:`, {
      name: (err as Error).name,
      message: (err as Error).message,
      cause: (err as any).cause,
    });
    return { error: `Failed to fetch HoYoLAB data: ${(err as Error).message}` };
  }
}

export async function GET(request: Request) {
  if (!process.env.HOYOLAB_LTOKEN || !process.env.HOYOLAB_LTUID) {
    return NextResponse.json({ enabled: false });
  }

  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game");
  const uid = searchParams.get("uid");
  const server = searchParams.get("server");

  if (!game || !uid || !server) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (!GAME_IDS[game]) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  const result = await fetchHoYoStats(game, uid, server);

  if (result.error) {
    console.error(
      "HoYoLAB error:",
      result.error,
      "retcode:",
      (result as any).retcode,
    );
    return NextResponse.json(
      { error: result.error, retcode: (result as any).retcode },
      { status: 500 },
    );
  }

  return NextResponse.json({
    enabled: true,
    game,
    uid,
    server,
    cached: result.cached,
    data: formatStats(game, result.data),
  });
}

function formatStats(game: string, raw: any) {
  if (game === "genshin") {
    return {
      characters: raw.stats?.avatar_number,
      achievements: raw.stats?.achievement_number,
      days_active: raw.stats?.active_day_number,
      spiral_abyss: raw.stats?.spiral_abyss,
      chests: raw.stats?.common_chest_number,
    };
  }

  if (game === "hsr") {
    // Actual field names from raw.stats based on real API response
    return {
      characters: raw.stats?.avatar_num,
      achievements: raw.stats?.achievement_num,
      days_active: raw.stats?.active_days,
      chests: raw.stats?.chest_num,
      abyss: raw.stats?.abyss_process,
    };
  }

  if (game === "hi3") {
    return {
      characters: raw.stats?.avatar_number,
      days_active: raw.stats?.active_day_number,
    };
  }

  if (game === "zzz") {
    // ZZZ (Zenless Zone Zero) stats
    // Note: ZZZ API endpoint may not be available yet or requires different authentication
    // Log raw data to debug
    console.log("ZZZ raw data:", JSON.stringify(raw));
    console.log("ZZZ stats:", JSON.stringify(raw.stats));

    // Return empty if no stats available
    if (!raw.stats) {
      console.warn("ZZZ stats not available - API may not be ready");
      return {};
    }

    return {
      level: raw.stats?.level,
      characters: raw.stats?.avatar_num,
      achievements: raw.stats?.achievement_count || raw.stats?.achievement_num,
      days_active: raw.stats?.active_days,
      // Additional ZZZ-specific stats
      world_level: raw.stats?.world_level_name,
      shiyu_defense: raw.stats?.cur_period_zone_layer_count,
      bangboo: raw.stats?.bangboo_num,
    };
  }

  return {};
}
