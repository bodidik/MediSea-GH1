'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * OKUMA GEZGİNİ — uzun konuda "neredeyim, ne kaldı, şuraya atla".
 *
 * İki parça, tek ölçümden beslenir:
 *   1. Üstte ince ilerleme çizgisi (okuma kabının ne kadarı geçildi).
 *   2. Sol altta hap: "3 / 9 · bölüm adı" — basınca bölüm listesi açılır,
 *      bulunulan bölüm işaretlidir.
 *
 * Okuma kabının (`[data-readable]`) DIŞINDA çizilir: içine konan her metin
 * düğümü kayıtlı vurguların karakter ofsetini kaydırır.
 *
 * Ölçüm `scroll` olayına ek olarak 600 ms yoklamayla da sürülür (BasaDon ile
 * aynı gerekçe: olay kaçabiliyor; değer aynıysa durum güncellenmez).
 */

type Bolum = { id: string; baslik: string };

/** Yapışkan site başlığının altı — `html { scroll-padding-top: 96px }` ile aynı çizgi. */
const BASLIK_PAYI = 104;

export default function OkumaGezgini({ bolumler }: { bolumler: Bolum[] }) {
  const [oran, setOran] = useState(0);
  const [etkin, setEtkin] = useState(-1);
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLDivElement | null>(null);
  const dugme = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const olc = () => {
      const kap = document.querySelector<HTMLElement>('[data-readable]');
      if (!kap) return;
      const r = kap.getBoundingClientRect();
      const yol = r.height - window.innerHeight * 0.6;
      const gecilen = BASLIK_PAYI - r.top;
      const yeniOran = yol > 0 ? Math.min(1, Math.max(0, gecilen / yol)) : 0;
      setOran((o) => (Math.abs(o - yeniOran) < 0.004 ? o : yeniOran));

      let son = -1;
      for (let i = 0; i < bolumler.length; i++) {
        const el = document.getElementById(bolumler[i].id);
        if (el && el.getBoundingClientRect().top <= BASLIK_PAYI + 8) son = i;
      }
      setEtkin((e) => (e === son ? e : son));
    };
    olc();
    const yoklama = window.setInterval(olc, 600);
    window.addEventListener('scroll', olc, { passive: true });
    window.addEventListener('resize', olc);
    return () => {
      window.clearInterval(yoklama);
      window.removeEventListener('scroll', olc);
      window.removeEventListener('resize', olc);
    };
  }, [bolumler]);

  useEffect(() => {
    if (!acik) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAcik(false);
        dugme.current?.focus();
      }
    };
    const disari = (e: PointerEvent) => {
      if (kutu.current && !kutu.current.contains(e.target as Node)) setAcik(false);
    };
    document.addEventListener('keydown', tus);
    document.addEventListener('pointerdown', disari);
    return () => {
      document.removeEventListener('keydown', tus);
      document.removeEventListener('pointerdown', disari);
    };
  }, [acik]);

  const okumada = oran > 0 && oran < 1;
  const hapGorunur = bolumler.length >= 3 && (okumada || acik) && etkin >= 0;
  const yuzde = Math.round(oran * 100);

  return (
    <>
      <div
        aria-hidden="true"
        data-okuma-ilerleme
        /* !mt-0: ebeveynin `space-y-8`i sabit konumlu ögeye de üst marj
           veriyor ve çizgi 32px aşağıda, logonun üstünde duruyordu (ölçüldü). */
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] !mt-0 h-[3px] print:hidden"
      >
        <div
          className="h-full origin-left bg-sky-500 motion-safe:transition-transform motion-safe:duration-150"
          style={{ transform: `scaleX(${oran})` }}
        />
      </div>

      {hapGorunur && (
        <div ref={kutu} data-okuma-gezgini className="fixed bottom-5 left-4 z-[52] print:hidden">
          {acik && (
            <nav
              id="okuma-gezgini-liste"
              aria-label="Bölümler"
              className="mb-2 max-h-[60vh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <ol>
                {bolumler.map((b, i) => (
                  <li key={b.id}>
                    <a
                      href={`#${b.id}`}
                      aria-current={i === etkin ? 'location' : undefined}
                      onClick={() => setAcik(false)}
                      className={`flex min-h-[40px] items-start gap-2.5 rounded-xl px-3 py-2 text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700 ${
                        i === etkin
                          ? 'bg-sky-50 font-bold text-blue-950'
                          : 'font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-900'
                      }`}
                    >
                      {/* Sıra numarası BASILMAZ: bölüm başlıklarının çoğu kendi
                          numarasını taşıyor, ikisi yan yana çift sayı olurdu. */}
                      <span className="min-w-0 break-words">{b.baslik}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <button
            ref={dugme}
            type="button"
            aria-expanded={acik}
            aria-controls="okuma-gezgini-liste"
            aria-label={`Bölümler — ${etkin + 1} / ${bolumler.length}: ${bolumler[etkin].baslik}. Okunan yüzde ${yuzde}`}
            onClick={() => setAcik((a) => !a)}
            className="flex h-11 max-w-[min(20rem,calc(100vw-6rem))] items-center gap-2.5 rounded-full border border-slate-200 bg-white/95 pl-3.5 pr-4 text-left shadow-lg backdrop-blur transition-colors hover:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 5h12M4 10h12M4 15h8" />
            </svg>
            <span className="shrink-0 text-[13px] font-bold tabular-nums text-blue-950">
              {etkin + 1} / {bolumler.length}
            </span>
            <span className="min-w-0 truncate text-[13px] font-medium text-slate-600">
              {bolumler[etkin].baslik}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
