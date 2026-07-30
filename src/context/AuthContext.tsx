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
  profile: any | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  mfaPending: false,
  logout: async () => {},
  profile: null,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [mfaPending, setMfaPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        setProfile(data);
        // Sync email if it doesn't match
        const activeUser = currentUser || user;
        if (activeUser?.email && data.email !== activeUser.email) {
          await supabase
            .from("profiles")
            .update({ email: activeUser.email })
            .eq("id", userId);
          setProfile({ ...data, email: activeUser.email });
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  const registerSession = async (userId: string) => {
    if (!supabase || typeof window === "undefined") return;
    try {
      let session_id = localStorage.getItem("dftry_device_session_id");
      if (!session_id) {
        session_id = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("dftry_device_session_id", session_id);
      }

      // Helper to detect device name
      const getDeviceName = () => {
        const ua = navigator.userAgent;
        let os = "نظام غير معروف";
        let browser = "متصفح غير معروف";

        if (ua.indexOf("Win") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1 && ua.indexOf("iPhone") === -1 && ua.indexOf("iPad") === -1 && ua.indexOf("iPod") === -1) os = "macOS";
        else if (ua.indexOf("Linux") !== -1 && ua.indexOf("Android") === -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1 || ua.indexOf("iPod") !== -1) os = "iOS";

        if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Edge") === -1 && ua.indexOf("Edg") === -1) browser = "Chrome";
        else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
        else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("Edge") !== -1 || ua.indexOf("Edg") !== -1) browser = "Edge";
        else if (ua.indexOf("MSIE") !== -1 || ua.indexOf("Trident") !== -1) browser = "IE";

        return `${os} - ${browser}`;
      };

      // Helper to detect location
      const getDeviceLocation = async () => {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          if (data.city && data.country_name) {
            const countryAr: { [key: string]: string } = {
              "Egypt": "مصر",
              "Saudi Arabia": "السعودية",
              "United Arab Emirates": "الإمارات",
              "Kuwait": "الكويت",
              "Jordan": "الأردن",
              "Palestine": "فلسطين",
              "Syria": "سوريا",
              "Iraq": "العراق",
              "Lebanon": "لبنان",
              "Libya": "ليبيا",
              "Sudan": "السودان",
              "Morocco": "المغرب",
              "Tunisia": "تونس",
              "Algeria": "الجزائر"
            };
            const country = countryAr[data.country_name] || data.country_name;
            return `${data.city}، ${country}`;
          }
        } catch (e) {
          console.error("IP Geolocation failed:", e);
        }
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          return tz ? tz.split("/")[1] || "مصر" : "مصر";
        } catch {
          return "مصر";
        }
      };

      const device_name = getDeviceName();
      const location = await getDeviceLocation();

      // Upsert into user_devices
      await supabase
        .from("user_devices")
        .upsert({
          user_id: userId,
          session_id: session_id,
          device_name: device_name,
          location: location,
          is_active: true,
          logged_out_at: null
        }, { onConflict: "session_id" });
    } catch (e) {
      console.error("Error registering session details:", e);
    }
  };

  const checkAuthAndMfa = async (currentSession: Session | null) => {
    if (!currentSession || !supabase) {
      setSession(null);
      setUser(null);
      setProfile(null);
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
        setProfile(null);
        setMfaPending(true);
      } else {
        // MFA not required OR MFA already verified (aal2)
        setSession(currentSession);
        setUser(currentSession.user);
        setMfaPending(false);
        await fetchProfile(currentSession.user.id, currentSession.user);
        
        // Register active device session in database
        registerSession(currentSession.user.id);
      }
    } catch (e) {
      setSession(currentSession);
      setUser(currentSession.user);
      setMfaPending(false);
      await fetchProfile(currentSession.user.id, currentSession.user);
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

  // Monitor device session active status
  useEffect(() => {
    if (!user || !supabase) return;

     const checkActiveSession = async () => {
      if (typeof window === "undefined" || !supabase) return;
      const session_id = localStorage.getItem("dftry_device_session_id");
      if (!session_id) return;

      try {
        const { data, error } = await supabase
          .from("user_devices")
          .select("is_active, logged_out_at")
          .eq("session_id", session_id)
          .maybeSingle();

        if (error) {
          console.error("Error verifying active session:", error);
          return;
        }

        if (!data || data.is_active === false || data.logged_out_at !== null) {
          // Remotely logged out or session deleted!
          clearInterval(interval);
          await logout();
        }
      } catch (err) {
        console.error("Failed to check active session status:", err);
      }
    };

    // Check on mount
    checkActiveSession();

    // Check periodically
    const interval = setInterval(checkActiveSession, 12000); // every 12 seconds

    return () => clearInterval(interval);
  }, [user]);

  const logout = async () => {
    if (supabase) {
      try {
        const session_id = typeof window !== "undefined" ? localStorage.getItem("dftry_device_session_id") : null;
        if (session_id) {
          await supabase
            .from("user_devices")
            .update({ is_active: false, logged_out_at: new Date().toISOString() })
            .eq("session_id", session_id);
        }
      } catch (err) {
        console.error("Failed to mark session as inactive during logout:", err);
      }
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setMfaPending(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, session, loading, mfaPending, logout, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
