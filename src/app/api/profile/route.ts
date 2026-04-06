import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from('profile').select('*').single()
  if (error) return NextResponse.json(null)
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServerClient()
  const body = await request.json()
  // upsert with fixed id=1
  const { data, error } = await supabase
    .from('profile')
    .upsert({ id: 1, ...body })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
