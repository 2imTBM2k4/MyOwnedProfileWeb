import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");

  if (!term) {
    return NextResponse.json({ error: "Missing term" }, { status: 400 });
  }

  try {
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
    const res = await fetch(url, { next: { revalidate: 0 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Steam search failed" },
        { status: 502 },
      );
    }

    const json = await res.json();
    const results = (json.items || []).map((item: any) => ({
      appid: item.id,
      name: item.name,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Steam search error:", err);
    return NextResponse.json({ error: "Steam search failed" }, { status: 502 });
  }
}
