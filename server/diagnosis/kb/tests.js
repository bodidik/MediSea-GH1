// FILE: server/diagnosis/kb/tests.js
//
// Test paneli.  Bulgular LR olarak yazilir (literaturdeki hali), testler ise
// P(sonuc | tani) tablosu olarak. Sebep: entropi hesabi icin P(sonuc)'a
// ihtiyac var ve bu ancak dogru normalize edilmis kosullu dagilimlardan
// cikarilabilir. LR'yi motor baglama gore kendisi turetir (bkz.
// testSelection.js).
//
// cost         : goreli maliyet birimi (tetkik ucreti + is yuku)
// invasiveness : 0 (kan alma yok) - 1 (girisimsel)
// p[tani]      : olasilik dagilimi, TOPLAMI 1 OLMALI (kb/index.js dogrular)
// fallback     : p[] icinde adi gecmeyen tanilar icin dagilim

export const TESTS = {
  serum_calcium: {
    label: 'Serum kalsiyum (albümin düzeltmeli)',
    cost: 1,
    invasiveness: 0.05,
    results: [
      { id: 'high', label: 'Yüksek' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      primary_hyperparathyroidism: { high: 0.95, normal: 0.05 },
      hypercalcemia_of_malignancy: { high: 0.98, normal: 0.02 },
    },
    fallback: { high: 0.02, normal: 0.98 },
  },

  pth: {
    label: 'Parathormon (PTH)',
    cost: 4,
    invasiveness: 0.05,
    results: [
      { id: 'high_or_inappropriate', label: 'Yüksek / uygunsuz normal' },
      { id: 'suppressed', label: 'Baskılanmış' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      primary_hyperparathyroidism: { high_or_inappropriate: 0.93, suppressed: 0.01, normal: 0.06 },
      hypercalcemia_of_malignancy: { high_or_inappropriate: 0.02, suppressed: 0.88, normal: 0.10 },
      chronic_kidney_disease: { high_or_inappropriate: 0.55, suppressed: 0.02, normal: 0.43 },
    },
    fallback: { high_or_inappropriate: 0.04, suppressed: 0.03, normal: 0.93 },
  },

  tsh: {
    label: 'TSH',
    cost: 2,
    invasiveness: 0.05,
    results: [
      { id: 'high', label: 'Yüksek' },
      { id: 'low', label: 'Düşük' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      hypothyroidism: { high: 0.97, low: 0.01, normal: 0.02 },
    },
    fallback: { high: 0.04, low: 0.04, normal: 0.92 },
  },

  b12_level: {
    label: 'Serum B12',
    cost: 3,
    invasiveness: 0.05,
    results: [
      { id: 'low', label: 'Düşük' },
      { id: 'borderline', label: 'Sınırda' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      b12_deficiency: { low: 0.85, borderline: 0.12, normal: 0.03 },
    },
    fallback: { low: 0.04, borderline: 0.10, normal: 0.86 },
  },

  cbc: {
    label: 'Tam kan sayımı',
    cost: 1,
    invasiveness: 0.05,
    results: [
      { id: 'anemia', label: 'Anemi' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      iron_deficiency_anemia: { anemia: 0.97, normal: 0.03 },
      b12_deficiency: { anemia: 0.55, normal: 0.45 },
      gi_malignancy: { anemia: 0.60, normal: 0.40 },
      chronic_kidney_disease: { anemia: 0.50, normal: 0.50 },
      lead_toxicity: { anemia: 0.50, normal: 0.50 },
      celiac_disease: { anemia: 0.40, normal: 0.60 },
      // IBS bir dislama tanisidir: normal sonuc onu DESTEKLER. Bunu yazmazsak
      // hicbir test IBS'i oynatamaz ve tani listede sonsuza kadar asili kalir.
      ibs_constipation: { anemia: 0.03, normal: 0.97 },
    },
    fallback: { anemia: 0.08, normal: 0.92 },
  },

  creatinine_egfr: {
    label: 'Kreatinin / eGFR',
    cost: 1,
    invasiveness: 0.05,
    results: [
      { id: 'reduced', label: 'eGFR düşük' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      chronic_kidney_disease: { reduced: 0.97, normal: 0.03 },
      primary_hyperparathyroidism: { reduced: 0.18, normal: 0.82 },
      diabetes_mellitus: { reduced: 0.20, normal: 0.80 },
    },
    fallback: { reduced: 0.05, normal: 0.95 },
  },

  hba1c: {
    label: 'HbA1c',
    cost: 2,
    invasiveness: 0.05,
    results: [
      { id: 'high', label: 'Yüksek' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      diabetes_mellitus: { high: 0.98, normal: 0.02 },
    },
    fallback: { high: 0.06, normal: 0.94 },
  },

  ttg_iga: {
    label: 'Doku transglutaminaz IgA',
    cost: 5,
    invasiveness: 0.05,
    results: [
      { id: 'positive', label: 'Pozitif' },
      { id: 'negative', label: 'Negatif' },
    ],
    p: {
      celiac_disease: { positive: 0.93, negative: 0.07 },
    },
    fallback: { positive: 0.01, negative: 0.99 },
  },

  blood_lead_level: {
    label: 'Kan kurşun düzeyi',
    cost: 8,
    invasiveness: 0.05,
    results: [
      { id: 'elevated', label: 'Yüksek' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      lead_toxicity: { elevated: 0.99, normal: 0.01 },
    },
    fallback: { elevated: 0.005, normal: 0.995 },
  },

  am_cortisol: {
    label: 'Sabah kortizolü',
    cost: 6,
    invasiveness: 0.05,
    results: [
      { id: 'low', label: 'Düşük' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      adrenal_insufficiency: { low: 0.93, normal: 0.07 },
    },
    fallback: { low: 0.03, normal: 0.97 },
  },

  fecal_elastase: {
    label: 'Fekal elastaz',
    cost: 12,
    invasiveness: 0.1,
    results: [
      { id: 'low', label: 'Düşük' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      chronic_pancreatitis: { low: 0.85, normal: 0.15 },
    },
    fallback: { low: 0.04, normal: 0.96 },
  },

  phq9: {
    label: 'PHQ-9 depresyon taraması',
    cost: 1,
    invasiveness: 0.0,
    results: [
      { id: 'positive', label: 'Pozitif' },
      { id: 'negative', label: 'Negatif' },
    ],
    // Ozgullugu dusuk: kronik hastaligin cogu PHQ-9'u pozitiflestirir.
    // Bu yuzden bilgi kazanci beklenenden az cikar - motor bunu gormeli.
    p: {
      depression: { positive: 0.88, negative: 0.12 },
      hypothyroidism: { positive: 0.35, negative: 0.65 },
      primary_hyperparathyroidism: { positive: 0.30, negative: 0.70 },
      obstructive_sleep_apnea: { positive: 0.30, negative: 0.70 },
      neurodegenerative_disorder: { positive: 0.30, negative: 0.70 },
      b12_deficiency: { positive: 0.25, negative: 0.75 },
      chronic_kidney_disease: { positive: 0.25, negative: 0.75 },
    },
    fallback: { positive: 0.15, negative: 0.85 },
  },

  moca: {
    label: 'MoCA kognitif değerlendirme',
    cost: 3,
    invasiveness: 0.05,
    results: [
      { id: 'impaired', label: 'Bozuk' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      neurodegenerative_disorder: { impaired: 0.92, normal: 0.08 },
      lead_toxicity: { impaired: 0.55, normal: 0.45 },
      primary_hyperparathyroidism: { impaired: 0.50, normal: 0.50 },
      b12_deficiency: { impaired: 0.50, normal: 0.50 },
      depression: { impaired: 0.45, normal: 0.55 },
      hypothyroidism: { impaired: 0.40, normal: 0.60 },
      chronic_kidney_disease: { impaired: 0.35, normal: 0.65 },
      obstructive_sleep_apnea: { impaired: 0.35, normal: 0.65 },
    },
    fallback: { impaired: 0.12, normal: 0.88 },
  },

  polysomnography: {
    label: 'Polisomnografi',
    cost: 80,
    invasiveness: 0.3,
    results: [
      { id: 'ahi_high', label: 'AHİ yüksek' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      obstructive_sleep_apnea: { ahi_high: 0.95, normal: 0.05 },
    },
    fallback: { ahi_high: 0.18, normal: 0.82 },
  },

  upper_endoscopy: {
    label: 'Üst GİS endoskopisi',
    cost: 45,
    invasiveness: 0.6,
    results: [
      { id: 'ulcer', label: 'Ülser' },
      { id: 'esophagitis', label: 'Özofajit' },
      { id: 'mass', label: 'Kitle' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      peptic_ulcer_disease: { ulcer: 0.88, esophagitis: 0.04, mass: 0.00, normal: 0.08 },
      gerd: { ulcer: 0.02, esophagitis: 0.45, mass: 0.00, normal: 0.53 },
      gi_malignancy: { ulcer: 0.15, esophagitis: 0.02, mass: 0.45, normal: 0.38 },
      celiac_disease: { ulcer: 0.02, esophagitis: 0.05, mass: 0.00, normal: 0.93 },
    },
    fallback: { ulcer: 0.02, esophagitis: 0.07, mass: 0.01, normal: 0.90 },
  },

  colonoscopy: {
    label: 'Kolonoskopi',
    cost: 70,
    invasiveness: 0.85,
    results: [
      { id: 'mass', label: 'Kitle' },
      { id: 'polyp', label: 'Polip' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      gi_malignancy: { mass: 0.80, polyp: 0.12, normal: 0.08 },
      ibs_constipation: { mass: 0.002, polyp: 0.098, normal: 0.90 },
    },
    fallback: { mass: 0.01, polyp: 0.12, normal: 0.87 },
  },

  ct_abdomen: {
    label: 'Abdomen BT',
    cost: 90,
    invasiveness: 0.35,
    results: [
      { id: 'abnormal', label: 'Patolojik' },
      { id: 'normal', label: 'Normal' },
    ],
    p: {
      chronic_pancreatitis: { abnormal: 0.80, normal: 0.20 },
      gi_malignancy: { abnormal: 0.55, normal: 0.45 },
      hypercalcemia_of_malignancy: { abnormal: 0.50, normal: 0.50 },
    },
    fallback: { abnormal: 0.06, normal: 0.94 },
  },
};

export const TEST_IDS = Object.keys(TESTS);
