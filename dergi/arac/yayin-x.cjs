// MediSea YDUS Dergisi — kalıp denemesi (Yayın X) üreteci.
// İçerik MediSea premium dosyalarından DERLENİR; özgün değildir, yalnızca
// sayının biçimini sınamak içindir. Metne cümle EKLENMEZ, yeniden YAZILMAZ:
// her bölümden "anlatım" (ilk 1–2 cümle) ve "spot" (sınav ifadesi taşıyan
// kısa cümleler) SEÇİLİR. Seçim ölçütü aşağıdaki SINAV desenidir.
// Kullanım: node dergi/arac/yayin-x.cjs  →  dergi/yayin-x/sayi-x.html (elle düzenlenen dosyayı EZMEZ)
const fs = require("fs");
const path = require("path");

const KOK = path.resolve(__dirname, "../..");
const P = path.join(KOK, "web/content/premium/ydus");
const oku = (f) => JSON.parse(fs.readFileSync(path.join(P, f), "utf8"));
const varMi = (f) => fs.existsSync(path.join(P, f));
const konu = (k) => oku(`topics/${k}.json`);
const quiz = (k) => oku(`quizzes/${k}-quiz-1.json`).sorular;
const inci = (k) => (varMi(`pearls/${k}.json`) ? oku(`pearls/${k}.json`).pearls : []);
const kart = (k) => (varMi(`flashcards/${k}.json`) ? oku(`flashcards/${k}.json`).cards : []);
const ARAC = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(KOK, "web/content/arac-index.json"), "utf8")).map((a) => [a.slug, a])
);

// ---- sayının planı -------------------------------------------------------
const SAYI = {
  no: "X",
  tarih: "Kalıp denemesi",
  kapak: {
    baslik: "Trombositopeni ve Tromboz",
    altbaslik: "HİT ile İTP: aynı düşük trombosit, zıt iki dünya",
    sorular: [["hematoloji/heparin-induklu-trombositopeni", 4], ["hematoloji/itp", 4]],
    araclar: ["4t-hit", "plasmic"],
  },
  koseler: [
    { tur: "buyuk", brans: "Kardiyoloji", renk: "#B3261E", konu: "kardiyoloji/akut-koroner-sendromlar", soru: 12, araclar: ["grace", "timi-ua", "heart"] },
    { tur: "buyuk", brans: "Nefroloji", renk: "#1F5FA8", konu: "nefroloji/asit-baz-dengesi", soru: 12, araclar: ["abg", "anion-gap"] },
    { tur: "buyuk", brans: "Endokrinoloji", renk: "#177A5B", konu: "endokrinoloji/graves-hastaligi", soru: 12, araclar: ["burch-wartofsky"] },
    { tur: "buyuk", brans: "Hematoloji", renk: "#8E1F4F", konu: "hematoloji/aml-ana", soru: 12, araclar: [] },
    { tur: "buyuk", brans: "Gastroenteroloji", renk: "#A0601A", konu: "gastroenteroloji/asit-portal-hipertansiyon", soru: 12, araclar: ["child-pugh", "meld-na"] },
    { tur: "orta", brans: "Romatoloji", renk: "#6B3FA0", konu: "romatoloji/sle", soru: 6, araclar: [] },
    { tur: "orta", brans: "Enfeksiyon", renk: "#2E7D32", konu: "enfeksiyon/gram-pozitif-bakteriyel-enfeksiyonlar", soru: 6, araclar: [] },
    { tur: "orta", brans: "Göğüs Hastalıkları", renk: "#00727A", konu: "gogus-hastaliklari/sarkoidoz", soru: 6, araclar: [] },
    { tur: "orta", brans: "Onkoloji", renk: "#4A4F8C", konu: "onkoloji/akciger-kanseri", soru: 6, araclar: ["ecog"] },
    { tur: "donen", brans: "Palyatif Bakım", renk: "#5F6B76", konu: "onkoloji/agri-yonetimi", soru: 4, araclar: [] },
  ],
  tekrar: [["enfeksiyon/crkp-karbapenem-direncli-klebsiella", 2], ["nefroloji/iga-nefropatisi", 2]],
  vaka: "vakalar/hematoloji/aml-ana-vaka-1.json",
};

