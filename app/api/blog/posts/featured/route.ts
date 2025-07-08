import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')
    
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        featured_image:blog_media(*),
        categories:post_categories(category:blog_categories(*)),
        tags:post_tags(tag:blog_tags(*))
      `)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    const response = NextResponse.json({ data })
    
    // 添加缓存头 - 精选文章缓存时间稍长
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600')
    
    return response
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return NextResponse.json({ error: 'Failed to fetch featured posts' }, { status: 500 })
  }
}