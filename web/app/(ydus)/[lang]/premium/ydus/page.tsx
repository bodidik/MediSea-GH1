// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\page.tsx"
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import YdusDashboardClient, { type BranchCard, type LockedBranch, type NewestTopic } from './YdusDashboardClient';
import { sinavlariOku } from '@/lib/sinav.server';
import { envanterAl } from '@/lib/premium-envanter';
import { listelenmeyenKategori } from '@/lib/premium-brans';
import { icerikSayilari } from '@/lib/icerik-sayaci';

export const revalidate = 3600;

/**
 * `revalidate` TEK BAŞINA yetmiyor.
 *
 * Sayfa `[lang]` altında ve Next hangi dil değerlerini önceden üreteceğini
 * bilemediği için rota dinamik kalıyordu: derleme tablosunda `ƒ`, canlıda
 * her istekte `x-vercel-cache: MISS`. Yani satış sayfası — arama motorunun
 * gördüğü ilk premium yüzey — hiç önbelleğe girmiyordu ve `revalidate`
 * ölü bir ayardı.
 *
 * Tek dil üretiliyor: içeriğin tamamı Türkçe ve yanlış önekli adresler
 * next.config.js'teki yönlendirmeyle zaten /tr'ye toplanıyor.
 */
export function generateStaticParams() {
  return [{ lang: 'tr' }];
}

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
const LOCKED_BRANCHES: LockedBranch[] = [];

const BRANCH_IDS = ['endokrinoloji', 'hematoloji', 'romatoloji', 'gogus-hastaliklari', 'gastroenteroloji', 'nefroloji', 'kardiyoloji', 'onkoloji', 'enfeksiyon', 'kaynak-sorulari'];

function bransYukle(id: string): BransVerisi | null {
  try {
    const dosyaYolu = path.join(process.cwd(), 'content', 'premium', 'ydus', 'branches', `${id}.json`);
    const veri = JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8')) as BransVerisi;
    // Branş sayfasıyla AYNI onarım: listede adı geçmeyen konu dosyaları da
    // sayılsın ve çalışma planına girsin. Aksi hâlde pano ile branş sayfası
    // farklı sayı gösterir, plan da bitmiş bir konuyu hiç önermez.
    const ek = listelenmeyenKategori(id, veri.kategoriler ?? []);
    if (ek) veri.kategoriler = [...(veri.kategoriler ?? []), ek];
    return veri;
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

/**
 * Bu sayfanın kendi metadata'sı OLMAK ZORUNDA.
 *
 * Yoksa kök düzenin `alternates: { canonical: "/" }` değerini miras alıyor ve
 * satış sayfası arama motoruna "ben ana sayfanın kopyasıyım" diyor — canlıda
 * tam olarak bu oluyordu. robots.ts premium konu sayfalarını kapatırken bu
 * sayfayı bilerek taramaya açık bırakıyor ("satış oradan yapılıyor"), yani
 * niyet ile davranış ters düşmüştü: taranabilir ama asla sıralanamaz.
 *
 * canonical dil değişkenine DEĞİL sabit /tr'ye bağlanıyor: içeriğin tamamı
 * Türkçe, farklı bir dil öneki yalnızca aynı sayfanın kopyasını üretir.
 *
 * `openGraph` bilerek TANIMLANMIYOR — burada tanımlanırsa kökteki dosya
 * tabanlı paylaşım görseli miras alınmayı bırakır ve sayfa görselsiz kalır
 * (bkz. CLAUDE.md, metadata mirası tuzakları).
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = icerikSayilari();
  return {
    title: 'YDUS Hazırlık — Dahiliye',
    description:
      `Dahiliye YDUS hazırlığı: ${s.premiumBrans} branşta ${s.premiumKonu} hazır konu, ` +
      `${s.premiumSoru} çözümlü soru, ${s.premiumKart} tekrar kartı ve klinik vaka ` +
      'oturumları. Vurgula, not al, aralıklı tekrarla çalış.',
    alternates: { canonical: '/tr/premium/ydus' },
  };
}

export default async function YdusAnaSayfa({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const branches: BranchCard[] = [];
  const newest: NewestTopicRaw[] = [];
  // Çalışma planı gerçek envanter üzerinden kuruluyor: yalnızca "hazır"
  // işaretli konular. Hazır olmayan bir konuyu programa koymak, kullanıcıyı
  // olmayan içeriğe göndermek olurdu.
  const hazirKonular: { brans: string; id: string; baslik: string }[] = [];

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
        hazirKonular.push({ brans: id, id: konu.id, baslik: konu.baslik });
        const konuVerisi = konuYukle(id, konu.id);
        // İlan edilen sayı değil, gerçek quiz dosyasındaki soru sayısı.
        // İlana güvenildiğinde pano, olmayan sorular dahil bir toplam
        // gösteriyordu (ör. aml-ana 24 ilan ediyor, gerçekte 9).
        const soru = envanterAl(id, konu.id).soru;
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
      sinavlar={sinavlariOku()}
      hazirKonular={hazirKonular}
    />
  );
}
