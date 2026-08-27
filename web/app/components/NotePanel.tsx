"use client";
// C:\Users\hucig\Medknowledge\web\app\components\NotePanel.tsx
//
// Okuma sayfalarının kenarından açılan not defteri.
// İki kip: yazı (klavye) ve çizim (kalem/parmak).
//
// Dokunmatik + kalemli cihazlar için tasarlandı:
//  · Basınç duyarlı çizgi kalınlığı (PointerEvent.pressure)
//  · Avuç reddi — kalem bir kez görüldüyse parmak artık çizmez, sadece kaydırır
//  · Kalemin silgi ucu (buttons & 32) otomatik silgiye geçer
//
// KAYDIRMA TUVALDE ELLE YAPILIR. `touch-action` işaretçi türünü ayırt etmez;
// kalem de dokunma sayılır. Parmak kaydırabilsin diye tuvale `pan-y` verilince
// KALEMİN KENDİ HAREKETİ de kaydırma jesti oluyordu: tablette yazarken alttaki
// metin kayıyor, yazı bozuluyordu. Bu yüzden tuval `touch-action: none` ile
// bütün jestleri kendi üstüne alır, parmakla kaydırmayı aşağıdaki
// pointer işleyicileri `scrollTop` ile kendisi uygular.
//
// Çizim, PNG olarak değil VURUŞ (stroke) dizisi olarak saklanır: çözünürlükten
// bağımsız, panel genişliği değişince yeniden ölçeklenir, tek tek silinebilir.

import { useCallback, useEffect, useRef, useState } from "react";
import { panoyaKopyala } from "@/app/lib/pano";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { pageTitle, touchIndex } from "@/app/lib/study-index";
import { bozukYedegiOku, degistiBildir, guvenliNesneOku, kurtarildiMi } from "@/app/lib/depo";

/** [x, y, basınç] — x ve y panel GENİŞLİĞİNE göre normalize (en-boy oranı korunur) */
type Pt = [number, number, number];
type Stroke = { c: string; w: number; p: Pt[] };
type Mode = "text" | "draw";
type Paper = "cizgili" | "kareli" | "bos";

const KEY = (p: string) => `medisea:notes:v1:${p}`;
const WIDTH_KEY = "medisea:notew";
const PAPER_KEY = "medisea:notepaper";

const INKS = ["#1E293B", "#2563EB", "#DC2626", "#16A34A"];

/**
 * Renklerin ADI — dördünün de `title`ı "Renk"ti ve erişilebilir adları
 * birbirinden ayrılmıyordu. Ölçüldü: ekran okuyucu dört düğmeyi de "Renk"
 * diye okuyor, kullanıcı hangisini seçtiğini bilemiyordu. Renk tek başına
 * bilgi taşıyamaz; adı yazıyla verilmeli.
 */
const INK_ADI: Record<string, string> = {
  "#1E293B": "koyu gri",
  "#2563EB": "mavi",
  "#DC2626": "kırmızı",
  "#16A34A": "yeşil",
};
const NIBS = [2, 4, 7];

/** Kâğıt çizgi aralığı (px). Kareli kip aynı aralığı iki eksende kullanır. */
const ARALIK = 28;
const KAGIT_RENK = "#E2E8F0";
/** Kâğıt deseni. İlk katman SAYDAM zeminlidir, yoksa ikinciyi örterdi. */
const KAGIT: Record<Paper, string> = {
  cizgili: `repeating-linear-gradient(transparent 0 ${ARALIK - 1}px, ${KAGIT_RENK} ${ARALIK - 1}px ${ARALIK}px)`,
  kareli:
    `repeating-linear-gradient(transparent 0 ${ARALIK - 1}px, ${KAGIT_RENK} ${ARALIK - 1}px ${ARALIK}px),` +
    `repeating-linear-gradient(90deg, transparent 0 ${ARALIK - 1}px, ${KAGIT_RENK} ${ARALIK - 1}px ${ARALIK}px)`,
  bos: "none",
};
const KAGITLAR: [Paper, string, string][] = [
  ["cizgili", "≡", "Çizgili"],
  ["kareli", "▦", "Kareli"],
  ["bos", "▢", "Boş"],
];

