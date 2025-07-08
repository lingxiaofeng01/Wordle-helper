import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { generateSlug, calculateReadTime } from '@/lib/blog-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // 生成唯一的slug，排除当前文章ID
    const slug = await generateUniqueSlug(title, params.id)
    const readTime = calculateReadTime(content)
    
    const supabaseAdmin = createSupabaseAdmin()
    
    // Update the post
    const updateData: any = {
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
      updated_at: new Date().toISOString()
    }
    
    if (status === 'published') {
      updateData.published_at = new Date().toISOString()
    }
    
    const { data: post, error: postError } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (postError) throw postError
    
    // Update categories
    await supabaseAdmin
      .from('post_categories')
      .delete()
      .eq('post_id', params.id)
    
    if (categories.length > 0) {
      const { error: categoriesError } = await supabaseAdmin
        .from('post_categories')
        .insert(categories.map((categoryId: string) => ({
          post_id: params.id,
          category_id: categoryId
        })))
      
      if (categoriesError) {
        console.error('Error updating categories:', categoriesError)
      }
    }
    
    // Update tags
    await supabaseAdmin
      .from('post_tags')
      .delete()
      .eq('post_id', params.id)
    
    if (tags.length > 0) {
      const { error: tagsError } = await supabaseAdmin
        .from('post_tags')
        .insert(tags.map((tagId: string) => ({
          post_id: params.id,
          tag_id: tagId
        })))
      
      if (tagsError) {
        console.error('Error updating tags:', tagsError)
      }
    }
    
    return NextResponse.json({ data: post })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    // Delete post categories and tags first
    await supabaseAdmin.from('post_categories').delete().eq('post_id', params.id)
    await supabaseAdmin.from('post_tags').delete().eq('post_id', params.id)
    
    // Delete the post
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}

// 生成唯一slug的函数（复制自posts/route.ts）
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