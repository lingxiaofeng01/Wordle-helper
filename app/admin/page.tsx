"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  PlusCircle, 
  FileText, 
  Image, 
  Tags, 
  FolderOpen, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Search,
  Loader2,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  MessageSquare,
  LogOut,
  Home,
  Layout,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'
import { blogAPI, categoriesAPI, tagsAPI, mediaAPI } from '@/lib/blog-api'
import { supabase } from '@/lib/supabase'

// Simple auth hook
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  // 自动认证功能
  const ensureSupabaseAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('管理后台：用户未认证，尝试匿名登录...')
        const { data, error } = await supabase.auth.signInAnonymously()
        
        if (error) {
          console.error('管理后台：匿名登录失败:', error)
        } else {
          console.log('管理后台：匿名登录成功:', data.user?.id)
        }
      } else {
        console.log('管理后台：用户已认证:', user.id)
      }
    } catch (error) {
      console.error('管理后台：认证检查失败:', error)
    }
  }, [])

  const login = async () => {
    // Validate password against server
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_authenticated', 'true')
        // 登录成功后进行Supabase认证
        ensureSupabaseAuth()
      } else {
        alert('密码错误')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('登录失败，请重试')
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    // 登出时也登出Supabase
    supabase.auth.signOut()
  }

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated')
    if (isAuth === 'true') {
      setIsAuthenticated(true)
      // 如果已登录，确保Supabase也已认证
      ensureSupabaseAuth()
    }
  }, [ensureSupabaseAuth])

  return { isAuthenticated, password, setPassword, login, logout }
}

// Login component
function LoginForm({ password, setPassword, onLogin }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">博客管理后台</CardTitle>
          <p className="text-gray-600 text-sm">请输入管理员密码登录</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="输入管理员密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onLogin()}
              className="h-12 text-center"
            />
            <Button onClick={onLogin} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              登录
            </Button>
            <p className="text-xs text-gray-500 text-center">
              请输入管理员密码
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Sidebar component
function Sidebar({ activeTab, setActiveTab, onLogout }: any) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const menuItems = [
    { id: 'dashboard', label: '仪表板', icon: BarChart3 },
    { id: 'posts', label: '文章', icon: FileText },
    { id: 'categories', label: '分类', icon: FolderOpen },
    { id: 'tags', label: '标签', icon: Tags },
    { id: 'media', label: '媒体', icon: Image },
    { id: 'settings', label: '设置', icon: Settings },
  ]

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold">博客管理</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white p-2"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left h-10 ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {!isCollapsed && item.label}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4 mr-3" />
          {!isCollapsed && '退出登录'}
        </Button>
      </div>
    </div>
  )
}

