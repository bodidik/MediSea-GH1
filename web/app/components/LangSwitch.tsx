"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { setLang, getLangFromCookie, type Lang } from "@/app/lib/i18n";

function swapLangInPath(pathname: string, next: Lang) {
  if (pathname === "/tr" || pathname.startsWith("/tr/")) {
    return "/" + next + pathname.slice(3);
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "/" + next + pathname.slice(3);
  }
  return "/" + next;
}

export default function LangSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setL] = React.useState<Lang>(() => getLangFromCookie());

  const go = (next: Lang) => {
    setLang(next);
    setL(next);
    const target = swapLangInPath(pathname || "/", next);
    router.push(target);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => go("tr")}
        className={`px-2 py-1 rounded ${
          lang === "tr" ? "border font-semibold" : "border-transparent"
        }`}
      >
        TR
      </button>

      <button
        type="button"
        onClick={() => go("en")}
        className={`px-2 py-1 rounded ${
          lang === "en" ? "border font-semibold" : "border-transparent"
        }`}
      >
        EN
      </button>
    </div>
  );
}
