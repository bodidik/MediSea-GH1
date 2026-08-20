#!/usr/bin/env node
/**
 * Her araç sayfası için metadata taşıyan bir layout.tsx üretir.
 *
 * Neden layout? Araç sayfalarının hepsi "use client" ve istemci bileşenleri
 * metadata dışa aktaramaz. Next'te bu durumun standart çözümü, aynı klasöre
 * yalnızca metadata taşıyan bir sunucu layout'u koymaktır.
 *
 * Neden betik? 114 araç var ve liste büyüyor. Elle yazılan başlık, ilk yeni
 * araçta eskimeye başlar; kaynak tek yerde (TOOLS_DATABASE) kalsın diye
 * başlıklar oradan türetiliyor.
 *
 * Kullanım (web/ dizininden):
 *   node scripts/arac-metadata.cjs          # eksikleri üret
 *   node scripts/arac-metadata.cjs --force  # hepsini yeniden yaz
 */
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const ARAC_DIZIN = path.join(KOK, 'app', 'tools');

/**
 * KAYNAK `page.tsx` DEĞİL `ToolsIcerik.tsx`.
 *
 * `TOOLS_DATABASE` bir dönem `page.tsx` içindeydi. `/tools` sunucu kabuk +
 * istemci içerik olarak bölününce (statik prerender için) veri
 * `ToolsIcerik.tsx`'e taşındı, ama bu betik eski yolu okumaya devam etti.
 *
 * Sonuç ÖLÇÜLDÜ ve sessizdi: betik hiç araç bulamıyor, "0 araç" deyip
 * `content/arac-index.json` dosyasının 114 kaydını BOŞ DİZİYLE eziyordu.
 * Üstelik bu betik belgede "yeni araç eklendiğinde çalıştır" diye yazılı —
 * yani bakım komutunun kendisi veri siliyordu.
 */
const KAYNAK = path.join(ARAC_DIZIN, 'ToolsIcerik.tsx');

/**
 * Başlık uzunluğu sınırı. Şablon " · MediSea" ekliyor; arama sonucunda ~60-65
 * karakterde kırpılma başlıyor ama önemli olan baştaki terimler zaten görünür.
 * Sınırı fazla dar tutmak cümleyi yarıda kesiyordu ("böbrek fonksiyon" gibi),
 * o yüzden biraz genişletildi.
 */
const BASLIK_SINIRI = 56;

function araclariOku() {
  const s = fs.readFileSync(KAYNAK, 'utf8');

  // Kategori nesneleri de slug taşıyor; onları ayıkla (category/slug/icon üçlüsü).
  const kategoriSlug = new Set(
    [...s.matchAll(/slug:\s*"([a-z-]+)",\s*\n\s*icon:/g)].map((m) => m[1])
  );

  const re = /slug:\s*"([^"]+)"\s*,\s*name:\s*"([^"]*)"\s*,\s*desc:\s*"([^"]*)"/g;
  const bulunan = new Map();
  let m;
  while ((m = re.exec(s))) {
    const [, slug, name, desc] = m;
    if (kategoriSlug.has(slug)) continue;
    // Aynı araç iki kategoride listelenebiliyor; daha açıklayıcı olanı tut.
    const mevcut = bulunan.get(slug);
    if (!mevcut || desc.length > mevcut.desc.length) bulunan.set(slug, { slug, name, desc });
  }
  return [...bulunan.values()];
}

/** "MUST" + "Malnutrition Universal Screening Tool — ..." -> "MUST — Malnutrition Universal Screening Tool" */
function baslikUret(name, desc) {
  const pay = BASLIK_SINIRI - name.length - 3; // " — " için
  if (pay < 12) return name;

  // Açıklamaların çoğu "Açılım — ayrıntı" biçiminde; ilk parça başlık için en iyisi.
  const ilkParca = desc.split('—')[0].trim() || desc.trim();
  let ek = ilkParca;

  if (ek.length > pay) {
    const kirpik = ek.slice(0, pay);
    const bosluk = kirpik.lastIndexOf(' ');
    ek = (bosluk > 8 ? kirpik.slice(0, bosluk) : kirpik).trim();
  }

  // Kırpma yarım parantez bırakmışsa oradan itibaren at: "…indeksi (açlık glukoz ×"
  const acilis = ek.lastIndexOf('(');
  if (acilis > 0 && ek.indexOf(')', acilis) === -1) ek = ek.slice(0, acilis).trim();

  // Cümle ortasında kalan bağlaç/işaret sarkıntılarını temizle.
  ek = ek.replace(/[\s,;:.·•×÷±+&/\\|_–—-]+$/u, '').trim();

  // Birimi kırpılmış yalnız sayıyı at: "…NSTEMI 14" (günlük gitmiş) anlamsız.
  ek = ek.replace(/\s+\d+([.,]\d+)?$/u, '').trim();

  if (ek.length < 8) return name;
  // Açılım zaten adı içeriyorsa tekrar etme (ör. "IPI" / "IPI Skoru").
  if (ek.toLocaleLowerCase('tr').includes(name.toLocaleLowerCase('tr'))) return ek;

  return `${name} — ${ek}`;
}

