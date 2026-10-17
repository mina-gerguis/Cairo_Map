import { LrtRouteResult } from "./types";

/**
 * Normalizes Arabic text for flexible matching and searching
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, ""); // remove kashida
}

/**
 * Calculate official LRT ticket price based on station count
 */
export function getLrtFare(count: number): number {
  if (count <= 3) return 10;
  if (count <= 7) return 15;
  if (count <= 12) return 20;
  return 25;
}

/**
 * Calculates complete route details between two LRT stations
 */
export function calculateLrtRoute(
  from: string | null,
  to: string | null,
  trunkStations: string[],
  capitalStations: string[],
  ramadanStations: string[]
): LrtRouteResult | null {
  if (!from || !to) return null;
  if (from === to) {
    return { stations: [from], count: 1, price: 10, estimatedTime: 0 };
  }

  const getPath = (
    station: string
  ): { trunkIdx: number; branch: "capital" | "ramadan" | null; branchIdx: number } => {
    const trunkIdx = trunkStations.indexOf(station);
    if (trunkIdx !== -1) {
      return { trunkIdx, branch: null, branchIdx: -1 };
    }
    const capIdx = capitalStations.indexOf(station);
    if (capIdx !== -1) {
      return { trunkIdx: trunkStations.length - 1, branch: "capital", branchIdx: capIdx };
    }
    const ramIdx = ramadanStations.indexOf(station);
    if (ramIdx !== -1) {
      return { trunkIdx: trunkStations.length - 1, branch: "ramadan", branchIdx: ramIdx };
    }
    return { trunkIdx: 0, branch: null, branchIdx: -1 };
  };

  const pFrom = getPath(from);
  const pTo = getPath(to);

  let stationsPath: string[] = [];

  // Case 1: Both on the trunk
  if (!pFrom.branch && !pTo.branch) {
    const min = Math.min(pFrom.trunkIdx, pTo.trunkIdx);
    const max = Math.max(pFrom.trunkIdx, pTo.trunkIdx);
    stationsPath = trunkStations.slice(min, max + 1);
    if (pFrom.trunkIdx > pTo.trunkIdx) stationsPath.reverse();
  }
  // Case 2: One on trunk, one on branch
  else if (!pFrom.branch && pTo.branch) {
    const branchList = pTo.branch === "capital" ? capitalStations : ramadanStations;
    const minTrunk = Math.min(pFrom.trunkIdx, trunkStations.length - 1);
    const maxTrunk = Math.max(pFrom.trunkIdx, trunkStations.length - 1);
    const trunkPart = trunkStations.slice(minTrunk, maxTrunk + 1);
    if (pFrom.trunkIdx > trunkStations.length - 1) trunkPart.reverse();

    const branchPart = branchList.slice(0, pTo.branchIdx + 1);
    stationsPath = [...trunkPart.slice(0, -1), "بدر", ...branchPart];
  } else if (pFrom.branch && !pTo.branch) {
    const branchList = pFrom.branch === "capital" ? capitalStations : ramadanStations;
    const branchPart = branchList.slice(0, pFrom.branchIdx + 1).reverse();
    const minTrunk = Math.min(pTo.trunkIdx, trunkStations.length - 1);
    const maxTrunk = Math.max(pTo.trunkIdx, trunkStations.length - 1);
    const trunkPart = trunkStations.slice(minTrunk, maxTrunk + 1);
    if (trunkStations.length - 1 > pTo.trunkIdx) trunkPart.reverse();

    stationsPath = [...branchPart, "بدر", ...trunkPart.slice(1)];
  }
  // Case 3: Both on branches
  else if (pFrom.branch && pTo.branch) {
    if (pFrom.branch === pTo.branch) {
      const branchList = pFrom.branch === "capital" ? capitalStations : ramadanStations;
      const min = Math.min(pFrom.branchIdx, pTo.branchIdx);
      const max = Math.max(pFrom.branchIdx, pTo.branchIdx);
      stationsPath = branchList.slice(min, max + 1);
      if (pFrom.branchIdx > pTo.branchIdx) stationsPath.reverse();
    } else {
      const branchListFrom =
        pFrom.branch === "capital" ? capitalStations : ramadanStations;
      const branchListTo = pTo.branch === "capital" ? capitalStations : ramadanStations;
      const partFrom = branchListFrom.slice(0, pFrom.branchIdx + 1).reverse();
      const partTo = branchListTo.slice(0, pTo.branchIdx + 1);
      stationsPath = [...partFrom, "بدر", ...partTo];
    }
  }

  stationsPath = stationsPath.filter((v, i, a) => a.indexOf(v) === i);

  const count = stationsPath.length;
  const price = getLrtFare(count);
  const estimatedTime = (count - 1) * 4;

  return { stations: stationsPath, count, price, estimatedTime };
}
