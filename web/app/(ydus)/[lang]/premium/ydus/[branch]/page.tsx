import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import KategorilerClient from './KategorilerClient';
import { listelenmeyenKategori } from '@/lib/premium-brans';
import { rotaMeta } from "@/lib/site";

export const revalidate = 86400;

/**
 * Bu sayfanın kendi metadata'sı OLMAK ZORUNDA — panonun (`../page.tsx`)
 * gerekçesiyle birebir aynı sebep, orada düzeltilmiş ama BURADA kalmıştı.
 *
 * OLCULDU (canlıda): dokuz premium branş sayfasının dokuzu da kök düzenin
 * `alternates: { canonical: "/" }` değerini miras alıyordu, yani her biri
 * arama motoruna "ben ana sayfanın kopyasıyım" diyordu. Aynı ölçümde
 * `<title>` de kökün genel başlığıydı ("MediSea — Dahiliye için Türkçe
 * klinik kaynak"), oysa her sayfanın `<h1>`i ayrı (Endokrinoloji · Tıbbi
 * Onkoloji · Göğüs Hastalıkları…): sekme, yer imi ve paylaşım başlığı
 * ayırt edilemiyordu.
 *
 * Başlık ve açıklama `<h1>` ile AYNI kaynaktan (`veri.meta`) türüyor —
 * ikinci bir gerçeklik üretilmiyor.
 *
 * `openGraph` artık `rotaMeta` üzerinden geliyor. Bir dönem burada bilerek
 * TANIMLANMIYORDU ("kökteki dosya tabanlı paylaşım görseli miras kalsın")
 * ve o inanç ÖLÇÜMLE ÇÜRÜTÜLDÜ: `images` verilmedikçe görsel mirası
 * sürüyor (`/tools/bmi` ikisini birden yapıyor). İnancın bedeli, sekme
 * başlığı düzelmişken PAYLAŞIM KARTININ hâlâ ana sayfayı göstermesiydi.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; branch: string }>;
}): Promise<Metadata> {
  const { branch } = await params;
  const veri = bransYukle(branch);
  if (!veri) return {};
  return rotaMeta({
    baslik: `${veri.meta.baslik} — YDUS`,
    aciklama: veri.meta.aciklama,
    yol: `/tr/premium/ydus/${branch}`,
  });
}

/**
 * Aynı sebep satış sayfasındaki gibi: `[lang]` için üretilecek değerler
 * bildirilmediği sürece rota dinamik kalıyor ve `revalidate` hiç işlemiyor
 * (canlıda ölçüldü, her istekte MISS).
 *
 * Branşlar dosya sisteminden sayılıyor — elle liste tutmak, yeni bir branş
 * eklendiğinde sessizce eskir. Listede olmayan bir branş adresi hâlâ
 * çalışır, yalnızca önceden üretilmemiş olur.
 */
export function generateStaticParams() {
  try {
    const dizin = path.join(process.cwd(), 'content', 'premium', 'ydus', 'branches');
    return fs
      .readdirSync(dizin)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ lang: 'tr', branch: f.replace(/\.json$/, '') }));
  } catch {
    return [{ lang: 'tr', branch: 'endokrinoloji' }];
  }
}

interface Konu {
  id: string;
  baslik: string;
  rozetler: string[];
  hazir: boolean;
}

interface Kategori {
  id: string;
  baslik: string;
  aciklama: string;
  emoji: string;
  konular: Konu[];
}

interface BransVerisi {
  meta: {
    id: string;
    baslik: string;
    aciklama: string;
    renk: string;
    emoji: string;
  };
  kategoriler: Kategori[];
}

function bransYukle(branch: string): BransVerisi | null {
  try {
    const dosyaYolu = path.join(
      process.cwd(),
      'content', 'premium', 'ydus', 'branches', `${branch}.json`
    );
    const icerik = fs.readFileSync(dosyaYolu, 'utf-8');
    const veri = JSON.parse(icerik) as BransVerisi;
    listelenmeyenleriEkle(branch, veri);
    return veri;
  } catch {
    return null;
  }
}

/** Listelenmemiş konuları da görünür kılar — gerekçesi lib/premium-brans.ts içinde. */
function listelenmeyenleriEkle(branch: string, veri: BransVerisi) {
  const ek = listelenmeyenKategori(branch, veri.kategoriler ?? []);
  if (ek) veri.kategoriler = [...(veri.kategoriler ?? []), ek];
}


