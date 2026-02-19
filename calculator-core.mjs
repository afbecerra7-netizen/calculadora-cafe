export const WATER_PER_CUP = {
  aeropress: 100,
  chemex: 165,
  v60: 175,
  frenchpress: 250,
  coldbrew: 160
};

export const DEFAULT_BASE_RATIO = {
  aeropress: 15,
  chemex: 16,
  v60: 16,
  frenchpress: 14,
  coldbrew: 8
};

export const SUGGESTED_RATIO_RANGE = {
  aeropress: [13, 17],
  chemex: [15, 17],
  v60: [15, 17],
  frenchpress: [12, 15],
  coldbrew: [6, 10]
};

export function roundTo(val, decimals = 0) {
  const p = Math.pow(10, decimals);
  return Math.round(val * p) / p;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function computeAdjustedRatio(baseRatio, strengthMultiplier) {
  return clamp(baseRatio / strengthMultiplier, 6, 25);
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
