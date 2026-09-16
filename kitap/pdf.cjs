// Kullanım: node kitap/pdf.cjs kitap/endokrinoloji/deneme-bolum.html [--onizleme]
// PDF'i kitap/cikti/ altına basar (Microsoft Edge headless, @page A4).
// --onizleme: her sayfanın PNG görüntüsünü de üretir (kontrol için).
// --sayfa 13-21: YALNIZCA bu aralığı bas. Belgeden geçici bir kopya (…-parca.html)
//   üretilir; hem PDF hem PNG yalnız o aralığı içerir. Uzun dosyalarda (60+ sayfa)
//   tam belgeyi basmak dakikalar sürdüğü için varsayılan davranış budur.
// --tam: --sayfa verilse bile PDF'i belgenin tamamı için bas.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const kaynak = path.resolve(process.argv[2] || "");
if (!fs.existsSync(kaynak)) { console.error("Girdi bulunamadı: " + kaynak); process.exit(1); }
const cikti = path.join(__dirname, "cikti");
fs.mkdirSync(cikti, { recursive: true });

// --sayfa verildiyse belgeden yalnız o aralığı içeren geçici bir kopya üret
const ai0 = process.argv.indexOf("--sayfa");
const aralik = ai0 > 0 ? process.argv[ai0 + 1].split("-").map(Number) : null;
let girdi = kaynak;
if (aralik && !process.argv.includes("--tam")) {
  const metin = fs.readFileSync(kaynak, "utf8");
  const parcalar = metin.split(/(?=<section class="sayfa)/);
  const bas = parcalar[0];                       // <head> ve gövde başlangıcı
  const sayfalar = parcalar.slice(1);
  const sonParca = sayfalar[sayfalar.length - 1];
  const kuyrukBas = sonParca.indexOf("</section>") + "</section>".length;
  const kuyruk = sonParca.slice(kuyrukBas);      // kapanış script'i ve </html>
  sayfalar[sayfalar.length - 1] = sonParca.slice(0, kuyrukBas);
  const a = Math.max(1, aralik[0]);
  const b = Math.min(aralik[1] || aralik[0], sayfalar.length);
  girdi = path.join(cikti, path.basename(kaynak, ".html") + "-parca.html");
  fs.writeFileSync(girdi, bas + sayfalar.slice(a - 1, b).join("") + kuyruk);
  console.log("PARÇA " + a + "-" + b + " (" + (b - a + 1) + " sayfa) → " + path.basename(girdi));
}
const ad = path.basename(girdi, ".html");
const url = pathToFileURL(girdi).href;
const profil = path.join(require("os").tmpdir(), "medisea-kitap-edge");
const ortak = ["--user-data-dir=" + profil, "--no-first-run", "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=15000"];

// Edge dosyayı süreç döndükten SONRA yazabiliyor ve açık kalan bir örnek profili
// kilitleyebiliyor: eski çıktıyı sil, dosyanın yazılıp boyutunun durulmasını bekle.
function bekle(ms) { execFileSync(process.execPath, ["-e", `setTimeout(()=>{},${ms})`]); }
function dosyaBekle(yol, sure) {
  const bitis = Date.now() + sure;
  let onceki = -1;
  while (Date.now() < bitis) {
    if (fs.existsSync(yol)) {
      const b = fs.statSync(yol).size;
      if (b > 0 && b === onceki) return true;
      onceki = b;
    }
    bekle(500);
  }
  return fs.existsSync(yol);
}

// Her çalışma kendi geçici profilini kullanır; çıkışta (kilitli değilse) silinir
process.on("exit", () => {
  for (const d of fs.readdirSync(path.dirname(profil))) {
    if (d.startsWith(path.basename(profil)) && d.endsWith("-" + process.pid)) {
      try { fs.rmSync(path.join(path.dirname(profil), d), { recursive: true, force: true }); } catch (e) { /* Edge hâlâ tutuyorsa kalsın */ }
    }
  }
});

const pdf = path.join(cikti, ad + ".pdf");
if (fs.existsSync(pdf)) fs.unlinkSync(pdf);
execFileSync(EDGE, [...ortak.map(a => a.startsWith("--user-data-dir") ? a + "-" + process.pid : a), "--no-pdf-header-footer", "--print-to-pdf=" + pdf, url], { stdio: "ignore" });
if (!dosyaBekle(pdf, 90000)) { console.error("PDF üretilemedi: " + pdf); process.exit(1); }
const boyut = fs.statSync(pdf).size;
if (boyut < 5000) { console.error("PDF şüpheli küçük: " + boyut + " bayt"); process.exit(1); }
console.log("PDF  " + pdf + "  (" + Math.round(boyut / 1024) + " KB)");

if (process.argv.includes("--onizleme")) {
  const sayfaSayisi = (fs.readFileSync(girdi, "utf8").match(/<section class="sayfa/g) || []).length;
  // Parça kipinde belge 1'den başlar; dosya adında özgün sayfa numarasını koru
  const kaydirma = girdi !== kaynak ? Math.max(1, aralik[0]) - 1 : 0;
  const [bas, son] = girdi !== kaynak ? [1, sayfaSayisi]
    : (aralik ? aralik : [1, sayfaSayisi]);
  for (let i = bas; i <= Math.min(son || bas, sayfaSayisi); i++) {
    const png = path.join(cikti, `${path.basename(kaynak, ".html")}-s${i + kaydirma}.png`);
    execFileSync(EDGE, [...ortak.filter(a => !a.startsWith("--user-data-dir")).map(a => a === "--headless=new" ? "--headless" : a), "--force-device-scale-factor=1.6", "--window-size=794,1123", "--user-data-dir=" + profil + "-png" + i + "-" + process.pid, "--screenshot=" + png, url + "?s=" + i], { stdio: "ignore" });
    // Edge ekran görüntüsünü süreç döndükten sonra yazıyor: dosyayı bekle
    if (!dosyaBekle(png, 40000)) { console.error("PNG üretilemedi: " + png); process.exit(1); }
    console.log("PNG  " + png);
  }
}
