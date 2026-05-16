import express from "express";
import { list, detail } from "../controllers/guideline.controller.js";

const router = express.Router();

router.get("/", list);
router.get("/:id", detail);

export default router;
