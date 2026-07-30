export type PlaceCategory = 
  | 'restaurant' 
  | 'cafe' 
  | 'garden' 
  | 'medicalCenter' 
  | 'health_beauty' 
  | 'family' 
  | 'quiet_places' 
  | 'kids' 
  | 'amusement_aqua' 
  | 'work' 
  | 'courses_study' 
  | 'hotel' 
  | 'cinema' 
  | 'mall' 
  | 'outings'
  | string;

export interface CategoryItem {
  id?: string;
  name: string;
  label: string;
  icon: string;
  color?: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'restaurant', label: 'مطاعم', icon: 'bx-restaurant', color: '#ff3b30' },
  { name: 'cafe', label: 'كافيهات', icon: 'bx-coffee', color: '#ff9500' },
  { name: 'garden', label: 'حدائق', icon: 'bx-tree', color: '#30b0c7' },
  { name: 'medicalCenter', label: 'مراكز طبية', icon: 'bx-plus-medical', color: '#007aff' },
  { name: 'health_beauty', label: 'الصحة والجمال', icon: 'bx-spa', color: '#ff2d55' },
  { name: 'family', label: 'اماكن عائلية', icon: 'bx-group', color: '#af52de' },
  { name: 'quiet_places', label: 'اماكن هادئه', icon: 'bx-moon', color: '#5856d6' },
  { name: 'kids', label: 'اماكن للاطفال', icon: 'bx-child', color: '#ff9f0a' },
  { name: 'amusement_aqua', label: 'ملاهي وأكوابارك', icon: 'bx-party', color: '#00c7be' },
  { name: 'work', label: 'مكاتب عمل', icon: 'bx-briefcase', color: '#a2845e' },
  { name: 'courses_study', label: 'كورسات ودراسة', icon: 'bx-book-open', color: '#34c759' },
  { name: 'hotel', label: 'فنادق', icon: 'bx-hotel', color: '#5856d6' },
  { name: 'cinema', label: 'سينما', icon: 'bx-film', color: '#ff3f8e' },
  { name: 'mall', label: 'مولات', icon: 'bx-shopping-bag', color: '#ff9500' },
  { name: 'outings', label: 'أماكن للخروجات', icon: 'bx-compass', color: '#30b0c7' },
];

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
];

