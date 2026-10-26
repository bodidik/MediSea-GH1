// Konu metni değişti ama "Güncelleme" tarihi ilerlemedi mi? (kullanıcı kuralı, 26 Eki 2026)
//
//   node scripts/updatedat-denetim.cjs            → dizindeki (staged) değişiklikler, pre-commit
//   node scripts/updatedat-denetim.cjs --kapi     → HEAD ile HEAD~1, CI
//   node scripts/updatedat-denetim.cjs --negatif  → kuralı bellek içi örneklerle sınar
//
// Kural: başlık ya da bölümler değiştiyse meta.updatedAt ya taban sürümden
// İLERİ olmalı ya da bugüne eşit olmalı. Yalnız meta (kaynakça, order, parent,
// etiket) değiştiyse tarihe dokunulmaz. Tarih metin yoksa canonical konuda
// zorunlu; premium konuda yalnız taban sürümde varsa aranır.
const { spawnSync } = require("child_process");
const path = require("path");

const AY = { Oca: 1, Şub: 2, Mar: 3, Nis: 4, May: 5, Haz: 6, Tem: 7, Ağu: 8, Eyl: 9, Eki: 10, Kas: 11, Ara: 12 };
function tarih(s) {
  const m = /^(\d{1,2}) (\S+) (\d{4})$/.exec(String(s || "").trim());
  return m && AY[m[2]] ? new Date(+m[3], AY[m[2]] - 1, +m[1]) : null;
}
function govde(j) {
  return JSON.stringify([j && j.title, j && j.sections]);
}
function ayni(a, b) {
  return a.getTime() === b.getTime();
}
function bugunTarihi() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

// null = sorun yok, aksi halde sebep metni
function denetle(eski, yeni, bugun, canonical) {
  if (!yeni) return null;
  const yu = tarih(yeni.meta && yeni.meta.updatedAt);
  if (!eski) {
    return canonical && !yu ? "yeni konuda meta.updatedAt yok ya da biçimi bozuk (örn. \"26 Eki 2026\")" : null;
  }
  if (govde(eski) === govde(yeni)) return null;
  const eu = tarih(eski.meta && eski.meta.updatedAt);
  if (!eu && !canonical) return null;
  if (!yu) return "metin değişti ama meta.updatedAt yok ya da biçimi bozuk";
  if (eu && yu > eu) return null;
  if (ayni(yu, bugun)) return null;
  return "metin değişti ama updatedAt ilerlemedi (" + (eski.meta && eski.meta.updatedAt) + " → " + (yeni.meta && yeni.meta.updatedAt) + ")";
}

function git(args, tamponla) {
  const r = spawnSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 });
  return r.status === 0 ? r.stdout : tamponla ? null : "";
}
function oku(ref, f) {
  const s = git(["show", ref + ":" + f], true);
  if (s === null) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

if (process.argv.includes("--negatif")) {
  const bugun = new Date(2026, 9, 26);
  const t = (u, b) => ({ title: "T", meta: { updatedAt: u }, sections: [{ heading: "H", html: b }] });
  const durumlar = [
    ["metin değişti, tarih aynı → düşmeli", denetle(t("5 Eki 2026", "a"), t("5 Eki 2026", "b"), bugun, true), true],
    ["metin değişti, tarih ileri → geçmeli", denetle(t("5 Eki 2026", "a"), t("26 Eki 2026", "b"), bugun, true), false],
    ["yalnız meta değişti → geçmeli", denetle(t("5 Eki 2026", "a"), { ...t("5 Eki 2026", "a"), meta: { updatedAt: "5 Eki 2026", order: 3 } }, bugun, true), false],
    ["aynı gün ikinci düzenleme → geçmeli", denetle(t("26 Eki 2026", "a"), t("26 Eki 2026", "b"), bugun, true), false],
    ["metin değişti, tarih silindi → düşmeli", denetle(t("5 Eki 2026", "a"), { title: "T", meta: {}, sections: [{ heading: "H", html: "b" }] }, bugun, true), true],
    ["yeni canonical konu tarihsiz → düşmeli", denetle(null, { title: "T", meta: {}, sections: [] }, bugun, true), true],
    ["tarih geriye gitti, bugün değil → düşmeli", denetle(t("20 Eki 2026", "a"), t("5 Eki 2026", "b"), bugun, true), true],
  ];
  let hata = 0;
  for (const [ad, sonuc, beklenenDusme] of durumlar) {
    const tamam = !!sonuc === beklenenDusme;
    if (!tamam) hata++;
    console.log((tamam ? "OK    " : "HATA  ") + ad);
  }
  process.exit(hata ? 1 : 0);
}

const kapi = process.argv.includes("--kapi");
const kok = git(["rev-parse", "--show-toplevel"]).trim();
const aralik = kapi ? ["diff", "--name-only", "--diff-filter=AM", "HEAD~1", "HEAD"] : ["diff", "--cached", "--name-only", "--diff-filter=AM"];
if (kapi && git(["rev-parse", "--verify", "HEAD~1"], true) === null) {
  console.log("updatedat-denetim: HEAD~1 yok (sığ checkout) — atlandı");
  process.exit(0);
}
const taban = kapi ? "HEAD~1" : "HEAD";
const yeniRef = kapi ? "HEAD" : "";
const dosyalar = git(aralik)
  .split("\n")
  .filter((f) => /^web\/content\/(canonical\/.+|premium\/ydus\/topics\/.+)\.json$/.test(f));
let bugun = bugunTarihi();
if (kapi) {
  // CI: "bugün" yerine commitin yazar günü (push başka gün olabilir)
  const g = git(["log", "-1", "--format=%ad", "--date=format:%Y-%m-%d", "HEAD"]).trim().split("-").map(Number);
  bugun = new Date(g[0], g[1] - 1, g[2]);
}
let olculen = 0;
const kusur = [];
for (const f of dosyalar) {
  const yeni = oku(yeniRef, f);
  const eski = oku(taban, f);
  if (!yeni) continue;
  olculen++;
  const sebep = denetle(eski, yeni, bugun, f.includes("/canonical/"));
  if (sebep) kusur.push("  " + f + "\n    " + sebep);
}
console.log("updatedat-denetim: " + olculen + " konu dosyası ölçüldü (" + (kapi ? "HEAD~1..HEAD" : "dizin") + ")");
if (kusur.length) {
  console.log("DÜŞTÜ — metin değişti, Güncelleme tarihi ilerlemedi:\n" + kusur.join("\n"));
  console.log("\nÇare: dosyadaki meta.updatedAt'i bugünün tarihine çek (örn. \"" + bugun.getDate() + " " + Object.keys(AY)[bugun.getMonth()] + " " + bugun.getFullYear() + "\").");
  process.exit(1);
}
process.exit(0);
