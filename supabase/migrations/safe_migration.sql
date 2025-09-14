/*
# Safe Migration Script - Can be run multiple times safely
# This script handles existing policies and tables gracefully
*/

-- Create profiles table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  vote_average DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id, media_type)
);

-- Create watchlist table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  vote_average DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id, media_type)
);

-- Create search_history table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('movie', 'tv', 'multi')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop and recreate to handle updates)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Favorites policies (drop and recreate to handle updates)
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Watchlist policies (drop and recreate to handle updates)
DROP POLICY IF EXISTS "Users can view own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON watchlist;

CREATE POLICY "Users can view own watchlist" ON watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Search history policies (drop and recreate to handle updates)
DROP POLICY IF EXISTS "Users can view own search history" ON search_history;
DROP POLICY IF EXISTS "Users can insert own search history" ON search_history;
DROP POLICY IF EXISTS "Users can delete own search history" ON search_history;

CREATE POLICY "Users can view own search history" ON search_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON search_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON search_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_media ON favorites(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_media ON watchlist(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- Function to handle user profile creation (safe to run multiple times)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation (safe to run multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify setup with a simple test query
SELECT
  'Migration completed successfully!' as status,
  COUNT(*) as tables_created
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'favorites', 'watchlist', 'search_history');
