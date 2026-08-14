"use client";
// C:\Users\hucig\Medknowledge\web\app\components\StudyCoverage.tsx
//
// Branş başına kapsama: kaç konuda çalışma izin var, kaç konu toplam.
//
// Sınav planlamasının asıl sorusu "ne çalıştım" değil, "neye HİÇ bakmadım".
// Çalışma Alanım'ın geri kalanı yalnızca dokunduğun sayfaları gösteriyor;
// burası dokunmadıklarını da görünür kılıyor.
//
// Konu sayıları dosya sisteminden gelir, bu yüzden /api/branch-counts
// üzerinden alınır (bu bileşen istemci tarafında çalışır).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { branchSlugOf, collectAll } from "@/app/lib/study-index";
import { SPECIALTIES } from "@/app/lib/specialties";

type Row = {
  slug: string;
  ad: string;
  ikon: string;
  calisilan: number;
  toplam: number;
};

export default function StudyCoverage() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [calisilan, setCalisilan] = useState<Record<string, number>>({});
  const [acik, setAcik] = useState(false);

  useEffect(() => {
    // hangi branşta kaç AYRI konuya dokunulmuş
    const perBranch: Record<string, Set<string>> = {};
    for (const e of collectAll()) {
      const slug = branchSlugOf(e.path);
      if (!slug) continue;
      (perBranch[slug] ??= new Set()).add(e.path);
    }
    const sayim: Record<string, number> = {};
    for (const [k, v] of Object.entries(perBranch)) sayim[k] = v.size;
    setCalisilan(sayim);

    let iptal = false;
    fetch("/api/branch-counts")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!iptal && d?.counts) setCounts(d.counts);
      })
      .catch(() => {
        // sayımlar alınamazsa bölüm hiç gösterilmez — yanlış sayı göstermekten iyidir
      });
    return () => {
      iptal = true;
    };
  }, []);

  const rows = useMemo<Row[]>(() => {
    if (!counts) return [];
    return SPECIALTIES.map((s) => ({
      slug: s.slug,
      ad: s.title,
      ikon: s.icon,
      calisilan: calisilan[s.slug] ?? 0,
      toplam: counts[s.slug] ?? 0,
    }))
      .filter((r) => r.toplam > 0)
      .sort((a, b) => b.calisilan - a.calisilan || b.toplam - a.toplam);
  }, [counts, calisilan]);

  if (!counts || rows.length === 0) return null;

  const dokunulan = rows.filter((r) => r.calisilan > 0);
  const toplamKonu = rows.reduce((n, r) => n + r.toplam, 0);
  const toplamCalisilan = rows.reduce((n, r) => n + r.calisilan, 0);
  const gosterilecek = acik ? rows : dokunulan.length ? dokunulan : rows.slice(0, 5);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Kapsama
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          {toplamCalisilan} / {toplamKonu} konu
        </span>
      </div>

      <ul className="space-y-1.5">
        {gosterilecek.map((r) => {
          const oran = r.toplam ? r.calisilan / r.toplam : 0;
          return (
            <li key={r.slug}>
              <Link
                href={`/topics/${r.slug}`}
                className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-slate-50"
              >
                <span className="w-5 shrink-0 text-center text-sm">{r.ikon}</span>
                <span className="w-28 shrink-0 truncate text-[11px] font-black uppercase tracking-tight text-blue-950 group-hover:text-blue-600 sm:w-36">
                  {r.ad}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full transition-all ${
                      r.calisilan === 0 ? "bg-slate-200" : "bg-blue-950"
                    }`}
                    style={{ width: `${Math.max(oran * 100, r.calisilan ? 4 : 0)}%` }}
                  />
                </span>
                <span
                  className={`w-14 shrink-0 text-right text-[10px] font-bold tabular-nums ${
                    r.calisilan ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  {r.calisilan}/{r.toplam}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {rows.length > gosterilecek.length && (
        <button
          onClick={() => setAcik(true)}
          className="mt-2 w-full rounded-lg border border-slate-100 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          Dokunmadığın {rows.length - gosterilecek.length} branşı da göster
        </button>
      )}
      {acik && (
        <button
          onClick={() => setAcik(false)}
          className="mt-2 w-full rounded-lg border border-slate-100 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          Daralt
        </button>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
        Bir konuda vurgu ya da not varsa o konu &quot;çalışılmış&quot; sayılır. Sayılar
        planlama içindir; okuduğun ama işaretlemediğin konular burada görünmez.
      </p>
    </section>
  );
}
