// FILE: server/models/UserStat.js
import mongoose from "mongoose";

const userStatSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true, unique: true },
    plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },
    solved: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    rankPercentile: { type: Number, default: 50 },
    todaySolved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.UserStat || mongoose.model("UserStat", userStatSchema);