export default async function BransSayfasi({
  params,
}: {
  params: Promise<{ lang: string; branch: string }>;
}) {
  const { lang, branch } = await params;
  const veri = bransYukle(branch);

  // notFound(): kart doğrudan basıldığında HTTP durumu 200 kalıyordu —
  // yumuşak 404. Görünüm not-found.tsx`ye taşındı, durum kodu düzeldi.
  if (!veri) notFound();

  const toplamKonu = veri.kategoriler.reduce((acc, kat) => acc + kat.konular.length, 0);
  const hazirKonu = veri.kategoriler.reduce(
    (acc, kat) => acc + kat.konular.filter(k => k.hazir).length, 0
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1a2a3a',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Kırıntı yolu — açık taraftaki kalıpla AYNI: adlandırılmış
            landmark + liste + aria-current. Ölçüldü: bu <nav> ADSIZDI ve
            konu sayfasında İKİ nav landmark'ı olup yalnızca biri adlıydı,
            yani ekran okuyucu ikisini ayırt edemiyordu.

            "Ana sayfa" -> "YDUS Hazırlık": bağlantı site köküne değil
            premium PANOSUNA gidiyor ve o sayfanın kendi <h1>'i
            "YDUS Hazırlık". Etiket gittiği yeri söylemeliydi. */}
        <nav aria-label="Kırıntı yolu" style={{ marginBottom: '1.5rem' }}>
          <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4a6a8a', listStyle: 'none', margin: 0, padding: 0 }}>
            {/* Kök "MediSea": açık taraf ve araç sayfaları da böyle
                başlıyor. Ayrıca premium ağacının açık siteye TEK çıkışı —
                ölçüldü, bu sayfalarda /, /topics ve /tools bağlantısı
                sayısı SIFIRDI. */}
            <li>
              <Link href="/" style={{ color: '#4a6a8a', textDecoration: 'none', fontWeight: 500, display: 'inline-block', padding: '4px 2px' }}>
                MediSea
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">/</span>
              <Link href={`/${lang}/premium/ydus`} style={{ color: '#1a3a6b', textDecoration: 'none', fontWeight: 500, display: 'inline-block', padding: '4px 2px' }}>
                YDUS Hazırlık
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">/</span>
              <span aria-current="page" style={{ color: veri.meta.renk, fontWeight: 500 }}>{veri.meta.baslik}</span>
            </li>
          </ol>
        </nav>

        {/* HERO */}
        <div style={{
          border: '0.5px solid #b8cfe8',
          borderLeft: `4px solid ${veri.meta.renk}`,
          borderRadius: '0 12px 12px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          background: '#f5f9ff',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          /**
           * Ölçüldü (320px): bu satır sarmadığı için kutu 283px'e sığarken
           * içerik 299px'e çıkıyordu — üç çocuk (ikon · başlık+açıklama ·
           * konu sayacı) 16px'lik boşluklarla yan yana dizilince taşıyor.
           * Kutu sınır içinde kaldığı için taşma yalnızca `scrollWidth`
           * ölçütüyle görünüyor; belge kaydırması vermiyor.
           */
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#fff',
            border: `0.5px solid #b8cfe8`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            flexShrink: 0,
          }}>
            {veri.meta.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1a3a6b', marginBottom: '0.25rem' }}>
              {veri.meta.baslik}
            </h1>
            <p style={{ fontSize: '13px', color: '#4a6a8a', lineHeight: 1.5, margin: 0 }}>
              {veri.meta.aciklama}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: veri.meta.renk }}>{hazirKonu}</div>
            <div style={{ fontSize: '11px', color: '#4a6a8a' }}>{toplamKonu} konudan</div>
          </div>
        </div>

        {/* KATEGORİLER */}
        <KategorilerClient
          kategoriler={veri.kategoriler}
          bransRenk={veri.meta.renk}
          lang={lang}
          branch={branch}
        />

        {/* ALT NAVİGASYON */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '0.5px solid #d0e4f5' }}>
          <Link href={`/${lang}/premium/ydus`} style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#1a3a6b',
            border: '0.5px solid #b8cfe8',
            borderRadius: '8px',
            padding: '7px 14px',
            background: '#f5f9ff',
            textDecoration: 'none',
          }}>
            {/* "Ana sayfa" DEĞİL: bağlantı site köküne değil premium
                PANOSUNA gidiyor ve o sayfanın kendi <h1>'i "YDUS Hazırlık".
                Üstelik AYNI sayfada gerçek site köküne giden bir bağlantı
                da var ("MediSea", kırıntının ilk adımı) — yani "Ana sayfa"
                var olan BAŞKA bir sayfayı adlandırıyordu.

                Ölçüldü: bu sayfada aynı hedefe giden iki bağlantı vardı ve
                adları ayrışıyordu ("YDUS Hazırlık" ↔ "← Ana sayfa"). Aynı
                kusur kırıntı yolunda bir tur önce düzeltilmiş, kardeş
                bağlantı atlanmıştı. */}
            ← YDUS Hazırlık
          </Link>
        </div>

      </div>
    </div>
  );
}
