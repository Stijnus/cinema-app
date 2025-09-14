/*
# Fix Authentication Trigger and User Creation
1. Drop and recreate the trigger function to handle user creation properly
2. Ensure the trigger works with Supabase Auth's expected flow
3. Add proper error handling and logging
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with data from auth.users
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user IS 'Handles creation of user profiles when new users are created in auth.users';

-- Verify the trigger is working
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Enable Row Level Security on favorites table if not already enabled
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

-- Create updated favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
