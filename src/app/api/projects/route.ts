import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể xử lý dự án. Kiểm tra SUPABASE_SECRET_KEY trên máy chủ và thử lại." }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()

    const { tags, ...rest } = body as any
    const insertData = {
      ...rest,
      tags: tags || []
    }

    const { data, error } = await supabase.from('projects').insert(insertData).select()
    if (error) {
      console.error('PROJECTS INSERT ERROR:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Không thể xử lý dự án. Kiểm tra SUPABASE_SECRET_KEY trên máy chủ và thử lại." }, { status: 503 })
  }
}
