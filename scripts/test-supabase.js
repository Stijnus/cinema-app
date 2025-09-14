#!/usr/bin/env node

// Test Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Supabase Connection');
console.log('==============================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n1. Environment Variables:');
if (!supabaseUrl) {
    console.log('❌ VITE_SUPABASE_URL: MISSING');
    console.log('   💡 Set VITE_SUPABASE_URL in your .env file');
    console.log('   💡 Get from: https://app.supabase.io/project/mxftvocmlcneaecgvknh/settings/api');
    process.exit(1);
} else {
    console.log('✅ VITE_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseKey) {
    console.log('❌ VITE_SUPABASE_ANON_KEY: MISSING');
    console.log('   💡 Set VITE_SUPABASE_ANON_KEY in your .env file');
    console.log('   💡 Get from: https://app.supabase.io/project/mxftvocmlcneaecgvknh/settings/api');
    process.exit(1);
} else {
    console.log('✅ VITE_SUPABASE_ANON_KEY: Present (', supabaseKey.substring(0, 10), '...)');
}

console.log('\n2. Testing Supabase Client:');
try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
} catch (error) {
    console.log('❌ Failed to create Supabase client:', error.message);
    process.exit(1);
}

console.log('\n3. Testing Database Connection:');
async function testConnection() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Test basic connection
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
            .maybeSingle();

        if (error) {
            console.log('❌ Database connection failed:', error.message);
            console.log('   Code:', error.code);
            console.log('');

            if (error.code === '42P01') {
                console.log('   💡 SOLUTION: Run database migration');
                console.log('   1. Go to https://app.supabase.io/project/mxftvocmlcneaecgvknh');
                console.log('   2. Open SQL Editor');
                console.log('   3. Run: supabase/migrations/safe_migration.sql');
            } else if (error.code === 'PGRST116') {
                console.log('   ✅ Database tables exist, but are empty (this is normal)');
            } else {
                console.log('   💡 Check your Supabase keys are correct');
            }
        } else {
            console.log('✅ Database connection successful');
        }

        // Test auth
        console.log('\n4. Testing Authentication:');
        try {
            const { data: authData, error: authError } = await supabase.auth.getSession();
            if (authError) {
                console.log('❌ Auth check failed:', authError.message);
            } else {
                console.log('✅ Auth system working');
                console.log('   Current session:', authData.session ? 'Active' : 'None');
            }
        } catch (authErr) {
            console.log('❌ Auth test error:', authErr.message);
        }

    } catch (err) {
        console.log('❌ Connection test failed:', err.message);
        console.log('   💡 Check your internet connection');
        console.log('   💡 Verify Supabase URL and key are correct');
    }
}

testConnection().then(() => {
    console.log('\n✨ Test complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. If tests failed, run: ./setup-supabase.sh');
    console.log('   2. If database tables missing, run migration in Supabase');
    console.log('   3. Try: npm run dev');
});