// Köşe ölçüleri: sözcük bütçesi, bölüm başına spot, kutu sayıları.
const OLCU = {
  kapak: { butce: 650, spot: 3, tablo: 2, sekil: 2, soru: 1, inci: 2, akil: 2, tabloSatir: 5, kutu: { uyari: 2, pratik: 1, ek_bilgi: 1 } },
  buyuk: { butce: 650, spot: 3, tablo: 2, sekil: 2, soru: 1, inci: 3, akil: 2, tabloSatir: 5, kutu: { uyari: 2, pratik: 1, ek_bilgi: 1 } },
  orta: { butce: 330, spot: 3, tablo: 1, sekil: 1, soru: 0, inci: 2, akil: 1, tabloSatir: 4, kutu: { uyari: 1, pratik: 1, ek_bilgi: 0 } },
  donen: { butce: 330, spot: 3, tablo: 1, sekil: 1, soru: 0, inci: 2, akil: 1, tabloSatir: 4, kutu: { uyari: 1, pratik: 1, ek_bilgi: 0 } },
};

// ---- metin yardımcıları --------------------------------------------------
const kac = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const bicim = (s) => kac(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n+/g, "<br>");
const kelime = (s) => String(s ?? "").replace(/\*\*/g, "").split(/\s+/).filter(Boolean).length;
const temizle = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
// Cümle sınırı: noktalamadan sonra boşluk ve büyük harf; "1." gibi numara SINIR DEĞİL.
const cumleler = (s) => temizle(s).split(/(?<=[.!?])(?<!\d[.!?])\s+(?=[A-ZÇĞİÖŞÜ0-9(*])/).map(dengele).filter((c) => kelime(c) >= 3);
// Bölünme kalın işaretini yarım bırakırsa (tek sayıda **) hepsini sök.
const dengele = (c) => ((c.match(/\*\*/g) || []).length % 2 ? c.replace(/\*\*/g, "") : c);
const ilkCumle = (s) => cumleler(s)[0] || temizle(s);
const satirMetni = (s) => (typeof s === "string" ? s : (s.yil ? `${s.yil}: ` : "") + s.metin);

// Sınav ifadesi: "en sık", "ilk tercih", eşik, doz, süre, kontrendikasyon…
const SINAV = /en sık|en önemli|en yaygın|ilk (tercih|basamak|seçenek|adım|test)|altın standart|patognomonik|tanı|tedavi|kontrendike|endikasyon|öneril|tercih|seçilmeli|kesilmeli|başlanmalı|verilmeli|yapılmalı|eşik|kriter|skor|ayırıcı|ayırt|%|≥|≤|<|>|\bmg\b|saat|gün\b|hafta|ay\b|yaş|risk|mortalite|prognoz/gi;
// Bilgi taşımayan çerçeve cümlesi ("… kritik öneme sahiptir") spot olamaz.
const CERCEVE = /kritik öneme|önem taşı|öneme sahip|uzmanlık düzeyinde|bu bölümde|ele alın|incelen(ecek|mektedir)|aşağıda(ki)? /i;
function spotSkoru(c) {
  const n = kelime(c);
  if (n > 28 || n < 5 || CERCEVE.test(c)) return 0;
  const isaret = (c.match(SINAV) || []).length;
  return (/\*\*/.test(c) ? 2 : 0) + Math.min(isaret, 3) + (n <= 18 ? 1 : 0);
}

// ---- blok → dergi biçimi -------------------------------------------------
// Renk kodu (bütün seride sabit): SPOT pembe · İKAZ kırmızı · PRATİK yeşil ·
// AKIL NOTU sarı · BİLİYOR MUYDUN gök mavisi · TEMD camgöbeği · İNCİ mavi (kenar)
// Şekiller: ALGORİTMA (adım akışı) · KARŞILAŞTIR (iki kart) · ZİNCİR (ok dizisi).

const hucre = (h) => (kelime(h) > 22 ? ilkCumle(h) : temizle(h));
const zincirParca = (c) => {
  const p = c.replace(/\*\*/g, "").split("→").map((x) => x.trim().replace(/[.;:]$/, ""));
  return p.length >= 4 && p.every((x) => kelime(x) >= 1 && kelime(x) <= 8) ? p : null;
};
const zincirHtml = (p) => `<div class="zincir">${p.map((x) => `<span>${kac(x)}</span>`).join("<i>→</i>")}</div>`;

function metinBlok(b, o) {
  // "**1.** …" diye numaralı satırlar (≥3) → algoritma akışı
  const numarali = b.satirlar.map(satirMetni).filter((t) => /^\*\*\d+\.\*\*/.test(t));
  if (numarali.length >= 3) {
    const ad = numarali.slice(0, 5).map((t) => {
      const m = t.match(/^\*\*(\d+)\.\*\*\s*(.*)$/);
      return [m[1] + ". adım", hucre(m[2])];
    });
    const html = `<figure class="akis"><figcaption><em>Algoritma</em>${kac(b.baslik)}</figcaption><ol>${ad.map(([a, t]) =>
      `<li><span class="ad">${kac(a)}</span><div>${bicim(t)}</div></li>`).join("")}</ol></figure>`;
    return { html, kelime: kelime(ad.map((x) => x[1]).join(" ")), sekil: 1, metin: b.baslik + " " + ad.map((x) => x[1]).join(" ") };
  }
  let c = b.satirlar.flatMap((s) => cumleler(satirMetni(s)));
  if (!c.length) return null;
  // ok dizisi taşıyan cümle şekle döner, düz metinden çıkar
  let zincir = null;
  for (const t of c) {
    // "A → B → C → D" ya da "Önsöz: A → B → C → D" (iki noktadan sonrası)
    const ik = t.indexOf(":");
    const z = zincirParca(t) || (ik > 0 ? zincirParca(t.slice(ik + 1)) : null);
    if (z) { zincir = z; c = c.filter((x) => x !== t); break; }
  }
  const anlatim = c.length ? [c[0]] : [];
  if (c[1] && kelime(c[0]) + kelime(c[1]) <= 34) anlatim.push(c[1]);
  const kalan = c.slice(anlatim.length).map((t, i) => ({ t, i, s: spotSkoru(t) })).filter((x) => x.s > 0);
  const spot = kalan.sort((a, b) => b.s - a.s || a.i - b.i).slice(0, o.spot).sort((a, b) => a.i - b.i).map((x) => x.t);
  const html = `<h4>${kac(b.baslik)}</h4>` + (anlatim.length ? `<p class="anlatim">${anlatim.map(bicim).join(" ")}</p>` : "") +
    (zincir ? zincirHtml(zincir) : "") +
    (spot.length ? `<ul class="spot">${spot.map((t) => `<li>${bicim(t)}</li>`).join("")}</ul>` : "");
  return { html, kelime: kelime(anlatim.join(" ") + " " + spot.join(" ")) + (zincir ? 10 : 0), spot: spot.length, gosterilen: [...anlatim, ...spot],
    sekil: zincir ? 1 : 0, metin: b.baslik + " " + c.join(" ") };
}

function tabloTuru(b) {
  const adim = b.satirlar.filter((s) => /^\s*(\d+\.|adım|basamak|evre|gün)/i.test(s.hucreler[0])).length;
  if (b.kolonlar.length === 3 && /↔|karşılaştır|\bvs\b/i.test(b.baslik + " " + b.kolonlar.join(" "))) return "kars";
  if (adim >= 3 || /algoritma|basamak|yönetim adım/i.test(b.baslik)) return "akis";
  return "tablo";
}

function tabloBlok(b, o) {
  const tur = tabloTuru(b);
  const yildizli = b.satirlar.filter((s) => s.hucreler.join(" ").includes("★"));
  if (tur === "akis") {
    const ad = b.satirlar.slice(0, 5);
    const html = `<figure class="akis"><figcaption><em>Algoritma</em>${kac(b.baslik)}</figcaption><ol>${ad.map((s) =>
      `<li><span class="ad">${bicim(hucre(s.hucreler[0]))}</span><div>${bicim(hucre(s.hucreler[1] || ""))}${s.hucreler[2] ? `<small>${bicim(hucre(s.hucreler[2]))}</small>` : ""}</div></li>`).join("")}</ol></figure>`;
    return { html, kelime: ad.reduce((n, s) => n + kelime(s.hucreler.slice(0, 3).map(hucre).join(" ")), 0), sekil: 1,
      metin: b.baslik + " " + ad.map((s) => s.hucreler.join(" ")).join(" ") };
  }
  if (tur === "kars") {
    const sat = b.satirlar.slice(0, 5);
    const kart = (j) => `<div class="kk k${j}"><h5>${kac(b.kolonlar[j])}</h5><dl>${sat.map((s) =>
      `<dt>${kac(temizle(s.hucreler[0]))}</dt><dd>${bicim(hucre(s.hucreler[j]))}</dd>`).join("")}</dl></div>`;
    const html = `<figure class="kars"><figcaption><em>Karşılaştır</em>${kac(b.baslik)}</figcaption><div class="kk-ikili">${kart(1)}<span class="vs">vs</span>${kart(2)}</div></figure>`;
    return { html, kelime: sat.reduce((n, s) => n + kelime(s.hucreler.map(hucre).join(" ")), 0), sekil: 1,
      metin: b.baslik + " " + sat.map((s) => s.hucreler.join(" ")).join(" ") };
  }
  const secim = (yildizli.length >= 2 ? yildizli : b.satirlar).slice(0, o.tabloSatir);
  const k = Math.min(b.kolonlar.length, 3);
  const not = secim.length < b.satirlar.length ? `<span>${secim.length}/${b.satirlar.length} satır${yildizli.length >= 2 ? " · ★ işaretliler" : ""}</span>` : "";
  const html = `<figure class="tablo"><figcaption>${kac(b.baslik)}${not}</figcaption><table><thead><tr>${b.kolonlar.slice(0, k)
    .map((x) => `<th>${kac(x)}</th>`).join("")}</tr></thead><tbody>${secim
    .map((s) => `<tr>${s.hucreler.slice(0, k).map((h) => `<td>${bicim(hucre(h))}</td>`).join("")}</tr>`).join("")}</tbody></table></figure>`;
  return { html, kelime: secim.reduce((n, s) => n + kelime(s.hucreler.slice(0, k).map(hucre).join(" ")), 0), tablo: 1,
    metin: b.baslik + " " + secim.map((s) => s.hucreler.join(" ")).join(" ") };
}

const KUTU_ETIKET = { uyari: "İkaz", pratik: "Pratik", ek_bilgi: "Biliyor muydun?" };
function kutuBlok(b) {
  const c = cumleler(b.metin);
  const t = c[0] && kelime(c[0]) <= 40 ? c[0] : null;
  if (!t) return null;
  const ek = b.baslik ? ` · ${kac(temizle(b.baslik))}` : "";
  return { html: `<aside class="kutu ${b.tur}"><b>${KUTU_ETIKET[b.tur] || "Not"}${ek}</b>${bicim(t)}</aside>`,
    kelime: kelime(t), kutu: 1, tur: b.tur, metin: t };
}

function temdBlok(b) {
  const m = b.maddeler.slice(0, 3).map((x) => ilkCumle(x.metin));
  return { html: `<aside class="kutu temd"><b>TEMD ne diyor?</b><ul>${m.map((t) => `<li>${bicim(t)}</li>`).join("")}</ul></aside>`,
    kelime: kelime(m.join(" ")), kutu: 1, metin: m.join(" ") };
}

// ---- kenar öğeleri, akıl notu, ara soru ----------------------------------
const DURAK = new Set("ancak olarak arasında sonucu nedeniyle durumunda olduğu olmayan hastalarda hastalık tedavi klinik özellikle göre gibi veya daha birlikte".split(" "));
const kokler = (s) => new Set(String(s).toLocaleLowerCase("tr").split(/[^a-zçğıöşü0-9-]+/)
  .filter((w) => w.length >= 5 && !DURAK.has(w)).map((w) => w.slice(0, 5)));
const inciHtml = (p) => `<aside class="kenar inci"><b>Klinik inci</b><strong>${bicim(p.title)}</strong>${bicim(ilkCumle(p.content))}</aside>`;
const akilHtml = (c) => `<aside class="akil"><b>Akıl notu</b><span class="on">${bicim(c.front)}</span><span class="arka">${bicim(c.back)}</span></aside>`;
const soruHtml = (s, no) => `<aside class="dur"><b>Dur, düşün · ${no}</b><p>${bicim(s.metin)}</p><ol class="sec">${["A", "B", "C", "D", "E"]
  .filter((h) => s.secenekler[h]).map((h) => `<li><b>${h})</b> ${bicim(s.secenekler[h])}</li>`).join("")}</ol></aside>`;

