import { supabase } from "./supabase";
import { LOGIN_MESSAGES } from "@/app/login/constants";

/**
 * Checks whether the current browser/device supports WebAuthn / Passkeys (Face ID, Touch ID, Windows Hello, etc.).
 */
export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const hasWebAuthn =
      !!window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";

    if (!hasWebAuthn) return false;

    const isAvailable =
      await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return isAvailable;
  } catch (err) {
    console.warn("Passkey check failed:", err);
    return false;
  }
}

/**
 * Checks whether the current session was authenticated via Passkey / WebAuthn.
 */
export function isSessionPasskeyAuthenticated(userId?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem("cairomap_passkey_authenticated") === "true") return true;
    if (userId && localStorage.getItem("cairomap_passkey_authenticated_user") === userId) return true;
  } catch {
    // Ignore storage errors
  }
  return false;
}

/**
 * Marks the current session as authenticated via Passkey.
 */
export function setPasskeyAuthenticated(userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("cairomap_passkey_authenticated", "true");
    if (userId) {
      localStorage.setItem("cairomap_passkey_authenticated_user", userId);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clears Passkey authentication flags (used upon logout or standard password login).
 */
export function clearPasskeyAuthentication(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("cairomap_passkey_authenticated");
    localStorage.removeItem("cairomap_passkey_authenticated_user");
  } catch {
    // Ignore storage errors
  }
}

/**
 * Signs in using a Passkey (Face ID / Touch ID / Biometrics).
 */
export async function loginWithPasskey() {
  if (!supabase) {
    throw new Error("لم يتم تكوين قاعدة البيانات.");
  }

  try {
    const res = await supabase.auth.signInWithPasskey();

    if (res.error) {
      // Check if user simply dismissed or cancelled the Face ID prompt
      const errMsg = res.error.message?.toLowerCase() || "";
      const isCancelled =
        errMsg.includes("abort") ||
        errMsg.includes("cancel") ||
        errMsg.includes("not allowed") ||
        errMsg.includes("operation was aborted");

      let errorDisplay = res.error.message || "فشل التحقق من مفتاح المرور.";
      if (errMsg.includes("rp id") || errMsg.includes("invalid for this domain")) {
        errorDisplay = LOGIN_MESSAGES.PASSKEY_DOMAIN_ERROR;
      }

      return {
        success: false,
        cancelled: isCancelled,
        error: isCancelled ? null : errorDisplay,
      };
    }

    if (res.data?.user?.id) {
      setPasskeyAuthenticated(res.data.user.id);
    }

    return {
      success: true,
      data: res.data,
      cancelled: false,
      error: null,
    };
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || "";
    const isCancelled =
      msg.includes("abort") ||
      msg.includes("cancel") ||
      msg.includes("not allowed") ||
      err?.name === "NotAllowedError" ||
      err?.name === "AbortError";

    let errorDisplay = err?.message || "تعذر إتمام الدخول عبر مفتاح المرور.";
    if (msg.includes("rp id") || msg.includes("invalid for this domain")) {
      errorDisplay = LOGIN_MESSAGES.PASSKEY_DOMAIN_ERROR;
    }

    return {
      success: false,
      cancelled: isCancelled,
      error: isCancelled ? null : errorDisplay,
    };
  }
}

/**
 * Helper to detect friendly device name (OS + Browser).
 */
export function getDeviceName(): string {
  if (typeof window === "undefined") return "جهاز غير معروف";
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

  return `${os} (${browser})`;
}

export interface StoredPasskey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  isCurrent?: boolean;
}

/**
 * Registers a new Passkey (Face ID / Touch ID) for the currently logged-in user.
 */
export async function createPasskey(userId?: string) {
  if (!supabase) {
    throw new Error("لم يتم تكوين قاعدة البيانات.");
  }

  try {
    const res = await supabase.auth.registerPasskey();

    if (res.error) {
      const errMsg = res.error.message?.toLowerCase() || "";
      const isCancelled =
        errMsg.includes("abort") ||
        errMsg.includes("cancel") ||
        errMsg.includes("not allowed");

      let errorDisplay = res.error.message || "فشل تسجيل مفتاح المرور.";
      if (errMsg.includes("rp id") || errMsg.includes("invalid for this domain")) {
        errorDisplay = LOGIN_MESSAGES.PASSKEY_DOMAIN_ERROR;
      }

      return {
        success: false,
        cancelled: isCancelled,
        error: isCancelled ? null : errorDisplay,
      };
    }

    const currentDeviceName = getDeviceName();
    const createdPasskeyId = res.data?.id || `pk_${Date.now()}`;
    const createdAt = res.data?.created_at || new Date().toISOString();

    // Attempt to set friendly name on Supabase Auth
    try {
      const passkeyApi = (supabase.auth as any)?.passkey;
      if (passkeyApi && typeof passkeyApi.update === "function" && res.data?.id) {
        await passkeyApi.update({ passkeyId: res.data.id, friendlyName: currentDeviceName });
      }
    } catch (e) {
      console.warn("Could not set friendly name on Supabase:", e);
    }

    // Persist in localStorage cache
    if (typeof window !== "undefined" && userId) {
      localStorage.setItem(`cairomap_passkey_enabled_${userId}`, "true");
      try {
        const stored = localStorage.getItem(`cairomap_passkeys_${userId}`);
        const list: StoredPasskey[] = stored ? JSON.parse(stored) : [];
        const exists = list.some((item) => item.id === createdPasskeyId);
        if (!exists) {
          list.unshift({
            id: createdPasskeyId,
            name: currentDeviceName,
            createdAt: createdAt,
            isCurrent: true,
          });
          localStorage.setItem(`cairomap_passkeys_${userId}`, JSON.stringify(list));
        }
      } catch (err) {
        console.warn("Error caching passkey in localStorage:", err);
      }
    }

    return {
      success: true,
      data: res.data,
      cancelled: false,
      error: null,
    };
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || "";
    const isCancelled =
      msg.includes("abort") ||
      msg.includes("cancel") ||
      msg.includes("not allowed") ||
      err?.name === "NotAllowedError" ||
      err?.name === "AbortError";

    let errorDisplay = err?.message || "تعذر تسجيل مفتاح المرور الجديد.";
    if (msg.includes("rp id") || msg.includes("invalid for this domain")) {
      errorDisplay = LOGIN_MESSAGES.PASSKEY_DOMAIN_ERROR;
    }

    return {
      success: false,
      cancelled: isCancelled,
      error: isCancelled ? null : errorDisplay,
    };
  }
}

