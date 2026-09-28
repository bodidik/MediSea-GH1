'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { aramaEslesir } from '@/app/lib/arama';

export interface AranabilirKonu {
  brans: string;
  bransAdi: string;
  id: string;
  baslik: string;
  altbaslik?: string;
  /** "15 soru · 80 kart" — panodaki biçimleyiciden (icerikOzeti). */
  icerik?: string;
}

const EN_FAZLA = 10;

/**
 * PREMIUM KONU ARAMASI — ölçüldü (28 Eyl): ücretli alanda konu araması
 * YOKTU (tek arama kutusu inci görüntüleyicisinin içinde) ve açık sitenin
 * araması premium konuları kapsamıyor. 67 konunun birine ulaşmak için
 * branşını ve kategorisini bilmek gerekiyordu.
 *
 * Eşleştirici `aramaEslesir` (Türkçe duyarlı; inci görüntüleyicisi de
 * içerikte bunu kullanıyor). `esnekEslesir` BİLEREK değil: modülün kendi
 * notu onu yalnız araç adlarına ölçülmüş diye işaretliyor. Boş sorgu
 * hiçbir şey göstermez — sözleşme gereği süzgeç boş sorguyu kendi karşılar.
 */
export default function PremiumKonuAra({ lang, konular }: { lang: string; konular: AranabilirKonu[] }) {
  const [sorgu, setSorgu] = useState('');
  const bos = !sorgu.trim();

  const bulunan = useMemo(() => {
    if (bos) return [];
    return konular.filter(
      (k) =>
        aramaEslesir(k.baslik, sorgu) ||
        aramaEslesir(k.altbaslik ?? '', sorgu) ||
        aramaEslesir(k.bransAdi, sorgu),
    );
  }, [konular, sorgu, bos]);

  return (
    <div className="mb-6">
      <label htmlFor="premium-konu-ara" className="block text-sm font-semibold text-slate-600 mb-2">
        Premium konularda ara
      </label>
      <input
        id="premium-konu-ara"
        type="search"
        value={sorgu}
        onChange={(e) => setSorgu(e.target.value)}
        placeholder="ör. Cushing, pnömoni, hematoloji"
        autoComplete="off"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {/* Bölge koşulsuz basılır: `status` içeriği DEĞİŞEN düğümü duyurur. */}
      <p role="status" className="mt-2 text-[12px] text-slate-600">
        {bos
          ? ''
          : bulunan.length === 0
            ? 'Eşleşen konu yok.'
            : bulunan.length > EN_FAZLA
              ? `${bulunan.length} konu bulundu — ilk ${EN_FAZLA} gösteriliyor.`
              : `${bulunan.length} konu bulundu.`}
      </p>
      {bulunan.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {bulunan.slice(0, EN_FAZLA).map((k) => (
            <li key={`${k.brans}/${k.id}`}>
              <Link
                href={`/${lang}/premium/ydus/${k.brans}/${k.id}`}
                className="block px-4 py-2.5 hover:bg-slate-50"
              >
                <span className="block text-sm font-medium text-slate-800">{k.baslik}</span>
                <span className="block text-[12px] text-slate-600">
                  {[k.bransAdi, k.icerik].filter(Boolean).join(' · ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
