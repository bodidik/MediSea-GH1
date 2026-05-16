// FILE: server/routes/questions.js
import express from "express";
import * as ctrl from "../controllers/question.controller.js";
import { limitDailyQuestions } from "../middlewares/rate.guard.js";

const router = express.Router();

/**
 * Guard bypass: ?dev=1 verilirse rate limit atlanır.
 * (Sadece bu rotada, prod akışını bozmaz.)
 */
router.get(
  "/",
  (req, res, next) => {
    if (String(req.query.dev || "") === "1") {
      return ctrl.list(req, res);
    }
    return next();
  },
  limitDailyQuestions({ pathTag: "questions" }),
  ctrl.list
);

// Tekil soru (isteğe bağlı guard eklenebilir)
router.get("/:id", ctrl.detail);

export default router;