// ---- köşe derleyici -------------------------------------------------------
// Bloklar sırayla dönüştürülür. Şekil (algoritma/karşılaştır) bütçeye takılmaz,
// sayısı sınırlıdır; metin ve tablo bütçeyi aşarsa ATLANIR.
function derle(konuAdi, olcu, testAdet, noBas = 1) {
  const j = konu(konuAdi);
  const parcalar = [];
  let n = 0;
  const say = { tablo: 0, sekil: 0, uyari: 0, pratik: 0, ek_bilgi: 0, temd: 0 };
  for (const b of j.icerik) {
    let p = null;
    if (b.tip === "metin") p = metinBlok(b, olcu);
    else if (b.tip === "tablo") {
      const tur = tabloTuru(b);
      if (tur === "tablo" ? say.tablo < olcu.tablo : say.sekil < olcu.sekil) p = tabloBlok(b, olcu);
    } else if (b.tip === "temd") p = say.temd < 1 ? (say.temd++, temdBlok(b)) : null;
    else if (b.tip === "bilgi_kutusu" && say[b.tur] < (olcu.kutu[b.tur] || 0)) p = kutuBlok(b);
    if (!p) continue;
    const sekilMi = p.sekil && b.tip === "tablo";
    if (!sekilMi && parcalar.length && n + p.kelime > olcu.butce * 1.1) continue;
    parcalar.push(p); n += p.kelime;
    say.tablo += p.tablo || 0; say.sekil += sekilMi ? 1 : 0;
    if (p.tur) say[p.tur]++;
  }

  // inci: en çok kök paylaştığı parçanın BAŞINA (kenar kutusu o hizada durur)
  const kok = parcalar.map((p) => kokler(p.metin));
  const kenar = parcalar.map(() => []);
  const inciler = inci(konuAdi).filter((p) => kelime(ilkCumle(p.content)) <= 35).slice(0, olcu.inci);
  for (const p of inciler) {
    const pk = kokler(p.title + " " + p.content);
    let en = 0, skor = -1;
    kok.forEach((k, i) => {
      if (kenar[i].length) return;
      let s = 0; for (const w of pk) if (k.has(w)) s++;
      if (s > skor) { skor = s; en = i; }
    });
    kenar[en].push(inciHtml(p));
  }
  // akıl notu (hızlı kart): metnin içine, eşit aralıkla
  const notlar = kart(konuAdi).filter((c) => kelime(c.front) + kelime(c.back) <= 30).slice(0, olcu.akil);
  const notYeri = new Map(notlar.map((c, i) => [Math.floor(((i + 1) * parcalar.length) / (notlar.length + 1)), c]));

  // ara soru: teste girmeyenlerin EN KISASI, köşenin ortasına
  const cevaplar = [];
  const boy = (s) => JSON.stringify(s.secenekler).length + s.metin.length;
  const sorular = quiz(konuAdi).slice(testAdet).filter((s) => boy(s) <= 700).sort((a, b) => boy(a) - boy(b)).slice(0, olcu.soru);
  const orta = Math.max(0, Math.floor(parcalar.length / 2) - 1);

  let html = "", no = noBas;
  parcalar.forEach((p, i) => {
    html += kenar[i].join("") + p.html;
    if (notYeri.has(i)) html += akilHtml(notYeri.get(i));
    if (i === orta) for (const s of sorular) { html += soruHtml(s, no); cevaplar.push({ no, dogru: s.dogru, aciklama: s.aciklama_kisa }); no++; }
  });
  const top = (a) => parcalar.reduce((t, p) => t + (p[a] || 0), 0);
  // köşe sonu: Sayılarla şeridi + "Bu köşede ne öğrendin?" listesi
  const sayilar = sayilarla(parcalar.flatMap((p) => p.gosterilen || []));
  const basliklar = [...html.matchAll(/<h4>(.*?)<\/h4>|<figcaption><em>[^<]*<\/em>(.*?)<\/figcaption>/g)].map((m) => m[1] || m[2]);
  const yoklama = [
    ...kart(konuAdi).filter((c) => !notlar.includes(c) && kelime(c.front) <= 22).slice(0, 3).map((c) => bicim(c.front)),
    ...basliklar.map((t) => `<b>${t}</b> — kendi cümlelerinle anlatabiliyor musun?`),
  ].slice(0, 5);
  return { meta: j.meta, html, kelime: n, toplamBlok: j.icerik.length, alinan: parcalar.length, cevaplar, sonNo: no, sayilar, yoklama,
    spot: top("spot"), tablo: top("tablo"), sekil: top("sekil"), kutu: top("kutu"), inci: inciler.length, kart: notlar.length };
}

