import { NextResponse } from "next/server";

type RAWGGame = {
  id: number;
  name: string;
  background_image: string;
  released: string;
  rating: number;
  platforms: Array<{ platform: { name: string } }>;
};

type RAWGResponse = {
  count: number;
  results: RAWGGame[];
};

/**
 * Search games on RAWG API
 * GET /api/games/search-rawg?query=genshin+impact
 */
export async function GET(request: Request) {
  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RAWG API key not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 },
    );
  }

  try {
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=10`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data: RAWGResponse = await response.json();

    // Format results for easier consumption
    const results = data.results.map((game) => ({
      id: game.id,
      name: game.name,
      image: game.background_image,
      released: game.released,
      rating: game.rating,
      platforms: game.platforms?.map((p) => p.platform.name) || [],
    }));

    return NextResponse.json({
      count: data.count,
      results,
    });
  } catch (error: any) {
    console.error("RAWG API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search games" },
      { status: 500 },
    );
  }
}
