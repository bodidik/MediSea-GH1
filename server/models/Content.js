// server/models/Content.js
import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  // URL'de görünecek kimlik (Örn: sistemik-lupus)
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },

  // Konu Başlığı
  title: { 
    type: String, 
    required: true 
  },

  // Hangi branşa ait olduğu (romatoloji, endokrin vb.)
  section: { 
    type: String, 
    required: true,
    index: true 
  },

  // Kısa özet (Card'larda görünen)
  summary: { 
    type: String 
  },

  // İçerik Bölümleri (Giriş, Tedavi vb.)
  sections: [{
    title: String,
    html: String,
    visibility: String // 'V' (Visible) veya 'H' (Hidden)
  }],

  // Referanslar
  references: [{
    label: String,
    year: Number
  }],

  // Durum: 'draft' (taslak) veya 'published' (yayında)
  status: { 
    type: String, 
    default: 'published' 
  },

  // Dil: 'tr' veya 'en'
  locale: { 
    type: String, 
    default: 'tr' 
  },

  // Eklenme/Güncellenme Tarihleri
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Eğer model daha önce tanımlandıysa onu kullan, yoksa yenisini oluştur
const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

export default Content;