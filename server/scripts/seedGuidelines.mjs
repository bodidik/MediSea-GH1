// ESM seed script
import mongoose from "mongoose";
import dotenv from "dotenv";
import Guideline from "../models/Guideline.js";

dotenv.config({ path: process.env.ENV_FILE || "./.env" }); // .env veya .env.docker

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/medknowledge";

const seedData = [
  {
    title: "KDIGO 2022 Clinical Practice Guideline for Diabetes Management in CKD",
    org: "KDIGO",
    year: 2022,
    lang: "EN",
    section: "nefroloji",
    url: "https://kdigo.org/guidelines/diabetes-ckd/",
    tags: ["diabetes", "ckd", "kdigo"]
  },
  {
    title: "KDIGO 2021 Guideline for Blood Pressure in CKD",
    org: "KDIGO",
    year: 2021,
    lang: "EN",
    section: "nefroloji",
    url: "https://kdigo.org/guidelines/blood-pressure-in-ckd/",
    tags: ["bp", "ckd", "kdigo"]
  },
  {
    title: "ESC Guidelines – Acute Coronary Syndromes",
    org: "ESC",
    year: 2023,
    lang: "EN",
    section: "kardiyoloji",
    url: "https://www.escardio.org/Guidelines",
    tags: ["acs", "esc"]
  },
  {
    title: "ESMO Guidelines – Colorectal Cancer",
    org: "ESMO",
    year: 2022,
    lang: "EN",
    section: "onkoloji",
    url: "https://www.esmo.org/guidelines",
    tags: ["crc", "esmo"]
  },
  {
    title: "Türkiye Romatoloji Derneği – Behçet Hastalığı Kılavuzu",
    org: "TRD",
    year: 2021,
    lang: "TR",
    section: "romatoloji",
    url: "https://www.romatoloji.org.tr",
    tags: ["behçet", "trd"]
  },
  {
    title: "Türk Kardiyoloji Derneği – Kalp Yetersizliği Kılavuzu",
    org: "TKD",
    year: 2022,
    lang: "TR",
    section: "kardiyoloji",
    url: "https://www.tkd.org.tr",
    tags: ["hf", "tkd"]
  },
  {
    title: "TEMD – Diyabet Tanı ve Tedavi Kılavuzu",
    org: "TEMD",
    year: 2023,
    lang: "TR",
    section: "endokrinoloji",
    url: "https://www.temd.org.tr",
    tags: ["diyabet", "temd"]
  },
  {
    title: "IDSA Guideline – Infective Endocarditis",
    org: "IDSA",
    year: 2020,
    lang: "EN",
    section: "infeksiyon",
    url: "https://www.idsociety.org/practice-guideline/endocarditis/",
    tags: ["endocarditis", "idsa"]
  }
];

(async () => {
  try {
    await mongoose.connect(MONGO);
    console.log("[seed] Mongo connected:", MONGO);

    await Guideline.deleteMany({});
    console.log("[seed] cleared");

    const res = await Guideline.insertMany(seedData);
    console.log("[seed] inserted:", res.length);

    process.exit(0);
  } catch (err) {
    console.error("[seed] error:", err);
    process.exit(1);
  }
})();
