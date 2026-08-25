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

/**
 * KATEGORİ YAPISIYLA okuma — `araclariOku` düz bir liste veriyor, burada
 * araçların hangi kategoride durduğu da korunuyor.
 *
 * Buna ihtiyaç `app/lib/tools.ts` içindeki ELLE TUTULAN `BRANCH_TOOLS`
 * listesinin bayatlaması yüzünden doğdu. ÖLÇÜLDÜ (canlı, 130 araçlık
 * kütüphanede): branş sayfasının şeridi ile hub'ın aynı branş kategorisi
 * İKİ BRANŞTA HİÇ ÖRTÜŞMÜYORDU —
 *
 *   hematoloji : şerit wells-dvt · has-bled · glasgow-blatchford
 *                hub    ipi · flipi · ipss-r · isth-dic · hscore     ortak 0
 *   palyatif   : şerit ecog
 *                hub    karnofsky · pps · ppi · pap-score · esas     ortak 0
 *
 * Yani hematoloji kütüphanesini okuyan biri, hematolojiye özgü hiçbir skora
 * o sayfadan ulaşamıyordu. Liste 34 araçlık dönemde yazılmış ve kütüphane
 * 130'a çıkarken güncellenmemişti — deponun "elle yazılan liste içerik
 * büyürken sessizce yalana dönüşür" kuralının araç tarafındaki hâli.
 *
 * Çare listeyi elle düzeltmek DEĞİL (aynı kusur geri gelir), TÜRETMEK:
 * `content/brans-arac.json` buradan üretiliyor ve `--kontrol` bayatlığı
 * yakalıyor.
 */
function kategorileriOku() {
  const s = fs.readFileSync(KAYNAK, 'utf8');
  const parcalar = s.split(/category:\s*"/).slice(1);
  const cikti = [];
  for (const p of parcalar) {
    const tirnak = p.indexOf('"');
    if (tirnak < 0) continue;
    const ad = p.slice(0, tirnak);
    const bas = p.match(/slug:\s*"([a-z0-9-]+)"\s*,\s*\n?\s*icon:\s*"([^"]*)"/);
    if (!bas) continue;
    // Kategori başlığının kendi slug/icon çifti üçlü desene uymaz, elenir.
    const re = /slug:\s*"([^"]+)"\s*,\s*name:\s*"([^"]*)"\s*,\s*desc:\s*"([^"]*)"/g;
    const items = [];
    let m;
    while ((m = re.exec(p))) items.push({ slug: m[1], name: m[2] });
    cikti.push({ ad, slug: bas[1], icon: bas[2], items });
  }
  return cikti;
}

/**
 * Aracın KENDİ ikonu — sayfasındaki rozetten okunuyor.
 *
 * Kategori ikonunu kullanmak kolay olurdu ama şeritteki her araç aynı
 * gliften olurdu; bugünkü elle yazılmış listede araçlar ayrı ikonlar
 * taşıyor ve bu görsel ayırt ediciliği kaybetmek gerileme olurdu.
 *
 * Rozetin şekli 130 araçta birebir aynı (`w-14 h-14 …`), belgede kayıtlı.
 * İki yazım var: glif doğrudan, ya da bir iç `<span>` içinde. Okunamazsa
 * kategori ikonuna düşülür — yani ayrıştırma kusuru sessiz bir boşluk
 * üretmez.
 */
function aracIkonu(slug, yedek) {
  try {
    const p = fs.readFileSync(path.join(ARAC_DIZIN, slug, 'page.tsx'), 'utf8');
    const m = p.match(/w-14 h-14[^>]*>([\s\S]{0,80}?)<\/div>/);
    if (m) {
      const glif = m[1].replace(/<[^>]*>/g, '').trim();
      if (glif && glif.length <= 8) return glif;
    }
  } catch {
    /* sayfa yoksa yedeğe düş */
  }
  return yedek;
}

/**
 * İçerik branşı -> hub kategorisi. TEK ELLE TUTULAN eşleme bu ve 13 satır;
 * araç listeleri ondan TÜRETİLİYOR, yani kütüphane büyüdükçe kendiliğinden
 * güncelleniyor.
 *
 * Sıra önemli: şerit ilk kategorilerden başlayarak dolduruluyor ve arayüz
 * onu kırpıyor. `journal-club` bilerek yok — ilişkili hesaplayıcısı olmayan
 * tek branş, bölümü gizleniyor.
 */
