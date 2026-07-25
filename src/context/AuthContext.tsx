"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaPending: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  mfaPending: false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [mfaPending, setMfaPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthAndMfa = async (currentSession: Session | null) => {
    if (!currentSession || !supabase) {
      setSession(null);
      setUser(null);
      setMfaPending(false);
      setLoading(false);
      return;
    }

    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
        // Password verified, BUT MFA (2FA) is required and NOT YET verified!
        // DO NOT set user as authenticated until 2FA code is verified!
        setSession(currentSession);
        setUser(null);
        setMfaPending(true);
      } else {
        // MFA not required OR MFA already verified (aal2)
        setSession(currentSession);
        setUser(currentSession.user);
        setMfaPending(false);
      }
    } catch (e) {
      setSession(currentSession);
      setUser(currentSession.user);
      setMfaPending(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuthAndMfa(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await checkAuthAndMfa(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setMfaPending(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, mfaPending, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
