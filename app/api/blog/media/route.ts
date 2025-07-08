import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload to Supabase Storage
    const supabaseAdmin = createSupabaseAdmin()
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(fileName, file)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(fileName)
    
    // Save to database
    const { data, error } = await supabaseAdmin
      .from('blog_media')
      .insert({
        filename: fileName,
        original_name: file.name,
        url: publicUrl,
        size: file.size,
        mime_type: file.type,
        alt_text: altText
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save file info' }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}