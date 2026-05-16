import { Router } from "express";
import { issueToken, getChunk } from "../controllers/protected.controller.js";
import { premiumGuard } from "../middlewares/antiCopy.guard.js";
import { requirePlan } from "../middlewares/plan.guard.js"; // sende mevcut

const router = Router();

// Premium içerik için: plan kontrolü + fingerprint
router.get("/token", requirePlan("premium"), premiumGuard, issueToken);
router.get("/chunk", requirePlan("premium"), premiumGuard, getChunk);

export default router;
