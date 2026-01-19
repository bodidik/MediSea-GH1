import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/nefroloji/akut-bobrek-hasari-aki","title":"Akut Böbrek Hasarı (AKI)"},{"href":"/topics/nefroloji/kronik-bobrek-hastaligi-kbh","title":"Kronik Böbrek Hastalığı (KBH)"},{"href":"/topics/nefroloji/glomerulonefritler","title":"Glomerülonefritler"},{"href":"/topics/nefroloji/nefrotik-sendrom","title":"Nefrotik Sendrom"},{"href":"/topics/nefroloji/tubulointerstisyel-nefrit","title":"Tübülointerstisyel Nefrit"},{"href":"/topics/nefroloji/elektrolit-bozukluklari","title":"Elektrolit Bozuklukları"},{"href":"/topics/nefroloji/asit-baz-bozukluklari","title":"Asit–Baz Bozuklukları"},{"href":"/topics/nefroloji/diyaliz-ve-rrt","title":"Diyaliz ve Renal Replasman Tedavileri"},{"href":"/topics/nefroloji/renal-transplantasyon","title":"Renal Transplantasyon"},{"href":"/topics/nefroloji/polikistik-bobrek-hastaligi-adpkd","title":"Polikistik Böbrek Hastalığı (ADPKD)"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nefroloji — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/topics/nefroloji" premiumHref="/premium/ydus" premiumLabel="PREMİUM YDUS" />
</main>
  );
}




