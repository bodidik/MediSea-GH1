// FILE: server/seed/seedQuestions_ydus.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';

dotenv.config();
const MONGO = process.env.MONGODB_URI;

const data = [
  {
    examType: 'ydus',
    lang: 'TR',
    isPremium: false,
    section: 'romatoloji',
    title: 'FMF tanısı ile ilgili hangisi doğrudur?',
    stem: 'Tekrarlayan ateş ve serozit atakları olan 23 yaş erkek...',
    options: [
      { key: 'A', text: 'MEFV mutasyonu tanıyı dışlar' },
      { key: 'B', text: 'Kolşisin tedavisi atakları azaltır' },
      { key: 'C', text: 'AA amiloidozu FMF ile ilişkili değildir' },
      { key: 'D', text: 'Aile öyküsü tanı için şarttır' },
      { key: 'E', text: 'Yalnız atak sırasında CRP yükselir' }
    ],
    correct: 'B',
    explain: 'Kolşisin FMF’te atak sıklığını ve amiloidoz riskini azaltır.'
  },
  {
    examType: 'ydus',
    lang: 'TR',
    isPremium: false,
    section: 'nefroloji',
    title: 'Nefrotik sendrom belirtileri',
    stem: 'Aşağıdakilerden hangisi nefrotik sendromun tipik bulgularındandır?',
    options: [
      { key: 'A', text: 'Hipertansiyon' },
      { key: 'B', text: 'Hematüri' },
      { key: 'C', text: 'Masif proteinüri' },
      { key: 'D', text: 'Hiperkalemi' },
      { key: 'E', text: 'Hipokalsemi' }
    ],
    correct: 'C',
    explain: 'Proteinüri >3.5 g/gün, hipoalbuminemi, ödem, hiperlipidemi.'
  }
];

(async () => {
  try {
    await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 5000, family: 4 });
    await Question.deleteMany({ examType: 'ydus' });
    await Question.insertMany(data, { ordered: false });
    console.log('Seeded YDUS questions:', data.length);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
