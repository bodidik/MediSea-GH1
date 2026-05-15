"C:\Users\hucig\Medknowledge\web\app\lib\i18n.ts"
"use client";

/**
 * Basit i18n yardÄ±mcÄ±larÄ±
 * - Lang tipi
 * - dict: TR/EN sÃ¶zlÃ¼kleri (geniÅŸletilmiÅŸ)
 * - getLangFromCookie / setLang
 * - t(key) anahtarÄ±
 *
 * Not: Eksik anahtarlar iÃ§in key geri dÃ¶ner; UI kÄ±rÄ±lmaz.
 */

export type Lang = "tr" | "en";

type Dict = Record<string, string>;

const tr: Dict = {
  // ---- Genel / Navbar / Footer
  appTitle: "Medknowledge",
  appSubtitle: "Ä°Ã§ hastalÄ±klarÄ± eÄŸitim ve sÄ±nav platformu",
  home: "Ana sayfa",
  sections: "BÃ¶lÃ¼mler",
  summary: "Ã–zet",
  latestItems: "Son eklenenler",
  search: "Ara",
  back: "Geri",
  save: "Kaydet",
  cancel: "Ä°ptal",
  close: "Kapat",
  loading: "YÃ¼kleniyorâ€¦",
  error: "BaÄŸlantÄ± hatasÄ±",
  ok: "Tamam",

  // ---- SayaÃ§ / Toplamlar
  platformSummary: "Platform Ã–zeti",
  totalsAndPlan: "Toplam iÃ§erik & plan",
  topics: "Topikler",
  board: "Board",
  cases: "Vaka",
  videos: "Video",
  notes: "Not",
  plan: "Plan",

  // ---- BÃ¶lÃ¼mler listesi
  sectionCountsTitle: "BÃ¶lÃ¼m BazlÄ± Ä°Ã§erik SayÄ±larÄ±",
  sectionCountsDesc: "Toplamlara gÃ¶re sÄ±ralÄ± gÃ¶rÃ¼nÃ¼m",
  sectionDetail: "BÃ¶lÃ¼m DetayÄ±",
  total: "Toplam",
  updatedAt: "GÃ¼ncelleme",

  // ---- Dil anahtarlarÄ±
  tr: "TÃ¼rkÃ§e",
  en: "Ä°ngilizce",

  // ---- Premium / Plan / Rozetler
  premiumPageTitle: "MediSea Premium",
  premiumPageSubtitle: "KiÅŸiselleÅŸtirilmiÅŸ ilerleme, rozetler ve premium Ã¶zetler",
  progressBadges: "Ä°lerleme ve Rozetler",
  progressBadgesDesc: "Ã‡alÄ±ÅŸma alÄ±ÅŸkanlÄ±ÄŸÄ±na gÃ¶re rozet seviyelerin hesaplanÄ±r",
  todaysSummary: "BugÃ¼nÃ¼n Ã–zeti",
  goal20: "Hedef: en az 20 soru",
  continueStudy: "Ã‡alÄ±ÅŸmaya devam et",
  roadmap: "Yol HaritasÄ±",
  rewards: "Ã–dÃ¼ller",
  upgradePlan: "PlanÄ± YÃ¼kselt",
  upgraded: "Plan yÃ¼kseltildi",
  lockedPremium: "Premium iÃ§erikler kilitli. YÃ¼kselterek aÃ§abilirsin.",
  premiumOnly: "Bu iÃ§erik sadece Premium ve Ã¼zeri planlarda eriÅŸilebilir.",
  open: "AÃ§",
  seeMore: "Daha fazla",
  points: "Puan",
  solved: "Ã‡Ã¶zÃ¼len",
  streak: "Seri",
  accuracy: "DoÄŸruluk",
  percentile: "Ãœst %",
  today: "BugÃ¼n",

  // ---- Quiz
  quiz: "Quiz",
  dailyQuiz: "GÃ¼nlÃ¼k Quiz",
  startQuiz: "Quize baÅŸla",
  submit: "GÃ¶nder",
  correct: "DoÄŸru",
  wrong: "YanlÄ±ÅŸ",
  later: "Sonra",
  explanation: "AÃ§Ä±klama",
  showExplanation: "AÃ§Ä±klamayÄ± gÃ¶r",
  hideExplanation: "AÃ§Ä±klamayÄ± gizle",
  nextQuestion: "Yeni soruya geÃ§",
  openTopic: "Konu anlatÄ±mÄ±nÄ± aÃ§",
  choices: "ÅÄ±klar",

  // ---- SR (Spaced Repetition / Review)
  review: "Tekrar",
  reviewDaily: "GÃ¼nlÃ¼k Tekrar",
  due: "Vadesi gelen",
  noDueCards: "Åu an iÃ§in vadesi gelen kart yok.",
  addToSR: "SR'ye ekle",
  added: "Eklendi",
  srLater: "Sonra",
  srWrong: "YanlÄ±ÅŸ",
  srCorrect: "DoÄŸru",
  progress: "Ä°lerleme",
  filters: "Filtreler",
  typeAll: "TÃ¼r: Hepsi",
  section: "BÃ¶lÃ¼m",
  type: "TÃ¼r",
  startDate: "BaÅŸlangÄ±Ã§",
  endDate: "BitiÅŸ",
  refresh: "Yenile",

  // ---- Programs (TUS/YDUS/USMLE)
  programs: "Programlar",
  program: "Program",
  enroll: "Programa katÄ±l",
  enrolled: "KayÄ±tlÄ±",
  notEnrolled: "KayÄ±tlÄ± deÄŸil",
  progressShort: "Ä°lerleme",
  days: "gÃ¼n",
  day: "gÃ¼n",
  complete: "TamamlandÄ±",
  continue: "Devam et",
  tickDone: "BugÃ¼nÃ¼ iÅŸaretle",
  programEndsAt: "BitiÅŸ",
  programStartedAt: "BaÅŸlangÄ±Ã§",
  trackTUS: "TUS",
  trackYDUS: "YDUS",
  trackUSMLE: "USMLE",

  // ---- Tools (Hesaplama araÃ§larÄ±)
  tools: "AraÃ§lar",
  calculators: "HesaplayÄ±cÄ±lar",
  openCalculator: "HesaplayÄ±cÄ±yÄ± aÃ§",
  ckdEpi: "CKD-EPI (GFR)",
  correctedCalcium: "DÃ¼zeltilmiÅŸ kalsiyum",
  unitConverters: "Birim Ã§eviriciler",
  mgdlToMmoll: "mg/dL â†’ mmol/L",
  sleScore: "SLE PuanÄ±",
  dukeIE: "Enfektif Endokardit (Duke)",
  infusionCalc: "Ä°nfÃ¼zyon hesaplarÄ±",

  // ---- Admin
  admin: "YÃ¶netim",
  audit: "Denetim",
  sectionAuditReport: "BÃ¶lÃ¼m EÅŸleme Raporu",
  generate: "OluÅŸtur",
  details: "Detaylar",
  none: "KayÄ±t bulunmuyor.",

  // ---- KayseriTIP
  kayseritip: "KayseriTIP",
  facultyUploads: "Hoca yÃ¼klemeleri",
  pptSlides: "Sunum slaytlarÄ±",
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


