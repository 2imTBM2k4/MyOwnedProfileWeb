import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json(
      { error: "Không thể tải dữ liệu tri thức chatbot. Vui lòng thử lại sau." },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()

    const {
      topic_id,
      label,
      keywords,
      response,
      response_en,
      display_order,
    } = body

    if (!topic_id || !label || !response) {
      return NextResponse.json(
        { error: "Mã chủ đề (topic_id), nhãn (label) và câu trả lời (response) không được để trống." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .upsert({
        topic_id: String(topic_id).trim().toLowerCase(),
        label: String(label).trim(),
        keywords: Array.isArray(keywords) ? keywords : [],
        response: String(response).trim(),
        response_en: response_en ? String(response_en).trim() : null,
        display_order: Number(display_order) || 0,
      }, { onConflict: 'topic_id' })
      .select()

    if (error) {
      console.error('CHATBOT UPSERT ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Không thể lưu chủ đề tri thức chatbot." },
      { status: 503 }
    )
  }
}

