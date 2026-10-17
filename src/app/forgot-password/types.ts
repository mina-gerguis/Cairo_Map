export interface UseForgotPasswordFormReturn {
  identifier: string;
  setIdentifier: (val: string) => void;
  loading: boolean;
  error: string;
  setError: (val: string) => void;
  success: boolean;
  sentEmail: string;
  countdown: number;
  focusedField: boolean;
  setFocusedField: (focused: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleResend: () => Promise<void>;
}
