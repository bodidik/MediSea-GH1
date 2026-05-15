// FILE: web/app/components/SiteHeader.tsx
"use client";
import Link from "next/link";
import React from "react";

export default function SiteHeader(){
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-tight">MediSea</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/sections" className="hover:underline">BÃ¶lÃ¼mler</Link>
          <Link href="/programs" className="hover:underline">Programlar</Link>
          <Link href="/tools" className="hover:underline">AraÃ§lar</Link>
          <Link href="/premium" className="px-3 py-1 rounded-lg border hover:bg-gray-50">Premium</Link>
        </nav>
      </div>
    </header>
  );
}



