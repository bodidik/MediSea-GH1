// FILE: server/models/Video.js
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true, index: true },
    url:     { type: String, required: true, trim: true },

    section:     { type: String, trim: true, index: true },   // "Nephrology" vb.
    sectionCode: { type: String, trim: true, index: true },   // "NEPH", "CARD" gibi kısa kod
    tags:        { type: [String], default: [], index: true },

    // Ek alanlar
    thumbnail:  { type: String, default: "" },                // görsel linki
    references: { type: [String], default: [] },              // DOI/URL/metin referanslar
    durationSec:{ type: Number, default: 0 },                 // sn
    preview:    { type: String, default: "" },                // kısa açıklama
    source:     { type: String, default: "" },                // YouTube/Vimeo/local
    language:   { type: String, default: "tr" },              // "tr" | "en" ...
    isPublic:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Sık kullanılan birleşik indeksler
VideoSchema.index({ section: 1, createdAt: -1 });
VideoSchema.index({ sectionCode: 1, createdAt: -1 });
VideoSchema.index({ tags: 1, createdAt: -1 });

module.exports = mongoose.model("Video", VideoSchema);
