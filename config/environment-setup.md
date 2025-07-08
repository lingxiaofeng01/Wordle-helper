# 环境变量配置指南

## 必需的环境变量

请在项目根目录创建 `.env.local` 文件，并添加以下配置：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 可选：管理员密码（用于后台登录）
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## 如何获取 Supabase 配置

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 在左侧导航中点击 "Settings" -> "API"
4. 复制以下值：
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 重要提醒

- 不要提交 `.env.local` 文件到版本控制
- 确保所有环境变量都以 `NEXT_PUBLIC_` 开头（客户端可访问）
- 配置完成后需要重启开发服务器

## 测试连接

配置完成后，你可以：
1. 重启开发服务器 (`npm run dev`)
2. 打开浏览器开发者工具查看网络请求
3. 尝试访问管理后台进行测试 