"use client"

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, TrendingUp, ArrowRight, BookOpen, Loader2 } from 'lucide-react'
import { blogAPI } from '@/lib/blog-api'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: string
  published_at: string
  author: string
  meta_title?: string
  meta_description?: string
  read_time?: number
  is_featured?: boolean
  featured_image?: {
    url: string
    alt_text?: string
  }
  categories?: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }>
  tags?: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
}

interface BlogPostClientProps {
  post: BlogPost
}

// Optimized date formatting function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Optimized recent post card component
const RecentPostCard = memo(({ post }: { post: any }) => (
  <Link key={post.id} href={`/blog/${post.slug}`}>
    <div className="flex gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors">
      {post.featured_image && (
        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={post.featured_image.url}
            alt={post.title}
            fill
            sizes="64px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(post.published_at)}</span>
        </div>
      </div>
    </div>
  </Link>
))

RecentPostCard.displayName = 'RecentPostCard'

// Optimized category badge component
const CategoryBadge = memo(({ category }: { category: any }) => (
  <Badge key={category.id} variant="secondary" className="bg-blue-100 text-blue-800">
    {category.name}
  </Badge>
))

CategoryBadge.displayName = 'CategoryBadge'

// Optimized tag component
const TagBadge = memo(({ tag }: { tag: any }) => (
  <Badge key={tag.id} variant="outline" className="hover:bg-gray-100 transition-colors">
    <Tag className="w-3 h-3 mr-1" />
    {tag.name}
  </Badge>
))

TagBadge.displayName = 'TagBadge'

function BlogPostClient({ post }: BlogPostClientProps) {
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [shareLoading, setShareLoading] = useState(false)

  // Use useMemo to optimize calculations
  const formattedDate = useMemo(() => formatDate(post.published_at), [post.published_at])
  
  const categories = useMemo(() => post.categories || [], [post.categories])
  const tags = useMemo(() => post.tags || [], [post.tags])

  // Use useCallback to optimize functions
  const sharePost = useCallback(async () => {
    setShareLoading(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Sharing failed:', error)
    } finally {
      setShareLoading(false)
    }
  }, [post.title, post.excerpt])

  const loadRecentPosts = useCallback(async () => {
    try {
      const posts = await blogAPI.getRecentPosts(5)
      setRecentPosts(posts.filter(p => p.id !== post.id).slice(0, 4))
    } catch (error) {
      console.error('Error loading recent posts:', error)
    } finally {
      setLoading(false)
    }
  }, [post.id])

  useEffect(() => {
    loadRecentPosts()
  }, [loadRecentPosts])

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blog Post Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl mb-8">
                    <Image
                      src={post.featured_image.url}
                      alt={post.featured_image.alt_text || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div className="p-8">
                  {/* Categories */}
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categories.map(({ category }) => (
                        <CategoryBadge key={category.id} category={category} />
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formattedDate}</span>
                    </div>
                    {post.read_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.read_time} min read</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sharePost}
                      disabled={shareLoading}
                      className="ml-auto"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {/* Content */}
                  <MarkdownRenderer content={post.content} />

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="mt-8 pt-8 border-t">
                      <div className="flex flex-wrap gap-2">
                        {tags.map(({ tag }) => (
                          <TagBadge key={tag.id} tag={tag} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Recent Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Latest Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {recentPosts.map((recentPost) => (
                        <RecentPostCard key={recentPost.id} post={recentPost} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No recent posts found.</p>
                  )}
                </CardContent>
              </Card>

              {/* Back to Blog */}
              <Card>
                <CardContent className="p-6">
                  <Link href="/blog">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse All Articles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(BlogPostClient)