import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from('social_links').select('*')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const body = await request.json()
  const { data, error } = await supabase.from('social_links').insert(body as any).select()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
