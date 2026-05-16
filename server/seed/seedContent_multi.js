import 'dotenv/config';
import mongoose from 'mongoose';
import Content from '../models/Content.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medknowledge';
await mongoose.connect(uri);

await Content.deleteMany({ section: { $in: ['romatoloji','gastroenteroloji','endokrinoloji','kardiyoloji','infeksiyon'] } });

await Content.insertMany([
  { title: 'FMF Özet', section: 'romatoloji', teaser: 'FMF tanı ve tedaviye kısa bakış', body_general: 'Klinik: tekrarlayan ateş, peritonit...', body_deep: 'MEFV mutasyonları, kolşisin optimizasyonu...', status: 'approved' },
  { title: 'AS Temel Yaklaşım', section: 'romatoloji', teaser: 'Ankilozan spondilit başlangıç', body_general: 'Inflamatuar bel ağrısı...', status: 'approved' },
  { title: 'HBsAg Pozitif Hasta', section: 'gastroenteroloji', teaser: 'HBV yönetimi', body_general: 'HBsAg, HBeAg, HBV DNA...', body_deep: 'Tedavi endikasyonları, EASL-2024 notları', status: 'approved', premiumOnly: true },
  { title: 'Tip 1 DM Başlangıç', section: 'endokrinoloji', teaser: 'IDDM ilk yaklaşım', body_general: 'DKA dışlama, bazal-bolus...', status: 'approved' },
  { title: 'HFrEF Güncel', section: 'kardiyoloji', teaser: 'Kalp yetersizliği tedavisi', body_general: 'ARNI, SGLT2i, MRA...', body_deep: 'Evrelere göre uptitration', status: 'approved', premiumOnly: true },
  { title: 'PNÖMONİ: CAP vs HAP', section: 'infeksiyon', teaser: 'Pnömoni sınıflaması', body_general: 'CAP/HAP ayrımı, empirik tedavi', status: 'approved' }
]);

console.log('Multi-section content seeded');
process.exit(0);
