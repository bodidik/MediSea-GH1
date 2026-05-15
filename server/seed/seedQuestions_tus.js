import 'dotenv/config';
import mongoose from 'mongoose';
import Question from '../models/Question.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medknowledge';
await mongoose.connect(uri);

// sadece demo amaçlı temizleme
await Question.deleteMany({ subject: 'tus' });

await Question.insertMany([
  {
    subject: 'tus',
    stem: 'Diyabette ilk basamak tedavi önerisi hangisidir?',
    choices: [
      { key: 'A', text: 'Metformin' },
      { key: 'B', text: 'Sülfonilüre' },
      { key: 'C', text: 'İnsülin' },
      { key: 'D', text: 'Tiazolidindion' },
    ],
    answer: 'A',
    explanation:
      'Yaşam tarzı değişikliği ile birlikte ilk basamak çoğu hastada metformindir.',
  },
  {
    subject: 'tus',
    stem: 'Hiponatreminin en sık nedeni nedir?',
    choices: [
      { key: 'A', text: 'SIADH' },
      { key: 'B', text: 'Diüretik kullanımı' },
      { key: 'C', text: 'Kalp yetmezliği' },
      { key: 'D', text: 'Hipotiroidi' },
    ],
    answer: 'B',
    explanation:
      'Toplumda hiponatreminin en sık nedeni diüretik kullanımıdır (özellikle tiyazidler).',
  },
]);
console.log('TUS questions seeded');
process.exit(0);