// Dashboard component
function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalTags: 0,
    totalMedia: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentPosts, setRecentPosts] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [posts, categories, tags, media] = await Promise.all([
        blogAPI.getAllPosts(),
        categoriesAPI.getAll(),
        tagsAPI.getAll(),
        mediaAPI.getAll()
      ])

      const publishedPosts = posts.filter((post: any) => post.status === 'published').length
      const draftPosts = posts.filter((post: any) => post.status === 'draft').length

      setStats({
        totalPosts: posts.length,
        publishedPosts,
        draftPosts,
        totalCategories: categories.length,
        totalTags: tags.length,
        totalMedia: media.length
      })

      // 获取最近的5篇文章
      setRecentPosts(posts.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">欢迎回来！</h2>
        <p className="text-blue-100">今天是 {new Date().toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总文章数</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalPosts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已发布</p>
                <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">草稿</p>
                <p className="text-3xl font-bold text-orange-600">{stats.draftPosts}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Edit className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">分类</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalCategories}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">标签</p>
                <p className="text-3xl font-bold text-pink-600">{stats.totalTags}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-full">
                <Tags className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">媒体文件</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalMedia}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Image className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                onClick={() => window.location.href = '/admin/posts/new'}
              >
                <FileText className="w-4 h-4 mr-2" />
                创建新文章
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/'}
              >
                <Home className="w-4 h-4 mr-2" />
                查看网站
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              最近文章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPosts.length > 0 ? (
                recentPosts.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={post.status === 'published' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">暂无文章</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Posts management component
function PostsManager() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 })

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data: any[] = await blogAPI.getAllPosts()
      setPosts(data)
      
      // Calculate stats
      const published = data.filter((post: any) => post.status === 'published').length
      const drafts = data.filter((post: any) => post.status === 'draft').length
      setStats({ total: data.length, published, drafts })
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return
    
    try {
      await blogAPI.deletePost(id)
      loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const filteredPosts = posts.filter((post: any) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">文章管理</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>总共: {stats.total}</span>
            <span>已发布: {stats.published}</span>
            <span>草稿: {stats.drafts}</span>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/admin/posts/new'} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          创建新文章
        </Button>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索文章标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 文章列表 */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
                      <Badge 
                        variant={post.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      {post.read_time && (
                        <span>{post.read_time} 分钟阅读</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      title="预览文章"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/admin/posts/edit/${post.id}`}
                      title="编辑文章"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      title="删除文章"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? '没有找到匹配的文章' : '还没有文章'}
              </p>
              {!searchTerm && (
                <Button onClick={() => window.location.href = '/admin/posts/new'}>
                  创建第一篇文章
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Categories management component
function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [editingCategory, setEditingCategory] = useState<any>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data: any[] = await categoriesAPI.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return
    
    try {
      await categoriesAPI.create(newCategory)
      setNewCategory({ name: '', description: '' })
      loadCategories()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return
    
    try {
      await categoriesAPI.update(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description
      })
      setEditingCategory(null)
      loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return
    
    try {
      await categoriesAPI.delete(id)
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">分类管理</h2>
      </div>

      {/* 创建新分类 */}
      <Card>
        <CardHeader>
          <CardTitle>添加新分类</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
              <Input
                placeholder="分类名称"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <Input
                placeholder="分类描述"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleCreateCategory} disabled={!newCategory.name.trim()}>
              <PlusCircle className="w-4 h-4 mr-2" />
              添加分类
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 分类列表 */}
      <Card>
        <CardHeader>
          <CardTitle>分类列表</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category: any) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  {editingCategory?.id === category.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                      <Input
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {editingCategory?.id === category.id ? (
                      <>
                        <Button size="sm" onClick={handleUpdateCategory}>
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                          取消
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">还没有分类</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Tags management component
function TagsManager() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTag, setNewTag] = useState('')
  const [editingTag, setEditingTag] = useState<any>(null)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const data: any[] = await tagsAPI.getAll()
      setTags(data)
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTag.trim()) return
    
    try {
      await tagsAPI.create({ name: newTag.trim() })
      setNewTag('')
      loadTags()
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return
    
    try {
      await tagsAPI.update(editingTag.id, { name: editingTag.name.trim() })
      setEditingTag(null)
      loadTags()
    } catch (error) {
      console.error('Error updating tag:', error)
    }
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return
    
    try {
      await tagsAPI.delete(id)
      loadTags()
    } catch (error) {
      console.error('Error deleting tag:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">标签管理</h2>
      </div>

      {/* 创建新标签 */}
      <Card>
        <CardHeader>
          <CardTitle>添加新标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="标签名称"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
            />
            <Button onClick={handleCreateTag} disabled={!newTag.trim()}>
              <PlusCircle className="w-4 h-4 mr-2" />
              添加标签
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 标签列表 */}
      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <div key={tag.id} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                  {editingTag?.id === tag.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="h-6 w-20 text-xs"
                      />
                      <Button size="sm" onClick={handleUpdateTag} className="h-6 px-2 text-xs">
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingTag(null)} className="h-6 px-2 text-xs">
                        取消
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tag.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingTag(tag)} className="h-6 w-6 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTag(tag.id)} className="h-6 w-6 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">还没有标签</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Media management component
function MediaManager() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      const data: any[] = await mediaAPI.getAll()
      setMedia(data)
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    setUploading(true)
    try {
      await mediaAPI.uploadImage(file, file.name)
      loadMedia()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('确定要删除这个文件吗？')) return
    
    try {
      await mediaAPI.delete(id)
      loadMedia()
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">媒体管理</h2>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            id="media-upload"
            disabled={uploading}
          />
          <Button
            onClick={() => document.getElementById('media-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4 mr-2" />
            )}
            上传图片
          </Button>
        </div>
      </div>

      {/* 媒体网格 */}
      {media.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img
                  src={item.url}
                  alt={item.alt_text || item.original_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium truncate">{item.original_name}</p>
                <p className="text-xs text-gray-500 mb-2">
                  {(item.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="flex-1"
                  >
                    复制链接
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMedia(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">还没有媒体文件</p>
            <Button onClick={() => document.getElementById('media-upload')?.click()}>
              上传第一张图片
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Settings component
function SettingsManager() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">设置</h2>
      
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          设置功能正在开发中，敬请期待。
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">版本</label>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">框架</label>
              <p className="text-sm text-gray-600">Next.js + Supabase</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">主题</label>
              <p className="text-sm text-gray-600">WordPress 风格</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Admin Dashboard
export default function AdminDashboard() {
  const { isAuthenticated, password, setPassword, login, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isAuthenticated) {
    return <LoginForm password={password} setPassword={setPassword} onLogin={login} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'posts':
        return <PostsManager />
      case 'categories':
        return <CategoriesManager />
      case 'tags':
        return <TagsManager />
      case 'media':
        return <MediaManager />
      case 'settings':
        return <SettingsManager />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}