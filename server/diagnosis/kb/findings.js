// FILE: server/diagnosis/kb/findings.js
//
// Bulgu sözlüğü. Katman 1 (metin -> yapılandırılmış bulgu) yalnızca buradaki
// kodları üretebilir; motor tanımadığı kodu sessizce yutmaz, uyarı döndürür.
//
// axis: 'manifestation' (varsayilan) | 'risk'
//   manifestation : hastaligin BELIRTISI. Taninin bunu aciklamasi beklenir;
//                   aciklamiyorsa tekillik cezasi alir.
//   risk          : hastaligin ON KOSULU (soygecmis, meslek, ilac, aliskanlik).
//                   Olasiligi yukseltir ama ACIKLANMASI GEREKMEZ. Meslegi
//                   aciklamadigi icin bir taniyi cezalandirmak yanlistir.
//
// cluster: birbiriyle korele bulgular. Naif Bayes bunlari bagimsiz sayip ayni
//   kaniti iki kez toplar; motor ayni kumeden gelen ikinci ve sonraki bulgulari
//   indirimli uygular (bkz. engine.js CLUSTER_DISCOUNT).
//
// system: fizik muayene sistemi. "Batin muayenesi normal" denildiginde o
//   sistemin tum bulgulari YOK sayilir (bkz. intake.js). Muayene edilmemis
//   sistem ise BILINMIYOR kalir - ikisi ayni sey degildir.