function aciklamaUret(name, desc) {
  // Aranan terim başta dursun: sonuç listesinde ilk kelimeler okunuyor.
  const govde = desc.replace(/\s+/g, ' ').trim().replace(/[.]+$/, '');
  return `${name}: ${govde}. Ücretsiz klinik hesaplayıcı — MediSea.`;
}

function dosyaIcerigi({ slug, name, desc }) {
  const baslik = baslikUret(name, desc);
  const aciklama = aciklamaUret(name, desc);
  const yol = `/tools/${slug}`;

  return `// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: ${JSON.stringify(baslik)},
  description: ${JSON.stringify(aciklama)},
  alternates: { canonical: ${JSON.stringify(yol)} },
  openGraph: {
    type: "website",
    title: ${JSON.stringify(baslik)},
    description: ${JSON.stringify(aciklama)},
    url: ${JSON.stringify(yol)},
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: ${JSON.stringify(name)},
          aciklama: ${JSON.stringify(aciklama)},
          yol: ${JSON.stringify(yol)},
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: ${JSON.stringify(name)}, yol: ${JSON.stringify(yol)} },
        ])}
      />
      {children}
    </>
  );
}
`;
}

/**
 * `--kontrol`: HİÇBİR ŞEY YAZMADAN indeksin senkron olup olmadığını söyler.
 *
 * Neden gerekli: bu betik CI'da çalışmıyor, elle çalıştırılıyor. Biri araç
 * ekleyip betiği unutursa `content/arac-index.json` bayatlıyor ve kimse
 * görmüyor. Sonuç sessiz: ana sayfadaki araç sayısı bu indeksten geliyor
 * (çalışma zamanında `app/tools` okunamıyor, sunucusuz ortamda kaynak
 * dizin yok), yani yanlış sayı canlıda görünüyor.
 *
 * Kontrol kipinin yazmaması bilinçli — CI'da bir betiğin depoyu
 * değiştirmesi istenmez. Fark varsa çıkış kodu 1.
 */
