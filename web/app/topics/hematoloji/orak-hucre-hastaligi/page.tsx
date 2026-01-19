import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/hematoloji/orak-hucre-hastaligi/genel-bakis","title":"Genel Bakış"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/epidemiyoloji","title":"Epidemiyoloji"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/patogenez","title":"Patogenez / İmmünoloji"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/klinik-bulgular","title":"Klinik Bulgular"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/siniflama-tani-kriterleri","title":"Sınıflama ve Tanı Kriterleri"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/laboratuvar-goruntuleme","title":"Laboratuvar ve Görüntüleme"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/ayirici-tani","title":"Ayırıcı Tanı"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/tedavi-yaklasimi","title":"Tedavi Yaklaşımı"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/komorbidite-komplikasyon","title":"Komorbiditeler ve Komplikasyonlar"},{"href":"/topics/hematoloji/orak-hucre-hastaligi/ozel-durumlar","title":"Özel Durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Orak Hücre Hastalığı — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/hematoloji/orak-hucre-hastaligi" />
</main>

  );
}