// Sayılarla: metinde birimi/işareti olan sayıyı (%, ≥, saat, mg…) ve ÖNÜNDEKİ
// kısa bağlamı (aynı yan cümle, en çok 6 sözcük) çeker. Sayı uydurulmaz.
const SAYI_RE = /(?:[≥≤<>]\s?)?%?\s?\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?\s?(?:%|dakika|dk|saat|gün|hafta|ay|yıl|mg|mmHg|mEq\/L|ms|ng\/mL)?/g;
function sayilarla(metinler, max = 4) {
  const out = [], gor = new Set();
  for (const t of metinler.flatMap((m) => cumleler(m))) {
    for (const yan of t.replace(/\*\*/g, "").split(/[;:(),]|—/)) {
      for (const m of yan.matchAll(SAYI_RE)) {
        const s = m[0].trim();
        if (!/[%≥≤<>]|[a-zğ]$/i.test(s) || /^\d+$/.test(s)) continue; // birimsiz çıplak sayı değil
        const once = yan.slice(0, m.index).trim().split(/\s+/).filter(Boolean).slice(-6).join(" ");
        // etiket harfle başlamalı, işaretle bitmemeli, en az 3 sözcük olmalı
        if (kelime(once) < 3 || /[★·|]/.test(once) || /^[^A-Za-zÇĞİÖŞÜçğıöşü]|[/+=]$/.test(once) || gor.has(s)) continue;
        gor.add(s); out.push({ s, etiket: once });
        break;
      }
      if (out.length >= max) return out;
    }
  }
  return out;
}
const sayilarHtml = (l) => (l.length < 2 ? "" : `<div class="sayilar"><em>Sayılarla</em>${l.map((x) =>
  `<div><b>${kac(x.s)}</b><span>${kac(x.etiket)}</span></div>`).join("")}</div>`);
