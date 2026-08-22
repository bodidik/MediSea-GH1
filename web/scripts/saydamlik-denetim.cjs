#!/usr/bin/env node
/**
 * SAYDAMLIK DENETİMİ — metin ögesinde `opacity-*` kullanımı.
 *
 * NEDEN AYRI BİR DENETİM: CSS `opacity` rengi soldurur ama
 * `getComputedStyle(el).color` değerine YANSIMAZ. Yani bu depodaki bütün
 * kontrast ölçümleri saydam yazıyı olduğundan KOYU görüyordu ve
 * `opacity-*` taşıyan hiçbir metin doğru ölçülmemişti.
 *
 * Ölçülen bedel (üç turda):
 *   92 araçta alt bilgi klinik uyarısı  3.46  (eşik 4.5)
 *   28 araçta sonuç açıklama satırı     3.59
 *   sınav geri sayımı, amber evresinde  4.34
 *   soru çözüm kokpiti başlığı          3.75
 *
 * ÇARE SAYDAMLIĞI ARTIRMAK DEĞİL, ÖLÇÜLEBİLİR HÂLE GETİRMEK:
 *   opacity-60  ->  text-white/80   (renk alfası)
 * Renk alfası `color` içinde rgba olarak görünür, yani standart ölçüm onu
 * görür. Aynı görsel etki, ölçülebilir hâli.
 *
 * YÖNETİCİ ALANI ÖLÇÜLDÜ VE GEÇTİ (kapı yapılmamasının sebebi bu değil,
 * kapsam ölçümünün eksik olması). Üç yönetim sayfası geçici bir tanı
 * rotasında render edilip ölçüldü: 26 öge, 14'ü saydamlık taşıyor, 0 kusur.
 * Sebep basit — orada taban renk DEVRALINIYOR ve neredeyse siyah; 0.7
 * saydamlıkta bile beyaz üstünde ~6.6 çıkıyor. Araç tarafında kusurlu
 * olmasının sebebi taban rengin `text-blue-900` olmasıydı.
 *
 * Yani bu raporun yönetici satırları KUSUR DEĞİL, aday. Yeniden kovalamadan
 * önce bunu oku.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * "GENEL" SATIRLARI DA TEK TEK KARARA BAĞLANDI — HİÇBİRİ KUSUR DEĞİL.
 * Bu liste kovalanmasın diye yazıldı; kod değişirse yeniden ölçülmeli.
 *
 *   QuestionView.tsx:89        ÖLÜ KOD — sıfır içe aktaran, rotaya ulaşmıyor
 *   BranchTemplate.tsx:93      ÖLÜ KOD — yalnızca `_` önekli klasörler çağırıyor
 *   giris/page.tsx:127         `disabled={yukleniyor}` — devre dışı, WCAG muaf
 *   kayit/page.tsx:117         aynı kalıp
 *   AlanClient.tsx:128         aynı kalıp
 *   tekrar/page.tsx:328        ÖLÇÜLDÜ: beyaz %50 alfa, blue-950 üstünde 4.75 — GEÇİYOR
 *   ReadingTools.tsx:549       METİN TAŞIMIYOR — 10x10 renk noktası, kontrast konusu değil
 *   InlineTopicEditor.tsx:548  yalnızca yöneticiye render ediliyor (yukarıdaki verdikt)
 *
 * Kaynak taraması bunların hiçbirini kendi başına eleyemez: ulaşılabilirlik,
 * devre dışılık, gerçek kontrast ve "metin var mı" sorularının cevabı kaynakta
 * DEĞİL. Denetim ADAY üretir; kararı ölçüm verir. Bu yüzden kapı değil rapor.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * KAPSAM BİLEREK DAR: yalnızca METİN ögeleri. Süsleme katmanları, degrade
 * bulanıklıkları ve durum varyantları (hover:/focus:/disabled:/group-*)
 * elenir — onlarda saydamlık meşru bir araç.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * NEGATIF KONTROL DOSYASI `app/` ALTINA YAZILMAZ.
 *
 * Yazildiginda calisan `next dev` onu derlemeye aliyor; betik dosyayi
 * silince webpack bayat basvuruyla kaliyor ve BUTUN SITE 500 veriyor.
 * Olculdu: gecici bir tani rotasi acilmaya calisilirken sunucu
 * 'ENOENT: zz-renk-cifti-negatif-kontrol.tsx' diye dustu ve bir an
 * hata yonetici bilesenlerinde sanildi.
 *
 * Cozum: tohum dosyasi isletim sisteminin gecici dizinine yaziliyor ve
 * tarama kapsamina yalnizca --negatif kipinde ekleniyor.
 */
