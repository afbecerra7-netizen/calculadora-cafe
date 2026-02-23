export const WATER_PER_CUP = {
  aeropress: 240,
  chemex: 150,
  v60: 170,
  frenchpress: 180,
  coldbrew: 160,
  moka: 60,
};

export const DEFAULT_BASE_RATIO = {
  aeropress: 16,
  chemex: 16,
  v60: 17,
  frenchpress: 14,
  coldbrew: 6,
  moka: 10,
};

export const SUGGESTED_RATIO_RANGE = {
  aeropress: [15, 17],
  chemex: [15, 17],
  v60: [16, 18],
  frenchpress: [12, 15],
  coldbrew: [4, 8],
  moka: [8, 12],
};

export function roundTo(val, decimals = 0) {
  const p = Math.pow(10, decimals);
  return Math.round(val * p) / p;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function getRatioBounds(method = "") {
  if (method === "coldbrew") {
    return { min: 4, max: 25 };
  }
  return { min: 6, max: 25 };
}

export function computeAdjustedRatio(
  baseRatio,
  strengthMultiplier,
  minRatio = 6,
  maxRatio = 25,
) {
  return clamp(baseRatio / strengthMultiplier, minRatio, maxRatio);
}

export function computeWaterMl(method, cups) {
  return cups * WATER_PER_CUP[method];
}

export function computeCoffeeGrams(waterMl, ratio) {
  return waterMl / ratio;
}

export function mlToOz(ml) {
  return ml / 29.5735;
}