const yoklamaHtml = (l) => (!l.length ? "" : `<div class="yoklama"><em>Bu köşede ne öğrendin?</em><ul>${l.map((x) => `<li>${x}</li>`).join("")}</ul></div>`);
const koseSonu = (p) => sayilarHtml(p.sayilar) + yoklamaHtml(p.yoklama);

function cevapSatiri(cevaplar) {
  if (!cevaplar.length) return "";
  return `<p class="dur-cevap">${cevaplar.map((c) => `<b>Dur, düşün ${c.no}: ${c.dogru}.</b> ${bicim(ilkCumle(c.aciklama || ""))}`).join(" ")}</p>`;
}
function araclar(liste) {
  const a = liste.filter((s) => ARAC[s]);
  if (!a.length) return "";
  return `<p class="arac"><b>Hesaplayıcı</b> ${a.map((s) => `${kac(ARAC[s].name)} <i>/tools/${s}</i>`).join(" · ")}</p>`;
}
const dk = (n) => Math.max(1, Math.round(n / 140));
const kunye = (p, soru) => `<p class="kunye"><span class="sure">~${dk(p.kelime)} dk okuma</span>${[[p.spot, "spot"], [p.sekil, "şekil"], [p.kutu, "kutu"], [p.inci, "inci"], [p.kart, "akıl notu"], [soru, "soru"]]
  .filter(([n]) => n).map(([n, a]) => `<span><b>${n}</b> ${a}</span>`).join("")}</p>`;

