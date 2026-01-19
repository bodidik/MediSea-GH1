import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"title":"Özofagus Hastalıkları","href":"/topics/gastroenteroloji/ozofagus-hastaliklari"},{"title":"Mide ve Duodenum Hastalıkları","href":"/topics/gastroenteroloji/mide-ve-duodenum-hastaliklari"},{"title":"Helicobacter pylori","href":"/topics/gastroenteroloji/helicobacter-pylori"},{"title":"İnflamatuar Bağırsak Hastalığı (IBD)","href":"/topics/gastroenteroloji/inflamatuar-bagirsak-hastaligi-ibd"},{"title":"İrritabl Bağırsak Sendromu (IBS)","href":"/topics/gastroenteroloji/irritabl-bagirsak-sendromu-ibs"},{"title":"Hepatitler ve Karaciğer Hastalıkları","href":"/topics/gastroenteroloji/hepatitler-ve-karaciger-hastaliklari"},{"title":"Siroz ve Komplikasyonları","href":"/topics/gastroenteroloji/siroz-ve-komplikasyonlari"},{"title":"Pankreatit ve Pankreas Hastalıkları","href":"/topics/gastroenteroloji/pankreatit-ve-pankreas-hastaliklari"},{"title":"Safra Yolları ve Safra Kesesi Hastalıkları","href":"/topics/gastroenteroloji/safra-yollari-ve-safra-kesesi"},{"title":"GİS Kanamaları","href":"/topics/gastroenteroloji/gis-kanamalari"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gastroenteroloji — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/topics/gastroenteroloji" premiumHref="/premium/ydus" premiumLabel="PREMİUM YDUS" />
</main>
  );
}




