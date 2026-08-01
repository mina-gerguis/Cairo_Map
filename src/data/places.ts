export type PlaceCategory = string;

export interface CategoryItem {
  id?: string;
  name: string;
  label: string;
  icon: string;
  color?: string;
}

export interface SubCategoryItem {
  name: string;
  label: string;
  icon: string;
}

export interface MainCategoryItem {
  name: string;
  label: string;
  icon: string;
  emoji: string;
  color: string;
  subCategories: SubCategoryItem[];
}

export const CATEGORIES_STRUCTURE: MainCategoryItem[] = [
  // Food and Drinks
  { 
    name: 'food_drinks',
    label: 'أكل ومشروبات',
    icon: 'bx-dish',
    emoji: '🍴',
    color: '#ff3b30',
    subCategories: [
      { name: 'restaurant', label: 'مطاعم', icon: 'bx bx-restaurant' },
      { name: 'fast_food', label: 'فاست فود', icon: 'bx bx-cheese' },
      { name: 'bakery', label: 'مخابز وحلويات', icon: 'bx bx-cookie' },
      { name: 'cafe', label: 'كافيهات', icon: 'bx bx-coffee' },
      { name: 'juice_bar', label: 'عصائر', icon: 'bx bx-drink' },
    ]
  },
  // Health
  {
    name: 'health',
    label: 'صحة',
    icon: 'bx-plus-medical',
    emoji: '🏥',
    color: '#007aff',
    subCategories: [
      { name: 'hospital', label: 'مستشفيات', icon: 'bx bx-plus-medical' },
      { name: 'clinic', label: 'عيادات', icon: 'bx bx-first-aid' },
      { name: 'pharmacy', label: 'صيدليات', icon: 'bx bx-capsule' },
      { name: 'dental_clinic', label: 'عيادات أسنان', icon: 'bx bx-smile' },
      { name: 'eye_center', label: 'مراكز عيون', icon: 'bx bx-show' },
      { name: 'lab', label: 'معامل تحاليل', icon: 'bx bx-test-tube' },
      { name: 'radiology', label: 'مراكز أشعة', icon: 'bx bx-scan' },
      { name: 'ambulance', label: 'إسعاف', icon: 'bx bx-run' },
    ]
  },
  // Shopping
  {
    name: 'shopping',
    label: 'تسوق',
    icon: 'bx-shopping-bag',
    emoji: '🛍️',
    color: '#ff9500',
    subCategories: [
      { name: 'mall', label: 'مولات', icon: 'bx bx-store-alt' },
      { name: 'supermarket', label: 'سوبر ماركت', icon: 'bx bx-cart' },
      { name: 'mobile_store', label: 'محلات موبايلات', icon: 'bx bx-mobile' },
      { name: 'computer_store', label: 'محلات كمبيوتر', icon: 'bx bx-laptop' },
      { name: 'clothing_store', label: 'ملابس', icon: 'bx bx-closet' },
      { name: 'shoe_store', label: 'أحذية', icon: 'bx bx-football' },
      { name: 'jewelry', label: 'مجوهرات', icon: 'bx bx-diamond' },
      { name: 'cosmetics', label: 'مستحضرات تجميل', icon: 'bx bx-heart' },
      { name: 'furniture', label: 'أثاث', icon: 'bx bx-home' },
      { name: 'bookstore', label: 'مكتبات', icon: 'bx bx-book' },
      { name: 'toy_store', label: 'ألعاب', icon: 'bx bx-joystick' },
      { name: 'pet_store', label: 'مستلزمات حيوانات', icon: 'bx bx-bone' },
      { name: 'flower_shop', label: 'ورد وهدايا', icon: 'bx bx-gift' },
      { name: 'hardware_store', label: 'أدوات منزلية', icon: 'bx bx-wrench' },
    ]
  },
  // Automotive
  {
    name: 'automotive',
    label: 'سيارات',
    icon: 'bx-car',
    emoji: '🚗',
    color: '#5856d6',
    subCategories: [
      { name: 'gas_station', label: 'محطات بنزين', icon: 'bx bx-gas-pump' },
      { name: 'car_service', label: 'مراكز صيانة', icon: 'bx bx-cog' },
      { name: 'car_dealer', label: 'معارض سيارات', icon: 'bx bx-car' },
      { name: 'tire_shop', label: 'كاوتش', icon: 'bx bx-analyse' },
      { name: 'car_wash', label: 'مغاسل سيارات', icon: 'bx bx-water' },
      { name: 'parking', label: 'مواقف سيارات', icon: 'fa-solid fa-car-tunnel' },
    ]
  },
  // Tourism
  {
    name: 'tourism',
    label: 'إقامة وسياحة',
    icon: 'bx-compass',
    emoji: '🏨',
    color: '#af52de',
    subCategories: [
      { name: 'hotel', label: 'فنادق', icon: 'bx bx-hotel' },
      { name: 'apartment_hotel', label: 'شقق فندقية', icon: 'bx bx-building' },
      { name: 'guest_house', label: 'بيوت ضيافة', icon: 'bx bx-home-heart' },
      { name: 'camp', label: 'مخيمات', icon: 'fa-solid fa-tent' },
      { name: 'travel_agency', label: 'شركات سياحة', icon: 'bx bx-paper-plane' },
    ]
  },
  // Entertainment
  {
    name: 'entertainment',
    label: 'ترفيه',
    icon: 'bx-party',
    emoji: '🎭',
    color: '#ff2d55',
    subCategories: [
      { name: 'cinema', label: 'سينما', icon: 'bx bx-film' },
      { name: 'amusement_park', label: 'ملاهي', icon: 'bx bx-laugh' },
      { name: 'water_park', label: 'أكوا بارك', icon: 'bx bx-swim' },
      { name: 'bowling', label: 'بولينج', icon: 'bx bx-bowling-ball' },
      { name: 'swimming_pool', label: 'حمامات سباحة', icon: 'bx bx-swim' },
      { name: 'theater', label: 'مسارح', icon: 'bx bx-mask' },
      { name: 'museum', label: 'متاحف', icon: 'fa-solid fa-building-columns' },
      { name: 'gallery', label: 'معارض', icon: 'bx bx-image' },
      { name: 'event_venue', label: 'فعاليات', icon: 'bx bx-calendar-event' },
    ]
  },
  // Sports
  {
    name: 'sports',
    label: 'رياضة',
    icon: 'bx-run',
    emoji: '🏋️',
    color: '#34c759',
    subCategories: [
      { name: 'gym', label: 'جيم', icon: 'bx bx-dumbbell' },
      { name: 'sports_field', label: 'ملاعب', icon: 'bx bx-football' },
      { name: 'tennis_court', label: 'ملاعب تنس', icon: 'bx bx-tennis-ball' },
      { name: 'sports_academy', label: 'أكاديميات رياضية', icon: 'bx bx-award' },
      { name: 'bike_rental', label: 'تأجير دراجات', icon: 'bx bx-cycling' },
    ]
  },
  // Government
  {
    name: 'government',
    label: 'خدمات حكومية',
    icon: 'bx-buildings',
    emoji: '🏛️',
    color: '#8e8e93',
    subCategories: [
      { name: 'government_office', label: 'مصالح حكومية', icon: 'bx bx-buildings' },
      { name: 'police_station', label: 'قسم شرطة', icon: 'bx bx-shield' },
      { name: 'fire_station', label: 'مطافي', icon: 'bx bx-fridge' },
      { name: 'court', label: 'محاكم', icon: 'bx bx-briefcase' },
      { name: 'post_office', label: 'بريد', icon: 'bx bx-envelope' },
      { name: 'registry_office', label: 'شهر عقاري', icon: 'bx bx-file' },
    ]
  },
  // Finance
  {
    name: 'finance',
    label: 'خدمات مالية',
    icon: 'bx-money',
    emoji: '💰',
    color: '#30b0c7',
    subCategories: [
      { name: 'bank', label: 'بنوك', icon: 'fa-solid fa-building-columns' },
      { name: 'atm', label: 'ماكينات ATM', icon: 'bx bx-credit-card-front' },
      { name: 'exchange', label: 'صرافة', icon: 'bx bx-transfer' },
    ]
  },
    // Religion
  {
    name: 'religion',
    label: 'أماكن دينية',
    icon: 'bx-bookmark-heart',
    emoji: '🕌',
    color: '#a2845e',
    subCategories: [
      { name: 'mosque', label: 'مساجد', icon: 'fa-solid fa-kaaba' },
      { name: 'church', label: 'كنائس', icon: 'fa-solid fa-cross' },
    ]
  },
    // Education
  {
    name: 'education',
    label: 'تعليم',
    icon: 'bx-book-reader',
    emoji: '🎓',
    color: '#34c759',
    subCategories: [
      { name: 'school', label: 'مدارس', icon: 'bx bx-book' },
      { name: 'university', label: 'جامعات', icon: 'fa-solid fa-school' },
      { name: 'training_center', label: 'مراكز تعليم', icon: 'bx bx-chalkboard' },
      { name: 'language_center', label: 'مراكز لغات', icon: 'bx bx-conversation' },
      { name: 'nursery', label: 'حضانات', icon: 'bx bx-face' },
    ]
  },
  // Business
  {
    name: 'business',
    label: 'أعمال',
    icon: 'bx-briefcase-alt-2',
    emoji: '💼',
    color: '#1c1c1e',
    subCategories: [
      { name: 'company', label: 'شركات', icon: 'bx bx-briefcase' },
      { name: 'office', label: 'مكاتب', icon: 'bx bx-desktop' },
      { name: 'law_firm', label: 'مكاتب محاماة', icon: 'bx bx-notepad' },
      { name: 'accounting_office', label: 'مكاتب محاسبة', icon: 'bx bx-calculator' },
      { name: 'real_estate', label: 'شركات عقارات', icon: 'bx bx-home-circle' },
    ]
  },
  // Services
  {
    name: 'services',
    label: 'خدمات',
    icon: 'bx-cog',
    emoji: '🧹',
    color: '#ff9f0a',
    subCategories: [
      { name: 'laundry', label: 'مغاسل', icon: 'bx bx-sun' },
      { name: 'barbershop', label: 'صالونات حلاقة', icon: 'bx bx-cut' },
      { name: 'beauty_salon', label: 'بيوتي سنتر', icon: 'bx bx-spa' },
      { name: 'locksmith', label: 'مفاتيح', icon: 'bx bx-key' },
      { name: 'plumber', label: 'سباك', icon: 'bx bx-wrench' },
      { name: 'electrician', label: 'كهربائي', icon: 'bx bx-plug' },
      { name: 'ac_service', label: 'تكييف', icon: 'bx bx-wind' },
      { name: 'shipping', label: 'شركات شحن', icon: 'bx bx-package' },
      { name: 'moving_service', label: 'نقل أثاث', icon: 'bx bx-home-circle' },
    ]
  },
  // Public Places
  {
    name: 'public_places',
    label: 'أماكن عامة',
    icon: 'bx-buildings',
    emoji: '🌳',
    color: '#30b0c7',
    subCategories: [
      { name: 'park', label: 'حدائق', icon: 'fa-solid fa-tree' },
      { name: 'beach', label: 'شواطئ', icon: 'bx bx-sun' },
      { name: 'nature_reserve', label: 'محميات', icon: 'bx bx-landscape' },
      { name: 'square', label: 'ميادين', icon: 'bx bx-map' },
      { name: 'bus_station', label: 'مواقف مواصلات', icon: 'bx bx-bus' },
      { name: 'metro_station', label: 'محطات مترو', icon: 'bx bx-train' },
      { name: 'train_station', label: 'محطات قطار', icon: 'bx bx-train' },
      { name: 'airport', label: 'مطارات', icon: 'fa-solid fa-plane-departure' },
    ]
  }
];

