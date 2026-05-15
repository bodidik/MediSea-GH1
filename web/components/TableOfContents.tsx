"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TableOfContents() {
  const pathname = usePathname(); // Sayfa değiştiğinde algılamak için
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Sayfa yüklendikten biraz sonra başlıkları tara
    const timer = setTimeout(() => {
      // Sadece ana içerikteki (main) h2 başlıklarını bul
      const elements = Array.from(document.querySelectorAll("main h2"));
      
      const data = elements.map((elem, index) => {
        // Eğer başlığın id'si yoksa ona otomatik id ver
        if (!elem.id) {
          elem.id = `section-${index}`;
        }
        return {
          id: elem.id,
          text: elem.textContent || "",
        };
      });
      
      setHeadings(data);
    }, 150); 

    return () => clearTimeout(timer);
  }, [pathname]); 

  // Scroll yaparken aktif başlığı algıla
  useEffect(() => {
    const handleScroll = () => {
      let currentId = "";
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element && window.scrollY >= element.offsetTop - 100) {
          currentId = heading.id;
        }
      });
      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // Eğer sayfada hiç başlık yoksa bu kutuyu gösterme
  if (headings.length === 0) return null;

  return (
    <div className="pl-1 animate-in fade-in duration-500">
      <h3 className="font-bold text-slate-900 mb-2 text-[10px] uppercase tracking-wider text-gray-400">
        Bu Sayfada
      </h3>
      <div className="border-l border-slate-200 pl-3 space-y-2">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`block text-xs transition-colors duration-200 ${
              activeId === heading.id
                ? "font-bold text-blue-600 border-l-2 border-blue-600 -ml-[13px] pl-2.5"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </div>
  );
}