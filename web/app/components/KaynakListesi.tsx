import type { Kaynak } from "@/lib/kaynaklar";
import { kaynaklariGrupla } from "@/lib/kaynaklar";

/**
 * Kaynak listesi — konu sayfası ve `/kaynakca/<ad>` aynı bileşeni kullanır.
 *
 * `gruplu`: türe göre ara başlıklarla basar (kaynakça). Tek grup kalıyorsa
 * ara başlık basılmaz — "Makaleler" başlığının altında tek bir liste
 * gürültüden ibaret.
 */
export default function KaynakListesi({
  kaynaklar,
  gruplu = false,
  baslikDuzeyi = "h3",
}: {
  kaynaklar: Kaynak[];
  gruplu?: boolean;
  baslikDuzeyi?: "h2" | "h3";
}) {
  const gruplar = gruplu ? kaynaklariGrupla(kaynaklar) : [{ baslik: "", kaynaklar }];
  const araBaslik = gruplar.length > 1;
  const Baslik = baslikDuzeyi;
  return (
    <>
      {gruplar.map((g) => (
        <div key={g.baslik} className={araBaslik ? "mt-4 first:mt-0" : undefined}>
          {araBaslik && (
            <Baslik className="font-sans mt-0 mb-2 text-xs font-bold text-slate-700">
              {g.baslik} <span className="font-normal text-slate-600">({g.kaynaklar.length})</span>
            </Baslik>
          )}
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-snug">
            {g.kaynaklar.map((k, i) => (
              <li key={i}>
                {k.url ? (
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-[3px] text-blue-800 underline decoration-blue-200 underline-offset-2 hover:text-blue-950 hover:decoration-blue-800"
                  >
                    {k.ad}
                  </a>
                ) : (
                  k.ad
                )}
                {k.yil && !k.ad.includes(k.yil) ? ` (${k.yil})` : ""}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </>
  );
}
