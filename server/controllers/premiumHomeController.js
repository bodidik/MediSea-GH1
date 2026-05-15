import Content from '../models/Content.js';
import Question from '../models/Question.js';

const SECTIONS = [
  'romatoloji','hematoloji','gastroenteroloji','endokrinoloji',
  'geriatri','nefroloji','onkoloji','immünoloji',
  'kardiyoloji','infeksiyon','göğüs'
];

export async function getPremiumHome(_req, res) {
  // içerik ve soru adetlerini hızlıca topla (boşsa 0 döner)
  const [contentCounts, ydusQ, tusQ, boardQ] = await Promise.all([
    Content.aggregate([
      { $match: { status: { $ne: 'removed' } } },
      { $group: { _id: '$section', c: { $sum: 1 } } }
    ]),
    Question.countDocuments({ subject: 'ydus' }),
    Question.countDocuments({ subject: 'tus' }),
    Question.countDocuments({ subject: { $in: ['board', 'usmle'] } })
  ]);

  const contentMap = Object.fromEntries(contentCounts.map(x => [x._id || 'diğer', x.c]));

  const sections = SECTIONS.map(s => ({
    key: s,
    title: s[0].toUpperCase() + s.slice(1),
    count: contentMap[s] || 0,
    href: `/premium/bolum/${encodeURIComponent(s)}`
  }));

  res.json({
    hero: {
      title: 'Premium İçerikler',
      subtitle: 'YDUS, TUS ve Board/USMLE odaklı, iç hastalıkları için premium modüller'
    },
    modules: [
      {
        id: 'ydus',
        title: 'YDUS',
        stats: { questions: ydusQ },
        links: [
          { label: 'Genel YDUS', href: '/premium/ydus' },
          { label: '120 Günlük Program', href: '/premium/ydus/program' },
          { label: 'Açıklamalı Soru Çözümü', href: '/premium/ydus/soru-cozum' }
        ]
      },
      {
        id: 'tus',
        title: 'TUS',
        stats: { questions: tusQ },
        links: [
          { label: 'Genel TUS', href: '/premium/tus' },
          { label: '120 Günlük Program', href: '/premium/tus/program' },
          { label: 'Açıklamalı Soru Çözümü', href: '/premium/tus/soru-cozum' }
        ]
      },
      {
        id: 'board',
        title: 'Board / USMLE',
        stats: { questions: boardQ },
        links: [
          { label: 'Board Ana Alanı', href: '/premium/board' },
          { label: 'Vaka Tabanlı Öğrenme', href: '/premium/board/cases' },
          { label: 'Qbank (EN)', href: '/premium/board/qbank' }
        ]
      }
    ],
    sections
  });
}
