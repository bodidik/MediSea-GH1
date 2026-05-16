// FILE: server/routes/plan.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * POST /api/plan/set?plan=premium&externalId=mk_xxx
 *  veya  /api/plan/set?plan=premium&userId=66c...
 */
router.post("/set", async (req, res) => {
  try {
    const { plan, externalId, userId } = req.query;

    if (!plan || !["free", "premium", "pro"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    let user = null;
    if (externalId) user = await User.findOne({ externalId });
    if (!user && userId) user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.plan = plan;
    await user.save();

    res.json({ message: "Plan updated", user });
  } catch (err) {
    console.error("POST /plan/set error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
