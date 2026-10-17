import React, { RefObject } from "react";
import CommonRouteSearchCard, { SearchSuggestion } from "@/components/common/RouteSearchCard";
import { CitySuggestion } from "../types";
import { calculateLocationScore } from "../utils";

interface RouteSearchCardProps {
  searchPanelRef: RefObject<HTMLDivElement | null>;
  fromInput: string;
  toInput: string;
  setFromInput: (val: string) => void;
  setToInput: (val: string) => void;
  uniqueCitiesList: CitySuggestion[];
  onSearch: () => void;
  onSwap: () => void;
  isLocating: boolean;
  onUseGPS: () => void;
  locationBadge?: string | null;
  onClearLocationBadge?: () => void;
}

export default function RouteSearchCard({
  searchPanelRef,
  fromInput,
  toInput,
  setFromInput,
  setToInput,
  uniqueCitiesList,
  onSearch,
  onSwap,
  isLocating,
  onUseGPS,
  locationBadge,
  onClearLocationBadge,
}: RouteSearchCardProps) {
  const filterSuggestions = (items: (SearchSuggestion | string)[], query: string) => {
    const rawInput = query.trim();
    if (!rawInput) return [];

    return (items as CitySuggestion[])
      .map((item) => {
        const score = calculateLocationScore(item.name, item.searchNames?.join(", "), rawInput);
        return { item, score };
      })
      .filter(({ item, score }) => {
        if (item.name.toLowerCase() === rawInput.toLowerCase()) return false;
        return score >= 120;
      })
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);
  };

  return (
    <CommonRouteSearchCard
      searchPanelRef={searchPanelRef}
      fromInput={fromInput}
      toInput={toInput}
      setFromInput={setFromInput}
      setToInput={setToInput}
      suggestions={uniqueCitiesList}
      filterSuggestions={filterSuggestions}
      onSearch={onSearch}
      onSwap={onSwap}
      isLocating={isLocating}
      onUseGPS={onUseGPS}
      locationBadge={locationBadge}
      onClearLocationBadge={onClearLocationBadge}
    />
  );
}
