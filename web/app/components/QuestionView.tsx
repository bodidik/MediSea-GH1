// C:\Users\hucig\Medknowledge\web\app\components\QuestionView.tsx
"use client";

import * as React from "react";
import ProtectedContent from "@/components/ProtectedContent";
import AddToSRButton from "@/components/AddToSRButton";
import type { Question } from "@/types/question";

type Props = {
  question: Question;
  chunkId?: string;            // UI attribute işaretlemesi
  isPremiumAllowed?: boolean;  // açıklama erişim kontrolü
  className?: string;
};

export default function QuestionView({
  question,
  chunkId,
  isPremiumAllowed = true,
  className = "",
}: Props) {
  const {
    id,
    contentId,
    stem,
    options = [],
    answer,
    explanation,
    vignette,
    title,
    section,
  } = question;

  // Adım adım gösterim kontrolleri
  const [showAnswer, setShowAnswer] = React.useState<boolean>(false);
  const [showExplain, setShowExplain] = React.useState<boolean>(false);

  const correctKey: string | undefined = (answer as string) || undefined;

  return (
    <article className={`space-y-6 text-slate-300 ${className}`} data-chunk={chunkId ?? "unknown"}>
      {/* (0) Üst meta (opsiyonel) */}
      {(title || section) && (
        <header className="space-y-1 border-b border-slate-700/50 pb-3">
          {title ? <h2 className="text-xl font-bold text-slate-100">{title}</h2> : null}
          {section ? (
            <div className="text-xs font-medium tracking-wide text-blue-400 uppercase">
              Bölüm: {section}
            </div>
          ) : null}
        </header>
      )}

      {/* (1) Vaka (varsa) */}
      {vignette ? (
        <section className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 text-[14px] text-slate-300 shadow-inner">
          <div className="font-bold text-slate-400 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            VAKA BİLGİSİ
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{vignette}</div>
        </section>
      ) : null}

      {/* (2) Soru kökü */}
      <section className="text-lg font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">
        {stem}
      </section>

      {/* (3) Şıklar – responsive grid, doğru şık vurgulu */}
      {options.length > 0 && (
        <ul
          className="grid gap-3 sm:grid-cols-1"
          role="list"
          aria-label="Seçenekler"
        >
          {options.map((opt) => {
            const isCorrect = showAnswer && correctKey === opt.key;
            return (
              <li
                key={opt.key}
                className={[
                  "rounded-xl border p-4 text-[15px] leading-snug transition-all duration-300",
                  isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]" // Doğru cevap neon yeşil tonu
                    : "border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 text-slate-300",
                ].join(" ")}
              >
                <span className="font-bold mr-3 opacity-70">{opt.key}.</span>
                <span>{opt.text}</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* (4) Adım adım butonları */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!showAnswer && correctKey ? (
          <button
            type="button"
            onClick={() => setShowAnswer(true)}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 text-sm transition-colors shadow-lg shadow-blue-900/20"
          >
            Cevabı Göster
          </button>
        ) : null}

        {showAnswer && explanation ? (
          <button
            type="button"
            onClick={() => setShowExplain((v) => !v)}
            className="rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 text-sm transition-colors"
          >
            {showExplain ? "Açıklamayı Gizle" : "Açıklamayı Göster"}
          </button>
        ) : null}
      </div>

      {/* (5) Doğru cevap satırı */}
      {showAnswer && correctKey && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Doğru cevap: <b className="text-emerald-400 text-base">{correctKey}</b></span>
        </div>
      )}

      {/* (6) Açıklama – Premium kilidi */}
      {showAnswer && explanation && showExplain ? (
        <ProtectedContent isAllowed={isPremiumAllowed}>
          <section className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-5 mt-4">
            <h3 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider">Uzman Açıklaması</h3>
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-400">
              <div className="whitespace-pre-wrap text-slate-300">{explanation}</div>
            </div>
          </section>
        </ProtectedContent>
      ) : null}

      {/* (7) SR butonu */}
      <footer className="pt-4 border-t border-slate-700/50 flex justify-end">
        <AddToSRButton
          contentId={contentId ?? id}
          label="Tekrar Listesine Ekle (SR)"
          className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-2"
        />
      </footer>
    </article>
  );
}