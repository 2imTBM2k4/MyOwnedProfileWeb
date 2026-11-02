import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("gears")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Không thể xử lý danh sách thiết bị." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const body = await request.json();
    const { data, error } = await supabase
      .from("gears")
      .insert(body as any)
      .select();
    if (error) {
      console.error("GEARS INSERT ERROR:", JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không thể thêm thiết bị." }, { status: 503 });
  }
}
