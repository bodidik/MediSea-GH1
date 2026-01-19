export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";

const TOPICS = [
  { slug: "giris-bagisiklik", title: "Bağışıklık Sistemine Giriş" },
  { slug: "bagisiklik-disregulasyon", title: "Bağışıklık Düzenlenmesi ve Bozuklukları" },
  { slug: "primer-immundefisit", title: "Primer İmmün Yetmezlikler" },
  { slug: "urtiker-anjioedema", title: "Ürtiker, Anjiyoödem, Allerjik Rinit" },
  { slug: "anafilaksi", title: "Anafilaksi" },
  { slug: "desensitizasyon", title: "Desensitizasyon" },
  { slug: "mastositoz", title: "Mastositoz" },
  { slug: "otoimmunite", title: "Otoimmünite ve Otoimmün Hastalıklar" },
  { slug: "sistemik-lupus-eritematozus", title: "Sistemik Lupus Eritematozus (SLE)" },
  { slug: "antifosfolipid-sendromu", title: "Antifosfolipid Sendromu" },
  { slug: "romatoid-artrit", title: "Romatoid Artrit" },
  { slug: "akut-romatizmal-ates", title: "Akut Romatizmal Ateş" },
  { slug: "sistemik-skleroz", title: "Sistemik Skleroz (Skleroderma)" },
  { slug: "sjogren", title: "Sjögren Sendromu" },
  { slug: "spondiloartrit", title: "Spondiloartrit" },
  { slug: "vaskulit-sendromlari", title: "Vaskülit Sendromları" },
  { slug: "behcet", title: "Behçet Sendromu" },
  { slug: "inflamatuvar-myopatiler", title: "İnflamatuvar Myopatiler" },
  { slug: "relapsing-polichondritis", title: "Relapsing Polikondrit" },
  { slug: "sarkoidoz", title: "Sarkoidoz" },
  { slug: "igg4-iliskili-hastalik", title: "IgG4-İlişkili Hastalık" },
  { slug: "fmf-otoenflamatuvar", title: "FMF ve Otoenflamatuvar Hastalıklar" },
  { slug: "osteoartrit", title: "Osteoartrit" },
  { slug: "gut-ve-kristal-artrit", title: "Gut ve Kristal Artritler" },
  { slug: "fibromiyalji", title: "Fibromiyalji" },
  { slug: "sistemik-arthritler", title: "Sistemik Hastalıklara Bağlı Artritler" },
  { slug: "periartikuler-bozukluklar", title: "Periartiküler Bozukluklar" }
];

export default function RomatolojiIndex() {
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Romatoloji — Konu Dizini</h1>
        <p className="text-gray-600 mt-2">
          Bu bölümde Harrison ve temel kaynaklardan uyarlanan romatoloji konuları listelenmiştir.
          Her başlık kendi sayfasına yönlendirir.
        </p>
      </header>

      <ul className="list-disc pl-5 space-y-1">
        {TOPICS.map(item => (
          <li key={item.slug}>
            <Link href={`./${item.slug}`} className="underline">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


