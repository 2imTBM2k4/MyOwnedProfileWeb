import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser/client-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client for Server Components and Server Actions
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any) {
        cookiesToSet.forEach(({ name, value, options }: any) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}

// Types
export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          username: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          created_at: string;
        };
        Insert: {
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
        };
        Update: {
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
        };
      };
      gears: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          category: string | null;
          image_url: string | null;
          purchase_date: string | null;
          status: "active" | "retired" | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          brand?: string | null;
          category?: string | null;
          image_url?: string | null;
          purchase_date?: string | null;
          status?: "active" | "retired" | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          brand?: string | null;
          category?: string | null;
          image_url?: string | null;
          purchase_date?: string | null;
          status?: "active" | "retired" | null;
          notes?: string | null;
        };
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          display_name: string | null;
          icon: string | null;
          display_order: number | null;
          created_at: string;
        };
        Insert: {
          platform: string;
          url: string;
          display_name?: string | null;
          icon?: string | null;
          display_order?: number | null;
        };
        Update: {
          platform?: string;
          url?: string;
          display_name?: string | null;
          icon?: string | null;
          display_order?: number | null;
        };
      };
      games: {
        Row: {
          id: string;
          title: string;
          profile_url: string | null;
          image_url: string | null;
          status: "online" | "offline" | null;
          hoyolab_game: "genshin" | "hsr" | "hi3" | "zzz" | null;
          hoyolab_uid: string | null;
          hoyolab_server: string | null;
          steam_appid: string | null;
          steam_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          title: string;
          profile_url?: string | null;
          image_url?: string | null;
          status?: "online" | "offline" | null;
          hoyolab_game?: "genshin" | "hsr" | "hi3" | "zzz" | null;
          hoyolab_uid?: string | null;
          hoyolab_server?: string | null;
          steam_appid?: string | null;
          steam_id?: string | null;
          notes?: string | null;
        };
        Update: {
          title?: string;
          profile_url?: string | null;
          image_url?: string | null;
          status?: "online" | "offline" | null;
          hoyolab_game?: "genshin" | "hsr" | "hi3" | "zzz" | null;
          hoyolab_uid?: string | null;
          hoyolab_server?: string | null;
          steam_appid?: string | null;
          steam_id?: string | null;
          notes?: string | null;
        };
      };
    };
  };
};