export const initialPlaces: Place[] = [
  {
    id: "1",
    name: "مطعم البرنس - إمبابة",
    category: "restaurant",
    categoryLabel: "مطعم",
    briefLocation: "إمبابة / الجيزة",
    fullAddress: "شارع طلعت حرب، إمبابة، الجيزة",
    phones: ["19123", "0233114455", "01099998877"],
    googleMapsUrl: "https://maps.app.goo.gl/r6aX7LgV79M36m4u5",
    images: ["/1.jpg", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"],
    menuImages: ["https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80"],
    workingHours: "12:00 م - 04:00 ص",
    rating: 4.6,
    description: "من أشهر مطاعم المأكولات الشرقية واللحوم وطواجن الكوارع والملوخية في مصر.",
    latitude: 30.0766, longitude: 31.2137
  },
  {
    id: "2",
    name: "كافيه سيلانترو - مصر الجديدة",
    category: "cafe",
    categoryLabel: "كافيه",
    briefLocation: "مصر الجديدة / القاهرة",
    fullAddress: "15 شارع بغداد، الكوربة، مصر الجديدة، القاهرة",
    phones: ["16112", "01223456789"],
    googleMapsUrl: "https://maps.app.goo.gl/9yB7D5JvH7eF6L8a9",
    images: ["/2.jpg", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"],
    menuImages: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"],
    workingHours: "08:00 ص - 12:00 ص",
    rating: 4.3,
    description: "كافيه هادئ ومميز في منطقة الكوربة، يشتهر بأجود القهوة والمخبوزات الطازجة.",
    latitude: 30.0911, longitude: 31.3256
  },
  {
    id: "3",
    name: "صيدليات العزبي - ألف مسكن",
    category: "pharmacy",
    categoryLabel: "صيدلية",
    briefLocation: "ألف مسكن / جسر السويس",
    fullAddress: "ميدان ألف مسكن، بجوار محطة مترو ألف مسكن، القاهرة",
    phones: ["19600", "01001960000"],
    googleMapsUrl: "https://maps.app.goo.gl/6pM8zXvH7eF6K9a1",
    images: ["https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&auto=format&fit=crop&q=80"],
    workingHours: "مفتوح 24 ساعة",
    rating: 4.5,
    description: "فرع صيدلية العزبي في ألف مسكن، يوفر جميع الأدوية مع خدمة التوصيل للمنازل.",
    latitude: 30.1171, longitude: 31.3418
  },
  {
    id: "4",
    name: "مستشفى كليوباترا - هليوبوليس",
    category: "hospital",
    categoryLabel: "مستشفى",
    briefLocation: "مصر الجديدة / القاهرة",
    fullAddress: "39 شارع كليوباترا، صلاح سالم، مصر الجديدة، القاهرة",
    phones: ["19595", "0224178300"],
    googleMapsUrl: "https://maps.app.goo.gl/3yR8D5JvH7eF6L8a9",
    images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80"],
    workingHours: "مفتوح الطوارئ 24 ساعة",
    rating: 4.1,
    description: "من أعرق المستشفيات الخاصة بمصر الجديدة، تضم جميع التخصصات الطبية.",
    latitude: 30.0898, longitude: 31.3292
  },
  {
    id: "5",
    name: "حديقة الأزهر - صلاح سالم",
    category: "garden",
    categoryLabel: "حديقة",
    briefLocation: "الدراسة / صلاح سالم",
    fullAddress: "شارع صلاح سالم، الدراسة، القاهرة",
    phones: ["0225103868", "0225107378"],
    googleMapsUrl: "https://maps.app.goo.gl/4yT8D5JvH7eF6M8z7",
    images: ["https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80"],
    workingHours: "09:00 ص - 10:00 م",
    rating: 4.7,
    description: "من أجمل حدائق القاهرة بمساحة شاسعة تطل على قلعة صلاح سالم.",
    latitude: 30.0407, longitude: 31.2647
  },
  {
    id: "6",
    name: "شاورما أبو مازن السوري - مدينة نصر",
    category: "restaurant",
    categoryLabel: "مطعم",
    briefLocation: "مدينة نصر / القاهرة",
    fullAddress: "شارع عباس العقاد، مدينة نصر، القاهرة",
    phones: ["19675", "01123459876"],
    googleMapsUrl: "https://maps.app.goo.gl/7uG8D5JvH7eF6K8r9",
    images: ["https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80"],
    workingHours: "10:00 ص - 03:00 ص",
    rating: 4.4,
    description: "رائد الشاورما السورية في مصر، يقدم أشهى المشويات الشامية والفتة السورية.",
    latitude: 30.0583, longitude: 31.3400
  },
  {
    id: "7",
    name: "كافيه بينوس - المعادي",
    category: "cafe",
    categoryLabel: "كافيه",
    briefLocation: "دجلة / المعادي",
    fullAddress: "شارع 9، المعادي، القاهرة",
    phones: ["19119", "0223588990"],
    googleMapsUrl: "https://maps.app.goo.gl/1vM8zXvH7eF6L8z3",
    images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80"],
    workingHours: "07:30 ص - 01:00 ص",
    rating: 4.2,
    description: "كافيه مفضل لعشاق القهوة مع واي فاي مجاني وجلسات مريحة.",
    latitude: 29.9602, longitude: 31.2625
  },
  {
    id: "8",
    name: "مستشفى عين شمس التخصصي",
    category: "hospital",
    categoryLabel: "مستشفى",
    briefLocation: "العباسية / القاهرة",
    fullAddress: "شارع الخليفة المأمون، العباسية، القاهرة",
    phones: ["0224021200", "0224021500"],
    googleMapsUrl: "https://maps.app.goo.gl/9yB7D5JvH7eF6L8z1",
    images: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80"],
    workingHours: "مفتوح للطوارئ 24 ساعة",
    rating: 4.0,
    description: "صرح طبي تعليمي ضخم تابع لجامعة عين شمس بكافة التخصصات الدقيقة.",
    latitude: 30.0772, longitude: 31.2850
  },
  {
    id: "9",
    name: "فيلا بارك - الشيخ زايد",
    category: "family",
    categoryLabel: "عائلية",
    briefLocation: "الشيخ زايد / الجيزة",
    fullAddress: "طريق مصدر، الشيخ زايد، الجيزة",
    phones: ["0238513000", "01112345678"],
    googleMapsUrl: "https://maps.google.com",
    images: ["https://images.unsplash.com/photo-1596178060810-72f53ce9a65c?w=800&auto=format&fit=crop&q=80"],
    workingHours: "10:00 ص - 11:00 م",
    rating: 4.5,
    description: "وجهة عائلية مثالية تضم ألعاباً للأطفال، مطاعم متنوعة، وفضاءات خضراء واسعة للاسترخاء.",
    latitude: 30.0100, longitude: 30.9800
  },
  {
    id: "10",
    name: "دريم بارك - أكتوبر",
    category: "family",
    categoryLabel: "عائلية",
    briefLocation: "السادس من أكتوبر / الجيزة",
    fullAddress: "طريق الواحات، السادس من أكتوبر، الجيزة",
    phones: ["0238513333", "19009"],
    googleMapsUrl: "https://maps.google.com",
    images: ["https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80"],
    workingHours: "10:00 ص - 10:00 م",
    rating: 4.3,
    description: "أكبر مدينة ترفيهية في مصر للعائلات والأطفال مع ألعاب مائية وأرضية متنوعة.",
    latitude: 29.9500, longitude: 30.9000
  },
  {
    id: "11",
    name: "سيني ورلد - مول مصر",
    category: "entertainment",
    categoryLabel: "ترفيهية",
    briefLocation: "مول مصر / السادس من أكتوبر",
    fullAddress: "مول مصر، طريق الواحات، السادس من أكتوبر",
    phones: ["19600", "0238512222"],
    googleMapsUrl: "https://maps.google.com",
    images: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80"],
    workingHours: "10:00 ص - 12:00 ص",
    rating: 4.6,
    description: "مركز سينما وترفيه متكامل بأحدث قاعات العرض وتجارب الواقع الافتراضي.",
    latitude: 29.9600, longitude: 30.9100
  },
  {
    id: "12",
    name: "مركز الغردقة للترفيه",
    category: "entertainment",
    categoryLabel: "ترفيهية",
    briefLocation: "الغردقة / البحر الأحمر",
    fullAddress: "شارع الشيراتون، الغردقة، البحر الأحمر",
    phones: ["0653460000", "01001234560"],
    googleMapsUrl: "https://maps.google.com",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80"],
    workingHours: "09:00 ص - 11:00 م",
    rating: 4.8,
    description: "مركز ترفيهي شامل على شاطئ البحر الأحمر يضم ألعاباً مائية ومسرحاً ومطاعم.",
    latitude: 27.2574, longitude: 33.8129
  }
];
