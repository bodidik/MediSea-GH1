// server/models/Question.js
import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  key: { type: String, required: true },   // A, B, C, ...
  text: { type: String, required: true }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  examType: { type: String, index: true, required: true }, // 'ydus' | 'tus' | ...
  section:  { type: String, index: true },                 // romatoloji, nefroloji...
  title:    { type: String, required: true },              // kısa başlık
  stem:     { type: String, required: true },              // soru/vaka metni
  options:  { type: [OptionSchema], required: true },
  correct:  { type: String, required: true },              // 'A' gibi
  explain:  { type: String },                              // açıklama (P)
  status:   { type: String, default: 'active', index: true }
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
