// FILE: server/routes/ai.routes.js
import express from "express";
import { askQuestion, getCredits } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/ask  — soru sor (kredi düşer)
router.post("/ask", askQuestion);

// GET  /api/ai/credits — kalan hak
router.get("/credits", getCredits);

export default router;
