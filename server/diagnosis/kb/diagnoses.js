// FILE: server/diagnosis/kb/diagnoses.js
//
// Kapsam kararı bilinçli olarak dardır: "kronik yorgunluk + karın ağrısı +
// kognitif yakınma" ekseni. Tüm tıbbı kapsamaya çalışmak bilgi tabanını
// kalibre edilemez hale getirir.
//
// prevalence : bu ekseni taşıyan birinci basamak hastasında ön-test olasılığı
//              (populasyon prevalansi degil).
// demographics.age : [minYas, maxYas, carpan]
// tempo      : sikayet suresine gore carpan. Sure bir "bulgu" degil, tum
//              LR'leri module eden bir eksendir.
// severity   : kacirilmasi halinde beklenen zarar (0-1). Olasilikla CARPILMAZ,
//              ayri bir eksende siralanir (bkz. redFlags.js).

export const DIAGNOSES = {
  primary_hyperparathyroidism: {
    label: 'Primer hiperparatiroidi (hiperkalsemi)',
    prevalence: 0.012,
    demographics: { age: [[0, 39, 0.3], [40, 59, 1.0], [60, 120, 1.7]], sex: { M: 0.5, F: 1.5 } },
    tempo: { acute: 0.2, subacute: 0.7, chronic: 1.3 },
    severity: 0.45,
    note: 'Taş, kemik, karın, kafa: "stones, bones, groans, psychiatric moans".',
  },

  hypercalcemia_of_malignancy: {
    label: 'Malignite ilişkili hiperkalsemi',
    prevalence: 0.003,
    demographics: { age: [[0, 49, 0.4], [50, 120, 1.6]], sex: { M: 1.1, F: 0.9 } },
    tempo: { acute: 1.5, subacute: 1.4, chronic: 0.2 },
    severity: 0.95,
  },

  hypothyroidism: {
    label: 'Hipotiroidi',
    prevalence: 0.055,
    demographics: { age: [[0, 39, 0.7], [40, 120, 1.2]], sex: { M: 0.5, F: 1.6 } },
    tempo: { acute: 0.2, subacute: 0.8, chronic: 1.3 },
    severity: 0.3,
  },

  b12_deficiency: {
    label: 'B12 eksikliği',
    prevalence: 0.045,
    demographics: { age: [[0, 49, 0.8], [50, 120, 1.4]], sex: { M: 1.0, F: 1.0 } },
    tempo: { acute: 0.2, subacute: 0.9, chronic: 1.3 },
    severity: 0.5, // gecikirse noropati kalici olabilir
  },

  iron_deficiency_anemia: {
    label: 'Demir eksikliği anemisi',
    prevalence: 0.05,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 0.6, F: 1.6 } },
    tempo: { acute: 0.4, subacute: 1.0, chronic: 1.1 },
    severity: 0.35, // erkekte altta yatan GIS kanamasi demektir
  },

  chronic_kidney_disease: {
    label: 'Kronik böbrek hastalığı',
    prevalence: 0.03,
    demographics: { age: [[0, 44, 0.4], [45, 64, 1.2], [65, 120, 2.0]], sex: { M: 1.1, F: 0.9 } },
    tempo: { acute: 0.2, subacute: 0.7, chronic: 1.4 },
    severity: 0.6,
  },

  diabetes_mellitus: {
    label: 'Diabetes mellitus (kötü kontrollü)',
    prevalence: 0.09,
    demographics: { age: [[0, 39, 0.5], [40, 120, 1.3]], sex: { M: 1.1, F: 0.9 } },
    tempo: { acute: 0.5, subacute: 1.0, chronic: 1.2 },
    severity: 0.4,
  },

  depression: {
    label: 'Depresyon',
    prevalence: 0.10,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 0.7, F: 1.4 } },
    tempo: { acute: 0.5, subacute: 1.1, chronic: 1.2 },
    severity: 0.4,
  },

  obstructive_sleep_apnea: {
    label: 'Obstrüktif uyku apnesi',
    prevalence: 0.07,
    demographics: { age: [[0, 39, 0.6], [40, 120, 1.3]], sex: { M: 1.6, F: 0.6 } },
    tempo: { acute: 0.2, subacute: 0.8, chronic: 1.3 },
    severity: 0.35,
  },

  gerd: {
    label: 'Gastroözofageal reflü hastalığı',
    prevalence: 0.14,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 1.1, F: 0.9 } },
    tempo: { acute: 0.6, subacute: 1.1, chronic: 1.1 },
    severity: 0.15,
  },

  peptic_ulcer_disease: {
    label: 'Peptik ülser hastalığı',
    prevalence: 0.035,
    demographics: { age: [[0, 39, 0.7], [40, 120, 1.2]], sex: { M: 1.2, F: 0.85 } },
    tempo: { acute: 1.0, subacute: 1.2, chronic: 0.9 },
    severity: 0.4,
  },

  ibs_constipation: {
    label: 'İrritabl bağırsak sendromu (konstipasyon baskın)',
    prevalence: 0.07,
    demographics: { age: [[0, 49, 1.2], [50, 120, 0.7]], sex: { M: 0.6, F: 1.5 } },
    tempo: { acute: 0.2, subacute: 0.8, chronic: 1.3 },
    severity: 0.1,
  },

  celiac_disease: {
    label: 'Çölyak hastalığı',
    prevalence: 0.012,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 0.7, F: 1.3 } },
    tempo: { acute: 0.3, subacute: 0.9, chronic: 1.3 },
    severity: 0.35,
  },

  chronic_pancreatitis: {
    label: 'Kronik pankreatit',
    prevalence: 0.006,
    demographics: { age: [[0, 34, 0.5], [35, 120, 1.3]], sex: { M: 1.7, F: 0.5 } },
    tempo: { acute: 0.4, subacute: 1.0, chronic: 1.3 },
    severity: 0.45,
  },

  gi_malignancy: {
    label: 'GİS malignitesi (okült)',
    prevalence: 0.008,
    demographics: { age: [[0, 44, 0.2], [45, 59, 1.0], [60, 120, 2.2]], sex: { M: 1.3, F: 0.8 } },
    tempo: { acute: 0.5, subacute: 1.4, chronic: 0.7 },
    severity: 0.95,
  },

  adrenal_insufficiency: {
    label: 'Adrenal yetmezlik',
    prevalence: 0.002,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 0.9, F: 1.2 } },
    tempo: { acute: 0.8, subacute: 1.2, chronic: 1.0 },
    severity: 0.9, // adrenal kriz oldurucudur
  },

  lead_toxicity: {
    label: 'Kurşun toksisitesi',
    prevalence: 0.0015,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 1.5, F: 0.6 } },
    tempo: { acute: 0.6, subacute: 1.2, chronic: 1.1 },
    severity: 0.7,
    note: 'Hiperparatiroidinin klasik taklitçisi: kolik, kabızlık, kognitif bulanıklık.',
  },

  neurodegenerative_disorder: {
    label: 'Nörodejeneratif hastalık (erken demans)',
    prevalence: 0.015,
    demographics: { age: [[0, 54, 0.15], [55, 69, 0.8], [70, 120, 3.0]], sex: { M: 1.0, F: 1.0 } },
    tempo: { acute: 0.1, subacute: 0.4, chronic: 1.5 },
    severity: 0.6,
  },

  // Kapali dunya varsayimini kirmamak icin artik kategori. Her bulguyu
  // "aciklar" (LR = 1), dolayisiyla tekillik cezasi almaz; olasilik kutlesinin
  // tamamini birkac tanıya paylastirmayi engeller.
  other_undifferentiated: {
    label: 'Diğer / henüz ayrışmamış',
    prevalence: 0.22,
    demographics: { age: [[0, 120, 1.0]], sex: { M: 1.0, F: 1.0 } },
    tempo: { acute: 1.0, subacute: 1.0, chronic: 1.0 },
    severity: 0.2,
    isResidual: true,
  },
};

export const DIAGNOSIS_IDS = Object.keys(DIAGNOSES);
