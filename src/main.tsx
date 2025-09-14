import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import App from './App.tsx';
import './index.css';

// Initialize Supabase auth state
import { supabase } from './lib/supabase';

// Ensure auth state is initialized
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Initial auth session:', session?.user?.id);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
