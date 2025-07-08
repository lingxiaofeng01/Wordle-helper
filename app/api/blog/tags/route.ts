import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { generateSlug } from '@/lib/blog-api'

export async function GET() {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('blog_tags')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const slug = generateSlug(name)
    const supabaseAdmin = createSupabaseAdmin()
    
    // 首先检查标签是否已存在
    const { data: existingTag, error: checkError } = await supabaseAdmin
      .from('blog_tags')
      .select('*')
      .eq('name', name.trim())
      .single()
    
    // 如果标签已存在，返回现有标签
    if (existingTag && !checkError) {
      return NextResponse.json({ data: existingTag })
    }
    
    // 如果不存在，创建新标签
    const { data, error } = await supabaseAdmin
      .from('blog_tags')
      .insert({ name: name.trim(), slug })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}