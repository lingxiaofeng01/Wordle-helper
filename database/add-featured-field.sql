-- Add is_featured field to existing blog_posts table
-- Run this if you already have the blog_posts table created

-- Add the is_featured column if it doesn't exist
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add index for better performance on featured queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);

-- Optional: Create a sample featured post for testing
-- Uncomment the lines below if you want to create test data
/*
INSERT INTO blog_posts (
    title, 
    slug, 
    excerpt, 
    content, 
    status, 
    published_at, 
    author, 
    meta_title, 
    meta_description, 
    is_featured
) VALUES (
    'Ultimate Wordle Strategy Guide: Master the Game with AI-Powered Techniques',
    'ultimate-wordle-strategy-guide',
    'Discover advanced Wordle solving strategies using frequency analysis and entropy optimization. Learn how our AI analyzes 14,000+ words to find optimal solutions.',
    '<h2>Introduction to Advanced Wordle Strategies</h2><p>Wordle has captured the hearts of millions worldwide, but mastering this seemingly simple word puzzle requires more than just luck. In this comprehensive guide, we''ll explore the mathematical and statistical approaches that can dramatically improve your solving success rate.</p><h2>The Science Behind Word Selection</h2><p>Our AI-powered Wordle helper uses two primary strategies:</p><ul><li><strong>Frequency Analysis:</strong> Prioritizing letters that appear most commonly in English words</li><li><strong>Entropy Optimization:</strong> Maximizing information gain with each guess</li></ul><p>These approaches have been tested against thousands of possible Wordle solutions, consistently achieving solution rates above 95%.</p><h2>Starting Word Selection</h2><p>The choice of your first word can make or break your Wordle game. Our analysis of 14,000+ valid words reveals that optimal starting words should:</p><ul><li>Contain high-frequency vowels (A, E, I, O)</li><li>Include common consonants (R, S, T, L, N)</li><li>Avoid repeated letters in early guesses</li></ul><p>Top recommended starting words: ADIEU, AUDIO, SLATE, CRANE, AROSE</p>',
    'published',
    NOW(),
    'Wordle Expert',
    'Ultimate Wordle Strategy Guide - AI-Powered Techniques',
    'Master Wordle with advanced AI strategies. Learn frequency analysis, entropy optimization, and optimal word selection techniques.',
    true
);
*/