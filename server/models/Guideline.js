// FILE: server/models/Guideline.js
import mongoose from "mongoose";
const GuidelineSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  org:     { type: String, default: "" },
  year:    { type: Number, default: null },
  lang:    { type: String, enum: ["TR","EN"], default: "EN" },
  section: { type: String, index: true }, // nefroloji, kardiyoloji...
  url:     { type: String, required: true },
  tags:    [{ type: String }],
  translations: [{
    lang: { type: String, enum: ["TR","EN"] },
    guidelineId: { type: mongoose.Schema.Types.ObjectId, ref: "Guideline" },
    autoTranslated: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default mongoose.model("Guideline", GuidelineSchema);
