// FILE: server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Next.js tarafındaki mk_uid çereziyle eşleşsin diye
    externalId: { type: String, index: true, unique: true, sparse: true },

    name: { type: String, default: "Anon" },
    email: { type: String, index: true, unique: true, sparse: true },

    plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
