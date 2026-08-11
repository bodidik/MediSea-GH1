"use client";
// C:\Users\hucig\Medknowledge\web\app\(site)\tekrar\page.tsx
//
// Vurgulardan türetilmiş tekrar oturumu. Vurguladığın cümle "boşluk" olur,
// çevresindeki bağlam soruyu kurar. Cevabı hatırlamaya çalışıp kendini
// dört düğmeden biriyle notlarsın; aralık ona göre uzar ya da sıfırlanır.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StrokePreview from "@/app/components/StrokePreview";
import {
  buildDeck,
  deckStats,
  dueCards,
  dueLabel,
  grade as gradeCard,
  pruneStates,
  type Grade,
  type ReviewCard,
} from "@/app/lib/review-deck";

const BUTTONS: { g: Grade; label: string; hint: string; cls: string }[] = [
  { g: "again", label: "Bilemedim", hint: "10 dk", cls: "bg-rose-500 hover:bg-rose-400" },
  { g: "hard", label: "Zor", hint: "kısa", cls: "bg-amber-500 hover:bg-amber-400" },
  { g: "good", label: "Bildim", hint: "normal", cls: "bg-emerald-600 hover:bg-emerald-500" },
  { g: "easy", label: "Kolay", hint: "uzun", cls: "bg-blue-600 hover:bg-blue-500" },
];

export default function ReviewPage() {
  const [deck, setDeck] = useState<ReviewCard[] | null>(null);
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  const load = useCallback(() => {
    const d = buildDeck();
    pruneStates(d);
    setDeck(d);
    setQueue(dueCards(d));
    setIdx(0);
    setRevealed(false);
    setDone(0);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => (deck ? deckStats(deck) : null), [deck]);
  const card = queue[idx] ?? null;

  const answer = useCallback(
    (g: Grade) => {
      if (!card) return;
      gradeCard(card.id, g);
      setDone((n) => n + 1);
      setRevealed(false);

      if (g === "again") {
        // oturum sonuna geri koy — bugün bir daha karşına çıksın
        setQueue((q) => [...q.slice(0, idx), ...q.slice(idx + 1), q[idx]]);
      } else {
        setIdx((i) => i + 1);
      }
    },
    [card, idx]
  );

  // Klavye: boşluk çevirir, 1-4 notlar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.code === "Space") {
        e.preventDefault();
        setRevealed((v) => !v);
        return;
      }
      if (!revealed) return;
      const map: Record<string, Grade> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
      const g = map[e.key];
      if (g) {
        e.preventDefault();
        answer(g);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, answer]);

  /* ── Yükleniyor ── */
  if (deck === null) {
    return (
      <Shell>
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
          Yükleniyor…
        </div>
      </Shell>
    );
  }

  /* ── Hiç kart yok ── */
  if (deck.length === 0) {
    return (
      <Shell>
        <Empty
          icon="🖍"
          title="Tekrar edilecek bir şey yok"
          body="Tekrar kartları vurgularından türetilir. Bir konu okurken önemli bir cümleyi işaretlediğinde, o cümle otomatik olarak buraya kart olarak düşer."
          cta={{ href: "/topics", label: "Kütüphaneye git →" }}
        />
      </Shell>
    );
  }

  /* ── Bugünlük bitti ── */
  if (!card) {
    return (
      <Shell stats={stats}>
        <Empty
          icon="✅"
          title={done > 0 ? `${done} kart çalışıldı` : "Bugünlük hazırsın"}
          body={
            stats && stats.yarin > 0
              ? `Sıradaki ${stats.yarin} kart 24 saat içinde vadesi gelecek.`
              : "Vadesi gelen kart kalmadı. Yeni vurgular yaptıkça deste büyür."
          }
          cta={{ href: "/calisma-alanim", label: "Çalışma Alanım →" }}
          secondary={done > 0 ? { onClick: load, label: "Yeniden tara" } : undefined}
        />
      </Shell>
    );
  }

  /* ── Kart ── */
  const kalan = queue.length - idx;

  return (
    <Shell stats={stats}>
      {/* ilerleme */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-950 transition-all duration-300"
            style={{ width: `${queue.length ? (idx / queue.length) * 100 : 0}%` }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {kalan} kaldı
        </span>
      </div>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* künye */}
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
              card.kind === "sketch" ? "bg-violet-100 text-violet-600" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {card.kind === "sketch" ? "✍ Çizim" : "🖍 Vurgu"}
          </span>
          {card.branch && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
              {card.branch}
            </span>
          )}
          <Link
            href={card.path}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600"
          >
            {card.title}
          </Link>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-slate-300">
            {dueLabel(card.state)}
          </span>
        </header>

        {/* soru */}
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          {card.kind === "sketch" ? (
            <div className="text-center">
              <div className="mb-1 text-3xl">✍</div>
              <p className="mb-5 text-[15px] font-semibold leading-relaxed text-slate-700">
                Bu konuda çizdiğin şemayı hatırla
              </p>
              {revealed ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <StrokePreview
                    strokes={card.strokes ?? []}
                    width={520}
                    maxRatio={1.4}
                    strokeScale={1}
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="flex min-h-[140px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Zihninde canlandır
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-[15px] leading-loose text-slate-700 sm:text-base">
                {card.before && <span className="text-slate-400">{card.before} </span>}
                {revealed ? (
                  <mark className="rounded bg-transparent bg-[linear-gradient(transparent_55%,rgba(250,204,21,.55)_55%)] font-semibold text-slate-900">
                    {card.answer}
                  </mark>
                ) : (
                  <span className="mx-1 inline-block min-w-[7rem] rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-0.5 align-middle text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                    ?
                  </span>
                )}
                {card.after && <span className="text-slate-400"> {card.after}</span>}
              </p>

              {!card.before && !card.after && !revealed && (
                <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                  Bu vurgunun bağlamı kaydedilmemiş — çevir ve hatırla
                </p>
              )}
            </>
          )}
        </div>

        {/* eylemler */}
        <footer className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-full bg-blue-950 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-[0.98]"
            >
              Göster <span className="ml-1 opacity-50">boşluk</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BUTTONS.map((b, i) => (
                <button
                  key={b.g}
                  onClick={() => answer(b.g)}
                  className={`rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all active:scale-95 ${b.cls}`}
                >
                  {b.label}
                  <span className="ml-1 block text-[9px] font-bold opacity-60">
                    {i + 1} · {b.hint}
                  </span>
                </button>
              ))}
            </div>
          )}
        </footer>
      </article>

      <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
        Boşluk çevirir · 1-4 notlar · vurgu silinirse kartı da gider
      </p>
    </Shell>
  );
}

