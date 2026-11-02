'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  X,
  Compass,
  TrainFront,
  Zap,
  Bookmark,
  Sparkles,
  Phone,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Shortcut {
  label: string;
  icon: React.ReactNode;
  link: string;
  onClick?: () => void;
}

export interface SearchResult {
  icon?: React.ReactNode;
  image?: string;
  label: string;
  description: string;
  link: string;
  badge?: string;
  onClick?: () => void;
}

const SVGFilter = () => {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
      <filter id="blob">
        <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
        <feColorMatrix
          values="
      1 0 0 0 0
      0 1 0 0 0
      0 0 1 0 0
      0 0 0 18 -9
    "
          result="blob"
        />
        <feBlend in="SourceGraphic" in2="blob" />
      </filter>
      <filter id="apple-spotlight-blob">
        <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
        <feColorMatrix
          values="
      1 0 0 0 0
      0 1 0 0 0
      0 0 1 0 0
      0 0 0 18 -9
    "
          result="blob"
        />
        <feBlend in="SourceGraphic" in2="blob" />
      </filter>
    </svg>
  );
};

interface ShortcutButtonProps {
  icon: React.ReactNode;
  link: string;
  label?: string;
  onClick?: () => void;
}

const ShortcutButton = ({ icon, link, label, onClick }: ShortcutButtonProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      e.preventDefault();
      router.push(link);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label || 'اختصار'}
      className="apple-spotlight-shortcut-bubble active:scale-95 transition-transform"
    >
      <div className="apple-spotlight-shortcut-icon">{icon}</div>
    </button>
  );
};

interface SpotlightPlaceholderProps {
  text: string;
  className?: string;
}

