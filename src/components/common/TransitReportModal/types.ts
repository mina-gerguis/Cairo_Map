import React, { RefObject } from "react";
import { User } from "@supabase/supabase-js";

export interface ReportProblemOption {
  id: string;
  title: string;
  desc?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
}

export interface ReportScopeOption {
  id: string;
  label: string;
  icon?: string;
}

export interface TransitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalBoxRef?: RefObject<HTMLDivElement | null>;

  // Title & Category
  title?: string;
  titleIcon?: React.ReactNode;
  category: string; // Used for database categorization

  // User & Limits (optional: automatically uses useAuth & isFeedbackLimitReached if not provided)
  user?: User | null;
  limitChecking?: boolean;
  limitReached?: boolean;

  // Problem Types
  problemOptions: ReportProblemOption[];
  defaultProblemType?: string;

  // Scopes (e.g. general, route, station)
  scopeOptions?: ReportScopeOption[];
  defaultScope?: string;

  // Context Info (rendered when contextScopeId matches active scope)
  contextScopeId?: string;
  contextInfo?: React.ReactNode;
  contextDetailsText?: string;

  // Custom report title generator
  getReportTitle?: (scope: string, problemOption: ReportProblemOption) => string;

  // Optional storage folder prefix
  storageFolderPrefix?: string;

  // Callbacks
  onSuccess?: () => void;
}
