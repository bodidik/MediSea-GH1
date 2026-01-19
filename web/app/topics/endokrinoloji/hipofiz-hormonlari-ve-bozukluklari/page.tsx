import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/genel-bakis","title":"Genel Bakış"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/epidemiyoloji","title":"Epidemiyoloji"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/patogenez","title":"Patogenez / Fizyoloji"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/klinik-bulgular","title":"Klinik Bulgular"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/siniflama-tani-kriterleri","title":"Sınıflama ve Tanı Kriterleri"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/laboratuvar-goruntuleme","title":"Laboratuvar ve Görüntüleme"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/ayirici-tani","title":"Ayırıcı Tanı"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/tedavi-yaklasimi","title":"Tedavi Yaklaşımı"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/komorbidite-komplikasyon","title":"Komorbiditeler ve Komplikasyonlar"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari/ozel-durumlar","title":"Özel Durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Hipofiz Hormonları ve Bozuklukları — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari" />
</main>

  );
}




