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
// Çizim, PNG olarak değil VURUŞ (stroke) dizisi olarak saklanır: çözünürlükten
// bağımsız, panel genişliği değişince yeniden ölçeklenir, tek tek silinebilir.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { pageTitle, touchIndex } from "@/app/lib/study-index";

/** [x, y, basınç] — x ve y panel GENİŞLİĞİNE göre normalize (en-boy oranı korunur) */
type Pt = [number, number, number];
type Stroke = { c: string; w: number; p: Pt[] };
type Mode = "text" | "draw";

const KEY = (p: string) => `medisea:notes:v1:${p}`;
const WIDTH_KEY = "medisea:notew";

const INKS = ["#1E293B", "#2563EB", "#DC2626", "#16A34A"];
const NIBS = [2, 4, 7];

export default function NotePanel() {
  const pathname = usePathname();

  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [width, setWidth] = useState(420);

  const [text, setText] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);

  const [ink, setInk] = useState(INKS[0]);
  const [nib, setNib] = useState(NIBS[1]);
  const [erasing, setErasing] = useState(false);
  const [hasPen, setHasPen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drawing = useRef<Stroke | null>(null);
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
    try {
      const raw = localStorage.getItem(KEY(pathname));
      const doc = raw ? JSON.parse(raw) : null;
      setText(doc?.text ?? "");
      setStrokes(Array.isArray(doc?.strokes) ? doc.strokes : []);
    } catch {
      setText("");
      setStrokes([]);
    }
    setRedo([]);
    setDirty(false);

    try {
      const w = Number(localStorage.getItem(WIDTH_KEY));
      if (w >= 300 && w <= 900) setWidth(w);
    } catch {}
  }, [pathname]);

  /* ── Kaydet (gecikmeli) ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        if (!text.trim() && strokes.length === 0) {
          localStorage.removeItem(KEY(pathname));
        } else {
          localStorage.setItem(KEY(pathname), JSON.stringify({ text, strokes }));
          // Çalışma Alanım sayfası başlığı buradan okur
          touchIndex(pathname, pageTitle());
        }
      } catch {
        // kota dolu — sessizce geç, kullanıcının yazması kesilmesin
      }
      setDirty(false);
    }, 600);
    return () => clearTimeout(t);
  }, [text, strokes, dirty, pathname]);

  /* ── Panel genişliğini FAB'lara duyur (ReadingTools rozetini kaydırır) ─ */
  useEffect(() => {
    document.documentElement.style.setProperty("--ms-note-w", open ? `${width}px` : "0px");
    return () => document.documentElement.style.setProperty("--ms-note-w", "0px");
  }, [open, width]);

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
    if (ev.pointerType === "pen" && !hasPen) setHasPen(true);
    // avuç reddi: kalem görüldüyse parmak artık çizmez, sayfayı kaydırır
    if (hasPen && ev.pointerType === "touch") return;

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
    if (hasPen && ev.pointerType === "touch") return;

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
    for (const s of strokes) paintStroke(ctx, s, src.clientWidth);

    const a = document.createElement("a");
    a.download = `not-${pathname.split("/").filter(Boolean).pop() || "sayfa"}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  };

  /* ── Panel genişliği sürükleme ───────────────────────────────────────── */
  const startResize = (ev: React.PointerEvent) => {
    ev.preventDefault();
    const startX = ev.clientX;
    const startW = width;
    const move = (e: PointerEvent) => {
      const w = Math.min(900, Math.max(320, startW + (startX - e.clientX)));
      setWidth(w);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      try {
        localStorage.setItem(WIDTH_KEY, String(widthRef.current));
      } catch {}
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
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
          onClick={() => setOpen(true)}
          title="Not defteri"
          className="fixed right-0 top-1/2 z-[54] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-slate-200 bg-white/95 px-2 py-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:pr-3 active:scale-95"
        >
          <span className="text-base">📝</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 [writing-mode:vertical-rl]">
            Not
          </span>
          {hasContent && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
        </button>
      )}

      {/* ── Panel ── */}
      {open && (
        <>
          {/* mobilde arka planı karart */}
          <div
            data-ms-ui
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[56] bg-slate-950/20 backdrop-blur-[1px] lg:hidden"
          />

          <aside
            data-ms-ui
            style={{ width: `min(${width}px, 94vw)` }}
            className="fixed right-0 top-0 z-[57] flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            {/* genişlik tutamağı (yalnız masaüstü) */}
            <div
              onPointerDown={startResize}
              className="absolute left-0 top-0 hidden h-full w-1.5 cursor-col-resize bg-transparent hover:bg-blue-400/40 lg:block"
              title="Genişliği ayarla"
            />

            {/* başlık */}
            <header className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
              <span className="text-base">📝</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-blue-950">
                  Not Defteri
                </div>
                <div className="truncate text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {dirty ? "Kaydediliyor…" : hasContent ? "Kaydedildi" : "Bu sayfa için"}
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
                title="Kapat"
              >
                ✕
              </button>
            </header>

            {/* kip seçimi */}
            <div className="flex gap-1 border-b border-slate-100 px-3 py-2">
              {(
                [
                  ["text", "✎", "Yazı"],
                  ["draw", "✍", "Çizim"],
                ] as [Mode, string, string][]
              ).map(([m, icon, label]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                    mode === m
                      ? "bg-blue-950 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
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
                  className="flex-1 resize-none px-4 py-3 text-[13px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
                />
                <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    {text.length} karakter
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigator.clipboard?.writeText(text).catch(() => {})}
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
                    title="Silgi"
                    className={`h-6 rounded-lg px-2 text-[11px] transition-colors ${
                      erasing ? "bg-rose-500 text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    ⌫
                  </button>
                  <button
                    onClick={undo}
                    disabled={!strokes.length}
                    title="Geri al"
                    className="h-6 rounded-lg px-2 text-[11px] transition-colors hover:bg-slate-100 disabled:opacity-25"
                  >
                    ↶
                  </button>
                  <button
                    onClick={redoOne}
                    disabled={!redo.length}
                    title="İleri al"
                    className="h-6 rounded-lg px-2 text-[11px] transition-colors hover:bg-slate-100 disabled:opacity-25"
                  >
                    ↷
                  </button>
                </div>

                {/* tuval */}
                <div ref={surfaceRef} className="flex-1 overflow-y-auto bg-slate-50 p-2">
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
                      // kalem görüldüyse parmak kaydırsın, çizmesin (avuç reddi)
                      touchAction: hasPen ? "pan-y" : "none",
                      backgroundImage:
                        "repeating-linear-gradient(#fff 0 27px, #E7EBF0 27px 28px)",
                    }}
                    className="w-full cursor-crosshair rounded-xl border border-slate-200 bg-white shadow-inner"
                  />
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    {hasPen ? "🖊 Kalem · avuç reddi açık" : `${strokes.length} çizgi`}
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
