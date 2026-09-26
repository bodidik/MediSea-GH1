import Link from "next/link";
import type { Kaynakca } from "@/lib/kaynaklar";
import KaynakListesi from "@/app/components/KaynakListesi";

/**
 * Ortak kaynakçanın KATLANMIŞ satırı — açık konu sayfası ve premium konu
 * sayfası aynı bileşeni kullanır (iki kopya ayrışırdı).
 *
 * KAPALI başlar: 30+ künye her sayfanın sonuna kuyruk olmasın. Liste DOM'da
 * duruyor (JSON-LD `citation` ile aynı küme), yalnızca katlanmış.
 */
export default function KaynakcaBlogu({ kaynakca, ayrac = false }: { kaynakca: Kaynakca; ayrac?: boolean }) {
  return (
    <details className={`group ${ayrac ? "mt-4 pt-4 border-t border-slate-100" : ""}`}>
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-xl text-sm text-slate-700 hover:text-blue-900 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="inline-block text-blue-800 transition-transform group-open:rotate-90">
          ▸
        </span>
        <span>
          Bu konu <strong className="font-semibold text-slate-900">{kaynakca.baslik}</strong> kaynakçasından
          hazırlandı · {kaynakca.kaynaklar.length} kaynak
        </span>
      </summary>
      <div className="mt-3">
        <KaynakListesi kaynaklar={kaynakca.kaynaklar} gruplu />
        <Link
          href={`/kaynakca/${kaynakca.ad}`}
          className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-blue-800 underline decoration-blue-200 underline-offset-2 hover:text-blue-950"
        >
          Kaynakçanın tamamı ve kullanan konular →
        </Link>
      </div>
    </details>
  );
}
