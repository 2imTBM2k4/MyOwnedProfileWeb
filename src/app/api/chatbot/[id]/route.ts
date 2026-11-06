import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()

    const updateData: Record<string, any> = {}
    if (body.topic_id !== undefined) updateData.topic_id = String(body.topic_id).trim().toLowerCase()
    if (body.label !== undefined) updateData.label = String(body.label).trim()
    if (body.keywords !== undefined) updateData.keywords = Array.isArray(body.keywords) ? body.keywords : []
    if (body.response !== undefined) updateData.response = String(body.response).trim()
    if (body.response_en !== undefined) updateData.response_en = body.response_en ? String(body.response_en).trim() : null
    if (body.display_order !== undefined) updateData.display_order = Number(body.display_order) || 0

    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .update(updateData)
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('CHATBOT UPDATE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy chủ đề chatbot." }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể cập nhật chủ đề chatbot." }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .delete()
      .eq('id', params.id)
      .select('id')

    if (error) {
      console.error('CHATBOT DELETE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy chủ đề chatbot." }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Không thể xóa chủ đề chatbot." }, { status: 503 })
  }
}

