//"C:\Users\hucig\Medknowledge\web\app\(site)\topics\[slug]\[topicSlug]\page.tsx"
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import InlineTopicEditor from "@/components/topics/InlineTopicEditor";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; topicSlug: string }> 
}) {
  const { slug, topicSlug } = await params;
  const branchDir = path.join(process.cwd(), "content", "canonical", slug);
  const filePath = path.join(branchDir, `${topicSlug}.json`);

  if (!fs.existsSync(filePath)) return notFound();

  // 1. Ana Dosyayı Oku
  const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const topicItem = {
    slug: topicSlug,
    title: rawData.title || topicSlug.replace(/-/g, " "),
    summary: rawData.summary || rawData.meta?.summary || "",
    parent: rawData.meta?.parent || null,
    sections: Array.isArray(rawData.sections) 
      ? rawData.sections.map((s: any) => ({
          title: s.heading || s.title || "Başlıksız Blok",
          html: s.text || s.html || "",
          visibility: s.visibility || "V"
        }))
      : []
  };

  // 2. OTOMATİK AĞAÇ YAPISI (Çocuklar ve Torunlar)
  const allFiles = fs.readdirSync(branchDir).filter(f => f.endsWith(".json"));
  
  // Önce klasördeki tüm dosyaların künyesini çıkar
  const allTopics = allFiles.map(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(branchDir, file), "utf-8"));
      return { 
        slug: file.replace(".json", ""), 
        title: content.title, 
        parent: content.meta?.parent || null,
        order: content.meta?.order || 99
      };
    } catch (e) { return null; }
  }).filter(Boolean) as {slug: string, title: string, parent: string | null, order: number}[];

  // Doğrudan çocukları bul ve sıraya (order) göre diz
  const childTopics = allTopics
    .filter(t => t.parent === topicSlug)
    .sort((a, b) => a.order - b.order);

  // Her çocuğun kendi alt çocuklarını (Torunları) bul
  const tree = childTopics.map(child => ({
    ...child,
    grandchildren: allTopics
      .filter(t => t.parent === child.slug)
      .sort((a, b) => a.order - b.order)
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Üst Yönlendirme Çubuğu */}
        <div className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
          <Link href="/topics" className="hover:text-blue-600 transition-colors">Kütüphane</Link>
          <span>/</span>
          <Link href={`/topics/${slug}`} className="hover:text-blue-600 transition-colors">{slug}</Link>
          <span>/</span>
          <span className="text-blue-900">{topicItem.title}</span>
        </div>

        {/* Ana Izgara */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- SOL KOLON: İÇERİK --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border-l-8 border-blue-900 pl-6 py-2">
              <h1 className="text-4xl md:text-5xl font-black text-blue-950 uppercase italic tracking-tighter leading-none mb-3">
                {topicItem.title}
              </h1>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Güncelleme: {rawData.meta?.updatedAt || "06 MAR 2026"}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-8 md:p-12 space-y-10">
              {topicItem.summary && (
                <div className="text-lg text-slate-700 font-medium leading-relaxed bg-blue-50/40 p-6 rounded-3xl border-l-4 border-blue-300">
                  <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.3em] block mb-2">Hızlı Özet</span>
                  <div className="whitespace-pre-wrap">{topicItem.summary}</div>
                </div>
              )}

              {topicItem.sections.length > 0 && (
                <div className="space-y-12">
                  {topicItem.sections.map((section: any, idx: number) => (
                    <section key={idx} className="relative group">
                      {section.visibility !== 'V' && (
                        <span className="absolute -top-4 right-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-amber-100 text-amber-800">
                          {section.visibility === 'M' ? 'Sadece Hekim' : 'Taslak'}
                        </span>
                      )}
                      <h2 className="text-2xl font-black text-blue-950 mb-5 border-b-2 border-slate-100 pb-3 flex items-center gap-3">
                        <span className="text-blue-200">#</span>{section.title}
                      </h2>
                      <div 
                        className="text-slate-600 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-2 [&>strong]:text-blue-950 [&>strong]:font-black"
                        dangerouslySetInnerHTML={{ __html: section.html }}
                      />
                    </section>
                  ))}
                </div>
              )}
            </div>

            {/* İçerik Editörü */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-h-[500px]">
              <InlineTopicEditor item={topicItem} />
            </div>
          </div>

          {/* --- SAĞ KOLON: DİNAMİK SİDEBAR --- */}
          <div className="lg:col-span-4">
            
            <div className="sticky top-32 space-y-8">
              
              {/* Dinamik Alt Menüler (Ağaç Yapısı) */}
              {tree.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b-2 border-slate-100 pb-4 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    İleri Okuma
                  </h3>
                  
                  <ul className="space-y-4">
                    {tree.map(child => (
                      <li key={child.slug} className="flex flex-col gap-2">
                        {/* 1. Kademe (Çocuk) */}
                        <Link 
                          href={`/topics/${slug}/${child.slug}`}
                          className="group flex items-start gap-3 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-blue-300 group-hover:text-blue-500 mt-0.5">↳</span>
                          <span className="leading-tight">{child.title}</span>
                        </Link>
                        
                        {/* 2. Kademe (Torunlar - İç içe liste) */}
                        {child.grandchildren.length > 0 && (
                          <ul className="ml-6 space-y-2 border-l-2 border-slate-100 pl-4 py-1">
                            {child.grandchildren.map(gc => (
                              <li key={gc.slug}>
                                <Link 
                                  href={`/topics/${slug}/${gc.slug}`}
                                  className="group flex items-start gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                                >
                                  <span className="text-slate-300 group-hover:text-blue-400">-</span>
                                  <span className="leading-snug">{gc.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>

                </div>
              )}

              {/* Dinamik YDUS-Premium Tanıtımı */}
             	      <Link href={`/tr/premium/ydus/${slug}`} className="block bg-gradient-to-br from-blue-950 to-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl text-white relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                	      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                
              	       <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-4 block">
               	          MediSea Premium
                       </span>
                
                       <h4 className="text-xl font-black italic uppercase leading-tight mb-3">
                          YDUS {slug.replace(/-/g, ' ')} 
      	           </h4>
                
         	          <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                		 Bu branşla ilgili çıkmış tüm YDUS soruları ve çözümlü vaka analizleri Premium abonelere özel.
                	      </p>
                
                       <div className="inline-block bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full group-hover:bg-white transition-colors">
                          İncele →
           	         </div>
                    </Link>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}