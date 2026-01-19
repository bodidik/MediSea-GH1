import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";

const TOPICS = [
  { slug: "sistemik-lupus-eritematozus", title: "Sistemik Lupus Eritematozus (SLE)" },
  { slug: "romatoid-artrit",             title: "Romatoid Artrit" },
  { slug: "sistemik-skleroz",            title: "Sistemik Skleroz (Skleroderma)" },
  { slug: "mikst-bag-dokusu-hastaligi",  title: "Mikst Bağ Dokusu Hastalığı (MCTD)" },
  { slug: "behcet",                      title: "Behçet Sendromu" },
  { slug: "vaskulit-sindromlari",        title: "Vaskülit Sendromları" },
  { slug: "sjogrens-hastaligi",          title: "Sjögren Hastalığı" },
  { slug: "inflamatuvar-miyopatiler",    title: "İnflamatuvar Miyopatiler" }
];

export default function RomatolojiIndex() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Romatoloji — Konu Dizini</h1>
      <p className="opacity-70 mb-4">Statik dizin; her başlık kendi sayfasına gider.</p>
      <ul className="list-disc pl-5 space-y-1">
        {TOPICS.map((it) => (
          <li key={it.slug}>
            <Link href={`/topics/romatoloji/${it.slug}`} className="underline">{it.title}</Link>
          </li>
        ))}
      </ul>
      <ChildLinks appSubPath="topics/(static)/romatoloji" />
</main>

  );
}




