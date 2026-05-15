// FILE: server/routes/admin.section.routes.js (ESM)
import express from "express";
import * as ctrl from "../controllers/admin.section.controller.js";


const router = express.Router();


router.get("/audit", ctrl.audit);
router.post("/normalize", ctrl.normalize);


export default router;