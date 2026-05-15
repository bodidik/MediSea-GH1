import * as ctrl from "../controllers/board.controller.js";
import express from "express";
const router = express.Router();

// server/routes/board.routes.js
router.post("/", ctrl.createBoard);

// server/routes/case.routes.js

router.post("/", ctrl.createCase);
export default router;

