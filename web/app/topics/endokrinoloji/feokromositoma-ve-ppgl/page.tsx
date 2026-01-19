import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/genel-bakis","title":"Genel Bakış"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/epidemiyoloji","title":"Epidemiyoloji"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/patogenez","title":"Patogenez / Fizyoloji"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/klinik-bulgular","title":"Klinik Bulgular"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/siniflama-tani-kriterleri","title":"Sınıflama ve Tanı Kriterleri"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/laboratuvar-goruntuleme","title":"Laboratuvar ve Görüntüleme"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/ayirici-tani","title":"Ayırıcı Tanı"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/tedavi-yaklasimi","title":"Tedavi Yaklaşımı"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/komorbidite-komplikasyon","title":"Komorbiditeler ve Komplikasyonlar"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl/ozel-durumlar","title":"Özel Durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Feokromositoma ve PPGL — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/endokrinoloji/feokromositoma-ve-ppgl" />
</main>

  );
}




