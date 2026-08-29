"use client";
// C:\Users\hucig\Medknowledge\web\app\components\ReadingTools.tsx
//
// Okuma sayfalarında metin seçilince beliren vurgulama araç çubuğu.
// Sayfada [data-readable] taşıyan bir konteyner yoksa hiçbir şey yapmaz —
// yani her yere mount edilebilir, sadece okuma sayfalarında görünür.
//
// Giriş yöntemi fark etmez: PointerEvent sayesinde fare, parmak ve
// aktif kalem (S Pen, M-Pen, Apple Pencil) aynı akıştan geçer.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  containerMap,
  containerSignature,
  containers,
  contextAround,
  keyOf,
  loadMarks,
  markAttr,
  markIdsIn,
  offsetOf,
  paint,
  rangeFrom,
  saveMarks,
  sayfaKimligi,
  suankiSorgu,
  scrollToMark,
  unpaint,
  unpaintAll,
  type MarkStyle,
  type ReadingMark,
} from "@/app/lib/reading-marks";
import { panoyaKopyala } from "@/app/lib/pano";
import { KART_MAX, KART_MIN } from "@/app/lib/review-deck";
import { pageTitle, touchIndex } from "@/app/lib/study-index";

type Anchor = { x: number; y: number; below: boolean };

type Pending = {
  /** Yeni seçim: konteyner kimliği + ofsetler. Mevcut vurguya tıklandıysa null. */
  fresh: { k: string; s: number; e: number; t: string } | null;
  /** Seçimin kestiği ya da tıklanan mevcut vurgular */
  hit: string[];
};

/** Seçim çubuğunun görünüm penceresi kenarına bırakacağı boşluk (px). */
const CUBUK_KENAR = 8;

const PALETTE: { st: MarkStyle; label: string; swatch: string }[] = [
  { st: "y", label: "Sarı", swatch: "#FACC15" },
  { st: "g", label: "Yeşil", swatch: "#4ADE80" },
  { st: "b", label: "Mavi", swatch: "#60A5FA" },
  { st: "p", label: "Pembe", swatch: "#F472B6" },
];

