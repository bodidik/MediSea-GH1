'use client';
import { useState } from 'react';
import Link from 'next/link';
import BranchTemplate from '../components/BranchTemplate';

const ROMA_DATA = {
  title: "Romatoloji",
  slug: "romatoloji",
  color: "blue",
  icon: "🦴",
  categories: [
    {
      id: "vaskulitler",
      title: "Vaskülitler",
      icon: "💉",
      desc: "Büyük, Orta ve Küçük Damar Vaskülitleri",
      items: [
        { title: "ANCA İlişkili Vaskülitler (GPA, MPA, EGPA)", href: "#", isReady: false, badges: ["ZOR"] },
        { title: "Behçet Hastalığı Güncel Tedavi", href: "#", isReady: false, badges: ["YENİ"] },
      ]
    },
    {
      id: "bag-doku",
      title: "Bağ Doku Hastalıkları",
      icon: "🧬",
      desc: "SLE, Skleroderma ve İnflamatuar Miyopatiler",
      items: [
        { title: "Sistemik Lupus Eritematozus (Tanı/Tedavi)", href: "#", isReady: false, badges: ["KRİTİK"] },
        { title: "Sistemik Skleroz Komplikasyonları", href: "#", isReady: false, badges: ["YAKINDA"] },
      ]
    }
  ]
};

export default function RomaPage() {
  const [openCategory, setOpenCategory] = useState<string | null>("vaskulitler");
  
  return (
    <BranchTemplate 
      {...({ 
        data: ROMA_DATA, 
        openCategory, 
        setOpenCategory 
      } as any)} 
    />
  );
}