function kontrolEt(sayfasiOlan) {
  const indexYolu = path.join(KOK, 'content', 'arac-index.json');
  let mevcut = null;
  try {
    mevcut = JSON.parse(fs.readFileSync(indexYolu, 'utf8'));
  } catch {
    console.error('HATA: content/arac-index.json okunamadı ya da bozuk.');
    process.exitCode = 1;
    return;
  }
  const beklenen = sayfasiOlan
    .map(({ slug, name, desc }) => ({ slug, name, desc }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const m = new Map(mevcut.map((x) => [x.slug, x]));
  const b = new Map(beklenen.map((x) => [x.slug, x]));
  const eksik = [...b.keys()].filter((s) => !m.has(s));
  const fazla = [...m.keys()].filter((s) => !b.has(s));
  const degisen = [...b.keys()].filter(
    (s) => m.has(s) && JSON.stringify(m.get(s)) !== JSON.stringify(b.get(s))
  );

  if (!eksik.length && !fazla.length && !degisen.length) {
    console.log(`arac-index.json senkron (${beklenen.length} araç).`);
    return;
  }
  console.error('arac-index.json BAYAT — `node scripts/arac-metadata.cjs` çalıştır.');
  if (eksik.length) console.error(`  indekste yok  : ${eksik.join(', ')}`);
  if (fazla.length) console.error(`  fazladan var  : ${fazla.join(', ')}`);
  if (degisen.length) console.error(`  ad/açıklama değişmiş: ${degisen.join(', ')}`);
  process.exitCode = 1;
}

function main() {
  const zorla = process.argv.includes('--force');
  const kontrol = process.argv.includes('--kontrol');
  const araclar = araclariOku();

  if (kontrol) {
    if (araclar.length === 0) {
      console.error(
        `HATA: ayrıştırma 0 araç buldu — ${path.relative(KOK, KAYNAK)} okunamadı ` +
          `ya da TOOLS_DATABASE biçimi değişti.`
      );
      process.exitCode = 1;
      return;
    }
    kontrolEt(
      araclar.filter((a) => fs.existsSync(path.join(ARAC_DIZIN, a.slug, 'page.tsx')))
    );
    return;
  }

  let yazilan = 0;
  let atlanan = 0;
  const sayfasiz = [];

  for (const arac of araclar) {
    const dizin = path.join(ARAC_DIZIN, arac.slug);
    if (!fs.existsSync(path.join(dizin, 'page.tsx'))) {
      sayfasiz.push(arac.slug);
      continue;
    }

    const hedef = path.join(dizin, 'layout.tsx');
    if (fs.existsSync(hedef) && !zorla) {
      const mevcut = fs.readFileSync(hedef, 'utf8');
      // Betiğin yazmadığı bir layout varsa dokunma — elle yazılmış olabilir.
      if (!mevcut.includes('scripts/arac-metadata.cjs')) {
        console.warn(`  ATLANDI (elle yazılmış layout): ${arac.slug}`);
        atlanan++;
        continue;
      }
    }

    fs.writeFileSync(hedef, dosyaIcerigi(arac));
    yazilan++;
  }

  // Araç listesini content/ altına da yaz.
  //
  // Neden: çalışma zamanında app/tools klasörü OKUNAMIYOR. Sunucusuz ortamda
  // yalnızca derleme çıktısı bulunuyor, kaynak app/ dizini yok. Ana sayfa
  // dinamik olduğu için araç sayısını istek anında sayıyordu ve canlıda 0
  // çıkıyordu (yerelde 114). content/ dizini izlenip pakete girdiği için
  // buradan okumak her iki ortamda da çalışıyor.
  const sayfasiOlan = araclar.filter((a) =>
    fs.existsSync(path.join(ARAC_DIZIN, a.slug, 'page.tsx'))
  );
  const indexYolu = path.join(KOK, 'content', 'arac-index.json');

  /**
   * SIFIR ARAÇTA YAZMA — bu koruma olmadan betik veri siliyordu.
   *
   * Ayrıştırma bir varsayıma dayanıyor (kaynak dosyanın yeri ve
   * `TOOLS_DATABASE` biçimi). Varsayım bozulduğunda betik hata vermiyor,
   * boş bir liste üretiyor ve onu diske yazıyordu. Ölçüldü: 114 kayıtlık
   * indeks tek çalıştırmada `[]` oldu.
   *
   * Boş sonuç bu depoda ASLA meşru değil: araç sayfaları dosya sisteminde
   * duruyor, yani sıfır bulmak "araç yok" demek değil "ayrıştırma bozuldu"
   * demek. Sessizce yazmak yerine yüksek sesle düşüyoruz.
   */
  if (sayfasiOlan.length === 0) {
    console.error(
      `HATA: ayrıştırma 0 araç buldu — ${path.relative(KOK, KAYNAK)} okunamadı ` +
        `ya da TOOLS_DATABASE biçimi değişti.\n` +
        `content/arac-index.json DEĞİŞTİRİLMEDİ (mevcut kayıtlar korundu).`
    );
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(
    indexYolu,
    JSON.stringify(
      sayfasiOlan
        .map(({ slug, name, desc }) => ({ slug, name, desc }))
        .sort((a, b) => a.slug.localeCompare(b.slug)),
      null,
      1
    ) + '\n'
  );
  console.log(`yazıldı: content/arac-index.json (${sayfasiOlan.length} araç)`);

  console.log(`araç kaydı: ${araclar.length}`);
  console.log(`yazılan layout: ${yazilan}`);
  if (atlanan) console.log(`atlanan: ${atlanan}`);
  if (sayfasiz.length) console.log(`sayfası olmayan (layout üretilmedi): ${sayfasiz.join(', ')}`);
}

main();
