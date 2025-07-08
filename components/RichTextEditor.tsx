"use client"

import { useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { mediaAPI } from '@/lib/blog-api'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Eye,
  Code,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange: (content: string) => void
  className?: string
}

// 简单的HTML到Markdown转换器（基础版本）
const htmlToMarkdown = (html: string): string => {
  let markdown = html
    // 移除HTML标签并转换为Markdown
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '') // 移除其他HTML标签
    .replace(/\n\s*\n\s*\n/g, '\n\n') // 清理多余的换行
    .trim()

  return markdown
}

// 简单的Markdown到HTML转换器（基础版本）
const markdownToHtml = (markdown: string): string => {
  let html = markdown
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 引用
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // 列表项
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // 包装列表项 - 简化版本，不使用s标志
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    // 段落
    .replace(/^(.+)$/gm, '<p>$1</p>')
    // 清理空段落
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1')
    .replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1')

  return html
}

export default function RichTextEditor({ content = '', onChange, className }: RichTextEditorProps) {
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'markdown' | 'preview'>('wysiwyg')
  const [markdownContent, setMarkdownContent] = useState(() => htmlToMarkdown(content))
  const [uploading, setUploading] = useState(false)
  const [uploadAlert, setUploadAlert] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg border border-gray-200 my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      // 同步更新Markdown内容
      setMarkdownContent(htmlToMarkdown(html))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6',
      },
    },
  })

  if (!editor) {
    return null
  }

  const showUploadAlert = (type: 'success' | 'error', message: string) => {
    setUploadAlert({ type, message })
    setTimeout(() => setUploadAlert(null), 3000)
  }

  const switchToWysiwyg = () => {
    // 将Markdown转换为HTML并设置到编辑器
    const html = markdownToHtml(markdownContent)
    editor.commands.setContent(html)
    onChange(html)
    setEditorMode('wysiwyg')
  }

  const switchToMarkdown = () => {
    // 将编辑器内容转换为Markdown
    const html = editor.getHTML()
    const markdown = htmlToMarkdown(html)
    setMarkdownContent(markdown)
    setEditorMode('markdown')
  }

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value)
    // 将Markdown转换为HTML并传递给父组件
    const html = markdownToHtml(value)
    onChange(html)
  }

  const handleImageUpload = async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showUploadAlert('error', '请选择图片文件')
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showUploadAlert('error', '图片大小不能超过5MB')
      return
    }

    setUploading(true)
    try {
      const media = await mediaAPI.uploadImage(file, file.name)
      
      if (editorMode === 'wysiwyg') {
        editor.chain().focus().setImage({ src: media.url, alt: media.alt_text || '' }).run()
      } else {
        const imageMarkdown = `![${media.alt_text || ''}](${media.url})`
        setMarkdownContent(prev => prev + '\n\n' + imageMarkdown)
        handleMarkdownChange(markdownContent + '\n\n' + imageMarkdown)
      }
      
      showUploadAlert('success', '图片上传成功')
    } catch (error) {
      console.error('Error uploading image:', error)
      showUploadAlert('error', '图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const addImageFromUrl = () => {
    const url = window.prompt('请输入图片URL:')
    if (url) {
      if (editorMode === 'wysiwyg') {
        const alt = window.prompt('请输入图片描述 (可选):') || ''
        editor.chain().focus().setImage({ src: url, alt }).run()
      } else {
        const alt = window.prompt('请输入图片描述 (可选):') || ''
        const imageMarkdown = `![${alt}](${url})`
        setMarkdownContent(prev => prev + '\n\n' + imageMarkdown)
        handleMarkdownChange(markdownContent + '\n\n' + imageMarkdown)
      }
    }
  }

  const addLink = () => {
    const url = window.prompt('请输入链接URL:')
    if (url) {
      if (editorMode === 'wysiwyg') {
        const text = window.prompt('请输入链接文本:') || url
        editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
      } else {
        const text = window.prompt('请输入链接文本:') || url
        const linkMarkdown = `[${text}](${url})`
        setMarkdownContent(prev => prev + linkMarkdown)
        handleMarkdownChange(markdownContent + linkMarkdown)
      }
    }
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* 上传提示 */}
      {uploadAlert && (
        <div className="mb-4">
          <Alert className={uploadAlert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={uploadAlert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {uploadAlert.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* 工具栏 */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 rounded-t-lg">
        {/* 模式切换 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">编辑模式</Badge>
            <Button
              variant={editorMode === 'wysiwyg' ? 'default' : 'outline'}
              size="sm"
              onClick={switchToWysiwyg}
              className="h-8 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              可视化编辑
            </Button>
            <Button
              variant={editorMode === 'markdown' ? 'default' : 'outline'}
              size="sm"
              onClick={switchToMarkdown}
              className="h-8 text-xs"
            >
              <Code className="w-3 h-3 mr-1" />
              Markdown
            </Button>
            <Button
              variant={editorMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('preview')}
              className="h-8 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              预览
            </Button>
          </div>
        </div>

        {/* WYSIWYG工具栏 */}
        {editorMode === 'wysiwyg' && (
          <div className="flex flex-wrap gap-1">
            {/* 文本格式 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`h-8 ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="粗体"
              >
                <Bold className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`h-8 ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="斜体"
              >
                <Italic className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* 标题 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`h-8 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="标题1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`h-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="标题2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`h-8 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="标题3"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* 列表 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`h-8 ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="无序列表"
              >
                <List className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`h-8 ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="有序列表"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`h-8 ${editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                title="引用"
              >
                <Quote className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* 媒体 */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-8 text-gray-600 hover:bg-gray-100"
                title="上传图片"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addImageFromUrl}
                className="h-8 text-gray-600 hover:bg-gray-100"
                title="插入图片链接"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addLink}
                className="h-8 text-gray-600 hover:bg-gray-100"
                title="插入链接"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* 撤销重做 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                title="撤销"
              >
                <Undo className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                title="重做"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Markdown工具栏 */}
        {editorMode === 'markdown' && (
          <div className="flex flex-wrap gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 text-gray-600 hover:bg-gray-100"
              title="上传图片"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addImageFromUrl}
              className="h-8 text-gray-600 hover:bg-gray-100"
              title="插入图片链接"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addLink}
              className="h-8 text-gray-600 hover:bg-gray-100"
              title="插入链接"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <div className="text-xs text-gray-500 ml-2 flex items-center">
              支持标准Markdown语法: **粗体** *斜体* `代码` # 标题 {'>'} 引用 - 列表
            </div>
          </div>
        )}
      </div>

      {/* 编辑器内容 */}
      <div className="relative">
        {editorMode === 'wysiwyg' ? (
          <div className="bg-white">
            <EditorContent editor={editor} />
          </div>
        ) : editorMode === 'markdown' ? (
          <div className="bg-white">
            <Textarea
              value={markdownContent}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              className="min-h-[400px] border-0 resize-none focus:outline-none focus:ring-0 font-mono text-sm p-6"
              placeholder="在这里输入Markdown内容..."
            />
          </div>
        ) : (
          <div className="bg-white min-h-[400px] p-6">
            <MarkdownRenderer content={markdownContent} />
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}