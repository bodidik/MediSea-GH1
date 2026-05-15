// FILE: server/scripts/seedReview.mjs
// Kullanım:
//   node scripts/seedReview.mjs mk_uid_123
//
// Not: ESM (type: module). MONGODB_URI .env'den alınır; yoksa localhost'a bağlanır.

import "dotenv/config";
import mongoose from "mongoose";

// --- Model (projenizde varsa onu kullanır; yoksa aşağıdaki minimal şemaya düşer) ---
let ReviewCard;
try {
  const mod = await import("../models/ReviewCard.js");
  ReviewCard = mod.default || mod.ReviewCard || mod;
} catch {
  const schema = new mongoose.Schema({
    userId: { type: String, index: true },
    contentId: String,
    section: String,
    type: String,          // topic | board | case | video | note
    ease: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    dueAt: { type: Date, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  ReviewCard = mongoose.models.ReviewCard || mongoose.model("ReviewCard", schema);
}

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/medknowledge";

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const SECTIONS = ["Nephrology","Cardiology","Endocrinology","Gastroenterology","Pulmonology"];
const TYPES = ["topic","board","case","video","note"];

async function main(){
  const externalId = process.argv[2] || "demo_user_1";
  console.log("[seedReview] userId =", externalId);
  console.log("[seedReview] MONGODB_URI =", MONGO);

  await mongoose.connect(MONGO);
  console.log("[seedReview] Mongo connected");

  const now = new Date();
  const docs = [];

  // 10 kart: 6'sı due (geçmiş/bugün), 4'ü ileri tarih
  for (let i=0;i<10;i++){
    const isDue = i < 6;
    const deltaDays = isDue ? -Math.floor(Math.random()*3) : Math.floor(Math.random()*7)+1; // -2..0 veya +1..+7
    const due = new Date(now.getTime() + deltaDays*24*60*60*1000);

    docs.push({
      userId: externalId,
      contentId: `content_${Math.random().toString(36).slice(2,10)}`,
      section: pick(SECTIONS),
      type: pick(TYPES),
      ease: 2.5,
      interval: isDue ? 0 : Math.floor(Math.random()*3)+1,
      dueAt: due,
      createdAt: now,
      updatedAt: now,
    });
  }

  const res = await ReviewCard.insertMany(docs);
  console.log(`[seedReview] inserted: ${res.length}`);

  await mongoose.disconnect();
  console.log("[seedReview] done.");
}

main().catch(async (e)=>{
  console.error("[seedReview] ERROR:", e?.message || e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
