import React from "react";

export type LoginStep = "credentials" | "mfa";

export type FocusedField = "email" | "password" | null;

export interface LoginLayoutProps {
  children: React.ReactNode;
}

export interface LoginGlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface LoginHeaderProps {
  title?: string;
  subtitle?: string;
}

export interface CredentialsFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  keepSignedIn: boolean;
  setKeepSignedIn: (val: boolean) => void;
  focusedField: FocusedField;
  setFocusedField: (field: FocusedField) => void;
  loading: boolean;
  googleLoading: boolean;
  onGoogleLogin: () => void;
  facebookLoading: boolean;
  onFacebookLogin: () => void;
  passkeyLoading: boolean;
  hasPasskeySupport: boolean;
  onPasskeyLogin: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface MfaVerificationFormProps {
  mfaCode: string;
  codeDigits: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  loading: boolean;
  onDigitChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export interface LoginFooterLinksProps {
  onGuestClick?: () => void;
}

export interface UseLoginFormReturn {
  // Step & state
  loginStep: LoginStep;
  setLoginStep: (step: LoginStep) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  keepSignedIn: boolean;
  setKeepSignedIn: (val: boolean) => void;
  focusedField: FocusedField;
  setFocusedField: (field: FocusedField) => void;
  loading: boolean;
  googleLoading: boolean;
  facebookLoading: boolean;
  passkeyLoading: boolean;
  hasPasskeySupport: boolean;
  error: string;
  setError: (err: string) => void;

  // MFA
  mfaCode: string;
  codeDigits: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleDigitChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent) => void;

  // Actions
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleFacebookLogin: () => Promise<void>;
  handlePasskeyLogin: () => Promise<void>;
  handleVerifyMfa: (e: React.FormEvent) => Promise<void>;
  handleCancelMfa: () => Promise<void>;
}
