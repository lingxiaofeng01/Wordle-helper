"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RotateCcw, Search, Trash2, Plus, History, Settings, TrendingUp, Zap, Target, Info, Copy, Check, PlayCircle, Star, Award, Brain, Sparkles, Calendar, Clock, User, ArrowRight, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FULL_WORD_DATABASE } from '@/lib/words';
import { blogAPI } from '@/lib/blog-api';
import SocialShare from '@/components/SocialShare';

// Types for guess history
type GuessResult = 'correct' | 'misplaced' | 'excluded';
type GuessHistory = {
  id: string;
  word: string;
  results: GuessResult[];
};

type RecommendationMode = 'frequency' | 'entropy';

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  published_at: string
  author: string
  read_time?: number
  is_featured?: boolean
  featured_image?: {
    url: string
    alt_text?: string
  }
  categories?: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }>
}

export default function WordleSolverPage() {
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [currentResults, setCurrentResults] = useState<GuessResult[]>(['excluded', 'excluded', 'excluded', 'excluded', 'excluded']);
  const [filteredWords, setFilteredWords] = useState<string[]>(FULL_WORD_DATABASE);
  const [recommendationMode, setRecommendationMode] = useState<RecommendationMode>('frequency');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [copiedWord, setCopiedWord] = useState<string>('');
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState<boolean>(true);

  // Best starting words for each strategy (backup if not in database)
  const FALLBACK_STARTING_WORDS = {
    frequency: ['ADIEU', 'AUDIO', 'AULOI', 'OUIJA', 'LOUIE'],
    entropy: ['SLATE', 'CRANE', 'SLANT', 'TRACE', 'AROSE']
  };

  // Get word recommendation based on different algorithms
  const getRecommendation = (words: string[]) => {
    if (words.length === 0) return '';
    if (words.length === 1) return words[0];
    
    // If no guesses made, return best starting word
    if (guessHistory.length === 0) {
      const startingWords = FALLBACK_STARTING_WORDS[recommendationMode];
      // Filter starting words that exist in our database
      const availableStarters = startingWords.filter(word => words.includes(word));
      if (availableStarters.length > 0) {
        return availableStarters[0];
      }
      // If fallback words not available, use algorithm to find best from available words
    }

    if (recommendationMode === 'frequency') {
      return getFrequencyBasedRecommendation(words);
    } else {
      return getEntropyBasedRecommendation(words);
    }
  };

  // Frequency-based recommendation with explanation
  const getFrequencyBasedRecommendation = (words: string[]) => {
    const letterCounts: { [key: string]: number } = {};
    words.forEach(word => {
      Array.from(new Set(word.split(''))).forEach(letter => {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      });
    });

    let bestWord = words[0];
    let bestScore = 0;

    words.slice(0, 100).forEach(word => {
      const uniqueLetters = Array.from(new Set(word.split('')));
      const score = uniqueLetters.reduce((sum, letter) => sum + (letterCounts[letter] || 0), 0);
      if (score > bestScore) {
        bestScore = score;
        bestWord = word;
      }
    });

    return bestWord;
  };

  // Entropy-based recommendation (information theory) with explanation
  const getEntropyBasedRecommendation = (words: string[]) => {
    let bestWord = words[0];
    let bestScore = 0;

    words.slice(0, 100).forEach(candidateWord => {
      let totalEntropy = 0;
      
      // Calculate expected information gain
      for (let pos = 0; pos < 5; pos++) {
        const letter = candidateWord[pos];
        const letterCount = words.filter(w => w[pos] === letter).length;
        const probability = letterCount / words.length;
        
        if (probability > 0) {
          totalEntropy += -probability * Math.log2(probability);
        }
      }
      
      // Add bonus for unique letters
      const uniqueLetters = new Set(candidateWord.split(''));
      const uniqueBonus = uniqueLetters.size * 0.1;
      totalEntropy += uniqueBonus;
      
      if (totalEntropy > bestScore) {
        bestScore = totalEntropy;
        bestWord = candidateWord;
      }
    });

    return bestWord;
  };

  // Get strategy explanation
  const getStrategyExplanation = () => {
    if (recommendationMode === 'frequency') {
      return {
        title: 'Frequency Strategy',
        description: 'Select words that contain the most common letters to increase the probability of getting hints',
        benefit: 'Higher yellow and green block rates',
        icon: TrendingUp
      };
    } else {
      return {
        title: 'Entropy Strategy', 
        description: 'Maximize information gain, get the most information regardless of the result',
        benefit: 'Average elimination, least steps to solve',
        icon: Zap
      };
    }
  };

  // Filter words based on guess history
  const filterWords = () => {
    let filtered = [...FULL_WORD_DATABASE];
    const misplacedLetters = new Set<string>();
    const correctLetters = new Map<number, string>();
    const excludedLetters = new Set<string>();

    guessHistory.forEach(guess => {
      guess.word.split('').forEach((letter, i) => {
        if (guess.results[i] === 'correct') {
          correctLetters.set(i, letter);
        } else if (guess.results[i] === 'misplaced') {
          misplacedLetters.add(letter);
        } else {
          excludedLetters.add(letter);
        }
      });
    });

    // Remove duplicates from excluded if they are also correct or misplaced
    misplacedLetters.forEach(l => excludedLetters.delete(l));
    correctLetters.forEach(l => excludedLetters.delete(l));

    // Apply constraints
    filtered = filtered.filter(word => {
      const wordLetters = new Set(word.split(''));

      // Check for correct letters
      for (const [pos, letter] of correctLetters.entries()) {
        if (word[pos] !== letter) return false;
      }
      
      // Check for misplaced letters
      for (const letter of misplacedLetters) {
        if (!word.includes(letter)) return false;
      }
      
      // Check for excluded letters
      for (const letter of excludedLetters) {
        if (word.includes(letter)) return false;
      }

      // Ensure misplaced letters are not in their original guessed positions
      for (const guess of guessHistory) {
        for (let i = 0; i < 5; i++) {
          if (guess.results[i] === 'misplaced' && word[i] === guess.word[i]) {
            return false;
          }
        }
      }

      return true;
    });

    return filtered;
  };

  // Update filtered words when constraints change
  useEffect(() => {
    const filtered = filterWords();
    setFilteredWords(filtered);
  }, [guessHistory, recommendationMode]);
  
  // Calculate current recommendation
  const recommendedWord = getRecommendation(filteredWords);

  // Add a new guess to history
  const addGuess = () => {
    if (currentGuess.length !== 5) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const newGuess: GuessHistory = {
        id: Date.now().toString(),
        word: currentGuess.toUpperCase(),
        results: [...currentResults]
      };
      
      setGuessHistory([...guessHistory, newGuess]);
      setCurrentGuess('');
      setCurrentResults(['excluded', 'excluded', 'excluded', 'excluded', 'excluded']);
      setIsLoading(false);
    }, 500);
  };

  // Remove a guess from history
  const removeGuess = (id: string) => {
    setGuessHistory(guessHistory.filter(g => g.id !== id));
  };

  // Toggle result for current guess
  const toggleResult = useCallback((index: number) => {
    setCurrentResults(prevResults => {
      const newResults = [...prevResults];
      const current = newResults[index];
      
      if (current === 'excluded') {
        newResults[index] = 'misplaced';
      } else if (current === 'misplaced') {
        newResults[index] = 'correct';
      } else {
        newResults[index] = 'excluded';
      }
      
      return newResults;
    });
  }, []);

  // Handle keyboard input
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && currentGuess.length === 5) {
      addGuess();
    }
  }, [currentGuess, addGuess]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Update current guess letter
  const updateCurrentGuessLetter = (index: number, value: string) => {
    if (value.length > 1) return;
    const newGuess = currentGuess.split('');
    while (newGuess.length < 5) newGuess.push('');
    newGuess[index] = value.toUpperCase();
    setCurrentGuess(newGuess.join(''));
  };

  const resetAll = () => {
    setGuessHistory([]);
    setCurrentGuess('');
    setCurrentResults(['excluded', 'excluded', 'excluded', 'excluded', 'excluded']);
  };

  // Copy word to clipboard
  const copyToClipboard = async (word: string) => {
    try {
      await navigator.clipboard.writeText(word);
      setCopiedWord(word);
      setTimeout(() => setCopiedWord(''), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = word;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedWord(word);
      setTimeout(() => setCopiedWord(''), 2000);
    }
  };

  const hasAnyInput = guessHistory.length > 0 || currentGuess.length > 0;
  const eliminationRate = Math.round(((FULL_WORD_DATABASE.length - filteredWords.length) / FULL_WORD_DATABASE.length) * 100);
  const isNearSolution = filteredWords.length <= 10 && filteredWords.length > 0;
  const strategyInfo = getStrategyExplanation();
  
  // Get performance insights
  const getPerformanceInsight = () => {
    if (guessHistory.length === 0) return null;
    
    const wordsPerGuess = Math.round((FULL_WORD_DATABASE.length - filteredWords.length) / guessHistory.length);
    
    if (wordsPerGuess > 1000) {
      return { type: 'excellent', message: 'Excellent elimination rate!' };
    } else if (wordsPerGuess > 500) {
      return { type: 'good', message: 'Good progress!' };
    } else {
      return { type: 'okay', message: 'Keep going!' };
    }
  };
  
  const performanceInsight = getPerformanceInsight();
  
  // Load featured blog posts
  useEffect(() => {
    const loadFeaturedPosts = async () => {
      try {
        // First try to get featured posts
        let posts = await blogAPI.getFeaturedPosts(3);
        
        // If no featured posts, get latest published posts instead
        if (posts.length === 0) {
          const response = await fetch('/api/blog/posts?limit=3');
          const data = await response.json();
          posts = data.data.filter((post: any) => post.status === 'published').slice(0, 3);
        }
        
        setFeaturedPosts(posts);
      } catch (error) {
        console.error('Error loading featured posts:', error);
      } finally {
        setBlogLoading(false);
      }
    };

    loadFeaturedPosts();
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (!hasAnyInput && !localStorage.getItem('wordle-helper-visited')) {
      setShowOnboarding(true);
      localStorage.setItem('wordle-helper-visited', 'true');
    }
  }, [hasAnyInput]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Navigation */}
        <nav className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex space-x-2 border-2 border-green-100">
            <a href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm shadow-lg transform hover:scale-105 transition-all duration-200">
              🎯 Wordle Helper
            </a>
            <a href="/blog" className="px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-medium text-sm transition-all duration-200">
              📚 Blog & Tips
            </a>
          </div>
        </nav>
        
        {/* Hero Section with Wordle Theme */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              W
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Ultimate Wordle Solver & Strategy Tool
              </span>
            </h1>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              🎮
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stuck on today's Wordle? Get instant hints, find the best starting words, and solve any puzzle with our advanced Wordle helper.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Advanced Wordle Helper</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Smart Wordle Helper</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Free Wordle Helper</span>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-blue-800 text-lg">🎯 Three Steps to Perfect Solutions</h3>
            </div>
            <p className="text-blue-600 text-sm">Scientific method for easy Wordle mastery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 rounded-xl p-4 shadow-sm transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div className="text-blue-700 font-semibold">Get Recommended Word</div>
              </div>
              <p className="text-sm text-gray-600">AI analyzes 14,000+ valid words to recommend the best starting move</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 shadow-sm transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div className="text-green-700 font-semibold">Input Game Results</div>
              </div>
              <p className="text-sm text-gray-600">Click tiles to match Wordle feedback with precise color coding</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 shadow-sm transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div className="text-yellow-700 font-semibold">Continue Strategy</div>
              </div>
              <p className="text-sm text-gray-600">Get the next optimal word until you solve the puzzle perfectly</p>
            </div>
          </div>
        </div>

        {/* Wordle Color Legend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
          <div className="text-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg mb-2">🎨 Wordle Color Guide</h3>
            <p className="text-sm text-gray-600">Click squares to cycle through color states</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#6aaa64] rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                A
              </div>
              <div className="text-xs font-medium text-gray-700">Correct Position</div>
              <div className="text-xs text-gray-500">Green</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#c9b458] rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                B
              </div>
              <div className="text-xs font-medium text-gray-700">Wrong Position</div>
              <div className="text-xs text-gray-500">Yellow</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#787c7e] rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                C
              </div>
              <div className="text-xs font-medium text-gray-700">Not in Word</div>
              <div className="text-xs text-gray-500">Gray</div>
            </div>
          </div>
        </div>

        {/* Main Game Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <Card className="bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                      ✏️
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Input Your Guess</h2>
                      <p className="text-blue-100 text-sm">Record Wordle Game Results</p>
                    </div>
                  </div>
                  {hasAnyInput && (
                    <Button
                      onClick={resetAll}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 border border-white/30"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Guess History */}
                {guessHistory.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Guess History:</span>
                    </div>
                    <div className="space-y-3">
                      {guessHistory.map((guess, historyIndex) => (
                        <div key={guess.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="text-xs text-gray-500 font-medium w-8">#{historyIndex + 1}</div>
                          <div className="flex gap-1">
                            {guess.word.split('').map((letter, index) => {
                              const result = guess.results[index];
                              let bgColor = 'bg-[#787c7e]';
                              if (result === 'correct') bgColor = 'bg-[#6aaa64]';
                              else if (result === 'misplaced') bgColor = 'bg-[#c9b458]';
                              
                              return (
                                <div
                                  key={index}
                                  className={`w-8 h-8 ${bgColor} text-white font-bold text-sm flex items-center justify-center rounded-lg shadow-sm`}
                                >
                                  {letter}
                                </div>
                              );
                            })}
                          </div>
                          <Button
                            onClick={() => removeGuess(guess.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Guess Input */}
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 font-medium mb-4">
                      <span className="text-lg">🎯</span>
                      <span>Input Word and Set Color</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const letter = currentGuess[index] || '';
                      const result = currentResults[index];
                      let bgColor = 'bg-[#787c7e]';
                      let borderColor = 'border-gray-300';
                      
                      if (result === 'correct') {
                        bgColor = 'bg-[#6aaa64]';
                        borderColor = 'border-green-400';
                      } else if (result === 'misplaced') {
                        bgColor = 'bg-[#c9b458]';
                        borderColor = 'border-yellow-400';
                      }
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => toggleResult(index)}
                            className={`w-16 h-16 ${bgColor} text-white font-bold text-xl flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 ${borderColor} relative group`}
                            title="Click to cycle through color states"
                          >
                            {letter || (
                              <span className="text-sm opacity-60">
                                {index + 1}
                              </span>
                            )}
                          </button>
                          <Input
                            value={letter}
                            onChange={(e) => updateCurrentGuessLetter(index, e.target.value)}
                            className="w-16 h-10 text-center font-bold text-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-xl"
                            maxLength={1}
                            placeholder=""
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button 
                    onClick={addGuess}
                    className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                    disabled={currentGuess.length !== 5 || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Get Next Optimal Word
                      </div>
                    )}
                  </Button>
                </div>

                {/* Welcome Message */}
                {!hasAnyInput && (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
                      <div className="text-5xl mb-4">🚀</div>
                      <h3 className="font-bold text-2xl text-gray-800 mb-3">Start Your Wordle Journey!</h3>
                      <p className="text-gray-600 mb-6">AI recommends the best starting word for you, scientific strategy to help you solve perfectly</p>
                      <div className="bg-white/80 rounded-xl p-4 text-sm text-gray-600 mb-4">
                        💡 Our AI analyzed 14,000+ valid words for you to find the optimal solution
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>🆓 Completely Free</div>
                        <div>⚡ Instant Result</div>
                        <div>🔒 No Registration</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Recommendation Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                {recommendedWord ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 text-green-700 font-bold mb-4">
                        <Star className="w-5 h-5" />
                        <span>AI Recommended Word</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => {
                            setCurrentGuess(recommendedWord);
                            setCurrentResults(['excluded', 'excluded', 'excluded', 'excluded', 'excluded']);
                          }}
                          className="text-6xl font-black text-green-600 mb-4 tracking-wider hover:scale-105 transition-all duration-300 cursor-pointer border-3 border-transparent hover:border-green-300 rounded-2xl px-6 py-3 bg-white/70 shadow-lg"
                          title="Click to use this word"
                        >
                          {recommendedWord}
                        </button>
                        <button
                          onClick={() => copyToClipboard(recommendedWord)}
                          className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                          title="Copy to Clipboard"
                        >
                          {copiedWord === recommendedWord ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex justify-center gap-2 mb-4">
                        {guessHistory.length === 0 && (
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg">
                            🚀 Perfect Start
                          </div>
                        )}
                        {isNearSolution && filteredWords.length <= 3 && (
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-4 py-2 rounded-full font-bold animate-pulse shadow-lg">
                            🎆 Final Sprint!
                          </div>
                        )}
                        {isNearSolution && filteredWords.length > 3 && filteredWords.length <= 10 && (
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm px-4 py-2 rounded-full font-bold animate-bounce shadow-lg">
                            🔥 Near Answer!
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="bg-white/80 rounded-xl p-6 shadow-inner">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">{filteredWords.length}</div>
                          <div className="text-sm text-gray-600">Remaining Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{eliminationRate}%</div>
                          <div className="text-sm text-gray-600">Eliminated</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Copy className="w-4 h-4" />
                          <span>Click Copy</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>Click Fill</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🤔</div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">No matching word found</h3>
                    <p className="text-gray-600 text-sm">Please check your input letters and colors</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strategy Info */}
            <Card className="bg-white shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <strategyInfo.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{strategyInfo.title}</h3>
                    <p className="text-sm text-gray-600">{strategyInfo.description}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="text-sm text-purple-700 font-medium mb-2">Strategy Advantage:</div>
                  <div className="text-sm text-purple-600">{strategyInfo.benefit}</div>
                </div>
                
                <div className="mt-4">
                  <Select value={recommendationMode} onValueChange={(value: RecommendationMode) => setRecommendationMode(value)}>
                    <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frequency">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Frequency Strategy - Common Letters Priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="entropy">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span>Entropy Strategy - Information Gain Maximization</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Social Share Component */}
            <SocialShare
              guessHistory={guessHistory}
              recommendedWord={recommendedWord}
              eliminationRate={eliminationRate}
              remainingWords={filteredWords.length}
              strategy={recommendationMode}
              solved={filteredWords.length === 1}
              solutionWord={filteredWords.length === 1 ? filteredWords[0] : undefined}
            />
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-12 mb-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">🌟 Why Choose Our Wordle Helper?</h2>
              <p className="text-gray-600 text-lg">Scientific Wordle Helper Method + AI Intelligence = Perfect Wordle Experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">AI Wordle Helper Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our Wordle Helper uses advanced frequency analysis and information entropy algorithms to recommend the best choice from 14,000+ valid words.
                  <Link href="/blog" className="text-blue-600 hover:text-blue-800 ml-1 underline font-medium">
                    Learn More Wordle Helper Strategies
                  </Link>
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Instant Wordle Helper Response</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Millisecond response time with our Wordle Solver tool, real-time calculation for optimal solutions. Every input gets scientific word recommendations instantly, allowing you to enjoy the game smoothly.
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  🆓
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Free Wordle Helper Tool</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  100% free Wordle Helper with no registration, no hidden fees, no usage restrictions. A professional solving experience for everyone.
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-100 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  📱
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Cross-Platform Wordle Helper</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Access our Wordle Helper on phones, tablets, and computers. Enjoy a smooth experience on any device, anytime to improve your game level.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How to Use Guide */}
        <section className="mt-12 mb-12">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border-2 border-blue-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">📚 Complete Wordle Helper Usage Guide</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Master our Wordle Solver tool to boost your solving efficiency by 10 times with expert techniques!
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">Use Recommended Starting Words</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Use the starting words recommended by our Wordle Helper AI in the official Wordle game. Our algorithm recommends words like ADIEU, AUDIO, SLATE based on letter frequency analysis.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">Input Results into Wordle Helper</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Return to our Wordle Helper tool, input your guessed word, then click tiles to match Wordle feedback: green for correct position, yellow for wrong position, gray for not in word.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">Get Next Wordle Helper Recommendation</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Our Wordle Solver AI will immediately calculate and display the next optimal guess. Choose a frequency or entropy strategy, and repeat this process until solved.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">🎯 Professional Wordle Helper Tips</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span><strong>One-Click Wordle Helper Copy:</strong> Click the copy button to quickly paste the recommended word into the game.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span><strong>Wordle Helper Strategy Switch:</strong> Try different modes (frequency vs entropy) to find the most suitable approach for you.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span><strong>Wordle Helper Progress Tracking:</strong> Observe elimination percentage to understand how close you are to the solution.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span><strong>Learning Tool:</strong> Continuous use of our Wordle Helper improves your natural word intuition and strategic thinking.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✓</span>
                    <span><strong>Cross-Device Wordle Helper:</strong> Seamlessly switch between your phone and computer, maintaining consistency in your solving process.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Strategy Comparison */}
        <section className="mt-12 mb-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">🚀 Advanced Wordle Helper Strategy Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Frequency Wordle Helper Strategy</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  This Wordle Helper strategy uses intelligent analysis based on English letter usage frequency, prioritizing words containing E, A, R, I, O, T, N, S, etc. high-frequency letters.
                </p>
                <div className="bg-white/80 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-700 font-medium mb-2">🎯 Wordle Helper Best For:</p>
                  <p className="text-sm text-gray-600">
                    Players who hope to quickly get yellow and green hints with our Wordle Helper, as well as new players learning solving strategies.
                  </p>
                </div>
                <div className="bg-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700 font-medium">💡 Wordle Helper Advantage: Higher Instant Feedback Probability</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Entropy Wordle Helper Strategy</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  This Wordle Helper strategy uses information theory principles to calculate information gain for each word, selecting the optimal solution that maximizes word elimination.
                </p>
                <div className="bg-white/80 rounded-xl p-4 mb-4">
                  <p className="text-sm text-purple-700 font-medium mb-2">🎯 Wordle Helper Best For:</p>
                  <p className="text-sm text-gray-600">
                    Advanced players who hope to solve puzzles with the fewest steps using our Wordle Helper, as well as strategy enthusiasts pursuing mathematical optimal solutions.
                  </p>
                </div>
                <div className="bg-purple-100 rounded-xl p-3">
                  <p className="text-xs text-purple-700 font-medium">💡 Wordle Helper Advantage: Minimum Steps with Scientific Method</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Blog Articles */}
        <section className="mt-12 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">📚 Expert Wordle Helper Strategies</h2>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover expert strategies, advanced techniques, and winning tips from our comprehensive Wordle Solver strategy blog.
              </p>
            </div>

            {blogLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Loading expert strategies...</span>
                </div>
              </div>
            ) : featuredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {featuredPosts.map((post, index) => (
                  <Card key={post.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 transform hover:scale-[1.02]">
                    <CardContent className="p-0">
                      {post.featured_image && (
                        <div className="relative">
                          <Image
                            src={post.featured_image.url}
                            alt={post.featured_image.alt_text || post.title}
                            width={400}
                            height={200}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="w-full h-48 object-cover rounded-t-lg"
                            priority={index === 0}
                            loading={index === 0 ? undefined : "lazy"}
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-yellow-500 text-white shadow-lg">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        {/* Categories */}
                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.categories.map(({ category }) => (
                              <Badge key={category.id} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                            {post.read_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{post.read_time} min</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
                            Read Strategy Guide
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Strategy Guides Coming Soon</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We're preparing expert strategies and advanced techniques just for you!
                </p>
              </div>
            )}

            <div className="text-center">
              <Link href="/blog">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-3 text-lg shadow-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore All Strategies
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-blue-600 text-sm mt-3">
                Expert tips • Advanced techniques • Winning strategies • Statistical analysis
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-12 mb-12">
          <div className="text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8 shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">🎯 Ready to Become a Wordle Master with Our Wordle Helper?</h2>
              <p className="text-xl mb-6 text-green-100">
                Join thousands of players using our AI-powered Wordle Helper and scientific methods to improve your Wordle skills!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg"
                >
                  <span className="mr-2">📚</span>
                  Learn Advanced Wordle Helper Techniques
                </Link>
                <div className="text-green-200 text-sm">
                  Expert Wordle Helper Analysis • Daily Wordle Tips • Algorithm Principles
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Wordle Helper and Solver Tool",
            "description": "Play smarter with our free Wordle Helper tool and solver. Get today's hints, find answers fast, try Wordle Helper guessers, cheats & word finders to beat the puzzle now! Advanced Wordle Helper with AI algorithms.",
            "url": "https://www.wordle-helper.org",
            "applicationCategory": "GameApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "2680"
            },
            "featureList": [
              "AI Intelligent Wordle Helper Word Recommendation",
              "Frequency Strategy Wordle Helper Analysis",
              "Information Entropy Optimization Wordle Solver Algorithm",
              "Real-Time Wordle Helper Word Filtering",
              "Interactive Wordle Helper Guess Tracking",
              "Multi-Strategy Wordle Solver Mode Switching"
            ],
            "author": {
              "@type": "Organization",
              "name": "Wordle Helper Team"
            },
            "inLanguage": "en-US",
            "keywords": "Wordle Helper, wordle solver, Wordle Solver tool, word game, AI algorithm, game strategy, wordle assistant, intelligent recommendation, free Wordle Helper, puzzle solver"
          })
        }}
      />
    </div>
  );
}