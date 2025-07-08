import { blogAPI } from '@/lib/blog-api'
import { createSupabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Metadata } from 'next/types'
import BlogPostClient from './BlogPostClient'

// Enable static generation, revalidate every 10 minutes
export const revalidate = 600

// Generate static parameters
export async function generateStaticParams() {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { data: posts } = await supabaseAdmin
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50) // Limit to pre-generate top 50 pages
    
    return posts?.map((post) => ({
      slug: post.slug,
    })) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post: any = await blogAPI.getPostBySlug(params.slug)
    
    if (!post || post.status !== 'published') {
      return {
        title: 'Post Not Found | Wordle Helper',
        description: 'This blog post could not be found. Explore our other Wordle strategy articles.',
        robots: { index: false, follow: false },
      }
    }

    const title = post.meta_title || post.title
    const description = post.meta_description || post.excerpt || `${post.title} - Expert Wordle strategies and tips`
    const publishedTime = new Date(post.published_at).toISOString()
    const modifiedTime = new Date().toISOString()
    const keywords = post.tags?.map((t: any) => t.tag.name) || []
    const categories = post.categories?.map((c: any) => c.category.name) || []
    
    // Add Wordle-related keywords
    const allKeywords = [
      ...keywords,
      'Wordle',
      'word game',
      'puzzle strategy',
      'Wordle tips',
      'word puzzle',
      ...categories
    ]

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

    // Handle featured image (could be object or array from API)
    const featuredImage = Array.isArray(post.featured_image) 
      ? post.featured_image[0] 
      : post.featured_image

    return {
      title: title,
      description,
      keywords: allKeywords,
      authors: [{ name: post.author }],
      creator: post.author,
      publisher: 'Wordle Helper',
      
      openGraph: {
        title,
        description,
        type: 'article',
        url: canonicalUrl,
        siteName: 'Wordle Helper',
        locale: 'en_US',
        publishedTime,
        modifiedTime,
        authors: [post.author],
        tags: allKeywords,
        images: featuredImage ? [
          {
            url: featuredImage.url,
            width: 1200,
            height: 630,
            alt: featuredImage.alt_text || post.title,
            type: 'image/jpeg',
          }
        ] : [
          {
            url: '/og-default-blog.jpg', // fallback image
            width: 1200,
            height: 630,
            alt: 'Wordle Helper Blog',
            type: 'image/jpeg',
          }
        ],
      },
      
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        site: '@WordleHelper',
        creator: '@WordleHelper',
        images: featuredImage ? [
          {
            url: featuredImage.url,
            alt: featuredImage.alt_text || post.title,
          }
        ] : [
          {
            url: '/twitter-default-blog.jpg',
            alt: 'Wordle Helper Blog',
          }
        ],
      },
      
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      
      alternates: {
        canonical: canonicalUrl,
      },
      
      other: {
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:author': post.author,
        'article:section': categories[0] || 'Wordle Strategy',
        'article:tag': keywords.join(', '),
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post | Wordle Helper',
      description: 'Read our latest Wordle strategy and tips.',
      robots: { index: false, follow: true },
    }
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post: any = await blogAPI.getPostBySlug(params.slug)
    
    if (!post || post.status !== 'published') {
      notFound()
    }

    // Handle featured image (could be object or array from API)
    const featuredImage = Array.isArray(post.featured_image) 
      ? post.featured_image[0] 
      : post.featured_image

    return (
      <>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              description: post.excerpt,
              image: featuredImage ? [featuredImage.url] : [],
              datePublished: post.published_at,
              dateModified: post.published_at,
              author: {
                '@type': 'Person',
                name: post.author,
              },
              publisher: {
                '@type': 'Organization',
                name: 'Wordle Helper',
                logo: {
                  '@type': 'ImageObject',
                  url: '/logo.png', // Update with your actual logo URL
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `/blog/${post.slug}`,
              },
              articleSection: post.categories?.[0]?.category.name || 'Wordle Strategy',
              keywords: post.tags?.map((t: any) => t.tag.name).join(', ') || '',
              wordCount: post.content ? post.content.replace(/<[^>]*>/g, '').split(' ').length : 0,
              timeRequired: post.read_time ? `PT${post.read_time}M` : undefined,
            })
          }}
        />
        <BlogPostClient post={post} />
      </>
    )
  } catch (error) {
    console.error('Error loading post:', error)
    notFound()
  }
}