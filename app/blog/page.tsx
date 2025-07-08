import { createSupabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowRight, BookOpen, Star, TrendingUp, RefreshCw } from 'lucide-react'
import { Metadata } from 'next'

// Enable static generation, revalidate every 5 minutes
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Wordle Strategy Blog | Expert Tips, Advanced Techniques & Game Analysis',
  description: 'Master Wordle with our comprehensive strategy blog. Expert tips, advanced solving techniques, statistical analysis, and daily insights to improve your word game skills.',
  keywords: [
    'Wordle strategy',
    'Wordle tips',
    'word game strategy',
    'Wordle solver',
    'word puzzle tips',
    'Wordle techniques',
    'daily Wordle help',
    'word game blog',
    'Wordle helper',
    'word puzzle analysis'
  ],
  openGraph: {
    title: 'Wordle Strategy Blog - Expert Tips & Advanced Techniques',
    description: 'Master Wordle with expert strategies, advanced solving techniques, and daily insights. Your ultimate resource for improving your word game skills.',
    type: 'website',
    url: '/blog',
    siteName: 'Wordle Helper',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wordle Strategy Blog - Expert Tips & Advanced Techniques',
    description: 'Master Wordle with expert strategies, advanced solving techniques, and daily insights.',
    site: '@WordleHelper',
    creator: '@WordleHelper',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/blog',
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: string
  published_at: string
  author: string
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

export default async function BlogPage() {
  const supabaseAdmin = createSupabaseAdmin()
  
  if (!supabaseAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Supabase Configuration Required</h1>
          <p className="text-gray-600 mb-6">
            Please configure your Supabase environment variables to access the blog.
          </p>
          
          <div className="text-center space-y-3">
            <Link href="/">
              <Button className="w-full">
                Back to Home
              </Button>
            </Link>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh the page to try again</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const { data: posts, error } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      featured_image:blog_media(*),
      categories:post_categories(category:blog_categories(*)),
      tags:post_tags(tag:blog_tags(*))
    `)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching posts:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Database Connection Issue</h1>
          <p className="text-gray-600 mb-6">
            Unable to load blog posts. Error: {error.message}
          </p>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">
                Back to Home
              </Button>
            </Link>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh the page to try again</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const postsData: BlogPost[] = posts || []
  const featuredPosts = postsData.filter(post => post.is_featured)
  const regularPosts = postsData.filter(post => !post.is_featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Generate structured data for the blog listing
  const generateStructuredData = () => {
    const blogStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Wordle Strategy Blog',
      description: 'Expert tips, advanced techniques, and strategic insights for mastering Wordle and word games.',
      url: '/blog',
      author: {
        '@type': 'Organization',
        name: 'Wordle Helper',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Wordle Helper',
        logo: {
          '@type': 'ImageObject',
          url: '/logo.png',
        },
      },
      blogPost: postsData.slice(0, 10).map(post => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: `/blog/${post.slug}`,
        datePublished: post.published_at,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        image: post.featured_image ? [post.featured_image.url] : [],
        keywords: post.tags?.map((t: any) => t.tag.name).join(', ') || '',
        articleSection: post.categories?.[0]?.category.name || 'Wordle Strategy',
      })),
    }

    return JSON.stringify(blogStructuredData)
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateStructuredData(),
        }}
      />
      
      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Wordle Strategy Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Master Wordle with expert strategies, advanced techniques, and data-driven insights. 
                Your ultimate resource for improving your word game skills.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-16" aria-labelledby="featured-heading">
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-6 h-6 text-yellow-500" aria-hidden="true" />
                <h2 id="featured-heading" className="text-3xl font-bold text-gray-900">Featured Articles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <article key={post.id} className="group">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 relative overflow-hidden h-full">
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-yellow-500 text-white shadow-lg">
                          <Star className="w-3 h-3 mr-1" aria-hidden="true" />
                          Featured
                        </Badge>
                      </div>
                      <CardContent className="p-0 h-full flex flex-col">
                        {post.featured_image && (
                          <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
                            <Image
                              src={post.featured_image.url}
                              alt={post.featured_image.alt_text || post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              priority={index < 2}
                            />
                          </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                          {/* Categories */}
                          {post.categories && post.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.categories.map(({ category }) => (
                                <Badge key={category.id} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  {category.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" aria-hidden="true" />
                                <span>{post.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                              </div>
                              {post.read_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" aria-hidden="true" />
                                  <span>{post.read_time} min read</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Link href={`/blog/${post.slug}`} className="mt-auto">
                            <Button variant="outline" className="w-full hover:bg-blue-50 border-blue-200 text-blue-700">
                              Read Article
                              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Regular Posts */}
          <section aria-labelledby="latest-heading">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h2 id="latest-heading" className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            </div>
            
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <article key={post.id} className="group">
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                      <CardContent className="p-0 h-full flex flex-col">
                        {post.featured_image && (
                          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                            <Image
                              src={post.featured_image.url}
                              alt={post.featured_image.alt_text || post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          {/* Categories */}
                          {post.categories && post.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.categories.map(({ category }) => (
                                <Badge key={category.id} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  {category.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" aria-hidden="true" />
                                <span>{post.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                              </div>
                              {post.read_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" aria-hidden="true" />
                                  <span>{post.read_time} min read</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Link href={`/blog/${post.slug}`} className="mt-auto">
                            <Button variant="outline" className="w-full hover:bg-blue-50">
                              Read Article
                              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </article>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" aria-hidden="true" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">No Articles Yet</h3>
                  <p className="text-gray-500 mb-6">
                    We're working on creating amazing content for you. Check back soon!
                  </p>
                  <Link href="/">
                    <Button>
                      Try Wordle Helper
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Call to Action */}
          <section className="mt-16" aria-labelledby="cta-heading">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 id="cta-heading" className="text-2xl font-bold mb-4">Ready to Master Wordle?</h2>
                <p className="text-blue-100 mb-6 text-lg">
                  Put these strategies into practice with our AI-powered Wordle helper
                </p>
                <Link href="/">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                    Try Wordle Helper Now
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  )
}