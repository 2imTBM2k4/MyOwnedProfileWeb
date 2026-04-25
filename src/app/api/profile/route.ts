import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  // Get the first (and only) profile row
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("GET profile error:", error.message);
    return NextResponse.json(null);
  }
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServerClient();
  const body = await request.json();

  // Check if a profile row already exists
  const { data: existing } = await supabase
    .from("profile")
    .select("id")
    .limit(1)
    .maybeSingle();

  let result;
  if (existing) {
    // Update existing row
    result = await supabase
      .from("profile")
      .update(body)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    // Insert first row
    result = await supabase.from("profile").insert(body).select().single();
  }

  if (result.error) {
    console.error("PATCH profile error:", result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data);
}
