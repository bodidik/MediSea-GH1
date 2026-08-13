#!/usr/bin/env node
/**
 * Konular arası "ilgili başlıklar" dizinini üretir.
 *
 * Neden gerek var: konu sayfaları yalnızca kendi çocuklarına ve branşa
 * bağlanıyor. Yan yana duran konular birbirini hiç göstermiyor — ne okuyucu
 * için (bir sonraki adımı bulamıyor) ne arama motoru için (iç bağlantı yok)
 * iyi. 456 dosyayı her istekte taramak yerine dizin önceden üretiliyor.
 *
 * Skorlama: ortak etiket sayısı değil, ortak etiketlerin NADİRLİĞİ.
 * "Endokrinoloji" etiketi 98 konuda geçiyor; onu paylaşmak hiçbir şey
 * söylemez. "MEN1" 18 konuda geçiyor ve gerçekten akraba olduklarını söyler.
 * Ağırlık 1/adet; çok geçen etiketler kendiliğinden sönümleniyor.
 *
 * Kullanım (web/ dizininden):
 *   node scripts/ilgili-index.cjs
 */
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const ICERIK = path.join(KOK, 'content', 'canonical');
const HEDEF = path.join(KOK, 'content', 'ilgili-index.json');

/**
 * Hiçbir şey ayırt etmeyen etiketler.
 *
 * İki grup var. Birincisi branş adları. İkincisi ve daha sinsi olanı klinik
 * NİTELEYİCİLER: "akut", "acil", "tanı", "tedavi"… Bunlar konuyu değil konunun
 * hâlini anlatıyor, dolayısıyla alakasız başlıkları birbirine bağlıyorlar.
 * Elenmeden önce "Akut Koroner Sendromlar" ile "Safra Kesesi Hastalıkları"
 * ilgili çıkıyordu — ikisi de "Acil" etiketi taşıdığı için. Tıbbi bir
 * kaynakta böyle bir öneri, hiç öneri vermemekten kötüdür.
 */
const ELENEN = new Set(
  [
    'ydus', 'yapay zeka taslağı', 'taslak', 'genel', 'dahiliye',
    'endokrinoloji', 'hematoloji', 'nefroloji', 'gastroenteroloji', 'onkoloji',
    'kardiyoloji', 'romatoloji', 'enfeksiyon', 'göğüs', 'göğüs hastalıkları',
    'palyatif', 'klinik nütrisyon', 'journal club', 'genel dahiliye',
    // klinik niteleyiciler
    'akut', 'kronik', 'acil', 'aciller', 'tanı', 'tedavi', 'yönetim',
    'patofizyoloji', 'farmakoloji', 'klinik', 'komplikasyon', 'komplikasyonlar',
    'ayırıcı tanı', 'prognoz', 'epidemiyoloji', 'tarama', 'izlem',
  ].map((s) => s.toLocaleLowerCase('tr'))
);

const EN_FAZLA = 6;      // sayfada gösterilecek ilgili konu sayısı
const ESIK = 0.08;       // bu skorun altındakiler zayıf sayılır, bağlanmaz
/** Tek ortak etiket ancak BU kadar nadirse tek başına akrabalık sayılır. */
const NADIR_ESIGI = 4;

function normalize(s) {
  return String(s).toLocaleLowerCase('tr').trim();
}

function konulariTopla() {
  const konular = [];
  for (const brans of fs.readdirSync(ICERIK, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    const dizin = path.join(ICERIK, brans);
    for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith('.json'))) {
      try {
        const v = JSON.parse(fs.readFileSync(path.join(dizin, dosya), 'utf-8'));
        if (v?.meta?.hidden === true) continue;
        const slug = dosya.replace(/\.json$/, '');
        const etiketler = (Array.isArray(v?.meta?.tags) ? v.meta.tags : [])
          .map(normalize)
          .filter((t) => t && !ELENEN.has(t));
        konular.push({
          anahtar: `${brans}/${slug}`,
          brans,
          slug,
          baslik: (typeof v?.title === 'string' && v.title.trim()) || slug.replace(/-/g, ' '),
          parent: v?.meta?.parent || null,
          etiketler: [...new Set(etiketler)],
        });
      } catch {
        // Bozuk dosya dizini bozmasın.
      }
    }
  }
  return konular;
}

function main() {
  const konular = konulariTopla();

  // Etiket -> kaç konuda geçiyor
  const adet = {};
  for (const k of konular) for (const t of k.etiketler) adet[t] = (adet[t] || 0) + 1;

  // Etiket -> o etiketi taşıyan konular (tam tarama yerine ters dizin)
  const tersDizin = {};
  for (const k of konular) for (const t of k.etiketler) (tersDizin[t] ||= []).push(k);

  const sonuc = {};
  let bagliKonu = 0;
  let toplamBag = 0;

  for (const k of konular) {
    const skor = new Map();
    const ortakSayisi = new Map();
    const enNadirOrtak = new Map();

    for (const t of k.etiketler) {
      const n = adet[t];
      // Tek konuda geçen etiket kimseyle eşleşmez; çok geçen etiket zayıf ağırlık alır.
      if (!n || n < 2) continue;
      const agirlik = 1 / n;
      for (const diger of tersDizin[t]) {
        if (diger.anahtar === k.anahtar) continue;
        // Ebeveyn ve çocuklar sayfada zaten bağlı — tekrar etme.
        if (diger.slug === k.parent || diger.parent === k.slug) continue;
        skor.set(diger.anahtar, (skor.get(diger.anahtar) || 0) + agirlik);
        ortakSayisi.set(diger.anahtar, (ortakSayisi.get(diger.anahtar) || 0) + 1);
        enNadirOrtak.set(diger.anahtar, Math.min(enNadirOrtak.get(diger.anahtar) ?? Infinity, n));
      }
    }

    // Tek bir ortak etiket akrabalık için yeterli DEĞİL — o etiket gerçekten
    // ayırt edici (nadir) olmadıkça. Aksi hâlde orta sıklıktaki etiketler
    // alakasız konuları birbirine bağlıyor.
    const secilen = [...skor.entries()]
      .filter(([anahtar, s]) => {
        if (s < ESIK) return false;
        const ortak = ortakSayisi.get(anahtar) || 0;
        if (ortak >= 2) return true;
        return (enNadirOrtak.get(anahtar) ?? Infinity) <= NADIR_ESIGI;
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, EN_FAZLA)
      .map(([anahtar]) => {
        const d = konular.find((x) => x.anahtar === anahtar);
        return { brans: d.brans, slug: d.slug, baslik: d.baslik };
      });

    if (secilen.length) {
      sonuc[k.anahtar] = secilen;
      bagliKonu++;
      toplamBag += secilen.length;
    }
  }

  const sirali = Object.fromEntries(Object.entries(sonuc).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(HEDEF, JSON.stringify(sirali, null, 1) + '\n');

  console.log(`konu: ${konular.length} | ilgilisi olan: ${bagliKonu} | toplam bağ: ${toplamBag}`);
  console.log(`ortalama: ${(toplamBag / Math.max(bagliKonu, 1)).toFixed(1)} bağ/konu`);
  console.log('yazıldı: content/ilgili-index.json');
}

main();
