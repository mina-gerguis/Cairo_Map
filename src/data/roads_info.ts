export interface HighwayTollGate {
  name: string;
  fee?: string;
  location?: string;
}

export interface HighwaySpeedLimits {
  privateCar: number; // ملاكي (كم/س)
  minibus: number;    // ميني باص (كم/س)
  microbus: number;   // ميكروباص (كم/س)
  pickup: number;     // ربع نقل (كم/س)
  bus: number;        // أتوبيس (كم/س)
  truck: number;      // نقل ثقيل وتريلا (كم/س)
}

export interface HighwayItem {
  id: string;
  name: string;
  code?: string;
  type: "حر" | "صحراوي" | "ساحلي" | "زراعي" | "دائري" | "محور";
  lengthKm: number;
  startPoint: string;
  endPoint: string;
  governorates: string[];
  speeds: HighwaySpeedLimits;
  lanesCount: number;
  tollGates?: HighwayTollGate[];
  gasStations?: string[];
  emergencyPhone?: string;
  lat: number;
  lng: number;
  status: "open" | "maintenance" | "fog_warning" | "detour";
  statusText?: string;
  description: string;
  radarInfo?: string;
  mapUrl?: string;
  isPopular?: boolean;
}

export type RoadNewsCategory =
  | "weather_fog"
  | "maintenance"
  | "detour"
  | "traffic"
  | "radar"
  | "general";

export type RoadNewsSeverity = "critical" | "warning" | "info";

export interface RoadNewsItem {
  id: string;
  title: string;
  summary: string;
  category: RoadNewsCategory;
  severity: RoadNewsSeverity;
  roadName?: string;
  source?: string;
  publishedAt: string;
  isActive: boolean;
}

