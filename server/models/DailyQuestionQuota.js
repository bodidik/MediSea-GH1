// ESM
import mongoose from "mongoose";

const DailyQuestionQuotaSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true, required: true },
    dateKey: { type: String, index: true, required: true }, // YYYY-MM-DD (Europe/Istanbul)
    used: { type: Number, default: 0 },                     // bugün tüketilen toplam soru adedi
    limit: { type: Number, default: 4 },                    // o gün için geçerli limit (plan’a göre set edilir)
    // Aynı gün gösterilmiş soru ID’leri (tekrar göstermemek için)
    seenQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

DailyQuestionQuotaSchema.index({ externalId: 1, dateKey: 1 }, { unique: true });

const DailyQuestionQuota = mongoose.model("DailyQuestionQuota", DailyQuestionQuotaSchema);
export default DailyQuestionQuota;
