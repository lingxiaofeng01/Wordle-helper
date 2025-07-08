import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    
    const supabaseAdmin = createSupabaseAdmin()
    
    // First get the current post's tags
    const { data: currentPost, error: currentPostError } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        tags:post_tags(tag:blog_tags(id))
      `)
      .eq('id', params.id)
      .single()
    
    if (currentPostError) throw currentPostError
    
    const tagIds = currentPost.tags?.map((pt: any) => pt.tag.id) || []
    
    let data, error
    
    if (tagIds.length === 0) {
      // If no tags, return recent posts
      const result = await supabaseAdmin
        .from('blog_posts')
        .select(`
          *,
          featured_image:blog_media(*),
          categories:post_categories(category:blog_categories(*)),
          tags:post_tags(tag:blog_tags(*))
        `)
        .eq('status', 'published')
        .neq('id', params.id)
        .order('published_at', { ascending: false })
        .limit(limit)
      
      data = result.data
      error = result.error
    } else {
      // Get posts with matching tags
      const { data: postIds } = await supabaseAdmin
        .from('post_tags')
        .select('post_id')
        .in('tag_id', tagIds)
      
      const matchingPostIds = postIds?.map(pt => pt.post_id) || []
      
      const result = await supabaseAdmin
        .from('blog_posts')
        .select(`
          *,
          featured_image:blog_media(*),
          categories:post_categories(category:blog_categories(*)),
          tags:post_tags(tag:blog_tags(*))
        `)
        .eq('status', 'published')
        .neq('id', params.id)
        .in('id', matchingPostIds)
        .order('published_at', { ascending: false })
        .limit(limit)
      
      data = result.data
      error = result.error
    }
    
    if (error) throw error
    
    const response = NextResponse.json({ data })
    
    // 添加缓存头 - 相关文章缓存时间较长
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=1800')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=1800')
    
    return response
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return NextResponse.json({ error: 'Failed to fetch related posts' }, { status: 500 })
  }
}