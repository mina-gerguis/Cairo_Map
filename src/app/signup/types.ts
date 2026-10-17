export interface SignupFormData {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  governorate: string;
  city: string;
  avatarUrl: string;
  password: string;
  confirmPassword: string;
}

export interface SignupFieldErrors {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
}

export interface PasswordRules {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  match: boolean;
}

export interface OnboardingSlide {
  imageUrl: string;
  title: string;
  desc: string;
}

export interface StepInfo {
  label: string;
  headerTitle: string;
  subTitle: string;
  gradient: string;
}

export interface EmailOtpState {
  isVerified: boolean;
  sent: boolean;
  otp: string;
  hash: string;
  expiresAt: number | null;
  timer: number;
  loading: boolean;
  error: string;
  digits: string[];
}
