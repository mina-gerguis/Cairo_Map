import { MonorailStation, MonorailRouteResult } from "./types";
import { MONORAIL_LINES_CONFIG, MONORAIL_STATION_DETAILS } from "./constants";

/**
 * Normalizes Arabic text for flexible searching (e.g. removing hamzas, tah marbuta, etc.)
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "");
}

/**
 * Calculates distance in kilometers between two GPS coordinates using the Haversine formula
 */
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper to calculate Monorail ticket fare based on station count
 */
export function getMonorailFare(count: number): {
  price: number;
  discountPrice: number;
  zone: string;
} {
  if (count <= 5)
    return { price: 20, discountPrice: 10, zone: "منطقة واحدة (حتى 5 محطات)" };
  if (count <= 10)
    return { price: 40, discountPrice: 20, zone: "منطقتان (من 6 إلى 10 محطات)" };
  if (count <= 15)
    return { price: 55, discountPrice: 27.5, zone: "ثلاث مناطق (من 11 إلى 15 محطة)" };
  return { price: 80, discountPrice: 40, zone: "أربع مناطق (أكثر من 15 محطة)" };
}

/**
 * Calculates complete route details between two Monorail stations
 */
export function calculateMonorailRoute(
  selectedFrom: string | null,
  selectedTo: string | null,
  stations: MonorailStation[]
): MonorailRouteResult | null {
  if (!selectedFrom || !selectedTo || selectedFrom === selectedTo) return null;

  const fromObj = stations.find((s) => s.name === selectedFrom);
  const toObj = stations.find((s) => s.name === selectedTo);

  if (!fromObj || !toObj) return null;

  // Case 1: Same Line
  if (fromObj.line_type === toObj.line_type) {
    const lineStations = stations
      .filter((s) => s.line_type === fromObj.line_type)
      .sort((a, b) => a.station_order - b.station_order);

    const fromIndex = lineStations.findIndex((s) => s.name === selectedFrom);
    const toIndex = lineStations.findIndex((s) => s.name === selectedTo);

    if (fromIndex === -1 || toIndex === -1) return null;

    const count = Math.abs(fromObj.station_order - toObj.station_order);
    const min = Math.min(fromIndex, toIndex);
    const max = Math.max(fromIndex, toIndex);
    const path = lineStations.slice(min, max + 1).map((s) => s.name);
    const pathOrdered = fromIndex <= toIndex ? path : [...path].reverse();

    const fare = getMonorailFare(count);
    const fromDetails = MONORAIL_STATION_DETAILS[selectedFrom];
    const toDetails = MONORAIL_STATION_DETAILS[selectedTo];
    const time =
      fromDetails && toDetails
        ? Math.abs(fromDetails.timeFromStart - toDetails.timeFromStart)
        : count * 2.5;

    const lineConfig = MONORAIL_LINES_CONFIG.find((l) => l.id === fromObj.line_type);

    return {
      sameLine: true,
      count,
      price: fare.price,
      discountPrice: fare.discountPrice,
      zoneName: fare.zone,
      time: Math.max(2, Math.round(time)),
      stations: pathOrdered,
      lineType: fromObj.line_type,
      lineName: lineConfig?.name || "",
      lineColor: lineConfig?.color || "#3b82f6",
      description: `رحلة مباشرة على ${lineConfig?.name}، تمر عبر ${count} محطات في زمن تقديري حوالي ${Math.max(
        2,
        Math.round(time)
      )} دقيقة.`,
    };
  }

  // Case 2: Multi-leg transfer between East and West Lines via Metro Line 3
  const fromConnector = fromObj.line_type === "east" ? "الاستاد" : "وادي النيل";
  const toConnector = toObj.line_type === "east" ? "الاستاد" : "وادي النيل";

  // Leg 1: From Station -> FromConnector
  const lineStationsFrom = stations
    .filter((s) => s.line_type === fromObj.line_type)
    .sort((a, b) => a.station_order - b.station_order);
  const fromIndex = lineStationsFrom.findIndex((s) => s.name === selectedFrom);
  const fromConnIndex = lineStationsFrom.findIndex((s) => s.name === fromConnector);
  const leg1Count = Math.abs(fromIndex - fromConnIndex);
  const min1 = Math.min(fromIndex, fromConnIndex);
  const max1 = Math.max(fromIndex, fromConnIndex);
  const path1 = lineStationsFrom.slice(min1, max1 + 1).map((s) => s.name);
  const path1Ordered = fromIndex <= fromConnIndex ? path1 : [...path1].reverse();
  const leg1Fare = getMonorailFare(leg1Count);
  const fromDetails = MONORAIL_STATION_DETAILS[selectedFrom];
  const fromConnDetails = MONORAIL_STATION_DETAILS[fromConnector];
  const leg1Time =
    fromDetails && fromConnDetails
      ? Math.abs(fromDetails.timeFromStart - fromConnDetails.timeFromStart)
      : leg1Count * 2.5;

  // Leg 2: Metro Line 3 Transfer (الاستاد ⇆ وادي النيل)
  const metroPrice = 12;
  const metroTime = 25; // Approx 25 mins

  // Leg 3: ToConnector -> To Station
  const lineStationsTo = stations
    .filter((s) => s.line_type === toObj.line_type)
    .sort((a, b) => a.station_order - b.station_order);
  const toConnIndex = lineStationsTo.findIndex((s) => s.name === toConnector);
  const toIndex = lineStationsTo.findIndex((s) => s.name === selectedTo);
  const leg3Count = Math.abs(toConnIndex - toIndex);
  const min3 = Math.min(toConnIndex, toIndex);
  const max3 = Math.max(toConnIndex, toIndex);
  const path3 = lineStationsTo.slice(min3, max3 + 1).map((s) => s.name);
  const path3Ordered = toConnIndex <= toIndex ? path3 : [...path3].reverse();
  const leg3Fare = getMonorailFare(leg3Count);
  const toConnDetails = MONORAIL_STATION_DETAILS[toConnector];
  const toDetails = MONORAIL_STATION_DETAILS[selectedTo];
  const leg3Time =
    toConnDetails && toDetails
      ? Math.abs(toConnDetails.timeFromStart - toDetails.timeFromStart)
      : leg3Count * 2.5;

  const totalStationsCount = leg1Count + leg3Count;
  const totalPrice = leg1Fare.price + metroPrice + leg3Fare.price;
  const totalDiscount = leg1Fare.discountPrice + metroPrice + leg3Fare.discountPrice;
  const totalTime = Math.round(leg1Time + metroTime + leg3Time);

  const fromLineConfig = MONORAIL_LINES_CONFIG.find((l) => l.id === fromObj.line_type);
  const toLineConfig = MONORAIL_LINES_CONFIG.find((l) => l.id === toObj.line_type);

  return {
    sameLine: false,
    count: totalStationsCount,
    price: totalPrice,
    discountPrice: totalDiscount,
    time: totalTime,
    leg1: {
      from: selectedFrom,
      to: fromConnector,
      count: leg1Count,
      price: leg1Fare.price,
      discountPrice: leg1Fare.discountPrice,
      time: Math.round(leg1Time),
      stations: path1Ordered,
      lineType: fromObj.line_type,
      lineName: fromLineConfig?.name || "",
      lineColor: fromLineConfig?.color || "#3b82f6",
    },
    leg2: {
      from: fromConnector,
      to: toConnector,
      price: metroPrice,
      time: metroTime,
      description: `التبديل عبر الخط الثالث لمترو الأنفاق من محطة [${fromConnector}] إلى محطة [${toConnector}].`,
    },
    leg3: {
      from: toConnector,
      to: selectedTo,
      count: leg3Count,
      price: leg3Fare.price,
      discountPrice: leg3Fare.discountPrice,
      time: Math.round(leg3Time),
      stations: path3Ordered,
      lineType: toObj.line_type,
      lineName: toLineConfig?.name || "",
      lineColor: toLineConfig?.color || "#10b981",
    },
    description: `رحلة تبادلية تربط ${fromLineConfig?.shortName} بـ ${toLineConfig?.shortName} عبر الخط الثالث للمترو.`,
  };
}