// ---- soru havuzu ---------------------------------------------------------
const sorular = [];
function soruAl(konuAdi, adet, bolum) {
  const q = quiz(konuAdi).slice(0, adet);
  if (q.length < adet) throw new Error(`${konuAdi}: ${adet} soru istendi, ${q.length} var`);
  for (const s of q) sorular.push({ ...s, bolum });
}
for (const [k, n] of SAYI.kapak.sorular) soruAl(k, n, "Kapak");
for (const k of SAYI.koseler) soruAl(k.konu, k.soru, k.brans);
for (const [k, n] of SAYI.tekrar) soruAl(k, n, "Tekrar");

// ---- sayfalar ------------------------------------------------------------
const rapor = [];
let kapakNo = 1;
const kapakParcalar = SAYI.kapak.sorular.map(([k, n]) => {
  const p = derle(k, OLCU.kapak, n, kapakNo);
  kapakNo = p.sonNo;
  rapor.push(["Kapak", k, p]);
  return p;
});

const koseHtml = SAYI.koseler.map((k, i) => {
  const p = derle(k.konu, OLCU[k.tur], k.soru);
  rapor.push([k.brans, k.konu, p]);
  const etiket = { buyuk: "Büyük köşe", orta: "Köşe", donen: "Dönen köşe" }[k.tur];
  return `<section class="kose ${k.tur}" style="--b:${k.renk}">
  <header><span class="no">${String(i + 1).padStart(2, "0")}</span><span class="etiket">${etiket} · ${kac(k.brans)}</span><h2>${kac(p.meta.baslik)}</h2>${kunye(p, k.soru)}</header>
  <div class="govde${p.inci ? "" : " tam"}">${p.html}</div>
  ${koseSonu(p)}${cevapSatiri(p.cevaplar)}${araclar(k.araclar)}
</section>`;
});

