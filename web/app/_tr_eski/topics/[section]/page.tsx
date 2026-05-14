import React from "react";
import Link from "next/link";
import { getSectionTopics } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: { section: string; }; };

export default async function SectionListPage({ params }: Props) {
  // 1. Tüm konuları getir
  // @ts-ignore
  const allTopics = await getSectionTopics(params.section);

  // 2. 🧹 FİLTRELEME: Sadece "Parent"ı OLMAYANLARI (Dedeleri) al.
  // Eğer bir dosyanın 'parent' satırı doluysa, onu bu listeden AT.
  const rootTopics = allTopics.filter((t: any) => !t.meta?.parent || t.meta.parent.trim() === "");

  // 3. Sıralama (Order)
  rootTopics.sort((a: any, b: any) => (a.meta?.order || 999) - (b.meta?.order || 999));

  const sectionTitle = params.section.charAt(0).toUpperCase() + params.section.slice(1);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-0">
      
      {/* BAŞLIK ALANI */}
      <div className="border-b border-slate-200 py-10 mb-8">
         <h1 className="text-4xl font-black text-slate-900 mb-2">{sectionTitle}</h1>
         <p className="text-slate-500 text-lg">Klinik Rehberler ve Bölüm Ana Başlıkları</p>
      </div>

      {/* SADECE ANA KATEGORİLER LİSTESİ */}
      <div className="grid gap-4">
        {rootTopics.map((topic: any) => (
          <Link 
            key={topic.slug} 
            href={`/tr/topics/${params.section}/${topic.slug}`} // 👈 Tıklayınca Yeni Sayfaya Git
            className="group flex items-start gap-6 p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all"
          >
            {/* Numara / İkon Kutusu */}
            <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-blue-600 text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                {topic.meta?.order ? (
                  <span className="text-2xl font-black">{topic.meta.order}</span>
                ) : (
                  <span className="text-xl font-bold">{topic.title.charAt(0)}</span>
                )}
            </div>

            {/* İçerik */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {topic.title}
              </h3>
              <p className="text-slate-500 mt-2 line-clamp-2">
                {topic.summary || "Bu bölümün alt başlıklarını incelemek için tıklayınız."}
              </p>
              
              <div className="mt-3 flex items-center text-sm font-bold text-blue-600">
                Alt Başlıkları Gör <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}

        {rootTopics.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-slate-500">Bu bölümde henüz ana başlık bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}