//"C:\Users\hucig\Medknowledge\web\components\TopicSidebar.tsx"
import React from "react";
import Link from "next/link";
import { getSidebarSections } from "@/lib/content";

export default async function TopicSidebar() {
  // Klasörleri getir
  const sections = await getSidebarSections();

  return (
    <nav className="space-y-1">
           
      {sections.map((section) => (
        <Link
          key={section.id}
          href={`/tr/topics/${section.id}`}
          className="group flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors"
        >
          <span className="truncate">{section.label}</span>
          
          {/* Hover olunca beliren küçük ok */}
          <svg 
            className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}

      {sections.length === 0 && (
        <div className="px-3 py-2 text-xs text-red-500 bg-red-50 rounded">
          ⚠️ Klasör bulunamadı
        </div>
      )}
    </nav>
  );
}