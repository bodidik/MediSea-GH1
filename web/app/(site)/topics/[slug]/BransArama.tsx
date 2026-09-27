"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { aramaNormalize } from "@/app/lib/arama";

export type BransAramaKaydi = { slug: string; baslik: string; yol: string };

/**
 * Branş içi arama — İçindekiler'in derin katmanları için.
 *
 * İçindekiler bölüm + alt başlık düzeyini basıyor; üçüncü ve daha derin
 * katmandaki "ileri okuma" konuları (ör. çölyak altında psödotahıllar)
 * yalnızca buradan ve konu sayfasından bulunur. Veri sayfayla geliyor,
 * ağ isteği yok.
 */
export default function BransArama({ konular, brans }: { konular: BransAramaKaydi[]; brans: string }) {
  const [sorgu, setSorgu] = useState("");
  const aranan = aramaNormalize(sorgu);

  const sonuclar = useMemo(() => {
    if (aranan.length < 2) return [];
    return konular.filter((k) => aramaNormalize(k.baslik).includes(aranan)).slice(0, 40);
  }, [aranan, konular]);

  const durum =
    aranan.length < 2 ? "" : sonuclar.length === 0 ? `"${sorgu}" için konu bulunamadı.` : `${sonuclar.length} konu bulundu.`;

  return (
    <div>
      <div role="status" aria-live="polite" className="sr-only">{durum}</div>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
        <input
          type="search"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          aria-label="Bu branşta konu ara"
          placeholder={`${konular.length} konu içinde ara…`}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-blue-950 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
        />
      </div>

      {aranan.length >= 2 && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2">
          {sonuclar.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500">
              &quot;{sorgu}&quot; bu branşta yok. <Link href={`/topics?ara=${encodeURIComponent(sorgu)}`} className="font-bold text-blue-700 underline-offset-2 hover:underline">Bütün kütüphanede ara →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sonuclar.map((k) => (
                <li key={k.slug}>
                  <Link href={`/topics/${brans}/${k.slug}`} className="block rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                    <span className="block text-[14px] font-bold leading-snug text-blue-950">{k.baslik}</span>
                    <span className="mt-0.5 block text-[12px] text-slate-500">{k.yol}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
