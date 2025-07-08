import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Twitter, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface GuessHistory {
  id: string
  word: string
  results: ('correct' | 'misplaced' | 'excluded')[]
}

interface SocialShareProps {
  guessHistory: GuessHistory[]
  recommendedWord: string
  eliminationRate: number
  remainingWords: number
  strategy: 'frequency' | 'entropy'
  solved?: boolean
  solutionWord?: string
}

export default function SocialShare({
  guessHistory,
  recommendedWord,
  eliminationRate,
  remainingWords,
  strategy,
  solved = false,
  solutionWord
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  // Generate share text
  const generateShareText = () => {
    const strategyName = strategy === 'frequency' ? 'Frequency Strategy' : 'Entropy Strategy'
    const guessCount = guessHistory.length
    
    let shareText = `🎯 Wordle Helper Solving Record\n\n`
    
    if (solved && solutionWord) {
      shareText += `✅ Successfully solved: ${solutionWord}\n`
      shareText += `🎲 Used ${guessCount} guesses\n`
    } else {
      shareText += `🤔 Solving in progress...\n`
      shareText += `🎲 Guessed ${guessCount} times\n`
      shareText += `💡 Next recommendation: ${recommendedWord}\n`
    }
    
    shareText += `📊 Elimination rate: ${eliminationRate}%\n`
    shareText += `🔢 Remaining words: ${remainingWords}\n`
    shareText += `🧠 Strategy used: ${strategyName}\n\n`
    
    // Add visual guess history
    if (guessHistory.length > 0) {
      shareText += `Guess History:\n`
      guessHistory.forEach((guess, index) => {
        shareText += `${index + 1}. ${guess.word} `
        guess.results.forEach(result => {
          if (result === 'correct') shareText += '🟩'
          else if (result === 'misplaced') shareText += '🟨'
          else shareText += '⬛'
        })
        shareText += '\n'
      })
      shareText += '\n'
    }
    
    shareText += `🔗 Try the AI solver: ${window.location.origin}/#solver`
    
    return shareText
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Twitter share
  const shareToTwitter = () => {
    const text = generateShareText()
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  // Facebook share (link only)
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  // Don't show if no guess history
  if (guessHistory.length === 0) {
    return null
  }

  return (
    <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-800 text-lg">Share Your Results</h3>
          </div>
          <p className="text-blue-600 text-sm mb-6">
            {solved ? 'Congratulations on solving it! Share your achievement' : 'Share your solving progress and strategy with friends'}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={shareToTwitter}
              className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            
            <Button
              onClick={shareToFacebook}
              className="bg-[#4267B2] hover:bg-[#365899] text-white px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
            
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400 px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </>
              )}
            </Button>
          </div>
          
          {/* Preview share content */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
              Preview Share Content
            </summary>
            <div className="mt-3 p-4 bg-white rounded-xl border text-sm text-gray-700 whitespace-pre-line">
              {generateShareText()}
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  )
} 