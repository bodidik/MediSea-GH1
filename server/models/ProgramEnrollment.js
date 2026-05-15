// FILE: server/models/ProgramEnrollment.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * Bir kullanıcının belirli bir programa (ör. YDUS 120) katılımını takip eder.
 * - userId: mk_uid gibi harici kimlik ya da User koleksiyonuna ref (ikisini de desteklemek için esnek bıraktık)
 * - program: Program modeline referans
 * - startDate: programa başlama tarihi
 * - currentDay: bugün kaçıncı gündeyiz
 * - progressPct: 0–100 arası ilerleme yüzdesi
 * - status: active | paused | completed | canceled
 * - notes: opsiyonel notlar
 */
const ProgramEnrollmentSchema = new Schema(
  {
    userId: { type: String, index: true, required: true },               // mk_uid / external id
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    startDate: { type: Date, default: () => new Date() },
    currentDay: { type: Number, default: 1, min: 1 },
    progressPct: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "canceled"],
      default: "active",
      index: true,
    },
    notes: { type: String },

    // İsteğe bağlı alanlar
    targetDays: { type: Number, default: 120 },                          // program hedef süresi (örn. 120 gün)
    lastActivityAt: { type: Date, default: () => new Date(), index: true },
    // Günlük özelleştirme/override için (opsiyonel)
    overrides: [
      {
        day: { type: Number, required: true },
        content: { type: String },     // o güne özel içerik metni
        resources: [{ type: String }], // linkler
      },
    ],
  },
  { timestamps: true }
);

// Bir kullanıcı aynı programa yalnızca bir kez kayıtlı olsun:
ProgramEnrollmentSchema.index({ userId: 1, program: 1 }, { unique: true });

// Basit yardımcı sanal alan (tamamlanmış mı?)
ProgramEnrollmentSchema.virtual("isCompleted").get(function () {
  return this.status === "completed" || this.progressPct >= 100;
});

const ProgramEnrollment =
  models.ProgramEnrollment || model("ProgramEnrollment", ProgramEnrollmentSchema);

export default ProgramEnrollment;
