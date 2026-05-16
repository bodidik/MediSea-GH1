// FILE: server/routes/review.routes.js (ESM)
import express from "express";
import * as reviewCtrl from "../controllers/review.controller.js";


const router = express.Router();


router.get("/next", reviewCtrl.getNext);
router.post("/answer", reviewCtrl.answer);
router.get("/stats", reviewCtrl.stats); // ✅ yeni


export default router;