/* ── Kabuk ───────────────────────────────────────────────────────────────── */

function Shell({
  children,
  stats,
}: {
  children: React.ReactNode;
  stats?: ReturnType<typeof deckStats> | null;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] px-4 py-8 font-sans sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-blue-950" />
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-blue-950 sm:text-3xl">
                Tekrar
              </h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Vurgularından türetilir
              </p>
            </div>
          </div>
          <Link
            href="/calisma-alanim"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            🗂 Çalışma Alanım
          </Link>
        </div>

        {stats && stats.toplam > 0 && (
          <div className="mb-4 flex items-center divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {[
              [stats.vadesi, "Vadesi"],
              [stats.yeni, "Yeni"],
              [stats.ogrenilen, "Öğrenilen"],
              [stats.toplam, "Toplam"],
            ].map(([n, l]) => (
              <div key={l as string} className="flex-1 px-3 py-2 text-center">
                <div className="text-base font-black leading-none text-blue-950">{n}</div>
                <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {l}
                </div>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function Empty({
  icon,
  title,
  body,
  cta,
  secondary,
}: {
  icon: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  secondary?: { onClick: () => void; label: string };
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center sm:p-14">
      <div className="mb-3 text-4xl">{icon}</div>
      <h2 className="mb-2 text-lg font-black uppercase italic tracking-tight text-blue-950">
        {title}
      </h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-500">{body}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href={cta.href}
          className="rounded-full bg-blue-950 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-95"
        >
          {cta.label}
        </Link>
        {secondary && (
          <button
            onClick={secondary.onClick}
            className="rounded-full border border-slate-200 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}
