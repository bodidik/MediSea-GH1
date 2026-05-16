import express from "express";
import * as ctrl from "../controllers/guideline.controller.js";

const router = express.Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.detail);

// basit admin uçları
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);

// TR → EN klon
router.post("/:id/clone-en", ctrl.cloneToEN);

export default router;
