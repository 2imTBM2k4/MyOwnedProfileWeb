import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json(
      { error: "Không thể tải danh sách kinh nghiệm. Vui lòng thử lại sau." },
      { status: 503 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()

    const {
      company,
      role,
      role_en,
      summary,
      summary_en,
      points,
      points_en,
      start_date,
      end_date,
      is_current,
      project_link,
      display_order,
    } = body

    if (!company || !role) {
      return NextResponse.json(
        { error: "Tên công ty và vị trí công việc không được để trống." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('experiences')
      .insert({
        company: String(company).trim(),
        role: String(role).trim(),
        role_en: role_en ? String(role_en).trim() : null,
        summary: summary ? String(summary).trim() : null,
        summary_en: summary_en ? String(summary_en).trim() : null,
        points: Array.isArray(points) ? points : [],
        points_en: Array.isArray(points_en) ? points_en : [],
        start_date: start_date ? String(start_date).trim() : null,
        end_date: end_date ? String(end_date).trim() : null,
        is_current: Boolean(is_current),
        project_link: project_link ? String(project_link).trim() : '#work',
        display_order: Number(display_order) || 0,
      })
      .select()

    if (error) {
      console.error('EXPERIENCES INSERT ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Không thể thêm kinh nghiệm làm việc mới." },
      { status: 503 }
    )
  }
}

