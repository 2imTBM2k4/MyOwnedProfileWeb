import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from('projects').select('*').eq('id', params.id).single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể xử lý dự án. Kiểm tra SUPABASE_SECRET_KEY trên máy chủ và thử lại." }, { status: 503 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()

    const { tags, ...rest } = body as any
    const updateData = {
      ...rest,
      tags: tags || undefined
    }

    const { data, error } = await supabase.from('projects').update(updateData).eq('id', params.id).select()
    if (error) {
      console.error('PROJECTS UPDATE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy dự án." }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể xử lý dự án. Kiểm tra SUPABASE_SECRET_KEY trên máy chủ và thử lại." }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from('projects').delete().eq('id', params.id).select('id')
    if (error) {
      console.error('PROJECTS DELETE ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data.length) return NextResponse.json({ error: "Không tìm thấy dự án." }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Không thể xử lý dự án. Kiểm tra SUPABASE_SECRET_KEY trên máy chủ và thử lại." }, { status: 503 })
  }
}
