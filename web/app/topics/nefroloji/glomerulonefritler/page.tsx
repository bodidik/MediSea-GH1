import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/nefroloji/glomerulonefritler/genel-bakis","title":"Genel Bakış"},{"href":"/topics/nefroloji/glomerulonefritler/epidemiyoloji","title":"Epidemiyoloji"},{"href":"/topics/nefroloji/glomerulonefritler/patogenez","title":"Patogenez / Fizyoloji"},{"href":"/topics/nefroloji/glomerulonefritler/klinik-bulgular","title":"Klinik Bulgular"},{"href":"/topics/nefroloji/glomerulonefritler/siniflama-tani-kriterleri","title":"Sınıflama ve Tanı Kriterleri"},{"href":"/topics/nefroloji/glomerulonefritler/laboratuvar-goruntuleme","title":"Laboratuvar ve Görüntüleme"},{"href":"/topics/nefroloji/glomerulonefritler/ayirici-tani","title":"Ayırıcı Tanı"},{"href":"/topics/nefroloji/glomerulonefritler/tedavi-yaklasimi","title":"Tedavi Yaklaşımı"},{"href":"/topics/nefroloji/glomerulonefritler/komorbidite-komplikasyon","title":"Komorbiditeler ve Komplikasyonlar"},{"href":"/topics/nefroloji/glomerulonefritler/ozel-durumlar","title":"Özel Durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Glomerülonefritler — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/nefroloji/glomerulonefritler" />
</main>

  );
}




