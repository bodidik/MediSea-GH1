import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"href":"/topics/endokrinoloji/endokrin-hastaliklara-yaklasim","title":"Endokrin Hastalıklara Yaklaşım"},{"href":"/topics/endokrinoloji/hipofiz-hormonlari-ve-bozukluklari","title":"Hipofiz Hormonları ve Bozuklukları"},{"href":"/topics/endokrinoloji/hipopituitarizm-ve-hiperprolaktinemi","title":"Hipopituitarizm ve Hiperprolaktinemi"},{"href":"/topics/endokrinoloji/tiroid-hastaliklari-hipo-hiper","title":"Tiroid Hastalıkları (Hipo/Hiper)"},{"href":"/topics/endokrinoloji/tiroid-nodulu-ve-karsinom","title":"Tiroid Nodülü ve Karsinom"},{"href":"/topics/endokrinoloji/adrenal-korteks-bozukluklari","title":"Adrenal Korteks Bozuklukları"},{"href":"/topics/endokrinoloji/feokromositoma-ve-ppgl","title":"Feokromositoma ve PPGL"},{"href":"/topics/endokrinoloji/multiple-endokrin-neoplaziler-men","title":"Multiple Endokrin Neoplaziler (MEN)"},{"href":"/topics/endokrinoloji/otoimmun-poliyendokrin-sendromlar","title":"Otoimmün Poliyendokrin Sendromlar"},{"href":"/topics/endokrinoloji/seks-ve-ureme-sagligi-endokrin","title":"Cinsiyet ve Üreme Endokrinolojisi (Özet)"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Endokrinoloji — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/topics/endokrinoloji" premiumHref="/premium/ydus" premiumLabel="PREMİUM YDUS" />
</main>
  );
}




