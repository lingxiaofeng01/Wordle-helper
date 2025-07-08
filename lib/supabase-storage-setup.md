# Supabase存储设置说明

## 图片上传功能配置

为了让博客的图片上传功能正常工作，需要在Supabase中配置存储桶和正确的权限策略。

### 1. 创建存储桶

1. 登录到 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 在左侧导航中点击 "Storage"
4. 点击 "Create bucket"
5. 输入存储桶名称：`blog-images`
6. 设置为 Public (公开访问)
7. 点击 "Create bucket"

### 2. 解决认证问题（重要！）

如果你在测试页面发现"认证状态失败"，请选择以下解决方案之一：

#### 方案A：临时解决方案（推荐用于开发测试）

在 Supabase SQL Editor 中执行以下代码，允许匿名用户进行所有操作：

```sql
-- 删除现有的认证限制策略
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_categories;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_tags;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON blog_media;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON post_categories;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON post_tags;

-- 添加允许所有操作的策略（仅用于开发）
CREATE POLICY "Allow all operations for development" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations for development" ON blog_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations for development" ON blog_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations for development" ON blog_media FOR ALL USING (true);
CREATE POLICY "Allow all operations for development" ON post_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations for development" ON post_tags FOR ALL USING (true);

-- 删除现有的存储策略
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- 添加允许所有用户上传的策略
CREATE POLICY "Allow all users to upload blog images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow all users to update blog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Allow all users to delete blog images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');
```

#### 方案B：使用自动认证（推荐用于生产）

应用已经集成了自动认证功能，会在需要时自动进行匿名登录。如果你想使用标准的RLS策略，保持原有的设置即可：

```sql
-- 保持原有的认证策略
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

-- 存储策略（保持现有设置）
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
```

### 3. 验证设置

设置完成后，你可以通过以下方式验证：

1. 访问 `/test` 页面测试连接
2. 确保所有测试项目都显示成功
3. 在新建文章页面尝试上传图片
4. 检查是否能成功上传并显示图片
5. 查看Supabase存储桶中是否有上传的文件

### 4. 环境变量配置

确保你的 `.env.local` 文件包含以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 故障排除

如果图片上传失败，请检查：

1. **认证状态**：访问 `/test` 页面确认认证状态成功
2. **存储桶**：确保存储桶已创建且为公开状态
3. **RLS策略**：确保按上述方案之一正确设置了策略
4. **环境变量**：确保环境变量正确配置
5. **文件限制**：确保文件大小不超过5MB且为支持的图片格式

### 6. 安全建议

- **开发环境**：可以使用方案A简化测试
- **生产环境**：建议使用方案B，实现适当的认证控制
- **数据保护**：定期检查和更新RLS策略
- **访问控制**：根据需要限制管理后台访问

## 常见问题

**Q: 认证状态显示失败怎么办？**
A: 执行方案A的SQL脚本，或确保应用的自动认证功能正常工作。

**Q: 图片上传后无法显示？**
A: 确保存储桶设置为公开访问，并检查RLS策略是否正确设置。

**Q: 上传失败显示"权限不足"？**
A: 这是RLS策略阻止了操作，请按照方案A或B正确配置策略。

**Q: 无法保存文章草稿？**
A: 同样是权限问题，确保数据库表的RLS策略允许当前用户操作。

**Q: 如何在生产环境中增强安全性？**
A: 可以实现完整的用户注册登录系统，设置更严格的RLS策略，并添加管理员角色验证。

**Q: 上传失败显示"bucket not found"？**
A: 确保存储桶名称为 `blog-images` 且已正确创建。

**Q: 无法上传大文件？**
A: 默认限制为5MB，如需上传更大文件，请调整代码中的限制。

**Q: 如何删除不需要的图片？**
A: 可以在Supabase Dashboard的Storage界面中手动删除，或者实现管理界面。 