// C:\Users\hucig\Medknowledge\web\app\(site)\topics\[slug]\page.tsx"
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

// 🚀 Önbellek sorunlarını önlemek için eklendi
export const dynamic = "force-dynamic";

export default async function BranchListPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const branchDir = path.join(process.cwd(), "content", "canonical", slug);

  if (!fs.existsSync(branchDir)) return notFound();

  // 1. Ham dosyaları al
  const files = fs.readdirSync(branchDir).filter((f) => f.endsWith(".json"));

  // 2. Normalizasyon ve ZIRHLI OKUMA (Hata Toleransı)
  const topicList = files
    .map((file) => {
      const filePath = path.join(branchDir, file);

      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const content = JSON.parse(raw);

        return {
          slug: file.replace(".json", ""),
          title: content.title || file.replace(".json", ""),
          order: Number(content.meta?.order ?? 999),
          // 🚀 YENİ: Babanın kim olduğunu öğreniyoruz
          parent: content.meta?.parent || null, 
        };
      } catch (err) {
        // Bozuk JSON sistemi çökertmez, sadece loglanır ve atlanır
        console.error(`⚠️ Bozuk JSON atlandı: ${filePath}`, err);
        return null;
      }
    })
    .filter(Boolean) as { slug: string; title: string; order: number; parent: string | null }[];

  // 3. Stabil Sıralama: Önce Order (Sayısal), sonra Alfabetik (Türkçe-Base)
  topicList.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, "tr", { sensitivity: "base" });
  });

  // 🚀 4. YENİ: SADECE ANA KONULARI FİLTRELE (Alt konular burada görünmesin)
  const mainTopics = topicList.filter(t => !t.parent);

  return (
    <div className="min-h-screen bg-white py-16 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b-4 border-blue-900/10 pb-10 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-blue-900 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.4em]">
                Klinik Arşiv / {slug}
              </span>
            </div>
            <h1 className="text-5xl font-black text-blue-950 uppercase italic tracking-tighter">
              Kütüphane <span className="text-slate-300 not-italic">Rehberi</span>
            </h1>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {mainTopics.length} ANA BAŞLIK LİSTELENDİ
          </div>
        </div>

        {/* Son Dokunuşunla Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mainTopics.length > 0 ? (
            mainTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${slug}/${topic.slug}`}
                className="group p-3 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-blue-900 hover:bg-white hover:shadow-2xl transition-all duration-300 flex justify-between items-center"
              >
                <div className="flex items-center gap-5">
                  <span className="text-xs font-black text-blue-900/20 group-hover:text-blue-900/40 transition-colors italic">
                    #{topic.order < 999 ? topic.order : "•"}
                  </span>
                  <h3 className="text-xl font-black text-blue-950 uppercase italic group-hover:text-blue-700">
                    {topic.title}
                  </h3>
                </div>
                <div className="text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full p-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-slate-400 font-black uppercase tracking-widest">
                Bu branşta henüz geçerli/kayıtlı konu yok.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}