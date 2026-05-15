import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCanonical, localize, getSectionTopics } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: {
    section: string;
    slug: string;
  };
};

export default async function TopicPage({ params }: Props) {
  // 1. Mevcut konuyu yükle
  const canonicalDoc = await loadCanonical(params.section, params.slug);
  if (!canonicalDoc) return notFound();

  const doc = await localize(canonicalDoc, "tr");

  // 2. BU KONUNUN ÇOCUKLARINI BUL (Alt Başlıklar)
  // @ts-ignore
  const allTopics = await getSectionTopics(params.section);
  
  // "Benim slug'ım, kimin parent'ı?" sorusunun cevabı:
  const children = allTopics.filter((t: any) => t.meta?.parent === params.slug);
  
  // Çocukları sırala
  children.sort((a: any, b: any) => (a.meta?.order || 999) - (b.meta?.order || 999));

  // 3. Babayı bul (Geri dön butonu için)
  const parentSlug = doc.meta?.parent;
  let backLink = `/tr/topics/${params.section}`;
  let backText = "Bölüm Ana Sayfası";
  
  if (parentSlug) {
     const parentTopic = allTopics.find((t:any) => t.slug === parentSlug);
     backLink = `/tr/topics/${params.section}/${parentSlug}`;
     backText = parentTopic ? parentTopic.title : "Üst Başlık";
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 sm:px-0">
      
      {/* 🔙 GERİ DÖN BUTONU */}
      <div className="mb-6">
        <Link href={backLink} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
          <span>←</span> {backText}na Geri Dön
        </Link>
      </div>

      {/* BAŞLIK */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-4">{doc.title}</h1>
        <div className="flex gap-2">
           {doc.meta?.tags?.map((tag) => (
             <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
               {tag}
             </span>
           ))}
        </div>
      </div>

      {/* 🔥 EĞER ALT KONULAR VARSA: LİSTELE (NAVİGASYON MODU) 🔥 */}
      {children.length > 0 ? (
        <div className="mb-12">
           <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
             İçindekiler / Alt Bölümler
           </h2>
           
           <div className="grid gap-3">
             {children.map((child: any, index: number) => (
               <Link 
                 key={child.slug} 
                 href={`/tr/topics/${params.section}/${child.slug}`} // 👈 Tıklayınca yine bu sayfayı çalıştırır (Recursive)
                 className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
               >
                 <div className="flex items-center gap-4">
                    {/* Alt başlık numarası */}
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {child.meta?.order || index + 1}
                    </span>
                    <div>
                      <span className="text-lg font-bold text-slate-800 group-hover:text-blue-700 block">
                        {child.title}
                      </span>
                      {/* Kısa açıklama varsa göster */}
                      {child.summary && <span className="text-sm text-slate-400 font-normal line-clamp-1">{child.summary}</span>}
                    </div>
                 </div>
                 <span className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
               </Link>
             ))}
           </div>
           
           {/* Ayırıcı Çizgi */}
           <div className="my-10 border-t border-slate-100"></div>
        </div>
      ) : null}

      {/* İÇERİK METNİ (Varsa Göster) */}
      <div className="prose prose-slate prose-lg max-w-none">
        {doc.sections.map((section, idx) => (
          <section key={idx} className="mb-8">
            {section.heading && (
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {section.heading}
              </h2>
            )}
            <div dangerouslySetInnerHTML={{ __html: section.text }} />
          </section>
        ))}
      </div>

    </div>
  );
}