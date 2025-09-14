#!/usr/bin/env node

// Create .env file for CinematicDB
const fs = require('fs');
const path = require('path');

console.log('📝 Creating .env file for CinematicDB');
console.log('=====================================');

const envPath = path.join(__dirname, '.env');
const envContent = `# Supabase Configuration
# Get these from: https://app.supabase.io/project/mxftvocmlcneaecgvknh/settings/api
VITE_SUPABASE_URL=https://mxftvocmlcneaecgvknh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# TMDb API Configuration
# Get from: https://www.themoviedb.org/settings/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📍 Location:', envPath);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Edit the .env file and replace the placeholder values');
    console.log('2. Get your Supabase keys from the dashboard');
    console.log('3. Get your TMDb API key from their website');
    console.log('4. Run: npm run dev');
} catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('');
    console.log('💡 Alternative: Create .env manually with this content:');
    console.log(envContent);
}
