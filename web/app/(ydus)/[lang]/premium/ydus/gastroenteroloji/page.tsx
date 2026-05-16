'use client';
import { useState } from 'react';
import BranchTemplate from '../components/BranchTemplate'; // Bileşeni içe aktar

const GASTRO_DATA = {
  title: "Gastroenteroloji",
  slug: "gastroenteroloji",
  color: "orange",
  icon: "🩺",
  categories: [
    {
      id: "hepatoloji",
      title: "Hepatoloji",
      icon: "🧪",
      desc: "Siroz, Hepatitler ve Karaciğer Tümörleri",
      items: [
        { title: "Siroz Komplikasyonları", href: "#", isReady: false, badges: ["KRİTİK"] },
        { title: "Kronik Hepatit Yönetimi", href: "#", isReady: false, badges: ["YENİ"] },
      ]
    }
  ]
};

export default function GastroPage() {
  const [openCategory, setOpenCategory] = useState<string | null>("hepatoloji");

  return (
    <BranchTemplate 
      data={GASTRO_DATA} 
      openCategory={openCategory} 
      setOpenCategory={setOpenCategory} 
    />
  );
}