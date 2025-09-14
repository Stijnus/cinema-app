#!/bin/bash

echo "🔧 CinematicDB Supabase Setup"
echo "============================"

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "Current Supabase configuration:"
    grep -E "VITE_SUPABASE" .env || echo "No Supabase config found"
    echo ""
    read -p "Update Supabase configuration? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📋 Get your Supabase credentials from:"
echo "   https://app.supabase.io/project/mxftvocmlcneaecgvknh/settings/api"
echo ""
echo "Look for:"
echo "   - Project URL"
echo "   - anon public key"
echo ""

read -p "Enter your Supabase Project URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_KEY

# Create or update .env file
if [ ! -f ".env" ]; then
    touch .env
fi

# Remove existing Supabase config
sed -i.bak '/^VITE_SUPABASE/d' .env

# Add new Supabase config
echo "# Supabase Configuration" >> .env
echo "VITE_SUPABASE_URL=${SUPABASE_URL}" >> .env
echo "VITE_SUPABASE_ANON_KEY=${SUPABASE_KEY}" >> .env

echo ""
echo "✅ Supabase configuration updated in .env"
echo ""
echo "🔄 Restart your development server:"
echo "   npm run dev"
echo ""
echo "🧪 Test authentication:"
echo "   - Try signing up/in with any email/password"
echo "   - Check browser console for errors"
