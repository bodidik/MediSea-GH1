"use client";

/**
 * Basit i18n yardımcıları
 * - Lang tipi
 * - dict: TR/EN sözlükleri (genişletilmiş)
 * - getLangFromCookie / setLang
 * - t(key) anahtarı
 *
 * Not: Eksik anahtarlar için key geri döner; UI kırılmaz.
 */

export type Lang = "tr" | "en";

type Dict = Record<string, string>;

const tr: Dict = {
  // ---- Genel / Navbar / Footer
  appTitle: "Medknowledge",
  appSubtitle: "İç hastalıkları eğitim ve sınav platformu",
  home: "Ana sayfa",
  sections: "Bölümler",
  summary: "Özet",
  latestItems: "Son eklenenler",
  search: "Ara",
  back: "Geri",
  save: "Kaydet",
  cancel: "İptal",
  close: "Kapat",
  loading: "Yükleniyor…",
  error: "Bağlantı hatası",
  ok: "Tamam",

  // ---- Sayaç / Toplamlar
  platformSummary: "Platform Özeti",
  totalsAndPlan: "Toplam içerik & plan",
  topics: "Topikler",
  board: "Board",
  cases: "Vaka",
  videos: "Video",
  notes: "Not",
  plan: "Plan",

  // ---- Bölümler listesi
  sectionCountsTitle: "Bölüm Bazlı İçerik Sayıları",
  sectionCountsDesc: "Toplamlara göre sıralı görünüm",
  sectionDetail: "Bölüm Detayı",
  total: "Toplam",
  updatedAt: "Güncelleme",

  // ---- Dil anahtarları
  tr: "Türkçe",
  en: "İngilizce",

  // ---- Premium / Plan / Rozetler
  premiumPageTitle: "MediSea Premium",
  premiumPageSubtitle: "Kişiselleştirilmiş ilerleme, rozetler ve premium özetler",
  progressBadges: "İlerleme ve Rozetler",
  progressBadgesDesc: "Çalışma alışkanlığına göre rozet seviyelerin hesaplanır",
  todaysSummary: "Bugünün Özeti",
  goal20: "Hedef: en az 20 soru",
  continueStudy: "Çalışmaya devam et",
  roadmap: "Yol Haritası",
  rewards: "Ödüller",
  upgradePlan: "Planı Yükselt",
  upgraded: "Plan yükseltildi",
  lockedPremium: "Premium içerikler kilitli. Yükselterek açabilirsin.",
  premiumOnly: "Bu içerik sadece Premium ve üzeri planlarda erişilebilir.",
  open: "Aç",
  seeMore: "Daha fazla",
  points: "Puan",
  solved: "Çözülen",
  streak: "Seri",
  accuracy: "Doğruluk",
  percentile: "Üst %",
  today: "Bugün",

  // ---- Quiz
  quiz: "Quiz",
  dailyQuiz: "Günlük Quiz",
  startQuiz: "Quize başla",
  submit: "Gönder",
  correct: "Doğru",
  wrong: "Yanlış",
  later: "Sonra",
  explanation: "Açıklama",
  showExplanation: "Açıklamayı gör",
  hideExplanation: "Açıklamayı gizle",
  nextQuestion: "Yeni soruya geç",
  openTopic: "Konu anlatımını aç",
  choices: "Şıklar",

  // ---- SR (Spaced Repetition / Review)
  review: "Tekrar",
  reviewDaily: "Günlük Tekrar",
  due: "Vadesi gelen",
  noDueCards: "Şu an için vadesi gelen kart yok.",
  addToSR: "SR'ye ekle",
  added: "Eklendi",
  srLater: "Sonra",
  srWrong: "Yanlış",
  srCorrect: "Doğru",
  progress: "İlerleme",
  filters: "Filtreler",
  typeAll: "Tür: Hepsi",
  section: "Bölüm",
  type: "Tür",
  startDate: "Başlangıç",
  endDate: "Bitiş",
  refresh: "Yenile",

  // ---- Programs (TUS/YDUS/USMLE)
  programs: "Programlar",
  program: "Program",
  enroll: "Programa katıl",
  enrolled: "Kayıtlı",
  notEnrolled: "Kayıtlı değil",
  progressShort: "İlerleme",
  days: "gün",
  day: "gün",
  complete: "Tamamlandı",
  continue: "Devam et",
  tickDone: "Bugünü işaretle",
  programEndsAt: "Bitiş",
  programStartedAt: "Başlangıç",
  trackTUS: "TUS",
  trackYDUS: "YDUS",
  trackUSMLE: "USMLE",

  // ---- Tools (Hesaplama araçları)
  tools: "Araçlar",
  calculators: "Hesaplayıcılar",
  openCalculator: "Hesaplayıcıyı aç",
  ckdEpi: "CKD-EPI (GFR)",
  correctedCalcium: "Düzeltilmiş kalsiyum",
  unitConverters: "Birim çeviriciler",
  mgdlToMmoll: "mg/dL â†’ mmol/L",
  sleScore: "SLE Puanı",
  dukeIE: "Enfektif Endokardit (Duke)",
  infusionCalc: "İnfüzyon hesapları",

  // ---- Admin
  admin: "Yönetim",
  audit: "Denetim",
  sectionAuditReport: "Bölüm Eşleme Raporu",
  generate: "Oluştur",
  details: "Detaylar",
  none: "Kayıt bulunmuyor.",

  // ---- KayseriTIP
  kayseritip: "KayseriTIP",
  facultyUploads: "Hoca yüklemeleri",
  pptSlides: "Sunum slaytları",
  pdfNotes: "PDF notlar",
  externalLink: "Harici link",
};

