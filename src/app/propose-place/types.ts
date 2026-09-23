export type ProposalStatus = "pending" | "approved" | "rejected";

export interface PlaceProposalFormData {
  name: string;
  category: string;
  category_label: string;
  sub_categories: string[];
  place_type: string;
  place_type_icon: string;
  governorate: string;
  city: string;
  address: string;
  phone: string;
  description: string;
  image_url: string;
  images: string[];
  working_hours: string;
  price_range: string;
  location_url: string;
  facebook: string;
  instagram: string;
  website_url: string;
  services: string[];
  features: string[];
}

export interface PlaceProposal {
  id: string;
  user_id: string;
  name: string;
  category: string;
  category_label?: string;
  sub_categories?: string[];
  place_type?: string | null;
  place_type_icon?: string | null;
  governorate: string;
  city: string;
  address?: string;
  phone?: string;
  description?: string;
  image_url?: string;
  images?: string[];
  working_hours?: string;
  price_range?: string;
  location_url?: string;
  website_url?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
  };
  services?: string[];
  features?: string[];
  status: ProposalStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryItem {
  name: string;
  label: string;
  icon: string;
  color?: string;
}