/** Panel genişliği ön ayarları — tablette sürükleme tutamağı zahmetli. */
const BOYUTLAR: [number, string, string][] = [
  [340, "S", "Dar — konu metni açıkta kalsın"],
  [500, "M", "Orta"],
  [720, "L", "Geniş — uzun çizim"],
];

/** Avuç, kalem ucundan çok daha geniş bir temas alanı bildirir. */
const avucMu = (ev: React.PointerEvent) => ev.width > 35 || ev.height > 35;
/** Kalem kalktıktan sonra avucun tuvali kaydırmaması için ölü süre (ms). */
const KALEM_OLU_SURE = 700;

export default function NotePanel() {
  const pathname = usePathname();

  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [width, setWidth] = useState(420);
  const [paper, setPaper] = useState<Paper>("cizgili");

  const [text, setText] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  /* Pano KURTARMA yolu: depo dolduğunda kullanıcıya "yazıyı kopyala"
     deniyor. Kopyalama sessizce başarısız olursa not gerçekten
     kayboluyordu — sonuç artık söyleniyor. */
  const [panoOk, setPanoOk] = useState<boolean | null>(null);
  useEffect(() => {
    if (panoOk === null) return;
    const t = setTimeout(() => setPanoOk(null), 3000);
    return () => clearTimeout(t);
  }, [panoOk]);

  const [ink, setInk] = useState(INKS[0]);
  const [nib, setNib] = useState(NIBS[1]);
  const [erasing, setErasing] = useState(false);
  const [hasPen, setHasPen] = useState(false);
  const [dirty, setDirty] = useState(false);
  /** Depo dolu vb. nedenle son kaydetme başarısız oldu mu */
  const [kayitHatasi, setKayitHatasi] = useState(false);
  /** Bu sayfanın notu bozuktu ve yedeğe taşındı mı (bu oturumda). */
  const [kurtarildi, setKurtarildi] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drawing = useRef<Stroke | null>(null);
  /** Parmakla kaydırma: son y konumu (tuval jestleri kendi üstüne aldığı için) */
  const kaydirma = useRef<number | null>(null);
  /** Kalemin son temas anı — avuç, kalem kalkar kalkmaz kaydırmasın diye */
  const sonKalem = useRef(0);
  const strokesRef = useRef<Stroke[]>([]);
  const redoRef = useRef<Stroke[]>([]);
  strokesRef.current = strokes;
  redoRef.current = redo;

  /* ── Sayfa okuma sayfası mı? ─────────────────────────────────────────── */
  useEffect(() => {
    let tries = 0;
    let stop = false;
    const check = () => {
      if (stop) return;
      const found = document.querySelector("[data-readable]");
      if (found) return setEnabled(true);
      if (tries++ < 20) requestAnimationFrame(check);
      else setEnabled(false);
    };
    setEnabled(false);
    setOpen(false);
    check();
    return () => {
      stop = true;
    };
  }, [pathname]);

  /* ── Kayıtlı notu yükle ──────────────────────────────────────────────── */
  useEffect(() => {
    /**
     * Bozuk not ATILMAZ, yedeğe taşınır. Ölçüldü: bozuk kayıtta panel BOŞ
     * açılıyor ve kullanıcıya hiçbir şey söylenmiyor; kullanıcı "burada
     * notum yok" sanıp yazdığı anda ELLE YAZDIĞI eski not gidiyordu.
     */
    const doc = guvenliNesneOku<{ text?: string; strokes?: Stroke[] }>(KEY(pathname));
    setText(typeof doc?.text === "string" ? doc.text : "");
    setStrokes(Array.isArray(doc?.strokes) ? doc.strokes : []);
    setKurtarildi(kurtarildiMi(KEY(pathname)));
    setRedo([]);
    setDirty(false);
  }, [pathname]);

  /* ── Panel tercihleri (sayfadan bağımsız, bir kez okunur) ────────────── */
  useEffect(() => {
    try {
      const w = Number(localStorage.getItem(WIDTH_KEY));
      if (w >= 300 && w <= 900) setWidth(w);
      const k = localStorage.getItem(PAPER_KEY);
      if (k === "cizgili" || k === "kareli" || k === "bos") setPaper(k);
    } catch {}
  }, []);

  /* ── Kaydet (gecikmeli) ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      let ok = true;
      try {
        if (!text.trim() && strokes.length === 0) {
          localStorage.removeItem(KEY(pathname));
        } else {
          localStorage.setItem(KEY(pathname), JSON.stringify({ text, strokes, at: Date.now() }));
          touchIndex(pathname, pageTitle());
          degistiBildir();
        }
      } catch {
        // Depo dolu. SESSİZCE GEÇMEK YASAK: aşağıda "Kaydedildi" yazan bir
        // başlık var; hata yutulursa kullanıcıya notu güvendeymiş gibi
        // görünür ve sekmeyi kapatınca kaybeder.
        ok = false;
      }
      setKayitHatasi(!ok);
      setDirty(false);
    }, 600);
    return () => clearTimeout(t);
  }, [text, strokes, dirty, pathname]);

  /* ── Panel genişliğini FAB'lara duyur (ReadingTools rozetini kaydırır) ─ */
  useEffect(() => {
    document.documentElement.style.setProperty("--ms-note-w", open ? `${width}px` : "0px");
    return () => document.documentElement.style.setProperty("--ms-note-w", "0px");
  }, [open, width]);

  /* ── Odak yönetimi ────────────────────────────────────────────────────
   *
   * Ölçüldü: panel açılınca odak <body>'ye düşüyordu. Klavye kullanan biri
   * paneli açtıktan sonra not alanına ulaşmak için sayfayı en baştan
   * Tab'lamak zorunda kalıyordu — panel ekranı kaplayan bir çekmece olduğu
   * halde.
   *
   * Odak ilk denetime değil PANELİN KENDİSİNE veriliyor: ekran okuyucu önce
   * "Not defteri" adını ve rolünü duyuruyor, sonraki Tab ilk denetime gidiyor.
   * Kapanışta odak tutamağa geri dönüyor; aksi hâlde odak yine kaybolurdu.
   */
  const panelRef = useRef<HTMLElement | null>(null);
  const tutamakRef = useRef<HTMLButtonElement | null>(null);
  const acilmistiRef = useRef(false);

  useEffect(() => {
    if (open) {
      acilmistiRef.current = true;
      const t = setTimeout(() => panelRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    // Yalnızca gerçekten açıkken kapandıysa odağı geri ver — ilk yüklemede
    // sayfanın odağını çalmasın.
    if (acilmistiRef.current) {
      acilmistiRef.current = false;
      const t = setTimeout(() => tutamakRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ── ESC ile kapat ────────────────────────────────────────────────────
   * Gerçek Escape tuşuyla ölçüldü: panel kapanmıyordu. Ekranı kaplayan bir
   * çekmecede ESC beklenen çıkış yolu; yoksa fare kullanamayan kullanıcının
   * tek çaresi kapatma düğmesini Tab'layarak bulmak.
   */
  useEffect(() => {
    if (!open) return;
    const dinle = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
    };
    window.addEventListener("keydown", dinle);
    return () => window.removeEventListener("keydown", dinle);
  }, [open]);

  /* ── Vurgudan alıntı geldiğinde ─────────────────────────────────────── */
  useEffect(() => {
    const onQuote = (ev: Event) => {
      const q = (ev as CustomEvent<{ text: string }>).detail?.text?.trim();
      if (!q) return;
      setMode("text");
      setOpen(true);
      setText((prev) => (prev ? `${prev.replace(/\s*$/, "")}\n\n> ${q}\n` : `> ${q}\n`));
      setDirty(true);
    };
    window.addEventListener("medisea:note-quote", onQuote);
    return () => window.removeEventListener("medisea:note-quote", onQuote);
  }, []);

  /* ── Tuval çizimi ────────────────────────────────────────────────────── */

  // Yazı yüzeyinin yüksekliği: en az 1.4 en, çizim aşağı taştıkça uzar
  const surfaceH = useCallback(() => {
    let low = 1.4;
    for (const s of strokesRef.current) for (const p of s.p) if (p[1] + 0.25 > low) low = p[1] + 0.25;
    return low;
  }, []);

  const paintStroke = (ctx: CanvasRenderingContext2D, s: Stroke, W: number) => {
    ctx.strokeStyle = s.c;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (s.p.length === 1) {
      ctx.beginPath();
      ctx.arc(s.p[0][0] * W, s.p[0][1] * W, (s.w * s.p[0][2]) / 2 + 0.4, 0, Math.PI * 2);
      ctx.fillStyle = s.c;
      ctx.fill();
      return;
    }
    for (let i = 1; i < s.p.length; i++) {
      const a = s.p[i - 1];
      const b = s.p[i];
      ctx.beginPath();
      // basınç çizgi kalınlığına yansır — kalemsiz cihazda sabit kalır
      ctx.lineWidth = s.w * (0.4 + 0.6 * ((a[2] + b[2]) / 2));
      ctx.moveTo(a[0] * W, a[1] * W);
      ctx.lineTo(b[0] * W, b[1] * W);
      ctx.stroke();
    }
  };

  const redraw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    if (!W || !H) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const s of strokesRef.current) paintStroke(ctx, s, W);
  }, []);

  useEffect(() => {
    if (mode !== "draw" || !open) return;
    redraw();
    const ro = new ResizeObserver(() => redraw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [mode, open, strokes, width, redraw]);

  /* ── Kalem / parmak girişi ───────────────────────────────────────────── */

  const norm = (ev: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    const W = r.width || 1;
    const pressure =
      ev.pointerType === "pen" ? (ev.pressure > 0 ? ev.pressure : 0.5) : 0.5;
    return [
      round3((ev.clientX - r.left) / W),
      round3((ev.clientY - r.top) / W),
      round2(pressure),
    ];
  };

  const eraseAt = (pt: Pt) => {
    const hit = strokesRef.current.findIndex((s) =>
      s.p.some((p) => Math.hypot(p[0] - pt[0], p[1] - pt[1]) < 0.035)
    );
    if (hit === -1) return;
    setStrokes((prev) => prev.filter((_, i) => i !== hit));
    setDirty(true);
  };

  const onDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (ev.pointerType === "pen") {
      if (!hasPen) setHasPen(true);
      sonKalem.current = Date.now();
    }

    // Avuç reddi: kalem görüldüyse parmak ÇİZMEZ, tuvali kaydırır. Kaydırmayı
    // tarayıcıya bırakamayız (bkz. dosya başı: `touch-action` kalemi de kapsar),
    // bu yüzden elle yapılır. Avucun kendisi ve kalem daha yeni kalkmışsa gelen
    // temas kaydırmaz — yazarken sayfa oynamasın.
    if (hasPen && ev.pointerType === "touch") {
      if (avucMu(ev) || Date.now() - sonKalem.current < KALEM_OLU_SURE) return;
      try {
        canvasRef.current?.setPointerCapture(ev.pointerId);
      } catch {}
      kaydirma.current = ev.clientY;
      return;
    }

    ev.preventDefault();
    try {
      // işaretçi artık etkin değilse fırlatır — çizimi engellememeli
      canvasRef.current?.setPointerCapture(ev.pointerId);
    } catch {}

    const pt = norm(ev);
    // kalemin silgi ucu ya da yan tuş → silgi
    const eraserTip = ev.pointerType === "pen" && (ev.buttons & 32) !== 0;
    if (erasing || eraserTip) {
      eraseAt(pt);
      drawing.current = null;
      return;
    }
    drawing.current = { c: ink, w: nib, p: [pt] };
  };

  const onMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (ev.pointerType === "pen") sonKalem.current = Date.now();

    if (hasPen && ev.pointerType === "touch") {
      const yzey = surfaceRef.current;
      if (kaydirma.current !== null && yzey) {
        yzey.scrollTop -= ev.clientY - kaydirma.current;
        kaydirma.current = ev.clientY;
      }
      return;
    }

    if (!drawing.current) {
      if (erasing && ev.buttons) eraseAt(norm(ev));
      return;
    }
    const pt = norm(ev);
    const last = drawing.current.p[drawing.current.p.length - 1];
    // çok yakın noktaları at — depo şişmesin
    if (Math.hypot(pt[0] - last[0], pt[1] - last[1]) < 0.004) return;
    drawing.current.p.push(pt);

    // tam yeniden çizim yerine sadece yeni parçayı bas
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const W = cv.clientWidth;
    ctx.strokeStyle = drawing.current.c;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = drawing.current.w * (0.4 + 0.6 * ((last[2] + pt[2]) / 2));
    ctx.beginPath();
    ctx.moveTo(last[0] * W, last[1] * W);
    ctx.lineTo(pt[0] * W, pt[1] * W);
    ctx.stroke();
  };

  const onUp = () => {
    kaydirma.current = null;
    const s = drawing.current;
    drawing.current = null;
    if (!s || !s.p.length) return;
    setStrokes((prev) => [...prev, s]);
    setRedo([]);
    setDirty(true);
  };

  /* ── Eylemler ────────────────────────────────────────────────────────── */

  // NOT: iki set çağrısı da güncelleyicinin DIŞINDA yapılır. React güncelleyici
  // fonksiyonları saf sayar ve gerektiğinde iki kez çalıştırabilir — içeride
  // setState çağırmak vuruşun iki kez eklenmesine yol açıyordu.
  const undo = () => {
    const cur = strokesRef.current;
    if (!cur.length) return;
    const last = cur[cur.length - 1];
    setStrokes(cur.slice(0, -1));
    setRedo((r) => [...r, last]);
    setDirty(true);
  };

  const redoOne = () => {
    const stack = redoRef.current;
    if (!stack.length) return;
    const last = stack[stack.length - 1];
    setRedo(stack.slice(0, -1));
    setStrokes((prev) => [...prev, last]);
    setDirty(true);
  };

  const clearDraw = () => {
    if (strokes.length && !confirm("Çizimin tamamı silinsin mi?")) return;
    setStrokes([]);
    setRedo([]);
    setDirty(true);
  };

  /** Kâğıt deseni CSS'te gradyan, PNG'de çizgi — indirilen dosya ekranla aynı olsun. */
  const paintPaper = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    if (paper === "bos") return;
    ctx.strokeStyle = KAGIT_RENK;
    ctx.lineWidth = 1;
    for (let y = ARALIK - 0.5; y < H; y += ARALIK) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    if (paper !== "kareli") return;
    for (let x = ARALIK - 0.5; x < W; x += ARALIK) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  };

  const exportPng = () => {
    const src = canvasRef.current;
    if (!src) return;
    const out = document.createElement("canvas");
    const scale = 2;
    out.width = src.clientWidth * scale;
    out.height = src.clientHeight * scale;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.scale(scale, scale);
    paintPaper(ctx, src.clientWidth, src.clientHeight);
    for (const s of strokes) paintStroke(ctx, s, src.clientWidth);

    const a = document.createElement("a");
    a.download = `not-${pathname.split("/").filter(Boolean).pop() || "sayfa"}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  };

  const kagitSec = (k: Paper) => {
    setPaper(k);
    try {
      localStorage.setItem(PAPER_KEY, k);
    } catch {}
  };

  /* ── Panel genişliği ─────────────────────────────────────────────────── */
  const boyutSec = (w: number) => {
    setWidth(w);
    try {
      localStorage.setItem(WIDTH_KEY, String(w));
    } catch {}
  };

  const startResize = (ev: React.PointerEvent) => {
    ev.preventDefault();
    const el = ev.currentTarget;
    try {
      // Tutamak parmakla da çekilebilmeli; yakalama olmadan işaretçi tutamaktan
      // çıkar çıkmaz olaylar kesiliyor.
      el.setPointerCapture(ev.pointerId);
    } catch {}
    const startX = ev.clientX;
    const startW = width;
    const move = (e: PointerEvent) => {
      const w = Math.min(900, Math.max(320, startW + (startX - e.clientX)));
      setWidth(w);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      try {
        localStorage.setItem(WIDTH_KEY, String(widthRef.current));
      } catch {}
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  const widthRef = useRef(width);
  widthRef.current = width;

  if (!enabled) return null;

  const hasContent = text.trim().length > 0 || strokes.length > 0;

  return (
    <>
      {/* ── Kenar tutamağı ── */}
      {!open && (
        <button
          data-ms-ui
          ref={tutamakRef}
          onClick={() => setOpen(true)}
          title="Not defteri"
          aria-label="Not defterini aç"
          className="fixed right-0 top-1/2 z-[54] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-slate-200 bg-white/95 px-2 py-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:pr-3 active:scale-95"
        >
          <span aria-hidden="true" className="text-base">📝</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 [writing-mode:vertical-rl]">
            Not
          </span>
          {hasContent && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
        </button>
      )}

      {/* ── Panel ── */}
      {open && (
        <>
          {/* Yalnız telefonda arka planı karart. Tablette KARARTMA YOK: not
              tutmanın amacı konuya bakarak yazmak, karartma metni görünmez
              yapıyordu. */}
          <div
            data-ms-ui
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[56] bg-slate-950/20 backdrop-blur-[1px] md:hidden"
          />

          {/* role="dialog" + ad: panelin ne olduğu ekran okuyucuya duyurulsun.
              aria-modal BİLEREK verilmiyor — masaüstünde karartma yok ve
              sayfanın geri kalanı kullanılabilir durumda; modal demek yanlış
              olurdu. tabIndex={-1} odağın panele verilebilmesi için. */}
          <aside
            data-ms-ui
            ref={panelRef}
            role="dialog"
            aria-label="Not defteri"
            tabIndex={-1}
            style={{ width: `min(${width}px, 94vw)` }}
            className="fixed right-0 top-0 z-[57] flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl outline-none"
          >
            {/* Genişlik tutamağı. Telefonda panel zaten tam en, orada gizli. */}
            <div
              onPointerDown={startResize}
              style={{ touchAction: "none" }}
              title="Genişliği ayarla"
              className="group absolute left-0 top-0 z-10 hidden h-full w-4 cursor-col-resize items-center justify-center bg-transparent hover:bg-blue-400/20 md:flex lg:w-3"
            >
              <span className="h-10 w-1 rounded-full bg-slate-300 transition-colors group-hover:bg-blue-500" />
            </div>

            {/* başlık */}
            <header className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
              <span aria-hidden="true" className="text-base">📝</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-blue-950">
                  Not Defteri
                </div>
                {/* role="status": "Kaydediliyor…" → "Kaydedildi" → "⚠ Kaydedilemedi"
                    geçişleri duyurulsun. Depo dolduğunda not KAYBOLUYOR; bunu
                    göremeyen kullanıcının da öğrenmesi gerekiyor. Ayrıntı kutusu
                    ayrıca canlı bölge YAPILMADI — aynı olayı iki kez duyurmak
                    gürültü olur, bu satır zaten hatayı söylüyor. */}
                <div
                  role="status"
                  className={`truncate text-[9px] font-bold uppercase tracking-widest ${
                    kayitHatasi ? "text-rose-600" : "text-slate-400"
                  }`}
                >
                  {kayitHatasi
                    ? "⚠ Kaydedilemedi"
                    : dirty
                      ? "Kaydediliyor…"
                      : hasContent
                        ? "Kaydedildi"
                        : "Bu sayfa için"}
                </div>
              </div>
              <Link
                href="/calisma-alanim"
                title="Çalışma Alanım — tüm not ve vurgularım"
                className="rounded-full px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                🗂
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                /* Adı "✕"di — ölçüldü. `title` ad OLMUYOR: hesaplama sırası
                   içeriği önce alıyor ve içerik boş değil. */
                aria-label="Not defterini kapat"
                title="Kapat"
              >
                ✕
              </button>
            </header>

            {/* Kaydetme başarısız — kullanıcı notu kaybetmeden kurtarabilsin.

                role="alert": bu kutu kullanıcı YAZDIKTAN SONRA, kaydetme
                düşünce DOM'a giriyor. Duyurulmazsa ekran okuyucu kullanıcısı
                notunun kaybolacağını hiç öğrenmiyor — ReadingTools'taki
                vurgu uyarısında ölçülen kusurun birebir kardeşi. */}
            {/* Kurtarma tek başına YETMEZ: veri korunuyor ama kullanıcı boş bir
                defter görüp "burada notum yok" sanıyor ve üstüne yazıyor. Yedek
                de kullanıcının ulaşamadığı bir anahtarda duruyordu — kopyalama
                düğmesi onu erişilebilir kılıyor (kota kurtarmasının emsali). */}
            {kurtarildi && (
              <div role="alert" className="border-b border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="mb-2 text-[11px] font-semibold leading-snug text-amber-900">
                  Bu sayfadaki kayıtlı not okunamadı, bu yüzden defter boş açıldı.
                  Eski kayıt SİLİNMEDİ — yedeğe alındı; aşağıya yazacağın not ayrıca saklanır.
                </p>
                <button
                  onClick={() => void panoyaKopyala(bozukYedegiOku(KEY(pathname)) ?? "").then(setPanoOk)}
                  className="rounded-lg bg-amber-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-amber-600"
                >
                  Eski kaydı kopyala
                </button>
              </div>
            )}

            {kayitHatasi && (
              <div role="alert" className="border-b border-rose-200 bg-rose-50 px-3 py-2.5">
                <p className="mb-2 text-[11px] font-semibold leading-snug text-rose-700">
                  Tarayıcı depolaması dolu olduğu için bu not kaydedilemedi. Sekmeyi
                  kapatırsan kaybolur.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => void panoyaKopyala(text).then(setPanoOk)}
                    disabled={!text.trim()}
                    className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-rose-500 disabled:opacity-40"
                  >
                    Yazıyı kopyala
                  </button>
                  {panoOk !== null && (
                    <span role="alert" className={panoOk
                      ? "self-center text-[10px] font-bold text-emerald-700"
                      : "self-center text-[10px] font-bold text-rose-700"}>
                      {panoOk ? "Kopyalandı" : "Kopyalanamadı — metni seçip Ctrl/⌘ + C"}
                    </span>
                  )}
                  {strokes.length > 0 && (
                    <button
                      onClick={exportPng}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-rose-500"
                    >
                      Çizimi indir
                    </button>
                  )}
                  <Link
                    href="/calisma-alanim"
                    className="rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Yer aç
                  </Link>
                </div>
              </div>
            )}

            {/* kip seçimi + panel boyutu */}
            <div className="flex items-center gap-1 border-b border-slate-100 px-3 py-2">
              {(
                [
                  ["text", "✎", "Yazı"],
                  ["draw", "✍", "Çizim"],
                ] as [Mode, string, string][]
              ).map(([m, icon, label]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  /* Kip seçici: hangisinin ETKİN olduğu yalnızca renkle
                     anlatılıyordu. `aria-pressed` doğru öznitelik --
                     `aria-expanded` DEĞİL, çünkü bir şey açıp kapatmıyor. */
                  aria-pressed={mode === m}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                    mode === m
                      ? "bg-blue-950 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
              {/* Sürükleme tutamağı tablette zahmetli; hazır boyutlar tek dokunuş. */}
              <span className="mx-1 hidden h-5 w-px bg-slate-200 md:block" />
              <div className="hidden md:flex md:gap-0.5">
                {BOYUTLAR.map(([w, label, title]) => (
                  <button
                    key={w}
                    onClick={() => boyutSec(w)}
                    /* Adları "S" / "M" / "L" idi; anlam `title`da kalıyordu
                       ve `title` ad olmuyor (içerik dolu). `aria-pressed`
                       de eklendi: hangi genişliğin ETKİN olduğu yalnızca
                       renkle anlatılıyordu. */
                    aria-label={`Panel genişliği: ${title}`}
                    aria-pressed={Math.abs(width - w) < 30}
                    title={title}
                    className={`h-7 w-7 rounded-lg text-[10px] font-black transition-colors ${
                      Math.abs(width - w) < 30
                        ? "bg-slate-900 text-white"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── YAZI KİPİ ── */}
            {mode === "text" && (
              <>
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setDirty(true);
                  }}
                  placeholder={
                    "Bu sayfaya dair notların…\n\nVurgu araç çubuğundaki 🗒 düğmesiyle seçtiğin metni buraya alıntı olarak gönderebilirsin."
                  }
                  /* ODAK HALKASI: `outline-none` varsayılan halkayı kaldırıyor ve
                     burada yerine hiçbir şey konmamıştı — odakta tek işaret imleçti.
                     Ölçüldü: `outline-none` taşıyan 146 etkileşimli ögenin 145'i
                     deponun halka kalıbını taşıyor, bu sonuncusu istisnaydı.
                     `ring-inset`: alan panel gövdesini kapladığı için dıştan halka
                     kenarlara taşardı. */
                  className="flex-1 resize-none overscroll-contain px-4 py-3 text-[13px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-700"
                />
                <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    {text.length} karakter
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => void panoyaKopyala(text).then(setPanoOk)}
                      disabled={!text}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
                    >
                      Kopyala
                    </button>
                    <button
                      onClick={() => {
                        if (text && !confirm("Not silinsin mi?")) return;
                        setText("");
                        setDirty(true);
                      }}
                      disabled={!text}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-30"
                    >
                      Temizle
                    </button>
                  </div>
                </footer>
              </>
            )}

            {/* ── ÇİZİM KİPİ ── */}
            {mode === "draw" && (
              <>
                {/* kalem çubuğu */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2">
                  {INKS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setInk(c);
                        setErasing(false);
                      }}
                      aria-label={`Kalem rengi: ${INK_ADI[c] ?? c}`}
                      aria-pressed={ink === c && !erasing}
                      title="Renk"
                      className={`h-6 w-6 rounded-full ring-2 transition-transform hover:scale-110 ${
                        ink === c && !erasing ? "ring-blue-400" : "ring-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                  <span className="mx-1 h-5 w-px bg-slate-200" />
                  {NIBS.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setNib(n);
                        setErasing(false);
                      }}
                      aria-label={`Uç kalınlığı: ${n}`}
                      aria-pressed={nib === n && !erasing}
                      title={`Uç ${n}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                        nib === n && !erasing ? "bg-slate-900" : "hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className="rounded-full"
                        style={{
                          width: n + 2,
                          height: n + 2,
                          background: nib === n && !erasing ? "#fff" : "#64748B",
                        }}
                      />
                    </button>
                  ))}
                  <span className="mx-1 h-5 w-px bg-slate-200" />
                  <button
                    onClick={() => setErasing((v) => !v)}
                    aria-label="Silgi"
                    aria-pressed={erasing}
                    title="Silgi"
                    className={`h-6 rounded-lg px-2 text-[11px] transition-colors ${
                      erasing ? "bg-rose-700 text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    ⌫
                  </button>
                  <button
                    onClick={undo}
                    disabled={!strokes.length}
                    aria-label="Geri al"
                    title="Geri al"
                    className="h-6 rounded-lg px-2 text-[11px] transition-colors hover:bg-slate-100 disabled:opacity-25"
                  >
                    ↶
                  </button>
                  <button
                    onClick={redoOne}
                    disabled={!redo.length}
                    aria-label="İleri al"
                    title="İleri al"
                    className="h-6 rounded-lg px-2 text-[11px] transition-colors hover:bg-slate-100 disabled:opacity-25"
                  >
                    ↷
                  </button>
                  <span className="mx-1 h-5 w-px bg-slate-200" />
                  {KAGITLAR.map(([k, icon, label]) => (
                    <button
                      key={k}
                      onClick={() => kagitSec(k)}
                      aria-label={`${label} sayfa`}
                      aria-pressed={paper === k}
                      title={`${label} sayfa`}
                      className={`h-6 rounded-lg px-2 text-[11px] transition-colors ${
                        paper === k
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* tuval */}
                <div
                  ref={surfaceRef}
                  className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 p-2"
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onPointerLeave={onUp}
                    style={{
                      width: "100%",
                      height: `${surfaceH() * 100}%`,
                      aspectRatio: `1 / ${surfaceH()}`,
                      // Bütün jestler tuvalin: kalem yazarken hiçbir şey kaymaz.
                      // Parmakla kaydırmayı onDown/onMove elle uygular.
                      touchAction: "none",
                      backgroundImage: KAGIT[paper],
                    }}
                    className="w-full cursor-crosshair rounded-xl border border-slate-200 bg-white shadow-inner"
                  />
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    {hasPen
                      ? "🖊 Kalem yazar · parmak kaydırır"
                      : `${strokes.length} çizgi`}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={exportPng}
                      disabled={!strokes.length}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
                    >
                      PNG indir
                    </button>
                    <button
                      onClick={clearDraw}
                      disabled={!strokes.length}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-30"
                    >
                      Temizle
                    </button>
                  </div>
                </footer>
              </>
            )}
          </aside>
        </>
      )}
    </>
  );
}

const round3 = (v: number) => Math.round(v * 1000) / 1000;
const round2 = (v: number) => Math.round(v * 100) / 100;
