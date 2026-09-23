import React from "react";

export interface PhoneEntry {
  id: string;
  name: string;
  specialty: string;
  phone_number: string;
  logo_url?: string;
  icon?: string;
  description?: string;
}

export interface TelecomCodeEntry {
  id: string;
  company: string;
  section_name: string;
  title: string;
  code: string;
  icon?: string;
}

export interface CompanyMetaConfig {
  label: string;
  logo: string;
  color: string;
  border: string;
  bg: string;
}

export interface DirectoryTopCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  specialtyFilter: string;
}

export interface EmergencyNumber {
  name: string;
  number: string;
  icon: string;
  color: string;
}

export type MainTab = "phones" | "telecom";
export type ModalMode = "suggest" | "report";
export type ModalType = "phone" | "code";

export interface UseDirectoryDataReturn {
  entries: PhoneEntry[];
  codes: TelecomCodeEntry[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  copiedId: string | null;
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;
  activeCompany: string;
  setActiveCompany: (company: string) => void;
  expandedSections: Record<string, boolean>;
  codeInputs: Record<string, string>;
  setCodeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  recentSearches: string[];
  specialties: string[];
  specialtyIcons: Record<string, string>;
  sectionIcons: Record<string, string>;
  searchSuggestions: PhoneEntry[];
  filteredEntries: PhoneEntry[];
  slicedEntries: PhoneEntry[];
  groupedCodes: Record<string, TelecomCodeEntry[]>;
  toggleSection: (sectionName: string) => void;
  handleCopyCode: (code: string, id: string) => Promise<void>;
  handleSaveSearch: (queryText: string) => void;
  clearRecentSearches: () => void;
}

export interface UseDirectoryModalReturn {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  modalMode: ModalMode;
  setModalMode: (mode: ModalMode) => void;
  modalType: ModalType;
  setModalType: (type: ModalType) => void;
  itemName: string;
  setItemName: (name: string) => void;
  itemNumberOrCode: string;
  setItemNumberOrCode: (value: string) => void;
  itemSpecialty: string;
  setItemSpecialty: (specialty: string) => void;
  customSpecialty: string;
  setCustomSpecialty: (custom: string) => void;
  itemCompany: string;
  setItemCompany: (company: string) => void;
  modalNotes: string;
  setModalNotes: (notes: string) => void;
  modalImageFile: File | null;
  modalImagePreview: string | null;
  isDraggingImage: boolean;
  setIsDraggingImage: (dragging: boolean) => void;
  modalLoading: boolean;
  modalUploading: boolean;
  modalSuccess: boolean;
  modalError: string;
  limitChecking: boolean;
  limitReached: boolean;
  handleOpenModal: (
    mode?: ModalMode,
    type?: ModalType,
    presetName?: string,
    presetNumberOrCode?: string
  ) => Promise<void>;
  handleModalImageSelect: (file: File | null) => void;
  handleSubmitModal: (e: React.FormEvent) => Promise<void>;
}

// Component Props Interfaces
export interface DirectoryHeroProps {
  headerRef: React.RefObject<HTMLDivElement | null>;
}

export interface DirectorySliderProps {
  sliderRef: React.RefObject<HTMLDivElement | null>;
  activeMainTab: MainTab;
  selectedSpecialty: string;
  onSelectCategory: (card: DirectoryTopCard) => void;
}

export interface EmergencyRibbonProps {
  ribbonRef: React.RefObject<HTMLDivElement | null>;
}

export interface DirectorySearchPanelProps {
  searchPanelRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  activeMainTab: MainTab;
  setActiveMainTab: (tab: MainTab) => void;
  telecomCodesCount: number;
  recentSearches: string[];
  searchSuggestions: PhoneEntry[];
  onSaveSearch: (queryText: string) => void;
  onClearRecentSearches: () => void;
}

export interface PhoneCardProps {
  entry: PhoneEntry;
  isCopied: boolean;
  onCopy: (phone: string, id: string) => void;
  onReport: (name: string, phone: string) => void;
}

export interface PhonesSectionProps {
  phonesPanelRef: React.RefObject<HTMLDivElement | null>;
  entries: PhoneEntry[];
  filteredEntries: PhoneEntry[];
  slicedEntries: PhoneEntry[];
  specialties: string[];
  specialtyIcons: Record<string, string>;
  selectedSpecialty: string;
  setSelectedSpecialty: (specialty: string) => void;
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  copiedId: string | null;
  onCopy: (phone: string, id: string) => void;
  onOpenSuggestModal: (query?: string) => void;
  onOpenReportModal: (name: string, phone: string) => void;
}

export interface TelecomAccordionProps {
  sectionName: string;
  codeList: TelecomCodeEntry[];
  isExpanded: boolean;
  onToggle: () => void;
  activeCompanyColor?: string;
  sectionIcon?: string;
  codeInputs: Record<string, string>;
  onInputChange: (id: string, value: string) => void;
  copiedId: string | null;
  onCopy: (code: string, id: string) => void;
}

export interface TelecomSectionProps {
  telecomPanelRef: React.RefObject<HTMLDivElement | null>;
  codes: TelecomCodeEntry[];
  activeCompany: string;
  setActiveCompany: (company: string) => void;
  groupedCodes: Record<string, TelecomCodeEntry[]>;
  expandedSections: Record<string, boolean>;
  onToggleSection: (sectionName: string) => void;
  codeInputs: Record<string, string>;
  onInputChange: (id: string, value: string) => void;
  copiedId: string | null;
  onCopy: (code: string, id: string) => void;
  searchQuery: string;
  sectionIcons: Record<string, string>;
  onOpenSuggestModal: (query?: string) => void;
}

export interface ReportAlertBannerProps {
  reportBannerRef: React.RefObject<HTMLDivElement | null>;
  onOpenModal: () => void;
}

export interface DirectoryModalProps {
  modalBoxRef: React.RefObject<HTMLDivElement | null>;
  modalState: UseDirectoryModalReturn;
  specialties: string[];
}