export const DEFAULT_HIGHWAYS: HighwayItem[] = [
  {
    id: "h1",
    name: "طريق القاهرة - الإسكندرية الصحراوي",
    code: "H1",
    type: "حر",
    lengthKm: 220,
    startPoint: "ميدان الرماية / بوابة القاهرة (الكيلو 28)",
    endPoint: "بوابة الإسكندرية / محرم بك (الكيلو 220)",
    governorates: ["الجيزة", "البحيرة", "الإسكندرية", "مطروح"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 6,
    tollGates: [
      { name: "بوابة رسوم القاهرة (ك 28)", fee: "10 - 20 ج.م" },
      { name: "بوابة رسوم العامرية الإسكندرية", fee: "10 - 20 ج.م" },
    ],
    gasStations: ["وطنية ك 45", "تشيل أوت ك 80", "ماستر ك 105", "توتال إنرجيز ك 150", "شل ك 180"],
    emergencyPhone: "01221110000",
    lat: 30.4358,
    lng: 30.6318,
    status: "open",
    statusText: "حركة السير منتظمة وسيولة مرورية",
    description:
      "أهم شريان بري يربط العاصمة بالإسكندرية والساحل الشمالي. طريق حر عالي الجودة به مسارات للشاحنات مفصولة بالكامل، ومزود بمحطات خدمة متكاملة واستراحات على طول الطريق.",
    radarInfo:
      "مزود برادارات فرنسية حديثة ترصد السرعة اللحظية وحزام الأمان واستخدام الهاتف والانحراف المفاجئ، مع رادارات نقطية عند بوابات الرسوم ومحاور الدخول.",
    mapUrl: "https://maps.google.com/?q=Cairo+Alexandria+Desert+Road",
    isPopular: true,
  },
  {
    id: "h2",
    name: "الطريق الدائري حول القاهرة الكبرى",
    code: "R0",
    type: "دائري",
    lengthKm: 106,
    startPoint: "دائري متصل (القاهرة - الجيزة - القليوبية)",
    endPoint: "دائري متصل حول القاهرة الكبرى",
    governorates: ["القاهرة", "الجيزة", "القليوبية"],
    speeds: {
      privateCar: 90,
      minibus: 80,
      microbus: 80,
      pickup: 70,
      bus: 80,
      truck: 60,
    },
    lanesCount: 7,
    tollGates: [],
    gasStations: ["وطنية المنيب", "تشيل أوت التجمع", "مصر للبترول المرج", "شيل أوت الوراق"],
    emergencyPhone: "136",
    lat: 30.0131,
    lng: 31.2089,
    status: "open",
    statusText: "سيولة مرورية مع أعمال توسعة في بعض القطاعات",
    description:
      "الشريان المروري الرئيسي للعاصمة، يربط كافة أقاليم القاهرة الكبرى ومحاور النيل. تم توسعته ليصبح 7 إلى 8 حارات لكل اتجاه مع تخصيص مسار معزول للأتوبيس الترددي BRT.",
    radarInfo:
      "رادارات حديثة ثابتة ومتحركة بمسافات متقاربة على كافة قطاعات الدائري مع كاميرات مراقبة ذكية لكشف الانتظار الخاطئ وتجاوز السرعة المقررة 90 كم/س للملاكي.",
    mapUrl: "https://maps.google.com/?q=Cairo+Ring+Road",
    isPopular: true,
  },
  {
    id: "h3",
    name: "طريق القاهرة - السويس الصحراوي",
    code: "H3",
    type: "حر",
    lengthKm: 134,
    startPoint: "تقاطع الطريق الدائري / التجمع الأول (ألماظة)",
    endPoint: "مدخل مدينة السويس وبورتوفيق",
    governorates: ["القاهرة", "السويس"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 6,
    tollGates: [
      { name: "بوابة رسوم القاهرة (طريق السويس)", fee: "15 ج.م" },
      { name: "بوابة رسوم مدخل السويس", fee: "15 ج.م" },
    ],
    gasStations: ["تشيل أوت مدينتي", "وطنية الشروق", "إمارات مصر بدر", "موبيل السويس"],
    emergencyPhone: "01221110000",
    lat: 30.0892,
    lng: 31.9542,
    status: "open",
    statusText: "طريق مفتوح بالكامل وسيولة تامة",
    description:
      "طريق حر حديث ومطور بأعلى المواصفات العالمية يخدم العاصمة الإدارية الجديدة ومدينتي والشروق وبدر حتى خليج السويس والموانئ البحرية.",
    radarInfo:
      "رادارات ذكية متعددة المسارات ترصد السرعة حتى 120 كم/س للملاكي ومسارات النقل المعزولة على الجانبين وكاميرات قياس المسافات الآمنة.",
    mapUrl: "https://maps.google.com/?q=Cairo+Suez+Road",
    isPopular: true,
  },
  {
    id: "h4",
    name: "طريق القاهرة - العين السخنة",
    code: "H4",
    type: "حر",
    lengthKm: 120,
    startPoint: "تقاطع الدائري الأوسطي / القطامية",
    endPoint: "ميدان ميناء العين السخنة",
    governorates: ["القاهرة", "السويس", "البحر الأحمر"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 5,
    tollGates: [
      { name: "بوابة كارتة القطامية", fee: "15 ج.م" },
      { name: "بوابة كارتة السخنة", fee: "15 ج.م" },
    ],
    gasStations: ["تشيل أوت القطامية", "وطنية ك 50", "توتال ك 90", "شل السخنة"],
    emergencyPhone: "01221110000",
    lat: 29.7634,
    lng: 31.8492,
    status: "open",
    statusText: "حركة ممتازة وسيولة",
    description:
      "طريق سريع يربط القاهرة بساحل البحر الأحمر والمنطقة الاقتصادية لقناة السويس ومنتجعات السخنة، ومزود بحارات نقل ثقيل خرسانية لمنع الحوادث.",
    radarInfo:
      "رادارات حديثة على المنحنيات ومناطق التقاطعات مع محور 30 يونيو والدائري الإقليمي.",
    mapUrl: "https://maps.google.com/?q=Cairo+Ain+Sokhna+Road",
    isPopular: true,
  },
  {
    id: "h5",
    name: "طريق شبرا - بنها الحر",
    code: "H2",
    type: "حر",
    lengthKm: 40,
    startPoint: "ميدان المؤسسة / شبرا الخيمة",
    endPoint: "تقاطع الدائري الإقليمي / بنها",
    governorates: ["القليوبية"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 4,
    tollGates: [{ name: "محطة رسوم شبرا - بنها", fee: "15 ج.م" }],
    gasStations: ["وطنية شبرا", "تشيل أوت بنها"],
    emergencyPhone: "01221110000",
    lat: 30.2981,
    lng: 31.2185,
    status: "open",
    statusText: "مفتوح وسيولة تامة - 20 دقيقة للرحلة",
    description:
      "أول طريق زراعي حر في مصر بدون تقاطعات سطحية، يختصر زمن الرحلة من القاهرة إلى بنها والدلتا إلى 20 دقيقة فقط بدلاً من ساعتين.",
    radarInfo:
      "رادارات مراقبة سرعة صارمة 120 كم/س بدون إشارات مرورية وتغطية أمنية كاملة.",
    mapUrl: "https://maps.google.com/?q=Shubra+Banha+Free+Highway",
    isPopular: true,
  },
  {
    id: "h6",
    name: "طريق روض الفرج - الضبعة (الساحل الشمالي)",
    code: "H8",
    type: "حر",
    lengthKm: 360,
    startPoint: "محور روض الفرج / الدائري الإقليمي",
    endPoint: "الضبعة / طريق الساحل الدولي (مطروح)",
    governorates: ["الجيزة", "البحيرة", "مطروح"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 5,
    tollGates: [
      { name: "كارتة روض الفرج", fee: "20 ج.م" },
      { name: "كارتة الضبعة الساحل", fee: "20 ج.م" },
    ],
    gasStations: ["تشيل أوت ك 60", "وطنية ك 140", "ماستر ك 210", "إمارات مصر ك 290"],
    emergencyPhone: "01221110000",
    lat: 30.5632,
    lng: 29.8451,
    status: "open",
    statusText: "سيولة تامة وأمان قيادة عالي",
    description:
      "الطريق الأحدث والأسرع للوصول إلى الساحل الشمالي، مدينة العلمين الجديدة، وسيدي عبد الرحمن ومطروح متفادياً زحام الطريق القديم.",
    radarInfo:
      "رادارات ومحطات طاقة شمسية ومراقبة ذكية على مدار 24 ساعة ترصد السرعة اللحظية وحزام الأمان.",
    mapUrl: "https://maps.google.com/?q=Dabaa+Corridor+Highway",
    isPopular: true,
  },
  {
    id: "h7",
    name: "طريق الجلالة (القطامية - الزعفرانة)",
    code: "H7",
    type: "حر",
    lengthKm: 82,
    startPoint: "طريق القاهرة - السخنة",
    endPoint: "طريق الزعفرانة / الغردقة الساحلي",
    governorates: ["السويس", "البحر الأحمر"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 70,
    },
    lanesCount: 4,
    tollGates: [
      { name: "بوابة الجلالة الشمالية", fee: "10 ج.م" },
      { name: "بوابة الجلالة الجنوبية", fee: "10 ج.م" },
    ],
    gasStations: ["تشيل أوت هضبة الجلالة", "وطنية الزعفرانة"],
    emergencyPhone: "01221110000",
    lat: 29.4521,
    lng: 32.3912,
    status: "open",
    statusText: "مفتوح مع ضرورة الالتزام بالسرعة بالمنحنيات الجبلية",
    description:
      "طريق جبلي إعجازي يشق هضبة الجلالة بارتفاع 700 متر فوق سطح البحر، يخدم مدينة الجلالة والجامعة والمنتجع ويوفر بديلاً آمناً لطريق السخنة الساحلي القديم.",
    radarInfo:
      "رادارات ومحددات سرعة عند المنحدرات والمنعطفات الجبلية للحفاظ على الأمان والتوازن.",
    mapUrl: "https://maps.google.com/?q=Galala+Highway",
  },
  {
    id: "h8",
    name: "الطريق الدائري الإقليمي",
    code: "R2",
    type: "دائري",
    lengthKm: 400,
    startPoint: "دائري مغلق يحيط بـ 7 محافظات",
    endPoint: "يربط السويس، الإسماعيلية، بلبيس، بنها، المنوفية، السادات، أكتوبر، الفيوم، بني سويف",
    governorates: ["القاهرة", "الجيزة", "القليوبية", "الشرقية", "المنوفية", "الفيوم", "بني سويف"],
    speeds: {
      privateCar: 100,
      minibus: 90,
      microbus: 90,
      pickup: 80,
      bus: 90,
      truck: 70,
    },
    lanesCount: 4,
    tollGates: [{ name: "بوابات محاور التقاطع", fee: "10 - 20 ج.م" }],
    gasStations: ["وطنية تقاطع بنها", "تشيل أوت تقاطع السويس", "شل الإقليمي الفيوم"],
    emergencyPhone: "01221110000",
    lat: 30.1245,
    lng: 30.9854,
    status: "open",
    statusText: "مفتوح لحركة نقل الركاب والبضائع",
    description:
      "أطول طريق دائري في أفريقيا والشرق الأوسط، مصمم لنقل حركة سيارات النقل الثقيل والبضائع بعيداً عن شوارع العاصمة والمدن الكبرى.",
    radarInfo:
      "رادارات حديثة ترصد السرعة وحظر دخول سيارات النقل الثقيل إلى داخل القاهرة في الأوقات غير المصرح بها.",
    mapUrl: "https://maps.google.com/?q=Regional+Ring+Road+Egypt",
  },
  {
    id: "h9",
    name: "الطريق الدائري الأوسطي",
    code: "R1",
    type: "دائري",
    lengthKm: 156,
    startPoint: "طريق بلبيس / العبور الجديدة",
    endPoint: "طريق القاهرة - الفيوم الصحراوي ومحور الضبعة",
    governorates: ["القاهرة", "الجيزة", "القليوبية", "الشرقية"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 70,
    },
    lanesCount: 8,
    tollGates: [{ name: "كارتة الأوسطي (تقاطع السخنة)", fee: "10 ج.م" }],
    gasStations: ["تشيل أوت الأوسطي التجمع", "وطنية أكتوبر", "مصر للبترول الشروق"],
    emergencyPhone: "01221110000",
    lat: 29.8921,
    lng: 31.4215,
    status: "open",
    statusText: "سيولة مرورية وتصميم عريض (8 حارات)",
    description:
      "أعرض طريق دائري في الشرق الأوسط (يصل إلى 16 حارة في الاتجاهين)، يربط المدن الجديدة ببعضها (الشروق، العاصمة الإدارية، التجمع، حلوان، 6 أكتوبر، الشيخ زايد).",
    radarInfo:
      "مجهز برادارات حديثة مع حارات منفصلة للنقل الثقيل وأنفاق متعددة.",
    mapUrl: "https://maps.google.com/?q=Middle+Ring+Road+Cairo",
  },
  {
    id: "h10",
    name: "طريق الصعيد الصحراوي الشرقي (طريق الجيش)",
    code: "H5",
    type: "حر",
    lengthKm: 450,
    startPoint: "حلوان / كارتة الكريمات",
    endPoint: "أسيوط / سوهاج / الأقصر / أسوان",
    governorates: ["القاهرة", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 5,
    tollGates: [
      { name: "كارتة الكريمات", fee: "15 ج.م" },
      { name: "كارتة بني سويف", fee: "15 ج.م" },
      { name: "كارتة أسيوط", fee: "15 ج.م" },
    ],
    gasStations: ["وطنية الكريمات", "تشيل أوت المنيا", "شل أسيوط", "النيل للبترول سوهاج"],
    emergencyPhone: "01221110000",
    lat: 28.1123,
    lng: 30.7421,
    status: "open",
    statusText: "مفتوح بالكامل مع وجود طريق شاحنات خرساني منفصل",
    description:
      "الشريان الرئيسي الذي يربط محافظات الصعيد بالقاهرة، مزود بطريق شاحنات خرساني منفصل ومحطات إسعاف وإغاثة سريعة على طول الخط.",
    radarInfo:
      "رادارات على طول قطاعات المنيا وأسيوط وبني سويف لرصد السرعات وتأمين الرحلات الطويلة.",
    mapUrl: "https://maps.google.com/?q=Eastern+Desert+Highway+Upper+Egypt",
  },
  {
    id: "h11",
    name: "طريق الصعيد الصحراوي الغربي (طريق أسيوط الغربي)",
    code: "H9",
    type: "حر",
    lengthKm: 1150,
    startPoint: "ميدان الرماية / تقاطع طريق الفيوم",
    endPoint: "المنيا / أسيوط / توشكى / أرقين (الحدود السودانية)",
    governorates: ["الجيزة", "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "الوادي الجديد"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 6,
    tollGates: [
      { name: "كارتة دهشور / أكتوبر", fee: "15 ج.م" },
      { name: "كارتة غرب المنيا", fee: "15 ج.م" },
    ],
    gasStations: ["وطنية دهشور", "تشيل أوت غرب بني سويف", "مصر للبترول ملوي"],
    emergencyPhone: "01221110000",
    lat: 27.5218,
    lng: 30.4125,
    status: "open",
    statusText: "تم تطويره وتوسعته برصف خرساني متطور",
    description:
      "مشروع قومي عملاق يربط محافظات الصعيد بالوجه البحري وحتى أقصى جنوب مصر والحدود السودانية، مصمم بمواصفات الطرق الحرة العالمية ومسارات خرسانية للنقل الثقيل.",
    radarInfo: "رادارات حديثة لرصد السرعات الزائدة على طول الخط.",
    mapUrl: "https://maps.google.com/?q=Western+Desert+Highway+Egypt",
  },
  {
    id: "h12",
    name: "طريق القاهرة - الإسماعيلية الصحراوي",
    code: "H6",
    type: "حر",
    lengthKm: 110,
    startPoint: "سوق العبور / الهايكستب",
    endPoint: "مدخل مدينة الإسماعيلية وأنفاق القناة",
    governorates: ["القاهرة", "القليوبية", "الشرقية", "الإسماعيلية"],
    speeds: {
      privateCar: 120,
      minibus: 100,
      microbus: 100,
      pickup: 90,
      bus: 100,
      truck: 80,
    },
    lanesCount: 6,
    tollGates: [
      { name: "كارتة 10 رمضان", fee: "10 ج.م" },
      { name: "كارتة الإسماعيلية", fee: "10 ج.م" },
    ],
    gasStations: ["وطنية العاشر من رمضان", "تشيل أوت المركز الطبي", "توتال الإسماعيلية"],
    emergencyPhone: "01221110000",
    lat: 30.3412,
    lng: 31.7824,
    status: "open",
    statusText: "سيولة مرورية تامة",
    description:
      "طريق حيوي يخدم مدينة العاشر من رمضان والشروق والعبور ويربط العاصمة بمدن القناة وسيناء عبر أنفاق تحيا مصر والإسماعيلية.",
    radarInfo: "رادارات حديثة لكشف السرعة والانشغال بغير الطريق مع حارات مفصولة للنقل.",
    mapUrl: "https://maps.google.com/?q=Cairo+Ismailia+Desert+Road",
  },
  {
    id: "h13",
    name: "طريق القاهرة - الإسكندرية الزراعي",
    code: "A1",
    type: "زراعي",
    lengthKm: 215,
    startPoint: "شبرا الخيمة / المؤسسة",
    endPoint: "مدخل كفر الدوار والإسكندرية",
    governorates: ["القاهرة", "القليوبية", "المنوفية", "الغربية", "البحيرة", "الإسكندرية"],
    speeds: {
      privateCar: 90,
      minibus: 80,
      microbus: 80,
      pickup: 70,
      bus: 80,
      truck: 60,
    },
    lanesCount: 4,
    tollGates: [],
    gasStations: ["مصر للبترول طنطا", "التعاون دمنهور", "موبيل قها", "شل بركة السبع"],
    emergencyPhone: "136",
    lat: 30.7824,
    lng: 31.0021,
    status: "open",
    statusText: "يشهد كثافات مرورية متوسطة بأوقات الذروة",
    description:
      "الطريق الزراعي التاريخي الذي يربط مدن وقرى الدلتا الكبرى (بنها، قويسنا، بركة السبع، طنطا، كفر الزيات، إيتاي البارود، دمنهور، كفر الدوار). تم إنشاء كباري علوية لإلغاء التقاطعات السطحية.",
    radarInfo: "رادارات ثابتة على الكباري العلوية ومداخل المدن للحد من الحوادث وسرعة 90 للملاكي.",
    mapUrl: "https://maps.google.com/?q=Cairo+Alexandria+Agricultural+Road",
  },
  {
    id: "h14",
    name: "طريق الساحل الشمالي الدولي (الإسكندرية - مطروح - السلوم)",
    code: "C1",
    type: "ساحلي",
    lengthKm: 510,
    startPoint: "العامرية / الكيلو 21 العجمي",
    endPoint: "مرسى مطروح ومنفذ السلوم البري",
    governorates: ["الإسكندرية", "مطروح"],
    speeds: {
      privateCar: 100,
      minibus: 90,
      microbus: 90,
      pickup: 80,
      bus: 90,
      truck: 70,
    },
    lanesCount: 6,
    tollGates: [
      { name: "كارتة ك 21", fee: "10 ج.م" },
      { name: "كارتة العلمين", fee: "15 ج.م" },
      { name: "كارتة مطروح", fee: "15 ج.م" },
    ],
    gasStations: ["تشيل أوت مارينا", "وطنية العلمين الجديدة", "توتال سيدي عبد الرحمن", "شل رأس الحكمة"],
    emergencyPhone: "01221110000",
    lat: 30.9851,
    lng: 28.8924,
    status: "open",
    statusText: "تطوير شامل وفصل حارات الخدمة للقرى السياحية",
    description:
      "الطريق الساحلي الأهم على البحر المتوسط يخدم كافة القرى والمنتجعات السياحية من مارينا والعلمين ورأس الحكمة وسيدي حنيش حتى مرسى مطروح.",
    radarInfo: "رادارات حديثة ترصد السرعة وتجاوز الحارات المحددة ومسارات الخدمة.",
    mapUrl: "https://maps.google.com/?q=Alexandria+Marsa+Matrouh+Coastal+Road",
  },
  {
    id: "h15",
    name: "طريق الزعفرانة - الغردقة الساحلي",
    code: "C2",
    type: "ساحلي",
    lengthKm: 290,
    startPoint: "ميدان الزعفرانة / كمين الزعفرانة",
    endPoint: "مدخل مدينة الغردقة والجونة",
    governorates: ["السويس", "البحر الأحمر"],
    speeds: {
      privateCar: 110,
      minibus: 90,
      microbus: 90,
      pickup: 80,
      bus: 90,
      truck: 70,
    },
    lanesCount: 3,
    tollGates: [{ name: "كارتة مدخل الغردقة", fee: "10 ج.م" }],
    gasStations: ["وطنية رأس غارب", "تشيل أوت الجونة", "مصر للبترول الزعفرانة"],
    emergencyPhone: "01221110000",
    lat: 27.8421,
    lng: 33.2541,
    status: "open",
    statusText: "حركة سياحية منتظمة ومفتوح",
    description:
      "شريان السياحة الرئيسي لساحل البحر الأحمر يربط القاهرة ومدن القناة بالغردقة ورأس غارب والجونة وسهل حشيش ومكادي باي.",
    radarInfo: "رادارات على المنعطفات الساحلية ومناطق حقول الرياح برأس غارب.",
    mapUrl: "https://maps.google.com/?q=Zaafarana+Hurghada+Road",
  },
  {
    id: "h16",
    name: "محور 26 يوليو المطور والجديد",
    code: "M1",
    type: "محور",
    lengthKm: 30,
    startPoint: "ميدان لبنان / شارع السودان (المهندسين)",
    endPoint: "مدينة 6 أكتوبر والشيخ زايد",
    governorates: ["الجيزة"],
    speeds: {
      privateCar: 90,
      minibus: 80,
      microbus: 80,
      pickup: 70,
      bus: 80,
      truck: 60,
    },
    lanesCount: 6,
    tollGates: [],
    gasStations: ["وطنية محور 26 يوليو", "تشيل أوت زايد"],
    emergencyPhone: "136",
    lat: 30.0521,
    lng: 31.0824,
    status: "open",
    statusText: "سيولة مرورية عالية بعد إضافة المحور الموازي الجديد",
    description:
      "الرابط الرئيسي بين قلب الجيزة والمهندسين ومدينتي الشيخ زايد و6 أكتوبر. تم تطويره ومضاعفة طاقته الاستيعابية بإنشاء محور موازٍ معزول ينهي أزمات التكدس التاريخية.",
    radarInfo: "رادارات حديثة ترصد السرعة اللحظية وحزام الأمان والوقوف العشوائي للميكروباص.",
    mapUrl: "https://maps.google.com/?q=26th+July+Corridor",
    isPopular: true,
  },
];

export const DEFAULT_ROAD_NEWS: RoadNewsItem[] = [
  {
    id: "news-1",
    title: "تنبيه شبورة مائية كثيفة في ساعات الصباح الباكر",
    summary:
      "تهيب الإدارة العامة للمرور بقائدي المركبات توخي الحذر الشديد وخفض السرعات المقررة على طريق القاهرة - الإسكندرية الزراعي والصحراوي وطريق السويس ومحور 26 يوليو لوجود شبورة مائية كثيفة حتى انقشاعها.",
    category: "weather_fog",
    severity: "warning",
    roadName: "طريق القاهرة - الإسكندرية الصحراوي",
    source: "الهيئة العامة للأرصاد الجوية والإدارة العامة للمرور",
    publishedAt: "2026-10-03T05:30:00Z",
    isActive: true,
  },
  {
    id: "news-2",
    title: "سيولة مرورية تامة على طريق شبرا - بنها الحر",
    summary:
      "تشهد كافة قطاعات طريق شبرا - بنها الحر في الاتجاهين سيولة مرورية كاملة وانتظام حركة السفر دون أي عوائق أو تكدسات مع التزام السائقين بالسرعات المقررة 120 كم/س للملاكي.",
    category: "traffic",
    severity: "info",
    roadName: "طريق شبرا - بنها الحر",
    source: "غرفة عمليات المرور",
    publishedAt: "2026-10-03T08:00:00Z",
    isActive: true,
  },
  {
    id: "news-3",
    title: "أعمال صيانة وتطوير كوبري تقاطع الدائري مع الأوتوستراد",
    summary:
      "تجري أعمال رفع كفاءة الفواصل الإنشائية بكوبري تقاطع الطريق الدائري مع طريق الأوتوستراد بمنطقة البساتين مع نشر خدمات مرورية مكثفة لتسيير الحركة دون إغلاق الطريق.",
    category: "maintenance",
    severity: "warning",
    roadName: "الطريق الدائري حول القاهرة الكبرى",
    source: "الهيئة العامة للطرق والكباري",
    publishedAt: "2026-10-02T14:20:00Z",
    isActive: true,
  },
  {
    id: "news-4",
    title: "تشغيل رادارات ذكية جديدة ترصد المسافات الآمنة واستخدام الهاتف",
    summary:
      "بدء تشغيل منظومة كاميرات المراقبة والرادارات الذكية الحديثة بطريق القاهرة - السويس وطريق العين السخنة لرصد مخالفات الهاتف المحمول وحزام الأمان والسرعات المحددة للمركبات.",
    category: "radar",
    severity: "info",
    roadName: "طريق القاهرة - السويس الصحراوي",
    source: "الإدارة العامة للمرور",
    publishedAt: "2026-10-01T10:00:00Z",
    isActive: true,
  },
  {
    id: "news-5",
    title: "إجراء تحويلة مرورية مؤقتة على طريق الصعيد الصحراوي الشرقي",
    summary:
      "تحويلة مرورية لمسافة 5 كم بالقرب من بوابة الكريمات لتنفيذ أعمال الرصف الخرساني لمسارات النقل الثقيل، مع وضع العلامات الإرشادية والفسفورية اللازمة.",
    category: "detour",
    severity: "warning",
    roadName: "طريق الصعيد الصحراوي الشرقي (طريق الجيش)",
    source: "الهيئة العامة للطرق والكباري",
    publishedAt: "2026-09-30T11:45:00Z",
    isActive: true,
  },
];
