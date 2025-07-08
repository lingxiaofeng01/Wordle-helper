"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { blogAPI } from '@/lib/blog-api'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tests, setTests] = useState({
    connection: false,
    database: false,
    storage: false,
    auth: false,
    savePost: false
  })

  const testConnection = async () => {
    setConnectionStatus('testing')
    setError(null)
    
    const results = {
      connection: false,
      database: false,
      storage: false,
      auth: false,
      savePost: false
    }

    try {
      // 1. 测试基本连接
      console.log('测试基本连接...')
      const { data: connectionData, error: connectionError } = await supabase
        .from('blog_categories')
        .select('count')
        .limit(1)
      
      if (!connectionError) {
        results.connection = true
        console.log('✓ 基本连接成功')
      } else {
        console.error('✗ 基本连接失败:', connectionError)
        throw new Error(`连接失败: ${connectionError.message}`)
      }

      // 2. 测试数据库读取
      console.log('测试数据库读取...')
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .limit(5)
      
      if (!categoriesError) {
        results.database = true
        console.log('✓ 数据库读取成功，找到', categoriesData?.length || 0, '个分类')
      } else {
        console.error('✗ 数据库读取失败:', categoriesError)
      }

      // 3. 测试存储
      console.log('测试存储访问...')
      const { data: storageData, error: storageError } = await supabase.storage
        .from('blog-images')
        .list('', { limit: 1 })
      
      if (!storageError) {
        results.storage = true
        console.log('✓ 存储访问成功')
      } else {
        console.error('✗ 存储访问失败:', storageError)
      }

      // 4. 测试认证状态
      console.log('测试认证状态...')
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (!authError) {
        results.auth = true
        console.log('✓ 认证状态检查成功')
      } else {
        console.error('✗ 认证状态检查失败:', authError)
      }

      // 5. 测试保存文章功能
      console.log('测试保存文章功能...')
      try {
        const testPostData = {
          title: '测试文章_' + Date.now(),
          content: '这是一个测试文章内容',
          excerpt: '测试摘要',
          status: 'draft' as const,
          author: 'Test User'
        }
        
        const savedPost = await blogAPI.createPost(testPostData)
        
        if (savedPost && savedPost.id) {
          results.savePost = true
          console.log('✓ 保存文章成功, ID:', savedPost.id)
          
          // 清理测试数据
          try {
            await blogAPI.deletePost(savedPost.id)
            console.log('✓ 清理测试数据成功')
          } catch (cleanupError) {
            console.warn('清理测试数据失败:', cleanupError)
          }
        }
      } catch (saveError) {
        console.error('✗ 保存文章失败:', saveError)
        results.savePost = false
        
        // 如果保存失败，记录详细错误信息
        if (saveError instanceof Error) {
          setError(`保存文章失败: ${saveError.message}`)
        }
      }

      setTests(results)
      
      if (results.connection && results.database && results.savePost) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
        if (!error) {
          setError('部分功能测试失败，请检查配置')
        }
      }

    } catch (error) {
      console.error('测试过程中发生错误:', error)
      setConnectionStatus('error')
      setTests(results)
      setError(error instanceof Error ? error.message : '未知错误')
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">成功</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">失败</Badge>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Supabase 连接测试
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button 
            onClick={testConnection} 
            disabled={connectionStatus === 'testing'}
            className="w-full"
          >
            {connectionStatus === 'testing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                测试中...
              </>
            ) : (
              '开始测试'
            )}
          </Button>
        </div>

        {connectionStatus !== 'idle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">基本连接</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tests.connection)}
                  {getStatusBadge(tests.connection)}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">数据库读取</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tests.database)}
                  {getStatusBadge(tests.database)}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">存储访问</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tests.storage)}
                  {getStatusBadge(tests.storage)}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">认证状态</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tests.auth)}
                  {getStatusBadge(tests.auth)}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg col-span-2">
                <span className="text-sm font-medium">保存文章功能</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tests.savePost)}
                  {getStatusBadge(tests.savePost)}
                </div>
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  连接测试成功！你现在可以使用所有功能了。
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>使用说明：</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>基本连接：测试与Supabase的基本通信</li>
            <li>数据库读取：测试数据库表的读取权限</li>
            <li>存储访问：测试图片存储桶的访问权限</li>
            <li>认证状态：测试用户认证系统</li>
            <li>保存文章功能：测试完整的文章保存流程</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 