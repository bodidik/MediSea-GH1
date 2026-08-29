// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\page.tsx"
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import YdusDashboardClient, { type BranchCard, type LockedBranch, type NewestTopic } from './YdusDashboardClient';
import { sinavlariOku } from '@/lib/sinav.server';
import { envanterAl } from '@/lib/premium-envanter';
import { listelenmeyenKategori } from '@/lib/premium-brans';
import { icerikSayilari } from '@/lib/icerik-sayaci';
import { rotaMeta } from "@/lib/site";

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
  /**
   * ÖLÜ ALAN — hiçbir yerde okunmuyor, sayılar `envanterAl`den geliyor.
   * 42 dosyanın 5'inde ilan gerçekle çoktan ayrışmış (ölçüldü). Tipte
   * durmasının tek sebebi alanın veride bulunması; ona GÜVENME.
   */
  istatistikler?: {
    soru?: number;
  };
  meta?: {
    /** "2026-07" — ay hassasiyetinde, içerik yazarı tarafından tutuluyor. */
    guncelleme?: string;
  };
}

type NewestTopicRaw = NewestTopic & { guncelleme: string | null };

// İçerik dosyası henüz eklenmemiş, ilerleyen dönemde açılacak branşlar
const LOCKED_BRANCHES: LockedBranch[] = [];

/**
 * PANODAKİ BRANŞ SIRASI — küratörlü, ama LİSTE dizinden türer.
 *
 * Bu dizi bir dönem panonun TEK kaynağıydı ve elle tutuluyordu. Kardeş sayfa
 * (`[branch]/page.tsx`) ise listeyi `readdirSync` ile ÜRETİYOR: yani aynı
 * ilişki aynı özellikte iki ayrı yoldan okunuyordu. Yeni bir branş JSON'u
 * eklendiğinde branş sayfası açılıyor ama PANODA hiç görünmüyordu.
 *
 * Şimdi: küme dizinden, SIRA buradan. Listede olmayan branşlar sona
 * alfabetik ekleniyor — `listelenmeyenKategori()` ile aynı 'kendini onaran
 * okuma' kalıbı, bir düzey yukarıda.
 */
const BRANS_SIRASI = ['endokrinoloji', 'hematoloji', 'romatoloji', 'gogus-hastaliklari', 'gastroenteroloji', 'nefroloji', 'kardiyoloji', 'onkoloji', 'enfeksiyon', 'genel-dahiliye'];

function bransKimlikleri(): string[] {
  let dosyalar: string[] = [];
  try {
    dosyalar = fs
      .readdirSync(path.join(process.cwd(), 'content', 'premium', 'ydus', 'branches'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.slice(0, -5)); // '.json' zaten süzüldü — regex kaçışına gerek yok
  } catch {
    return BRANS_SIRASI; // dizin okunamazsa eski davranış
  }
  const kume = new Set(dosyalar);
  const sirali = BRANS_SIRASI.filter((id) => kume.has(id));
  // readdirSync sırası PLATFORMA bağlı (bkz. CLAUDE.md) — sona eklenenler
  // kod noktasına göre sıralanır ki Linux ve Windows aynı çıktıyı versin.
  const ek = dosyalar.filter((id) => !BRANS_SIRASI.includes(id)).sort();
  return [...sirali, ...ek];
}

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

function konuYukle(branchId: string, topicId: string): KonuVerisi | null {
  try {
    const dosyaYolu = path.join(process.cwd(), 'content', 'premium', 'ydus', 'topics', branchId, `${topicId}.json`);
    return JSON.parse(fs.readFileSync(dosyaYolu, 'utf-8')) as KonuVerisi;
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
 * `openGraph` `rotaMeta` üzerinden geliyor — başlık ve açıklamanın ikinci bir kopyası tutulmuyor. Bir dönem "görsel mirası bozulur" diye hiç yazılmıyordu; ölçüm çürüttü (`images` verilmedikçe miras sürüyor) ve o inancın bedeli paylaşım kartının ana sayfayı göstermesiydi.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = icerikSayilari();
  return {
    ...rotaMeta({
      baslik: 'YDUS Hazırlık — Dahiliye',
      aciklama: `Dahiliye YDUS hazırlığı: ${s.premiumBrans} branşta ${s.premiumKonu} hazır konu, ` +
      `${s.premiumSoru} çözümlü soru, ${s.premiumKart} tekrar kartı ve klinik vaka ` +
      'oturumları. Vurgula, not al, aralıklı tekrarla çalış.',
      yol: '/tr/premium/ydus',
    }),
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

  for (const id of bransKimlikleri()) {
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
          guncelleme: konuVerisi?.meta?.guncelleme?.slice(0, 7) ?? null,
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

  /**
   * "YENİ EKLENDİ" BİR İDDİA — ve dosya değişiklik zamanı onu üretemez.
   *
   * Burası `mtimeMs` ile sıralıyordu ve yanındaki yorum gerekçeyi de yazmıştı
   * ("guncelleme yalnızca ay hassasiyetinde, gerçek sırayı dosya sistemi
   * belirler"). Gerekçe ÜRETİMDE geçersiz: Vercel her derlemede depoyu
   * checkout ediyor, yani bütün mtime'lar derleme anı ve sıra içerik
   * tazeliğini değil checkout sırasını yansıtıyor. Aynı sınıf `sitemap.ts`te
   * zaten ölçülüp kaldırılmıştı (`mtime` yedeği); pano o turun dışında kaldı.
   *
   * Canlıda ölçüldü — pano "Yeni eklendi" diye SLE'yi (2026-07) gösteriyor,
   * "yeni" rozetli altı konunun yalnızca BİRİ en yeni aya ait ve gerçekten en
   * yeni üç konu (feokromositoma, MEN sendromları, MEN1) listede hiç yok.
   *
   * Çare ay hassasiyetiyle yaşamak: `guncelleme`ye göre sırala ve YALNIZCA EN
   * YENİ AYI göster. Ay içinde sıra keyfi olurdu, o yüzden "yeni" rozeti
   * hiçbir zaman daha eski bir aya takılmıyor — az ama doğru bir liste,
   * çok ama yanlış bir listeden iyidir. Kimsede `guncelleme` yoksa liste
   * boşalır ve iki blok da hiç çizilmez (dürüst boş durum).
   *
   * Sıralama BELİRLENİMLİ: aynı ay içinde branş+konu kimliğine göre kod
   * noktası sırası (`localeCompare` DEĞİL — o çalışma zamanı yereline bağlı
   * ve bu depoda bir kez CI'ı 97 koşum boyunca kırdı).
   */
  const enYeniAy = newest.reduce<string | null>(
    (m, t) => (t.guncelleme && (!m || t.guncelleme > m) ? t.guncelleme : m),
    null,
  );
  const yeniler = enYeniAy ? newest.filter((t) => t.guncelleme === enYeniAy) : [];
  yeniler.sort((a, b) =>
    a.branchId === b.branchId ? (a.topicId < b.topicId ? -1 : a.topicId > b.topicId ? 1 : 0)
      : a.branchId < b.branchId ? -1 : 1,
  );

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
      newest={yeniler.slice(0, 6).map(({ guncelleme, ...rest }) => rest)}
      overall={overall}
      sinavlar={sinavlariOku()}
      hazirKonular={hazirKonular}
    />
  );
}
