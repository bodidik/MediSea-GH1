// FILE: server/diagnosis/kb/likelihoods.js
//
// Olabilirlik oranı (LR) matrisi.  LIKELIHOODS[tani][bulgu] = [LR+, LR-]
//   LR+ : bulgu VAR ise uygulanir
//   LR- : bulgu YOK ise uygulanir   (yalnizca sayi yazilirsa LR- = 1)
//
// Ucuncu bir durum daha var: bulgu SORULMAMIS (unknown). O zaman hicbir sey
// uygulanmaz. "yok" ile "bilinmiyor" ayrimini kaybeden bir motor her hastada
// ayni taniya kayar; bu yuzden LR- default'u 1'dir (yoklugu bilgisiz say),
// sadece gercekten ayirt edici oldugu yerde 1'den uzaklastirilir.
//
// Sayilar ordinal kovalara oturtulmustur (0.1 / 0.25 / 0.4 / 0.6 / 1 / 1.5 /
// 2 / 3 / 5 / 8 / 12 / 25). Kesin degerler kalibrasyonla gelir; siralamayi
// belirleyen buyukluk mertebesidir.

const K = {
  primary_hyperparathyroidism: {
    nephrolithiasis_history: [6.0, 0.8],
    fragility_fracture: 4.0,
    costovertebral_tenderness: 1.5,
    // risk ekseni: olasiligi yukseltir, aciklanmasi gerekmez
    family_history_men1: 12.0,
    lithium_use: 5.0,
    thiazide_use: 2.5,
    calcium_vitd_supplement: 1.5,
    hypertension_history: 1.4,
    constipation: 2.5,
    abdominal_pain_upper: 1.7,
    cognitive_impairment: 2.5,
    fatigue: 1.8,
    bone_pain: 3.5,
    polyuria: 2.5,
    polydipsia: 2.0,
    nocturia: 1.8,
    muscle_weakness: 2.0,
    depressed_mood: 1.8,
    anorexia: 1.5,
    ppi_trial_failed: 1.5,
    diarrhea: [0.4, 1.1],
    fever: [0.6, 1.05],
    weight_loss: 1.0,
  },

  hypercalcemia_of_malignancy: {
    nephrolithiasis_history: 1.5,
    constipation: 2.5,
    abdominal_pain_upper: 1.8,
    cognitive_impairment: 3.0,
    fatigue: 2.2,
    bone_pain: 4.0,
    polyuria: 2.5,
    anorexia: 3.0,
    weight_loss: [4.0, 0.3],
    muscle_weakness: 2.0,
    pallor: 2.0,
    fragility_fracture: 2.5,
    abdominal_mass: 3.0,
    hepatomegaly: 2.5,
    smoking: 2.0,
  },

  hypothyroidism: {
    goiter: [5.0, 0.9],
    delayed_relaxation_reflex: [6.0, 0.7],
    family_history_thyroid_disease: 3.0,
    autoimmune_disease_history: 2.5,
    fatigue: 2.5,
    constipation: 2.5,
    cognitive_impairment: 2.2,
    cold_intolerance: 4.0,
    dry_skin: 3.0,
    hair_loss: 2.5,
    weight_gain: 2.5,
    depressed_mood: 2.0,
    muscle_weakness: 1.8,
    edema: 1.8,
    weight_loss: 0.5,
    diarrhea: 0.5,
  },

  b12_deficiency: {
    fatigue: 2.2,
    cognitive_impairment: 3.0,
    paresthesia: 4.0,
    // Muayene bulgularinda LR- 1'den uzaklastirilir: kayitli NORMAL muayene
    // gercek bir gozlemdir, sorulmamis bir soru degil.
    gait_ataxia: [4.0, 0.85],
    reduced_vibration_sense: [5.0, 0.6],
    absent_ankle_reflex: [3.0, 0.8],
    pallor: 2.5,
    depressed_mood: 1.6,
    constipation: 1.3,
    muscle_weakness: 1.8,
    gastric_surgery_history: 6.0,
    ppi_chronic_use: 2.5,
    autoimmune_disease_history: 2.0,
  },

  iron_deficiency_anemia: {
    fatigue: 3.0,
    pallor: [4.0, 0.5],
    cognitive_impairment: 1.6,
    melena: 3.0,
    weight_loss: 1.3,
    muscle_weakness: 1.5,
    peptic_ulcer_history: 2.0,
    gastric_surgery_history: 2.5,
  },

  chronic_kidney_disease: {
    fatigue: 2.5,
    cognitive_impairment: 1.8,
    nephrolithiasis_history: 2.0,
    nocturia: 2.5,
    edema: 2.5,
    anorexia: 2.0,
    pallor: 2.0,
    constipation: 1.3,
    muscle_weakness: 1.6,
    polyuria: 1.6,
    hypertension_history: 3.0,
    smoking: 1.5,
  },

  diabetes_mellitus: {
    obesity_bmi_high: [3.0, 0.7],
    hypertension_history: 2.0,
    fatigue: 2.0,
    polyuria: 4.0,
    polydipsia: 4.0,
    nocturia: 2.2,
    cognitive_impairment: 1.4,
    constipation: 1.5,
    paresthesia: 2.5,
    weight_loss: 1.8,
  },

  depression: {
    depression_history: 5.0,
    fatigue: 2.5,
    cognitive_impairment: 2.2,
    depressed_mood: 6.0,
    anhedonia: 6.0,
    constipation: 1.3,
    anorexia: 1.8,
    weight_loss: 1.4,
    daytime_somnolence: 1.5,
    // Ust karin agrisini aciklamaz: bilerek 1.0 birakildi ki tekillik cezasi
    // dogru calissin.
    abdominal_pain_upper: 1.0,
  },

  obstructive_sleep_apnea: {
    obesity_bmi_high: [4.0, 0.5],
    hypertension_history: 1.8,
    smoking: 1.4,
    fatigue: 3.0,
    snoring: 5.0,
    daytime_somnolence: 5.0,
    cognitive_impairment: 2.5,
    nocturia: 2.0,
    depressed_mood: 1.5,
    weight_gain: 1.5,
  },

  gerd: {
    heartburn: 6.0,
    obesity_bmi_high: 1.8,
    epigastric_tenderness: 1.5,
    abdominal_pain_upper: 2.5,
    early_satiety: 1.5,
    bloating: 1.5,
    chest_pain: 2.0,
    // Tedaviye yanitsizlik GERD'i DISLAR. Vakadaki en guclu tek bulgu budur.
    ppi_trial_failed: 0.25,
    fatigue: 1.0,
    cognitive_impairment: 1.0,
    constipation: 1.0,
  },

  peptic_ulcer_disease: {
    peptic_ulcer_history: 5.0,
    epigastric_tenderness: [3.0, 0.5],
    smoking: 2.0,
    ppi_chronic_use: 1.5,
    abdominal_pain_upper: 3.5,
    early_satiety: 2.5,
    melena: 4.0,
    vomiting: 2.0,
    ppi_trial_failed: 0.4,
    anorexia: 1.6,
    weight_loss: 1.5,
  },

  ibs_constipation: {
    constipation: 4.0,
    bloating: 3.0,
    pain_relief_with_defecation: 5.0,
    abdominal_pain_upper: 1.4,
    laxative_trial_failed: 1.5,
    fatigue: 1.4,
    weight_loss: [0.3, 1.15],
    melena: 0.2,
  },

  celiac_disease: {
    family_history_celiac: 8.0,
    autoimmune_disease_history: 4.0,
    reduced_vibration_sense: 1.5,
    diarrhea: 3.0,
    steatorrhea: 3.5,
    bloating: 3.0,
    abdominal_pain_upper: 1.8,
    fatigue: 2.0,
    cognitive_impairment: 1.8,
    pallor: 2.2,
    weight_loss: 2.2,
    constipation: 1.2,
    paresthesia: 1.6,
  },

  chronic_pancreatitis: {
    smoking: 3.0,
    epigastric_tenderness: [2.5, 0.6],
    abdominal_pain_upper: 4.0,
    steatorrhea: 6.0,
    alcohol_heavy: 5.0,
    weight_loss: 2.5,
    ppi_trial_failed: 1.6,
    diarrhea: 2.0,
    fatigue: 1.4,
    early_satiety: 1.5,
  },

  gi_malignancy: {
    abdominal_mass: [6.0, 0.8],
    hepatomegaly: 3.0,
    smoking: 1.8,
    weight_loss: [4.0, 0.35],
    melena: 5.0,
    anorexia: 3.0,
    pallor: 3.0,
    family_history_colorectal_ca: 3.0,
    abdominal_pain_upper: 2.0,
    constipation: 2.0,
    fatigue: 2.0,
    early_satiety: 2.0,
    ppi_trial_failed: 1.6,
    fever: 1.2,
  },

  adrenal_insufficiency: {
    orthostatic_hypotension: [5.0, 0.6],
    autoimmune_disease_history: 4.0,
    fatigue: 3.5,
    hyperpigmentation: [8.0, 0.4],
    salt_craving: 6.0,
    orthostatic_dizziness: 3.0,
    abdominal_pain_upper: 2.5,
    anorexia: 3.0,
    weight_loss: [3.0, 0.5],
    vomiting: 2.0,
    muscle_weakness: 2.5,
    cognitive_impairment: 1.5,
    constipation: 1.4,
  },

  lead_toxicity: {
    occupational_lead_exposure: [25.0, 0.25],
    gingival_lead_line: [15.0, 0.9],
    wrist_drop: [8.0, 0.9],
    abdominal_pain_upper: 2.5,
    constipation: 3.0,
    cognitive_impairment: 3.0,
    fatigue: 2.0,
    paresthesia: 3.0,
    muscle_weakness: 3.0,
    pallor: 2.5,
    anorexia: 2.0,
    ppi_trial_failed: 1.6,
  },

  neurodegenerative_disorder: {
    cognitive_impairment: [5.0, 0.15],
    constipation: 1.5,
    depressed_mood: 1.6,
    fatigue: 1.2,
    gait_ataxia: 2.0,
    abdominal_pain_upper: 1.0,
  },

  // Artik kategori: hicbir bulguyu ayirt etmez.
  other_undifferentiated: {},
};

export const LIKELIHOODS = K;
