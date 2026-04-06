import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser/client-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client for Server Components and Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

// Types
export type Database = {
  public: {
    Tables: {
      gears: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: string | null
          image_url: string | null
          purchase_date: string | null
          status: 'active' | 'retired' | null
          notes: string | null
          created_at: string
        }
        Insert: {
          name: string
          brand?: string | null
          category?: string | null
          image_url?: string | null
          purchase_date?: string | null
          status?: 'active' | 'retired'
          notes?: string | null
        }
        Update: {
          name?: string
          brand?: string | null
          category?: string | null
          image_url?: string | null
          purchase_date?: string | null
          status?: 'active' | 'retired'
          notes?: string | null
        }
      }
      social_links: {
        Row: {
          id: string
          platform: string
          url: string
          icon: string | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          platform: string
          url: string
          icon?: string | null
          display_order?: number | null
        }
        Update: {
          platform?: string
          url?: string
          icon?: string | null
          display_order?: number | null
        }
      }
      games: {
        Row: {
          id: string
          title: string
          genre: string | null
          status: 'playing' | 'completed' | 'plan_to_play' | 'dropped' | null
          hours_played: number | null
          profile_links: any | null
          notes: string | null
          created_at: string
        }
        Insert: {
          title: string
          genre?: string | null
          status?: 'playing' | 'completed' | 'plan_to_play' | 'dropped'
          hours_played?: number | null
          profile_links?: any | null
          notes?: string | null
        }
        Update: {
          title?: string
          genre?: string | null
          status?: 'playing' | 'completed' | 'plan_to_play' | 'dropped'
          hours_played?: number
          profile_links?: any | null
          notes?: string | null
        }
      }
    }
  }
}
