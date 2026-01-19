// FILE: web/app/components/HeaderClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { label: string; href: string };
type NavConfig = { topNav: NavLink[]; sections: NavLink[] };

type HeaderClientProps = {
  navConfig?: NavConfig;
};

function detectLangFromPath(pathname: string | null): "tr" | "en" {
  const p = pathname || "/";
  if (p === "/en" || p.startsWith("/en/")) return "en";
  return "tr"; // default
}

function withLangPrefix(href: string, lang: "tr" | "en") {
  // external / hash / mailto / tel
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  // already prefixed
  if (href === "/tr" || href.startsWith("/tr/") || href === "/en" || href.startsWith("/en/")) {
    return href;
  }

  // root "/" should go to "/{lang}" to keep canonical consistent
  if (href === "/") return `/${lang}`;

  // normal absolute internal route
  if (href.startsWith("/")) return `/${lang}${href}`;

  // relative -> treat as absolute
  return `/${lang}/${href}`;
}

export default function HeaderClient({ navConfig }: HeaderClientProps) {
  const pathname = usePathname();
  const lang = detectLangFromPath(pathname);

  const topLinks: NavLink[] =
    navConfig?.topNav ?? [
      { label: "Bölümler", href: "/sections" },
      { label: "Konular", href: "/topics" },
      { label: "Kılavuzlar", href: "/guidelines" },
      { label: "Araçlar", href: "/tools" },
    ];

  return (
    <div className="flex-1 flex items-center justify-center md:justify-between gap-3">
      <nav className="hidden md:flex items-center gap-2">
        {topLinks.map((l) => (
          <Link
            key={l.href}
            href={withLangPrefix(l.href, lang)}
            className="text-sm hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2" />
    </div>
  );
}

