#!/usr/bin/env node
/**
 * konu-denetim.cjs — konu dosyalarının KÜNYESİNİ denetler.
 *
 * `link-denetim` bağlantılara, `soru-denetim` quiz yapısına bakıyor.
 * Bu betik üçüncü bir yeri tarıyor: konunun kendi kimliği tutarlı mı.
 *
 * Yakaladığı sınıf gerçek bir kusurdan doğdu. Üretim derlemesinde title
 * tekrarı arandığında iki dosya çıktı ve ikisinde de SADECE başlık değil
 * BÜTÜN İÇERİK yanlıştı:
 *
 *   endokrinoloji/hiperkalsemi-ve-hiperparatiroidi.json
 *       → içeriği baştan sona "Asit-Baz Denge Bozuklukları"
 *   hematoloji/akut-lenfoblastik-losemi-all.json
 *       → içeriği baştan sona "Miyelodisplastik Sendromlar (MDS)"
 *
 * Yani kullanıcı hiperkalsemi okumak isterken asit-baz okuyor. Tıp eğitim
 * platformunda bu, konuyu yanlış öğretmenin en doğrudan hâli — ve üç kapı da
 * (lint · typecheck · build) bunu göremez, çünkü kusur kodda değil veride.
 *
 * KAPI DEĞİL, RAPOR: iki dosyanın aynı başlığı taşıması bazen meşru bir
 * içerik kararıdır (aynı konunun iki branşta durması gibi). Karar içerik
 * sahibinin; betik yalnızca listeler. `yetim-denetim` ve `asili-denetim`
 * de aynı sebeple kapı değil.
 *
 * Kullanım: node scripts/konu-denetim.cjs
 */

const fs = require('fs');
const path = require('path');
const { ebeveynListesi } = require('../lib/ebeveyn.cjs');

const KOK = path.join(__dirname, '..', 'content', 'canonical');

/* Ebeveyn referansı büyük harf ve Türkçe aksan bakımından sapabiliyor
   (`Ön-hipofiz-…` ↔ `on-hipofiz-…`); uygulamada `lib/slug-eslestir.ts` bunu
   okuma adımında çözüyor. Çocuk sayarken aynı normalleştirme gerekiyor,
   yoksa sapan referanslı konu "çocuğu yok" sanılır. */

/**
 * Sayfanın bastığı meta açıklamasının AYNASI (bkz. app/(site)/topics/…/page.tsx
 * içindeki ozetCikar). Uyarı/künye bölümleri elenir; 🤖 ve ⚠️ ile başlayan
 * başlıklar sayfada durur ama özete girmez.
 */
function uyariBolumuMu(b) {
  const bas = String((b && (b.heading || b.title)) || "");
  return /^\s*(🤖|⚠️|⚠)/u.test(bas);
}

function aciklamaUret(j, sinir) {
  sinir = sinir || 155;
  const hazir = (j && j.summary) || (j && j.meta && j.meta.summary);
  const kaynak = hazir || (Array.isArray(j && j.sections)
    ? j.sections.filter((s) => !uyariBolumuMu(s)).map((s) => (s && (s.text || s.html)) || "").join(" ")
    : "");
  /* ⚠ Bu satır bir kez `node -e` ile yazıldı ve `\s` KAYBOLDU: desen `/s+/g`
     olarak indi, yani metindeki bütün "s" harflerini siliyordu ("Erkek
     osteoporozu" → "Erkek o teoporozu"). Belgede kayıtlı ters-bölü tuzağı.
     Kaçış taşıyan bir betiği kabuk dizesiyle yazma — Write/Edit kullan. */
  const duz = String(kaynak).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ").trim();
  if (duz.length <= sinir) return duz;
  const k = duz.slice(0, sinir);
  return k.slice(0, k.lastIndexOf(" ")).trimEnd() + "…";
}

function normSlug(s) {
  return String(s || '').toLowerCase()
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
}