const NEGATIF_DIZIN = fs.mkdtempSync(path.join(os.tmpdir(), 'medisea-denetim-'));

const KAPI = process.argv.includes('--kapi');
/**
 * --kapi: KAPSAM yalnızca `app/tools` ve bulgu varsa çıkış 1.
 *
 * Neden dar: araç tarafı ölçümle SIFIRA indirildi (her bulgu tarayıcıda tek tek
 * doğrulandı). Yönetici ve genel alan HENÜZ ÖLÇÜLMEDİ — oraları kapı yapmak,
 * ölçülmemiş bir iddiayı CI'a yazmak olurdu. Onlar rapor olarak kalıyor.
 */
const KOKLER = KAPI ? ['app/tools'] : ['app', 'components'];

/**
 * KÖRLÜK ÖLÇÜLDÜ VE KAPATILDI — eski ölçüt AYNI SATIRDA `text-*` arıyordu.
 *
 * Bu, saydamlığı KAPSAYICIYA konan her kusuru görmüyordu: renk atadan
 * devralınıyor ve o satırda `text-*` bulunmuyor. Ölçüldü, bedeli büyüktü:
 *   34 araçta boş durum kartı  -> 1.93 kontrast (taban 7.58)
 *   /tools kategori sayaçları  -> 2.82 kontrast (taban 7.24)
 *   /tools ve glim klinik uyarısı -> 3.40
 * Boş durum kartı üstelik aracı açan HERKESİN ilk gördüğü ekran ve
 * "ne yapmalısın" yazısını taşıyor. Denetim bunların hiçbirini görmüyordu
 * ve "metin ögesinde saydamlık yok" diyordu.
 *
 * Yeni ölçüt: className içindeki STATİK `opacity-40..80` her yerde aday.
 * Koşullu olanlar (`${pasif ? "opacity-50" : ""}`) durum kaynaklıdır —
 * ölçüldü, beşi de gerçekten `disabled` taşıyan alanları soluklaştırıyor.
 */

