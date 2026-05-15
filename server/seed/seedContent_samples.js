import 'dotenv/config';
import mongoose from 'mongoose';
import Content from '../models/Content.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medknowledge';
await mongoose.connect(uri);

await Content.insertMany([
  { title: 'FMF Özet', section: 'romatoloji', body_general: '...', status: 'approved' },
  { title: 'Ankilozan Spondilit', section: 'romatoloji', body_general: '...', status: 'approved' },
  { title: 'IDDM Başlangıç', section: 'endokrinoloji', body_general: '...', status: 'approved' },
  { title: 'HBsAg Pozitif Hasta Yaklaşımı', section: 'gastroenteroloji', body_general: '...', status: 'approved' }
]);
console.log('Content seed OK');
process.exit(0);
