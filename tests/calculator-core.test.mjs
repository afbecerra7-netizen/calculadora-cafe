import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_BASE_RATIO,
  computeAdjustedRatio,
  computeCoffeeGrams,
  computeWaterMl,
  mlToOz,
  roundTo
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

test("computeWaterMl y computeCoffeeGrams calculan receta base", () => {
  const water = computeWaterMl("chemex", 2);
  const ratio = computeAdjustedRatio(16, 1);
  const coffee = computeCoffeeGrams(water, ratio);

  assert.equal(water, 330);
  assert.equal(roundTo(coffee, 0), 21);
});

test("mlToOz convierte correctamente", () => {
  const oz = mlToOz(300);
  assert.equal(roundTo(oz, 1), 10.1);
});

test("moka usa agua y ratio base esperados", () => {
  const water = computeWaterMl("moka", 2);
  const ratio = computeAdjustedRatio(DEFAULT_BASE_RATIO.moka, 1);
  const coffee = computeCoffeeGrams(water, ratio);

  assert.equal(water, 100);
  assert.equal(roundTo(coffee, 0), 11);
});
