import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { CV_BUCKET, CV_FILENAME, validateCv } from "@/lib/cv";

export const dynamic = "force-dynamic";

export async function HEAD() {
  try {
    const storage = getSupabaseAdminClient().storage.from(CV_BUCKET);
    const { data, error } = await storage.list("", { search: CV_FILENAME, limit: 100 });
    if (error) return new Response(null, { status: 503 });
    return new Response(null, { status: data.some(file => file.name === CV_FILENAME) ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 503 });
  }
}

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdminClient().storage.from(CV_BUCKET).download(CV_FILENAME);
    if (error) {
      const missing = "statusCode" in error && ["404", "400"].includes(String(error.statusCode)) && /not found|does not exist/i.test(error.message);
      return NextResponse.json({ error: missing ? "Chưa có CV để tải xuống." : "Chưa thể tải CV. Vui lòng thử lại sau." }, { status: missing ? 404 : 503 });
    }
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Tran-Binh-Minh-CV.pdf"',
        "Content-Length": String(data.size),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Chưa thể tải CV. Kiểm tra cấu hình Supabase trên máy chủ." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Chọn tệp CV để tải lên." }, { status: 400 });
    const validation = await validateCv(file);
    if (validation) return NextResponse.json({ error: validation }, { status: 400 });
    const { error } = await getSupabaseAdminClient().storage.from(CV_BUCKET).upload(CV_FILENAME, file, {
      contentType: "application/pdf", upsert: true, cacheControl: "0",
    });
    if (error) return NextResponse.json({ error: "Chưa thể lưu CV. Kiểm tra vùng lưu trữ cvs và cấu hình máy chủ." }, { status: 503 });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Chưa thể tải CV lên. Vui lòng thử lại." }, { status: 503 });
  }
}
