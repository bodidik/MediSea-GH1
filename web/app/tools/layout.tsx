import React from "react";
import AdBanner from "@/app/tools/components/AdBanner";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Reklam / duyuru bandı — her araç sayfasında otomatik gösterilir */}
      <div className="max-w-3xl mx-auto px-4 pb-8 -mt-2">
        <AdBanner />
      </div>
    </>
  );
}