const SpotlightPlaceholder = ({ text, className }: SpotlightPlaceholderProps) => {
  return (
    <motion.div
      layout
      className={cn(
        'absolute text-neutral-400 flex items-center pointer-events-none z-10 select-none overflow-hidden max-w-full',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.p
          layoutId={`placeholder-${text}`}
          key={`placeholder-${text}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="whitespace-nowrap overflow-hidden text-ellipsis font-medium"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

interface SpotlightInputProps {
  placeholder: string;
  hidePlaceholder: boolean;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  placeholderClassName?: string;
  isMac?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const SpotlightInput = ({
  placeholder,
  hidePlaceholder,
  value,
  onChange,
  onClear,
  onKeyDown,
  onFocus,
  placeholderClassName,
  isMac = false,
  inputRef
}: SpotlightInputProps) => {
  const hasValue = Boolean(value && value.length > 0);

  return (
    <div className="apple-spotlight-input-row">
      <div className="apple-spotlight-icon-wrap">
        <Search size={20} className="size-5 md:size-6 stroke-[2]" />
      </div>

      <div className="apple-spotlight-field-wrap">
        {!hasValue && !hidePlaceholder && (
          <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className="apple-spotlight-input"
          autoComplete="off"
          spellCheck={false}
          dir="rtl"
        />
      </div>
    </div>
  );
};

interface SearchResultCardProps extends SearchResult {
  isLast: boolean;
  isSelected?: boolean;
}

const SearchResultCard = ({
  icon,
  image,
  label,
  description,
  link,
  badge,
  isLast,
  isSelected,
  onClick
}: SearchResultCardProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      e.preventDefault();
      router.push(link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'apple-spotlight-item group/card',
        isSelected && 'is-selected',
        isLast && 'rounded-b-2xl'
      )}
    >
      <div className="apple-spotlight-item-icon-wrap">
        {image ? (
          <Image
            src={image}
            alt={label}
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        ) : (
          <div className="size-6 flex items-center justify-center [&_svg]:size-5 [&_svg]:stroke-[1.6]">
            {icon || <Search className="size-5" />}
          </div>
        )}
      </div>

      <div className="apple-spotlight-item-content">
        <p className="apple-spotlight-item-title">{label}</p>
        <p className="apple-spotlight-item-desc">{description}</p>
      </div>

      {badge && <span className="apple-spotlight-item-badge">{badge}</span>}

      <div className="apple-spotlight-item-chevron">
        <ChevronLeft className="size-5" />
      </div>
    </div>
  );
};

interface SearchResultsContainerProps {
  searchResults: SearchResult[];
  onHover: (index: number | null) => void;
  selectedIndex?: number;
  emptyState?: React.ReactNode;
}

const SearchResultsContainer = ({
  searchResults,
  onHover,
  selectedIndex = -1,
  emptyState
}: SearchResultsContainerProps) => {
  if (searchResults.length === 0) {
    return (
      <div className="apple-spotlight-results">
        {emptyState || (
          <div className="py-8 text-center text-neutral-400 text-sm">
            لا توجد نتائج مطابقة لبحثك
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onMouseLeave={() => onHover(null)}
      className="apple-spotlight-results"
    >
      {searchResults.map((result, index) => {
        return (
          <motion.div
            key={`search-result-${index}-${result.link}`}
            onMouseEnter={() => onHover(index)}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{
              delay: Math.min(index * 0.025, 0.15),
              duration: 0.15,
              ease: 'easeOut'
            }}
          >
            <SearchResultCard
              icon={result.icon}
              image={result.image}
              label={result.label}
              description={result.description}
              link={result.link}
              badge={result.badge}
              onClick={result.onClick}
              isSelected={selectedIndex === index}
              isLast={index === searchResults.length - 1}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export interface AppleSpotlightProps {
  shortcuts?: Shortcut[];
  searchResults?: SearchResult[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  emptyState?: React.ReactNode;
  footer?: React.ReactNode;
  isMac?: boolean;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    label: 'مترو الأنفاق',
    icon: <TrainFront className="size-6 text-blue-500" />,
    link: '/metro'
  },
  {
    label: 'قطار المونوريل',
    icon: <Zap className="size-6 text-emerald-500" />,
    link: '/monorail'
  },
  {
    label: 'ازاي اروح؟',
    icon: <Compass className="size-6 text-amber-500" />,
    link: '/directions'
  },
  {
    label: 'أحفظ مكاني',
    icon: <Bookmark className="size-6 text-purple-500" />,
    link: '/save-location'
  },
  {
    label: 'مخطط الرحلات الذكي',
    icon: <Sparkles className="size-6 text-indigo-500" />,
    link: '/ai-planner'
  },
  {
    label: 'دليل الهواتف والأكواد',
    icon: <Phone className="size-6 text-rose-500" />,
    link: '/directory'
  }
];

const DEFAULT_RESULTS: SearchResult[] = [
  {
    icon: <TrainFront className="size-5 text-blue-500" />,
    label: 'خريطة مترو القاهرة الكبرى',
    description: 'خطوط المترو، المحطات التبادلية، وأسعار التذاكر الحديثة',
    link: '/metro',
    badge: 'مواصلات'
  },
  {
    icon: <Zap className="size-5 text-emerald-500" />,
    label: 'قطار المونوريل المعلق',
    description: 'مونوريل شرق النيل (العاصمة الإدارية) وغرب النيل (6 أكتوبر)',
    link: '/monorail',
    badge: 'قطار سريع'
  },
  {
    icon: <Compass className="size-5 text-amber-500" />,
    label: 'ازاي اروح؟ دليل الوصول والمواصلات',
    description: 'مسارات دقيقة وخطوط السير لأي وجهة في مصر',
    link: '/directions',
    badge: 'مسارات'
  },
  {
    icon: <Bookmark className="size-5 text-purple-500" />,
    label: 'أحفظ مكاني وركنة السيارة',
    description: 'حفظ موقعك الحالي وإحداثيات GPS بدقة متناهية مع رابط الخريطة',
    link: '/save-location',
    badge: 'ميزة ذكية'
  },
  {
    icon: <Sparkles className="size-5 text-indigo-500" />,
    label: 'مخطط الرحلات بالذكاء الاصطناعي',
    description: 'تخطيط يومك وخروجاتك بالكامل باقتراحات مخصصة',
    link: '/ai-planner',
    badge: 'AI Planner'
  },
  {
    icon: <Store className="size-5 text-rose-500" />,
    label: 'دليل الأماكن والأنشطة',
    description: 'المطاعم، الكافيهات، المستشفيات، العيادات والمراكز التجارية',
    link: '/places',
    badge: 'دليل الأماكن'
  }
];

const AppleSpotlight = ({
  shortcuts = DEFAULT_SHORTCUTS,
  searchResults,
  searchValue: controlledValue,
  onSearchChange,
  onSubmit,
  placeholder = 'ابحث عن الخدمة، المكان، أو خط المواصلات...',
  emptyState,
  footer,
  isMac = false,
  className,
  inputRef: externalInputRef
}: AppleSpotlightProps) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = externalInputRef || internalInputRef;

  const [hovered, setHovered] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState<number | null>(null);
  const [hoveredShortcut, setHoveredShortcut] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Internal search state if not controlled
  const [internalValue, setInternalValue] = useState('');
  const searchValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSearchValueChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalValue(value);
    }
    setSelectedIndex(-1);
    if (!isDropdownOpen && value.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleClear = () => {
    handleSearchValueChange('');
    activeInputRef.current?.focus();
  };

  const activeResults = searchResults !== undefined ? searchResults : DEFAULT_RESULTS;

  // Keyboard navigation inside inline component
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      handleClear();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      if (activeResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1 < activeResults.length ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      if (activeResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeResults.length - 1));
      }
      return;
    }

    if (e.key === 'Enter') {
      if (onSubmit) {
        onSubmit(e);
      }
      if (selectedIndex >= 0 && activeResults[selectedIndex]) {
        e.preventDefault();
        const item = activeResults[selectedIndex];
        setIsDropdownOpen(false);
        if (item.onClick) item.onClick();
        if (item.link.startsWith('http')) {
          window.open(item.link, '_blank');
        } else {
          router.push(item.link);
        }
      } else if (activeResults.length > 0 && searchValue.trim()) {
        e.preventDefault();
        const item = activeResults[0];
        setIsDropdownOpen(false);
        if (item.onClick) item.onClick();
        if (item.link.startsWith('http')) {
          window.open(item.link, '_blank');
        } else {
          router.push(item.link);
        }
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isDropdownOpen && searchValue.trim().length > 0;

  return (
    <div
      ref={wrapperRef}
      className={cn('apple-spotlight-inline-wrapper', className)}
      dir="rtl"
    >
      <SVGFilter />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setHoveredShortcut(null);
        }}
        className="apple-spotlight-blob-container"
      >
        <div className="apple-spotlight-card">
          <SpotlightInput
            inputRef={activeInputRef}
            placeholder={
              hoveredShortcut !== null
                ? shortcuts[hoveredShortcut].label
                : placeholder
            }
            placeholderClassName={
              hoveredShortcut !== null
                ? 'text-primary font-bold'
                : 'text-neutral-400'
            }
            hidePlaceholder={Boolean(searchValue && searchValue.length > 0)}
            value={searchValue}
            onChange={handleSearchValueChange}
            onClear={handleClear}
            onFocus={() => {
              if (searchValue.trim()) setIsDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            isMac={isMac}
          />
        </div>

        {/* Spring Out Fluid Shortcuts Tray (Inline Beside Search Card) */}
        <AnimatePresence>
          {hovered && !searchValue.trim() && shortcuts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="hidden sm:flex items-center gap-2.5 mr-2"
            >
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={`shortcut-${index}-${shortcut.label}`}
                  onMouseEnter={() => setHoveredShortcut(index)}
                  layout
                  initial={{ scale: 0.6, x: 30 * (index + 1), opacity: 0 }}
                  animate={{ scale: 1, x: 0, opacity: 1 }}
                  exit={{
                    scale: 0.6,
                    x: 15 * (shortcuts.length - index),
                    opacity: 0
                  }}
                  transition={{
                    duration: 0.5,
                    type: 'spring',
                    bounce: 0.25,
                    delay: index * 0.03
                  }}
                >
                  <ShortcutButton
                    icon={shortcut.icon}
                    link={shortcut.link}
                    label={shortcut.label}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Glassmorphic Dropdown in Place */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="apple-spotlight-dropdown-panel"
          >
            <SearchResultsContainer
              searchResults={activeResults}
              onHover={setHoveredSearchResult}
              selectedIndex={selectedIndex}
              emptyState={emptyState}
            />
            {footer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { AppleSpotlight, SpotlightPlaceholder, SpotlightInput, SearchResultCard };
