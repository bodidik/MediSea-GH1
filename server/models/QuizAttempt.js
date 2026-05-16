// FILE: server/models/QuizAttempt.js
import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    source: { type: String, default: "daily-quiz" },
    total: Number,
    correct: Number,
    wrong: Number,
    accuracy: Number,
    payload: [{}],
  },
  { timestamps: true }
);

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
