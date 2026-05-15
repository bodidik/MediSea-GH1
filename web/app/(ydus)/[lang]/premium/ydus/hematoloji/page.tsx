'use client';
import BranchTemplate from '../components/BranchTemplate';

const DATA = {
  title: "Hematoloji",
  color: "rose",
  icon: "🩸",
  categories: [
    {
      id: "losemiler",
      title: "Lösemiler",
      icon: "🩸",
      desc: "Akut ve Kronik Lösemiler, Blastik Kriz",
      items: [
        { title: "Akut Myeloid Lösemi (AML)", href: "/tr/premium/ydus/hematoloji/aml", isReady: true, badges: ["POPÜLER", "ZOR"] },
        { title: "Kronik Myeloid Lösemi (KML)", href: "/tr/premium/ydus/hematoloji/kml", isReady: true, badges: ["YENİ"] },
        { title: "Akut Lenfoblastik Lösemi (ALL)", href: "/tr/premium/ydus/hematoloji/all", isReady: true, badges: ["YENİ"] },
        { title: "Kronik Lenfositik Lösemi (KLL)", href: "/tr/premium/ydus/hematoloji/kll", isReady: true, badges: ["YENİ"] },
      ]
    },
    {
      id: "lenfomalar",
      title: "Lenfomalar",
      icon: "🦠",
      desc: "Hodgkin, Non-Hodgkin ve Evreleme Sistemleri",
      items: [
        { title: "Hodgkin Lenfoma", href: "#", isReady: false, badges: ["YAKINDA"] },
        { title: "Diffüz Büyük B Hücreli Lenfoma", href: "#", isReady: false, badges: ["YAKINDA"] },
      ]
    }
  ]
};

export default function Page() {
  return <BranchTemplate data={DATA} />;
}