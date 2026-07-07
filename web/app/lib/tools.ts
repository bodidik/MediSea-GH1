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
  "ecog": { slug: "ecog", name: "ECOG Performans", icon: "🎗️" },
  "gcs": { slug: "gcs", name: "Glasgow Koma Skalası", icon: "🧠" },
  "heart-score": { slug: "heart-score", name: "HEART Skoru", icon: "💔" },
  "child-pugh": { slug: "child-pugh", name: "Child-Pugh", icon: "🍺" },
  "das28": { slug: "das28", name: "DAS28", icon: "🦴" },
  "glasgow-blatchford": { slug: "glasgow-blatchford", name: "Glasgow-Blatchford", icon: "🩸" },
  "ranson": { slug: "ranson", name: "Ranson Kriterleri", icon: "🍺" },
  "kdigo-aki": { slug: "kdigo-aki", name: "KDIGO AKI Evrelemesi", icon: "💧" },
  "psi-port": { slug: "psi-port", name: "PSI/PORT Skoru", icon: "🫁" },
};

// branş slug -> ilgili hesaplayıcı slug'ları (öncelik sırasına göre)
export const BRANCH_TOOLS: Record<string, string[]> = {
  "kardiyoloji": ["heart-score", "chads-vasc", "has-bled", "timi-ua"],
  "nefroloji": ["egfr", "kdigo-aki", "corrected-calcium", "anion-gap", "unit-converter"],
  "endokrinoloji": ["corrected-calcium", "hba1c-eag", "corrected-sodium", "anion-gap", "egfr", "unit-converter"],
  "gastroenteroloji": ["meld-na", "child-pugh", "glasgow-blatchford", "ranson"],
  "enfeksiyon": ["qsofa", "sofa", "curb65", "psi-port", "news2", "endocarditis"],
  "gogus": ["curb65", "psi-port", "wells-pe", "perc"],
  "hematoloji": ["wells-dvt", "has-bled", "glasgow-blatchford"],
  "genel-dahiliye": ["news2", "qsofa", "sofa", "gcs", "infusion", "anion-gap", "corrected-sodium"],
  "romatoloji": ["das28", "sle", "sledai2k"],
  "onkoloji": ["ecog", "bsa", "infusion", "nutrition-needs"],
  "klinik-nutrisyon": ["nrs-2002", "mna", "glim", "nutrition-needs"],
  "palyatif": ["ecog"],
  // "journal-club" için ilişkili bir hesaplayıcı yok — bölüm gizlenir
};

/** Bir branşla ilişkili hesaplayıcıları döner; ilişki yoksa boş dizi (bölüm o zaman gizlenir). */
export function getBranchTools(slug: string): ToolRef[] {
  const slugs = BRANCH_TOOLS[slug] || [];
  return slugs.map((s) => TOOLS[s]).filter(Boolean);
}

/**
 * TERS EŞLEME: bir hesaplayıcının ilişkili olduğu branş slug'larını döner.
 * Araç sayfalarındaki üst navigasyon çubuğunda ("Branş Sayfası" linki) kullanılır.
 * Bir araç birden fazla branşta geçebilir (ör. düzeltilmiş kalsiyum: nefroloji + endokrinoloji).
 */
export function getToolBranchSlugs(toolSlug: string): string[] {
  return Object.entries(BRANCH_TOOLS)
    .filter(([, tools]) => tools.includes(toolSlug))
    .map(([branchSlug]) => branchSlug);
}
