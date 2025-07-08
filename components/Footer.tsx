import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Twitter, Mail, BookOpen, Home, Zap, Info } from 'lucide-react'

const footerLinks = {
  navigation: [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Wordle Solver', href: '/#solver', icon: Zap },
    { name: 'About', href: '/about', icon: Info },
  ],
}

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/wordlehelper',
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/wordlehelper',
    icon: Github,
    color: 'hover:text-gray-900',
  },
  {
    name: 'Email',
    href: 'mailto:contact@wordle-helper.org',
    icon: Mail,
    color: 'hover:text-green-600',
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold">Wordle Helper</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Master Wordle with AI-powered hints, strategic insights, and expert tips. 
              Your ultimate companion for solving word puzzles.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : '_self'}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : ''}
                    className={`text-gray-400 transition-colors ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get the latest Wordle strategies and tips delivered to your inbox.
              </p>
            </div>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-gray-400 text-sm">
              <p>© {currentYear} Wordle Helper. All rights reserved.</p>
            </div>
            <div className="mt-2 md:mt-0">
              <p className="text-gray-400 text-sm">
                Made with ❤️ for Wordle enthusiasts worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 