import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (server-side only)
// This should only be used in API routes, not in client components
export function createSupabaseAdmin() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database Types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string | null
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at?: string | null
  author: string
  meta_title?: string
  meta_description?: string
  read_time?: number
  is_featured?: boolean
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface BlogMedia {
  id: string
  filename: string
  original_name: string
  url: string
  size: number
  mime_type: string
  alt_text?: string
  created_at: string
}

export interface PostCategory {
  post_id: string
  category_id: string
}

export interface PostTag {
  post_id: string
  tag_id: string
}