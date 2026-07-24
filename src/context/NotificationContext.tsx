"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteAll: async () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // For toast
  const [toast, setToast] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    if (!user || !supabase) return;
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${user.id},and(user_id.is.null,created_at.gte.${user.created_at})`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const readBroadcasts = JSON.parse(localStorage.getItem(`read_broadcasts_${user.id}`) || "[]");
      const deletedBroadcasts = JSON.parse(localStorage.getItem(`deleted_broadcasts_${user.id}`) || "[]");
      
      const filteredData = data.filter(n => !deletedBroadcasts.includes(n.id)).map(n => {
        if (n.user_id === null && readBroadcasts.includes(n.id)) {
          return { ...n, is_read: true };
        }
        return n;
      });

      setNotifications(filteredData);
      setUnreadCount(filteredData.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!user || !supabase) return;

    const handleNewNotification = (payload: any) => {
      const newNotif = payload.new as Notification;
      const deletedBroadcasts = JSON.parse(localStorage.getItem(`deleted_broadcasts_${user.id}`) || "[]");
      if (deletedBroadcasts.includes(newNotif.id)) return;

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setToast(newNotif);
      
      setTimeout(() => {
        setToast((currentToast) => currentToast?.id === newNotif.id ? null : currentToast);
      }, 5000);
    };

    const subscription = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        handleNewNotification
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=is.null` },
        handleNewNotification
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(subscription);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!supabase || !user) return;
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (notif.user_id === null) {
      const readBroadcasts = JSON.parse(localStorage.getItem(`read_broadcasts_${user.id}`) || "[]");
      if (!readBroadcasts.includes(id)) {
        localStorage.setItem(`read_broadcasts_${user.id}`, JSON.stringify([...readBroadcasts, id]));
      }
    } else {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
  };

  const markAllAsRead = async () => {
    if (!supabase || !user) return;
    
    const unreadBroadcasts = notifications.filter(n => n.user_id === null && !n.is_read).map(n => n.id);
    if (unreadBroadcasts.length > 0) {
      const readBroadcasts = JSON.parse(localStorage.getItem(`read_broadcasts_${user.id}`) || "[]");
      localStorage.setItem(`read_broadcasts_${user.id}`, JSON.stringify([...new Set([...readBroadcasts, ...unreadBroadcasts])]));
    }

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  };

  const deleteAll = async () => {
    if (!supabase || !user) return;
    
    const broadcasts = notifications.filter(n => n.user_id === null).map(n => n.id);
    if (broadcasts.length > 0) {
      const deletedBroadcasts = JSON.parse(localStorage.getItem(`deleted_broadcasts_${user.id}`) || "[]");
      localStorage.setItem(`deleted_broadcasts_${user.id}`, JSON.stringify([...new Set([...deletedBroadcasts, ...broadcasts])]));
    }

    setNotifications([]);
    setUnreadCount(0);
    await supabase.from("notifications").delete().eq("user_id", user.id);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, deleteAll }}>
      {children}
      {/* Toast Notification UI */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "rgba(12, 16, 40, 0.97)",
          border: "1px solid rgba(108, 99, 255, 0.3)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          padding: "16px",
          borderRadius: "16px",
          zIndex: 9999,
          animation: "slide-up 0.3s ease",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          maxWidth: "320px",
          direction: "rtl"
        }}>
          <div style={{ fontSize: "1.5rem" }}>
            {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "🔔"}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 4px", fontSize: "1rem", color: "#fff" }}>{toast.title}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", padding: "0 4px", marginLeft: "-8px" }}
          >
            ×
          </button>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
