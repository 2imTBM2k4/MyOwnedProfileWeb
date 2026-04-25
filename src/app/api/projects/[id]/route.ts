import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from('projects').select('*').eq('id', params.id).single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient()
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
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from('projects').delete().eq('id', params.id)
  if (error) {
    console.error('PROJECTS DELETE ERROR:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
