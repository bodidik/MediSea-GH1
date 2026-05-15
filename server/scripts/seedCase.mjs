import mongoose from "mongoose";
import dotenv from "dotenv";
import Case from "../models/Case.js";

dotenv.config();

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/medknowledge";
await mongoose.connect(MONGO);
console.log("[seedCase] connected:", MONGO);

const doc = {
  slug: "abdominal-pain",
  title: "Karın Ağrısı ile Başvuran Hasta",
  intro:
    "Acil servise karın ağrısı ile başvuran yetişkin hasta. Sorularınla öyküyü derinleştir ve olası yönleri değerlendir.",
  steps: [
    {
      id: "onset",
      question: "Ağrı ne zaman başladı?",
      type: "single",
      options: [
        { id: "sudden", label: "Ani (dakikalar-saatler içinde)" },
        { id: "gradual", label: "Yavaş başlangıç (günler içinde)" },
        { id: "intermittent", label: "Aralıklı" },
      ],
      hints: {
        sudden:
          "Ani başlangıç; apandisit, perforasyon, taş, iskemik nedenler gibi akut süreçleri düşündürür.",
        gradual:
          "Yavaş başlangıç; inflamatuvar süreçler (örn. divertikülit, piyelonefrit) akla gelir.",
        intermittent:
          "Aralıklı; kolik tarzı (taş, obstrüksiyon) veya fonksiyonel ağrılarla uyumlu olabilir.",
      },
    },
    {
      id: "location",
      question: "Ağrının yeri/yerleşimi nedir?",
      type: "single",
      options: [
        { id: "ruq", label: "Sağ üst kadran" },
        { id: "epigastric", label: "Epigastrik" },
        { id: "rlq", label: "Sağ alt kadran" },
        { id: "llq", label: "Sol alt kadran" },
        { id: "diffuse", label: "Yaygın/diffüz" },
      ],
      hints: {
        ruq: "RUQ; kolesistit/kolelitiazis, hepatik nedenler, pnömoni (alt lob).",
        epigastric: "Epigastrik; peptik ülser, pankreatit, safra kaynaklı ağrılar.",
        rlq: "RLQ; apandisit, mezenter lenfadenit.",
        llq: "LLQ; divertikülit, kolon kaynaklı patolojiler.",
        diffuse: "Diffüz; peritonit, gastroenterit, İBH alevlenmesi, iskemi.",
      },
    },
  ],
  rules: [
    { when: { onset: ["sudden"] }, advice: "Ani başlangıç → akut cerrahi patoloji dışlanmalı." },
    { when: { location: ["rlq"] }, advice: "Sağ alt kadran → apandisit olası; USG/BT düşün." },
  ],
  isActive: true,
};

await Case.findOneAndUpdate(
  { slug: doc.slug },
  { $set: doc },
  { upsert: true, new: true }
);

console.log("[seedCase] upserted:", doc.slug);
await mongoose.disconnect();
console.log("[seedCase] done");
