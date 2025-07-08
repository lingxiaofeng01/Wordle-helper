-- Blog Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog Categories Table
CREATE TABLE blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Tags Table
CREATE TABLE blog_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Media Table
CREATE TABLE blog_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image UUID REFERENCES blog_media(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    author VARCHAR(100) NOT NULL DEFAULT 'Admin',
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    read_time INTEGER,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Junction Table: Post Categories (Many-to-Many)
CREATE TABLE post_categories (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Junction Table: Post Tags (Many-to-Many)
CREATE TABLE post_tags (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 基础索引
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- 性能优化索引
CREATE INDEX idx_blog_posts_status_published_at ON blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_posts_status_featured ON blog_posts(status, is_featured, published_at DESC);
CREATE INDEX idx_blog_posts_author ON blog_posts(author);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
CREATE INDEX idx_blog_media_created_at ON blog_media(created_at DESC);

-- 全文搜索索引（可选）
CREATE INDEX idx_blog_posts_title_search ON blog_posts USING gin(to_tsvector('english', title));
CREATE INDEX idx_blog_posts_content_search ON blog_posts USING gin(to_tsvector('english', content));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on blog_posts
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Public read access for categories and tags
CREATE POLICY "Public can read categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Public can read tags" ON blog_tags
    FOR SELECT USING (true);

-- Public read access for media
CREATE POLICY "Public can read media" ON blog_media
    FOR SELECT USING (true);

-- Public read access for post relationships
CREATE POLICY "Public can read post categories" ON post_categories
    FOR SELECT USING (true);

CREATE POLICY "Public can read post tags" ON post_tags
    FOR SELECT USING (true);

-- Admin access (you'll need to configure authentication for this)
-- For now, we'll allow all operations from authenticated users
-- In production, you should create proper admin roles

CREATE POLICY "Allow all operations for authenticated users" ON blog_posts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON blog_categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON blog_tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON blog_media
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON post_categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON post_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Wordle Tips', 'wordle-tips', 'Tips and strategies for playing Wordle'),
('Game Analysis', 'game-analysis', 'Deep analysis of word games and puzzles'),
('Tool Updates', 'tool-updates', 'Updates and new features for Wordle Helper'),
('Word Games', 'word-games', 'General word game content and reviews')
ON CONFLICT (slug) DO NOTHING;

-- Insert some default tags
INSERT INTO blog_tags (name, slug) VALUES
('wordle', 'wordle'),
('strategy', 'strategy'),
('tips', 'tips'),
('analysis', 'analysis'),
('algorithm', 'algorithm'),
('solver', 'solver'),
('helper', 'helper'),
('tutorial', 'tutorial'),
('beginner', 'beginner'),
('advanced', 'advanced')
ON CONFLICT (slug) DO NOTHING;

-- Storage bucket for blog images (run this in Supabase Storage)
-- You'll need to create this bucket manually in the Supabase dashboard
-- Bucket name: 'blog-images'
-- Make it public so images can be accessed directly