#!/bin/bash

echo "🎬 CinematicDB Environment Setup"
echo "================================"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
    echo "Current contents:"
    cat .env
    echo ""
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo "📝 Setting up environment variables..."
echo ""

# Get TMDb API Key
read -p "Enter your TMDb API Key (from https://www.themoviedb.org/settings/api): " TMDB_KEY

# Get Supabase URL and Key
echo "Your Supabase URL: https://mxftvocmlcneaecgvknh.supabase.co"
read -p "Enter your Supabase Anon Key (from https://app.supabase.io/project/mxftvocmlcneaecgvknh/settings/api): " SUPABASE_KEY

# Create .env file
cat > .env << EOF
# TMDb API Configuration
VITE_TMDB_API_KEY=${TMDB_KEY}
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Supabase Configuration
VITE_SUPABASE_URL=https://mxftvocmlcneaecgvknh.supabase.co
VITE_SUPABASE_ANON_KEY=${SUPABASE_KEY}
EOF

echo "✅ Environment variables saved to .env"
echo ""
echo "🔧 Next steps:"
echo "1. Run the database migration in Supabase:"
echo "   - Go to https://app.supabase.io/project/mxftvocmlcneaecgvknh"
echo "   - Open SQL Editor"
echo "   - Copy and paste the contents of supabase/migrations/safe_migration.sql"
echo "   - Click Run"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Test the application!"
echo ""
echo "🎉 Setup complete!"
