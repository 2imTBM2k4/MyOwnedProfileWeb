import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Không thể lấy danh sách trò chơi." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const body = await request.json();
    const { data, error } = await supabase
      .from("games")
      .insert(body as any)
      .select();
    if (error) {
      console.error("POST games error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không thể thêm trò chơi." }, { status: 503 });
  }
}
