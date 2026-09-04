"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  const [isSessionRegistered, setIsSessionRegistered] = useState(false);

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    if (!supabase) return;
    try {
      // Auto-check and reset expired subscription in DB
      try {
        await supabase.rpc("check_user_subscription_status", { p_user_id: userId });
      } catch (rpcErr) {
        // Fallback silently if RPC doesn't exist yet
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        // If the user's account is suspended by admin, immediately force logout
        if (data.is_suspended) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account_suspended_notice", "true");
          }
          await logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login?suspended=true";
          }
          return;
        }

        // Fallback check: if subscription_end has passed, treat as free/expired
        const isExpired = data.subscription_tier !== "free" && data.subscription_end && new Date(data.subscription_end) < new Date();
        const profileData = isExpired ? {
          ...data,
          subscription_tier: "free",
          subscription_status: "expired",
          subscription_period: null
        } : data;

        setProfile(profileData);
        // Sync email and any missing profile fields from user_metadata
        const activeUser = currentUser || user;
        const meta = activeUser?.user_metadata;
        const updates: Record<string, any> = {};

        if (activeUser?.email && data.email !== activeUser.email) {
          updates.email = activeUser.email;
        }
        if (meta) {
          if ((!data.phone || data.phone === "") && meta.phone) updates.phone = meta.phone;
          if ((!data.gender || data.gender === "") && meta.gender) updates.gender = meta.gender;
          if ((!data.governorate || data.governorate === "") && meta.governorate) updates.governorate = meta.governorate;
          if ((!data.city || data.city === "") && meta.city) updates.city = meta.city;
          if ((!data.avatar_url || data.avatar_url === "") && meta.avatar_url) updates.avatar_url = meta.avatar_url;
          if ((!data.dob || data.dob === "") && meta.dob) updates.dob = meta.dob;
          if ((!data.full_name || data.full_name === "") && meta.full_name) updates.full_name = meta.full_name;
          if ((!data.username || data.username === "") && meta.username) updates.username = meta.username;
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId);
          setProfile({ ...profileData, ...updates });
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
      setIsSessionRegistered(false);
      setLoading(false);
      return;
    }

    try {
      // Check if user is suspended BEFORE setting session or user in state!
      const { data: profCheck } = await supabase
        .from("profiles")
        .select("is_suspended")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (profCheck?.is_suspended) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("account_suspended_notice", "true");
        }
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setMfaPending(false);
        setIsSessionRegistered(false);
        setLoading(false);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?suspended=true";
        }
        return;
      }

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
        // Password verified, BUT MFA (2FA) is required and NOT YET verified!
        // DO NOT set user as authenticated until 2FA code is verified!
        setSession(currentSession);
        setUser(null);
        setProfile(null);
        setMfaPending(true);
        setIsSessionRegistered(false);
      } else {
        // MFA not required OR MFA already verified (aal2)
        setSession(currentSession);
        setUser(currentSession.user);
        setMfaPending(false);
        await fetchProfile(currentSession.user.id, currentSession.user);
        
        // Register active device session in database
        await registerSession(currentSession.user.id);
        setIsSessionRegistered(true);
      }
    } catch (e) {
      try {
        const { data: profCheck } = await supabase
          .from("profiles")
          .select("is_suspended")
          .eq("id", currentSession.user.id)
          .maybeSingle();

        if (profCheck?.is_suspended) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account_suspended_notice", "true");
          }
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setMfaPending(false);
          setIsSessionRegistered(false);
          setLoading(false);
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
            window.location.href = "/login?suspended=true";
          }
          return;
        }
      } catch (err) {}

      setSession(currentSession);
      setUser(currentSession.user);
      setMfaPending(false);
      await fetchProfile(currentSession.user.id, currentSession.user);
      
      // Register active device session in database even on error
      await registerSession(currentSession.user.id);
      setIsSessionRegistered(true);
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

  const logout = useCallback(async () => {
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
      setIsSessionRegistered(false);
    }
  }, []);

  // Monitor device session active status
  useEffect(() => {
    if (!user || !supabase || !isSessionRegistered) return;

    let interval: ReturnType<typeof setInterval>;
    let cancelled = false;

     const checkActiveSession = async () => {
      if (typeof window === "undefined" || !supabase || cancelled) return;
      const session_id = localStorage.getItem("dftry_device_session_id");
      if (!session_id) return;

      try {
        // Try to update last_seen_at to keep the session alive in real-time
        const updateRes = await supabase
          .from("user_devices")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("session_id", session_id)
          .select("is_active, logged_out_at")
          .maybeSingle();

        let data = updateRes.data;
        let error = updateRes.error;

        // Fallback if last_seen_at column does not exist in the database yet
        if (error && (error.message.includes("last_seen_at") || error.code === "PGRST204")) {
          const fallbackRes = await supabase
            .from("user_devices")
            .select("is_active, logged_out_at")
            .eq("session_id", session_id)
            .maybeSingle();
          data = fallbackRes.data;
          error = fallbackRes.error;
        }

        if (error || cancelled) {
          if (error) console.error("Error verifying active session:", error);
          return;
        }

        // If no record found, the session hasn't been registered yet — skip this check
        if (!data) return;

        if (data.is_active === false || data.logged_out_at !== null) {
          // Remotely logged out or deactivated!
          clearInterval(interval);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account_suspended_notice", "true");
          }
          if (!cancelled) {
            await logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login?suspended=true";
            }
          }
          return;
        }

        // Also check if account is suspended directly in profiles
        const { data: profCheck } = await supabase
          .from("profiles")
          .select("is_suspended")
          .eq("id", user.id)
          .maybeSingle();

        if (profCheck?.is_suspended) {
          clearInterval(interval);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account_suspended_notice", "true");
          }
          if (!cancelled) {
            await logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login?suspended=true";
            }
          }
          return;
        }
      } catch (err) {
        console.error("Failed to check active session status:", err);
      }
    };

    // Delay the first check to give registerSession time to complete the upsert
    const initialDelay = setTimeout(() => {
      if (cancelled) return;
      checkActiveSession();
      // Then check periodically
      interval = setInterval(checkActiveSession, 12000); // every 12 seconds
    }, 3000); // wait 3 seconds before first check

    return () => {
      cancelled = true;
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [user, isSessionRegistered, logout]);

  // Real-time listener for instant suspension detection
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel(`profile-suspension-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        async (payload: any) => {
          if (payload.new && payload.new.is_suspended) {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("account_suspended_notice", "true");
            }
            await logout();
            if (typeof window !== "undefined") {
              window.location.href = "/login?suspended=true";
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, logout]);

  // Active suspension monitor (polls every 3.5s and on tab focus/visibility change)
  useEffect(() => {
    if (!user || !supabase) return;

    let cancelled = false;

    const enforceSuspensionCheck = async () => {
      if (cancelled || !supabase || !user) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("is_suspended")
          .eq("id", user.id)
          .maybeSingle();

        if (data?.is_suspended) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account_suspended_notice", "true");
          }
          await logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login?suspended=true";
          }
        }
      } catch (err) {
        console.error("Suspension monitor check error:", err);
      }
    };

    const interval = setInterval(enforceSuspensionCheck, 3500);
    const onActivity = () => {
      enforceSuspensionCheck();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", onActivity);
      document.addEventListener("visibilitychange", onActivity);
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onActivity);
        document.removeEventListener("visibilitychange", onActivity);
      }
    };
  }, [user, logout]);


  return (
    <AuthContext.Provider value={{ user, session, loading, mfaPending, logout, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
