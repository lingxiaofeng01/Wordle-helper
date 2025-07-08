import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { generateSlug, calculateReadTime } from '@/lib/blog-api'

// 生成唯一slug的函数
async function generateUniqueSlug(baseTitle: string, excludeId?: string) {
  const supabaseAdmin = createSupabaseAdmin()
  let baseSlug = generateSlug(baseTitle)
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
    
    // 如果是更新操作，排除当前文章ID
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error checking slug uniqueness:', error)
      // 如果查询失败，使用时间戳确保唯一性
      return `${baseSlug}-${Date.now()}`
    }
    
    // 如果没有重复，返回当前slug
    if (!data || data.length === 0) {
      return slug
    }
    
    // 如果有重复，添加数字后缀
    counter++
    slug = `${baseSlug}-${counter}`
    
    // 防止无限循环
    if (counter > 100) {
      return `${baseSlug}-${Date.now()}`
    }
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        featured_image:blog_media(*),
        categories:post_categories(category:blog_categories(*)),
        tags:post_tags(tag:blog_tags(*))
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const response = NextResponse.json({ data })
    
    // 添加缓存头
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300')
    
    return response
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      excerpt, 
      content, 
      status, 
      author, 
      meta_title, 
      meta_description, 
      featured_image,
      is_featured = false,
      categories = [],
      tags = []
    } = body
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }
    
    // 验证字段长度限制
    if (meta_description && meta_description.length > 160) {
      return NextResponse.json({ error: 'SEO描述不能超过160个字符' }, { status: 400 })
    }
    
    if (meta_title && meta_title.length > 60) {
      return NextResponse.json({ error: 'SEO标题不能超过60个字符' }, { status: 400 })
    }
    
    if (title.length > 200) {
      return NextResponse.json({ error: '标题不能超过200个字符' }, { status: 400 })
    }
    
    // 生成唯一的slug
    const slug = await generateUniqueSlug(title)
    const readTime = calculateReadTime(content)
    
    // Create the post
    const supabaseAdmin = createSupabaseAdmin()
    const { data: post, error: postError } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        status,
        author,
        meta_title,
        meta_description,
        featured_image: featured_image || null,
        read_time: readTime,
        is_featured,
        published_at: status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single()
    
    if (postError) throw postError
    
    // Add categories if provided
    if (categories.length > 0) {
      const { error: categoriesError } = await supabaseAdmin
        .from('post_categories')
        .insert(categories.map((categoryId: string) => ({
          post_id: post.id,
          category_id: categoryId
        })))
      
      if (categoriesError) {
        console.error('Error adding categories:', categoriesError)
      }
    }
    
    // Add tags if provided
    if (tags.length > 0) {
      const { error: tagsError } = await supabaseAdmin
        .from('post_tags')
        .insert(tags.map((tagId: string) => ({
          post_id: post.id,
          tag_id: tagId
        })))
      
      if (tagsError) {
        console.error('Error adding tags:', tagsError)
      }
    }
    
    return NextResponse.json({ data: post })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}