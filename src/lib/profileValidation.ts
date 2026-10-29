import { transliterateArabicToEnglish } from "@/app/signup/utils";

/**
 * Utility functions to check profile completeness and assist with OAuth onboarding.
 * Missing demographic fields (gender, governorate, city, dob, phone) and OAuth discrepancies
 * (such as missing email or username with Facebook login) are handled here.
 */

export interface MissingProfileFields {
  gender: boolean;
  governorate: boolean;
  city: boolean;
  dob: boolean;
  phone: boolean;
  email: boolean;
  username: boolean;
}

/**
 * Extracts email safely from various places in Supabase User object
 */
export function extractUserEmail(user: any): string {
  if (!user) return "";
  if (user.email && typeof user.email === "string" && user.email.trim() !== "") {
    return user.email.trim();
  }
  if (user.user_metadata?.email && typeof user.user_metadata.email === "string" && user.user_metadata.email.trim() !== "") {
    return user.user_metadata.email.trim();
  }
  if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      const idEmail = identity?.identity_data?.email;
      if (idEmail && typeof idEmail === "string" && idEmail.trim() !== "") {
        return idEmail.trim();
      }
    }
  }
  return "";
}

/**
 * Generates a clean, valid English username (e.g. for Facebook or social users)
 * where username is not provided by the provider.
 */
export function generateSmartUsername(
  fullName?: string,
  email?: string,
  meta?: any,
  userId?: string
): string {
  // 1. Check meta for existing username or preferred_username
  const metaUser = (meta?.user_name || meta?.preferred_username || meta?.nickname || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  if (metaUser.length >= 3) {
    return metaUser.slice(0, 20);
  }

  // 2. Try email prefix if available
  if (email && email.includes("@")) {
    const fromEmail = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (fromEmail.length >= 3) {
      return fromEmail.slice(0, 20);
    }
  }

  // 3. Try transliterating Arabic/English name
  const rawName = fullName || meta?.name || meta?.full_name || `${meta?.first_name || ""} ${meta?.last_name || ""}`.trim();
  if (rawName && rawName.trim().length >= 2) {
    const transliterated = transliterateArabicToEnglish(rawName.toLowerCase().replace(/\s+/g, "_"));
    const cleaned = transliterated.replace(/[^a-z0-9_]/g, "").slice(0, 15);
    if (cleaned.length >= 3) {
      const randomSuffix = Math.floor(Math.random() * 899 + 100); // 3 digits
      return `${cleaned}_${randomSuffix}`.slice(0, 20);
    }
  }

  // 4. Fallback with userId or random digits
  const shortId = userId ? userId.replace(/-/g, "").slice(0, 6) : Math.random().toString(36).slice(2, 8);
  return `user_${shortId}`;
}

export function getMissingProfileFields(profile: any): MissingProfileFields {
  if (!profile || !profile.id) {
    return {
      gender: false,
      governorate: false,
      city: false,
      dob: false,
      phone: false,
      email: false,
      username: false,
    };
  }

  const missingGender = !profile.gender || String(profile.gender).trim() === "";
  const missingGov = !profile.governorate || String(profile.governorate).trim() === "";
  const missingCity = !profile.city || String(profile.city).trim() === "";
  const missingDob = !profile.dob || String(profile.dob).trim() === "";

  // Check phone: must have at least 10 digits
  const phoneDigits = profile.phone ? String(profile.phone).replace(/\D/g, "") : "";
  const missingPhone = !profile.phone || phoneDigits.length < 10;

  // Check email and username (crucial for Facebook OAuth if missing)
  const missingEmail = !profile.email || String(profile.email).trim() === "" || !profile.email.includes("@");
  const missingUsername = !profile.username || String(profile.username).trim() === "";

  return {
    gender: missingGender,
    governorate: missingGov,
    city: missingCity,
    dob: missingDob,
    phone: missingPhone,
    email: missingEmail,
    username: missingUsername,
  };
}

export function isProfileIncomplete(profile: any): boolean {
  if (!profile || !profile.id) return false;
  const missing = getMissingProfileFields(profile);
  return (
    missing.gender ||
    missing.governorate ||
    missing.city ||
    missing.dob ||
    missing.phone ||
    missing.email ||
    missing.username
  );
}
