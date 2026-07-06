// C:\Users\hucig\Medknowledge\web\app\(site)\topics\[slug]\page.tsx"
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpecialty } from "@/app/lib/specialties";
import { getBranchTools } from "@/app/lib/tools";

export const dynamic = "force-dynamic";

export default async function BranchListPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const branchDir = path.join(process.cwd(), "content", "canonical", slug);

  if (!fs.existsSync(branchDir)) return notFound();

  // Branşın kimlik bilgisi (başlık, ikon, renk) — ana sayfayla aynı ortak kaynaktan
  const specialty = getSpecialty(slug);
  // Bu branşla ilişkili klinik hesaplayıcılar (varsa) — ana sayfadaki "Hızlı Erişim" ile aynı mantık
  const branchTools = getBranchTools(slug);

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
          parent: content.meta?.parent || null,
          hidden: content.meta?.hidden || false,
        };
      } catch (err) {
        // Bozuk JSON sistemi çökertmez, sadece loglanır ve atlanır
        console.error(`⚠️ Bozuk JSON atlandı: ${filePath}`, err);
        return null;
      }
    })
    .filter(Boolean) as { slug: string; title: string; order: number; parent: string | null; hidden: boolean }[];

  // 3. Stabil Sıralama: Önce Order (Sayısal), sonra Alfabetik (Türkçe-Base)
  topicList.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, "tr", { sensitivity: "base" });
  });

  // 4. SADECE ANA KONULARI LİSTELE (Alt konular burada görünmesin — onlar konu
  // detay sayfasındaki "Alt Başlıklar" menüsünde / "İleri Okuma"da yer alır)
  const mainTopics = topicList.filter(t => !t.parent && !t.hidden);

  // Her ana konunun kendi alt konusu var mı? (kaç tane) — kompakt kartta rozet olarak gösterilir
  const childCounts: Record<string, number> = {};
  for (const t of topicList) {
    if (t.parent && !t.hidden) {
      childCounts[t.parent] = (childCounts[t.parent] || 0) + 1;
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* --- BRANŞ HERO (branşın kendi renk/ikon kimliğiyle) --- */}
      <div className={`relative overflow-hidden border-b-4 border-slate-100 ${specialty.bg}`}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-10">

          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-blue-700 transition-colors">MediSea</Link>
            <span>/</span>
            <Link href="/topics" className="hover:text-blue-700 transition-colors">Kütüphane</Link>
            <span>/</span>
            <span className="text-blue-900">{specialty.title}</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              {specialty.icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black text-blue-950 uppercase italic tracking-tighter leading-none truncate">
                {specialty.title}
              </h1>
              {specialty.desc && (
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1.5">{specialty.desc}</p>
              )}
            </div>
            <div className="ml-auto hidden sm:block text-right shrink-0">
              <div className="text-2xl font-black text-blue-950 leading-none">{mainTopics.length}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ana Konu</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KONU GRID (kompakt, ana sayfayla aynı kart dili) --- */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
        {mainTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {mainTopics.map((topic) => {
              const subCount = childCounts[topic.slug] || 0;
              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${slug}/${topic.slug}`}
                  className={`group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${specialty.color}`}
                >
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-400 transition-colors italic shrink-0 w-6 text-center">
                    {topic.order < 999 ? topic.order : "•"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-black text-blue-950 uppercase italic tracking-tight leading-tight truncate">
                      {topic.title}
                    </h3>
                    {subCount > 0 && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {subCount} alt başlık
                      </p>
                    )}
                  </div>
                  <svg className={`w-4 h-4 shrink-0 text-slate-300 group-hover:translate-x-0.5 transition-all ${specialty.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <p className="text-slate-400 font-black uppercase tracking-widest">
              Bu branşta henüz geçerli/kayıtlı konu yok.
            </p>
          </div>
        )}

        {/* İLGİLİ HESAPLAYICILAR (branşla eşleşen varsa) — ana sayfadaki Hızlı Erişim ile aynı dil */}
        {branchTools.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
              <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.2em] px-3 border-r border-slate-200 hidden md:block shrink-0">
                İlgili Hesaplayıcılar
              </span>
              {branchTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl border border-slate-100 hover:border-yellow-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group whitespace-nowrap"
                >
                  <span className="text-sm">{tool.icon}</span>
                  <span className="text-[11px] font-bold text-blue-950">{tool.name}</span>
                </Link>
              ))}
              <Link href="/tools" className="shrink-0 text-[11px] font-black text-blue-600 px-3 hover:underline uppercase tracking-tighter whitespace-nowrap">
                Tümü →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
