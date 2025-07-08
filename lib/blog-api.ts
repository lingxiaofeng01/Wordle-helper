import { supabase } from './supabase'
import type { BlogPost, BlogCategory, BlogTag, BlogMedia } from './supabase'

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  // Handle Chinese characters by converting to pinyin or using transliteration
  // For now, we'll use a simple mapping for common Chinese words
  const chineseToEnglish: { [key: string]: string } = {
    '规范': 'standard',
    '合格': 'qualified',
    '测试': 'test',
    '文章': 'article',
    '博客': 'blog',
    '内容': 'content',
    '发布': 'publish',
    '策略': 'strategy',
    '技巧': 'tips',
    '指南': 'guide',
    '教程': 'tutorial',
    '分析': 'analysis',
    '研究': 'research',
    '游戏': 'game',
    '单词': 'word',
    '字母': 'letter',
    '答案': 'answer',
    '提示': 'hint',
    '帮助': 'help',
    '工具': 'tool'
  }
  
  let processedTitle = title.toLowerCase()
  
  // Replace Chinese words with English equivalents
  Object.entries(chineseToEnglish).forEach(([chinese, english]) => {
    processedTitle = processedTitle.replace(new RegExp(chinese, 'g'), english)
  })
  
  // Remove any remaining non-ASCII characters and process
  const slug = processedTitle
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[^a-z0-9 -]/g, '') // Keep only letters, numbers, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim()
  
  // If slug is empty, generate a fallback
  if (!slug) {
    return `post-${Date.now()}`
  }
  
  return slug
}

// Utility function to calculate read time
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(' ').length
  return Math.ceil(words / wordsPerMinute)
}

// Blog Posts API
export const blogAPI = {
  // Get all posts for admin
  async getAllPosts() {
    const response = await fetch('/api/blog/posts')
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    const result = await response.json()
    return result.data
  },

  // Get published posts for public (optimized for blog list)
  async getPublishedPosts(limit?: number) {
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        status,
        published_at,
        author,
        read_time,
        is_featured,
        featured_image:blog_media(id, url, alt_text),
        categories:post_categories(category:blog_categories(id, name, slug)),
        tags:post_tags(tag:blog_tags(id, name, slug))
      `)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get featured posts (lightweight)
  async getFeaturedPosts(limit = 5) {
    const response = await fetch(`/api/blog/posts/featured?limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch featured posts')
    }
    const result = await response.json()
    return result.data
  },

  // Get related posts by ID (optimized)
  async getRelatedPosts(postId: string, limit = 4) {
    const response = await fetch(`/api/blog/posts/related/${postId}?limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch related posts')
    }
    const result = await response.json()
    return result.data
  },

  // Get post by slug (full content)
  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        status,
        published_at,
        author,
        meta_title,
        meta_description,
        read_time,
        is_featured,
        featured_image:blog_media(id, url, alt_text),
        categories:post_categories(category:blog_categories(id, name, slug)),
        tags:post_tags(tag:blog_tags(id, name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    if (error) throw error
    return data
  },

  // Get post by ID (full content for admin)
  async getPostById(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        featured_image:blog_media(*),
        categories:post_categories(category:blog_categories(*)),
        tags:post_tags(tag:blog_tags(*))
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get recent posts (lightweight for sidebar)
  async getRecentPosts(limit = 5) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        published_at,
        featured_image:blog_media(id, url, alt_text)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Create new post
  async createPost(postData: Partial<BlogPost>) {
    const response = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create post')
    }
    
    const result = await response.json()
    return result.data
  },

  // Update post
  async updatePost(id: string, postData: Partial<BlogPost>) {
    const response = await fetch(`/api/blog/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update post')
    }
    
    const result = await response.json()
    return result.data
  },

  // Delete post
  async deletePost(id: string) {
    const response = await fetch(`/api/blog/posts/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete post')
    }
    
    const result = await response.json()
    return result
  },

  // Add categories to post
  async addPostCategories(postId: string, categoryIds: string[]) {
    // First remove existing categories
    await supabase
      .from('post_categories')
      .delete()
      .eq('post_id', postId)
    
    // Add new categories
    if (categoryIds.length > 0) {
      const { error } = await supabase
        .from('post_categories')
        .insert(categoryIds.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        })))
      
      if (error) throw error
    }
  },

  // Add tags to post
  async addPostTags(postId: string, tagIds: string[]) {
    // First remove existing tags
    await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', postId)
    
    // Add new tags
    if (tagIds.length > 0) {
      const { error } = await supabase
        .from('post_tags')
        .insert(tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        })))
      
      if (error) throw error
    }
  }
}

// Categories API
export const categoriesAPI = {
  async getAll() {
    const response = await fetch('/api/blog/categories')
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    const result = await response.json()
    return result.data
  },

  async create(category: { name: string; description?: string }) {
    const response = await fetch('/api/blog/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create category')
    }
    
    const result = await response.json()
    return result.data
  },

  async update(id: string, category: { name: string; description?: string }) {
    const slug = generateSlug(category.name)
    const { data, error } = await supabase
      .from('blog_categories')
      .update({ ...category, slug })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Tags API
export const tagsAPI = {
  async getAll() {
    const response = await fetch('/api/blog/tags')
    if (!response.ok) {
      throw new Error('Failed to fetch tags')
    }
    const result = await response.json()
    return result.data
  },

  async create(tag: { name: string }) {
    const response = await fetch('/api/blog/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tag),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create tag')
    }
    
    const result = await response.json()
    return result.data
  },

  async update(id: string, tag: { name: string }) {
    const slug = generateSlug(tag.name)
    const { data, error } = await supabase
      .from('blog_tags')
      .update({ ...tag, slug })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('blog_tags')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Media API
export const mediaAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('blog_media')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async uploadImage(file: File, altText?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (altText) formData.append('altText', altText)
    
    const response = await fetch('/api/blog/media', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload image')
    }
    
    const result = await response.json()
    return result.data
  },

  async delete(id: string) {
    // Get the media record first
    const { data: media, error: fetchError } = await supabase
      .from('blog_media')
      .select('filename')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('blog-images')
      .remove([media.filename])
    
    if (storageError) throw storageError
    
    // Delete from database
    const { error } = await supabase
      .from('blog_media')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}