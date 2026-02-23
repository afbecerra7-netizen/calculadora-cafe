import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_BASE_RATIO,
  WATER_PER_CUP,
  computeAdjustedRatio,
  computeCoffeeGrams,
  computeWaterMl,
  getRatioBounds,
  mlToOz,
  roundTo,
} from "../calculator-core.mjs";

test("computeAdjustedRatio baja ratio cuando sube intensidad", () => {
  const base = DEFAULT_BASE_RATIO.v60;
  const adjusted = computeAdjustedRatio(base, 1.5);
  assert.equal(adjusted, base / 1.5);
});

test("computeAdjustedRatio respeta límites", () => {
  assert.equal(computeAdjustedRatio(40, 0.5), 25);
  assert.equal(computeAdjustedRatio(6, 4), 6);
});

test("cold brew permite ratios más cerrados que 1:6 con fuerza alta", () => {
  const { min, max } = getRatioBounds("coldbrew");
  const ratio = computeAdjustedRatio(DEFAULT_BASE_RATIO.coldbrew, 2, min, max);
  assert.equal(min, 4);
  assert.equal(ratio, 4);
});

test("computeWaterMl y computeCoffeeGrams calculan receta base", () => {
  const water = computeWaterMl("chemex", 2);
  const ratio = computeAdjustedRatio(16, 1);
  const coffee = computeCoffeeGrams(water, ratio);

  assert.equal(water, 300);
  assert.equal(roundTo(coffee, 0), 19);
});

test("aeropress usa 240 ml por taza como volumen sugerido", () => {
  assert.equal(WATER_PER_CUP.aeropress, 240);
  assert.equal(computeWaterMl("aeropress", 1), 240);
});

test("mlToOz convierte correctamente", () => {
  const oz = mlToOz(300);
  assert.equal(roundTo(oz, 1), 10.1);
});

test("moka usa agua y ratio base esperados", () => {
  const water = computeWaterMl("moka", 2);
  const ratio = computeAdjustedRatio(DEFAULT_BASE_RATIO.moka, 1);
  const coffee = computeCoffeeGrams(water, ratio);

  assert.equal(water, 120);
  assert.equal(roundTo(coffee, 0), 12);
});
