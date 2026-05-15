import express from "express";
import { list, getBySlug } from "../controllers/case.controller.js";

const router = express.Router();

// Liste (aktif vakalar)
router.get("/", list);

// Slug ile tek vaka
router.get("/:slug", getBySlug);

export default router;
