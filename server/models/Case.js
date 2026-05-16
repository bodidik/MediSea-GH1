import mongoose from "mongoose";

const CaseStepOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },     // ör: "sudden"
  label: { type: String, required: true },  // "Ani (dakikalar-saatler içinde)"
}, { _id: false });

const CaseStepSchema = new mongoose.Schema({
  id: { type: String, required: true },        // ör: "onset"
  question: { type: String, required: true },  // "Ağrı ne zaman başladı?"
  type: { type: String, enum: ["single","multi"], required: true },
  options: { type: [CaseStepOptionSchema], default: [] },
  hints: { type: Map, of: String, default: {} }, // { sudden: "..." }
}, { _id: false });

const CaseRuleSchema = new mongoose.Schema({
  when: { type: Map, of: [String], default: {} }, // { onset: ["sudden"], location: ["rlq"] }
  advice: { type: String, required: true },
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true }, // "abdominal-pain"
  title: { type: String, required: true },
  intro: { type: String, default: "" },
  steps: { type: [CaseStepSchema], default: [] },
  rules: { type: [CaseRuleSchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Case = mongoose.models.Case || mongoose.model("Case", CaseSchema);
export default Case;
