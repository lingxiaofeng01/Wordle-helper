import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const GA_TRACKING_ID = 'G-VY1V4WB079';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Wordle Helper and Solver Tool – Get Hints and Solve Wordle Today',
    template: `%s | Wordle Helper`,
  },
  description: "Play smarter with our free Wordle helper tool and solver. Get today's hints, find answers fast, try guessers, cheats & word finders to beat the puzzle now!",
  keywords: 'Wordle Helper, Wordle solver, Wordle assistant, Wordle tool, word game helper, Wordle strategies, Wordle tips, Wordle cheat, word puzzle solver',
  authors: [{ name: 'Wordle Helper Team' }],
  creator: 'Wordle Helper',
  publisher: 'Wordle Helper',
  robots: 'index, follow',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'Wordle Helper and Solver Tool – Get Hints and Solve Wordle Today',
    description: 'Play smarter with our free Wordle helper tool and solver. Get today\'s hints, find answers fast, try guessers, cheats & word finders to beat the puzzle now!',
    url: 'https://www.wordle-helper.org',
    siteName: 'Wordle Helper',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Wordle Helper - Smart Wordle Solver Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wordle Helper and Solver Tool – Get Hints and Solve Wordle Today',
    description: 'Play smarter with our free Wordle helper tool and solver. Get today\'s hints, find answers fast, try guessers, cheats & word finders to beat the puzzle now!',
    images: ['/og-image.jpg'],
    creator: '@wordlehelper',
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  alternates: {
    canonical: 'https://www.wordle-helper.org',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Wordle Helper and Solver Tool",
    "description": "Play smarter with our free Wordle helper tool and solver. Get today's hints, find answers fast, try guessers, cheats & word finders to beat the puzzle now!",
    "url": "https://www.wordle-helper.org",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "Wordle Helper Team"
    },
    "features": [
      "AI-powered word recommendations",
      "Smart letter analysis",
      "Strategy optimization",
      "Real-time puzzle solving",
      "Free to use"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `}
        </Script>

        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}