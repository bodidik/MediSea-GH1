"use client";
// C:\Users\hucig\Medknowledge\web\app\(site)\tekrar\page.tsx
//
// Vurgulardan türetilmiş tekrar oturumu. Vurguladığın cümle "boşluk" olur,
// çevresindeki bağlam soruyu kurar. Cevabı hatırlamaya çalışıp kendini
// dört düğmeden biriyle notlarsın; aralık ona göre uzar ya da sıfırlanır.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StrokePreview from "@/app/components/StrokePreview";
import { kisayolSusmali } from "@/app/lib/klavye";
import {
  branchesOf,
  buildDeck,
  cramCards,
  deckStats,
  dueCards,
  dueLabel,
  grade as gradeCard,
  logStudy,
  pruneStates,
  readLog,
  recentDays,
  streakOf,
  type Grade,
  type ReviewCard,
} from "@/app/lib/review-deck";

type Mode = "due" | "cram";

/**
 * Zemin 700, vurgu 800 — ikisi de beyaz yazıyla ölçüldü.
 *
 * Önce zemin 500/600 ve vurgu bir kademe AÇIK'tı; beyaz yazı amber-500'de
 * 2.15, rose-500'de 3.67, emerald-600'da 3.77 kontrast veriyordu (eşik 4.5)
 * ve fareyle üstüne gelince daha da bozuluyordu. Şimdi 5.02–6.70, vurguda
 * 7.09–8.72. Renk kimliği aynı kaldı, yalnızca kademe koyulaştı.
 */
const BUTTONS: { g: Grade; label: string; hint: string; cls: string }[] = [
  { g: "again", label: "Bilemedim", hint: "10 dk", cls: "bg-rose-700 hover:bg-rose-800" },
  { g: "hard", label: "Zor", hint: "kısa", cls: "bg-amber-700 hover:bg-amber-800" },
  { g: "good", label: "Bildim", hint: "normal", cls: "bg-emerald-700 hover:bg-emerald-800" },
  { g: "easy", label: "Kolay", hint: "uzun", cls: "bg-blue-700 hover:bg-blue-800" },
];

