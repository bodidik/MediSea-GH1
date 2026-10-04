"use client";

import { useEffect, useState } from "react";
import { birlesikSeri } from "@/app/lib/premium-gun";

/**
 * GÜNLÜK SERİ — panoda "kaç gündür aralıksız çalışıyorsun" bilgisi.
 *
 * Seri premium çalışma günlüğü ile açık sitenin tekrar günlüğünün BİRLEŞİMİNDEN
 * hesaplanır (app/lib/premium-gun.ts): soru çözülen, kart açılan ya da vaka
 * bitirilen her gün sayılır. Bugün henüz çalışılmadıysa seri kırık gösterilmez,
 * "bugün çalışırsan N+1 olur" denir — gün bitmeden moral bozmamak için.
 *
 * Hiç etkinlik yoksa (yeni kullanıcı) kart çizilmez: sıfır seriyi göstermek
 * ilk ziyarette bir şey kazandırmaz.
 */
const GUNLER = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

export default function GunlukSeri() {
  const [d, setD] = useState<ReturnType<typeof birlesikSeri> | null>(null);
  useEffect(() => setD(birlesikSeri()), []);
  if (!d || (d.seri === 0 && !d.son7.some(Boolean))) return null;

  const bugunCalisti = d.bugun > 0;
  const bugunIdx = new Date().getDay();
  const etiket = (i: number) => GUNLER[(bugunIdx - (6 - i) + 7) % 7];

  return (
    <section
      aria-label="Günlük çalışma serin"
      className="bg-white rounded-xl border border-amber-200 px-5 py-3 mb-4 flex items-center justify-between gap-4 flex-wrap"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {d.seri > 0 ? `🔥 ${d.seri} gün üst üste` : "Seri yeniden başlıyor"}
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          {bugunCalisti
            ? `Bugün ${d.bugun} çalışma kaydın var — seri güvende.`
            : d.seri > 0
              ? `Bugün bir soru çözersen seri ${d.seri + 1} güne çıkar.`
              : "Bugün bir soru çözerek yeni bir seri başlat."}
        </p>
      </div>
      <ol className="flex gap-1.5" aria-label="Son 7 gün">
        {d.son7.map((v, i) => (
          <li key={i} className="flex flex-col items-center gap-0.5">
            <span
              aria-label={`${etiket(i)}: ${v ? "çalışıldı" : "çalışılmadı"}`}
              className={`w-5 h-5 rounded-full border ${v ? "bg-amber-400 border-amber-500" : "bg-slate-50 border-slate-300"} ${i === 6 ? "ring-2 ring-offset-1 ring-amber-300" : ""}`}
            />
            <span aria-hidden="true" className="text-[10px] text-slate-500">{etiket(i)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