const en: Dict = {
  // ---- General / Navbar / Footer
  appTitle: "Medknowledge",
  appSubtitle: "Internal medicine learning & exam platform",
  home: "Home",
  sections: "Sections",
  summary: "Summary",
  latestItems: "Latest items",
  search: "Search",
  back: "Back",
  save: "Save",
  cancel: "Cancel",
  close: "Close",
  loading: "Loadingâ€¦",
  error: "Connection error",
  ok: "OK",

  // ---- Counters / Totals
  platformSummary: "Platform Summary",
  totalsAndPlan: "Totals & plan",
  topics: "Topics",
  board: "Board",
  cases: "Cases",
  videos: "Videos",
  notes: "Notes",
  plan: "Plan",

  // ---- Sections list
  sectionCountsTitle: "Section-Based Content Counts",
  sectionCountsDesc: "Sorted by totals",
  sectionDetail: "Section Detail",
  total: "Total",
  updatedAt: "Updated",

  // ---- Language
  tr: "Turkish",
  en: "English",

  // ---- Premium / Plan / Badges
  premiumPageTitle: "MediSea Premium",
  premiumPageSubtitle: "Personalized progress, badges and premium summaries",
  progressBadges: "Progress & Badges",
  progressBadgesDesc: "Badge levels based on study habits",
  todaysSummary: "Today's Summary",
  goal20: "Goal: at least 20 questions",
  continueStudy: "Continue study",
  roadmap: "Roadmap",
  rewards: "Rewards",
  upgradePlan: "Upgrade Plan",
  upgraded: "Plan upgraded",
  lockedPremium: "Premium content is locked. Upgrade to unlock.",
  premiumOnly: "Accessible on Premium (and above) only.",
  open: "Open",
  seeMore: "See more",
  points: "Points",
  solved: "Solved",
  streak: "Streak",
  accuracy: "Accuracy",
  percentile: "Top %",
  today: "Today",

  // ---- Quiz
  quiz: "Quiz",
  dailyQuiz: "Daily Quiz",
  startQuiz: "Start quiz",
  submit: "Submit",
  correct: "Correct",
  wrong: "Wrong",
  later: "Later",
  explanation: "Explanation",
  showExplanation: "Show explanation",
  hideExplanation: "Hide explanation",
  nextQuestion: "Next question",
  openTopic: "Open topic",
  choices: "Choices",

  // ---- SR (Spaced Repetition / Review)
  review: "Review",
  reviewDaily: "Daily Review",
  due: "Due",
  noDueCards: "No due cards at the moment.",
  addToSR: "Add to SR",
  added: "Added",
  srLater: "Later",
  srWrong: "Wrong",
  srCorrect: "Correct",
  progress: "Progress",
  filters: "Filters",
  typeAll: "Type: All",
  section: "Section",
  type: "Type",
  startDate: "Start",
  endDate: "End",
  refresh: "Refresh",

  // ---- Programs (TUS/YDUS/USMLE)
  programs: "Programs",
  program: "Program",
  enroll: "Enroll",
  enrolled: "Enrolled",
  notEnrolled: "Not enrolled",
  progressShort: "Progress",
  days: "days",
  day: "day",
  complete: "Completed",
  continue: "Continue",
  tickDone: "Mark today",
  programEndsAt: "Ends",
  programStartedAt: "Started",
  trackTUS: "TUS",
  trackYDUS: "YDUS",
  trackUSMLE: "USMLE",

  // ---- Tools (Calculators)
  tools: "Tools",
  calculators: "Calculators",
  openCalculator: "Open calculator",
  ckdEpi: "CKD-EPI (GFR)",
  correctedCalcium: "Corrected calcium",
  unitConverters: "Unit converters",
  mgdlToMmoll: "mg/dL â†’ mmol/L",
  sleScore: "SLE Score",
  dukeIE: "Infective Endocarditis (Duke)",
  infusionCalc: "Infusion calculators",

  // ---- Admin
  admin: "Admin",
  audit: "Audit",
  sectionAuditReport: "Section Mapping Report",
  generate: "Generate",
  details: "Details",
  none: "No records.",

  // ---- KayseriTIP
  kayseritip: "KayseriTIP",
  facultyUploads: "Faculty uploads",
  pptSlides: "Slides (PPT)",
  pdfNotes: "PDF notes",
  externalLink: "External link",
};

const dict: Record<Lang, Dict> = { tr, en };

export function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "tr";
  const m = document.cookie.match(/(?:^|; )mk_lang=([^;]+)/);
  const val = (m?.[1] as Lang) || "tr";
  return val === "en" ? "en" : "tr";
}

export function t(key: string, lang?: Lang) {
  const l = lang || getLangFromCookie();
  const value = dict[l][key];
  return value ?? key;
}

export function setLang(lang: Lang) {
  if (typeof document === "undefined") return;
  // 1 yıl, path=/, SameSite=Lax
  document.cookie = `mk_lang=${lang}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}


