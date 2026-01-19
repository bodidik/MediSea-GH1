import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"title":"Genel Bakış","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/genel-bakis"},{"title":"Epidemiyoloji","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/epidemiyoloji"},{"title":"Patogenez / Fizyoloji","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/patogenez"},{"title":"Klinik Bulgular","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/klinik-bulgular"},{"title":"Sınıflama ve Tanı Kriterleri","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/siniflama-tani-kriterleri"},{"title":"Laboratuvar ve Görüntüleme","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/laboratuvar-goruntuleme"},{"title":"Ayırıcı Tanı","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/ayirici-tani"},{"title":"Tedavi Yaklaşımı","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/tedavi-yaklasimi"},{"title":"Komorbiditeler ve Komplikasyonlar","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/komorbidite-komplikasyon"},{"title":"Özel Durumlar","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari/ozel-durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mide ve Duodenum Hastalıkları — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/gastroenteroloji/mide-ve-duodenum-hastaliklari" />
</main>

  );
}