// Flat categories derived from CATEGORIES_STRUCTURE to maintain compatibility
export const DEFAULT_CATEGORIES: CategoryItem[] = CATEGORIES_STRUCTURE.reduce((acc, main) => {
  main.subCategories.forEach(sub => {
    acc.push({
      name: sub.name,
      label: sub.label,
      icon: sub.icon,
      color: main.color
    });
  });
  return acc;
}, [] as CategoryItem[]);

export interface Branch {
  id: string;
  place_id: string;
  name: string;
  governorate?: string;
  city?: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  phones: string[];
  googleMapsUrl: string;
  workingHours: string;
  media?: string[];
  isMain: boolean;
  website_url?: string;
  features?: string[];
  services?: string[];
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  subCategories?: string[];
  place_type?: string;
  place_type_icon?: string;
  governorate?: string;
  city?: string;
  briefLocation?: string;
  shortDescription?: string;
  fullAddress: string;
  phones: string[];
  googleMapsUrl: string;
  images: string[];
  menuImages?: string[];
  media?: string[];
  workingHours?: string;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  branches?: Branch[];
  website_url?: string;
  features?: string[];
  services?: string[];
}

export interface FeatureItem {
  key: string;
  label: string;
  icon: string;
}

export const FEATURES_LIST: FeatureItem[] = [
  { key: "vegetarian_options", label: "خيارات نباتية متوفرة", icon: "🥗" },
  { key: "suitable_for_groups", label: "مناسب للمجموعات والعائلات", icon: "👥" },
  { key: "accepts_credit_cards", label: "يقبل الدفع بالبطاقات الائتمانية", icon: "💳" },
  { key: "free_wifi", label: "شبكة واي فاي مجانية", icon: "📶" },
  { key: "comfortable_facilities", label: "مرافق مريحة للزوار", icon: "✔️" },
  { key: "wheelchair_accessible", label: "مداخل سهلة للكراسي المتحركة", icon: "♿" },
  { key: "suitable_for_all_ages", label: "مناسب لجميع الأعمار", icon: "👨‍👩‍👧‍👦" },
  { key: "quiet_place", label: "أماكن هادئة", icon: "🤫" },
  { key: "kids_friendly", label: "أماكن مخصصة للأطفال", icon: "🧸" },
  { key: "family_friendly", label: "أماكن عائلية وكابلز", icon: "💑" },
];

