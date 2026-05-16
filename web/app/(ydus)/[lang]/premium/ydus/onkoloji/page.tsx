'use client';
import { useState } from 'react';
import Link from 'next/link';

const ONKO_DATA = {
  title: "Tıbbi Onkoloji",
  slug: "onkoloji",
  color: "slate",
  icon: "🎗️",
  categories: [
    {
      id: "solid",
      title: "Solid Tümörler",
      icon: "🧫",
      desc: "Meme, Akciğer, GİS ve GU Kanserleri",
      items: [
        { title: "Meme Kanseri Adjuvan Tedavi", href: "#", isReady: false, badges: ["ZOR"] },
        { title: "Küçük Hücreli Dışı Akciğer Kanseri", href: "#", isReady: false, badges: ["GÜNCEL"] },
      ]
    },
    {
      id: "destek",
      title: "Destek Tedavi ve Aciller",
      icon: "🆘",
      desc: "Febril Nötropeni, TLS, İmmünoterapi Yan Etkileri",
      items: [
        { title: "Onkolojik İmmünoterapi Toksisiteleri", href: "#", isReady: false, badges: ["YENİ"] },
        { title: "Febril Nötropeni Yönetimi", href: "#", isReady: false, badges: ["ACİL"] },
      ]
    }
  ]
};

export default function OnkoPage() {
  const [openCategory, setOpenCategory] = useState<string | null>("solid");
  return <BranchTemplate data={ONKO_DATA} openCategory={openCategory} setOpenCategory={setOpenCategory} />;
}