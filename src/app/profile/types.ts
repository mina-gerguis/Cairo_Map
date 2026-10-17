export interface UserProfile {
  id: string;
  full_name?: string;
  username?: string;
  phone?: string;
  email?: string;
  governorate?: string;
  city?: string;
  dob?: string;
  gender?: string;
  avatar_url?: string;
  interests?: string[];
  points?: number;
  balance?: number;
  promo_balance?: number;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_period?: "daily" | "monthly" | "yearly" | null;
  subscription_end?: string | null;
  is_admin?: boolean;
  last_username_change?: string | null;
}

export interface ProfileFormData {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  dob: string;
  avatarUrl: string;
  interests: string[];
}

export interface InterestItem {
  id: string;
  label: string;
  icon: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_daily: number;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

export type SubscriptionPeriod = "daily" | "monthly" | "yearly";

export interface UserDevice {
  id: string;
  session_id: string;
  device_name: string;
  location?: string;
  logged_in_at: string;
  logged_out_at?: string;
  is_active: boolean;
}

export interface BalanceTransaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  method: string;
  provider_number?: string;
  recipient_name?: string;
  transaction_id?: string;
  image_url?: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  created_at: string;
}

export interface PlaceProposal {
  id: string;
  name: string;
  governorate: string;
  city: string;
  status: "pending" | "approved" | "rejected" | "retracted";
  rejection_reason?: string;
  created_at: string;
}

export interface PlaceReport {
  id: string;
  place_id: string;
  place_name?: string;
  problem_type: string;
  admin_reply?: string;
  status: "pending" | "reviewed" | "accepted" | "rejected" | "retracted";
  created_at: string;
}

export interface AppFeedback {
  id: string;
  user_id: string;
  type: "suggestion" | "bug";
  category?: string;
  title?: string;
  content: string;
  image_url?: string | null;
  admin_reply?: string;
  status: "pending" | "reviewed" | "action_taken";
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  created_at?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  contactType: string;
  message: string;
}

export interface MfaFactorsState {
  totp: boolean;
  email: boolean;
  whatsapp: boolean;
}

export type MfaStep = "selection" | "enroll" | "unenroll_confirm";

export interface PasswordForm {
  new: string;
  confirm: string;
}

export interface PasswordRules {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  match: boolean;
}

export interface ProfileAlertMessage {
  type: "success" | "error";
  text: string;
}

export interface FavoritePlaceItem {
  id: string;
  name: string;
  category?: string;
  categoryLabel?: string;
  briefLocation?: string;
  fullAddress?: string;
  phones?: string[];
  googleMapsUrl?: string;
  images?: string[];
  menuImages?: string[];
  workingHours?: string;
  rating?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  isLandmark?: boolean;
  landmarkObj?: any;
  cityObj?: any;
}

export interface ReminderItem {
  id: string;
  placeId: string;
  note: string;
  updatedAt: string;
  placeName: string;
}