const vaka = oku(SAYI.vaka);
const top = (a) => rapor.reduce((t, r) => t + r[2][a], 0);

const icindekiler = [
  ["Kapak dosyası", SAYI.kapak.baslik, "#0B3C5D", "★"],
  ...SAYI.koseler.map((k, i) => [k.brans, konu(k.konu).meta.baslik, k.renk, String(i + 1).padStart(2, "0")]),
  ["Vaka", vaka.baslik, "#0B3C5D", "V"], ["Sayı testi", `${sorular.length} soru + cevap anahtarı`, "#1A1D21", "?"],
];
const BRANS_RENK = { Kapak: "#0B3C5D", Tekrar: "#5F6B76", ...Object.fromEntries(SAYI.koseler.map((k) => [k.brans, k.renk])) };

const harfler = ["A", "B", "C", "D", "E"];
const testHtml = sorular.map((s) => `<li class="soru" style="--b:${BRANS_RENK[s.bolum] || "#1A1D21"}"><span class="sb">${kac(s.bolum)}</span>${bicim(s.metin)}<ol class="sec">${harfler
  .filter((h) => s.secenekler[h]).map((h) => `<li><b>${h})</b> ${bicim(s.secenekler[h])}</li>`).join("")}</ol></li>`).join("");
const anahtar = sorular.map((s, i) => `<span><b>${i + 1}</b>${s.dogru}</span>`).join("");
const aciklama = sorular.map((s, i) => `<p><b>${i + 1}. ${s.dogru}</b> — ${bicim(s.aciklama_kisa || "")}</p>`).join("");
const harfDagilim = harfler.map((h) => `${h}: ${sorular.filter((s) => s.dogru === h).length}`).join(" · ");

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MediSea YDUS Dergisi · Yayın X</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap">
<meta name="dergi-elle" content="Bu dosya elle düzenleniyor; üreteç üzerine yazmaz.">
<link rel="stylesheet" href="dergi.css">
</head><body>

<section class="kapak-sayfa">
  <div class="ust"><span>MediSea</span><span>Yayın ${SAYI.no} · ${SAYI.tarih}</span></div>
  <h1>YDUS<br>Dergisi</h1>
  <p class="slogan">İç hastalıkları yan dal hazırlığı · 10 günde bir</p>
  <div class="manset"><span>Kapak dosyası</span><h2>${kac(SAYI.kapak.baslik)}</h2><p>${kac(SAYI.kapak.altbaslik)}</p></div>
  <ul class="kapak-liste">${SAYI.koseler.map((k) => `<li style="--b:${k.renk}"><b>${kac(k.brans)}</b>${kac(konu(k.konu).meta.baslik)}</li>`).join("")}</ul>
  <div class="rozet"><b>${top("spot")}</b> spot<br><b>${sorular.length}</b> soru<br><b>${top("inci")}</b> inci</div>
  <p class="uyari">KALIP DENEMESİ — içerik MediSea premium dosyalarından derlenmiştir, bu sayıya özgü değildir.</p>
</section>

<section class="icindekiler">
  <h2>Bu sayıda</h2>
  <ol>${icindekiler.map(([a, b, r, n]) => `<li style="--b:${r}"><i>${n}</i><span>${kac(a)}</span><b>${kac(b)}</b></li>`).join("")}</ol>
  <div class="nasil"><h3>Bu dergi nasıl okunur?</h3>
  <ol class="adimlar"><li><b>Oku</b>Her bölüm bir iki cümlelik anlatımla açılır.</li><li><b>İşaretle</b>Pembe elmaslı <b>spot</b> maddeleri sınavın sorduğu yerdir.</li><li><b>Sına</b>Köşeyi bitirince sondaki testi tek oturumda çöz.</li></ol>
  <div class="lejant"><span class="l-spot">Spot</span><span class="l-uyari">İkaz</span><span class="l-pratik">Pratik</span><span class="l-akil">Akıl notu</span><span class="l-ek_bilgi">Biliyor muydun?</span><span class="l-temd">TEMD</span><span class="l-inci">Klinik inci</span><span class="l-sekil">Algoritma · Karşılaştır · Zincir</span></div></div>
