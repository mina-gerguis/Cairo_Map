import { HighwayItem, LiveRoadWeather, RoadNewsItem } from "./types";

/**
 * Filter highways based on search query, type, and governorate
 */
export function filterHighways(
  roads: HighwayItem[],
  query: string,
  typeFilter: string,
  governorateFilter: string
): HighwayItem[] {
  const q = query.trim().toLowerCase();

  return roads.filter((road) => {
    // 1. Text Search
    const matchesQuery =
      !q ||
      road.name.toLowerCase().includes(q) ||
      (road.code && road.code.toLowerCase().includes(q)) ||
      road.startPoint.toLowerCase().includes(q) ||
      road.endPoint.toLowerCase().includes(q) ||
      (road.description && road.description.toLowerCase().includes(q)) ||
      road.governorates.some((g) => g.toLowerCase().includes(q));

    // 2. Road Type Filter
    const matchesType = typeFilter === "all" || road.type === typeFilter;

    // 3. Governorate Filter
    const matchesGov =
      !governorateFilter ||
      governorateFilter === "all" ||
      road.governorates.includes(governorateFilter);

    return matchesQuery && matchesType && matchesGov;
  });
}

/**
 * Calculate estimated trip duration and fuel cost
 */
export function calculateTripMetrics(
  distanceKm: number,
  speedKmH: number = 100,
  fuelEconomyLPer100Km: number = 8.5,
  fuelPricePerLiter: number = 15 // EGP approximate 92/95 octane
) {
  if (distanceKm <= 0 || speedKmH <= 0) {
    return {
      hours: 0,
      minutes: 0,
      formattedTime: "0 دقيقة",
      litersNeeded: 0,
      estimatedCostEgp: 0,
    };
  }

  const totalHours = distanceKm / speedKmH;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  let formattedTime = "";
  if (hours > 0 && minutes > 0) {
    formattedTime = `${hours} ساعة و ${minutes} دقيقة`;
  } else if (hours > 0) {
    formattedTime = `${hours} ساعة`;
  } else {
    formattedTime = `${minutes} دقيقة`;
  }

  const litersNeeded = Number(((distanceKm * fuelEconomyLPer100Km) / 100).toFixed(1));
  const estimatedCostEgp = Math.round(litersNeeded * fuelPricePerLiter);

  return {
    hours,
    minutes,
    formattedTime,
    litersNeeded,
    estimatedCostEgp,
  };
}

/**
 * Map WMO weather code to icon, text, and commute warnings
 */
export function interpretWeatherCode(
  code: number,
  temp: number,
  windSpeed: number
): {
  conditionText: string;
  conditionIcon: "sun" | "cloud" | "rain" | "fog" | "wind" | "cold";
  safetyTip: string;
  hasWarning: boolean;
  warningText?: string;
} {
  // Fog / Mist
  if (code === 45 || code === 48) {
    return {
      conditionText: "شبورة مائية كثيفة",
      conditionIcon: "fog",
      safetyTip: "انخفاض ملحوظ في مدى الرؤية الأفقية. يُرجى تشغيل مصابيح الضباب وخفض السرعة إلى النصف ومضاعفة مسافة الأمان.",
      hasWarning: true,
      warningText: "تحذير شبورة: انعدام الرؤية في بعض القطاعات - توخ الحذر الشديد.",
    };
  }

  // Rain / Thunderstorm
  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  ) {
    return {
      conditionText: code >= 95 ? "عواصف رعدية وأمطار" : "أمطار متفرقة",
      conditionIcon: "rain",
      safetyTip: "الأرض زلقة وفرصة للانزلاق المائي (Aquaplaning). تجنب الفرملة المفاجئة والسرعات العالية.",
      hasWarning: true,
      warningText: "تحذير أمطار: خطر انزلاق الإطارات - التزم بالحارة الوسطى.",
    };
  }

  // High Wind
  if (windSpeed > 38) {
    return {
      conditionText: "رياح شديدة ومثيرة للرمال",
      conditionIcon: "wind",
      safetyTip: "رياح جانبية قوية تؤثر على اتزان السيارات المرتفعة والنقل. احكم قبضة عجلة القيادة وتجنب التجاوز السريع.",
      hasWarning: true,
      warningText: "تحذير رياح: خطر اضطراب المسار للمركبات الخفيفة والبيك أب.",
    };
  }

  // Extreme Heat
  if (temp >= 38) {
    return {
      conditionText: "شديد الحرارة وشمس ساطعة",
      conditionIcon: "sun",
      safetyTip: "ارتفاع درجات الحرارة يرفع ضغط الإطارات وحرارة المحرك. تأكد من مياه التبريد وضغط الإطارات قبل الانطلاق.",
      hasWarning: false,
    };
  }

  // Mild / Sunny
  if (temp >= 22) {
    return {
      conditionText: code <= 2 ? "مشمس ومعتدل" : "غائم جزئياً ولطيف",
      conditionIcon: code <= 2 ? "sun" : "cloud",
      safetyTip: "الرؤية ممتازة وحالة الطقس ملائمة تماماً للقيادة على السرعات المقررة.",
      hasWarning: false,
    };
  }

  // Cool / Cold
  return {
    conditionText: "مائل للبرودة",
    conditionIcon: "cold",
    safetyTip: "الطقس بارد، حافظ على نظافة الزجاج من التكثف الداخلي بتشغيل التهوية أو مزيل الضباب.",
    hasWarning: false,
  };
}

/**
 * Format date in friendly Arabic relative string
 */
export function formatNewsDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "مؤخراً";

    const now = new Date();
    const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return "منذ لحظات";
    if (diffHours === 1) return "منذ ساعة";
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffHours < 48) return "أمس";
    return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  } catch {
    return "مؤخراً";
  }
}
