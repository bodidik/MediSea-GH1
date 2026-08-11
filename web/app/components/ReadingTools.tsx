"use client";
// C:\Users\hucig\Medknowledge\web\app\components\ReadingTools.tsx
//
// Okuma sayfalarında metin seçilince beliren vurgulama araç çubuğu.
// Sayfada [data-readable] taşıyan bir konteyner yoksa hiçbir şey yapmaz —
// yani her yere mount edilebilir, sadece okuma sayfalarında görünür.
//
// Giriş yöntemi fark etmez: PointerEvent sayesinde fare, parmak ve
// aktif kalem (S Pen, M-Pen, Apple Pencil) aynı akıştan geçer.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
  scrollToMark,
  unpaint,
  unpaintAll,
  type MarkStyle,
  type ReadingMark,
} from "@/app/lib/reading-marks";
import { pageTitle, touchIndex } from "@/app/lib/study-index";

type Anchor = { x: number; y: number; below: boolean };

type Pending = {
  /** Yeni seçim: konteyner kimliği + ofsetler. Mevcut vurguya tıklandıysa null. */
  fresh: { k: string; s: number; e: number; t: string } | null;
  /** Seçimin kestiği ya da tıklanan mevcut vurgular */
  hit: string[];
};

const PALETTE: { st: MarkStyle; label: string; swatch: string }[] = [
  { st: "y", label: "Sarı", swatch: "#FACC15" },
  { st: "g", label: "Yeşil", swatch: "#4ADE80" },
  { st: "b", label: "Mavi", swatch: "#60A5FA" },
  { st: "p", label: "Pembe", swatch: "#F472B6" },
];

export default function ReadingTools() {
  const pathname = usePathname();
  const [marks, setMarks] = useState<ReadingMark[]>([]);
  /** Şu an DOM'da gerçekten boyalı olanlar — listede diğerleri "başka bölümde" sayılır */
  const [painted, setPainted] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [penMode, setPenMode] = useState(false);
  /** Son kaydetme depo dolu olduğu için başarısız oldu mu */
  const [kayitHatasi, setKayitHatasi] = useState(false);

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
      setKayitHatasi(!saveMarks(pathname, next));
      // Çalışma Alanım sayfası başlığı buradan okur
      if (next.length) touchIndex(pathname, pageTitle());
    },
    [pathname]
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

      const saved = loadMarks(pathname);
      const alive: ReadingMark[] = [];
      const shown = new Set<string>();

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
        const range = rangeFrom(root, m.s, m.e);
        // konteyner var ama metin tutmuyor → içerik güncellenmiş, vurgu düşer
        if (!range || range.toString() !== m.t) continue;
        if (paint(range, m.id, m.st)) {
          alive.push(m);
          shown.add(m.id);
        }
      }

      setMarks(alive);
      setPainted(shown);
      if (alive.length !== saved.length) saveMarks(pathname, alive);
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
      if (containerSignature() !== lastSig) restore();
    }, 600);

    return () => {
      cancelled = true;
      if (debounce) clearTimeout(debounce);
      clearInterval(poll);
      observer.disconnect();
    };
  }, [pathname]);

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
    if (text) navigator.clipboard?.writeText(text).catch(() => {});
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

  const removeOne = (id: string) => {
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
            title="Kalınlaştır"
            className={`${size} rounded-full text-white text-[13px] font-black transition-colors hover:bg-white/15 active:scale-95`}
          >
            K
          </button>
          <button
            onClick={() => apply("u")}
            title="Altını çiz"
            className={`${size} rounded-full text-white text-[13px] font-bold underline decoration-2 underline-offset-2 transition-colors hover:bg-white/15 active:scale-95`}
          >
            A
          </button>

          <span className="mx-0.5 h-5 w-px bg-white/15" />

          <button
            onClick={toNote}
            title="Not defterine gönder"
            className={`${size} rounded-full text-white/80 text-xs transition-colors hover:bg-white/15 active:scale-95`}
          >
            🗒
          </button>
          <button
            onClick={copy}
            title="Kopyala"
            className={`${size} rounded-full text-white/80 text-xs transition-colors hover:bg-white/15 active:scale-95`}
          >
            ⧉
          </button>
          {(editing || (pending?.hit.length ?? 0) > 0) && (
            <button
              onClick={clearHit}
              title="Vurguyu kaldır"
              className={`${size} rounded-full text-white/80 text-xs transition-colors hover:bg-rose-500/30 active:scale-95`}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* ── Vurgu yöneticisi (sadece vurgu varsa) ── */}
      {marks.length > 0 && (
        <div
          data-ms-ui
          // --ms-note-w: NotePanel açıkken genişliğini buraya yazar, rozet sola kayar
          style={{ transform: "translateX(calc(-1 * var(--ms-note-w, 0px)))" }}
          className="fixed bottom-5 right-5 z-[55] flex flex-col items-end gap-2 transition-transform duration-300"
        >
          {panelOpen && (
            <div className="w-72 max-h-[55vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Vurgularım
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="/tekrar"
                    className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:underline"
                  >
                    ⚡ Tekrar
                  </a>
                  <a
                    href="/calisma-alanim"
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                  >
                    Tümü
                  </a>
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                  >
                    Bu sayfayı sil
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-slate-50">
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
                    <button
                      onClick={() => removeOne(m.id)}
                      title="Kaldır"
                      className="shrink-0 text-slate-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}

          {kayitHatasi && (
            <div className="max-w-[240px] rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] leading-snug text-rose-700 shadow-lg">
              <strong className="font-black">Vurgular kaydedilemiyor.</strong> Tarayıcı
              depolaması dolu — yenilediğinde kaybolurlar.{" "}
              <a href="/calisma-alanim" className="font-bold underline">
                Yer aç
              </a>
            </div>
          )}
          <button
            onClick={() => setPanelOpen((v) => !v)}
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
