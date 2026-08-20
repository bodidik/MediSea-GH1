import type { Metadata } from "next";
import Link from "next/link";
import { SPECIALTIES } from "@/app/lib/specialties";

/**
 * Kütüphane bölümüne ÖZEL 404.
 *
 * Neden gerekti: `/topics/[slug]` ve `/topics/[slug]/[topicSlug]` gerçek
 * birer rota, yani var olmayan bir konu adresi rotaya OTURUYOR ve sayfa
 * istek anında `notFound()` fırlatıyor. Ölçüldü (hem canlıda hem yerelde,
 * birebir aynı): o durumda sunucudan giden HTML'de gövde YOKTU —
 * `<h1>` 0, `<main>` 0, bağlantı 0; içerik ancak hidrasyondan sonra
 * beliriyordu. Karşılaştırma: `/tools/olmayan-arac` hiçbir rotaya
 * oturmadığı için kök 404'ü doğrudan alıyor ve sunucuda tam basılıyor
 * (h1 1, 16 bağlantı).
 *
 * Bölüm düzeyinde bir not-found, o segmentin sınırında çözülüyor ve
 * sunucuda üretiliyor. Yan faydası: metin artık genel "sayfa yok" değil,
 * kütüphaneye özel — kullanıcı doğrudan branş listesine dönebiliyor.
 *
 * Kök öge <main> DEĞİL: AppShell zaten bir <main> basıyor ve ikisi birden
 * olduğunda belgede iki landmark oluşuyor (ölçüldü: main sayısı 2).
 */
export const metadata: Metadata = {
  title: "Konu bulunamadı",
  robots: { index: false, follow: true },
};

export default function KonuBulunamadi() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        404 · Kütüphane
      </p>
      <h1 className="mt-2 text-2xl font-black text-blue-950">
        Bu konu kütüphanede yok
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Adres değişmiş ya da konu kaldırılmış olabilir. Aradığın başlığı
        branşların içinden bulabilirsin.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/topics"
          className="rounded-xl bg-blue-950 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white"
        >
          Kütüphaneye dön
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600"
        >
          Ana sayfa
        </Link>
      </div>

      <h2 className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans mt-0">
        Branşlar
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SPECIALTIES.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/topics/${b.slug}`}
              className="inline-block rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900"
            >
              {b.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
