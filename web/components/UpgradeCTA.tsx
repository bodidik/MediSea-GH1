"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UpgradeCTA() {
  const pathname = usePathname();

  // URL'den branşı bulma mantığı (örneğin: /topics/nefroloji/kbh -> nefroloji)
  // pathname'i parçalıyoruz.
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Eğer rotada "topics" varsa, bir sonraki kelime branştır.
  const topicsIndex = pathParts.indexOf("topics");
  let branch = "genel"; // Varsayılan değer
  let displayBranch = "MEDISEA";

  if (topicsIndex !== -1 && pathParts.length > topicsIndex + 1) {
    branch = pathParts[topicsIndex + 1];
    
    // URL'deki (örneğin "gastroenteroloji") ismini güzel (Gastroenteroloji) gösterecek ufak sözlük
    const branchNames: Record<string, string> = {
      "hematoloji": "HEMATOLOJİ",
      "romatoloji": "ROMATOLOJİ",
      "gastroenteroloji": "GASTROENTEROLOJİ",
      "nefroloji": "NEFROLOJİ",
      "endokrinoloji": "ENDOKRİNOLOJİ",
      "kardiyoloji": "KARDİYOLOJİ",
      "enfeksiyon": "ENFEKSİYON",
      "gogus": "GÖĞÜS HASTALIKLARI",
      "onkoloji": "ONKOLOJİ"
    };

    displayBranch = branchNames[branch] || branch.toUpperCase();
  }

  // YDUS premium alanına gidecek link
  const upgradeLink = branch === "genel" ? "/tr/premium/ydus" : `/tr/premium/ydus/${branch}`;

  return (
    <div className="mt-8 rounded-[1.5rem] bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900/50 p-6 relative overflow-hidden group shadow-xl">
      
      {/* Arka plan süslemeleri */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">⚓</span>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Premium Modül</span>
        </div>
        
        {/* DİNAMİK BRANŞ BAŞLIĞI */}
        <h4 className="text-xl font-black text-white italic tracking-tighter mb-2">
          YDUS {displayBranch}
        </h4>
        
        <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">
          Uzmanlık düzeyinde klinik inciler, vaka simülasyonları ve YDUS algoritmaları için bu filoya katılın.
        </p>

        {/* DİNAMİK LİNK */}
        <Link 
          href={upgradeLink}
          className="inline-flex items-center justify-between w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-widest transition-all group/btn"
        >
          <span>İncele</span>
          <span className="text-amber-400 group-hover/btn:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}