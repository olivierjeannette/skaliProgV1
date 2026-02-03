// ---------- Types ----------
export type Gender = "male" | "female";

export type InputData = {
  // Profil
  age: number;          // années
  gender: Gender;
  weight: number;       // kg
  height?: number;      // cm (optionnel)

  // Cardio (au moins un des deux recommandé)
  run2kTimeSec?: number;    // temps 2000 m course en secondes
  run5kTimeSec?: number;    // temps 5000 m course en secondes

  // Force (1RM)
  backSquat1RM?: number;    // kg
  bench1RM?: number;        // kg
  deadlift1RM?: number;     // kg
  snatch1RM?: number;       // kg (option)
  cleanJerk1RM?: number;    // kg (option)

  // Endurance musculaire
  pullUpsMax?: number;      // reps strictes
  pushUpsMax?: number;      // reps strictes
  burpees2min?: number;     // reps en 2 minutes

  // Puissance
  cmjHeightCm?: number;     // saut vertical (CounterMovement Jump), cm
  sprint30mSec?: number;    // temps 30 m en secondes
};

export type FitnessOutput = {
  fitnessIndex: number; // 0–100
  badge: "Débutant" | "Départemental" | "Régional" | "National" | "International";
  components: {
    cardio: number;
    strength: number;
    muscularEndurance: number;
    power: number;
  };
  vo2: {
    estimatedVO2max: number | null; // ml/kg/min
    method: "run2k" | "run5k" | "none";
  };
};

// ---------- Utils ----------
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// Map linéaire (x0->y0, x1->y1), clampée
function mapLinear(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x0 === x1) return y0;
  const t = clamp((x - x0) / (x1 - x0), 0, 1);
  return y0 + t * (y1 - y0);
}

// Logistique lisse pour rendements décroissants (0–100)
function logisticScore(x: number, mid: number, steep: number, maxScore = 100): number {
  const s = maxScore / (1 + Math.exp(-steep * (x - mid)));
  return clamp(s, 0, maxScore);
}

// Badge à partir du score global
function badgeFromScore(s: number): FitnessOutput["badge"] {
  if (s >= 85) return "International";
  if (s >= 70) return "National";
  if (s >= 55) return "Régional";
  if (s >= 40) return "Départemental";
  return "Débutant";
}

// ---------- NOUVEAUX FACTEURS D'AJUSTEMENT ----------

/** 
 * Facteur âge GÉNÉRAL (pas seulement VO2)
 * Déclin moyen : -0.5%/an avant 30, -1%/an après 30, -1.5%/an après 50
 */
function ageFactorGeneral(age: number, category: "cardio" | "strength" | "endurance" | "power"): number {
  // Facteurs de déclin spécifiques par catégorie
  const declineRates = {
    cardio: { before30: 0.003, after30: 0.007, after50: 0.012 },
    strength: { before30: 0.002, after30: 0.008, after50: 0.015 },
    endurance: { before30: 0.002, after30: 0.006, after50: 0.010 },
    power: { before30: 0.005, after30: 0.010, after50: 0.020 } // La puissance décline plus vite
  };
  
  const rates = declineRates[category];
  
  if (age <= 30) {
    return 1 / (1 + rates.before30 * (30 - age));
  } else if (age <= 50) {
    return 1 / (1 + rates.after30 * (age - 30));
  } else {
    return 1 / (1 + rates.after30 * 20 + rates.after50 * (age - 50));
  }
}

/** 
 * Facteur genre GÉNÉRAL
 * Différences physiologiques moyennes H/F par catégorie
 */
function genderFactorGeneral(gender: Gender, category: "cardio" | "strength" | "endurance" | "power"): number {
  if (gender === "male") return 1.0;
  
  // Facteurs de compensation pour les femmes (multiplicateurs)
  const factors = {
    cardio: 1.10,      // VO2max ~10% plus bas
    strength: 1.40,    // Force absolue ~30-40% plus basse
    endurance: 0.95,   // Souvent meilleure endurance relative
    power: 1.25        // Puissance ~20-25% plus basse
  };
  
  return factors[category];
}

/**
 * Ajustement BMI pour certaines épreuves
 * Pénalise les BMI extrêmes pour les exercices au poids de corps
 */
function bmiAdjustment(weight: number, height?: number, exerciseType?: "bodyweight" | "absolute"): number {
  if (!height || exerciseType === "absolute") return 1.0;
  
  const bmi = weight / ((height / 100) ** 2);
  
  // BMI optimal pour performance : 22-26 pour hommes, 20-24 pour femmes
  if (exerciseType === "bodyweight") {
    if (bmi < 20) return 0.95; // Trop léger, manque de force
    if (bmi < 22) return 1.0;
    if (bmi < 26) return 0.98;
    if (bmi < 28) return 0.94;
    if (bmi < 30) return 0.88;
    return 0.80; // BMI > 30, forte pénalité pour poids de corps
  }
  
  return 1.0;
}

