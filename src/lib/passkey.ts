import { supabase } from "./supabase";

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

      return {
        success: false,
        cancelled: isCancelled,
        error: isCancelled ? null : (res.error.message || "فشل التحقق من مفتاح المرور."),
      };
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

    return {
      success: false,
      cancelled: isCancelled,
      error: isCancelled ? null : (err?.message || "تعذر إتمام الدخول عبر مفتاح المرور."),
    };
  }
}

/**
 * Registers a new Passkey (Face ID / Touch ID) for the currently logged-in user.
 */
export async function createPasskey() {
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

      return {
        success: false,
        cancelled: isCancelled,
        error: isCancelled ? null : (res.error.message || "فشل تسجيل مفتاح المرور."),
      };
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

    return {
      success: false,
      cancelled: isCancelled,
      error: isCancelled ? null : (err?.message || "تعذر تسجيل مفتاح المرور الجديد."),
    };
  }
}
