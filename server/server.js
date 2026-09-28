// FILE: server/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import topicRoutes from "./routes/topic.routes.js";
import aiRoutes from "./routes/ai.routes.js"; // 🆕 AI asistan (kredi sınırlı)

dotenv.config();

const app = express();

/* --- Middleware --- */
const defaultOrigins =
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://localhost:3002";

app.use(
  cors({
    origin: (process.env.VIDEO_ALLOWED_ORIGINS || defaultOrigins)
      .split(",")
      .map((s) => s.trim()),
    credentials: true,
  })
);

// JSON body parser (CSV için router içinde express.text kullanıyoruz)
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

/* --- MongoDB --- */
const MONGO =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medknowledge";
let DB_LAST_ERROR = null;
let DB_READY = false;

async function connectMongo() {
  try {
    await mongoose.connect(MONGO, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    DB_READY = true;
    DB_LAST_ERROR = null;
    console.log("[BOOT] Mongo connected");
  } catch (err) {
    DB_READY = false;
    DB_LAST_ERROR = err?.message || String(err);
    console.error("[BOOT] Mongo connection error:", DB_LAST_ERROR);
  }
}
connectMongo();

/* --- Rol: İSTEMCİDEN ALINMAZ ---
   Burası rolü doğrudan `?role=` sorgusundan alıyordu: `?role=P` yazan
   herkes premium sayılıyor, /api/exams açıklamaları ve /api/protected
   kapısı açılıyordu (ölçüldü, 28 Eyl). Web bu uçları kullanmıyor; gerçek
   bir kimlik kaynağı bağlanana kadar herkes V. */
app.use((req, _res, next) => {
  req.user = { role: "V" };
  next();
});

/* --- YAZMA KİLİDİ ---
   Envanter (28 Eyl): bağlı HİÇBİR yazma ucunda kimlik doğrulama yoktu —
   DELETE /api/topics/:slug, DELETE ve filtresiz PUT /api/content/:slug,
   POST /api/admin/topics/bulk (üzerine yazma), kılavuz/konu oluşturma,
   plan/set · progress · quiz/submit (istenen kimlik adına). `adminKey`
   ara katmanı hiçbir rotaya bağlı değildi. Veritabanı web'in üretim
   kümesiyle AYNI.

   Web bu arka uçta yalnız POST /api/ai/ask'i yazma için kullanıyor (kendi
   kapısı var: AI_ICERI_ANAHTARI) ve /api/topics'i yalnız OKUYOR. Geri
   kalan her yazma isteği 405. Yerel geliştirme / bilinçli yönetim işi için
   ARKA_UC_YAZMA_ACIK=1 kilidi açar. */
export function yazmaKilidi(req, res, next) {
  const yazma = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!yazma || req.path.startsWith("/api/ai/") || process.env.ARKA_UC_YAZMA_ACIK === "1") return next();
  return res.status(405).json({ ok: false, error: "yazma_kapali" });
}
app.use(yazmaKilidi);

/* --- API Routes ---
   YALNIZ WEB'İN KULLANDIĞI İKİ GRUP BAĞLI (28 Eyl, kullanıcı kararı).
   Envanter: web bu arka uçta yalnız /api/ai/ask'i (kendi kapısı var) ve
   /api/topics'i OKUMA için kullanıyor (yönetici içerik sayfası). Sökülen
   gruplar — section-content, sections, questions, exams, cases, compat
   (/api: counts, user, plan, progress, premium/quiz, review, guidelines),
   protected, guidelines, admin/topics, content, translate — ya yazma
   (kimlik doğrulamasız; yazma kilidi zaten 405'liyordu) ya da premium
   içeriği DOĞRULAMASIZ okuyordu: /api/questions doğru cevap ve açıklamayla
   (günlük sınır ?dev=1 ile atlanıyordu), /api/cases, /api/content tam belge.
   Denetleyici ve rota dosyaları DURUYOR; geri bağlamak tek satır — ama
   bağlamadan önce gerçek bir kimlik doğrulaması şart. */
app.use("/api/topics", topicRoutes);
app.use("/api/ai", aiRoutes); // AI asistan — AI_ICERI_ANAHTARI kapısı

/* --- Healthcheck --- */
app.get("/health", (_req, res) => {
  const dbState = mongoose.connection?.readyState;
  res.status(200).json({
    status: "ok",
    dbState,
    dbReady: DB_READY,
    dbError: DB_LAST_ERROR,
    uptime: process.uptime(),
  });
});

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection?.readyState;
  res.status(200).json({
    ok: true,
    service: "medknowledge-api",
    dbState,
    dbReady: DB_READY,
    dbError: DB_LAST_ERROR,
    time: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (_req, res) => res.send("Medknowledge API running..."));

/* --- Start --- */
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`[BOOT] Server running on http://${HOST}:${PORT}`);
});
