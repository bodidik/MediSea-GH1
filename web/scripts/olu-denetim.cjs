#!/usr/bin/env node
/**
 * ÖLÜ DENETİM TARAMASI — ekranda duran ama hiçbir şeyi değiştirmeyen kontrol.
 *
 * Ölçüt (CLAUDE.md'de yazılı): bir `useState` değişkeni YALNIZCA `className`,
 * `aria-pressed`, `aria-current` ya da `aria-selected` içinde geçiyorsa, o
 * kontrol kendi vurgusundan başka hiçbir şeyi değiştirmiyordur.
 *
 * Nitelik değerleri süslü parantez dengesiyle metinden çıkarılır, sonra
 * değişken adı hâlâ geçiyor mu diye bakılır.
 *
 * ÖLÇÜT ADAY ÜRETİR, KARAR DEĞİL: yalnızca görünümü yöneten durum meşrudur
 * (sekme, aç/kapa, sıralama).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ÖLÇÜT BİR KEZ SESSİZCE BOZUKTU — TEKRARLAMASIN.
 *
 * İlk yazımda `setX(...)` çağrıları elenmiyordu. `onClick={() => setOlu(!olu)}`
 * ifadesi değişkenin KENDİSİNİ içerdiği için her durum "kullanılıyor" görünüyor
 * ve tarama HİÇBİR ŞEY bulamıyordu — üstelik "0 aday" temiz gibi okunuyordu.
 * Sentetik tohumla yakalandı. Tarihsel kontrol düştüğünde önce ÖLÇÜTÜ sına,
 * commit seçimini değil.
 *
 * TARİHSEL KONTROL: `nrs-2002`nin düzeltme ÖNCESİ sürümleri (bae3de8, 7aead49)
 * bu ölçütle 1 aday veriyor — o araçta aşama 1 soruları skora hiç girmiyordu,
 * yani klinik algoritmanın yarısı atlanıyordu.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BÜTÜN AĞAÇTA TARANDI VE DÖRT ADAY DA KARARA BAĞLANDI — GERÇEK KUSUR YOK.
 * Liste yeniden kovalanmasın diye yazıldı; kod değişirse yeniden ölç.
 *
 *   unit-converter `ters`        MEŞRU — iki yöntemle ölçüldü: çevirme çift
 *                                yönlü (A'ya 10 -> B 0.55; B'ye 5 -> A 90.09)
 *                                ve takas hem `order`ı hem ekrandaki gerçek
 *                                konumu değiştiriyor. Etkisi görünümün kendisi.
 *   ReadingHint `cikis`          MEŞRU — çıkış animasyonunu sürüyor; "Anladım"
 *                                sonrası öge DOM'dan gerçekten çıkıyor
 *                                (ölçüldü: contains false). Görünmez-ama-
 *                                odaklanılabilir tuzağı YOK.
 *   LangSwitch `lang`            ÖLÜ KOD — sıfır içe aktaran
 *   TableOfContents `activeId`   ÖLÜ KOD — sıfır içe aktaran
 * ─────────────────────────────────────────────────────────────────────────
 */
const fs = require('fs');
const path = require('path');

const KOKLER = (() => {
  const i = process.argv.indexOf('--kok');
  if (i !== -1 && process.argv[i + 1]) return [process.argv[i + 1]];
  return ['app', 'components'];
})();

/** `ad={...}` niteliğinin değerini, süslü parantez dengesiyle çıkarır. */
function nitelikleriSil(kaynak, nitelikler) {
  let s = kaynak;
  for (const nit of nitelikler) {
    let i = 0;
    let cikti = '';
    while (i < s.length) {
      const j = s.indexOf(nit + '={', i);
      if (j === -1) {
        cikti += s.slice(i);
        break;
      }
      cikti += s.slice(i, j);
      let k = j + nit.length + 2;
      let derinlik = 1;
      while (k < s.length && derinlik > 0) {
        if (s[k] === '{') derinlik++;
        else if (s[k] === '}') derinlik--;
        k++;
      }
      i = k;
    }
    s = cikti;
    // tırnaklı biçim: className="..."
    s = s.replace(new RegExp(nit + '="[^"]*"', 'g'), '');
    s = s.replace(new RegExp(nit + "='[^']*'", 'g'), '');
  }
  return s;
}

const GORUNUM_NITELIKLERI = ['className', 'aria-pressed', 'aria-current', 'aria-selected'];

function* dosyalar(kok) {
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    const p = path.join(kok, g.name);
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name.startsWith('.') || g.name.startsWith('_')) continue;
      yield* dosyalar(p);
    } else if (g.name.endsWith('.tsx')) {
      yield p;
    }
  }
}

const bulgu = [];
let dosyaSayisi = 0;
let durumSayisi = 0;

