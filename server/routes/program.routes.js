// FILE: server/routes/program.routes.js
import express from "express";
import * as ctrl from "../controllers/program.controller.js";
import { requirePlan } from "../middleware/plan.guard.js";

const router = express.Router();

// Liste & detay herkese açık (premium hissi için görüntü var, kayıt premium)
router.get("/", ctrl.list);
router.get("/:slug", ctrl.detail);

// Premium gerektiren akışlar
router.post("/:slug/enroll", requirePlan("premium"), ctrl.enroll);
router.get("/:slug/progress", requirePlan("premium"), ctrl.progress);
router.post("/:slug/progress/tick", requirePlan("premium"), ctrl.tick);

export default router;
