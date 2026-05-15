import * as ctrl from "../controllers/note.controller.js";
import express from "express";

const router = express.Router();

// FILE: server/routes/video.routes.js

router.post("/", ctrl.createNote);
export default router;

