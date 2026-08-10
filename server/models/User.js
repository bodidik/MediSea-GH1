// FILE: server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Next.js tarafındaki mk_uid çereziyle eşleşsin diye
    externalId: { type: String, index: true, unique: true, sparse: true },

    name: { type: String, default: "Anon" },
    email: { type: String, index: true, unique: true, sparse: true },

    plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },

    // --- AI asistan kredi sistemi ---
    // Misafir (üye olmayan) tarayıcılar için işaret; kota hesabı buna göre değişir.
    guest: { type: Boolean, default: false },
    // Kalan soru hakkı. null = henüz ilklendirilmedi (ilk istekte plana göre dolar).
    aiCredits: { type: Number, default: null },
    // Bu tarihe gelince bakiye plana göre yeniden dolar (üye: aylık, misafir: günlük).
    aiCreditsResetAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