function konular() {
  const out = [];
  for (const brans of fs.readdirSync(KOK, { withFileTypes: true })) {
    if (!brans.isDirectory()) continue;
    const d = path.join(KOK, brans.name);
    for (const e of fs.readdirSync(d)) {
      if (!e.endsWith('.json')) continue;
      let j;
      try { j = JSON.parse(fs.readFileSync(path.join(d, e), 'utf8')); } catch (err) { continue; }
      // "hidden" bir dönem DİZE olarak yazılmıştı; boolean'a çevrilirken sayı
      // 411'den 410'a düşmüştü. İkisini de gizli say.
      const gizliHam = j.meta && j.meta.hidden;
      const gizli = gizliHam === true || gizliHam === 'true';
      out.push({
        brans: brans.name,
        slug: e.replace(/\.json$/, ''),
        yol: `${brans.name}/${e}`,
        baslik: (j.title || '').trim(),
        /**
         * AÇIKLAMA, SAYFANIN GERÇEKTEN BASTIĞI DEĞER OLMALI.
         *
         * Burası bir dönem `meta.description || description` okuyordu ve
         * ÖLÇÜLDÜ: bu depoda böyle bir alan HİÇ YOK — 456 dosyada sıfır.
         * Yani "AYNI açıklamayı taşıyan konular" denetimi her zaman boş
         * dizi üretiyor, hiçbir şey ölçmüyor ve sessizce "temiz" görünüyordu.
         * Deponun kendi kuralının ("0 kusur ile 0 ölçüm aynı görünür") bir
         * denetimin İÇİNDE tekrarı.
         *
         * Arama motoruna giden açıklama `ozetCikar()` ile üretiliyor:
         * `summary`/`meta.summary` varsa o, yoksa UYARI BÖLÜMLERİ ELENMİŞ
         * gövde. Uyarı elemesi kritik — o olmadan 11 konu birebir aynı
         * "⚠️ Klinik Uyarı…" metnini açıklama olarak gösteriyordu (belgede
         * kayıtlı, düzeltilmiş kusur).
         *
         * Burada o mantık AYNADAN uygulanıyor. Birebir aynı olması şart
         * değil — amaç kırpma sınırını taklit etmek değil, ÇİFTLERİ görmek.
         */
        aciklama: aciklamaUret(j),
        gizli,
        bolum: Array.isArray(j.sections) ? j.sections.length : 0,
        /* Çok ebeveynli olabilir; iskelet HUB ayrımı için hepsi sayılır. */
        ebeveynler: ebeveynListesi(j.meta && j.meta.parent).map(normSlug),
        /* İÇERİK UZUNLUĞU — bölüm SAYISI yetmiyor.
         *
         * `bolum === 0` denetimi bir konuyu ancak HİÇ bölümü yoksa yakalıyor.
         * Ölçüldü: tek bölümü olan ama gövdesi 29 karakter olan konular var
         * ("Talasemiler" sayfasının tamamı: "Hemoglobin elektroforezi ile tanı
         * konur."). O konu bu denetimden temiz geçiyordu.
         *
         * Gövde İKİ ayrı anahtarda olabiliyor — `text` ve `html`. Yalnızca
         * birine bakan bir ölçüm yanılır: ilk denemede `html` arandı ve
         * `addison` 0 karakter çıktı, oysa canlıda 5025 karakter basıyor.
         * Bu yüzden `heading` dışındaki BÜTÜN dize alanları toplanıyor. */
        icerikUzunlugu: (Array.isArray(j.sections) ? j.sections : [])
          .flatMap((s) => Object.entries(s || {})
            .filter(([k, v]) => k !== 'heading' && typeof v === 'string')
            .map(([, v]) => v.replace(/<[^>]+>/g, ' ')))
          .join(' ').replace(/\s+/g, ' ').trim().length,
      });
    }
  }
  return out;
}

const hepsi = konular();
const gorunur = hepsi.filter((k) => !k.gizli);

function tekrarlar(alan) {
  const m = new Map();
  for (const k of gorunur) {
    const v = k[alan];
    if (!v) continue;
    if (!m.has(v)) m.set(v, []);
    m.get(v).push(k);
  }
  return [...m.entries()].filter(([, l]) => l.length > 1).sort((a, b) => b[1].length - a[1].length);
}

/**
 * Etiket dengesi. Konu gövdeleri `dangerouslySetInnerHTML` ile basılıyor,
 * yani kapanmamış bir `<div>` teorik olarak sayfanın kalanını yutabilir.
 *
 * ÖLÇÜLDÜ — bugün görünür bedeli YOK: tarayıcı eksik etiketleri kendi
 * kapatıyor ve her bölüm kendi kutusunda olduğu için hasar yayılmıyor
 * (`ektopik-acth-sendromu` canlıda beş bölümüyle sorunsuz basılıyor,
 * yatay taşma da yok). Yine de listeleniyor: bozuk işaretleme, gövdeyi
 * ayrıştıran render adımlarını (kısaltma açılımı, başlık düzeyi
 * normalleştirmesi) ileride yanıltabilir ve bir gün gerçek bir kırılma
 * olduğunda kaynağı burada aranır.
 */
const BOS_ETIKET = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);
// <p>, <li>, <td>… HTML'de kapanmadan da geçerli — zorlanmıyor.
const GEVSEK = new Set(['p', 'li', 'td', 'th', 'tr', 'option', 'dt', 'dd', 'thead', 'tbody', 'tfoot']);

