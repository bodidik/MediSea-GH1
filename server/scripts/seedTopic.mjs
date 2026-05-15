// Basit toplu seed scripti (ESM).
// Çalıştırma örnekleri:
//   node server/scripts/seedTopic.mjs
//   node server/scripts/seedTopic.mjs http://127.0.0.1:4000
//
// İstersen harici JSON dosyasından da besleyebilirsin:
//   node server/scripts/seedTopic.mjs --file C:/path/payload.json
//
// Not: Node 18+ sürümlerinde fetch global olarak mevcuttur.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_API = "http://127.0.0.1:4000";
const argApi = process.argv.find((a) => /^https?:\/\//i.test(a));
const apiBase = argApi || DEFAULT_API;

const fileFlagIndex = process.argv.findIndex((a) => a === "--file");
const filePath = fileFlagIndex >= 0 ? process.argv[fileFlagIndex + 1] : null;

function samplePayload() {
  return {
    overwrite: true,
    items: [
      {
        title: "Glomerülonefritler",
        slug: "glomerulonefritler",
        section: "nefroloji",
        content:
          "Glomerülonefritler; klinik spektrum, nefritik/nefrotik sunum ve biyopsi sınıflarıyla incelenir.",
        subtopics: [
          { title: "Membranöz glomerülonefrit", slug: "membranoz", content: "PLA2R ilişkisi…" },
          { title: "IgA nefropatisi", slug: "iga-nefropatisi", content: "Berger hastalığı, hematuri…" },
          { title: "Hızlı ilerleyen GN", slug: "crescentic-gn", content: "ANCA/anti-GBM ilişkisi…" }
        ],
        relatedTopics: ["diyabetik-nefropati"],
        references: ["KDIGO 2021", "Harrison 21e"]
      },
      {
        title: "Diyabetik nefropati",
        slug: "diyabetik-nefropati",
        section: "nefroloji",
        content: "Mikroalbüminüri → makroalbüminüri progresyonu, RAAS blokajı temeli.",
        subtopics: [
          { title: "Tarama ve tanı", slug: "tarama-tani", content: "Yıllık UACR, eGFR izlem…" },
          { title: "Tedavi", slug: "tedavi", content: "RAAS, SGLT2, nonsteroidal MRA…" }
        ],
        relatedTopics: ["glomerulonefritler"],
        references: ["ADA 2024", "KDIGO Diabetes in CKD 2022"]
      },
      {
        title: "İnflamatuvar barsak hastalıkları",
        slug: "ibh",
        section: "gastroenteroloji",
        content: "Crohn ve ÜK; lokalizasyon, davranış ve aktivite endeksleri.",
        subtopics: [
          { title: "Ülseratif kolit", slug: "ulk", content: "E2/E3 yaygınlık, Mayo skoru…" },
          { title: "Crohn hastalığı", slug: "crohn", content: "Montreal sınıflaması, perianal hastalık…" }
        ],
        references: ["ECCO 2023"]
      }
    ]
  };
}

async function main() {
  try {
    let payload;
    if (filePath) {
      const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      const raw = fs.readFileSync(abs, "utf8");
      payload = JSON.parse(raw);
      if (!payload || !Array.isArray(payload.items)) {
        throw new Error("Geçersiz JSON: { items:[...] } bekleniyor.");
      }
    } else {
      payload = samplePayload();
    }

    const url = `${apiBase.replace(/\/+$/, "")}/api/admin/topics/bulk`;
    const res = await fetch(url + "?overwrite=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      console.error(`[SEED] Hata (HTTP ${res.status}):`, json);
      process.exit(1);
    }

    console.log("[SEED] OK:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("[SEED] Exception:", err?.message || err);
    process.exit(1);
  }
}

main();
