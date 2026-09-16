// MediSea Hızlı Bakış — sayfa düzenleyici sunucusu (bağımlılıksız)
// Kullanım: node kitap/duzenleyici-sunucu.cjs   →  http://localhost:3400
//
// - kitap/ altındaki dosyaları sunar; bir bölüm .html'i ?duzenle ile açılınca
//   düzenleyici betiğini sayfaya ekler (dosyaya YAZMAZ).
// - POST /kaydet?dosya=…&surum=…  gelen HTML'i dosyaya yazar; önce kitap/.yedek/ altına
//   zaman damgalı yedek alır (son 40 yedek tutulur). Dosya, sayfa açıldıktan sonra
//   BAŞKA biri tarafından (ör. Claude) değiştirildiyse yazmaz: 409 döner ve gelen
//   içeriği .yedek/…-REDDEDILEN-….html olarak saklar — iki taraf da kaybetmez.
// - POST /pdf?dosya=…     pdf.cjs'yi sürer, PDF yolunu döner.
// Yalnızca 127.0.0.1'e bağlanır.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const crypto = require("crypto");
const surumAl = (dosya) => crypto.createHash("sha1").update(fs.readFileSync(dosya)).digest("hex").slice(0, 16);

const KOK = __dirname;
const PORT = Number(process.env.PORT) || 3400;
const YEDEK = path.join(KOK, ".yedek");
const TUR = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".pdf": "application/pdf", ".json": "application/json" };

function guvenliYol(goreli) {
  const tam = path.resolve(KOK, "." + path.posix.normalize("/" + decodeURIComponent(goreli || "")));
  if (!tam.startsWith(KOK + path.sep)) return null;
  return tam;
}

function bolumler() {
  const sonuc = [];
  for (const ad of fs.readdirSync(KOK, { withFileTypes: true })) {
    if (!ad.isDirectory() || ["sablon", "cikti", ".yedek", "node_modules"].includes(ad.name)) continue;
    for (const f of fs.readdirSync(path.join(KOK, ad.name))) {
      if (f.endsWith(".html") && !f.startsWith("_")) sonuc.push(ad.name + "/" + f);
    }
  }
  return sonuc;
}

function govdeOku(req) {
  return new Promise((coz, reddet) => {
    const parca = [];
    let boy = 0;
    req.on("data", (c) => { boy += c.length; if (boy > 20e6) { reddet(new Error("çok büyük")); req.destroy(); } else parca.push(c); });
    req.on("end", () => coz(Buffer.concat(parca).toString("utf8")));
    req.on("error", reddet);
  });
}

function json(res, kod, veri) {
  res.writeHead(kod, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(veri));
}

const sunucu = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "GET" && url.pathname === "/") {
      const liste = bolumler().map((b) => `<li><a href="/${b}?duzenle">${b}</a></li>`).join("");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(`<!doctype html><meta charset="utf-8"><title>Hızlı Bakış düzenleyici</title><body style="font:16px system-ui;padding:40px"><h1>Hızlı Bakış · bölümler</h1><ul>${liste}</ul></body>`);
    }

    if (req.method === "POST" && url.pathname === "/kaydet") {
      const dosya = guvenliYol(url.searchParams.get("dosya"));
      if (!dosya || !dosya.endsWith(".html") || !fs.existsSync(dosya)) return json(res, 400, { hata: "Dosya bulunamadı." });
      const html = await govdeOku(req);
      const gelenSurum = url.searchParams.get("surum");
      if (gelenSurum !== surumAl(dosya)) {
        fs.mkdirSync(YEDEK, { recursive: true });
        const ad = path.basename(dosya, ".html") + "-REDDEDILEN-" + new Date().toISOString().replace(/[:.]/g, "-") + ".html";
        fs.writeFileSync(path.join(YEDEK, ad), html, "utf8");
        return json(res, 409, { hata: "Dosya siz açtıktan sonra değişti (Claude yeni sayfa eklemiş olabilir). Üzerine yazılmadı; düzenlemeleriniz kitap/.yedek/" + ad + " dosyasında saklandı. Sayfayı yenileyip yeniden düzenleyin." });
      }
      const sayfa = (html.match(/<section class="sayfa/g) || []).length;
      // Boş ya da bozuk bir gövde dosyayı ezmesin
      if (sayfa === 0 || html.length < 2000 || !html.includes("</html>")) return json(res, 400, { hata: "Gelen içerik eksik görünüyor; dosyaya yazılmadı." });
      fs.mkdirSync(YEDEK, { recursive: true });
      const damga = new Date().toISOString().replace(/[:.]/g, "-");
      const yedekAd = path.basename(dosya, ".html") + "-" + damga + ".html";
      fs.copyFileSync(dosya, path.join(YEDEK, yedekAd));
      const eskiler = fs.readdirSync(YEDEK).filter((f) => f.startsWith(path.basename(dosya, ".html") + "-")).sort();
      for (const f of eskiler.slice(0, Math.max(0, eskiler.length - 40))) fs.unlinkSync(path.join(YEDEK, f));
      fs.writeFileSync(dosya, html, "utf8");
      return json(res, 200, { tamam: true, sayfa, yedek: yedekAd, surum: surumAl(dosya) });
    }

    if (req.method === "POST" && url.pathname === "/pdf") {
      const dosya = guvenliYol(url.searchParams.get("dosya"));
      if (!dosya || !fs.existsSync(dosya)) return json(res, 400, { hata: "Dosya bulunamadı." });
      const bas = Date.now();
      execFile(process.execPath, [path.join(KOK, "pdf.cjs"), dosya], { timeout: 180000 }, (hata, cikti, hataCikti) => {
        if (hata) return json(res, 500, { hata: (hataCikti || hata.message).slice(0, 500) });
        json(res, 200, { pdf: "/cikti/" + path.basename(dosya, ".html") + ".pdf", sure: Math.round((Date.now() - bas) / 1000) });
      });
      return;
    }

    if (req.method === "GET") {
      const dosya = guvenliYol(url.pathname);
      if (!dosya || !fs.existsSync(dosya) || fs.statSync(dosya).isDirectory()) { res.writeHead(404); return res.end("Bulunamadı"); }
      const uzanti = path.extname(dosya);
      if (uzanti === ".html" && url.searchParams.has("duzenle")) {
        const goreli = path.relative(KOK, dosya).split(path.sep).join("/");
        const ek = `<script data-dz src="/sablon/duzenleyici.js" data-dosya="${goreli}" data-surum="${surumAl(dosya)}"></script>`;
        const html = fs.readFileSync(dosya, "utf8").replace("</body>", ek + "\n</body>");
        res.writeHead(200, { "Content-Type": TUR[".html"], "Cache-Control": "no-store" });
        return res.end(html);
      }
      res.writeHead(200, { "Content-Type": TUR[uzanti] || "application/octet-stream", "Cache-Control": "no-store" });
      return fs.createReadStream(dosya).pipe(res);
    }

    res.writeHead(405); res.end();
  } catch (e) {
    json(res, 500, { hata: e.message });
  }
});

sunucu.listen(PORT, "127.0.0.1", () => console.log(`Düzenleyici: http://localhost:${PORT}`));