function etiketDengesi(html) {
  const yigin = [];
  const sorun = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const ad = m[2].toLowerCase();
    if (BOS_ETIKET.has(ad) || GEVSEK.has(ad) || m[3] === '/') continue;
    if (m[1] !== '/') { yigin.push(ad); continue; }
    const k = yigin.lastIndexOf(ad);
    if (k < 0) sorun.push(`fazladan </${ad}>`);
    else if (k !== yigin.length - 1) { sorun.push(`</${ad}> kapanırken açık: ${yigin.slice(k + 1).join(',')}`); yigin.length = k; }
    else yigin.pop();
  }
  if (yigin.length) sorun.push(`kapanmamış: ${yigin.join(',')}`);
  return sorun;
}

const dengesiz = [];
for (const k of hepsi) {
  const p = path.join(KOK, k.brans, k.slug + '.json');
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (err) { continue; }
  (j.sections || []).forEach((s, i) => {
    const govde = (s && (s.html || s.text)) || '';
    if (!/<[a-zA-Z]/.test(govde)) return;
    const sorun = etiketDengesi(govde);
    if (sorun.length) dengesiz.push({ yol: `${k.yol} [sections[${i}]]`, sorun: sorun.join(' · ') });
  });
}

/**
 * İSKELET KONU — bölümü VAR ama gövdesi neredeyse boş.
 *
 * `hiç bölümü olmayan konu` denetimi bunları göremiyordu: tek bölümü olan ama
 * gövdesi 29 karakter olan bir konu oradan temiz geçiyor. Ölçüldü, gerçek:
 * `hematoloji/talasemiler-ana` sayfasının okunabilir içeriğinin TAMAMI
 * "Hemoglobin elektroforezi ile tanı konur." cümlesi.
 *
 * EŞİK VERİDEN SEÇİLDİ, uydurulmadı: 410 görünür konunun ortanca gövdesi
 * 3016 karakter, %5'lik dilim 405. 300 karakter bu dilimin de altında, yani
 * yalnızca tartışmasız aykırıları işaretliyor.
 *
 * HUB İLE YAPRAK AYRILIYOR — sınıfın adı arızanın şekli değil. Çocuğu olan
 * bir konu gezinme sayfasıdır ve kısa olması BEKLENİR; kısa olan bir yaprak
 * ise gerçek içerik boşluğudur. Ölçüldü: 300 karakter altındaki 17 konunun
 * 7'si hub, 10'u yaprak.
 *
 * Bu bir CI kapısı DEĞİL ve olmamalı: içerik yazmak kullanıcının işi, bu
 * liste yalnızca nerede eksik olduğunu ÖLÇÜYOR.
 */
const ISKELET_ESIK = 300;
const cocukSayisi = {};
for (const k of hepsi) {
  for (const e of k.ebeveynler) {
    const anahtar = `${k.brans}/${e}`;
    cocukSayisi[anahtar] = (cocukSayisi[anahtar] || 0) + 1;
  }
}
const iskelet = gorunur
  .filter((k) => k.bolum > 0 && k.icerikUzunlugu < ISKELET_ESIK)
  .map((k) => ({ ...k, cocuk: cocukSayisi[`${k.brans}/${normSlug(k.slug)}`] || 0 }))
  .sort((a, b) => a.icerikUzunlugu - b.icerikUzunlugu);
const iskeletYaprak = iskelet.filter((k) => k.cocuk === 0);
const iskeletHub = iskelet.filter((k) => k.cocuk > 0);

const basliksiz = gorunur.filter((k) => !k.baslik);
const bosGovde = gorunur.filter((k) => k.bolum === 0);
const ciftBaslik = tekrarlar('baslik');
const ciftAciklama = tekrarlar('aciklama');

/**
 * KÖRLÜK NÖBETÇİSİ — "0 çift" ile "0 ölçüm" aynı görünür.
 *
 * Bu denetim uzun süre sessizce hiçbir şey ölçmedi: açıklama alanı
 * `meta.description`ten okunuyordu ve o alan bu depoda HİÇ YOK, yani
 * karşılaştırılacak dize hep boştu ve rapor her zaman "0" diyordu.
 * Kaynak `ozetCikar` aynasına çevrildikten sonra aynı veride 3 çift çıktı.
 *
 * Aynı körlük tekrarlamasın diye: açıklaması dolu olan konu sayısı sıfırsa
 * bu bir "temiz" sonuç değil, ölçüm arızasıdır.
 */
const aciklamaliKonu = gorunur.filter((k) => k.aciklama).length;
if (gorunur.length > 0 && aciklamaliKonu === 0) {
  console.error(
    `HATA: ${gorunur.length} görünür konunun HİÇBİRİNDE açıklama üretilemedi — ` +
      'açıklama kaynağı ya da ayrıştırma bozuldu (çift açıklama denetimi kör).'
  );
  process.exitCode = 1;
}

// Ölçülen sayıyı da bas: "0 kusur" ile "0 öge" ekranda aynı görünür.
console.log(`konu denetimi — ${hepsi.length} dosya (${gorunur.length} görünür) okundu`);

