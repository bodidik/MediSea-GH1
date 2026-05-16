// FILE: server/models/ReviewEvent.js
const mongoose = require("mongoose");

const ReviewEventSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, index: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "ReviewCard", required: true },
    result: { type: String, enum: ["correct", "wrong", "later"], required: true },
    ease: { type: Number },       // cevap sonrası ease
    interval: { type: Number },   // cevap sonrası interval (gün)
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("ReviewEvent", ReviewEventSchema);
