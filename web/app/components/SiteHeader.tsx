"use client";

// FILE: web/app/components/SiteHeader.tsx
import Link from "next/link";
import navConfig from "@/app/config/nav";
import dynamic from "next/dynamic";

const LangSwitch = dynamic(() => import("./LangSwitch"), { ssr: false });
const HeaderClient = dynamic(() => import("./HeaderClient"), { ssr: false });

export default function SiteHeader() {
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        {/* Sol: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold tracking-tight whitespace-nowrap">
            Medknowledge
          </Link>
        </div>

        {/* Orta: Nav */}
        <HeaderClient navConfig={navConfig} />

        {/* Sağ: Dil anahtarı */}
        <div className="hidden md:block">
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}


