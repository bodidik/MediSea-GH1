"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { kalinIsle } from "@/app/lib/metin";
import { premiumGunIsle } from "@/app/lib/premium-gun";

/**
 * GÜNÜN SORUSU — panoda 30 saniyelik giriş: tek soru, cevap panoda verilir,
 * açıklama açılır, setin tamamına bağlantı. Veri `/api/gunun-sorusu`dan
 * (pano ISR'de; tarihe bağlı seçim sunucu sayfasında donardı). Uç erişim
 * kapısından geçmeyen kullanıcıya soru döndürmez → kart çizilmez.
 *
 * Gün içinde verilen cevap hatırlanır (`medisea:gununsorusu` — yalnız o günün
 * seçimi; yedeğe GİRMEZ, ertesi gün anlamsız). Cevap XP VERMEZ: XP soru setinin
 * içinde, kimliğe bağlı veriliyor (app/lib/xp.ts); burada ikinci bir yol açmak
 * aynı soruya çift puan riskidir. Ama çalışma günlüğüne işlenir (seri).
 */
type Veri = {
  gun: string;
  soru: { metin: string; secenekler: Record<string, string>; dogru: string; aciklama: string };
  set: { branch: string; id: string; baslik: string; sira: number };
};
const ANAHTAR = "medisea:gununsorusu";

export default function GununSorusu({ lang }: { lang: string }) {
  const [v, setV] = useState<Veri | null>(null);
  const [secim, setSecim] = useState<string | null>(null);
  // Gün içinde ÖNCEDEN cevaplanmışsa kart tek satıra katlanır: uzun bir soru
  // panoyu (branş listesini) aşağı itiyordu; cevaplanmış soruyu her girişte
  // tam boy göstermenin bir getirisi yok. Açma düğmesi korunur.
  const [katli, setKatli] = useState(false);

  useEffect(() => {
    let iptal = false;
    fetch("/api/gunun-sorusu")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (iptal || !j?.soru) return;
        setV(j as Veri);
        try {
          const k = JSON.parse(localStorage.getItem(ANAHTAR) || "null");
          if (k?.gun === j.gun && typeof k.secim === "string") { setSecim(k.secim); setKatli(true); }
        } catch {}
      })
      .catch(() => {});
    return () => { iptal = true; };
  }, []);

  if (!v) return null;
  const { soru, set } = v;
  const cevaplandi = secim !== null;

  const sec = (h: string) => {
    if (cevaplandi) return;
    setSecim(h);
    premiumGunIsle();
    try { localStorage.setItem(ANAHTAR, JSON.stringify({ gun: v.gun, secim: h })); } catch {}
  };

  if (katli) {
    return (
      <section aria-labelledby="gunun-sorusu-baslik" className="bg-white rounded-xl border border-violet-200 px-5 py-3 mb-6 flex items-center justify-between gap-3 flex-wrap">
        <h2 id="gunun-sorusu-baslik" className="text-[13px] font-semibold text-violet-900" style={{ marginTop: 0, fontFamily: "inherit" }}>
          🎯 Günün sorusunu çözdün {secim === soru.dogru ? "✓" : "· doğru cevap " + soru.dogru} — yarın yeni soru
        </h2>
        <button
          type="button"
          onClick={() => setKatli(false)}
          className="text-[12px] font-semibold text-violet-800 underline underline-offset-2 min-h-[44px]"
          aria-expanded="false"
        >
          Soruyu ve açıklamayı göster
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="gunun-sorusu-baslik" className="bg-white rounded-xl border border-violet-200 px-5 py-4 mb-6">
      <h2 id="gunun-sorusu-baslik" className="text-[11px] font-semibold text-violet-800" style={{ marginTop: 0, fontFamily: "inherit" }}>
        🎯 Günün sorusu · {set.baslik}
      </h2>
      <p className="text-sm text-slate-800 mt-2 whitespace-pre-line leading-relaxed">{kalinIsle(soru.metin)}</p>
      <div className="mt-3 flex flex-col gap-2">
        {Object.entries(soru.secenekler).map(([h, m]) => {
          const dogru = cevaplandi && h === soru.dogru;
          const yanlis = cevaplandi && h === secim && h !== soru.dogru;
          return (
            <button
              key={h}
              type="button"
              onClick={() => sec(h)}
              disabled={cevaplandi}
              aria-label={`${h}: ${m}`}
              className={`text-left text-[13px] rounded-lg border px-3 py-2 min-h-[44px] transition-colors ${
                dogru ? "border-green-600 bg-green-50 text-green-900"
                : yanlis ? "border-red-600 bg-red-50 text-red-900"
                : cevaplandi ? "border-slate-200 text-slate-500"
                : "border-slate-200 hover:border-violet-400 text-slate-800"
              }`}
            >
              <span className="font-bold mr-1.5">{dogru ? "✓" : yanlis ? "✗" : h}</span>{m}
            </button>
          );
        })}
      </div>
      <div role="status" aria-live="polite">
        {cevaplandi && (
          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <p className="text-[13px] font-semibold text-slate-800">
              {secim === soru.dogru ? "Doğru! " : `Doğru cevap ${soru.dogru}. `}
            </p>
            <p className="text-[13px] text-slate-700 mt-1 leading-relaxed">{kalinIsle(soru.aciklama)}</p>
            <Link
              href={`/${lang}/premium/ydus/quiz-coz?branch=${set.branch}&id=${set.id}`}
              className="inline-block mt-2 text-[12px] font-semibold text-violet-800 underline underline-offset-2"
            >
              Bu setin tamamını çöz →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
