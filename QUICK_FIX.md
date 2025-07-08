# 🔧 快速修复指南

## 问题：图片上传和保存草稿失败

### 根本原因
Supabase的行级安全(RLS)策略要求用户认证，但当前应用以匿名用户身份运行。

### 解决步骤

#### 1. 执行完整的SQL修复脚本 ⚡

在 **Supabase Dashboard** > **SQL Editor** 中执行以下代码：

```sql
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
```

#### 2. 检查存储桶配置 🗂️

确保在 **Supabase Dashboard** > **Storage** 中：
- 存储桶名称为 `blog-images`
- 存储桶设置为 **Public**（公开访问）
- 如果没有存储桶，请创建一个

#### 3. 重启开发服务器 🔄

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

#### 4. 验证修复 ✅

1. 访问 `http://localhost:3000/test`
2. 点击"开始测试"
3. 确认所有5项测试都显示**成功**：
   - ✅ 基本连接
   - ✅ 数据库读取
   - ✅ 存储访问
   - ✅ 认证状态
   - ✅ 保存文章功能

#### 5. 测试完整功能 🧪

- ✅ 访问 `http://localhost:3000/admin`
- ✅ 创建新文章
- ✅ 输入标题和内容
- ✅ 上传特色图片
- ✅ 保存草稿
- ✅ 发布文章

## 预期结果

修复后你应该能够：

- ✅ 正常输入文章标题
- ✅ 成功上传图片
- ✅ 保存草稿不报错
- ✅ 发布文章正常工作
- ✅ 自动保存功能正常

## 故障排除

### 如果保存文章仍然失败

1. **检查控制台错误**：
   - 打开浏览器开发者工具(F12)
   - 查看 Console 选项卡
   - 记录具体的错误信息

2. **检查数据库策略**：
   - 在 Supabase Dashboard > Authentication > Policies 中
   - 确认所有表都有 "Allow all operations for development" 策略

3. **重新执行SQL**：
   - 确保SQL脚本执行成功，没有错误
   - 如果有错误，逐行执行并检查问题

### 如果图片上传失败

1. **检查存储桶**：
   - 确保存储桶名称是 `blog-images`
   - 确保存储桶为公开访问
   - 检查存储桶的RLS策略

2. **检查文件格式**：
   - 确保文件是图片格式 (JPG, PNG, GIF)
   - 确保文件大小不超过 5MB

### 如果测试页面显示失败

1. **基本连接失败**：
   - 检查环境变量 `.env.local`
   - 确保 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 正确

2. **数据库读取失败**：
   - 检查数据库表是否存在
   - 执行 `database/schema.sql` 创建表结构

3. **存储访问失败**：
   - 确保创建了 `blog-images` 存储桶
   - 确保存储桶为公开访问

## 完整的环境检查

如果上述步骤都无效，请进行完整的环境检查：

1. **确认项目结构**：
   ```
   project/
   ├── app/
   ├── components/
   ├── lib/
   ├── database/
   ├── .env.local
   └── package.json
   ```

2. **确认环境变量**：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **确认数据库表存在**：
   - blog_posts
   - blog_categories
   - blog_tags
   - blog_media
   - post_categories
   - post_tags

4. **确认存储桶存在**：
   - blog-images (公开访问)

## 安全提醒

⚠️ **重要**：这是开发环境的临时解决方案。

- **开发环境**：可以安全使用这个修复
- **生产环境**：建议实现完整的用户认证系统
- **数据安全**：生产环境请设置适当的权限控制

---

**修复完成后，你的博客系统应该完全正常工作了！** 🎉 