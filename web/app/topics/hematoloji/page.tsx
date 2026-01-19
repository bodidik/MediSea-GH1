import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

type Item = { href: string; title: string; slug: string };
const items: Item[] = [{"href":"/topics/hematoloji/b12-folat-eksikligi-anemileri","title":"B12 Folat Eksikligi Anemileri","slug":"b12-folat-eksikligi-anemileri"},{"href":"/topics/hematoloji/demir-eksikligi-anemisi","title":"Demir Eksikligi Anemisi","slug":"demir-eksikligi-anemisi"},{"href":"/topics/hematoloji/hemolitik-anemiler","title":"Hemolitik Anemiler","slug":"hemolitik-anemiler"},{"href":"/topics/hematoloji/kanama-bozukluklari-hemofili-vwd","title":"Kanama Bozukluklari Hemofili Vwd","slug":"kanama-bozukluklari-hemofili-vwd"},{"href":"/topics/hematoloji/lenfomalar","title":"Lenfomalar","slug":"lenfomalar"},{"href":"/topics/hematoloji/multiple-myelom-ve-mgüs","title":"Multiple Myelom Ve MGÜS","slug":"multiple-myelom-ve-mgüs"},{"href":"/topics/hematoloji/orak-hucre-hastaligi","title":"Orak Hucre Hastaligi","slug":"orak-hucre-hastaligi"},{"href":"/topics/hematoloji/talasemi-ve-hemoglobinopatiler","title":"Talasemi Ve Hemoglobinopatiler","slug":"talasemi-ve-hemoglobinopatiler"},{"href":"/topics/hematoloji/trombositopeniler-ve-itp","title":"Trombositopeniler Ve İtp","slug":"trombositopeniler-ve-itp"},{"href":"/topics/hematoloji/tromboz-ve-trombofili","title":"Tromboz Ve Trombofili","slug":"tromboz-ve-trombofili"}];

// Basit grup: Baş harfe göre (A–Z)
const grouped = items.reduce((acc: Record<string, Item[]>, it) => {
  const key = (it.title?.[0] || '#').toUpperCase();
  acc[key] = acc[key] || [];
  acc[key].push(it);
  return acc;
}, {});
Object.keys(grouped).forEach(k => grouped[k].sort((a,b)=>a.title.localeCompare(b.title,'tr')));

export default function Page() {
  const letters = Object.keys(grouped).sort((a,b)=>a.localeCompare(b,'tr'));
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Hematoloji — Konu Dizini</h1>
      <p className="opacity-70 mb-4">
        Aşağıda hematoloji başlıklarının alfabetik dizini yer alır. Her başlık kendi alt sayfalarına ayrılır
        (Genel Bakış, Patogenez, Klinik, Tanı, Tedavi vb.).
      </p>

      {/* Hızlı atlama */}
      <nav className="flex flex-wrap gap-2 mb-6">
        {letters.map(L => (
          <a key={L} className="text-sm underline" href={"#sec-"+L}>{L}</a>
        ))}
      </nav>

      {/* Gruplar */}
      <div className="space-y-8">
        {letters.map(L => (
          <section key={L} id={"sec-"+L}>
            <h2 className="text-xl font-semibold mb-3">{L}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped[L].map(it => (
                <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-xs opacity-60">{it.slug}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <ChildLinks appSubPath="topics/topics/hematoloji" premiumHref="/premium/ydus" premiumLabel="PREMİUM YDUS" />
</main>
  );
}





