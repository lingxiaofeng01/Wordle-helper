'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Search, BookOpen, ArrowLeft, Puzzle, HelpCircle } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | Wordle Helper',
  description: 'The page you are looking for could not be found. Explore our Wordle strategies, tips, and tools to improve your word game skills.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center space-x-2 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-red-600">4</span>
            </div>
            <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-yellow-600">0</span>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-green-600">4</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">Wordle-style 404!</div>
        </div>

        {/* Main Message */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <HelpCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Oops! Word Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                The page you're looking for seems to have vanished into the ether. 
                Don't worry, even the best Wordle players sometimes guess wrong!
              </p>
              <p className="text-gray-500">
                Let's get you back on track to mastering word puzzles.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Wordle Helper Home
                </Button>
              </Link>
              
              <Link href="/blog">
                <Button variant="outline" className="w-full hover:bg-blue-50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Strategy Blog
                </Button>
              </Link>
            </div>

            {/* Suggestions */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                <Puzzle className="w-5 h-5 inline mr-2" />
                What would you like to do?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Try our AI-powered Wordle helper tool
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <Link href="/blog" className="hover:text-blue-600 transition-colors">
                    Read expert Wordle strategies and tips
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <Link href="/test" className="hover:text-blue-600 transition-colors">
                    Test your word game skills
                  </Link>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Fun Wordle Tip */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-green-800 mb-2">
              💡 Pro Tip While You're Here
            </h4>
            <p className="text-green-700 text-sm">
              Start your Wordle with words like <strong>SLATE</strong>, <strong>RAISE</strong>, or <strong>ADIEU</strong> 
              to maximize vowel coverage and common consonants!
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
    </div>
  )
} 