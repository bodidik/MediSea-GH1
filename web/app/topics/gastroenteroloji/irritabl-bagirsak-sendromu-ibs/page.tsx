import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"title":"Genel Bakış","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/genel-bakis"},{"title":"Epidemiyoloji","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/epidemiyoloji"},{"title":"Patogenez / Fizyoloji","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/patogenez"},{"title":"Klinik Bulgular","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/klinik-bulgular"},{"title":"Sınıflama ve Tanı Kriterleri","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/siniflama-tani-kriterleri"},{"title":"Laboratuvar ve Görüntüleme","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/laboratuvar-goruntuleme"},{"title":"Ayırıcı Tanı","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/ayirici-tani"},{"title":"Tedavi Yaklaşımı","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/tedavi-yaklasimi"},{"title":"Komorbiditeler ve Komplikasyonlar","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/komorbidite-komplikasyon"},{"title":"Özel Durumlar","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs/ozel-durumlar"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">İrritabl Bağırsak Sendromu (IBS) — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs" />
</main>

  );
}




