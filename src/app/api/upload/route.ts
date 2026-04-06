import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

const ALLOWED_BUCKETS = ['avatars', 'covers', 'gears', 'games']

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const formData = await request.formData()
  const file = formData.get('file') as File
  const bucket = (formData.get('bucket') as string) || 'avatars'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!ALLOWED_BUCKETS.includes(bucket)) return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type, upsert: true })

  if (error) {
    console.error('Storage upload error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}
