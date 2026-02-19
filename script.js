import {
  DEFAULT_BASE_RATIO,
  SUGGESTED_RATIO_RANGE,
  computeAdjustedRatio,
  computeCoffeeGrams,
  computeWaterMl,
  getRatioBounds,
  mlToOz,
  roundTo
} from "./calculator-core.mjs";

const methodLabels = {
  aeropress: "AeroPress",
  chemex: "Chemex",
  v60: "V60",
  frenchpress: "Prensa",
  moka: "Moka italiana",
  coldbrew: "Cold Brew"
};

const grindRecommendations = {
  aeropress: "Molienda media-fina",
  chemex: "Molienda media-gruesa",
  v60: "Molienda media-fina",
  frenchpress: "Molienda gruesa",
  moka: "Molienda fina-media (tipo sal de mesa, más gruesa que espresso)",
  coldbrew: "Molienda gruesa"
};

const methodHints = {
  coldbrew: "Cold Brew se calcula en modo concentrado; diluye 1:2 o 1:3 al servir.",
  moka: "En Moka italiana no compactes el café y retira del fuego al final del burbujeo."
};

const brewGuides = {
  aeropress: [
    "Enjuaga el filtro y precalienta el equipo.",
    "Agrega {coffee} g de café molido medio-fino.",
    "Vierte {water} {unit} de agua en 2 etapas.",
    "Remueve, espera 1:30 y presiona suave."
  ],
  chemex: [
    "Enjuaga el filtro y descarta el agua.",
    "Añade {coffee} g de café molido medio.",
    "Vierte {water} {unit} en círculos durante 3:30-4:00.",
    "Sirve cuando termine el goteo."
  ],
  v60: [
    "Enjuaga el filtro y precalienta el servidor.",
    "Añade {coffee} g de café molido medio-fino.",
    "Haz bloom 30-40 s y completa hasta {water} {unit}.",
    "Tiempo objetivo: 2:30-3:30."
  ],
  frenchpress: [
    "Agrega {coffee} g de café molido grueso.",
    "Vierte {water} {unit} de agua y remueve.",
    "Infusiona 4 minutos y rompe la costra.",
    "Presiona lentamente y sirve."
  ],
  moka: [
    "Llena la base con agua hasta la válvula.",
    "Añade {coffee} g de café molido fino-medio sin prensar.",
    "Arma la Moka y calienta a fuego medio-bajo.",
    "Retira cuando el flujo se vuelva claro y sirve."
  ],
  coldbrew: [
    "Añade {coffee} g de café molido grueso.",
    "Incorpora {water} {unit} de agua fría.",
    "Refrigera 12-16 horas.",
    "Filtra y sirve con hielo o diluye al gusto."
  ]
};

const STORAGE_KEY = "coffeeCalcPrefsV2";

let baseRatio = { ...DEFAULT_BASE_RATIO };
let selectedMethod = "aeropress";

const methodsEl = document.getElementById("methods");
const cupsEl = document.getElementById("cups");
const cupsOut = document.getElementById("cupsOut");
const strengthEl = document.getElementById("strength");
const unitEl = document.getElementById("unit");
const currentMethodEl = document.getElementById("currentMethod");
const errorMsgEl = document.getElementById("errorMsg");

const coffeeGEl = document.getElementById("coffeeG");
const waterMlEl = document.getElementById("waterMl");
const waterUnitEl = document.getElementById("waterUnit");
const metaEl = document.getElementById("meta");
const ratioPreviewEl = document.getElementById("ratioPreview");
const ratioRangeEl = document.getElementById("ratioRange");
const grindHintEl = document.getElementById("grindHint");
const methodHintEl = document.getElementById("methodHint");
const brewStepsEl = document.getElementById("brewSteps");
const stickyCoffeeEl = document.getElementById("stickyCoffee");
const stickyWaterEl = document.getElementById("stickyWater");
const stickyWaterUnitEl = document.getElementById("stickyWaterUnit");
const jumpToResultsBtn = document.getElementById("jumpToResults");
const resultsPanelEl = document.getElementById("resultsPanel");

const copyBtn = document.getElementById("copyRecipe");
const resetBtn = document.getElementById("reset");
const toggleAdvancedBtn = document.getElementById("toggleAdvanced");
const advancedPanelEl = document.getElementById("advancedPanel");
const ratioInputs = document.querySelectorAll("[data-ratio-method]");

function showError(message = "") {
  errorMsgEl.textContent = message;
}

