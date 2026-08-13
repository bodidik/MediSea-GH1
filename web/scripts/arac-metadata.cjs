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
const KAYNAK = path.join(ARAC_DIZIN, 'page.tsx');

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
  return <>{children}</>;
}
`;
}

function main() {
  const zorla = process.argv.includes('--force');
  const araclar = araclariOku();

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

  console.log(`araç kaydı: ${araclar.length}`);
  console.log(`yazılan layout: ${yazilan}`);
  if (atlanan) console.log(`atlanan: ${atlanan}`);
  if (sayfasiz.length) console.log(`sayfası olmayan (layout üretilmedi): ${sayfasiz.join(', ')}`);
}

main();
