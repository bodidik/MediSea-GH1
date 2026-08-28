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
 *   node scripts/ilgili-index.cjs             # üretir ve yazar
 *   node scripts/ilgili-index.cjs --kontrol   # yazmadan: indeks bayat mı?
 */
const fs = require('fs');
const path = require('path');
const { ebeveynListesi } = require('../lib/ebeveyn.cjs');

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
    /* ELENEN, normalize() ile kurulur — AYRI bir katlama kullanılsaydı
       normalize genişlediğinde bu liste sessizce eşleşmez olurdu ve elenen
       niteleyiciler geri gelirdi (bkz. yukarıdaki "Acil" vakası). */
  ].map(normalize)
);

const EN_FAZLA = 6;      // sayfada gösterilecek ilgili konu sayısı
const ESIK = 0.08;       // bu skorun altındakiler zayıf sayılır, bağlanmaz
/** Tek ortak etiket ancak BU kadar nadirse tek başına akrabalık sayılır. */
const NADIR_ESIGI = 4;

/**
 * Etiket KİMLİĞİ — yalnızca eşleştirme için; ekranda bu değer basılmaz.
 *
 * ── DENENDİ ve ÖLÇÜMLE GERİ ALINDI: daha agresif katlama ───────────────────
 * Sözlükte aynı kavramın iki yazımı var (ITP/İTP, PPI/PPİ, FGF-23/FGF23,
 * SGLT-2i/SGLT2i, Inclisiran/İnclisiran) ve bunlar `toLocaleLowerCase('tr')`
 * altında AYRI etiket kalıyor — Türkçede I->ı, İ->i. 5 küme, 15 konu çifti.
 *
 * "ı->i ve tireyi at" katlaması eklendi, indeks yeniden üretildi ve
 * ÖNCE/SONRA karşılaştırıldı. Sonuç NET KAYIP: 5 konu bağ kazandı,
 * 9 konu bağ KAYBETTİ (toplam 1194 -> 1183).
 *
 * Sebep ölçüldü, tahmin edilmedi: skor 1/adet ile ağırlıklı ve tek ortak
 * etiket ancak NADIR_ESIGI kadar seyrekse akrabalık sayılıyor. Kaybedilen
 * bağların ortak etiketleri TAM EŞİKTEYDİ:
 *
 *   fgf-23  adet 4  + fgf23(1)  -> 5  ->  eşiği aştı, akrabalık düştü
 *   sglt2i  adet 4  + sglt-2i(1)-> 5  ->  aynı
 *
 * Yani etiketleri birleştirmek onları YAYGINLAŞTIRIYOR ve bu üreteçte
 * yaygınlık = değersizlik. Beklenen kazanç (ITP ailesini birleştirmek) de
 * gerçekleşmedi: o konular zaten BAŞKA ortak etiketlerden bağlıydı.
 *
 * Katlama istenirse NADIR_ESIGI de birlikte ayarlanmalı; ikisi bağımsız
 * değil. Tek başına katlamak ürünü kötüleştiriyor.
 */
function normalize(s) {
  return String(s).toLocaleLowerCase('tr').trim();
}

