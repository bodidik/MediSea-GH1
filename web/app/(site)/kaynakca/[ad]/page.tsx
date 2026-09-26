import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { kaynakcaAdlari, kaynakcaGetir } from "@/lib/kaynaklar";
import { getSpecialty } from "@/app/lib/specialties";
import KaynakListesi from "@/app/components/KaynakListesi";

/**
 * ORTAK KAYNAKÇA SAYFASI — `/kaynakca/<ad>`.
 *
 * Konu sayfası kaynakçayı katlanmış tek satırla gösteriyor; bu sayfa
 * listenin paylaşılabilir tam hâli ve kaynakçayı KULLANAN konuların dizini.
 * Şema ve gerekçe: `lib/kaynaklar.ts`.
 *
 * Tamamen derlemede üretilir (`dynamicParams = false`): kullanan konular
 * dosya sisteminden taranıyor ve sunucusuz ortamda `content/canonical`e
 * istek anında güvenilmiyor. Kaynakça yalnızca dağıtımla değişir.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return kaynakcaAdlari().map((ad) => ({ ad }));
}

type KullananKonu = { brans: string; slug: string; baslik: string };

function kullananKonular(ad: string): KullananKonu[] {
  const kok = path.join(process.cwd(), "content", "canonical");
  const cikti: KullananKonu[] = [];
  for (const brans of fs
    .readdirSync(kok, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)) {
    for (const dosya of fs.readdirSync(path.join(kok, brans)).filter((f) => f.endsWith(".json"))) {
      let veri: { title?: string; meta?: { kaynakca?: unknown; hidden?: boolean } } | null = null;
      try {
        veri = JSON.parse(fs.readFileSync(path.join(kok, brans, dosya), "utf8"));
      } catch {
        continue;
      }
      // Gizli konu listelenmez — branş listeleri ve site haritasıyla aynı kural.
      if (!veri || veri.meta?.hidden === true || veri.meta?.kaynakca !== ad) continue;
      const slug = dosya.replace(/\.json$/, "");
      cikti.push({ brans, slug, baslik: veri.title || slug });
    }
  }
  return cikti.sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ad: string }>;
}): Promise<Metadata> {
  const { ad } = await params;
  const kaynakca = kaynakcaGetir(ad);
  if (!kaynakca) return { title: "Kaynakça bulunamadı", robots: { index: false, follow: false } };
  const baslik = `${kaynakca.baslik} kaynakçası`;
  const aciklama = `${kaynakca.baslik} konularının hazırlandığı ${kaynakca.kaynaklar.length} kaynak.`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: `/kaynakca/${ad}` },
    openGraph: { type: "website", title: baslik, description: aciklama, url: `/kaynakca/${ad}` },
  };
}

export default async function KaynakcaSayfasi({ params }: { params: Promise<{ ad: string }> }) {
  const { ad } = await params;
  const kaynakca = kaynakcaGetir(ad);
  if (!kaynakca) notFound();
  const konular = kullananKonular(ad);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <nav aria-label="Kırıntı yolu" className="mb-8">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-slate-600">
            <li className="flex items-center gap-x-2">
              <Link href="/" className="py-1.5 hover:text-blue-600 transition-colors">MediSea</Link>
            </li>
            <li className="flex items-center gap-x-2">
              <span aria-hidden="true">/</span>
              <Link href="/topics" className="py-1.5 hover:text-blue-600 transition-colors">Kütüphane</Link>
            </li>
            <li className="flex items-center gap-x-2">
              <span aria-hidden="true">/</span>
              <span className="text-blue-900" aria-current="page">{kaynakca.baslik} kaynakçası</span>
            </li>
          </ol>
        </nav>

        <div className="border-l-8 border-blue-900 pl-6 py-2 mb-8">
          <h1 className="text-[28px] sm:text-4xl font-black text-blue-950 tracking-tight leading-tight mt-0 mb-3 break-words">
            {kaynakca.baslik} kaynakçası
          </h1>
          <p className="text-sm text-slate-700 mb-0">
            {kaynakca.aciklama ??
              `Aşağıdaki konular bu ${kaynakca.kaynaklar.length} kaynaktan hazırlandı. Liste konu ailesinin kaynakçasıdır; her künye her sayfanın dayanağı değildir.`}
          </p>
        </div>

        <section
          aria-labelledby="kaynakca-listesi"
          className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8"
        >
          <h2
            id="kaynakca-listesi"
            className="font-sans mt-0 text-[10px] font-black text-blue-900/80 uppercase tracking-[0.2em] mb-4"
          >
            Kaynaklar · {kaynakca.kaynaklar.length}
          </h2>
          <KaynakListesi kaynaklar={kaynakca.kaynaklar} gruplu />
        </section>

        {konular.length > 0 && (
          <section
            aria-labelledby="kullanan-konular"
            className="mt-5 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8"
          >
            <h2
              id="kullanan-konular"
              className="font-sans mt-0 text-[10px] font-black text-blue-900/80 uppercase tracking-[0.2em] mb-4"
            >
              Bu kaynakçayı kullanan konular · {konular.length}
            </h2>
            <ul className="space-y-1 text-sm">
              {konular.map((k) => (
                <li key={`${k.brans}/${k.slug}`}>
                  <Link
                    href={`/topics/${k.brans}/${k.slug}`}
                    className="inline-flex min-h-[32px] items-center text-blue-800 underline decoration-blue-200 underline-offset-2 hover:text-blue-950"
                  >
                    {k.baslik}
                  </Link>
                  <span className="text-slate-600"> · {getSpecialty(k.brans).title}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
