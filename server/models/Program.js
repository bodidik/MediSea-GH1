import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProgramSchema = new Schema(
  {
    title: { type: String, required: true },        // Program adı (ör. "YDUS Dahiliye 120 Gün")
    description: { type: String },                  // Program açıklaması
    language: { type: String, enum: ["tr", "en"], default: "tr" }, // TR = YDUS, EN = USMLE
    type: { type: String, enum: ["Ydus", "Tus", "Usmle"], required: true }, // Program tipi
    level: { type: String, enum: ["P"], default: "P" }, // Sadece premium kullanıcıya özel
    durationDays: { type: Number, default: 120 },   // Kaç gün sürecek
    schedule: [
      {
        day: { type: Number, required: true },      // Gün numarası (1, 2, 3...)
        content: { type: String, required: true },  // O günün konusu (örn. "Nefroloji - GN")
        resources: [{ type: String }],              // Linkler (pdf, video, slayt vs.)
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin ya da sistem
  },
  { timestamps: true }
);

const Program = model("Program", ProgramSchema);

export default Program;