export const FINDINGS = {
  // ======================= HİKÂYE (semptomlar) =======================
  fatigue: { label: 'Yorgunluk', box: 'hpi' },
  weight_loss: { label: 'İstemsiz kilo kaybı', box: 'hpi' },
  weight_gain: { label: 'Kilo alımı', box: 'hpi' },
  anorexia: { label: 'İştahsızlık', box: 'hpi' },
  fever: { label: 'Ateş', box: 'hpi' },
  muscle_weakness: { label: 'Kas güçsüzlüğü', box: 'hpi' },
  chest_pain: { label: 'Göğüs ağrısı', box: 'hpi' },
  bone_pain: { label: 'Kemik ağrısı', box: 'hpi' },

  abdominal_pain_upper: { label: 'Üst karın ağrısı', box: 'hpi', cluster: 'dyspepsia' },
  heartburn: { label: 'Retrosternal yanma', box: 'hpi', cluster: 'dyspepsia' },
  early_satiety: { label: 'Erken doyma', box: 'hpi', cluster: 'dyspepsia' },
  bloating: { label: 'Şişkinlik', box: 'hpi', cluster: 'dyspepsia' },
  vomiting: { label: 'Kusma', box: 'hpi' },

  constipation: { label: 'Kabızlık', box: 'hpi' },
  diarrhea: { label: 'İshal', box: 'hpi' },
  steatorrhea: { label: 'Yağlı dışkılama', box: 'hpi' },
  melena: { label: 'Melena / GİS kanaması', box: 'hpi' },
  pain_relief_with_defecation: { label: 'Ağrının dışkılamayla geçmesi', box: 'hpi' },

  cognitive_impairment: { label: 'Kognitif bozulma / zihin bulanıklığı', box: 'hpi' },
  depressed_mood: { label: 'Çökkün duygudurum', box: 'hpi', cluster: 'mood' },
  anhedonia: { label: 'Anhedoni', box: 'hpi', cluster: 'mood' },
  paresthesia: { label: 'Parestezi', box: 'hpi', cluster: 'periph_neuro' },

  polyuria: { label: 'Poliüri', box: 'hpi', cluster: 'osmotic' },
  polydipsia: { label: 'Polidipsi', box: 'hpi', cluster: 'osmotic' },
  nocturia: { label: 'Noktüri', box: 'hpi', cluster: 'osmotic' },

  cold_intolerance: { label: 'Soğuk intoleransı', box: 'hpi', cluster: 'hypothyroid_sx' },
  salt_craving: { label: 'Tuz isteği', box: 'hpi' },
  orthostatic_dizziness: { label: 'Ortostatik baş dönmesi', box: 'hpi' },
  snoring: { label: 'Horlama', box: 'hpi', cluster: 'sleep' },
  daytime_somnolence: { label: 'Gündüz uykululuğu', box: 'hpi', cluster: 'sleep' },

  // ======================= FİZİK MUAYENE (bulgular) =======================
  pallor: { label: 'Solukluk', box: 'exam', system: 'general' },
  edema: { label: 'Ödem', box: 'exam', system: 'general' },
  obesity_bmi_high: { label: 'Obezite (BKİ yüksek)', box: 'exam', system: 'general' },

  dry_skin: { label: 'Kuru cilt', box: 'exam', system: 'skin', cluster: 'hypothyroid_sx' },
  hair_loss: { label: 'Saç dökülmesi', box: 'exam', system: 'skin', cluster: 'hypothyroid_sx' },
  hyperpigmentation: { label: 'Hiperpigmentasyon', box: 'exam', system: 'skin' },
  gingival_lead_line: { label: 'Diş eti kurşun çizgisi', box: 'exam', system: 'skin' },

  goiter: { label: 'Guatr', box: 'exam', system: 'neck' },

  epigastric_tenderness: { label: 'Epigastrik hassasiyet', box: 'exam', system: 'abdomen', cluster: 'dyspepsia' },
  abdominal_mass: { label: 'Batında kitle', box: 'exam', system: 'abdomen' },
  hepatomegaly: { label: 'Hepatomegali', box: 'exam', system: 'abdomen' },
  costovertebral_tenderness: { label: 'Kostovertebral açı hassasiyeti', box: 'exam', system: 'abdomen' },

  gait_ataxia: { label: 'Yürüyüş ataksisi', box: 'exam', system: 'neuro', cluster: 'periph_neuro' },
  reduced_vibration_sense: { label: 'Vibrasyon duyusunda azalma', box: 'exam', system: 'neuro', cluster: 'periph_neuro' },
  absent_ankle_reflex: { label: 'Aşil refleksi alınamıyor', box: 'exam', system: 'neuro', cluster: 'periph_neuro' },
  wrist_drop: { label: 'Düşük el', box: 'exam', system: 'neuro' },
  delayed_relaxation_reflex: { label: 'Reflekste geç gevşeme', box: 'exam', system: 'neuro' },

  orthostatic_hypotension: { label: 'Ortostatik hipotansiyon', box: 'exam', system: 'cardiovascular' },

  // ======================= ÖZGEÇMİŞ =======================
  // Dikkat: ozgecmisteki her sey "risk" degildir. Bobrek tasi oykusu ayni
  // hastalik surecinin BELIRTISIDIR; taninin onu aciklamasi beklenir.
  nephrolithiasis_history: { label: 'Böbrek taşı öyküsü', box: 'pmh' },
  fragility_fracture: { label: 'Kırılganlık kırığı öyküsü', box: 'pmh' },

  peptic_ulcer_history: { label: 'Peptik ülser öyküsü', box: 'pmh', axis: 'risk' },
  gastric_surgery_history: { label: 'Mide cerrahisi öyküsü', box: 'pmh', axis: 'risk' },
  autoimmune_disease_history: { label: 'Otoimmün hastalık öyküsü', box: 'pmh', axis: 'risk' },
  hypertension_history: { label: 'Hipertansiyon öyküsü', box: 'pmh', axis: 'risk' },
  depression_history: { label: 'Depresyon öyküsü', box: 'pmh', axis: 'risk' },

  // ======================= İLAÇLAR =======================
  thiazide_use: { label: 'Tiyazid diüretik kullanımı', box: 'meds', axis: 'risk' },
  lithium_use: { label: 'Lityum kullanımı', box: 'meds', axis: 'risk' },
  ppi_chronic_use: { label: 'Kronik PPI kullanımı', box: 'meds', axis: 'risk' },
  calcium_vitd_supplement: { label: 'Kalsiyum / D vitamini takviyesi', box: 'meds', axis: 'risk' },

  // ======================= SOYGEÇMİŞ =======================
  family_history_colorectal_ca: { label: 'Ailede kolorektal kanser', box: 'fhx', axis: 'risk' },
  family_history_men1: { label: 'Ailede MEN1 / hiperparatiroidi', box: 'fhx', axis: 'risk' },
  family_history_thyroid_disease: { label: 'Ailede tiroid hastalığı', box: 'fhx', axis: 'risk' },
  family_history_celiac: { label: 'Ailede çölyak', box: 'fhx', axis: 'risk' },

  // ======================= ALIŞKANLIKLAR =======================
  occupational_lead_exposure: { label: 'Mesleki kurşun maruziyeti', box: 'habits', axis: 'risk' },
  alcohol_heavy: { label: 'Ağır alkol kullanımı', box: 'habits', axis: 'risk' },
  smoking: { label: 'Sigara kullanımı', box: 'habits', axis: 'risk' },

  // ======================= TEDAVİ DENEMELERİ =======================
  // Tedaviye yanit BELIRTIDIR, risk degil: mevcut hastalik hakkinda dogrudan
  // kanit tasir ve bedava bir tanisal testtir.
  ppi_trial_failed: { label: 'PPI tedavisine yanıtsızlık', box: 'hpi' },
  laxative_trial_failed: { label: 'Laksatife yanıtsızlık', box: 'hpi' },
};

export const FINDING_IDS = Object.keys(FINDINGS);

/** Muayene sistemleri: "sistem normal" denince yok sayilacak bulgu kumeleri. */
export const EXAM_SYSTEMS = [...new Set(
  FINDING_IDS.map((id) => FINDINGS[id].system).filter(Boolean),
)];

export const isRiskFactor = (findingId) => FINDINGS[findingId]?.axis === 'risk';