export default function ReadingTools() {
  const pathname = usePathname();
  /** Adresin sorgusu — `usePathname()` görmüyor; aşağıdaki yoklama izliyor. */
  const [sorgu, setSorgu] = useState(suankiSorgu);
  /** Çalışma kimliği: sorgusuz sayfalarda `pathname` ile BİREBİR aynı. */
  const sayfa = sayfaKimligi(pathname, sorgu);
  const [marks, setMarks] = useState<ReadingMark[]>([]);
  /** Şu an DOM'da gerçekten boyalı olanlar — listede diğerleri "başka bölümde" sayılır */
  const [painted, setPainted] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [penMode, setPenMode] = useState(false);
  /** Son kaydetme depo dolu olduğu için başarısız oldu mu */
  const [kayitHatasi, setKayitHatasi] = useState<"dolu" | "engelli" | null>(null);
  /** Kısa vurgu bilgisi — geçici, 3 sn sonra kaybolur */
  /** Kart üretmeyen vurgunun SEBEBİ: metin çok kısa mı, çok uzun mu. */
  const [kisaBilgi, setKisaBilgi] = useState<"kisa" | "uzun" | null>(null);
  /**
   * Yeni vurgu, KESIŞEN eski vurguların yerini aldı — kaç tanesinin.
   *
   * ÖLÇÜLDÜ: bir cümle sarıyla vurgulanıp, İÇİNDEKİ bir öbek yeşille
   * vurgulandığında sarı vurgu TAMAMEN siliniyor — yeni seçimin
   * kapsamadığı kısmı da. Kod bunu bilerek yapıyor (iç içe `<mark>`
   * ofsetleri bozar), ama SESSİZ yapıyordu: kullanıcı kendi işaretinin
   * kaybolduğunu hiçbir yerden öğrenmiyordu.
   *
   * Deponun kendi ilkesi bunu zaten yazıyor (`heparin-nomogram` kırpma
   * yaptığında SÖYLÜYOR): sessizce eksiltmek güvensizlik üretir.
   */
  const [degistiBilgi, setDegistiBilgi] = useState(0);
  const [panoHatasi, setPanoHatasi] = useState(false);
  useEffect(() => {
    if (!panoHatasi) return;
    const t = setTimeout(() => setPanoHatasi(false), 4000);
    return () => clearTimeout(t);
  }, [panoHatasi]);
  const degistiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kisaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const barRef = useRef<HTMLDivElement>(null);
  const marksRef = useRef<ReadingMark[]>([]);
  const pendingRef = useRef<Pending | null>(null);
  marksRef.current = marks;
  pendingRef.current = pending;

  /* ── Kaydet ──────────────────────────────────────────────────────────── */
  const commit = useCallback(
    (next: ReadingMark[]) => {
      setMarks(next);
      // Kaydetme başarısızsa (depo dolu) kullanıcı bunu BİLMELİ: ekranda vurgu
      // duruyor ama yenilemede kaybolacak.
      const sonuc = saveMarks(sayfa, next);
      setKayitHatasi(sonuc === "ok" ? null : sonuc);
      // Çalışma Alanım sayfası başlığı buradan okur
      if (next.length) touchIndex(sayfa, pageTitle());
    },
    [sayfa]
  );

  /* ── Kayıtlı vurguları geri boya ─────────────────────────────────────
     Sayfa açılışında ve içerik değişince (soru çözümde sonraki soru gibi)
     yeniden çalışır. Önce her şeyi söküp baştan boyar — tekrarlanabilir. */
  useEffect(() => {
    setAnchor(null);
    setPending(null);
    setPanelOpen(false);

    let cancelled = false;
    let tries = 0; // konteyner basılana kadar bekleme sayacı
    let held = 0; // seçim yüzünden erteleme sayacı (ayrı tutulur)
    let lastSig = "";

    const restore = () => {
      if (cancelled) return;
      const roots = containerMap();

      // Kullanıcı o an metin seçiyorsa bekle: unpaintAll() + normalize() DOM'u
      // değiştirip seçimi siler, araç çubuğu elinin altından kaçardı.
      const live = window.getSelection();
      if (live && !live.isCollapsed && held < 20) {
        held++;
        setTimeout(restore, 400);
        return;
      }
      held = 0;

      lastSig = containerSignature();
      unpaintAll();

      /**
       * ESKİ ÇIPLAK YOLDAKİ VURGULAR KAYBOLMASIN — ama TAŞINMASIN da.
       *
       * Kimlik sorguyu da içerince, daha önce çıplak yola yazılmış vurguların
       * anahtarı değişiyor. Onları yok saymak sessiz veri kaybı olurdu.
       *
       * Ama TAŞIMAK da yanlış: çıplak kova birden çok quizin vurgusunu bir
       * arada tutuyor (hepsi aynı yolda çalışıyordu), dolayısıyla hepsini bu
       * quizin anahtarına kopyalamak başka quizlerin vurgularını buraya
       * yapıştırırdı. Bu yüzden eski kayıt YALNIZCA BOYAMA için okunuyor ve
       * o turda kaydetme yapılmıyor (`eskiKova`).
       */
      let eskiKova = false;
      let saved = loadMarks(sayfa);
      if (!saved.length && sayfa !== pathname) {
        const eski = loadMarks(pathname);
        if (eski.length) { saved = eski; eskiKova = true; }
      }
      const alive: ReadingMark[] = [];
      const shown = new Set<string>();
      /** En az bir vurgu yeni ofsete demirlendi mi — kaydetmeyi tetikler. */
      let demirlendi = false;

      for (const m of saved) {
        // "true" eski kayıtlardan gelir: keyOf bir dönem JSX'in değersiz
        // data-readable için ürettiği "true" değerini kimlik sayıyordu.
        // O kayıtlar ilk konteynere aittir.
        const root = roots.get(m.k) ?? (m.k === "true" ? roots.get("0") : undefined);
        // Konteyner şu an sayfada değil (başka soru/inci gösteriliyor).
        // Vurgu ona ait, SİLİNMEZ — sadece boyanmaz.
        if (!root) {
          alive.push(m);
          continue;
        }
        let range = rangeFrom(root, m.s, m.e);
        let kayit = m;

        /**
         * OFSET TUTMUYOR — SİLMEDEN ÖNCE YENİDEN DEMİRLEMEYİ DENE.
         *
         * Ofsetler konteynerin RENDER EDİLMİŞ metnine göre saklanıyor ve o
         * metin içerik dosyası değişmeden de kayabiliyor. ÖLÇÜLDÜ: kısaltma
         * sözlüğüne TEK bir girdi eklemek (`HIV`) konteyneri 5025 → 5056
         * karaktere çıkardı ve o noktadan SONRAKİ vurgu sessizce silindi —
         * kullanıcı hiçbir şey yapmamışken.
         *
         * Kurtarma ölçütü DAR: metin gövdede TAM OLARAK BİR KEZ geçiyorsa
         * oraya demirle. İki yerde geçiyorsa demirlemek yanlış cümleyi
         * işaretleyebilir ve bu, silmekten DAHA KÖTÜ olur — o durumda eski
         * davranış (düşür) sürüyor.
         */
        if (!range || range.toString() !== m.t) {
          const govde = root.textContent ?? "";
          const ilk = m.t ? govde.indexOf(m.t) : -1;
          const tekEslesme = ilk >= 0 && govde.indexOf(m.t, ilk + 1) === -1;
          const yeniRange = tekEslesme ? rangeFrom(root, ilk, ilk + m.t.length) : null;
          if (yeniRange && yeniRange.toString() === m.t) {
            range = yeniRange;
            kayit = { ...m, s: ilk, e: ilk + m.t.length };
            demirlendi = true;
          } else {
            continue;
          }
        }

        if (paint(range, kayit.id, kayit.st)) {
          alive.push(kayit);
          shown.add(kayit.id);
        }
      }

      setMarks(alive);
      setPainted(shown);
      // Demirleme olduysa SAYI aynı kalır; yeni ofsetler yine de yazılmalı.
      // `eskiKova`: liste eski çıplak anahtardan geldi — yazmak onu bu quize
      // TAŞIMAK olurdu (yukarıdaki gerekçe).
      if (!eskiKova && (alive.length !== saved.length || demirlendi)) saveMarks(sayfa, alive);
    };

    // Açılışta içerik henüz basılmamış olabilir — birkaç kare bekle. Bu bekleme
    // SADECE ilk boyama içindir; restore()'un kendisine konmaz, çünkü konteyner
    // sonradan KAYBOLDUĞUNDA (sonraki soruya geçiş) da tetiklenir ve durumu
    // güncellemeden geri dönerdi.
    const waitForFirstPaint = () => {
      if (cancelled) return;
      if (containers().length || tries >= 20) return restore();
      tries++;
      requestAnimationFrame(waitForFirstPaint);
    };
    waitForFirstPaint();

    // İçerik değişimini yakala. Kendi <mark> eklememiz konteyner kümesini
    // değiştirmediği için imza aynı kalır, sonsuz döngü olmaz.
    // Debounce DEĞİL throttle: ilk mutasyon 250 ms sonrasına bir kontrol kurar,
    // aradaki mutasyonlar onu ileri itmez. Debounce olsaydı sürekli DOM hareketi
    // olan sayfalarda (geçiş animasyonu, sayaç) kontrol hiç ateşlenmezdi.
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (debounce) return;
      debounce = setTimeout(() => {
        debounce = null;
        if (cancelled) return;
        if (containerSignature() !== lastSig) restore();
      }, 250);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Gözlemci hızlı yoldur ama zamanlaması kaçabiliyor (mutasyon dalgası imza
    // güncellenmeden önce kontrolü tüketebiliyor). Bu yoklama garantidir:
    // tek bir querySelectorAll, imza aynıysa hiçbir iş yapmaz.
    const poll = setInterval(() => {
      if (cancelled) return;
      // Sorgu değişimi de burada yakalanıyor: quiz A → quiz B geçişinde YOL
      // aynı kalıyor ve `usePathname()` tetiklenmiyor.
      setSorgu((o) => { const v = suankiSorgu(); return o === v ? o : v; });
      if (containerSignature() !== lastSig) restore();
    }, 600);

    /**
     * BAŞKA SEKME yazdı — yoklama bunu GÖREMEZ.
     *
     * Yukarıdaki iki tetik de KONTEYNER İMZASINA bakıyor; başka bir sekmenin
     * depoya yazması DOM'u değiştirmediği için imza aynı kalıyor ve `restore`
     * hiç çalışmıyordu. Sonuç ölçülen bir VERİ KAYBIYDI:
     *
     *   sekme A vurgu yapar  -> depoda 1 kayıt (sarı)
     *   sekme B vurgu yapar  -> depoda 1 kayıt (YEŞİL) — A'nınki SİLİNDİ
     *
     * Sebep: B'nin bellekteki listesi kurulduğu andan kalma ve A'nınkini
     * içermiyor; `commit` o listeyi olduğu gibi yazıyor. Aynı konuyu iki
     * sekmede açmak bu depoda olağan (aramadan ikinci kez açmak yeter).
     *
     * `storage` olayı YALNIZCA öteki sekmelerde tetikleniyor, yani tam
     * ihtiyaç duyulan sinyal bu. `restore()` zaten depodan okuyup yeniden
     * boyuyor; belleği tazelemek için başka bir şey gerekmiyor.
     */
    const onStorage = (e: StorageEvent) => {
      if (cancelled) return;
      // `key === null` -> depo tümden temizlendi (yedekten "üzerine yaz")
      if (e.key !== null && e.key !== "medisea:marks:v2:" + sayfa) return;
      restore();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      if (debounce) clearTimeout(debounce);
      clearInterval(poll);
      observer.disconnect();
    };
  }, [pathname, sayfa]);

  /* ── Seçim / tıklama dinleyicileri ──────────────────────────────────── */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const placeFor = (rect: DOMRect) => {
      const above = rect.top > 96;
      setAnchor({
        x: rect.left + rect.width / 2,
        y: above ? rect.top - 10 : rect.bottom + 10,
        below: !above,
      });
    };

    const evaluate = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        // mevcut bir vurguya tıklanarak açılmış çubuk kapanmasın
        if (pendingRef.current && !pendingRef.current.fresh) return;
        setPending(null);
        setAnchor(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const roots = containers();
      const idx = roots.findIndex((r) => r.contains(range.commonAncestorContainer));
      if (idx === -1) {
        setPending(null);
        setAnchor(null);
        return;
      }

      const root = roots[idx];
      const k = keyOf(root, idx);
      const s = offsetOf(root, range.startContainer, range.startOffset);
      const e = offsetOf(root, range.endContainer, range.endOffset);
      const text = range.toString();
      if (s < 0 || e < 0 || s >= e || !text.trim()) {
        setPending(null);
        setAnchor(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const box = rect.width || rect.height ? rect : range.getClientRects()[0];
      if (!box) return;

      setPending({ fresh: { k, s, e, t: text }, hit: markIdsIn(range) });
      placeFor(box as DOMRect);
    };

    const onSelectionChange = () => {
      if (timer) clearTimeout(timer);
      // mobilde tutamaçlar sürüklenirken sürekli tetiklenir — biraz bekle
      timer = setTimeout(evaluate, 180);
    };

    const onPointerDown = (ev: PointerEvent) => {
      setPenMode(ev.pointerType === "pen");

      const target = ev.target as HTMLElement | null;
      if (target?.closest("[data-ms-ui]")) return; // kendi arayüzümüz

      const hit = target?.closest(`mark[${markAttr()}]`);
      if (hit) {
        const id = hit.getAttribute(markAttr());
        if (id) {
          const rect = hit.getBoundingClientRect();
          setPending({ fresh: null, hit: [id] });
          placeFor(rect);
          return;
        }
      }

      setPending(null);
      setAnchor(null);
      setPanelOpen(false);
    };

    // sayfa kayarken çubuk seçimin üstünde asılı kalmasın
    const onScroll = () => setAnchor(null);

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ── Eylemler ────────────────────────────────────────────────────────── */

  const apply = (st: MarkStyle) => {
    if (!pending) return;

    // Mevcut bir vurguya tıklanmışsa: rengini değiştir
    if (!pending.fresh) {
      const id = pending.hit[0];
      const current = marksRef.current.find((m) => m.id === id);
      if (!current) return;
      const cmap = containerMap();
      const root = cmap.get(current.k) ?? (current.k === "true" ? cmap.get("0") : undefined);
      unpaint(id);
      const range = root && rangeFrom(root, current.s, current.e);
      if (range) paint(range, id, st);
      commit(marksRef.current.map((m) => (m.id === id ? { ...m, st } : m)));
      close();
      return;
    }

    // Yeni vurgu — üst üste binen eskileri önce temizle
    const { k, s, e, t } = pending.fresh;
    let base = marksRef.current;
    if (pending.hit.length) {
      pending.hit.forEach(unpaint);
      base = base.filter((m) => !pending.hit.includes(m.id));
      setPainted((p) => {
        const next = new Set(p);
        pending.hit.forEach((h) => next.delete(h));
        return next;
      });
    }

    const root = containerMap().get(k);
    if (!root) return;
    const range = rangeFrom(root, s, e);
    if (!range) return;

    const id = newId();
    // bağlamı boyamadan ÖNCE al — paint() metin düğümlerini böler
    const { before, after } = contextAround(root, s, e);
    if (!paint(range, id, st)) return;

    setPainted((p) => new Set(p).add(id));
    commit([...base, { id, k, s, e, t, st, b: before, a: after }]);

    /**
     * Kart üretmeyen vurguda SEBEBİ söyle — İKİ sınır için de.
     *
     * Ölçüldü: uyarı yalnızca alt sınırda (`< 8`) çıkıyordu. Bir paragrafı
     * vurgulayan kullanıcı (400 karakteri aşmak kolay) kart alamıyor ve
     * bunu hiçbir yerden öğrenmiyordu — vurgu kaydediliyor ve boyanıyor,
     * eksik olan yalnızca `/tekrar` tarafında görünüyor.
     */
    const uzunluk = t.trim().length;
    if (uzunluk < KART_MIN || uzunluk > KART_MAX) {
      if (kisaTimer.current) clearTimeout(kisaTimer.current);
      setKisaBilgi(uzunluk < KART_MIN ? "kisa" : "uzun");
      kisaTimer.current = setTimeout(() => setKisaBilgi(null), 3500);
    }

    // Kesişen eski vurgular silindiyse kullanıcı BİLMELİ (bkz. degistiBilgi).
    if (pending.hit.length) {
      if (degistiTimer.current) clearTimeout(degistiTimer.current);
      setDegistiBilgi(pending.hit.length);
      degistiTimer.current = setTimeout(() => setDegistiBilgi(0), 4000);
    }

    close();
  };

  const clearHit = () => {
    if (!pending?.hit.length) return;
    pending.hit.forEach(unpaint);
    commit(marksRef.current.filter((m) => !pending.hit.includes(m.id)));
    close();
  };

  const selectedText = () =>
    pending?.fresh?.t ?? marksRef.current.find((m) => m.id === pending?.hit[0])?.t;

  const copy = () => {
    const text = selectedText();
    /* Pano yoksa SESSIZCE kapanmasin: yardimci yedege dusuyor, sonuc
       basarisizsa kullaniciya soyleniyor. */
    if (text) void panoyaKopyala(text).then((ok) => { if (!ok) setPanoHatasi(true); });
    close();
  };

  /** Seçimi kenar not defterine alıntı olarak gönderir (NotePanel dinler). */
  const toNote = () => {
    const text = selectedText();
    if (text) {
      window.dispatchEvent(new CustomEvent("medisea:note-quote", { detail: { text } }));
    }
    close();
  };

  const clearAll = () => {
    unpaintAll();
    setPainted(new Set());
    commit([]);
    setPanelOpen(false);
  };

  /**
   * Vurgu kaldırıldıktan sonra ODAK KAYBOLMASIN.
   *
   * Ölçüldü: listedeki ortadaki vurgu kaldırıldığında `document
   * .activeElement` `<body>` oluyordu — düğme DOM'dan kalkınca odak kök
   * ögeye düşüyor ve klavyeyle gezen kullanıcı panelde yerini kaybediyor.
   * Çalışma Alanım'daki "Sil" düğmesinde ölçülen kusurun aynısı.
   *
   * Odak taşıma ETKİDE yapılıyor, kaldırma anında değil: `requestAnimation
   * Frame` React'in commit'inden önce gelebiliyor ve o anda eski düğme hâlâ
   * DOM'da (Çalışma Alanım'da bu ölçüldü ve ilk düzeltme böyle düşmüştü).
   */
  const listeRef = useRef<HTMLUListElement>(null);
  const panelDugmeRef = useRef<HTMLButtonElement>(null);
  /**
   * ESC — önce paneli, sonra seçim araç çubuğunu kapatır.
   *
   * Ölçüldü: vurgu paneli açılıyordu (aria-expanded doğru güncelleniyor) ve
   * rozet düğmesiyle kapanıyordu, ama ESC hiç işlenmiyordu
   * (defaultPrevented false, panel açık kalıyordu). Seçim araç çubuğunun ise
   * kapatma düğmesi HİÇ YOK — klavyeyle gezen kullanıcı onu ancak seçimi
   * değiştirerek kaybedebiliyordu.
   *
   * Bu, aynı oturumda üçüncü kez çıkan boşluk: arama penceresi ve mobil
   * menüde de ESC yoktu. Belgedeki kural (panel açan her yüzey ESC ile
   * kapanmalı, kapanışta odak açan düğmeye dönmeli) bu yüzeylere hiç
   * uygulanmamıştı.
   *
   * SIRA ÖNEMLİ: panel açıkken ESC yalnızca PANELİ kapatır, araç çubuğuna
   * dokunmaz. Tek tuşla iki yüzeyi birden kapatmak kullanıcıyı şaşırtır.
   *
   * defaultPrevented kontrolü, başlıktaki iki ESC işleyicisiyle (arama
   * penceresi ve mobil menü) katmanlanmak için. Zaten karşılanmış bir ESC
   * ikinci kez tüketilmiyor.
   */
  useEffect(() => {
    if (!panelOpen && !anchor && !pending) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (panelOpen) {
        e.preventDefault();
        setPanelOpen(false);
        panelDugmeRef.current?.focus();
        return;
      }
      e.preventDefault();
      setPending(null);
      setAnchor(null);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [panelOpen, anchor, pending]);

  /**
   * ÇUBUĞA ULAŞMAK 25 TAB SÜRÜYORDU — ölçüldü, canlıda.
   *
   * Araç çubuğu `position: fixed`, yani GÖRSEL olarak seçimin yanında
   * duruyor; ama Tab sırası DOM'u izliyor ve bileşen okuma
   * alanından SONRA render ediliyor. Ölçüm (addison, canlı): çubuğun ilk
   * düğmesi belge sırasında 25. durak, okuma alanının içinde odaklanabilir
   * öge 0 — yani klavye kullanıcısı seçim yaptıktan sonra başlık, branş
   * şeridi ve ilgili konu bağlantılarının tamamını geçmek zorundaydı.
   *
   * İşlev BOZUK DEĞİLDİ (uçtan uca ölçüldü: yolculukta seçim kayboluyor
   * ama çubuk aralığı durumunda tuttuğu için doğru metinle vurgu
   * oluşuyor) — bedel yalnızca 25 tuş.
   *
   * Çare: çubuk AÇIKKEN ve odak DIŞINDAYKEN ilk Tab çubuğa gider.
   * Kapsam bilerek dar — Shift+Tab, değiştiriciler ve çubuğun İÇİNDEKİ
   * Tab dokunulmadan bırakılıyor, yani sekiz düğme arasında ve çubuktan
   * çıkışta doğal sıra sürüyor. `defaultPrevented` kontrolü ESC ile aynı
   * gerekçeyle: başka bir yüzey Tab'ı zaten karşıladıysa ikinci kez
   * tüketilmiyor.
   */
  useEffect(() => {
    if (!anchor || !pending) return;
    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.defaultPrevented) return;
      const cubuk = barRef.current;
      if (!cubuk || cubuk.contains(document.activeElement)) return;
      const ilk = cubuk.querySelector("button");
      if (!ilk) return;
      e.preventDefault();
      ilk.focus();
    }
    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [anchor, pending]);

  /**
   * ÇUBUĞU GÖRÜNÜM PENCERESİNE KENETLE — sabit 150 sayısı BAYATLAMIŞTI.
   *
   * Konumlandırma `left: anchor.x` + `translateX(-50%)`, yani çubuk seçimin
   * ortasına oturuyor ve kenetleme yarı genişliğini bilmek zorunda. Kod
   * `clamp(anchor.x, 150, innerWidth - 150)` diyordu; çubuk zamanla düğme
   * kazandı ve bugün 316px, yani yarı genişlik 158.
   *
   * Ölçüldü (canlı, 375px, Addison konusu):
   *   satır BAŞINDAN seçim  -> çubuk left -8   -> "Sarı" düğmesi ULAŞILAMAZ
   *   satır SONUNDAN seçim  -> çubuk right 383 -> "Kopyala" ULAŞILAMAZ
   * İkisi de tam 8px taşıyor: 158 - 150.
   *
   * Genişlik artık ÖLÇÜLÜYOR, tahmin edilmiyor — düğme sayısı değiştiğinde
   * (var olan bir vurguya tıklanınca dokuzuncu "Kaldır" düğmesi beliriyor)
   * sayı kendiliğinden güncelleniyor. Yerleşim etkisi boyamadan ÖNCE
   * çalıştığı için sıçrama olmuyor.
   *
   * Çubuk görünümden GENİŞSE kenetleme sınırları çaprazlanıyor; o durumda
   * sola yaslanıyor (ilk düğmeler ulaşılabilir kalsın).
   */
  useLayoutEffect(() => {
    const cubuk = barRef.current;
    if (!cubuk || !anchor) return;
    const yari = cubuk.offsetWidth / 2 + CUBUK_KENAR;
    /* `clamp` sınırlar çaprazlandığında alt sınırı kazandırıyor — çubuk
       görünümden genişse sola yaslanmasının sebebi bu. */
    cubuk.style.left = `${clamp(anchor.x, yari, window.innerWidth - yari)}px`;
  });

  const [odakBekliyor, setOdakBekliyor] = useState(false);

  useEffect(() => {
    if (!odakBekliyor) return;
    setOdakBekliyor(false);
    const kalan = listeRef.current?.querySelectorAll<HTMLButtonElement>("[data-kaldir]");
    if (kalan && kalan.length) kalan[0].focus();
    /* SON vurgu kaldırıldığında odak yine `<body>`ye düşüyor ve bu BİLEREK
       böyle bırakıldı — ölçüldü: son vurgu gidince ReadingTools'un tamamı
       unmount oluyor, panel açma düğmesi bile DOM'da kalmıyor. Yani
       bileşenin içinde odaklanacak hiçbir hedef yok.

       Sayfadaki başka bir ögeye (örneğin `<h1>`) odaklanmak mümkün ama bu,
       kullanıcının nereye düşeceğine dair bir TASARIM kararı ve bileşenin
       yetkisi dışında. Aşağıdaki çağrı unmount durumunda sessizce
       hiçbir şey yapmıyor; asıl işi, panel açıkken kalan vurgu olmadığı
       ara durumda yapıyor. */
    else panelDugmeRef.current?.focus();
  }, [marks, odakBekliyor]);

  const removeOne = (id: string) => {
    setOdakBekliyor(true);
    unpaint(id);
    setPainted((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
    commit(marksRef.current.filter((m) => m.id !== id));
  };

  function close() {
    window.getSelection()?.removeAllRanges();
    setPending(null);
    setAnchor(null);
  }

  /* ── Görünüm ─────────────────────────────────────────────────────────── */

  const showBar = Boolean(anchor && pending);
  const editing = pending && !pending.fresh;
  const size = penMode ? "w-9 h-9" : "w-8 h-8";

  return (
    <>
      {/* ── Seçim araç çubuğu ── */}
      {showBar && anchor && (
        <div
          ref={barRef}
          data-ms-ui
          role="toolbar"
          aria-label="Vurgulama araçları"
          className="fixed z-[60] flex items-center gap-1 rounded-full border border-white/10 bg-blue-950/95 px-1.5 py-1.5 shadow-2xl shadow-blue-950/40 backdrop-blur-sm animate-[msPop_.12s_ease-out]"
          style={{
            /* İlk boyamada makul bir tahmin; gerçek değeri yukarıdaki
               yerleşim etkisi ÖLÇÜLEN genişlikle hemen üstüne yazıyor. */
            left: clamp(anchor.x, 150, window.innerWidth - 150),
            top: anchor.y,
            transform: anchor.below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
          }}
        >
          {PALETTE.map((p) => (
            <button
              key={p.st}
              onClick={() => apply(p.st)}
              title={p.label}
              aria-label={p.label}
              className={`${size} rounded-full transition-transform hover:scale-110 active:scale-95 ring-1 ring-white/20`}
              style={{ background: p.swatch }}
            />
          ))}

          <span className="mx-0.5 h-5 w-px bg-white/15" />

          <button
            onClick={() => apply("bold")}
            aria-label="Kalınlaştır"
            title="Kalınlaştır"
            className={`${size} rounded-full text-white text-[13px] font-black transition-colors hover:bg-white/15 active:scale-95`}
          >
            K
          </button>
          <button
            onClick={() => apply("u")}
            aria-label="Altını çiz"
            title="Altını çiz"
            className={`${size} rounded-full text-white text-[13px] font-bold underline decoration-2 underline-offset-2 transition-colors hover:bg-white/15 active:scale-95`}
          >
            A
          </button>

          <span className="mx-0.5 h-5 w-px bg-white/15" />

          <button
            onClick={toNote}
            aria-label="Not defterine gönder"
            title="Not defterine gönder"
            className={`${size} rounded-full text-white/80 text-xs transition-colors hover:bg-white/15 active:scale-95`}
          >
            🗒
          </button>
          <button
            onClick={copy}
            aria-label="Kopyala"
            title="Kopyala"
            className={`${size} rounded-full text-white/80 text-xs transition-colors hover:bg-white/15 active:scale-95`}
          >
            ⧉
          </button>
          {(editing || (pending?.hit.length ?? 0) > 0) && (
            <button
              onClick={clearHit}
              /* Adı "✕"di — ölçüldü. Bu düğme yalnızca DÜZENLEME kipinde
                 çıkıyor (var olan bir vurguya tıklanınca), o yüzden seçim
                 çubuğunun ilk taramasında görünmemişti. `title` ad olmuyor:
                 içerik boş değil. */
              aria-label="Vurguyu kaldır"
              title="Vurguyu kaldır"
              className={`${size} rounded-full text-white/80 text-xs transition-colors hover:bg-rose-500/30 active:scale-95`}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Pano uyarısı KENDİ kapsayıcısında: aşağıdaki vurgu yöneticisi
          `marks.length > 0` ile kapılı, ama kopyalama VURGU GEREKTİRMİYOR.
          Bir dönem uyarı o kapsayıcının içindeydi ve ölçüldüğünde hiç
          görünmedi — sayfada vurgu yoksa kutu hiç render edilmiyordu. */}
      {panoHatasi && (
        <div
          data-ms-ui
          role="alert"
          className="fixed bottom-5 left-1/2 z-[61] max-w-[280px] -translate-x-1/2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-snug text-rose-700 shadow-lg animate-[msPop_.12s_ease-out]"
        >
          Tarayıcı panoya yazmayı engelledi. Metni seçili bırakıp
          <strong className="font-black"> Ctrl/⌘ + C</strong> ile kopyalayabilirsin.
        </div>
      )}

      {/* ── Vurgu yöneticisi (sadece vurgu varsa) ── */}
      {marks.length > 0 && (
        <div
          data-ms-ui
          /* --ms-note-w  : NotePanel açıkken GERÇEK genişliğini yazar, rozet sola kayar.
           * --ms-not-yer : panelin yanında rozete yer kalmıyorsa "none" olur.
           *
           * İkincisi ölçümle eklendi: 375px'te panel ekranın %94'ünü kaplıyor,
           * yanında yer yok ve rozet tümüyle ekran dışına kayıyordu — ama
           * odaklanabilir kalmaya devam ediyordu (belgede kayıtlı `opacity-0`
           * sınıfının translate biçimi). `display:none` onu odak sırasından ve
           * erişilebilirlik ağacından da düşürüyor. */
          style={{
            display: "var(--ms-not-yer, flex)",
            transform: "translateX(calc(-1 * var(--ms-note-w, 0px)))",
          }}
          className="fixed bottom-5 right-5 z-[55] flex flex-col items-end gap-2 transition-transform duration-300"
        >
          {panelOpen && (
            <div className="w-72 max-h-[55vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Vurgularım
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href="/tekrar"
                    className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:underline"
                  >
                    ⚡ Tekrar
                  </Link>
                  <Link
                    href="/calisma-alanim"
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                  >
                    Tümü
                  </Link>
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                  >
                    Bu sayfayı sil
                  </button>
                </div>
              </div>
              <ul ref={listeRef} className="divide-y divide-slate-50">
                {marks.map((m) => {
                  const görünür = painted.has(m.id);
                  return (
                  <li key={m.id} className="group flex items-start gap-2 px-3 py-2.5 hover:bg-slate-50">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5"
                      style={{ background: swatchOf(m.st), opacity: görünür ? 1 : 0.35 }}
                    />
                    <button
                      onClick={() => görünür && scrollToMark(m.id)}
                      disabled={!görünür}
                      title={görünür ? "Vurguya git" : "Bu vurgu sayfanın şu an gösterilmeyen bir bölümünde"}
                      className={`flex-1 text-left text-[12px] leading-snug line-clamp-2 ${
                        görünür ? "text-slate-600" : "cursor-default text-slate-400 italic"
                      }`}
                    >
                      {m.t}
                    </button>
                    {/*
                      İki koruma da klavye için, ikisi de ölçümle kondu.

                      `focus:opacity-100` — `opacity-0` ögeyi odak sırasından
                      ÇIKARMIYOR (`visibility:hidden`in aksine). Yani düğme
                      görünmezken odaklanabiliyordu: klavyeyle gezen kullanıcı
                      göremediği bir SİLME düğmesinin üstünde duruyordu.

                      `aria-label` — erişilebilir ad `title`dan değil İÇERİKTEN
                      geliyordu, çünkü hesaplama sırası içeriği title'ın önüne
                      koyuyor ve içerik boş değil. Yani düğmenin adı "✕"di.
                      `title` fare ipucu olarak kalıyor.
                    */}
                    <button
                      onClick={() => removeOne(m.id)}
                      data-kaldir
                      /* Ad ayırt edici olmalı: panelde üç vurgu varken üç
                         düğmenin de adı "Vurguyu kaldır"dı ve düğmeler
                         arasında gezen kullanıcı hangisini sildiğini
                         bilemiyordu. */
                      aria-label={`Vurguyu kaldır: ${m.t.slice(0, 40)}`}
                      title="Kaldır"
                      className="shrink-0 text-slate-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100 focus:opacity-100"
                    >
                      ✕
                    </button>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* role="alert": kutu KOŞULLU render ediliyor; `status` bölgenin
              içerik değişmeden ÖNCE DOM'da olmasını ister, `alert` sonradan
              eklendiğinde duyurulur. Aynı dosyadaki kayıt-hatası kutusunun
              gerekçesiyle birebir aynı. */}
          {kisaBilgi && (
            <div role="alert" className="max-w-[240px] rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-700 shadow-lg animate-[msPop_.12s_ease-out]">
              Bu vurgu <strong className="font-black">tekrar kartı olmayacak</strong> —
              {kisaBilgi === "kisa"
                ? ` ${KART_MIN} karakterden kısa; cümle düzeyinde vurgular kart olur.`
                : ` ${KART_MAX} karakterden uzun; daha kısa bir bölüm seçersen kart olur.`}
            </div>
          )}

          {degistiBilgi > 0 && (
            <div role="alert" className="max-w-[240px] rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-700 shadow-lg animate-[msPop_.12s_ease-out]">
              Üst üste binen{' '}
              <strong className="font-black">
                {degistiBilgi === 1 ? 'bir vurgunun' : degistiBilgi + ' vurgunun'}
              </strong>{' '}
              yerini aldı — eskisi tümüyle kaldırıldı.
            </div>
          )}
          {/*
            role="alert": vurgu kaydedilemediğinde bu kutu KOŞULLU olarak
            DOM'a giriyor ve `alert` tam bu duruma göre çalışıyor — sonradan
            eklendiğinde duyuruluyor (`status` böyle değil, bölgenin önceden
            var olması gerekir).

            Ölçüldü: depo doldurulup gerçek bir vurgu denendi. Kayıt
            oluşmuyor, ekranda uyarı çıkıyor ve kurtarma bağlantısı var —
            ama kutuda `role` ve `aria-live` YOKTU, yani ekran okuyucu
            kullanıcısı çalışmasının kaybolacağını HİÇ duymuyordu. Sessiz
            başarısızlığın en kötü hâli: görsel kullanıcı uyarılıyor, öteki
            uyarılmıyor.
          */}
          {kayitHatasi && (
            <div role="alert" className="max-w-[240px] rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] leading-snug text-rose-700 shadow-lg">
              <strong className="font-black">Vurgular kaydedilemiyor.</strong>{" "}
              {/* SEBEP AYRIMI: "dolu" ile "engelli" farklı çareler ister.
                  Bir dönem ikisine de "depolaması dolu — Yer aç" deniyordu ve
                  ölçüldü: depo ENGELLİYKEN de aynı mesaj çıkıyor, yani
                  kullanıcı boşuna yer açmaya çalışıyordu. */}
              {kayitHatasi === "dolu" ? (
                <>
                  Tarayıcı depolaması dolu — yenilediğinde kaybolurlar.{" "}
                  <Link href="/calisma-alanim" className="font-bold underline">
                    Yer aç
                  </Link>
                </>
              ) : (
                <>
                  Tarayıcın bu site için veri saklamayı engelliyor — yenilediğinde
                  kaybolurlar. Site verisine izin verirsen kaydedilirler.
                </>
              )}
            </div>
          )}
          <button
            ref={panelDugmeRef}
            onClick={() => setPanelOpen((v) => !v)}
            /*
              ADI "🖍1"DI — ölçüldü. `title="Vurgularım"` ad OLMUYOR, çünkü
              hesaplama sırası İÇERİĞİ title'ın önüne koyuyor ve içerik boş
              değil (emoji + sayaç). Ekran okuyucu düğmeyi "kalem bir" diye
              okuyordu. `title` fare ipucu olarak kalıyor.

              `aria-expanded`: bu düğme bir paneli açıp kapatıyor ve
              ETİKETİ DURUMLA DEĞİŞMİYOR (hep "🖍<sayı>"). Etiketi değişen
              düğmelerde (örn. "Aç"/"Kapat") durum zaten adda; burada
              değil, o yüzden ayrıca bildirilmesi gerekiyor.
            */
            aria-label={`Vurgularım (${marks.length})`}
            aria-expanded={panelOpen}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-white shadow-xl transition-all active:scale-95 ${
              kayitHatasi
                ? "bg-rose-600 shadow-rose-600/25 hover:bg-rose-500"
                : "bg-blue-950 shadow-blue-950/25 hover:bg-blue-900"
            }`}
            title="Vurgularım"
          >
            <span className="text-sm">{kayitHatasi ? "⚠" : "🖍"}</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{marks.length}</span>
          </button>
        </div>
      )}
    </>
  );
}

/* ── Yardımcılar ───────────────────────────────────────────────────────── */

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), Math.max(min, max));
}

function swatchOf(st: MarkStyle) {
  switch (st) {
    case "y":
      return "#FACC15";
    case "g":
      return "#4ADE80";
    case "b":
      return "#60A5FA";
    case "p":
      return "#F472B6";
    default:
      return "#94A3B8";
  }
}
