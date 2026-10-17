import React, { RefObject } from "react";

export interface CardsSliderItem {
  id?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: string | React.ReactNode;
  image?: string;
  accentColor?: string;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface CardsSliderProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  title?: React.ReactNode;
  titleIcon?: React.ReactNode;
  action?: React.ReactNode;
  items: CardsSliderItem[];
  className?: string;
  sliderClassName?: string;
  cardClassName?: string;
  emptyState?: React.ReactNode;
  itemMinWidth?: string;
  itemMaxWidth?: string;
}
