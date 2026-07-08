// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\page.tsx"
import fs from 'fs';
import path from 'path';
import YdusDashboardClient, { type BranchCard, type LockedBranch, type NewestTopic } from './YdusDashboardClient';

export const revalidate = 3600;

interface Konu {
  id: string;
  baslik: string;
  hazir: boolean;
}

interface Kategori {
  konular: Konu[];
}

interface BransVerisi {
  meta: {
    baslik: string;
    renk: string;
    emoji: string;
  };
  kategoriler: Kategori[];
}

interface KonuVerisi {
  istatistikler?: {
    soru?: number;
  };
}

type NewestTopicRaw = NewestTopic & { mtimeMs: number };

// İçerik dosyası henüz eklenmemiş, ilerleyen dönemde açılacak branşlar
const LOCKED_BRANCHES: LockedBranch[] = [
  { id: 'tibbi_onkoloji', baslik: 'Tıbbi Onkoloji' },
  { id: 'enfeksiyon', baslik: 'Enfeksiyon Hastalıkları' },
];

const BRANCH_IDS = ['endokrinoloji', 'hematoloji', 'romatoloji', 'gogus-hastaliklari', 'gastroenteroloji', 'nefroloji', 'kardiyoloji'];

function bransYukle(id: string): BransVerisi | null {
  try {
    const dosyaYolu = path.join(process.cwd(), 'content', 'premium', 'ydus', 'branches', `${id}.json`);
    return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8')) as BransVerisi;
  } catch {
    return null;
  }
}

function konuYukle(branchId: string, topicId: string): (KonuVerisi & { mtimeMs: number }) | null {
  try {
    const dosyaYolu = path.join(process.cwd(), 'content', 'premium', 'ydus', 'topics', branchId, `${topicId}.json`);
    const veri = JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8')) as KonuVerisi;
    // "guncelleme" alanı yalnızca ay hassasiyetinde (ör. "2026-07") olduğundan
    // gerçek "en son eklenen" sırasını dosya sistemi değişiklik zamanı belirler
    const mtimeMs = fs.statSync(dosyaYolu).mtimeMs;
    return { ...veri, mtimeMs };
  } catch {
    return null;
  }
}

export default async function YdusAnaSayfa({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const branches: BranchCard[] = [];
  const newest: NewestTopicRaw[] = [];

  for (const id of BRANCH_IDS) {
    const veri = bransYukle(id);
    if (!veri) continue;

    let totalTopics = 0;
    let readyTopics = 0;
    let soruToplam = 0;

    for (const kat of veri.kategoriler) {
      for (const konu of kat.konular) {
        totalTopics += 1;
        if (!konu.hazir) continue;

        readyTopics += 1;
        const konuVerisi = konuYukle(id, konu.id);
        const soru = konuVerisi?.istatistikler?.soru ?? 0;
        soruToplam += soru;

        newest.push({
          topicId: konu.id,
          branchId: id,
          baslik: konu.baslik,
          soru,
          mtimeMs: konuVerisi?.mtimeMs ?? 0,
        });
      }
    }

    branches.push({
      id,
      baslik: veri.meta.baslik,
      emoji: veri.meta.emoji,
      renk: veri.meta.renk,
      readyTopics,
      totalTopics,
      soru: soruToplam,
    });
  }

  newest.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const overall = branches.reduce(
    (acc, b) => ({
      readyTopics: acc.readyTopics + b.readyTopics,
      totalTopics: acc.totalTopics + b.totalTopics,
      soru: acc.soru + b.soru,
    }),
    { readyTopics: 0, totalTopics: 0, soru: 0 }
  );

  return (
    <YdusDashboardClient
      lang={lang}
      branches={branches}
      lockedBranches={LOCKED_BRANCHES}
      newest={newest.slice(0, 6).map(({ mtimeMs, ...rest }) => rest)}
      overall={overall}
    />
  );
}
