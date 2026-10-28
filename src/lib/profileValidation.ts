/**
 * Utility functions to check profile completeness.
 * Missing demographic fields (gender, governorate, city, dob, phone) are common
 * when users register or sign in using OAuth providers like Google or Facebook.
 */

export interface MissingProfileFields {
  gender: boolean;
  governorate: boolean;
  city: boolean;
  dob: boolean;
  phone: boolean;
}

export function getMissingProfileFields(profile: any): MissingProfileFields {
  if (!profile || !profile.id) {
    return {
      gender: false,
      governorate: false,
      city: false,
      dob: false,
      phone: false,
    };
  }

  const missingGender = !profile.gender || String(profile.gender).trim() === "";
  const missingGov = !profile.governorate || String(profile.governorate).trim() === "";
  const missingCity = !profile.city || String(profile.city).trim() === "";
  const missingDob = !profile.dob || String(profile.dob).trim() === "";

  // Check phone: must have at least 10 digits (Egyptian mobile number without leading zero)
  const phoneDigits = profile.phone ? String(profile.phone).replace(/\D/g, "") : "";
  const missingPhone = !profile.phone || phoneDigits.length < 10;

  return {
    gender: missingGender,
    governorate: missingGov,
    city: missingCity,
    dob: missingDob,
    phone: missingPhone,
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
    missing.phone
  );
}
