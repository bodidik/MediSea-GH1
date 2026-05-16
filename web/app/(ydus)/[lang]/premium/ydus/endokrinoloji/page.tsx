// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\page.tsx"
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import BranchTemplate from '../components/BranchTemplate';

export default function EndoPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';
  const [openCategory, setOpenCategory] = useState<string | null>("hipofiz-hipotalamus");

  const ENDO_DATA = {
    title: "Endokrinoloji",
    slug: "endokrinoloji",
    color: "orange",
    icon: "🧪",
    categories: [
      {
        id: "hipofiz-hipotalamus",
        title: "Hipofiz ve Hipotalamus",
        icon: "🧠",
        desc: "Ön ve Arka Hipofiz Hormonları, Adenomlar ve Fonksiyon Bozuklukları",
        items: [
          { 
            title: "Hipofiz Karargahına Git 🏁", 
            href: `/${lang}/premium/ydus/endokrinoloji/hipofiz`, 
            isReady: true, 
            badges: ["BİRİM", "POPÜLER"] 
          },
          { 
            title: "Akromegali ve Devlik", 
            href: `/${lang}/premium/ydus/endokrinoloji/hipofiz/akromegali`, 
            isReady: true, 
            badges: ["PREMİUM", "GÜNCEL"] 
          },
          { title: "Prolaktinoma Yönetimi", href: "#", isReady: false, badges: ["HAZIRLANIYOR"] },
          { title: "Diabetes Insipidus ve SIADH", href: "#", isReady: false, badges: ["KRİTİK"] }
        ]
      },
      {
        id: "tiroid-gland",
        title: "Tiroid Gland Hastalıkları",
        icon: "🦋",
        desc: "Tüm Tiroid Hastalıkları, Nodüller ve Kanserler Alt Birimi",
        items: [
          { 
            title: "Tiroid Karargahına Git 🏁", 
            href: `/${lang}/premium/ydus/endokrinoloji/tiroid`, 
            isReady: true, 
            badges: ["BİRİM", "TEMD"] 
          }
        ]
      },
      {
        id: "adrenal-surrenal",
        title: "Adrenal Gland (Sürrenal)",
        icon: "🔋",
        desc: "Cushing, Conn, Addison ve Feokromositoma Yönetimi",
        items: [
          { title: "Cushing Sendromu Tanı Algoritması", href: "#", isReady: true, badges: ["ZOR", "İSTİHBARAT"] },
          { title: "Primer Hiperaldosteronizm", href: "#", isReady: false, badges: ["KOKPİT"] },
          { title: "Adrenal İnsidentalomalar", href: "#", isReady: false, badges: ["GÜNCEL"] }
        ]
      },
      {
        id: "kemik-kalsiyum",
        title: "Kalsiyum ve Kemik Metabolizması",
        icon: "🦴",
        desc: "PTH, D Vitamini, Osteoporoz ve Paget Hastalığı",
        items: [
          { title: "Hiperkalsemi Ayırıcı Tanısı", href: "#", isReady: true, badges: ["HAYAT KURTARICI"] },
          { title: "Osteoporoz Tedavi Rehberi", href: "#", isReady: false, badges: ["REHBER"] }
        ]
      },
      {
        id: "pankreas-diyabet",
        title: "Pankreas ve Diyabet",
        icon: "🍯",
        desc: "Tip 1-2 DM, İnsülin Direnci ve Hipoglisemik Sendromlar",
        items: [
          { title: "Diyabetik Ketoasidoz Yönetimi", href: "#", isReady: true, badges: ["ACİL"] },
          { title: "Yeni Nesil Oral Antidiyabetikler", href: "#", isReady: false, badges: ["ECZANE"] }
        ]
      },
      {
        id: "ureme-endokrinolojisi",
        title: "Üreme Endokrinolojisi",
        icon: "🧬",
        desc: "PCOS, Hipogonadizm ve İnfertilite Yaklaşımı",
        items: [
          { title: "PCOS Tanı ve Tedavi (Rotterdam)", href: "#", isReady: false, badges: ["GÜNCEL"] },
          { title: "Erkek Hipogonadizmi", href: "#", isReady: false, badges: ["HAZIRLANIYOR"] }
        ]
      },
      {
        id: "lipid-metabolizma",
        title: "Lipid, Obezite ve Beslenme",
        icon: "🍔",
        desc: "Hiperlipidemiler, Metabolik Sendrom ve Obezite Cerrahisi",
        items: [
          { title: "Dislipidemi ve Statin Kullanımı", href: "#", isReady: false, badges: ["KILAVUZ"] }
        ]
      },
      {
        id: "poliendokrin-sendromlar",
        title: "Poliendokrin Sendromlar",
        icon: "🎭",
        desc: "MEN Tip 1-2, APS Tip 1-2 ve Nöroendokrin Tümörler",
        items: [
          { title: "MEN Sendromları Özeti", href: "#", isReady: true, badges: ["TABLO", "SINAV"] }
        ]
      }
    ]
  };

  return (
    <BranchTemplate 
      data={ENDO_DATA} 
      openCategory={openCategory} 
      setOpenCategory={setOpenCategory} 
    />
  );
}