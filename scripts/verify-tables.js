import { supabase } from '../src/lib/supabase.ts';

async function verifyTables() {
  console.log('🔍 Verifying database tables...');

  try {
    // Test basic connection first
    console.log('Testing Supabase connection...');
    
    // Simple connection test
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (testError) {
      console.log('❌ Connection error:', testError.message);
      console.log('This could be due to:');
      console.log('1. Network connectivity issues');
      console.log('2. Supabase service temporarily unavailable');
      console.log('3. Incorrect API URL or key configuration');
      return;
    }

    console.log('✅ Connected to Supabase successfully');

    // Check if favorites table exists
    console.log('\nChecking favorites table...');
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (favError) {
      if (favError.code === '42P01') {
        console.log('❌ Favorites table does not exist');
      } else {
        console.log('❌ Favorites table error:', favError.message);
      }
    } else {
      console.log('✅ Favorites table is accessible');
    }

    // Check if watchlist table exists
    console.log('\nChecking watchlist table...');
    const { data: watchlist, error: watchError } = await supabase
      .from('watchlist')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (watchError) {
      if (watchError.code === '42P01') {
        console.log('❌ Watchlist table does not exist');
      } else {
        console.log('❌ Watchlist table error:', watchError.message);
      }
    } else {
      console.log('✅ Watchlist table is accessible');
    }

    // Check if profiles table exists
    console.log('\nChecking profiles table...');
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (profError) {
      if (profError.code === '42P01') {
        console.log('❌ Profiles table does not exist');
      } else {
        console.log('❌ Profiles table error:', profError.message);
      }
    } else {
      console.log('✅ Profiles table is accessible');
    }

    // Test insert into favorites (only if tables exist)
    if (!favError) {
      console.log('\nTesting insert operation...');
      const testInsert = await supabase
        .from('favorites')
        .insert({
          user_id: 'test-user-' + Date.now(),
          media_id: 999999,
          media_type: 'movie',
          title: 'Test Movie',
          poster_path: '/test.jpg',
          backdrop_path: '/test-backdrop.jpg',
          release_date: '2024-01-01',
          vote_average: 8.5
        })
        .select();

      if (testInsert.error) {
        console.log('❌ Insert test failed:', testInsert.error.message);
      } else {
        console.log('✅ Insert test successful');
        console.log('Inserted record:', testInsert.data[0]);
        
        // Clean up test data
        await supabase
          .from('favorites')
          .delete()
          .eq('media_id', 999999)
          .eq('user_id', testInsert.data[0].user_id);
        
        console.log('✅ Test data cleaned up');
      }
    }

  } catch (error) {
    console.log('❌ Verification failed with unexpected error:', error.message);
    console.log('Error type:', error.name);
    
    // Handle specific error types
    if (error.message.includes('socket hang up') || error.message.includes('fetch')) {
      console.log('\n💡 Network connection issue detected:');
      console.log('1. Check your internet connection');
      console.log('2. Verify Supabase URL and API key in .env file');
      console.log('3. Try again in a few moments');
    }
  }
}

// Add retry mechanism with timeout
async function runWithRetry() {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\nAttempt ${attempt} of ${maxRetries}...`);
    
    try {
      await verifyTables();
      break; // Success, exit loop
    } catch (error) {
      if (attempt === maxRetries) {
        console.log('❌ All retry attempts failed');
        process.exit(1);
      }
      
      console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

runWithRetry();
