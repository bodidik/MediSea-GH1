import mongoose from "mongoose";

// --- Yeni blok şeması: frontend ile birebir uyumlu ---
const sectionBlockSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    html: { type: String, default: "" },
    visibility: { type: String, enum: ["V", "M", "P"], default: "V" },
  },
  { _id: false }
);

// --- Eski subtopic şeması: GERİ UYUMLULUK için korunuyor ---
const subtopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { _id: false }
);

// --- Referans şeması: label/url/year ---
const referenceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String },
    year: { type: Number },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    // Kimlik / temel alanlar
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true, index: true },
    section: { type: String, required: true, index: true }, // örn: Endokrinoloji
    lang: { type: String, enum: ["TR", "EN"], default: "TR", index: true },
    summary: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },

    // YENİ: içerik blokları (frontend beklediği yapı)
    sections: { type: [sectionBlockSchema], default: [] },

    // GERİ UYUMLULUK: eski alanlar (okuma amaçlı)
    content: { type: String, default: "" },
    subtopics: { type: [subtopicSchema], default: [] },

    // İlişkilendirmeler
    relatedTopics: { type: [String], default: [] }, // slug listesi
    relatedCases: { type: [String], default: [] }, // case slug listesi

    // Referanslar (yeni nesne formu)
    references: { type: [referenceSchema], default: [] },
  },
  { timestamps: true }
);

// --- Metin araması (hafif) ---
topicSchema.index({
  title: "text",
  content: "text",
  "subtopics.title": "text",
  summary: "text",
  tags: "text",
});

// --- Geri uyumluluk köprüsü ---
// Eğer sections boşsa ve eski content varsa, runtime'da tek blok döndür.
topicSchema.methods.getRenderableSections = function () {
  if (this.sections && this.sections.length > 0) return this.sections;
  if (this.content && this.content.trim().length > 0) {
    return [
      { title: "Özet", html: this.content, visibility: "V" },
    ];
  }
  return [];
};

export default mongoose.model("Topic", topicSchema);