const BRANS_KATEGORI = {
  kardiyoloji: ['kardiyoloji'],
  nefroloji: ['nefroloji'],
  endokrinoloji: ['endokrinoloji', 'endokrin-testler'],
  gastroenteroloji: ['hepatoloji-gastro'],
  enfeksiyon: ['gogus-enfeksiyon'],
  gogus: ['gogus-enfeksiyon'],
  hematoloji: ['hematoloji'],
  romatoloji: ['romatoloji'],
  onkoloji: ['onkoloji'],
  palyatif: ['palyatif'],
  'klinik-nutrisyon': ['nutrisyon'],
  'genel-dahiliye': ['acil', 'genel', 'infuzyon'],
};

function bransAracUret(sluglar) {
  const kategoriler = new Map(kategorileriOku().map((k) => [k.slug, k]));
  const cikti = {};
  for (const [brans, katSluglari] of Object.entries(BRANS_KATEGORI)) {
    const gorulen = new Set();
    const araclar = [];
    for (const ks of katSluglari) {
      const kat = kategoriler.get(ks);
      if (!kat) continue;
      for (const it of kat.items) {
        // Sayfası olmayan slug şeride girmez; ölü bağlantı üretmemek için.
        if (!sluglar.has(it.slug) || gorulen.has(it.slug)) continue;
        gorulen.add(it.slug);
        araclar.push({ slug: it.slug, name: it.name, icon: aracIkonu(it.slug, kat.icon) });
      }
    }
    if (araclar.length) cikti[brans] = { kategori: katSluglari[0], araclar };
  }
  return cikti;
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

  /* İKİNCİ KAYNAK: app/lib/tools.ts.
   *
   * Orada elle tutulan bir eşleme var (TOOLS + BRANCH_TOOLS) ve branş
   * sayfalarındaki "İlgili Hesaplayıcılar" şeridi ondan besleniyor. Dosyanın
   * kendi başlığı slug'ların gerçek klasörlerle eşleşmesini şart koşuyor ama
   * bunu doğrulayan hiçbir şey yoktu. ÖLÇÜLDÜ: `heart-score` orada kalmıştı,
   * oysa araç `heart` ile birleştirilip klasörü silinmişti — kardiyoloji branş
   * sayfası ölü bir slug'a bağlanıyor ve yalnızca 308 yönlendirmesi sayesinde
   * çalışıyordu.
   *
   * `arac-index` karşılaştırması bunu GÖREMEZ: o yalnızca TOOLS_DATABASE ile
   * indeksi karşılaştırıyor, tools.ts ÜÇÜNCÜ bir yer. */
  const sluglar = new Set(sayfasiOlan.map((t) => t.slug));
  const olu = [];
  try {
    const ts = fs.readFileSync(path.join(KOK, 'app', 'lib', 'tools.ts'), 'utf8');
    /* SIRA ÖNEMLİ: önce SATIR yorumu, sonra BLOK yorumu.
     *
     * Ters sırada yapıldığında ÖLÇÜLDÜ: dosyanın ilk satırındaki
     * "// ... (app/tools/<yıldız>) ..." metni SAHTE bir blok yorum açıyor ve
     * sonraki blok kapanışına kadar her şeyi yiyor — 5044 karakterlik dosya
     * 358'e indi, regex 0 eşleşme buldu ve nöbetçi SESSİZCE kör kaldı.
     * Kusuru yalnızca pozitif kontrol gösterdi.
     *
     * Yorumlar SİLİNMİYOR, boşlukla dolduruluyor; satır sonları korunuyor. */
    const bosalt = (m) => m.replace(/[^\n]/g, ' ');
    const govde = ts
      .replace(/\/\/[^\n]*/g, bosalt)
      .replace(/\/\*[\s\S]*?\*\//g, bosalt);
    for (const m of govde.matchAll(/"([a-z0-9-]+)"\s*:\s*\{\s*slug:\s*"([a-z0-9-]+)"/g)) {
      if (!sluglar.has(m[2])) olu.push('TOOLS -> "' + m[2] + '"');
    }
    const mb = govde.match(/BRANCH_TOOLS[^=]*=\s*\{([\s\S]*?)\n\};/);
    if (mb) {
      for (const satir of mb[1].matchAll(/"([a-z0-9-]+)"\s*:\s*\[([^\]]*)\]/g)) {
        for (const s2 of satir[2].matchAll(/"([a-z0-9-]+)"/g)) {
          if (!sluglar.has(s2[1])) olu.push('BRANCH_TOOLS.' + satir[1] + ' -> "' + s2[1] + '"');
        }
      }
    }
  } catch {
    console.error('UYARI: app/lib/tools.ts okunamadı, slug nöbetçisi çalışmadı.');
  }

  if (olu.length) {
    console.error('app/lib/tools.ts ÖLÜ SLUG taşıyor — sayfası olmayan araca bağlanıyor:');
    for (const o of [...new Set(olu)]) console.error('  ' + o);
    console.error("Çare: slug'ı gerçek klasör adıyla değiştir (ya da kaydı kaldır).");
    process.exitCode = 1;
    return;
  }

  /* BRANŞ-ARAÇ EŞLEMESİ de bayatlayabilir ve bayatlaması SESSİZDİR:
     kütüphaneye yeni bir hematoloji skoru eklendiğinde branş şeridi onu
     göstermez ve hiçbir şey hata vermez. Elle tutulan sürümde tam olarak bu
     oldu (bkz. `kategorileriOku` başlığı). */
  let bransFark = null;
  try {
    const mevcutBA = JSON.parse(
      fs.readFileSync(path.join(KOK, 'content', 'brans-arac.json'), 'utf8')
    );
    const beklenenBA = bransAracUret(sluglar);
    if (JSON.stringify(mevcutBA) !== JSON.stringify(beklenenBA)) {
      const mb = Object.keys(mevcutBA);
      const bb = Object.keys(beklenenBA);
      bransFark = {
        eksikBrans: bb.filter((x) => !mb.includes(x)),
        fazlaBrans: mb.filter((x) => !bb.includes(x)),
        degisen: bb.filter(
          (x) =>
            mb.includes(x) && JSON.stringify(mevcutBA[x]) !== JSON.stringify(beklenenBA[x])
        ),
      };
    }
  } catch {
    bransFark = { okunamadi: true };
  }

  if (bransFark) {
    console.error('content/brans-arac.json BAYAT — `node scripts/arac-metadata.cjs` çalıştır.');
    if (bransFark.okunamadi) console.error('  dosya okunamadı ya da bozuk');
    else {
      if (bransFark.eksikBrans.length) console.error(`  eksik branş : ${bransFark.eksikBrans.join(', ')}`);
      if (bransFark.fazlaBrans.length) console.error(`  fazla branş : ${bransFark.fazlaBrans.join(', ')}`);
      if (bransFark.degisen.length) console.error(`  araç listesi değişmiş: ${bransFark.degisen.join(', ')}`);
    }
    process.exitCode = 1;
    return;
  }

  if (!eksik.length && !fazla.length && !degisen.length) {
    console.log(
      `arac-index.json senkron (${beklenen.length} araç) · brans-arac.json senkron · tools.ts slug'ları geçerli.`
    );
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

  /* Branş -> araç eşlemesi de üretiliyor; gerekçesi `kategorileriOku`
     başlığında. Aynı sıfır koruması burada da geçerli: boş sonuç
     "ilişki yok" değil "ayrıştırma bozuldu" demektir. */
  const bransArac = bransAracUret(new Set(sayfasiOlan.map((a) => a.slug)));
  if (Object.keys(bransArac).length === 0) {
    console.error(
      'HATA: branş-araç eşlemesi 0 branş üretti — kategori ayrıştırması bozuldu.\n' +
        'content/brans-arac.json DEĞİŞTİRİLMEDİ.'
    );
    process.exitCode = 1;
    return;
  }
  fs.writeFileSync(
    path.join(KOK, 'content', 'brans-arac.json'),
    JSON.stringify(bransArac, null, 1) + '\n'
  );
  const toplamBag = Object.values(bransArac).reduce((a, b) => a + b.araclar.length, 0);
  console.log(
    `yazıldı: content/brans-arac.json (${Object.keys(bransArac).length} branş, ${toplamBag} bağ)`
  );

  console.log(`araç kaydı: ${araclar.length}`);
  console.log(`yazılan layout: ${yazilan}`);
  if (atlanan) console.log(`atlanan: ${atlanan}`);
  if (sayfasiz.length) console.log(`sayfası olmayan (layout üretilmedi): ${sayfasiz.join(', ')}`);
}

main();
