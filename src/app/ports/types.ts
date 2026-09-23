export interface Port {
  id?: string;
  name: string;
  governorate: string;
  sea: string;
  type: string;
  capacity: string;
  description: string;
  berths_count?: string;
  connections?: string[];
  operator?: string;
  status?: string;
  map_url: string;
}

export type PortFilter = "all" | "mediterranean" | "redsea" | "commercial" | "passenger";

export interface CategoryCounts {
  all: number;
  mediterranean: number;
  redsea: number;
  commercial: number;
  passenger: number;
}

export interface PortFilterOption {
  id: PortFilter;
  label: string;
  icon: string;
  subLabel?: string;
  color?: string;
  glow?: string;
}

export interface SeaPaletteItem {
  color: string;
  glow: string;
  icon: string;
}
