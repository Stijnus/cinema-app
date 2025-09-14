import { supabase } from '../src/lib/supabase.ts';

async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  // Test 1: Basic connection
  console.log('\n1. Testing basic connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.log('❌ Basic connection failed:', error.message);
      console.log('Error code:', error.code);
    } else {
      console.log('✅ Basic connection successful');
    }
  } catch (error) {
    console.log('❌ Connection test crashed:', error.message);
  }

  // Test 2: Check environment variables
  console.log('\n2. Checking environment variables...');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('Supabase Key:', supabaseKey ? '✅ Present' : '❌ Missing');
  
  if (supabaseUrl && supabaseKey) {
    console.log('URL format:', supabaseUrl.startsWith('https://') ? '✅ Valid' : '❌ Invalid');
    console.log('Key format:', supabaseKey.length > 30 ? '✅ Valid length' : '❌ Too short');
  }

  // Test 3: Simple fetch test
  console.log('\n3. Testing direct fetch...');
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    
    console.log('Fetch status:', response.status, response.statusText);
    if (response.ok) {
      console.log('✅ Direct fetch successful');
    } else {
      console.log('❌ Direct fetch failed');
    }
  } catch (error) {
    console.log('❌ Direct fetch error:', error.message);
  }
}

testConnection().catch(console.error);