/** Metin ögesi işareti: yazı rengi ya da yazı boyutu sınıfı taşıyor. */
const METIN_ISARETI = /\btext-(?:\[|xs|sm|base|lg|xl|\dxl|slate|blue|white|black|rose|amber|emerald|red|green|orange|sky|indigo|purple|yellow|gray|zinc|neutral|stone)/;
const SAYDAMLIK = /(?:^|[\s`'"{])opacity-(40|50|60|70|80)\b/;
/** Durum varyantları: saydamlık orada meşru (devre dışı, üzerine gelme, odak). */
const VARYANT = /(?:hover|focus|active|disabled|group-hover|group-focus|peer-\w+|aria-\w+)[:-]opacity-/;

/**
 * DÖRDÜNCÜ KÖRLÜK — SATIR İÇİ STİL. Ölçüt yalnızca Tailwind sınıfı arıyordu ve
 * `style={{ opacity: 0.45 }}` biçimini HİÇ görmüyordu. Bu sınıf üç ayrı yerde
 * gerçek kusur üretti ve üçü de ancak tarayıcıda bulundu:
 *   QuizEngine         opacity 0.5   -> şık metni 3.05, harf rozeti 2.02
 *   VakaEngine         opacity 0.45  -> şık metni 2.67, harf rozeti 1.86
 *   KategorilerClient  opacity 0.45  -> konu adı 1.89, YAKINDA rozeti 1.85
 * Premium motorlar renk ve boyutu satır içi stille veriyor (belgede yazılı),
 * yani bu biçim orada KURAL, istisna değil.
 *
 * Eşik 0.9: üstü görsel olarak fark edilmiyor, altı kontrastı ölçülebilir
 * biçimde düşürüyor. `opacity: 1` ve `opacity: 0` (tümden gizleme) kapsam dışı.
 */
/*
 * DEĞER ÜÇLÜ İŞLEÇLE DE VERİLEBİLİR ve ilk ölçüt bunu kaçırdı:
 *   opacity: konu.hazir ? 1 : 0.45
 * Sayı iki nokta üstüstenin hemen ardında değil. Tarihsel kontrolde ortaya
 * çıktı — bu tam da branş sayfasındaki gerçek kusurun biçimiydi (konu adı
 * 1.89 kontrast). O yüzden ölçüt değerin TAMAMINI alıp içindeki bütün
 * ondalıkları sınıyor.
 *
 * Koşullu satır içi saydamlık BİLEREK elenmiyor: className tarafında koşullu
 * olanlar ölçülüp meşru çıkmıştı (gerçekten `disabled` alanlar), ama satır içi
 * tarafta koşullu olan tek örnek GERÇEK kusurdu. Kanıt aksini söylüyor.
 */
const SATIR_ICI_ALAN = /\bopacity\s*:\s*([^,;}\n]+)/;
/** Değer içindeki en düşük ondalık (0 ve 1 kapsam dışı: gizleme / tam opak). */
function enDusukSaydamlik(deger) {
  const sayilar = (deger.match(/\d*\.\d+/g) || []).map(Number).filter((n) => n > 0 && n < 0.9);
  return sayilar.length ? Math.min(...sayilar) : null;
}

/**
 * ÜÇÜNCÜ KÖRLÜK — ÇOK SATIRLI className. Ölçüt satır bazlıydı ve aynı satırda
 * `className` arıyordu; çok satırlı şablon dizelerinde `className={` ile
 * `opacity-40` ayrı satırlara düşüyor ve bulgu sessizce kayboluyordu.
 * Ölçüldü: bu şekilde görünmeyen 3 satır vardı, ikisi gerçek kusurdu
 * (`BranchTemplate`, `YdusCockpit`).
 *
 * Çare: geriye doğru KISA bir pencerede `className` ara. Pencere dar tutuluyor —
 * geniş pencere alakasız satırları className bağlamı sanar.
 */
const GERI_PENCERE = 8;

function* dosyalar(kok) {
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    const p = path.join(kok, g.name);
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name.startsWith('.')) continue;
      yield* dosyalar(p);
    } else if (g.name.endsWith('.tsx')) {
      yield p;
    }
  }
}

function tara(kokler) {
  const bulgu = [];
  let dosyaSayisi = 0;
  let className = 0;
  for (const kok of kokler) {
    if (!fs.existsSync(kok)) continue;
    for (const p of dosyalar(kok)) {
      // `_` onekli klasorler Next'te rotaya alinmiyor -> kullaniciya ulasmiyor
      if (p.split(path.sep).some((x) => x.startsWith('_'))) continue;
      dosyaSayisi++;
      const satirlar = fs.readFileSync(p, 'utf8').split('\n');
      /** Bu satır bir className ifadesinin İÇİNDE mi? (çok satırlı şablon dizesi) */
      const classNameBaglami = (i) => {
        for (let j = i; j >= Math.max(0, i - GERI_PENCERE); j--) {
          if (satirlar[j].includes('className')) return true;
        }
        return false;
      };
      /*
       * BLOK YORUM DURUMU SATIR SATIR İZLENİYOR. Satır başındaki `//`, `*`,
       * `/*` işaretine bakmak YETMEDİ: bu depoda yorumlar saydamlık kusurlarını
       * ANLATIYOR ve gövde satırları düz metinle başlıyor —
       *   opacity-60 onu 2.15-3.77 kontrasta düşürüyordu.
       * Bu satırlar kod sanılıp iki yanlış pozitif üretti. Ölçüm kendi
       * belgesini kusur sayarsa rapor okunmaz hâle gelir.
       */
      let blokYorumda = false;
      const yorumMu = (x) => {
        const baslar = x.includes('/*');
        const biter = x.includes('*/');
        if (blokYorumda) {
          if (biter) blokYorumda = false;
          return true;
        }
        if (baslar && !biter) {
          blokYorumda = true;
          return true;
        }
        return /^\s*(\/\/|\*|\/\*)/.test(x) || baslar;
      };
      satirlar.forEach((s, i) => {
        if (yorumMu(s)) return; // belge metni saydamlığı ANLATIR, uygulamaz

        // ── satır içi stil dalı ──
        const si = s.match(SATIR_ICI_ALAN);
        if (si) {
          className++;
          if (enDusukSaydamlik(si[1]) !== null) {
            bulgu.push({ dosya: p.replace(/\\/g, '/'), satir: i + 1, kod: s.trim().slice(0, 96) });
          }
          return;
        }

        if (!classNameBaglami(i)) return;
        className++;
        if (!SAYDAMLIK.test(s)) return;
        if (VARYANT.test(s)) return;
        // KOŞULLU saydamlık durum kaynaklı (pasif/devre dışı) -> meşru.
        // Dikkat: bunlar template literal DEĞİL, JSX ifadesi:
        //   className={pasif ? "opacity-50" : ""}
        // İlk denemede `${...}` arandı ve hiçbiri elenmedi. Ölçüt, saydamlık
        // sınıfının bir üçlü işlecin İÇİNDE geçmesi.
        if (/\?[^:]*opacity-(?:40|50|60|70|80)/.test(s)) return;
        // METIN_ISARETI ARTIK ŞART DEĞİL: kapsayıcıya konan saydamlık da
        // içindeki metni soluklaştırıyor (yukarıdaki körlük notu).
        // Susleme: ogenin icerigi yalnizca emoji/glif ise kontrast konusu degil
        const icerik = (s.match(/>([^<>{}]*)</) || [])[1] || '';
        if (icerik.trim() && !/[a-zA-ZÀ-ɏİığş]/.test(icerik)) return;
        bulgu.push({ dosya: p.replace(/\\/g, '/'), satir: i + 1, kod: s.trim().slice(0, 96) });
      });
    }
  }
  return { bulgu, dosyaSayisi, className };
}

/* ── negatif kontrol: denetim hâlâ kusur yakalıyor mu ───────────────── */
if (process.argv.includes('--negatif')) {
  /* Dosya adı `_` ile BAŞLAMAMALI: betiğin kendi `_` süzgeci (rotaya alınmayan
     klasörleri eleyen kural) test dosyasını da eliyordu ve negatif kontrol
     "denetim körleşmiş" diyordu. Denetim çalışıyordu; testi kendi süzgecine
     takılmıştı. */
  const gecici = path.join(NEGATIF_DIZIN, 'zz-saydamlik-negatif-kontrol.tsx');
  /* Tohum DÖRT biçimi birden taşıyor: tek satırlık className, ÇOK SATIRLI
     className, SATIR İÇİ stil ve ÜÇLÜ İŞLEÇLİ satır içi. Dördü de
     yakalanmazsa kontrol düşer — kapatılan körlüklerin geri gelmediğini bu
     garanti ediyor.

     Ayrıca TARİHSEL KONTROL yapıldı ve en güçlü kanıt o: düzeltme ÖNCESİ
     dört dosya (QuizEngine, VakaEngine, YdusCockpit, KategorilerClient)
     git'ten alınıp denetime sürüldü — dördü de yakalandı. İlk denemede
     KategorilerClient KAÇMIŞTI (üçlü işleçli değer) ve ölçüt onun için
     genişletildi. */
  fs.writeFileSync(
    gecici,
    'export default function X() {\n' +
      '  return (\n' +
      '    <div>\n' +
      '      <p className="text-[11px] text-blue-900 opacity-60">tek satir</p>\n' +
      '      <p\n' +
      '        className={`text-[11px] text-blue-900\n' +
      '          opacity-40`}\n' +
      '      >cok satir</p>\n' +
      '      <p style={{ fontSize: 11, opacity: 0.45 }}>satir ici</p>\n' +
      '      <p style={{ fontSize: 11, opacity: hazir ? 1 : 0.35 }}>ucluyle</p>\n' +
      '    </div>\n' +
      '  );\n' +
      '}\n',
    'utf8',
  );
  const { bulgu } = tara([...KOKLER, NEGATIF_DIZIN]);
  fs.unlinkSync(gecici);
  fs.rmSync(NEGATIF_DIZIN, { recursive: true, force: true });
  const tohum = bulgu.filter((b) => b.dosya.includes('zz-saydamlik-negatif-kontrol'));
  const kod = tohum.map((b) => b.kod).join(' | ');
  const bicimler = {
    'tek satır className': /opacity-60/.test(kod),
    'çok satırlı className': /opacity-40/.test(kod),
    'satır içi stil': /opacity:\s*0\.45/.test(kod),
    'üçlü işleçli satır içi': /opacity:.*0\.35/.test(kod),
  };
  const eksik = Object.entries(bicimler)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (eksik.length) {
    console.log(`negatif kontrol DÜŞTÜ — yakalanmayan biçim: ${eksik.join(', ')}`);
    process.exit(1);
  }
  console.log('negatif kontrol GEÇTİ — dört biçim de yakalanıyor (tek satır · çok satır · satır içi · üçlü işleçli).');
  process.exit(0);
}

const { bulgu, dosyaSayisi, className } = tara(KOKLER);
console.log(`saydamlık denetimi — ${dosyaSayisi} tsx okundu, ${className} className satırı tarandı`);
console.log('');
if (!bulgu.length) {
  console.log('metin ögesinde saydamlık yok.');
  process.exit(0);
}
const alan = (d) => (d.includes('/admin/') ? 'yönetici' : d.includes('/tools/') ? 'araç' : 'genel');
const gruplar = { araç: [], genel: [], yönetici: [] };
for (const b of bulgu) gruplar[alan(b.dosya)].push(b);
console.log(`metin ögesinde saydamlık: ${bulgu.length}`);
console.log(`  araç: ${gruplar['araç'].length} · genel: ${gruplar.genel.length} · yönetici: ${gruplar['yönetici'].length}`);
for (const [ad, liste] of Object.entries(gruplar)) {
  if (!liste.length) continue;
  console.log('');
  console.log(`--- ${ad} (${liste.length}) ---`);
  for (const b of liste) {
    console.log(`  ${b.dosya}:${b.satir}`);
    console.log(`      ${b.kod}`);
  }
}
console.log('');
console.log('Çare: opacity-* yerine renk alfası kullan (ör. text-white/80).');
console.log('Renk alfası getComputedStyle(el).color içinde görünür; opacity görünmez.');
console.log('');
if (KAPI) { console.log(''); console.log('KAPI KİPİ: app/tools bulgusu var, CI düşüyor.'); process.exit(1); }
console.log('Bu betik CI KAPISI DEĞİL: saydamlık kimi yerde meşru bir tasarım aracı');
console.log('(süsleme katmanı, ölçüsü bilerek düşürülmüş ikincil bilgi). Karar insana ait.');
process.exit(0);
