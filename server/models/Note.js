// FILE: server/models/Note.js
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true, index: true },
    content: { type: String, required: true },               // markdown/metin

    section:     { type: String, trim: true, index: true },
    sectionCode: { type: String, trim: true, index: true },  // kısa kod
    tags:        { type: [String], default: [], index: true },

    // Ek alanlar
    thumbnail:  { type: String, default: "" },
    references: { type: [String], default: [] },
    preview:    { type: String, default: "" },
    language:   { type: String, default: "tr" },
    authorRef:  { type: String, default: "" },               // externalId/userId gibi
    isPublic:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

NoteSchema.index({ section: 1, createdAt: -1 });
NoteSchema.index({ sectionCode: 1, createdAt: -1 });
NoteSchema.index({ tags: 1, createdAt: -1 });

module.exports = mongoose.model("Note", NoteSchema);
