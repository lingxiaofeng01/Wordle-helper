import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { generateSlug } from '@/lib/blog-api'

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const slug = generateSlug(name)
    const supabaseAdmin = createSupabaseAdmin()
    
    // 首先检查分类是否已存在
    const { data: existingCategory, error: checkError } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .eq('name', name.trim())
      .single()
    
    // 如果分类已存在，返回现有分类
    if (existingCategory && !checkError) {
      return NextResponse.json({ data: existingCategory })
    }
    
    // 如果不存在，创建新分类
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .insert({ name: name.trim(), slug, description })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}