export const initialPlaces: Place[] = [
  {
    id: "1",
    name: "مطعم البرنس - إمبابة",
    category: "food_drinks",
    categoryLabel: "أكل ومشروبات",
    subCategories: ["restaurant"],
    briefLocation: "إمبابة / الجيزة",
    fullAddress: "شارع طلعت حرب، إمبابة، الجيزة",
    phones: ["19123", "0233114455", "01099998877"],
    googleMapsUrl: "https://maps.app.goo.gl/r6aX7LgV79M36m4u5",
    images: ["/1.jpg", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"],
    menuImages: ["https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80"],
    workingHours: "12:00 م - 04:00 ص",
    rating: 4.6,
    description: "من أشهر مطاعم المأكولات الشرقية واللحوم وطواجن الكوارع والملوخية في مصر.",
    latitude: 30.0766, longitude: 31.2137,
    features: ["suitable_for_groups", "family_friendly"]
  },
  {
    id: "2",
    name: "كافيه سيلانترو - مصر الجديدة",
    category: "food_drinks",
    categoryLabel: "أكل ومشروبات",
    subCategories: ["cafe"],
    briefLocation: "مصر الجديدة / القاهرة",
    fullAddress: "15 شارع بغداد، الكوربة، مصر الجديدة، القاهرة",
    phones: ["16112", "01223456789"],
    googleMapsUrl: "https://maps.app.goo.gl/9yB7D5JvH7eF6L8a9",
    images: ["/2.jpg", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"],
    menuImages: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"],
    workingHours: "08:00 ص - 12:00 ص",
    rating: 4.3,
    description: "كافيه هادئ ومميز في منطقة الكوربة، يشتهر بأجود القهوة والمخبوزات الطازجة.",
    latitude: 30.0911, longitude: 31.3256,
    features: ["free_wifi", "quiet_place"]
  },
  {
    id: "3",
    name: "صيدليات العزبي - ألف مسكن",
    category: "health",
    categoryLabel: "صحة",
    subCategories: ["pharmacy"],
    briefLocation: "ألف مسكن / جسر السويس",
    fullAddress: "ميدان ألف مسكن، بجوار محطة مترو ألف مسكن، القاهرة",
    phones: ["19600", "01001960000"],
    googleMapsUrl: "https://maps.app.goo.gl/6pM8zXvH7eF6K9a1",
    images: ["https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80"],
    workingHours: "مفتوح 24 ساعة",
    rating: 4.5,
    description: "فرع صيدلية العزبي في ألف مسكن، يوفر جميع الأدوية مع خدمة التوصيل للمنازل.",
    latitude: 30.1171, longitude: 31.3418,
    features: ["comfortable_facilities"]
  },
  {
    id: "4",
    name: "مستشفى كليوباترا - هليوبوليس",
    category: "health",
    categoryLabel: "صحة",
    subCategories: ["hospital"],
    briefLocation: "مصر الجديدة / القاهرة",
    fullAddress: "39 شارع كليوباترا، صلاح سالم، مصر الجديدة، القاهرة",
    phones: ["19595", "0224178300"],
    googleMapsUrl: "https://maps.app.goo.gl/3yR8D5JvH7eF6L8a9",
    images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80"],
    workingHours: "مفتوح الطوارئ 24 ساعة",
    rating: 4.1,
    description: "من أعرق المستشفيات الخاصة بمصر الجديدة، تضم جميع التخصصات الطبية.",
    latitude: 30.0898, longitude: 31.3292,
    features: ["wheelchair_accessible"]
  },
  {
    id: "5",
    name: "حديقة الأزهر - صلاح سالم",
    category: "public_places",
    categoryLabel: "أماكن عامة",
    subCategories: ["park"],
    briefLocation: "الدراسة / صلاح سالم",
    fullAddress: "شارع صلاح سالم، الدراسة، القاهرة",
    phones: ["0225103868", "0225107378"],
    googleMapsUrl: "https://maps.app.goo.gl/4yT8D5JvH7eF6M8z7",
    images: ["https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80"],
    workingHours: "09:00 ص - 10:00 م",
    rating: 4.7,
    description: "من أجمل حدائق القاهرة بمساحة شاسعة تطل على قلعة صلاح سالم.",
    latitude: 30.0407, longitude: 31.2647,
    features: ["suitable_for_all_ages", "kids_friendly", "family_friendly"]
  }
];

export const OLD_CATEGORY_TO_MAIN_MAP: Record<string, string> = {
  restaurant: 'food_drinks',
  cafe: 'food_drinks',
  garden: 'public_places',
  outings: 'public_places',
  medicalCenter: 'health',
  hospital: 'health',
  pharmacy: 'health',
  health_beauty: 'services',
  family: 'entertainment',
  quiet_places: 'public_places',
  kids: 'entertainment',
  amusement_aqua: 'entertainment',
  work: 'business',
  courses_study: 'education',
  hotel: 'tourism',
  cinema: 'entertainment',
  mall: 'shopping',
};

export function formatBoxIcon(iconStr: string): string {
  if (!iconStr) return "bx bx-tag";
  let trimmed = iconStr.trim().toLowerCase();
  
  // Remove multiple spaces
  trimmed = trimmed.replace(/\s+/g, ' ');

  // Auto-heal corrupted Font Awesome icons saved as Boxicons (e.g. "bx bx-fa-...")
  if (
    trimmed.startsWith("bx bx-fa-") || 
    trimmed.startsWith("bx bx-fa ") || 
    trimmed.startsWith("bx bx-fas ") || 
    trimmed.startsWith("bx bx-far ") || 
    trimmed.startsWith("bx bx-fab ")
  ) {
    trimmed = trimmed.substring(6);
  }
  if (
    trimmed.startsWith("bx-fa-") || 
    trimmed.startsWith("bx-fa ") || 
    trimmed.startsWith("bx-fas ") || 
    trimmed.startsWith("bx-far ") || 
    trimmed.startsWith("bx-fab ")
  ) {
    trimmed = trimmed.substring(3);
  }
  
  // If it's a Font Awesome icon (starts with fa-, fa, fas, far, fab)
  if (
    trimmed.startsWith("fa-") || 
    trimmed.startsWith("fa ") || 
    trimmed.startsWith("fas ") || 
    trimmed.startsWith("far ") || 
    trimmed.startsWith("fab ")
  ) {
    return trimmed;
  }
  
  // If it already has "bx bx-something", return it
  if (trimmed.startsWith("bx bx-")) {
    return trimmed;
  }
  
  // If it's just "bx-something"
  if (trimmed.startsWith("bx-")) {
    return `bx ${trimmed}`;
  }
  
  // If they wrote "bx something" without hyphen
  if (trimmed.startsWith("bx ")) {
    const iconName = trimmed.substring(3);
    return `bx bx-${iconName}`;
  }
  
  // If they just wrote the name of the icon, e.g. "utensils"
  return `bx bx-${trimmed}`;
}


