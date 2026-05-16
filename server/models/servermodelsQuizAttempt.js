// FILE: server/models/QuizAttempt.js
import mongoose from "mongoose";

const QuizAnswerSchema = new mongoose.Schema(
  {
    qid: { type: String, required: true },          // Question _id (stringleştirilmiş)
    selected: { type: String, required: true },     // seçilen seçenek (index veya değer)
    correctAnswer: { type: String, required: true },// doğru cevap (index veya değer)
    isCorrect: { type: Boolean, required: true },   // doğru mu?
  },
  { _id: false }
);

const QuizAttemptSchema = new mongoose.Schema(
  {
    // Kullanıcıyı iki şekilde bağlayabiliyoruz (en az biri bulunur):
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    externalId: { type: String, required: true },   // mk_uid (cookie) veya dış kimlik

    // Gün damgası (yerel/Istanbul gününe normalize) — "YYYY-MM-DD"
    date: { type: String, required: true },

    // Skor bilgileri
    total: { type: Number, required: true },        // soru adedi
    correct: { type: Number, required: true },      // doğru sayısı

    // Soru-şık dökümü
    answers: { type: [QuizAnswerSchema], default: [] },

    // Kaynak/etiket (istenirse filtrelerde kullanılabilir)
    source: { type: String, default: "daily-quiz" },
  },
  { timestamps: true }
);

/* ───── Index’ler ─────
   - externalId + createdAt → son denemeye hızlı erişim
   - externalId + date      → “bugünkü deneme var mı?” sorgusu
*/
QuizAttemptSchema.index({ externalId: 1, createdAt: -1 });
QuizAttemptSchema.index({ externalId: 1, date: -1 });

// Mongoose tekrar tanımlama hatasına karşı koruma
const QuizAttempt =
  mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);

export default QuizAttempt;
