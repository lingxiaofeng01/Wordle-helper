import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Brain, 
  Target, 
  Users, 
  Award, 
  Globe, 
  BookOpen, 
  TrendingUp,
  Heart,
  Shield,
  Clock,
  Lightbulb
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Wordle Helper | AI-Powered Word Game Assistant',
  description: 'Learn about Wordle Helper, the ultimate AI-powered tool for mastering Wordle and word games. Discover our mission, features, and commitment to helping word game enthusiasts worldwide.',
  keywords: [
    'About Wordle Helper',
    'Wordle AI assistant',
    'word game tools',
    'Wordle strategy',
    'AI word solver',
    'word puzzle helper',
    'game assistant team'
  ],
  openGraph: {
    title: 'About Wordle Helper - AI-Powered Word Game Assistant',
    description: 'Learn about our mission to help word game enthusiasts master Wordle with AI-powered strategies and expert insights.',
    type: 'website',
    url: '/about',
    siteName: 'Wordle Helper',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Wordle Helper - AI-Powered Word Game Assistant',
    description: 'Learn about our mission to help word game enthusiasts master Wordle with AI-powered strategies.',
    site: '@WordleHelper',
    creator: '@WordleHelper',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/about',
  },
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Advanced algorithms analyze patterns and suggest optimal word choices based on statistical analysis and linguistic insights.',
  },
  {
    icon: Target,
    title: 'Strategic Guidance',
    description: 'Get expert tips on letter frequency, word positioning, and elimination strategies to maximize your success rate.',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Track your progress with detailed statistics and insights to understand your strengths and areas for improvement.',
  },
  {
    icon: BookOpen,
    title: 'Educational Content',
    description: 'Access comprehensive guides, tutorials, and blog posts written by word game experts and linguists.',
  },
  {
    icon: Clock,
    title: 'Real-time Assistance',
    description: 'Get instant suggestions and feedback as you play, helping you learn and improve with every game.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Join thousands of word game enthusiasts worldwide who use our tools to enhance their puzzle-solving skills.',
  },
]

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We continuously develop cutting-edge AI technology to provide the most effective word game assistance.',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'Our love for word games and puzzles drives us to create tools that enhance the joy of playing.',
  },
  {
    icon: Shield,
    title: 'Trust',
    description: 'We are committed to fair play and educational enhancement, never promoting cheating or unfair advantages.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We believe in building a supportive community where players can learn from each other and grow together.',
  },
]

const teamMembers = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Lead AI Researcher',
    description: 'PhD in Computational Linguistics with 10+ years experience in natural language processing.',
    expertise: ['Machine Learning', 'Linguistic Analysis', 'Algorithm Development'],
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Game Strategy Expert',
    description: 'Professional puzzle solver and word game champion with expertise in strategic gameplay.',
    expertise: ['Game Theory', 'Strategic Analysis', 'Pattern Recognition'],
  },
  {
    name: 'Emily Thompson',
    role: 'UX/UI Designer',
    description: 'Specialist in creating intuitive and engaging user experiences for educational tools.',
    expertise: ['User Experience', 'Interface Design', 'Accessibility'],
  },
  {
    name: 'David Kim',
    role: 'Full-Stack Developer',
    description: 'Software engineer with expertise in web technologies and real-time applications.',
    expertise: ['React/Next.js', 'Backend Development', 'Performance Optimization'],
  },
]

export default function AboutPage() {
  const generateStructuredData = () => {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Wordle Helper',
      description: 'AI-powered tool for mastering Wordle and word games with strategic insights and expert guidance.',
      url: 'https://www.wordle-helper.org',
      logo: 'https://www.wordle-helper.org/logo.png',
      foundingDate: '2023',
      founders: [
        {
          '@type': 'Person',
          name: 'Wordle Helper Team',
        },
      ],
      numberOfEmployees: '4-10',
      knowsAbout: [
        'Wordle Strategy',
        'Word Games',
        'Artificial Intelligence',
        'Natural Language Processing',
        'Game Theory',
        'Educational Technology',
      ],
      areaServed: 'Worldwide',
      serviceType: 'Educational Technology',
    })
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateStructuredData(),
        }}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                About Wordle Helper
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
                Empowering word game enthusiasts worldwide with AI-powered strategies, 
                expert insights, and educational tools to master Wordle and beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Zap className="w-5 h-5 mr-2" />
                    Try Wordle Helper
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read Our Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                We believe that everyone can improve their word game skills with the right guidance and tools. 
                Our mission is to democratize access to advanced word game strategies through AI technology, 
                making expert-level insights available to players of all skill levels.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Enhance Learning</h3>
                  <p className="text-gray-600">
                    Transform word games into educational experiences that improve vocabulary, 
                    pattern recognition, and strategic thinking skills.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Build Community</h3>
                  <p className="text-gray-600">
                    Foster a supportive community where players can share strategies, 
                    learn from each other, and celebrate their improvements together.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Promote Excellence</h3>
                  <p className="text-gray-600">
                    Provide the tools and knowledge needed to achieve consistent success 
                    and satisfaction in word puzzle games.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Makes Us Different</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Combining cutting-edge AI technology with deep understanding of word games 
                to provide unparalleled assistance and educational value.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do and shape our commitment to the word game community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A diverse group of experts united by our passion for word games and commitment to educational excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                        <p className="text-gray-600 mb-4">{member.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="bg-blue-100 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Elevate Your Word Game?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of players who have improved their Wordle skills with our AI-powered assistance and expert strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Solving Now
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Our Guides
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
} 