import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      } catch (err) {
        console.error("Failed to get initial session:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, data: { [key: string]: any }) => {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          data,
        },
      });
    },
    []
  );

  const signOut = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}
