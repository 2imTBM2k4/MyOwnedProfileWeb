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
    if (body.name !== undefined) updateData.name = String(body.name).trim()
    if (body.slug !== undefined) updateData.slug = String(body.slug).trim().toLowerCase()
    if (body.category !== undefined) updateData.category = String(body.category).trim()
    if (body.invert !== undefined) updateData.invert = Boolean(body.invert)
    if (body.display_order !== undefined) updateData.display_order = Number(body.display_order) || 0

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('SKILLS UPDATE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy kỹ năng." }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể cập nhật kỹ năng." }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('skills')
      .delete()
      .eq('id', params.id)
      .select('id')

    if (error) {
      console.error('SKILLS DELETE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy kỹ năng." }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Không thể xóa kỹ năng." }, { status: 503 })
  }
}