const bas = (ad, liste, bicim) => {
  console.log(`\n${ad}: ${liste.length}`);
  liste.slice(0, 15).forEach((x) => console.log('  ' + bicim(x)));
  if (liste.length > 15) console.log(`  … +${liste.length - 15}`);
};

bas('başlığı olmayan konu', basliksiz, (k) => k.yol);
bas('hiç bölümü olmayan konu', bosGovde, (k) => k.yol);
bas('AYNI başlığı taşıyan konular', ciftBaslik,
  ([v, l]) => `"${v.slice(0, 50)}"\n      ${l.map((k) => k.yol).join('\n      ')}`);
bas('AYNI açıklamayı taşıyan konular', ciftAciklama,
  ([v, l]) => `"${v.slice(0, 50)}…"\n      ${l.map((k) => k.yol).join('\n      ')}`);

/**
 * Bu satır bir dönem "bugün görünür bedeli yok" diyordu. YANLIŞTI ve ölçümle
 * çürütüldü: ektopik-acth-sendromu.json'da kapanmamış etiketler yüzünden tek
 * bir <strong> 1740 karakteri sarıyor, bir <h3> 1287 karakterlik gövdeyi
 * başlık olarak bastırıyordu. Betik ekranı GÖRMÜYOR, yalnızca yığını sayıyor;
 * görünür bedeli olup olmadığını iddia edemez.
 *
 * Ölçme yolu: sayfayı aç, [data-readable] içindeki strong/em/h* ögelerinden
 * textContent uzunluğu birkaç yüz karakteri aşan var mı diye bak. Sağlam bir
 * sayfada en uzun satır içi etiket onlarca karakterdir (bu dosyada onarımdan
 * sonra 1740 -> 76 oldu).
 *
 * ─────────────────────────────────────────────────────────────────────
 * İKİ ARIZA BİRBİRİNDEN AYRI — ve bedelleri de ayrı. Yukarıdaki çürütme
 * KAPANMAMIŞ AÇILIŞ etiketiyleydi: açılan `<strong>` kapanmayınca sonraki
 * gövdeyi YUTUYOR (1740 karakter). Bugünkü üç kayıt başka şekilde:
 *
 *   fazladan </em> · fazladan </strong>   → eşleşmeyen KAPANIŞ
 *   </em> kapanırken açık: strong          → bozuk YUVALAMA
 *
 * HTML ayrıştırıcısı eşleşmeyen kapanışı atar, bozuk yuvalamayı da kendi
 * düzeltir; yutulacak bir şey olmaz. Ölçüldü (bu notun tarif ettiği
 * yöntemle, üç sayfa da canlı render edilerek):
 *
 *   men1-gastrinoma-zes     en uzun em 13 · strong 52   eşik aşan 0
 *   anemiler                en uzun em 118 · strong 89  eşik aşan 0
 *   miyeloproliferatif      en uzun em 42 · strong 40   eşik aşan 0
 *                           (1 iç içe vurgu — yuvalamanın izi, zararsız)
 *
 * Yani BU ÜÇ KAYDIN görünür bedeli sıfır ve içerik dosyalarına dokunmayı
 * gerektirmiyor. Genelleme YAPILMIYOR: kapanmamış açılış etiketi hâlâ
 * gerçek hasar veriyor ve liste o yüzden basılmaya devam ediyor. Yeni bir
 * kayıt çıktığında hangi arıza olduğuna bak, sonra ölç.
 */
bas('etiket dengesi bozuk bölüm (görünür bedeli AYRICA ölçülmeli)', dengesiz,
  (d) => `${d.yol}\n      ${d.sorun}`);

bas(`İSKELET yaprak konu (<${ISKELET_ESIK} krk gövde, çocuğu YOK — içerik boşluğu)`, iskeletYaprak,
  (k) => `${String(k.icerikUzunlugu).padStart(4)} krk · ${k.brans}/${k.slug}`);

/* Hub'lar AYRI listeleniyor ve kusur SAYILMIYOR: çocuğu olan konu bir
   gezinme sayfasıdır, kısa gövdesi beklenen davranış. Aynı eşiğe düşen iki
   şeyi tek listede toplamak, gerçek boşluğu gürültüye boğardı. */
bas(`kısa HUB konu (beklenen — gezinme sayfası, kusur değil)`, iskeletHub,
  (k) => `${String(k.icerikUzunlugu).padStart(4)} krk · ${k.cocuk} çocuk · ${k.brans}/${k.slug}`);

const toplam = basliksiz.length + bosGovde.length + ciftBaslik.length + ciftAciklama.length
  + dengesiz.length + iskeletYaprak.length;
if (!toplam) console.log('\nkünye kusuru yok.');
else console.log(`\n${toplam} kayıt insan kararı bekliyor (bu betik CI kapısı DEĞİL).`);