function konulariTopla() {
  const konular = [];
  /* `readdirSync` SIRASI PLATFORMA BAĞLI ve bu üretecin çıktısını
   * değiştiriyordu: Windows alfabetik döndürüyor, Linux dizin sırasını.
   * Skor eşitliklerinde sıra bu listeden geldiği için CI (Linux) ile
   * geliştirme makinesi (Windows) FARKLI dosya üretiyordu — yerelde
   * `--kontrol` geçerken CI 7 konuda "BAYAT" diyordu ve kapı 1,5 gündür
   * kırmızıydı. Kod noktası sırası (`.sort()`) her platformda aynı;
   * `localeCompare` DEĞİL — o yerel ayara bağlı. */
  const bransListesi = fs.readdirSync(ICERIK, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();
  for (const brans of bransListesi) {
    const dizin = path.join(ICERIK, brans);
    for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith('.json')).sort()) {
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
          parentler: ebeveynListesi(v?.meta?.parent),
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
  let kardesle = 0;
  let yalitilmis = 0;

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
        if (k.parentler.includes(diger.slug) || diger.parentler.includes(k.slug)) continue;
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
      // Eşit skorda anahtar sırası karar versin: yoksa sıra dosya
      // sisteminden gelir ve platforma göre değişir (bkz. üstteki not).
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .slice(0, EN_FAZLA)
      .map(([anahtar]) => {
        const d = konular.find((x) => x.anahtar === anahtar);
        return { brans: d.brans, slug: d.slug, baslik: d.baslik };
      });

    /**
     * YEDEK KATMAN: kardeşler.
     *
     * Ölçüldü — 411 görünür konunun 100'ü yukarıdaki katı kuraldan hiçbir şey
     * alamıyordu, yani arama motorundan gelen ziyaretçi için çıkmaz sokaktı.
     * Sebep etiket sözlüğünün parçalanmışlığı: 1232 farklı etiketin 889'u
     * yalnızca TEK bir konuda geçiyor ve hiçbir akrabalık kuramıyor; sık
     * geçenler ise branş adları ve "YDUS", onlar da bilerek eleniyor.
     *
     * Kuralı gevşetmek çözüm DEĞİL — nadirlik eşiği tam da "Akut Koroner
     * Sendromlar ↔ Safra Kesesi" gibi saçma eşleşmeleri engellemek için var.
     * Onun yerine ikinci bir sinyal ekleniyor: aynı ebeveynin çocukları.
     * Kardeşlik uydurma bir yakınlık değil, içeriğin kendi hiyerarşisi; üstelik
     * sayfada hiçbir yerde bağlı değiller (ebeveyn ve çocuklar bağlı, kardeşler
     * değil). Yalnızca katı kural boş döndüğünde devreye giriyor, böylece
     * gerçek akrabalığı olan konularda liste seyrelmiyor.
     */
    let liste = secilen;
    if (!liste.length && k.parentler.length) {
      /* Çok ebeveynlide kardeşlik ölçütü: EN AZ BİR ortak ebeveyn. */
      liste = konular
        .filter(
          (d) =>
            d.anahtar !== k.anahtar &&
            d.brans === k.brans &&
            d.parentler.some((e) => k.parentler.includes(e))
        )
        .slice(0, EN_FAZLA)
        .map((d) => ({ brans: d.brans, slug: d.slug, baslik: d.baslik }));
      if (liste.length) kardesle++;
    }

    /**
     * SON ÇARE: yalıtılmış konular.
     *
     * Kardeş yedeğinden sonra 9 konu kalıyor: ne ilgilisi, ne ebeveyni, ne
     * çocuğu var (7'si onkolojide). Bu sayfalarda okuyucu için yanal hiçbir
     * yol yok — yalnızca kırıntıdan branşa çıkabiliyor.
     *
     * Onlara aynı branştan konular veriliyor, ama rastgele değil: önce zayıf
     * da olsa etiket skoru olanlar (eşiği geçemeseler bile en yakın olanlar),
     * sonra branşın MERKEZ sayfaları — yani kendi çocukları olan konular.
     * Merkez sayfa okuyucu için doğal bir sonraki adım; alfabetik ilk konu
     * değil.
     */
    if (!liste.length) {
      const skorluAdaylar = [...skor.entries()]
        .map(([anahtar, s]) => ({ anahtar, s }))
        .filter((x) => konular.find((d) => d.anahtar === x.anahtar)?.brans === k.brans)
        .sort((a, b) => b.s - a.s || (a.anahtar < b.anahtar ? -1 : a.anahtar > b.anahtar ? 1 : 0))
        .map((x) => konular.find((d) => d.anahtar === x.anahtar));

      /*
       * AKRABA ELEMESİ BURADA DA GEREKİYOR.
       *
       * Katı kural ebeveyni ve çocuğu zaten eliyor (yukarıdaki `continue`),
       * ama bu son çare listesi `konular`dan DOĞRUDAN türüyordu ve yalnızca
       * konunun kendisini eliyordu. Sonuç ekranda görünür bir tekrardı:
       *
       *   çocuk hub -> hem "Alt Başlıklar" hem "İlgili Konular"
       *   ebeveyn   -> hem KIRINTI YOLU hem "İlgili Konular"
       *
       * Ölçüldü (410 konu, 1196 bağlantı): 2 konu kendi çocuğunu, 2 konu
       * kendi ebeveynini listeliyordu; dördü de hub, yani hepsi bu daldan
       * geliyordu.
       */
      const merkezler = konular.filter(
        (d) =>
          d.brans === k.brans &&
          d.anahtar !== k.anahtar &&
          !k.parentler.includes(d.slug) &&
          !d.parentler.includes(k.slug) &&
          konular.some((c) => c.brans === d.brans && c.parentler.includes(d.slug))
      );

      /**
       * Merkez listesi konuya göre KAYDIRILIYOR.
       *
       * Kaydırmadan önce onkolojideki yalıtılmış konuların hepsi birebir aynı
       * dört bağlantıyı alıyordu — "Meme Kanseri" ile "Prostat Kanseri"
       * sayfalarında aynı blok. Tekrarlanan bağlantı bloğu okuyucuya monoton,
       * arama motoruna da kalıplaşmış görünür ve iç bağlantı değerini
       * dağıtmaz.
       *
       * Kaydırma slug'dan türetiliyor: rastgele değil, her üretimde aynı
       * sonucu veriyor (dizin sürüm kontrolünde, gürültü olmamalı).
       */
      const kaydirma = merkezler.length
        ? [...k.slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % merkezler.length
        : 0;
      const dondurulmusMerkez = [...merkezler.slice(kaydirma), ...merkezler.slice(0, kaydirma)];

      const gorulen = new Set([k.anahtar]);
      liste = [...skorluAdaylar, ...dondurulmusMerkez]
        .filter((d) => d && !gorulen.has(d.anahtar) && gorulen.add(d.anahtar))
        .slice(0, 4)
        .map((d) => ({ brans: d.brans, slug: d.slug, baslik: d.baslik }));
      if (liste.length) yalitilmis++;
    }

    if (liste.length) {
      sonuc[k.anahtar] = liste;
      bagliKonu++;
      toplamBag += liste.length;
    }
  }

  /* Anahtar sırası KOD NOKTASINA göre. Eskiden `localeCompare` kullanılıyordu
   * ve o yerel ayara bağlı: aynı içerikten Windows (tr-TR) ile Linux farklı
   * BAYT üretiyordu. `--kontrol` anahtar sırasını zaten yok sayıyor, ama
   * dosyanın kendisi de platformdan bağımsız olmalı — yoksa iki makinede
   * üretilen indeks arasında sürekli sahte git farkı çıkar. */
  const sirali = Object.fromEntries(
    Object.entries(sonuc).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  );

  /* Boş sonuca ASLA yazma ve --kontrol: araç ve başlık indekslerindeki
   * korumanın aynısı. Bu betik de CI'da çalışmıyor, yani konu yeniden
   * adlandırılıp betik unutulursa 'İlgili Konular' silinmiş bir hedefe
   * bağlanır. link-denetim bu dosyayı GÖRMÜYOR: o yalnızca
   * content/canonical ve content/premium ağaçlarını geziyor, bu dosya ise
   * content kökünde duruyor.
   *
   * Üreteç belirlenimci -- yeniden üretim birebir aynı baytı veriyor
   * (ölçüldü), yani karşılaştırma güvenilir. */
  if (bagliKonu === 0) {
    console.error('HATA: hiç bağ kurulamadı. İçerik dizini yerinde mi?');
    console.error('Mevcut indeks korundu; boş sonuç meşru sayılmıyor.');
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes('--kontrol')) {
    let mevcut = null;
    try {
      mevcut = fs.readFileSync(HEDEF, 'utf-8');
    } catch {
      console.error('ilgili-index.json okunamadı — üretmek için: node scripts/ilgili-index.cjs');
      process.exitCode = 1;
      return;
    }
    /* Karşılaştırma SIRADAN BAĞIMSIZ olmalı — bayt bayt karşılaştırma
     * CI'yı haksız yere düşürürdü.
     *
     * Anahtarlar `localeCompare` ile sıralanıyor ve o, çalışma zamanının
     * yerel ayarına bağlı. Ölçüldü: bu makinede varsayılan yerel `tr-TR` ve
     * orada "ışık" < "ilac"; `en` yerelinde ise "ışık" > "izole". Yani
     * dosya Windows'ta (tr-TR) üretilip CI'da (Linux, başka yerel) bayt
     * bayt karşılaştırılsaydı, hiçbir şey değişmediği hâlde "BAYAT" derdi.
     *
     * Bu yüzden yalnızca İÇERİK karşılaştırılıyor: hangi konu var, hangi
     * bağları taşıyor. Anahtar sırası bir bilgi taşımıyor. */
    let eski;
    try {
      eski = JSON.parse(mevcut);
    } catch {
      console.error('ilgili-index.json ayrıştırılamadı — üretmek için: node scripts/ilgili-index.cjs');
      process.exitCode = 1;
      return;
    }
    const eksik  = Object.keys(sirali).filter((k) => !(k in eski));
    const fazla  = Object.keys(eski).filter((k) => !(k in sirali));
    const farkli = Object.keys(sirali).filter(
      (k) => k in eski && JSON.stringify(eski[k]) !== JSON.stringify(sirali[k])
    );
    if (!eksik.length && !fazla.length && !farkli.length) {
      console.log(`ilgili-index.json senkron (${bagliKonu} konu, ${toplamBag} bağ).`);
      return;
    }
    console.log(`ilgili-index.json BAYAT — indekste ${Object.keys(eski).length} konu, olması gereken ${Object.keys(sirali).length}`);
    for (const k of eksik.slice(0, 20))  console.log(`  eksik   : ${k}`);
    for (const k of fazla.slice(0, 20))  console.log(`  fazla   : ${k}`);
    for (const k of farkli.slice(0, 20)) console.log(`  değişmiş: ${k}`);
    console.log('');
    console.log('Çare: node scripts/ilgili-index.cjs');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(HEDEF, JSON.stringify(sirali, null, 1) + '\n');

  console.log(`konu: ${konular.length} | ilgilisi olan: ${bagliKonu} | toplam bağ: ${toplamBag}`);
  console.log(`  bunlardan ${kardesle} tanesi kardeş yedeğiyle kapandı (katı kural boş döndü)`);
  console.log(`  ${yalitilmis} tanesi yalıtılmıştı, branş içi son çareyle kapandı`);
  console.log(`ilgilisi HİÇ olmayan: ${konular.length - bagliKonu}`);
  console.log(`ortalama: ${(toplamBag / Math.max(bagliKonu, 1)).toFixed(1)} bağ/konu`);
  console.log('yazıldı: content/ilgili-index.json');
}

main();
