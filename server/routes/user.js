// FILE: server/routes/user.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /api/user/me
 * externalId (mk_uid) veya userId/email ile kullanıcıyı getirir.
 *  - /api/user/me?externalId=mk_xxx
 *  - /api/user/me?userId=66c...
 *  - /api/user/me?email=a@b.com
 */
router.get("/me", async (req, res) => {
  try {
    const { externalId, userId, email } = req.query;

    let user = null;
    if (externalId) user = await User.findOne({ externalId });
    else if (userId) user = await User.findById(userId);
    else if (email) user = await User.findOne({ email });
    else return res.status(400).json({ error: "externalId, userId veya email gerekli" });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/user/ensure
 * - externalId (mk_uid), email, name, plan alanlarını body veya query’den kabul eder.
 * - varsa kullanıcıyı günceller, yoksa oluşturur.
 */
router.post("/ensure", async (req, res) => {
  try {
    const q = req.query || {};
    const b = (req.body && typeof req.body === "object") ? req.body : {};

    const externalId = q.externalId || b.externalId;
    const email      = q.email      || b.email;
    const name       = q.name       || b.name;
    const plan       = q.plan       || b.plan;

    if (!externalId && !email) {
      return res.status(400).json({ error: "externalId veya email zorunlu" });
    }

    // Bul/güncelle/oluştur
    let user = null;
    if (externalId) user = await User.findOne({ externalId });
    if (!user && email) user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        externalId: externalId || undefined,
        email: email || undefined,
        name: name || "Anon",
        plan: plan && ["free", "premium", "pro"].includes(plan) ? plan : "free",
      });
    } else {
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (plan && ["free", "premium", "pro"].includes(plan)) updates.plan = plan;
      if (Object.keys(updates).length) {
        user.set(updates);
        await user.save();
      }
    }

    res.json({ ok: true, user });
  } catch (err) {
    console.error("POST /ensure error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
