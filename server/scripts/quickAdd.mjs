import 'dotenv/config';
import mongoose from 'mongoose';
import Content from '../models/Content.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medknowledge';

async function quickAdd() {
  console.log('🚀 Hızlı Ekleme Başlatılıyor...');
  
  // 1. import.json dosyasını bul
  const importFile = path.join(__dirname, '..', 'import.json');
  
  try {
    const rawData = fs.readFileSync(importFile, 'utf8');
    const items = JSON.parse(rawData);

    if (items.length === 0) {
      console.log('⚠️ import.json dosyası boş (veya sadece [] var). Eklenecek bir şey yok.');
      process.exit(0);
    }

    // 2. Veritabanına Bağlan
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
    console.log('🔌 Veritabanına bağlandı.');

    // 3. Verileri Yükle
    for (const item of items) {
      // Eğer bölüm (section) yoksa uyar ama devam et
      if (!item.section) item.section = 'genel'; 
      // Durumu otomatik 'published' yap
      item.status = 'published';
      item.locale = item.locale || 'tr';

      await Content.findOneAndUpdate(
        { slug: item.slug }, // Slug aynıysa GÜNCELLE (Gebelik bölümü eklediysen eskisini ezer)
        { $set: item },
        { upsert: true, new: true } 
      );
      console.log(`✅ İŞLENDİ: ${item.title} (${item.slug})`);
    }

    // 4. import.json dosyasını temizle (ki yanlışlıkla tekrar yükleme olmasın)
    fs.writeFileSync(importFile, '[]', 'utf8');
    console.log('🧹 import.json temizlendi ve bir sonraki iş için hazır.');

  } catch (error) {
    console.error('❌ HATA:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Bağlantı kapatıldı.');
    process.exit(0);
  }
}

quickAdd();