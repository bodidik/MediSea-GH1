import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/nefroloji/elektrolit-bozukluklari/genel-bakis","title":"Genel Bakış"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/epidemiyoloji","title":"Epidemiyoloji"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/patogenez","title":"Patogenez / Fizyoloji"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/klinik-bulgular","title":"Klinik Bulgular"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/siniflama-tani-kriterleri","title":"Sınıflama ve Tanı Kriterleri"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/laboratuvar-goruntuleme","title":"Laboratuvar ve Görüntüleme"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/ayirici-tani","title":"Ayırıcı Tanı"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/tedavi-yaklasimi","title":"Tedavi Yaklaşımı"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/komorbidite-komplikasyon","title":"Komorbiditeler ve Komplikasyonlar"},{"href":"/topics/nefroloji/elektrolit-bozukluklari/ozel-durumlar","title":"Özel Durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Elektrolit Bozuklukları — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/nefroloji/elektrolit-bozukluklari" />
</main>

  );
}




