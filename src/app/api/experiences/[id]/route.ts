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
    if (body.company !== undefined) updateData.company = String(body.company).trim()
    if (body.role !== undefined) updateData.role = String(body.role).trim()
    if (body.role_en !== undefined) updateData.role_en = body.role_en ? String(body.role_en).trim() : null
    if (body.summary !== undefined) updateData.summary = body.summary ? String(body.summary).trim() : null
    if (body.summary_en !== undefined) updateData.summary_en = body.summary_en ? String(body.summary_en).trim() : null
    if (body.points !== undefined) updateData.points = Array.isArray(body.points) ? body.points : []
    if (body.points_en !== undefined) updateData.points_en = Array.isArray(body.points_en) ? body.points_en : []
    if (body.start_date !== undefined) updateData.start_date = body.start_date ? String(body.start_date).trim() : null
    if (body.end_date !== undefined) updateData.end_date = body.end_date ? String(body.end_date).trim() : null
    if (body.is_current !== undefined) updateData.is_current = Boolean(body.is_current)
    if (body.project_link !== undefined) updateData.project_link = body.project_link ? String(body.project_link).trim() : '#work'
    if (body.display_order !== undefined) updateData.display_order = Number(body.display_order) || 0

    const { data, error } = await supabase
      .from('experiences')
      .update(updateData)
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('EXPERIENCES UPDATE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy kinh nghiệm." }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể cập nhật kinh nghiệm." }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', params.id)
      .select('id')

    if (error) {
      console.error('EXPERIENCES DELETE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy kinh nghiệm." }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Không thể xóa kinh nghiệm." }, { status: 503 })
  }
}