export default function ReviewPage() {
  const [deck, setDeck] = useState<ReviewCard[] | null>(null);
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [branch, setBranch] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("due");
  /** Oturumda zorlanılan kartlar — sonunda kaynağa dönmek için listelenir */
  const [zorlananlar, setZorlananlar] = useState<ReviewCard[]>([]);

  const load = useCallback(() => {
    const d = buildDeck();
    pruneStates(d);
    setDeck(d);
    return d;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Seçilen branş ve kipe göre kuyruğu kurar. */
  const start = useCallback(
    (d: ReviewCard[], b: string | null, m: Mode) => {
      setQueue(m === "cram" ? cramCards(d, b) : dueCards(d, b));
      setIdx(0);
      setRevealed(false);
      setDone(0);
      setZorlananlar([]);
    },
    []
  );

  useEffect(() => {
    if (deck) start(deck, branch, mode);
  }, [deck, branch, mode, start]);

  // Sayaçlar deste'den DEĞİL, her nottan sonra tazelenen ayrı bir sayımdan gelir.
  // Deste bilerek donuk tutuluyor (yoksa kuyruk oturum ortasında değişirdi) ama
  // sayaçlar donuk kalırsa kullanıcı çalıştıkça düşmediklerini görüp şaşırıyor.
  const [tick, setTick] = useState(0);
  // tick bilerek bagimlilik: icinde kullanilmiyor, yeniden HESAPLAMA TETIGI.
  // Her nottan sonra artiyor ve depodan taze sayim aliniyor. Kural bunu
  // bilemez, "gereksiz bagimlilik" der; kaldirilirsa sayaclar donar.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => (deck ? deckStats(buildDeck()) : null), [deck, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const branches = useMemo(() => (deck ? branchesOf(buildDeck()) : []), [deck, tick]);
  const card = queue[idx] ?? null;

  const answer = useCallback(
    (g: Grade) => {
      if (!card) return;
      // Tazeleme kipinde takvim DEĞİŞMEZ — sınav gecesi yapılan bir tur,
      // aylardır oturmuş aralıkları sıfırlamamalı.
      if (mode === "due") {
        gradeCard(card.id, g);
        logStudy(g === "good" || g === "easy");
        setTick((t) => t + 1); // sayaçları tazele (kuyruğa dokunmadan)
      }

      // zorlanılanı oturum özetine al (aynı kart iki kez düşmesin)
      if (g === "again" || g === "hard") {
        setZorlananlar((z) => (z.some((c) => c.id === card.id) ? z : [...z, card]));
      } else {
        setZorlananlar((z) => z.filter((c) => c.id !== card.id));
      }

      setDone((n) => n + 1);
      setRevealed(false);

      if (g === "again") {
        // oturum sonuna geri koy — bugün bir daha karşına çıksın
        setQueue((q) => [...q.slice(0, idx), ...q.slice(idx + 1), q[idx]]);
      } else {
        setIdx((i) => i + 1);
      }
    },
    [card, idx, mode]
  );

  // Klavye: boşluk çevirir, 1-4 notlar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      // Odaktaki düğmeyi ezme: Space bir düğme üzerindeyken onu çalıştırmalı,
      // kartı çevirmemeli. Rakam kısayolları (1-4) düğme çalıştırmadığı için
      // korumaya takılmıyor, düğme odaktayken de çalışıyorlar.
      if (kisayolSusmali(e)) return;
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

  /* ── Bu seçimde kart kalmadı ── */
  if (!card) {
    const branslı = branch ? `${branch} branşında ` : "";
    return (
      <Shell
        stats={stats}
        branches={branches}
        branch={branch}
        onBranch={setBranch}
        mode={mode}
        onMode={setMode}
      >
        {/* Oturum özeti — zorlanılan kartlar kaynağına geri götürür.
            Döngünün kapandığı yer burası: oku → vurgula → tekrar et → oku. */}
        {done > 0 && <SessionSummary done={done} zorlananlar={zorlananlar} />}

        <Empty
          icon={done > 0 ? "✅" : "☕"}
          title={done > 0 ? `${done} kart çalışıldı` : `${branslı}sıra boş`}
          body={
            mode === "cram"
              ? `Bu seçimde çalışılacak kart yok. Başka bir branş seç ya da yeni vurgular yap.`
              : stats && stats.yarin > 0
                ? `Sıradaki ${stats.yarin} kart 24 saat içinde vadesi gelecek. Beklemek istemiyorsan "Baştan sona çalış" ile takvimi bozmadan tur atabilirsin.`
                : `Vadesi gelen ${branslı}kart yok. Yeni vurgular yaptıkça deste büyür.`
          }
          cta={{ href: "/calisma-alanim", label: "Çalışma Alanım →" }}
          secondary={
            mode === "due" && stats && stats.toplam > 0
              ? { onClick: () => setMode("cram"), label: "Baştan sona çalış" }
              : done > 0
                ? { onClick: load, label: "Yeniden tara" }
                : undefined
          }
        />
      </Shell>
    );
  }

  /* ── Kart ── */
  const kalan = queue.length - idx;

  return (
    <Shell
      stats={stats}
      branches={branches}
      branch={branch}
      onBranch={setBranch}
      mode={mode}
      onMode={setMode}
    >
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
          {/* Çalışma döngüsünün "kaynağa dön" adımı — tıklama alanı satır
              yüksekliği kadardı (15px), eşik 24px. */}
          <Link
            href={card.path}
            className="inline-block py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600"
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
                  {/* Opaklık kaldırıldı: alt etiket kartın hangi aralığa
                      gideceğini söylüyor, yani düğmenin işlevsel bilgisi.
                      opacity-60 onu 2.15–3.77 kontrasta düşürüyordu.
                      Hiyerarşi artık saydamlıkla değil boyut ve ağırlıkla. */}
                  <span className="ml-1 block text-[10px] font-medium normal-case tracking-normal">
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
  branches,
  branch,
  onBranch,
  mode,
  onMode,
}: {
  children: React.ReactNode;
  stats?: ReturnType<typeof deckStats> | null;
  branches?: ReturnType<typeof branchesOf>;
  branch?: string | null;
  onBranch?: (b: string | null) => void;
  mode?: Mode;
  onMode?: (m: Mode) => void;
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
              [stats.vadesi, "Çalışılacak"],
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

        {/* Kip anahtarı + branş seçimi */}
        {branches && branches.length > 0 && onMode && onBranch && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
              {(
                [
                  ["due", "Vadesi gelenler"],
                  ["cram", "Baştan sona çalış"],
                ] as [Mode, string][]
              ).map(([m, l]) => (
                <button
                  key={m}
                  onClick={() => onMode(m)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    mode === m ? "bg-blue-950 text-white" : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Branş şeridi — birden fazla branş varsa anlamlı */}
            {branches.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                <BranchChip
                  aktif={branch === null}
                  onClick={() => onBranch(null)}
                  ad="Tümü"
                  sayi={mode === "cram"
                    ? branches.reduce((n, b) => n + b.toplam, 0)
                    : branches.reduce((n, b) => n + b.vadesi, 0)}
                />
                {branches.map((b) => (
                  <BranchChip
                    key={b.branch}
                    aktif={branch === b.branch}
                    onClick={() => onBranch(b.branch)}
                    ad={b.branch}
                    sayi={mode === "cram" ? b.toplam : b.vadesi}
                  />
                ))}
              </div>
            )}

            {mode === "cram" && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
                <span className="font-black uppercase tracking-widest">Tazeleme</span> · Takvim
                gözetilmez, kartlar karışık gelir. Buradaki cevapların tekrar aralıklarını
                <strong> değiştirmez</strong> — sınav öncesi turun oturmuş programını bozmasın diye.
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

/* ── Oturum özeti ────────────────────────────────────────────────────────── */

function SessionSummary({ done, zorlananlar }: { done: number; zorlananlar: ReviewCard[] }) {
  const log = readLog();
  const seri = streakOf(log);
  const gunler = recentDays(log, 14);
  const enYogun = Math.max(1, ...gunler.map((g) => g.kart));

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="text-xl">{seri >= 3 ? "🔥" : "✅"}</span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black uppercase tracking-tight text-blue-950">
            {done} kart çalışıldı
          </div>
          {seri > 0 && (
            <div className="mt-0.5 text-[11px] text-slate-400">
              {seri} gündür üst üste çalışıyorsun
            </div>
          )}
        </div>

        {/* son 14 gün — çubuk yüksekliği o günün kart sayısı */}
        <div className="flex h-8 shrink-0 items-end gap-[3px]" title="Son 14 gün">
          {gunler.map((g) => (
            <div
              key={g.gun}
              title={`${g.gun}: ${g.kart} kart`}
              className={`w-1.5 rounded-sm ${g.kart ? "bg-blue-950" : "bg-slate-100"}`}
              style={{ height: g.kart ? `${Math.max(18, (g.kart / enYogun) * 100)}%` : "12%" }}
            />
          ))}
        </div>
      </div>

      {zorlananlar.length > 0 && (
        <div className="px-4 py-3">
          <h3 className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Zorlandıkların — kaynağa dön
          </h3>
          <ul className="space-y-1.5">
            {zorlananlar.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.path}
                  className="group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                >
                  <span className="mt-0.5 shrink-0 text-[10px]">
                    {c.kind === "sketch" ? "✍" : "🖍"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-black uppercase tracking-tight text-blue-950 group-hover:text-blue-600">
                      {c.title}
                    </span>
                    {c.kind === "cloze" && (
                      <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-slate-500">
                        {c.answer}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BranchChip({
  aktif,
  onClick,
  ad,
  sayi,
}: {
  aktif: boolean;
  onClick: () => void;
  ad: string;
  sayi: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
        aktif
          ? "border-blue-950 bg-blue-950 text-white"
          : sayi === 0
            ? "border-slate-100 bg-white text-slate-300"
            : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {ad}
      <span className={`ml-1.5 ${aktif ? "text-white/50" : "text-slate-300"}`}>{sayi}</span>
    </button>
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