const kokListesi = KOKLER.filter((k) => fs.existsSync(k));
for (const kok of kokListesi)
for (const p of dosyalar(kok)) {
  dosyaSayisi++;
  const s = fs.readFileSync(p, 'utf8');
  // useState ile tanımlanan durum değişkenleri
  const durumlar = [...s.matchAll(/const\s*\[\s*(\w+)\s*,\s*set\w+\s*\]\s*=\s*(?:React\.)?useState/g)].map((m) => m[1]);
  durumSayisi += durumlar.length;
  if (!durumlar.length) continue;
  const govde = nitelikleriSil(s, GORUNUM_NITELIKLERI);
  for (const d of durumlar) {
    const desen = new RegExp('\\b' + d + '\\b');
    // Tanım satırının kendisini çıkar
    let tanimsiz = govde.replace(new RegExp('const\\s*\\[\\s*' + d + '\\s*,\\s*set\\w+\\s*\\][^;]*;'), '');
    /*
     * DURUM TESİSATI DA ELENMELİ. İlk ölçüt bunu yapmıyordu ve HİÇBİR ŞEY
     * bulamıyordu: `onClick={() => setOlu(!olu)}` ifadesi değişkenin kendisini
     * içeriyor, yani "kullanılıyor" sanılıyordu. Sentetik tohumla yakalandı —
     * tarihsel kontrol düştüğünde önce ÖLÇÜTÜ sına, commit seçimini değil.
     */
    tanimsiz = tanimsiz.replace(new RegExp('set[A-Z]\\w*\\s*\\([^)]*\\)', 'g'), '');
    if (!desen.test(tanimsiz)) {
      const satir = s.slice(0, s.search(new RegExp('const\\s*\\[\\s*' + d + '\\b'))).split('\n').length;
      bulgu.push({ dosya: p.replace(/\\/g, '/'), satir, durum: d });
    }
  }
}

/* ── negatif + pozitif kontrol ──────────────────────────────────────────
 * Tohum İKİ durum taşıyor:
 *   `olu`   yalnızca className/aria-pressed'de  -> YAKALANMALI
 *   `canli` skora giriyor                        -> YAKALANMAMALI
 * İkincisi şart: ölçüt fazla genişse her durumu aday sayar ve rapor
 * kullanılamaz hâle gelir. Ölçüt bir kez ters yönde bozuldu (hiçbir şey
 * bulmuyordu), o yüzden iki yön de sınanıyor.
 */
if (process.argv.includes('--negatif')) {
  const os = require('os');
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'medisea-olu-'));
  const gecici = path.join(dizin, 'zz-olu-negatif-kontrol.tsx');
  fs.writeFileSync(
    gecici,
    'export default function X() {\n' +
      '  const [olu, setOlu] = useState(false);\n' +
      '  const [canli, setCanli] = useState(0);\n' +
      '  const skor = canli * 2;\n' +
      '  return (<div>\n' +
      '    <button aria-pressed={olu} onClick={() => setOlu(!olu)} className={olu ? "a" : "b"}>Ölü</button>\n' +
      '    <button onClick={() => setCanli(canli + 1)} className={canli > 0 ? "a" : "b"}>Canlı</button>\n' +
      '    <p>Skor: {skor}</p>\n' +
      '  </div>);\n' +
      '}\n',
    'utf8',
  );
  const kaynak = fs.readFileSync(gecici, 'utf8');
  const durumlarT = [...kaynak.matchAll(/const\s*\[\s*(\w+)\s*,\s*set\w+\s*\]\s*=\s*(?:React\.)?useState/g)].map((m) => m[1]);
  const govdeT = nitelikleriSil(kaynak, GORUNUM_NITELIKLERI);
  const adaylar = durumlarT.filter((d) => {
    let t = govdeT.replace(new RegExp('const\\s*\\[\\s*' + d + '\\s*,\\s*set\\w+\\s*\\][^;]*;'), '');
    t = t.replace(new RegExp('set[A-Z]\\w*\\s*\\([^)]*\\)', 'g'), '');
    return !new RegExp('\\b' + d + '\\b').test(t);
  });
  fs.rmSync(dizin, { recursive: true, force: true });
  const olusuVar = adaylar.includes('olu');
  const canliYok = !adaylar.includes('canli');
  if (olusuVar && canliYok) {
    console.log('negatif + pozitif kontrol GEÇTİ — ölü durum yakalanıyor, canlı durum işaretlenmiyor.');
    process.exit(0);
  }
  console.log(
    `kontrol DÜŞTÜ — ölü yakalandı: ${olusuVar}, canlı temiz: ${canliYok} (aday: ${adaylar.join(', ') || 'yok'})`,
  );
  process.exit(1);
}

console.log(`ölü denetim taraması — ${dosyaSayisi} tsx, ${durumSayisi} useState durumu tarandı`);
console.log('');
if (!bulgu.length) {
  console.log('yalnızca kendi vurgusunu yöneten durum yok.');
  process.exit(0);
}
console.log(`ADAY (yalnızca görünüm niteliklerinde geçen durum): ${bulgu.length}`);
console.log('(hepsi kusur değil — sekme/aç-kapa/sıralama meşrudur)');
console.log('');
for (const b of bulgu) console.log(`  ${b.dosya}:${b.satir}  →  ${b.durum}`);
