import { MetadataRoute } from 'next';
import { createSupabaseAdmin } from '@/lib/supabase';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Get all published posts
  const supabaseAdmin = createSupabaseAdmin();
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const postUrls: MetadataRoute.Sitemap = posts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  })) ?? [];

  const latestPostDate = posts && posts.length > 0
    ? (posts[0].updated_at ? new Date(posts[0].updated_at) : new Date(posts[0].published_at))
    : new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(), // Or a static date if it rarely changes
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  return [...staticUrls, ...postUrls];
} 