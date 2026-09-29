export interface PasswordRules {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  match: boolean;
}

export type FocusedResetField = "password" | "confirmPassword" | null;

export interface UseResetPasswordFormReturn {
  checkingSession: boolean;
  hasValidSession: boolean;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;
  focusedField: FocusedResetField;
  setFocusedField: (field: FocusedResetField) => void;
  loading: boolean;
  error: string;
  setError: (val: string) => void;
  isSuccess: boolean;
  pwdRules: PasswordRules;
  isPasswordValid: boolean;
  redirectCountdown: number;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
