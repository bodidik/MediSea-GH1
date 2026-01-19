import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/genel-bakis","title":"Genel Bakış"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/epidemiyoloji","title":"Epidemiyoloji"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/patogenez","title":"Patogenez / İmmünoloji"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/klinik-bulgular","title":"Klinik Bulgular"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/siniflama-tani-kriterleri","title":"Sınıflama ve Tanı Kriterleri"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/laboratuvar-goruntuleme","title":"Laboratuvar ve Görüntüleme"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/ayirici-tani","title":"Ayırıcı Tanı"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/tedavi-yaklasimi","title":"Tedavi Yaklaşımı"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/komorbidite-komplikasyon","title":"Komorbiditeler ve Komplikasyonlar"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd/ozel-durumlar","title":"Özel Durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Kanama Bozuklukları (Hemofili, vWD) — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/hematoloji/kanama-bozukluklari-hemofili-vwd" />
</main>

  );
}




