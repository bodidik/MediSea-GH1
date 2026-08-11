"use client";
// C:\Users\hucig\Medknowledge\web\app\components\StudyStatus.tsx
//
// Ana sayfadaki çalışma durumu şeridi. Vadesi gelmiş kart varsa öne çıkar,
// yoksa sessizce özet gösterir. Hiç çalışma verisi yoksa HİÇ RENDER EDİLMEZ —
// yeni kullanıcı boş bir kutuyla karşılaşmasın.
//
// Veri tarayıcıda durduğu için sunucuda bilinemez; bu yüzden istemci bileşeni
// ve ilk karede null döner (hidrasyon uyuşmazlığı olmaz).

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildDeck, deckStats, type DeckStats } from "@/app/lib/review-deck";

export default function StudyStatus() {
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [notlu, setNotlu] = useState(0);

  useEffect(() => {
    try {
      const deck = buildDeck();
      setStats(deckStats(deck));
      // not tutulan sayfa sayısı — deste dışı, ayrıca sayılır
      let n = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("medisea:notes:v1:")) n++;
      }
      setNotlu(n);
    } catch {
      setStats(null);
    }
  }, []);

  if (!stats || (stats.toplam === 0 && notlu === 0)) return null;

  const acil = stats.vadesi > 0;

  // Yalın kutu döner — genişlik/kenar boşluğu kararı çağıran sayfanındır.
  return (
    <div
        className={`mb-4 flex flex-wrap items-center gap-3 rounded-2xl border p-3 sm:p-4 ${
          acil
            ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-white shadow-sm shadow-yellow-100"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
            acil ? "bg-yellow-400" : "bg-slate-100"
          }`}
        >
          {acil ? "⚡" : "📚"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-black uppercase tracking-tight text-blue-950">
            {acil ? `${stats.vadesi} kartın tekrar zamanı geldi` : "Çalışma alanın hazır"}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
            {stats.toplam > 0 && <span>{stats.toplam} kart</span>}
            {stats.yeni > 0 && <span>{stats.yeni} yeni</span>}
            {stats.ogrenilen > 0 && <span>{stats.ogrenilen} öğrenilen</span>}
            {notlu > 0 && <span>{notlu} sayfada not</span>}
            {!acil && stats.yarin > 0 && <span>{stats.yarin} kart yarın</span>}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          {stats.vadesi > 0 && (
            <Link
              href="/tekrar"
              className="rounded-full bg-blue-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-95"
            >
              Tekrara başla →
            </Link>
          )}
          <Link
            href="/calisma-alanim"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            🗂 Alanım
          </Link>
        </div>
    </div>
  );
}
