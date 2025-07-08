-- 完整的开发环境RLS修复脚本
-- 注意：这个脚本仅用于开发和测试，生产环境请使用完整的认证系统

-- 首先删除所有现有的策略
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_categories;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_tags;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_media;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON post_categories;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON post_tags;

-- 删除公共访问策略
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can read categories" ON blog_categories;
DROP POLICY IF EXISTS "Public can read tags" ON blog_tags;
DROP POLICY IF EXISTS "Public can read media" ON blog_media;
DROP POLICY IF EXISTS "Public can read post categories" ON post_categories;
DROP POLICY IF EXISTS "Public can read post tags" ON post_tags;

-- 删除之前的开发策略（如果存在）
DROP POLICY IF EXISTS "Allow all operations for development" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for development" ON blog_categories;
DROP POLICY IF EXISTS "Allow all operations for development" ON blog_tags;
DROP POLICY IF EXISTS "Allow all operations for development" ON blog_media;
DROP POLICY IF EXISTS "Allow all operations for development" ON post_categories;
DROP POLICY IF EXISTS "Allow all operations for development" ON post_tags;

-- 添加允许所有操作的策略（仅用于开发）
CREATE POLICY "Allow all operations for development" ON blog_posts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON blog_categories
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON blog_tags
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON blog_media
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON post_categories
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON post_tags
    FOR ALL USING (true);

-- 为存储添加允许所有操作的策略
-- 首先删除现有的存储策略
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all users to upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all users to update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all users to delete blog images" ON storage.objects;

-- 添加允许所有用户操作存储的策略
CREATE POLICY "Allow all users to upload blog images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow all users to update blog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Allow all users to delete blog images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');

CREATE POLICY "Allow all users to read blog images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

-- 显示当前的策略状态
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 