function getNumericTextValue(el) {
  const raw = (el.textContent || "").replace(/[^\d.-]/g, "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function animateNumber(el, to, duration = 680) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    el.textContent = roundTo(to, 0);
    return;
  }

  const from = getNumericTextValue(el);
  const start = performance.now();
  const easing = (t) => 1 - Math.pow(1 - t, 3);

  if (el._countUpFrameId) {
    cancelAnimationFrame(el._countUpFrameId);
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current = from + (to - from) * easing(progress);
    el.textContent = roundTo(current, 0);

    if (progress < 1) {
      el._countUpFrameId = requestAnimationFrame(tick);
      return;
    }

    el.textContent = roundTo(to, 0);
    el._countUpFrameId = null;
  }

  el._countUpFrameId = requestAnimationFrame(tick);
}

function getPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePrefs() {
  const payload = {
    selectedMethod,
    cups: cupsEl.value,
    strength: strengthEl.value,
    unit: unitEl.value,
    baseRatio
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function getBounds(method) {
  return getRatioBounds(method);
}

function loadPrefs() {
  const prefs = getPrefs();
  if (!prefs) return;

  if (prefs.selectedMethod && methodLabels[prefs.selectedMethod]) {
    selectedMethod = prefs.selectedMethod;
  }

  if (prefs.cups) cupsEl.value = prefs.cups;
  if (prefs.strength) strengthEl.value = prefs.strength;
  if (prefs.unit) unitEl.value = prefs.unit;
  if (prefs.baseRatio && typeof prefs.baseRatio === "object") {
    const sanitized = { ...baseRatio };
    Object.entries(prefs.baseRatio).forEach(([method, value]) => {
      if (!methodLabels[method]) return;
      const parsed = parseFloat(value);
      if (!Number.isFinite(parsed)) return;
      const { min, max } = getBounds(method);
      sanitized[method] = Math.min(Math.max(parsed, min), max);
    });
    baseRatio = sanitized;
  }
}

function syncMethodUI() {
  methodsEl.querySelectorAll("li.brewingelements").forEach((item) => {
    const isActive = item.dataset.method === selectedMethod;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });
  currentMethodEl.textContent = methodLabels[selectedMethod];
}

function syncAdvancedInputs() {
  ratioInputs.forEach((input) => {
    const method = input.dataset.ratioMethod;
    const { min, max } = getBounds(method);
    input.min = String(min);
    input.max = String(max);
    input.value = baseRatio[method];
  });
}

function updateRatioPreview() {
  const strength = parseFloat(strengthEl.value);
  const { min, max } = getBounds(selectedMethod);
  const r = computeAdjustedRatio(baseRatio[selectedMethod], strength, min, max);
  ratioPreviewEl.textContent = `Ratio: 1:${roundTo(r, 1)}`;
}

function formatWaterForDisplay(waterMl) {
  const unit = unitEl.value;
  if (unit === "oz") {
    return {
      unit,
      value: roundTo(mlToOz(waterMl), 1)
    };
  }

  return {
    unit: "ml",
    value: roundTo(waterMl, 0)
  };
}

function updateRatioRange() {
  const [min, max] = SUGGESTED_RATIO_RANGE[selectedMethod];
  ratioRangeEl.textContent = `Rango sugerido para ${methodLabels[selectedMethod]}: 1:${min} a 1:${max}`;
}

function updateGrindHint() {
  if (!grindHintEl) return;
  grindHintEl.textContent = `Molienda recomendada para ${methodLabels[selectedMethod]}: ${grindRecommendations[selectedMethod]}.`;
}

function updateMethodHint() {
  if (!methodHintEl) return;
  methodHintEl.textContent = methodHints[selectedMethod] || "";
}

function renderSteps(coffeeGrams, waterValue, waterUnit) {
  const steps = brewGuides[selectedMethod].map((step) =>
    step
      .replace("{coffee}", roundTo(coffeeGrams, 0))
      .replace("{water}", waterValue)
      .replace("{unit}", waterUnit)
  );

  brewStepsEl.textContent = "";
  steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    brewStepsEl.appendChild(li);
  });
}

function updateQuickSummary(coffee, waterValue, waterUnit) {
  if (!stickyCoffeeEl || !stickyWaterEl || !stickyWaterUnitEl) return;
  stickyCoffeeEl.textContent = coffee;
  stickyWaterEl.textContent = waterValue;
  stickyWaterUnitEl.textContent = waterUnit;
}

