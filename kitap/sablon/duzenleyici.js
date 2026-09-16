/* MediSea Hızlı Bakış — sayfa üzerinde düzenleyici
   Sunucu (kitap/duzenleyici-sunucu.cjs) bu betiği ?duzenle ile açılan sayfaya ekler.
   Kaydederken düzenleyiciye ait her şey (data-dz, contenteditable, dz- sınıfları)
   ayıklanır; dosyaya yalnızca sayfanın kendisi yazılır. */
(function () {
  "use strict";

  const betik = document.currentScript;
  const DOSYA = betik.getAttribute("data-dosya");
  let SURUM = betik.getAttribute("data-surum") || "";

  /* ---------- yapılandırma ---------- */
  // Seçilebilen "bloklar": tıklanan yere en yakın olanı seçilir
  const BLOK = [
    ".kutu", ".blok", ".agac", ".sayilar", ".bakis", ".organ", ".serit", ".adim",
    ".zincir", ".alinti", ".yolak", ".bw", ".protokol .p", ".dal", ".dal dl > div",
    "table.tb tr", "ul.madde li", ".spotlar p", ".icindekiler li",
    ".anlati .metin > *", ".kenar > *", ".iki-sutun > div > *",
    "h1.konu", ".giris", ".ust-etiket", ".sayilar > div", ".organ > div", ".serit > div",
    ".kenar-sutun", ".zaman", ".karar-izgara aside > *"
  ].join(",");
  const DUZENLENEMEZ = ".folyo, .tirnak, [data-dz]";
  const KUTU_TURLERI = { spot: "Sınav spotu", inci: "Klinik inci", tuzak: "Tuzak", kural: "Altın kural" };
  const BOLUNUR = "p, li"; // Enter bu ögeleri ikiye böler

  const SABLON = {
    spot: '<div class="kutu spot"><div class="ad">Sınav spotu</div><p>Yeni spot.</p></div>',
    inci: '<div class="kutu inci"><div class="ad">Klinik inci</div><p>Yeni inci.</p></div>',
    tuzak: '<div class="kutu tuzak"><div class="ad">Tuzak</div><p>Yeni tuzak.</p></div>',
    kural: '<div class="kutu kural"><div class="ad">Altın kural</div><p>Yeni kural.</p></div>',
    paragraf: "<p>Yeni paragraf.</p>",
    baslik: "<h2>Yeni başlık</h2>",
    liste: '<ul class="madde"><li>Yeni madde.</li></ul>',
    tablo: '<div class="blok"><table class="tb"><thead><tr><th>Başlık</th><th>Başlık</th></tr></thead><tbody><tr><td class="bas">Satır</td><td>Değer</td></tr><tr><td class="bas">Satır</td><td>Değer</td></tr></tbody></table></div>'
  };
  const SAYFA_SABLON = {
    anlati: `<section class="sayfa sol tur-anlati">
  <div class="tirnak">Endokrinoloji</div>
  <div class="kunye"><span>Hızlı Bakış · Endokrinoloji</span><span>Anlatı</span></div>
  <div class="ust-etiket">Konu · Anlatı</div>
  <h1 class="konu orta">Yeni sayfa başlığı</h1>
  <p class="giris">Giriş cümlesi.</p>
  <div class="anlati">
    <div class="metin"><h2>Ara başlık</h2><p>Metin.</p></div>
    <div class="kenar"><div class="kenar-baslik">Kenar notları</div>${'<div class="kutu spot"><div class="ad">Sınav spotu</div><p>Yeni spot.</p></div>'}</div>
  </div>
  <div class="folyo"><b>0</b><span>MediSea Hızlı Bakış · Endokrinoloji</span></div>
</section>`,
    basvuru: `<section class="sayfa sol tur-basvuru">
  <div class="tirnak">Endokrinoloji</div>
  <div class="kunye"><span>Hızlı Bakış · Endokrinoloji</span><span>Başvuru</span></div>
  <div class="ust-etiket">Konu · Başvuru</div>
  <h1 class="konu orta">Yeni konu</h1>
  <div class="iki-sutun">
    <div><div class="blok"><h2>Başlık</h2><p>Metin.</p></div></div>
    <div><div class="blok"><h2>Başlık</h2><p>Metin.</p></div></div>
  </div>
  <div class="folyo"><b>0</b><span>MediSea Hızlı Bakış · Endokrinoloji</span></div>
</section>`
  };

  /* ---------- durum ---------- */
  let secili = null;
  let pano = null;
  let kirli = false;
  const geri = [];
  const ileri = [];
  let yazmaZamanlayici = null;

  /* ---------- görünüm ---------- */
  const stil = document.createElement("style");
  stil.setAttribute("data-dz", "");
  stil.textContent = `
    body { padding-top: 64px !important; }
    [data-dz][hidden], [data-dz] [hidden] { display: none !important; }
    [data-dz-panel] { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 10px 14px; background: #16202A; color: #E8EDF1; font: 13px/1.2 system-ui, "Segoe UI", sans-serif; box-shadow: 0 2px 10px rgba(0,0,0,.3); }
    [data-dz-panel] b.dz-ad { font-weight: 600; margin-right: 10px; }
    [data-dz-panel] .dz-ayrac { width: 1px; height: 22px; background: #3A4A58; margin: 0 6px; }
    [data-dz] button, [data-dz] select { font: 500 13px/1 system-ui, "Segoe UI", sans-serif; padding: 7px 10px; border-radius: 6px; border: 1px solid #3A4A58; background: #22303C; color: #E8EDF1; cursor: pointer; }
    [data-dz] button:hover { background: #2E3F4E; }
    [data-dz] button:focus-visible, [data-dz] select:focus-visible { outline: 2px solid #7CC4A8; outline-offset: 1px; }
    [data-dz] button.dz-ana { background: #177A5B; border-color: #177A5B; color: #fff; }
    [data-dz] button.dz-ana:hover { background: #1B8F6A; }
    [data-dz] button:disabled { opacity: .45; cursor: default; }
    [data-dz-panel] .dz-durum { margin-left: auto; color: #A9B6C1; }
    [data-dz-panel] .dz-durum.dz-kirli { color: #F2C166; }
    [data-dz-panel] .dz-durum.dz-hata { color: #FF9C9C; }
    [data-dz-arac] { position: absolute; z-index: 999; display: flex; gap: 4px; padding: 5px; background: #16202A; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.35); }
    [data-dz-arac] button, [data-dz-arac] select { padding: 5px 8px; font-size: 12px; }
    .dz-secili { outline: 2px solid #2F7DE1 !important; outline-offset: 2px; }
    .dz-kesilecek { opacity: .45; }
    [contenteditable="true"]:hover { box-shadow: inset 0 -1px 0 rgba(47,125,225,.45); }
    [contenteditable="true"]:focus { outline: 1px dashed rgba(47,125,225,.7); outline-offset: 1px; }
    .sayfa { overflow: visible !important; }
    .sayfa.dz-tasiyor { box-shadow: 0 0 0 3px #D93A3A, 0 2px 12px rgba(0,0,0,.35) !important; }
    [data-dz-rozet] { position: absolute; top: -26px; left: 0; font: 600 12px/1 system-ui, sans-serif; color: #fff; background: #16202A; padding: 5px 8px; border-radius: 5px 5px 0 0; }
    [data-dz-rozet].dz-kotu { background: #D93A3A; }
    [data-dz-rozet].dz-uyari { background: #B7791F; }
    .sayfa.dz-sinirda { box-shadow: 0 0 0 3px #E0A22E, 0 2px 12px rgba(0,0,0,.35) !important; }
    [data-dz-sinir] { position: absolute; left: 0; right: 0; height: 0; border-top: 1px dashed rgba(217,58,58,.55); pointer-events: none; }
    [data-dz-not] { position: relative; }
    [data-dz-not]::after { content: "✎ " attr(data-dz-not); position: absolute; right: -4px; top: -10px; transform: translateX(100%); max-width: 46mm; font: 500 11px/1.3 system-ui, sans-serif; color: #3D3000; background: #FFE58A; padding: 4px 6px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,.25); z-index: 5; white-space: normal; }
    body.dz-onizleme [data-dz-rozet], body.dz-onizleme [data-dz-sinir], body.dz-onizleme [data-dz-arac] { display: none; }
    body.dz-onizleme [data-dz-not]::after { display: none; }
    body.dz-onizleme .dz-secili { outline: none !important; }
    body.dz-onizleme .sayfa { overflow: hidden !important; }
    [data-dz-yardim] { position: fixed; right: 16px; bottom: 16px; z-index: 1000; width: 330px; background: #fff; color: #1A1D21; font: 13px/1.5 system-ui, sans-serif; border-radius: 10px; box-shadow: 0 6px 24px rgba(0,0,0,.3); padding: 14px 16px; }
    [data-dz-yardim] h3 { margin: 0 0 6px; font-size: 14px; }
    [data-dz-yardim] ul { margin: 0; padding-left: 18px; }
    [data-dz-yardim] kbd { font: 12px ui-monospace, Consolas, monospace; background: #EEF1F4; border-radius: 3px; padding: 0 4px; }
  `;
  document.head.appendChild(stil);

  /* ---------- üst panel ---------- */
  const panel = el(`<div data-dz data-dz-panel role="toolbar" aria-label="Düzenleyici">
    <b class="dz-ad">Düzenleyici · ${DOSYA}</b>
    <button data-is="kaydet" class="dz-ana" title="Kaydet (Ctrl+S)">Kaydet</button>
    <button data-is="pdf">PDF üret</button>
    <span class="dz-ayrac"></span>
    <button data-is="geri" title="Geri al (Ctrl+Z)">Geri al</button>
    <button data-is="ileri" title="Yinele (Ctrl+Y)">Yinele</button>
    <span class="dz-ayrac"></span>
    <label style="display:flex;align-items:center;gap:6px">Ekle
      <select data-is="ekle" aria-label="Seçili bloğun ardına ekle">
        <option value="">seçili bloğun ardına…</option>
        <option value="spot">Sınav spotu</option><option value="inci">Klinik inci</option>
        <option value="tuzak">Tuzak</option><option value="kural">Altın kural</option>
        <option value="paragraf">Paragraf</option><option value="baslik">Ara başlık</option>
        <option value="liste">Madde listesi</option><option value="tablo">Tablo</option>
      </select></label>
    <label style="display:flex;align-items:center;gap:6px">Sayfa
      <select data-is="sayfa" aria-label="Sayfa işlemi">
        <option value="">işlem…</option>
        <option value="anlati">Ardına anlatı sayfası ekle</option>
        <option value="basvuru">Ardına başvuru sayfası ekle</option>
        <option value="yukari">Sayfayı öne al</option>
        <option value="asagi">Sayfayı arkaya al</option>
        <option value="sil">Sayfayı sil</option>
      </select></label>
    <span class="dz-ayrac"></span>
    <button data-is="onizleme">Temiz görünüm</button>
    <button data-is="yardim">Yardım</button>
    <span class="dz-durum" aria-live="polite">Hazır</span>
  </div>`);
  document.body.prepend(panel);
  const durum = panel.querySelector(".dz-durum");

  const yardim = el(`<div data-dz data-dz-yardim hidden>
    <h3>Nasıl kullanılır</h3>
    <ul>
      <li><b>Metin:</b> üzerine tıklayıp yazın. <kbd>Ctrl+B</kbd> kalın. Enter paragraf ya da maddeyi böler.</li>
      <li><b>Blok:</b> kutuya, tabloya, satıra ya da paragrafa tıklayınca üstünde araç çubuğu çıkar: taşı, çoğalt, kes/yapıştır, sil, kutu türü, not.</li>
      <li><b>Kes → yapıştır:</b> bloğu başka sütuna ya da başka sayfaya taşımanın yolu.</li>
      <li><b>Sarı çerçeve:</b> metin alt boşluğa, sayfa numarasına yaklaşıyor. <b>Kırmızı:</b> baskıda kesilir. Rozet kaç mm olduğunu söyler; kesik çizgi güvenli sınırdır.</li>
      <li><b>Not:</b> “Not” ile bir bloğa bana talimat bırakın; PDF’te görünmez, sonra ben uygularım.</li>
      <li><kbd>Ctrl+S</kbd> kaydet · <kbd>Ctrl+Z</kbd> geri al · <kbd>Esc</kbd> seçimi bırak. Her kayıttan önce yedek alınır.</li>
    </ul>
    <p style="margin:8px 0 0"><button data-is="yardim-kapat">Kapat</button></p>
  </div>`);
  document.body.appendChild(yardim);

  /* ---------- blok araç çubuğu ---------- */
  const arac = el(`<div data-dz data-dz-arac hidden role="toolbar" aria-label="Blok işlemleri">
    <button data-is="yukari" title="Yukarı taşı" aria-label="Yukarı taşı">↑</button>
    <button data-is="asagi" title="Aşağı taşı" aria-label="Aşağı taşı">↓</button>
    <button data-is="cogalt">Çoğalt</button>
    <button data-is="kes">Kes</button>
    <button data-is="yapistir" disabled>Ardına yapıştır</button>
    <select data-is="tur" aria-label="Kutu türü" hidden>
      <option value="spot">Sınav spotu</option><option value="inci">Klinik inci</option>
      <option value="tuzak">Tuzak</option><option value="kural">Altın kural</option>
    </select>
    <button data-is="not">Not</button>
    <button data-is="sil" style="color:#FF9C9C">Sil</button>
  </div>`);
  document.body.appendChild(arac);

  /* ---------- yardımcılar ---------- */
  function el(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function sayfalar() { return Array.from(document.querySelectorAll("section.sayfa")); }
  function durumYaz(metin, tur) { durum.textContent = metin; durum.className = "dz-durum" + (tur ? " dz-" + tur : ""); }
  function kirlet() { kirli = true; durumYaz("Kaydedilmemiş değişiklik var", "kirli"); }

  function duzenlenebilirYap() {
    const adaylar = document.querySelectorAll("section.sayfa *");
    adaylar.forEach((d) => {
      if (d.closest(DUZENLENEMEZ)) return;
      if (d.parentElement && d.parentElement.closest('[contenteditable="true"]')) return;
      const metinVar = Array.from(d.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (metinVar) d.setAttribute("contenteditable", "true");
    });
  }

  /* ---------- geri al ---------- */
  // Anlık görüntü: ilk sayfadan son sayfaya kadar olan aralığın TAMAMI (aradaki
  // yorum satırları dahil). Yalnızca sayfaları saklamak yorumları dosya sonuna kaydırıyordu.
  function sayfaAraligi() {
    const s = sayfalar();
    const r = document.createRange();
    r.setStartBefore(s[0]);
    r.setEndAfter(s[s.length - 1]);
    return r;
  }
  function anlikGoruntu() {
    const kap = document.createElement("div");
    kap.appendChild(sayfaAraligi().cloneContents());
    temizle(kap);
    return kap.innerHTML;
  }
  function kaydetGeri() { geri.push(anlikGoruntu()); if (geri.length > 80) geri.shift(); ileri.length = 0; }
  function geriYukle(html) {
    const r = sayfaAraligi();
    r.deleteContents();
    const t = document.createElement("template");
    t.innerHTML = html;
    r.insertNode(t.content);
    secimBirak();
    duzenlenebilirYap();
    tasmaDenetle();
    kirlet();
  }

  /* ---------- seçim ---------- */
  function sec(b) {
    if (secili) secili.classList.remove("dz-secili");
    secili = b;
    if (!b) { arac.hidden = true; return; }
    b.classList.add("dz-secili");
    const turSec = arac.querySelector('[data-is="tur"]');
    const kutu = b.matches(".kutu");
    turSec.hidden = !kutu;
    if (kutu) turSec.value = Object.keys(KUTU_TURLERI).find((t) => b.classList.contains(t)) || "spot";
    arac.querySelector('[data-is="yapistir"]').disabled = !pano;
    aracKonumla();
  }
  function secimBirak() { sec(null); }
  function aracKonumla() {
    if (!secili || !document.contains(secili)) { arac.hidden = true; return; }
    const r = secili.getBoundingClientRect();
    arac.hidden = false;
    const y = window.scrollY + r.top - arac.offsetHeight - 6;
    arac.style.top = Math.max(window.scrollY + 70, y) + "px";
    arac.style.left = Math.max(8, window.scrollX + r.left) + "px";
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dz]")) return;
    const sayfa = e.target.closest("section.sayfa");
    if (!sayfa) { secimBirak(); return; }
    const b = e.target.closest(BLOK);
    sec(b && sayfa.contains(b) ? b : null);
  });
  window.addEventListener("scroll", aracKonumla, { passive: true });
  window.addEventListener("resize", () => { aracKonumla(); tasmaDenetle(); });

  /* ---------- blok işlemleri ---------- */
  function kardes(b, yon) {
    let k = yon < 0 ? b.previousElementSibling : b.nextElementSibling;
    while (k && k.matches("[data-dz]")) k = yon < 0 ? k.previousElementSibling : k.nextElementSibling;
    return k;
  }
  function blokIslem(is) {
    if (!secili) return;
    const b = secili;
    if (is === "yukari" || is === "asagi") {
      const k = kardes(b, is === "yukari" ? -1 : 1);
      if (!k || k.matches(".folyo, .tirnak")) return durumYaz("Bu yönde taşınacak yer yok — başka sütuna taşımak için Kes / Ardına yapıştır.");
      kaydetGeri();
      is === "yukari" ? k.before(b) : k.after(b);
    } else if (is === "cogalt") {
      kaydetGeri();
      const kopya = temizle(b.cloneNode(true));
      b.after(kopya);
      duzenlenebilirYap();
      sec(kopya);
    } else if (is === "kes") {
      if (pano && pano.eleman) pano.eleman.classList.remove("dz-kesilecek");
      pano = { eleman: b };
      b.classList.add("dz-kesilecek");
      durumYaz("Kesildi — hedef bloğu seçip “Ardına yapıştır”a basın.");
      arac.querySelector('[data-is="yapistir"]').disabled = false;
      return;
    } else if (is === "yapistir") {
      if (!pano || !pano.eleman || pano.eleman === b || pano.eleman.contains(b)) return;
      kaydetGeri();
      pano.eleman.classList.remove("dz-kesilecek");
      b.after(pano.eleman);
      sec(pano.eleman);
      pano = null;
    } else if (is === "sil") {
      kaydetGeri();
      const sonraki = kardes(b, 1) || kardes(b, -1);
      b.remove();
      sec(sonraki && sonraki.matches(BLOK) ? sonraki : null);
    } else if (is === "not") {
      const eski = b.getAttribute("data-dz-not") || "";
      const yeni = window.prompt("Bu blok için not (PDF’te görünmez; boş bırakırsan not silinir):", eski);
      if (yeni === null) return;
      kaydetGeri();
      yeni.trim() ? b.setAttribute("data-dz-not", yeni.trim()) : b.removeAttribute("data-dz-not");
    }
    kirlet();
    tasmaDenetle();
    aracKonumla();
  }
  arac.addEventListener("click", (e) => {
    const d = e.target.closest("button[data-is]");
    if (d) blokIslem(d.dataset.is);
  });
  arac.querySelector('[data-is="tur"]').addEventListener("change", (e) => {
    if (!secili || !secili.matches(".kutu")) return;
    kaydetGeri();
    const eskiTur = Object.keys(KUTU_TURLERI).find((t) => secili.classList.contains(t));
    const yeniTur = e.target.value;
    if (eskiTur) secili.classList.remove(eskiTur);
    secili.classList.add(yeniTur);
    const ad = secili.querySelector(":scope > .ad");
    if (ad && eskiTur && ad.textContent.trim().toLocaleLowerCase("tr").startsWith(KUTU_TURLERI[eskiTur].toLocaleLowerCase("tr"))) {
      ad.textContent = ad.textContent.trim().replace(new RegExp("^" + KUTU_TURLERI[eskiTur], "i"), KUTU_TURLERI[yeniTur]);
    }
    kirlet();
    tasmaDenetle();
  });

  /* ---------- ekleme ve sayfa işlemleri ---------- */
  panel.querySelector('[data-is="ekle"]').addEventListener("change", (e) => {
    const tur = e.target.value;
    e.target.value = "";
    if (!tur) return;
    if (!secili) return durumYaz("Önce yeni bloğun ardına geleceği bloğa tıklayın.", "hata");
    kaydetGeri();
    let yeni = el(SABLON[tur]);
    // Satır ya da madde seçiliyse kutuyu satırın içine değil, kapsayıcı bloğun ardına koy
    let hedef = secili;
    if (hedef.matches("tr, li, .spotlar p, .dal dl > div, .sayilar > div, .organ > div, .serit > div")) hedef = hedef.parentElement.closest(BLOK) || hedef.parentElement;
    hedef.after(yeni);
    duzenlenebilirYap();
    sec(yeni);
    kirlet();
    tasmaDenetle();
  });

  function sayfalariNumarala() {
    sayfalar().forEach((s, i) => {
      const no = i + 1;
      const taraf = no % 2 === 1 ? "sag" : "sol";
      s.classList.remove("sol", "sag");
      s.classList.add(taraf);
      const f = s.querySelector(":scope > .folyo");
      if (!f) return;
      const b = f.querySelector("b") || document.createElement("b");
      b.textContent = no;
      const span = f.querySelector("span");
      f.textContent = "";
      if (taraf === "sol") { f.append(b); if (span) f.append(span); } else { if (span) f.append(span); f.append(b); }
    });
  }
  panel.querySelector('[data-is="sayfa"]').addEventListener("change", (e) => {
    const is = e.target.value;
    e.target.value = "";
    if (!is) return;
    const s = secili ? secili.closest("section.sayfa") : null;
    if (!s) return durumYaz("Önce işlem yapılacak sayfada bir yere tıklayın.", "hata");
    if (is === "sil" && !window.confirm("Bu sayfa silinsin mi? (Geri al ile dönebilirsiniz.)")) return;
    kaydetGeri();
    if (is === "anlati" || is === "basvuru") {
      const yeni = el(SAYFA_SABLON[is]);
      s.after(yeni);
      duzenlenebilirYap();
      yeni.scrollIntoView({ block: "start" });
    } else if (is === "yukari") {
      const k = s.previousElementSibling;
      if (k && k.matches("section.sayfa")) k.before(s);
    } else if (is === "asagi") {
      const k = s.nextElementSibling;
      if (k && k.matches("section.sayfa")) k.after(s);
    } else if (is === "sil") {
      s.remove();
      secimBirak();
    }
    sayfalariNumarala();
    kirlet();
    tasmaDenetle();
  });

  /* ---------- taşma denetimi ---------- */
  const MM = 96 / 25.4;
  function tasmaDenetle() {
    document.querySelectorAll("[data-dz-rozet], [data-dz-sinir]").forEach((x) => x.remove());
    sayfalar().forEach((s, i) => {
      const pb = parseFloat(getComputedStyle(s).paddingBottom);
      const alt = Number.isFinite(pb) ? pb : 18 * MM; // açılış sayfasında 0 — meşru sıfır
      const ust = s.getBoundingClientRect().top;
      const sinir = ust + s.offsetHeight - alt;
      const kagit = ust + s.offsetHeight;
      let enAlt = -Infinity;
      s.querySelectorAll("*").forEach((d) => {
        if (d.closest(".folyo, .tirnak, [data-dz]")) return;
        const r = d.getBoundingClientRect();
        if (r.height > 0 && r.bottom > enAlt) enAlt = r.bottom;
      });
      const tasma = (enAlt - sinir) / MM;
      const kesilen = (enAlt - kagit) / MM;
      const kotu = kesilen > 0.5;
      const uyari = !kotu && tasma > 0.5;
      s.classList.toggle("dz-tasiyor", kotu);
      s.classList.toggle("dz-sinirda", uyari);
      const metin = kotu ? ` · ${kesilen.toFixed(0)} mm baskıda KESİLİR` : uyari ? ` · alt boşluğa ${tasma.toFixed(0)} mm giriyor` : ` · ${(-tasma).toFixed(0)} mm boş`;
      const rozet = el(`<div data-dz data-dz-rozet class="${kotu ? "dz-kotu" : uyari ? "dz-uyari" : ""}">Sayfa ${i + 1}${metin}</div>`);
      s.prepend(rozet);
      const cizgi = el("<div data-dz data-dz-sinir></div>");
      cizgi.style.top = s.offsetHeight - alt + "px";
      s.prepend(cizgi);
    });
  }

  /* ---------- metin girişi ---------- */
  document.addEventListener("beforeinput", (e) => {
    if (e.target.closest && e.target.closest('[contenteditable="true"]')) {
      if (!yazmaZamanlayici) kaydetGeri();
      clearTimeout(yazmaZamanlayici);
      yazmaZamanlayici = setTimeout(() => { yazmaZamanlayici = null; tasmaDenetle(); }, 700);
      kirlet();
    }
  });
  document.addEventListener("paste", (e) => {
    const ev = e.target.closest && e.target.closest('[contenteditable="true"]');
    if (!ev) return;
    e.preventDefault();
    const metin = (e.clipboardData || window.clipboardData).getData("text/plain").replace(/\s*\n\s*/g, " ");
    document.execCommand("insertText", false, metin);
  });
  document.addEventListener("keydown", (e) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); kaydet(); return; }
    if (ctrl && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); geriAl(); return; }
    if (ctrl && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); yinele(); return; }
    if (e.key === "Escape") { document.activeElement && document.activeElement.blur(); secimBirak(); return; }

    const host = e.target.closest && e.target.closest('[contenteditable="true"]');
    if (!host) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!host.matches(BOLUNUR)) return;
      kaydetGeri();
      const sel = window.getSelection();
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const kalan = document.createRange();
      kalan.setStart(r.endContainer, r.endOffset);
      kalan.setEnd(host, host.childNodes.length);
      const yeni = host.cloneNode(false);
      yeni.appendChild(kalan.extractContents());
      if (!yeni.textContent) yeni.innerHTML = "<br>";
      host.after(yeni);
      yeni.setAttribute("contenteditable", "true");
      yeni.focus();
      const bas = document.createRange();
      bas.setStart(yeni, 0);
      bas.collapse(true);
      sel.removeAllRanges();
      sel.addRange(bas);
      kirlet();
      tasmaDenetle();
    } else if (e.key === "Backspace" && host.matches(BOLUNUR) && !host.textContent.trim()) {
      const onceki = kardes(host, -1);
      if (!onceki) return;
      e.preventDefault();
      kaydetGeri();
      host.remove();
      if (onceki.getAttribute("contenteditable") === "true") {
        onceki.focus();
        const son = document.createRange();
        son.selectNodeContents(onceki);
        son.collapse(false);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(son);
      }
      kirlet();
      tasmaDenetle();
    }
  });

  function geriAl() { if (!geri.length) return durumYaz("Geri alınacak adım yok."); ileri.push(anlikGoruntu()); geriYukle(geri.pop()); }
  function yinele() { if (!ileri.length) return durumYaz("Yinelenecek adım yok."); geri.push(anlikGoruntu()); geriYukle(ileri.pop()); }

  /* ---------- kaydet ---------- */
  function temizle(kok) {
    kok.querySelectorAll("[data-dz]").forEach((x) => x.remove());
    const hepsi = [kok, ...kok.querySelectorAll("*")];
    hepsi.forEach((d) => {
      d.removeAttribute("contenteditable");
      if (d.classList) {
        ["dz-secili", "dz-kesilecek", "dz-tasiyor", "dz-sinirda"].forEach((c) => d.classList.remove(c));
        if (d.getAttribute("class") === "") d.removeAttribute("class");
      }
    });
    return kok;
  }
  async function kaydet() {
    sayfalariNumarala();
    const kopya = temizle(document.documentElement.cloneNode(true));
    const body = kopya.querySelector("body");
    body.classList.remove("dz-onizleme");
    if (body.getAttribute("class") === "") body.removeAttribute("class");
    if (body.getAttribute("style") !== null && /padding-top/.test(body.getAttribute("style"))) body.removeAttribute("style");
    const html = "<!doctype html>\n" + kopya.outerHTML + "\n";
    durumYaz("Kaydediliyor…");
    try {
      const yanit = await fetch("/kaydet?dosya=" + encodeURIComponent(DOSYA) + "&surum=" + encodeURIComponent(SURUM), { method: "POST", body: html, headers: { "Content-Type": "text/html; charset=utf-8" } });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata || "Kaydedilemedi");
      kirli = false;
      SURUM = veri.surum;
      durumYaz(`Kaydedildi · ${veri.sayfa} sayfa · ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`);
      return true;
    } catch (err) {
      durumYaz("Kaydedilemedi: " + err.message + " — sunucu açık mı?", "hata");
      return false;
    }
  }
  async function pdfUret() {
    if (kirli && !(await kaydet())) return;
    durumYaz("PDF üretiliyor… (yarım dakika kadar sürer)");
    const d = panel.querySelector('[data-is="pdf"]');
    d.disabled = true;
    try {
      const yanit = await fetch("/pdf?dosya=" + encodeURIComponent(DOSYA), { method: "POST" });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata || "PDF üretilemedi");
      durumYaz(`PDF hazır (${veri.sure} sn)`);
      window.open(veri.pdf + "?t=" + Date.now(), "_blank");
    } catch (err) {
      durumYaz("PDF üretilemedi: " + err.message, "hata");
    } finally {
      d.disabled = false;
    }
  }

  panel.addEventListener("click", (e) => {
    const d = e.target.closest("button[data-is]");
    if (!d) return;
    const is = d.dataset.is;
    if (is === "kaydet") kaydet();
    else if (is === "pdf") pdfUret();
    else if (is === "geri") geriAl();
    else if (is === "ileri") yinele();
    else if (is === "onizleme") { const acik = document.body.classList.toggle("dz-onizleme"); d.textContent = acik ? "Düzenleme görünümü" : "Temiz görünüm"; if (acik) secimBirak(); }
    else if (is === "yardim") yardim.hidden = !yardim.hidden;
  });
  yardim.addEventListener("click", (e) => { if (e.target.closest('[data-is="yardim-kapat"]')) yardim.hidden = true; });
  window.addEventListener("beforeunload", (e) => { if (kirli) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- başlat ---------- */
  duzenlenebilirYap();
  document.fonts && document.fonts.ready.then(tasmaDenetle);
  tasmaDenetle();
  setTimeout(tasmaDenetle, 1500);
})();