// ---------- VO₂max (EXISTANT - OK) ----------
function vo2FromRun(distanceMeters: number, timeSec: number): number {
  if (!timeSec || timeSec <= 0) return NaN;
  const v_m_per_min = (distanceMeters / timeSec) * 60;
  const vo2 = 0.182258 * v_m_per_min + 0.000104 * v_m_per_min * v_m_per_min + 3.5;
  return vo2;
}

function vo2ToScore(vo2: number, age: number, gender: Gender): number {
  if (!isFinite(vo2)) return 0;
  const ageF = ageFactorGeneral(age, "cardio");
  const sexF = genderFactorGeneral(gender, "cardio");
  const adj = vo2 * sexF * ageF;

  const bad = 35, fair = 42, avg = 50, good = 58, excel = 66, elite = 75;

  if (adj <= bad) return mapLinear(adj, 20, bad, 5, 25);
  if (adj <= fair) return mapLinear(adj, bad, fair, 25, 40);
  if (adj <= avg) return mapLinear(adj, fair, avg, 40, 55);
  if (adj <= good) return mapLinear(adj, avg, good, 55, 70);
  if (adj <= excel) return mapLinear(adj, good, excel, 70, 85);
  return mapLinear(adj, excel, 85, 85, 100);
}

// ---------- Force AMÉLIORÉE ----------
function strengthSubscoreFromRatios(
  squatRatio?: number,
  deadliftRatio?: number,
  benchRatio?: number,
  age?: number,
  gender?: Gender
): number {
  const parts: number[] = [];
  
  // Ajustements âge et genre pour la force
  const ageF = age ? ageFactorGeneral(age, "strength") : 1;
  const genderF = gender ? genderFactorGeneral(gender, "strength") : 1;
  
  // Ajuster les ratios avec les facteurs
  if (isFinite(squatRatio!)) {
    const adjustedRatio = squatRatio! * genderF * ageF;
    // Cibles ajustées : 1.6x pour homme 30 ans
    parts.push(logisticScore(adjustedRatio, 1.6, 3));
  }
  
  if (isFinite(deadliftRatio!)) {
    const adjustedRatio = deadliftRatio! * genderF * ageF;
    parts.push(logisticScore(adjustedRatio, 2.2, 3));
  }
  
  if (isFinite(benchRatio!)) {
    const adjustedRatio = benchRatio! * genderF * ageF;
    parts.push(logisticScore(adjustedRatio, 1.2, 3.3));
  }
  
  if (!parts.length) return 0;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

// ---------- Endurance musculaire AMÉLIORÉE ----------
function muscularEnduranceScore(
  pullUps?: number, 
  pushUps?: number, 
  burpees2min?: number,
  age?: number,
  gender?: Gender,
  weight?: number,
  height?: number
): number {
  const subs: number[] = [];
  
  // Ajustements
  const ageF = age ? ageFactorGeneral(age, "endurance") : 1;
  const genderF = gender ? genderFactorGeneral(gender, "endurance") : 1;
  const bmiF = (weight && height) ? bmiAdjustment(weight, height, "bodyweight") : 1;
  
  if (isFinite(pullUps!)) {
    // Ajuster le nombre de tractions avec tous les facteurs
    const adjusted = pullUps! * genderF * ageF * bmiF;
    
    let s = 0;
    if (adjusted <= 5) s = mapLinear(adjusted, 0, 5, 10, 35);
    else if (adjusted <= 10) s = mapLinear(adjusted, 5, 10, 35, 55);
    else if (adjusted <= 20) s = mapLinear(adjusted, 10, 20, 55, 80);
    else s = mapLinear(adjusted, 20, 30, 80, 96);
    
    subs.push(clamp(s, 0, 100));
  }
  
  if (isFinite(pushUps!)) {
    const adjusted = pushUps! * genderF * ageF * bmiF;
    
    let s = mapLinear(adjusted, 10, 30, 20, 50);
    if (adjusted > 30) s = mapLinear(adjusted, 30, 50, 50, 70);
    if (adjusted > 50) s = mapLinear(adjusted, 50, 80, 70, 90);
    if (adjusted > 80) s = mapLinear(adjusted, 80, 110, 90, 98);
    
    subs.push(clamp(s, 0, 100));
  }
  
  if (isFinite(burpees2min!)) {
    const adjusted = burpees2min! * genderF * ageF;
    
    let s = mapLinear(adjusted, 15, 20, 25, 40);
    if (adjusted > 20) s = mapLinear(adjusted, 20, 30, 40, 65);
    if (adjusted > 30) s = mapLinear(adjusted, 30, 40, 65, 85);
    if (adjusted > 40) s = mapLinear(adjusted, 40, 55, 85, 97);
    
    subs.push(clamp(s, 0, 100));
  }
  
  if (!subs.length) return 0;
  return subs.reduce((a, b) => a + b, 0) / subs.length;
}

// ---------- Puissance AMÉLIORÉE ----------
function powerScore(
  cmjCm?: number, 
  sprint30mSec?: number,
  age?: number,
  gender?: Gender,
  weight?: number,
  height?: number
): number {
  const parts: number[] = [];
  
  // La puissance décline rapidement avec l'âge
  const ageF = age ? ageFactorGeneral(age, "power") : 1;
  const genderF = gender ? genderFactorGeneral(gender, "power") : 1;
  
  if (isFinite(cmjCm!)) {
    const adjusted = cmjCm! * genderF * ageF;
    
    let s = mapLinear(adjusted, 20, 35, 30, 60);
    if (adjusted > 35) s = mapLinear(adjusted, 35, 45, 60, 75);
    if (adjusted > 45) s = mapLinear(adjusted, 45, 55, 75, 88);
    if (adjusted > 55) s = mapLinear(adjusted, 55, 65, 88, 96);
    
    parts.push(clamp(s, 0, 100));
  }
  
  if (isFinite(sprint30mSec!)) {
    // Pour le sprint, on ajuste le temps (plus c'est bas, mieux c'est)
    // Donc on divise le temps par les facteurs au lieu de multiplier
    const adjusted = sprint30mSec! / (genderF * ageF);
    
    let s = mapLinear(adjusted, 5.0, 4.5, 30, 55);
    if (adjusted <= 4.5) s = mapLinear(adjusted, 4.5, 4.2, 55, 75);
    if (adjusted <= 4.2) s = mapLinear(adjusted, 4.2, 3.9, 75, 90);
    if (adjusted <= 3.9) s = mapLinear(adjusted, 3.9, 3.7, 90, 98);
    
    parts.push(clamp(s, 0, 100));
  }
  
  if (!parts.length) return 0;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

// ---------- Calcul principal AMÉLIORÉ ----------
export function calculateFitnessIndexV2(
  data: InputData,
  weights = { cardio: 0.35, strength: 0.25, muscularEndurance: 0.20, power: 0.20 }
): FitnessOutput {
  const { age, gender, weight, height } = data;

  // --- VO2 (cardio) - DÉJÀ OK ---
  let vo2: number | null = null;
  let vo2Method: FitnessOutput["vo2"]["method"] = "none";
  if (isFinite(data.run2kTimeSec!)) {
    vo2 = vo2FromRun(2000, data.run2kTimeSec!);
    vo2Method = "run2k";
  } else if (isFinite(data.run5kTimeSec!)) {
    vo2 = vo2FromRun(5000, data.run5kTimeSec!);
    vo2Method = "run5k";
  }
  const cardioScore = vo2 !== null ? vo2ToScore(vo2!, age, gender) : 0;

  // --- Force AVEC AJUSTEMENTS ---
  const squatR = isFinite(data.backSquat1RM!) ? data.backSquat1RM! / weight : undefined;
  const dlR    = isFinite(data.deadlift1RM!)   ? data.deadlift1RM!   / weight : undefined;
  const bpR    = isFinite(data.bench1RM!)      ? data.bench1RM!      / weight : undefined;
  const strengthScore = strengthSubscoreFromRatios(squatR, dlR, bpR, age, gender);

  // --- Endurance musculaire AVEC AJUSTEMENTS ---
  const enduScore = muscularEnduranceScore(
    data.pullUpsMax, 
    data.pushUpsMax, 
    data.burpees2min,
    age,
    gender,
    weight,
    height
  );

  // --- Puissance AVEC AJUSTEMENTS ---
  const powScore = powerScore(
    data.cmjHeightCm, 
    data.sprint30mSec,
    age,
    gender,
    weight,
    height
  );

  // --- Score global ---
  const s =
    cardioScore * weights.cardio +
    strengthScore * weights.strength +
    enduScore * weights.muscularEndurance +
    powScore * weights.power;

  const fitnessIndex = Math.round(clamp(s, 0, 100));
  const badge = badgeFromScore(fitnessIndex);

  return {
    fitnessIndex,
    badge,
    components: {
      cardio: Math.round(cardioScore),
      strength: Math.round(strengthScore),
      muscularEndurance: Math.round(enduScore),
      power: Math.round(powScore),
    },
    vo2: {
      estimatedVO2max: vo2 ? Math.round(vo2) : null,
      method: vo2Method,
    },
  };
}