</section>

<section class="kose kapak-dosyasi" style="--b:#0B3C5D">
  <header><span class="etiket">Kapak dosyası</span><h2>${kac(SAYI.kapak.baslik)}</h2><p class="alt">${kac(SAYI.kapak.altbaslik)}</p></header>
  ${kapakParcalar.map((p) => `<h3 class="ara">${kac(p.meta.baslik)}</h3><div class="govde${p.inci ? "" : " tam"}">${p.html}</div>`).join("")}
  ${sayilarHtml(kapakParcalar.flatMap((p) => p.sayilar).slice(0, 4))}${yoklamaHtml(kapakParcalar.flatMap((p) => p.yoklama).slice(0, 5))}${cevapSatiri(kapakParcalar.flatMap((p) => p.cevaplar))}${araclar(SAYI.kapak.araclar)}
</section>

${koseHtml.join("\n")}

<section class="kose vaka" style="--b:#0B3C5D">
  <header><span class="etiket">Vaka · ${kac(vaka.branch)}</span><h2>${kac(vaka.baslik)}</h2><p class="alt">${vaka.adimlar.length} adım · ~${vaka.sure_dk} dk</p></header>
  ${vaka.adimlar.map((a) => `<div class="adim"><h4>Adım ${a.adim} · ${kac(a.baslik)}</h4><p>${bicim(a.klinik_bilgi)}</p>${a.soru ? `<p class="vs"><b>Soru:</b> ${bicim(a.soru)}</p><ol class="sec">${harfler
    .filter((h) => a.secenekler?.[h]).map((h) => `<li><b>${h})</b> ${bicim(a.secenekler[h])}</li>`).join("")}</ol><p class="vc"><b>Cevap: ${a.dogru}.</b> ${bicim(a.aciklama_kisa)}</p>` : ""}</div>`).join("")}
</section>

<section class="kose test" style="--b:#1A1D21">
  <header><span class="etiket">Sayı testi</span><h2>${sorular.length} soru</h2><p class="alt">Süre önerisi: ${Math.round(sorular.length * 1.2)} dakika · Kapak 8 · büyük köşeler 12'şer · köşeler 6'şar · dönen 4 · tekrar 4</p></header>
  <ol class="sorular">${testHtml}</ol>
</section>

<section class="kose cevap" style="--b:#1A1D21">
  <header><span class="etiket">Cevap anahtarı</span><h2>Cevaplar ve kısa açıklamalar</h2><p class="alt">Doğru harf dağılımı — ${harfDagilim}</p></header>
  <div class="anahtar">${anahtar}</div>
  <div class="aciklamalar">${aciklama}</div>
</section>

</body></html>`;

const cikti = path.join(KOK, "dergi/yayin-x");
fs.mkdirSync(cikti, { recursive: true });
// Üretilen dosya bundan sonra ELLE düzenlenir (sayfa üstü düzenleyici). Üreteç
// onu ezmez: --zorla verilmezse yazmayı reddeder; --cikti ile başka adla yazar.
const ci = process.argv.indexOf("--cikti");
const hedef = path.join(cikti, ci > 0 ? process.argv[ci + 1] : "sayi-x.html");
if (fs.existsSync(hedef) && fs.readFileSync(hedef, "utf8").includes('name="dergi-elle"') && !process.argv.includes("--zorla")) {
  console.error(`${path.relative(KOK, hedef)} elle düzenleniyor — üzerine yazılmadı. Yeni deneme için --cikti <ad>.html ver.`);
  process.exit(1);
}
fs.writeFileSync(hedef, html);

console.log("köşe                 sözcük  blok   spot tablo şekil kutu inci akıl");
for (const [a, k, p] of rapor)
  console.log(`${a.padEnd(20)} ${String(p.kelime).padStart(6)}  ${String(p.alinan).padStart(2)}/${String(p.toplamBlok).padEnd(2)}  ${String(p.spot).padStart(4)} ${String(p.tablo).padStart(5)} ${String(p.sekil).padStart(5)} ${String(p.kutu).padStart(4)} ${String(p.inci).padStart(4)} ${String(p.kart).padStart(4)}  ${k}`);
console.log(`toplam: ${top("spot")} spot · ${sorular.length} soru · ${top("inci")} inci · harf ${harfDagilim}`);
