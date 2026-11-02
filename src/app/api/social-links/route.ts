import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from('social_links').select('*').order('display_order', { ascending: true })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể lấy danh sách liên kết." }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()
    const { data, error } = await supabase.from('social_links').insert(body as any).select()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Không thể tạo liên kết." }, { status: 503 })
  }
}
