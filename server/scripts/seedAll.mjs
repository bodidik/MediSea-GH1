import 'dotenv/config';
import mongoose from 'mongoose';
import Content from '../models/Content.js'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medknowledge';

async function seed() {
  console.log('🔌 Veritabanına bağlanılıyor...');
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      family: 4 // IPv4 zorlaması: ECONNRESET hatasını çözer
    });
    console.log('✅ Bağlantı başarılı.');
  } catch (err) {
    console.error('❌ Bağlantı Başarısız (Atlas):', err.message);
    process.exit(1);
  }

  const dataDir = path.join(__dirname, 'data');
  
  if (!fs.existsSync(dataDir)) {
      console.error(`❌ HATA: '${dataDir}' klasörü bulunamadı.`);
      process.exit(1);
  }

  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log('⚠️ Klasörde yüklenecek .json dosyası yok.');
    process.exit(0);
  }

  console.log(`📂 Bulunan dosyalar: ${files.join(', ')}`);

  for (const file of files) {
    console.log(`\n--- İşleniyor: ${file} ---`);
    const filePath = path.join(dataDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf8');
    let jsonData;

    try {
      jsonData = JSON.parse(rawContent);
    } catch (e) {
      console.error(`❌ Hata: ${file} bozuk veya geçersiz JSON formatında.`);
      continue;
    }

    let itemsToInsert = [];
    if (Array.isArray(jsonData)) {
      itemsToInsert = jsonData;
    } else if (jsonData.items && Array.isArray(jsonData.items)) {
      itemsToInsert = jsonData.items;
    } else {
      console.warn(`⚠️ Format uyuşmazlığı: ${file} içinde dizi bulunamadı.`);
      continue;
    }

    for (const item of itemsToInsert) {
      if (!item.slug) {
        console.warn(`   Atlandı: Slug eksik.`);
        continue;
      }

      await Content.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, new: true, strict: false } 
      );
      console.log(`   ✅ Yüklendi: ${item.slug}`);
    }
  }

  console.log('\n🎉 TÜM İŞLEMLER BAŞARIYLA TAMAMLANDI.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Büyük Hata:', err);
  process.exit(1);
});