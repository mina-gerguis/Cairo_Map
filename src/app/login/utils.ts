/**
 * Check if the given input is formatted as an email address
 */
export function isEmailAddress(input: string): boolean {
  return input.trim().includes("@");
}

/**
 * Clean username by trimming, converting to lower case, and keeping only alphanumeric and underscores
 */
export function cleanUsername(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

/**
 * Check whether the user was redirected with an account suspension notice
 */
export function isSuspendedNoticePresent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const hasParam = params.get("suspended") === "true";
    const hasSession = sessionStorage.getItem("account_suspended_notice") === "true";
    return hasParam || hasSession;
  } catch {
    return false;
  }
}

/**
 * Clean up suspension flag from sessionStorage
 */
export function clearSuspensionNotice(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("account_suspended_notice");
  } catch {
    // Ignore storage errors
  }
}
