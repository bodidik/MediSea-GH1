// FILE: server/diagnosis/cases/vignette59mFatigue.js
//
// Katman 1'in (metin -> yapilandirilmis bulgu) bu vaka icin uretmesi gereken
// cikti. Motor testleri bunu sabit girdi olarak kullanir; boylece motor ile
// cikarim katmani ayri ayri test edilebilir.
//
// Kaynak metin (ozet): 59 yasinda erkek, bobrek tasi oykusu; 2 yildir yorgunluk,
// araliksiz ust karin agrisi ve kognitif zorluk. GERD tanisi konmus, omeprazol
// ile agri yalnizca ara sira duzelmis. Iki gunde bir diskilama. Son bir yilda
// yorgunluk artmis, "zihin bulaniklıgı", cok adimli yonergeleri izlemekte
// zorlanma, unutkanlik. Ates, gogus agrisi, kusma, ishal YOK.
//
// Metin yalnizca hikaye iceriyor; muayene / soygecmis / aliskanlik kutulari
// BOS birakilmistir. Bos kutu "hepsi normal" demek DEGILDIR - motor bunlari
// bilinmiyor sayar ve eksik muayene sistemlerini ayrica onerir.

export const VIGNETTE_59M_FATIGUE = {
  id: 'vignette-59m-fatigue',
  age: 59,
  sex: 'M',
  durationMonths: 24,

  hpi: [
    // --- VAR ---
    { code: 'fatigue', present: true },
    { code: 'abdominal_pain_upper', present: true },
    { code: 'cognitive_impairment', present: true },
    { code: 'constipation', present: true },
    // "omeprazole'e ragmen agri yalnizca ara sira duzeldi" -> GERD'i dislayan bulgu
    { code: 'ppi_trial_failed', present: true },

    // --- YOK (sorulmamis degil!) ---
    { code: 'fever', present: false },
    { code: 'chest_pain', present: false },
    { code: 'vomiting', present: false },
    { code: 'diarrhea', present: false },
  ],

  // Bobrek tasi oykusu bir RISK degil, ayni hastalik surecinin BELIRTISIDIR;
  // taninin onu aciklamasi beklenir (bkz. findings.js axis).
  pmh: [
    { code: 'nephrolithiasis_history', present: true },
  ],

  meds: [],   // omeprazol disinda ilac bildirilmemis
  fhx: [],    // sorulmamis
  habits: [], // sorulmamis
  exam: {},   // yapilmamis / kayitli degil

  // Metinde gecen "GERD tanisi kondu" bir KANIT degil, dogrulanmamis bir
  // hipotezdir; bulgu olarak beslenmez. Aksi halde yanlis tani kilitlenir.
  priorDiagnoses: [{ code: 'gerd', confirmed: false }],
  testResults: [],
};

/**
 * Ayni hasta, muayene ve diger kutular dolduruldugunda.
 * Batin ve norolojik muayene NORMAL kaydedilmistir -> o sistemlerin tum
 * bulgulari YOK sayilir (anlamli negatif), sorulmamis degil.
 */
export const VIGNETTE_59M_FATIGUE_FULL = {
  ...VIGNETTE_59M_FATIGUE,
  id: 'vignette-59m-fatigue-full',
  exam: {
    normalSystems: ['abdomen', 'neuro', 'skin', 'neck'],
    findings: [
      { code: 'pallor', present: false },
      { code: 'obesity_bmi_high', present: false },
    ],
  },
  pmh: [
    { code: 'nephrolithiasis_history', present: true },
    { code: 'hypertension_history', present: true },
    { code: 'peptic_ulcer_history', present: false },
  ],
  meds: [
    { code: 'thiazide_use', present: true },
    { code: 'lithium_use', present: false },
  ],
  fhx: [
    { code: 'family_history_men1', present: false },
    { code: 'family_history_colorectal_ca', present: false },
  ],
  habits: [
    { code: 'smoking', present: false },
    { code: 'alcohol_heavy', present: false },
    { code: 'occupational_lead_exposure', present: false },
  ],
};

export default VIGNETTE_59M_FATIGUE;
