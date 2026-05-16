// FILE: server/utils/section.map.js
// Amaç: Farklı kaynakların bölüm adlarını tek standarda indirgemek.
// KayseriTIP gibi kaynaklarda sık kullanılan varyantları kapsar.

// Standart isimler: Cardiology, Nephrology, Gastroenterology, Endocrinology,
// Infectious Diseases, Pulmonology, Rheumatology, Hematology, Oncology,
// Neurology, Dermatology, Endocrinology, etc.

const STANDARD = {
  cardiology: "Cardiology",
  nephrology: "Nephrology",
  gastroenterology: "Gastroenterology",
  endocrinology: "Endocrinology",
  "infectious diseases": "Infectious Diseases",
  pulmonology: "Pulmonology",
  rheumatology: "Rheumatology",
  hematology: "Hematology",
  oncology: "Oncology",
  neurology: "Neurology",
  dermatology: "Dermatology",
};

// Alias havuzu (sol taraf normalize lower-case ifade, sağ taraf STANDARD anahtarı):
const ALIASES = new Map(
  [
    // Cardiology
    ["kardiyoloji", "cardiology"],
    ["iskemik kalp", "cardiology"],
    ["kalp yetersizliği", "cardiology"],
    ["ky", "cardiology"],
    ["af", "cardiology"],
    // Nephrology
    ["nefroloji", "nephrology"],
    ["böbrek", "nephrology"],
    ["renal", "nephrology"],
    ["htn", "nephrology"],
    ["hipertansiyon", "nephrology"],
    // Gastro
    ["gastroenteroloji", "gastroenterology"],
    ["gi", "gastroenterology"],
    ["hepatoloji", "gastroenterology"],
    ["üst gis", "gastroenterology"],
    ["alt gis", "gastroenterology"],
    // Endocrine
    ["endokrin", "endocrinology"],
    ["diabet", "endocrinology"],
    ["diyabet", "endocrinology"],
    ["tiroid", "endocrinology"],
    // ID
    ["enfeksiyon", "infectious diseases"],
    ["infeksiyon", "infectious diseases"],
    ["id", "infectious diseases"],
    ["sepsis", "infectious diseases"],
    // Pulmo
    ["pulmonoloji", "pulmonology"],
    ["akc", "pulmonology"],
    ["pnömoni", "pulmonology"],
    ["pnomoni", "pulmonology"],
    ["tb", "pulmonology"],
    // Rheum
    ["romatoloji", "rheumatology"],
    ["vaskülit", "rheumatology"],
    ["vaskulit", "rheumatology"],
    ["behçet", "rheumatology"],
    ["behcet", "rheumatology"],
    // Heme
    ["hematoloji", "hematology"],
    ["anemi", "hematology"],
    // Onco
    ["onkoloji", "oncology"],
    ["kanser", "oncology"],
    // Neuro
    ["nöroloji", "neurology"],
    ["noroloji", "neurology"],
    ["inme", "neurology"],
    ["stroke", "neurology"],
    ["epilepsi", "neurology"],
    // Derm
    ["dermatoloji", "dermatology"],
    ["ilaç döküntüleri", "dermatology"],
    ["sjs", "dermatology"],
    ["ten", "dermatology"],
  ].map(([k, v]) => [k.toLowerCase(), v])
);

// Dışa tek fonksiyon: kaynağa gelen section başlığını normalize et
export function normalizeSection(input) {
  if (!input || typeof input !== "string") return "";
  const raw = input.trim().toLowerCase();

  // 1) Direkt STANDARD eşleşmesi
  if (STANDARD[raw]) return STANDARD[raw];

  // 2) Alias ile eşleşme
  const ali = ALIASES.get(raw);
  if (ali && STANDARD[ali]) return STANDARD[ali];

  // 3) İçeren anahtar (ör. 'üst gis kanama' -> gastroenterology)
  for (const [key, to] of ALIASES.entries()) {
    if (raw.includes(key)) {
      const std = STANDARD[to];
      if (std) return std;
    }
  }

  // 4) Baş harf/kelime benzerlikleri (çok agresif olmadan)
  // Örn. 'kardiyo', 'nefro', 'gastro' gibi kökler:
  const heuristics = [
    [/kardiyo/, "cardiology"],
    [/nefro/, "nephrology"],
    [/gastro|gis/, "gastroenterology"],
    [/endo|tiroid|dm|di(y|a)bet/, "endocrinology"],
    [/infeks|enfeks|sepsis|id\b/, "infectious diseases"],
    [/pulmo|akc|pn[öo]moni|tb/, "pulmonology"],
    [/romat|vask[üu]lit|beh(c|ç)et/, "rheumatology"],
    [/hemat|anemi/, "hematology"],
    [/onko|kanser/, "oncology"],
    [/n(ö|o)ro|stroke|inme|epilepsi/, "neurology"],
    [/derma|d(ö|o)k(ü|u)nt(ü|u)|sjs|ten/, "dermatology"],
  ];
  for (const [re, to] of heuristics) {
    if (re.test(raw)) {
      const std = STANDARD[to];
      if (std) return std;
    }
  }

  // 5) Değiştirmeden iade (log tarafında izleriz)
  return input.trim();
}