function calculateAndRender({ animate = true } = {}) {
  const cups = parseInt(cupsEl.value, 10);
  const strength = parseFloat(strengthEl.value);

  if (!selectedMethod || !methodLabels[selectedMethod]) {
    showError("Selecciona un método de preparación.");
    return null;
  }

  if (!Number.isFinite(cups) || cups < 1) {
    showError("Selecciona un número válido de tazas.");
    return null;
  }

  if (!Number.isFinite(strength) || strength <= 0) {
    showError("Selecciona una intensidad válida.");
    return null;
  }

  showError("");

  const water = computeWaterMl(selectedMethod, cups);
  const { min, max } = getBounds(selectedMethod);
  const ratio = computeAdjustedRatio(baseRatio[selectedMethod], strength, min, max);
  const coffee = computeCoffeeGrams(water, ratio);

  const coffeeRounded = roundTo(coffee, 0);
  const waterDisplay = formatWaterForDisplay(water);

  if (animate) {
    animateNumber(coffeeGEl, coffeeRounded);
    animateNumber(waterMlEl, waterDisplay.value);
  } else {
    coffeeGEl.textContent = coffeeRounded;
    waterMlEl.textContent = waterDisplay.value;
  }

  waterUnitEl.textContent = waterDisplay.unit;
  updateQuickSummary(coffeeRounded, waterDisplay.value, waterDisplay.unit);
  metaEl.textContent = `Método: ${methodLabels[selectedMethod]} | Base 1:${baseRatio[selectedMethod]} | Ajustado 1:${roundTo(ratio, 1)} | Fuerza x${strength}`;

  updateRatioPreview();
  updateRatioRange();
  updateGrindHint();
  updateMethodHint();
  renderSteps(coffeeRounded, waterDisplay.value, waterDisplay.unit);
  savePrefs();

  return {
    method: methodLabels[selectedMethod],
    coffee: coffeeRounded,
    water: waterDisplay.value,
    waterUnit: waterDisplay.unit,
    ratio: roundTo(ratio, 1),
    cups
  };
}

function onMethodSelect(method) {
  if (!method || !methodLabels[method]) return;
  selectedMethod = method;
  syncMethodUI();
  calculateAndRender({ animate: false });
}

methodsEl.addEventListener("click", (e) => {
  const li = e.target.closest("li.brewingelements");
  if (!li) return;
  onMethodSelect(li.dataset.method);
});

methodsEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const li = e.target.closest("li.brewingelements");
  if (!li) return;
  e.preventDefault();
  onMethodSelect(li.dataset.method);
});

cupsEl.addEventListener("input", () => {
  cupsOut.textContent = cupsEl.value;
  calculateAndRender({ animate: false });
});

strengthEl.addEventListener("change", () => calculateAndRender({ animate: false }));
unitEl.addEventListener("change", () => calculateAndRender({ animate: false }));

ratioInputs.forEach((input) => {
  input.addEventListener("input", () => {
    const method = input.dataset.ratioMethod;
    const val = parseFloat(input.value);
    if (!Number.isFinite(val)) return;
    const { min, max } = getBounds(method);
    baseRatio[method] = Math.min(Math.max(val, min), max);
    input.value = baseRatio[method];
    calculateAndRender({ animate: false });
  });
});

copyBtn.addEventListener("click", async () => {
  const recipe = calculateAndRender({ animate: false });
  if (!recipe) return;

  const text = [
    `Receta de café (${recipe.method})`,
    `Tazas: ${recipe.cups}`,
    `Café: ${recipe.coffee} g`,
    `Agua: ${recipe.water} ${recipe.waterUnit}`,
    `Ratio ajustado: 1:${recipe.ratio}`,
    `Molienda recomendada: ${grindRecommendations[selectedMethod]}`,
    methodHints[selectedMethod] ? `Nota: ${methodHints[selectedMethod]}` : ""
  ].filter(Boolean).join("\n");

  try {
    await navigator.clipboard.writeText(text);
    showError("Receta copiada al portapapeles.");
  } catch {
    showError("No se pudo copiar automáticamente. Intenta de nuevo.");
  }
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  baseRatio = { ...DEFAULT_BASE_RATIO };
  selectedMethod = "aeropress";
  cupsEl.value = "1";
  cupsOut.textContent = "1";
  strengthEl.value = "1";
  unitEl.value = "ml";
  syncMethodUI();
  syncAdvancedInputs();
  calculateAndRender({ animate: false });
  showError("");
});

toggleAdvancedBtn.addEventListener("click", () => {
  const isOpen = !advancedPanelEl.hidden;
  advancedPanelEl.hidden = isOpen;
  toggleAdvancedBtn.setAttribute("aria-expanded", String(!isOpen));
});

if (jumpToResultsBtn && resultsPanelEl) {
  jumpToResultsBtn.addEventListener("click", () => {
    resultsPanelEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

loadPrefs();
cupsOut.textContent = cupsEl.value;
syncMethodUI();
syncAdvancedInputs();
calculateAndRender({ animate: false });
