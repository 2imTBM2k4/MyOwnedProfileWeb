import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json(
      { error: "Không thể tải danh sách kỹ năng. Vui lòng thử lại sau." },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()

    const { name, slug, category, invert, display_order } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Tên kỹ năng và mã định danh (slug) không được để trống." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: String(name).trim(),
        slug: String(slug).trim().toLowerCase(),
        category: category ? String(category).trim() : 'backend',
        invert: Boolean(invert),
        display_order: Number(display_order) || 0,
      })
      .select()

    if (error) {
      console.error('SKILLS INSERT ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Không thể thêm kỹ năng mới." },
      { status: 503 }
    )
  }
}

