// FILE: server/controllers/medsea.premium.controller.js
// Premium içerikler: günlük program + zor soru analizi + video önerileri.

import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function loadModel(name){
  try{
    const mod = await import(pathToFileURL(path.join(__dirname, "..", "models", `${name}.js`)).href);
    return mod?.default || mod?.[name] || null;
  }catch{
    return null;
  }
}

function isPremium(plan){ return ["premium","pro"].includes(plan || ""); }

/* ---------------------- Günlük Program ---------------------- */
async function sectionAgg(){
  const Question = await loadModel("Question");
  if(!Question) return [];
  try{
    return await Question.aggregate([
      { $group: { _id: "$section", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 }
    ]);
  }catch{
    return [];
  }
}

export async function getDailyProgram(req, res){
  try{
    const { externalId, userId } = req.query || {};
    let user = null;
    if (externalId) user = await User.findOne({ externalId });
    if (!user && userId) user = await User.findById(userId);

    const plan = user?.plan || "free";
    if (!isPremium(plan)) return res.json({ locked: true, reason: "plan" });

    const agg = await sectionAgg();
    const sections = agg.length ? agg.map(a=> a._id || "General") : ["General"];
    const pool = sections.slice(0,4);
    const items = pool.map(s => ({ section: s, type: "BoardQuestion", qty: 5 }));

    const Content = await loadModel("Content");
    if (Content) items.push({ section: pool[0] || "General", type: "Video", qty: 3 });

    const total = items.reduce((a,b)=> a+b.qty, 0);
    res.json({ locked:false, program:{ items, total }, lastUpdatedISO: new Date().toISOString() });
  }catch(e){
    res.status(500).json({ error: e?.message || "daily-program failed" });
  }
}

/* ---------------------- Zor Soru Analizi ---------------------- */
export async function getHardQuestionAnalysis(req, res){
  try{
    const { externalId, userId, limit } = req.query || {};
    let user = null;
    if (externalId) user = await User.findOne({ externalId });
    if (!user && userId) user = await User.findById(userId);

    const plan = user?.plan || "free";
    if (!isPremium(plan)) return res.json({ locked: true, reason: "plan" });

    const Question = await loadModel("Question");
    if (!Question) return res.json({ locked:false, items:[], lastUpdatedISO: new Date().toISOString() });

    const topN = Math.min(Math.max(parseInt(limit || "10",10) || 10, 1), 25);

    const pipeline = [
      { $addFields: { _wrongBase: { $ifNull: ["$stats.wrongCount",  null] } } },
      { $addFields: { _wrong1: { $ifNull: ["$_wrongBase", "$wrongCount"] } } },
      { $addFields: { _wrong2: { $ifNull: ["$_wrong1", "$incorrectCount"] } } },
      { $addFields: { _wrong3: { $ifNull: ["$_wrong2", "$mistakes"] } } },
      { $addFields: { _wrong4: { $ifNull: ["$_wrong3", "$failCount"] } } },
      { $addFields: {
          _difficulty: { $cond: [{ $isNumber: "$difficulty" }, "$difficulty", 0] },
          _wrongScore: { $cond: [{ $isNumber: "$_wrong4" }, "$_wrong4", 0] }
        } },
      { $addFields: { finalScore: { $add: ["$_wrongScore", { $divide: ["$_difficulty", 10] }] } } },
      { $project: { section:1, topic:1, title:1, finalScore:1 } },
      { $sort: { finalScore: -1 } },
      { $limit: topN }
    ];

    const rows = await Question.aggregate(pipeline);
    const items = rows.map(r => ({
      id: r._id?.toString?.() || "",
      section: r.section || "General",
      title: r.title || r.topic || "Question",
      score: Math.round((r.finalScore || 0) * 100) / 100
    }));

    res.json({ locked:false, items, lastUpdatedISO: new Date().toISOString() });
  }catch(e){
    res.status(500).json({ error: e?.message || "hard-questions failed" });
  }
}

/* ---------------------- Video Önerileri (yeni) ---------------------- */
// Content şema esnek: type: "Video", section, title, views, rating, recentBoost
// Yoksa yine de boş dizi döner.
export async function getVideoRecommendations(req, res){
  try{
    const { externalId, userId, limit } = req.query || {};
    let user = null;
    if (externalId) user = await User.findOne({ externalId });
    if (!user && userId) user = await User.findById(userId);

    const plan = user?.plan || "free";
    if (!isPremium(plan)) return res.json({ locked: true, reason: "plan" });

    const Content = await loadModel("Content");
    if (!Content) return res.json({ locked:false, items:[], lastUpdatedISO: new Date().toISOString() });

    const topN = Math.min(Math.max(parseInt(limit || "3",10) || 3, 1), 10);

    // Basit sıralama: rating (desc), views (desc), recentBoost (desc)
    const rows = await Content.aggregate([
      { $match: { type: "Video" } },
      { $addFields: {
          _rating: { $cond: [{ $isNumber: "$rating" }, "$rating", 0] },
          _views:  { $cond: [{ $isNumber: "$views"  }, "$views",  0] },
          _recent: { $cond: [{ $isNumber: "$recentBoost" }, "$recentBoost", 0] },
        } },
      { $addFields: { score: { $add: ["$_rating", { $divide: ["$_views", 10000] }, { $multiply: ["$_recent", 0.5] }] } } },
      { $project: { title:1, section:1, url:1, duration:1, score:1 } },
      { $sort: { score: -1 } },
      { $limit: topN }
    ]);

    const items = rows.map(r => ({
      title: r.title || "Video",
      section: r.section || "General",
      url: r.url || "",
      duration: r.duration || 0,
      score: Math.round((r.score || 0) * 100) / 100
    }));

    res.json({ locked:false, items, lastUpdatedISO: new Date().toISOString() });
  } catch(e){
    res.status(500).json({ error: e?.message || "video-reco failed" });
  }
}
