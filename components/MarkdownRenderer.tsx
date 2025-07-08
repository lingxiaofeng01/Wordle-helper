"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 自定义链接组件
          a: ({ href, children, ...props }) => {
            // 内部链接使用Next.js Link
            if (href?.startsWith('/') || href?.startsWith('#')) {
              return (
                <Link href={href} className="text-blue-600 hover:text-blue-800 underline">
                  {children}
                </Link>
              )
            }
            // 外部链接
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                {...props}
              >
                {children}
              </a>
            )
          },
          
          // 自定义图片组件
          img: ({ src, alt, ...props }) => {
            const [isLoading, setIsLoading] = useState(true)
            const [hasError, setHasError] = useState(false)

            if (!src) return null

            return (
              <div className="my-6 relative">
                <Image
                  src={src}
                  alt={alt || ''}
                  width={800}
                  height={400}
                  className={`rounded-lg shadow-md mx-auto transition-opacity duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setHasError(true)
                    setIsLoading(false)
                  }}
                />
                {isLoading && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="animate-pulse text-gray-400">Loading...</div>
                  </div>
                )}
                {hasError && (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                    Failed to load image: {alt}
                  </div>
                )}
                {alt && !hasError && !isLoading && (
                  <p className="text-sm text-gray-600 text-center mt-2 italic">{alt}</p>
                )}
              </div>
            )
          },

          // 自定义标题组件
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-semibold text-gray-900 mt-4 mb-2 first:mt-0" {...props}>
              {children}
            </h6>
          ),

          // 自定义段落组件
          p: ({ children, ...props }) => (
            <p className="text-gray-700 leading-relaxed mb-4" {...props}>
              {children}
            </p>
          ),

          // 自定义列表组件
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),

          // 自定义引用组件
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className="border-l-4 border-blue-500 bg-blue-50 p-4 my-6 italic text-gray-700"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // 自定义代码组件
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code 
                  className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} text-sm`} {...props}>
                {children}
              </code>
            )
          },

          // 自定义代码块组件
          pre: ({ children, ...props }) => (
            <div className="my-6">
              <pre 
                className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
                {...props}
              >
                {children}
              </pre>
            </div>
          ),

          // 自定义表格组件
          table: ({ children, ...props }) => (
            <div className="my-6 overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="bg-white" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="border-b border-gray-200" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 last:border-r-0" {...props}>
              {children}
            </td>
          ),

          // 自定义分割线
          hr: ({ ...props }) => (
            <hr className="my-8 border-t border-gray-300" {...props} />
          ),

          // 自定义强调文本
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-700" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 