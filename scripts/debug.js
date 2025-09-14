#!/usr/bin/env node

// Debug script to test CinematicDB setup
console.log('🔍 CinematicDB Debug Script');
console.log('===========================');

// Test 1: Check environment variables
console.log('\n1. Environment Variables:');
const requiredEnvVars = [
  'VITE_TMDB_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

let envCheckPassed = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: MISSING`);
    envCheckPassed = false;
  } else if (envVar.includes('KEY')) {
    console.log(`✅ ${envVar}: Present (${value.substring(0, 10)}...)`);
  } else {
    console.log(`✅ ${envVar}: ${value}`);
  }
}

// Test 2: Try to import the modules (without running them)
console.log('\n2. Module Imports:');
try {
  // This will fail if the .env file isn't set up properly
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase module imported successfully');

  // Try to create a basic client (won't actually connect)
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client created successfully');
  } else {
    console.log('❌ Cannot create Supabase client - missing environment variables');
  }
} catch (error) {
  console.log('❌ Supabase import failed:', error.message);
}

console.log('\n3. Recommendations:');

if (!envCheckPassed) {
  console.log('⚠️  ENVIRONMENT VARIABLES MISSING:');
  console.log('   - Run: chmod +x setup-env.sh && ./setup-env.sh');
  console.log('   - Or manually create .env file with:');
  console.log('     VITE_TMDB_API_KEY=your_key_here');
  console.log('     VITE_SUPABASE_URL=https://mxftvocmlcneaecgvknh.supabase.co');
  console.log('     VITE_SUPABASE_ANON_KEY=your_key_here');
}

console.log('\n4. Database Setup:');
console.log('   - Go to: https://app.supabase.io/project/mxftvocmlcneaecgvknh');
console.log('   - Open SQL Editor');
console.log('   - Run the contents of: supabase/migrations/safe_migration.sql');

console.log('\n5. Testing the App:');
console.log('   - npm run dev');
console.log('   - Check browser console for errors');
console.log('   - Try adding a movie to favorites');

console.log('\n🎯 If issues persist, check:');
console.log('   - Browser Network tab for API failures');
console.log('   - Supabase logs for database errors');
console.log('   - Console for JavaScript errors');

console.log('\n✨ Debug complete!');