/**
 * Lists all passkeys registered for the given user.
 */
export async function listPasskeys(userId?: string): Promise<StoredPasskey[]> {
  const currentDeviceName = getDeviceName();
  let serverList: StoredPasskey[] = [];

  if (supabase) {
    try {
      const passkeyApi = (supabase.auth as any)?.passkey;
      if (passkeyApi && typeof passkeyApi.list === "function") {
        const { data, error } = await passkeyApi.list();
        if (!error && Array.isArray(data)) {
          serverList = data.map((item: any) => ({
            id: item.id,
            name: item.friendly_name || currentDeviceName,
            createdAt: item.created_at || new Date().toISOString(),
            lastUsedAt: item.last_used_at,
            isCurrent: item.friendly_name ? item.friendly_name === currentDeviceName : true,
          }));
        }
      }
    } catch (err) {
      console.warn("Could not fetch passkeys from server:", err);
    }
  }

  // Check local cache
  let localList: StoredPasskey[] = [];
  if (typeof window !== "undefined" && userId) {
    try {
      const stored = localStorage.getItem(`cairomap_passkeys_${userId}`);
      if (stored) {
        localList = JSON.parse(stored);
      }
    } catch (err) {
      console.warn("Could not read local passkey list:", err);
    }
  }

  // Merge server and local lists (unique by id)
  const map = new Map<string, StoredPasskey>();
  serverList.forEach((pk) => map.set(pk.id, pk));
  localList.forEach((pk) => {
    if (!map.has(pk.id)) {
      map.set(pk.id, pk);
    }
  });

  const merged = Array.from(map.values());

  // If local had cairomap_passkey_enabled_userId === true but list is empty:
  if (merged.length === 0 && typeof window !== "undefined" && userId) {
    if (localStorage.getItem(`cairomap_passkey_enabled_${userId}`) === "true") {
      const defaultPk: StoredPasskey = {
        id: `pk_${userId.substring(0, 8)}`,
        name: currentDeviceName,
        createdAt: new Date().toISOString(),
        isCurrent: true,
      };
      merged.push(defaultPk);
      localStorage.setItem(`cairomap_passkeys_${userId}`, JSON.stringify(merged));
    }
  }

  // Sort by createdAt descending
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Update localStorage cache and hasPasskey flag
  if (typeof window !== "undefined" && userId) {
    localStorage.setItem(`cairomap_passkeys_${userId}`, JSON.stringify(merged));
    if (merged.length > 0) {
      localStorage.setItem(`cairomap_passkey_enabled_${userId}`, "true");
    } else {
      localStorage.removeItem(`cairomap_passkey_enabled_${userId}`);
    }
  }

  return merged;
}

/**
 * Deletes a passkey by ID.
 */
export async function deletePasskey(passkeyId: string, userId?: string): Promise<{ success: boolean; error?: string | null }> {
  if (supabase) {
    try {
      const passkeyApi = (supabase.auth as any)?.passkey;
      if (passkeyApi && typeof passkeyApi.delete === "function") {
        const { error } = await passkeyApi.delete({ passkeyId });
        if (error) {
          console.warn("Server passkey delete returned error:", error);
        }
      }
    } catch (err: any) {
      console.warn("Could not delete passkey from server:", err);
    }
  }

  // Remove from local storage
  if (typeof window !== "undefined" && userId) {
    try {
      const stored = localStorage.getItem(`cairomap_passkeys_${userId}`);
      let list: StoredPasskey[] = stored ? JSON.parse(stored) : [];
      list = list.filter((item) => item.id !== passkeyId);
      localStorage.setItem(`cairomap_passkeys_${userId}`, JSON.stringify(list));
      if (list.length === 0) {
        localStorage.removeItem(`cairomap_passkey_enabled_${userId}`);
      }
    } catch (err) {
      console.warn("Error updating localStorage after deleting passkey:", err);
    }
  }

  return { success: true };
}

/**
 * Checks whether the current user has at least one registered passkey.
 */
export async function checkHasPasskey(userId?: string): Promise<boolean> {
  if (typeof window !== "undefined" && userId) {
    const cached = localStorage.getItem(`cairomap_passkey_enabled_${userId}`);
    if (cached === "true") return true;
  }

  const list = await listPasskeys(userId);
  return list.length > 0;
}
