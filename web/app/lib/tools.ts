// Klinik hesaplayıcıların (app/tools/*) branşlara göre eşlemesi.
// Tek kaynak: hem branş sayfası (app/(site)/topics/[slug]/page.tsx) hem de
// ileride başka yerler BURADAN okur — slug'lar gerçek app/tools/<slug> klasörleriyle
// birebir eşleşmelidir (kırık link üretmemek için).

export type ToolRef = { slug: string; name: string; icon: string };

export const TOOLS: Record<string, ToolRef> = {
  "wells-pe": { slug: "wells-pe", name: "Wells (PE)", icon: "🔍" },
  "wells-dvt": { slug: "wells-dvt", name: "Wells (DVT)", icon: "🦵" },
  "chads-vasc": { slug: "chads-vasc", name: "CHA₂DS₂-VASc", icon: "❤️" },
  "has-bled": { slug: "has-bled", name: "HAS-BLED", icon: "🩸" },
  "timi-ua": { slug: "timi-ua", name: "TIMI (UA/NSTEMI)", icon: "💔" },
  "egfr": { slug: "egfr", name: "eGFR (2021)", icon: "🧪" },
  "corrected-calcium": { slug: "corrected-calcium", name: "Düzeltilmiş Kalsiyum", icon: "🥛" },
  "meld-na": { slug: "meld-na", name: "MELD-Na", icon: "🫁" },
  "news2": { slug: "news2", name: "NEWS2", icon: "🚨" },
  "qsofa": { slug: "qsofa", name: "qSOFA", icon: "🩺" },
  "sofa": { slug: "sofa", name: "SOFA", icon: "🏥" },
  "perc": { slug: "perc", name: "PERC", icon: "🫁" },
  "curb65": { slug: "curb65", name: "CURB-65", icon: "🫁" },
  "endocarditis": { slug: "endocarditis", name: "Duke Kriterleri", icon: "🦠" },
  "infusion": { slug: "infusion", name: "İnfüzyon Hesabı", icon: "💉" },
  "unit-converter": { slug: "unit-converter", name: "Birim Çevirici", icon: "🔄" },
  "sle": { slug: "sle", name: "SLE Kriterleri", icon: "🦴" },
  "sledai2k": { slug: "sledai2k", name: "SLEDAI-2K", icon: "📊" },
  "nrs-2002": { slug: "nrs-2002", name: "NRS-2002", icon: "📋" },
  "mna": { slug: "mna", name: "MNA (Kısa Form)", icon: "🍽️" },
  "glim": { slug: "glim", name: "GLIM Kriterleri", icon: "⚖️" },
  "nutrition-needs": { slug: "nutrition-needs", name: "Enerji & Protein", icon: "🍏" },
  "anion-gap": { slug: "anion-gap", name: "Anyon Açığı", icon: "🧬" },
  "corrected-sodium": { slug: "corrected-sodium", name: "Düzeltilmiş Sodyum", icon: "🧂" },
  "hba1c-eag": { slug: "hba1c-eag", name: "HbA1c → Ort. Glukoz", icon: "📈" },
  "bsa": { slug: "bsa", name: "Vücut Yüzey Alanı", icon: "📐" },
};

// branş slug -> ilgili hesaplayıcı slug'ları (öncelik sırasına göre)
export const BRANCH_TOOLS: Record<string, string[]> = {
  "kardiyoloji": ["chads-vasc", "has-bled", "timi-ua"],
  "nefroloji": ["egfr", "corrected-calcium", "anion-gap", "unit-converter"],
  "endokrinoloji": ["corrected-calcium", "hba1c-eag", "corrected-sodium", "anion-gap", "egfr", "unit-converter"],
  "gastroenteroloji": ["meld-na"],
  "enfeksiyon": ["qsofa", "sofa", "curb65", "news2", "endocarditis"],
  "gogus": ["wells-pe", "perc", "curb65"],
  "hematoloji": ["wells-dvt", "has-bled"],
  "genel-dahiliye": ["news2", "qsofa", "sofa", "infusion", "anion-gap", "corrected-sodium"],
  "romatoloji": ["sle", "sledai2k"],
  "onkoloji": ["bsa", "infusion", "nutrition-needs"],
  "klinik-nutrisyon": ["nrs-2002", "mna", "glim", "nutrition-needs"],
  // "palyatif" ve "journal-club" için henüz ilişkili bir hesaplayıcı yok — bölüm gizlenir
};

/** Bir branşla ilişkili hesaplayıcıları döner; ilişki yoksa boş dizi (bölüm o zaman gizlenir). */
export function getBranchTools(slug: string): ToolRef[] {
  const slugs = BRANCH_TOOLS[slug] || [];
  return slugs.map((s) => TOOLS[s]).filter(Boolean);
}
