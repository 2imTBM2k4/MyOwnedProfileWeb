import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase.from('games').select('*').eq('id', params.id).single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể lấy thông tin trò chơi." }, { status: 503 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const body = await request.json()
    const { data, error } = await supabase.from('games').update(body as any).eq('id', params.id).select()
    if (error) {
      console.error('PATCH games error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Không thể cập nhật trò chơi." }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from('games').delete().eq('id', params.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: "Không thể xóa trò chơi." }, { status: 503 })
  }
}
