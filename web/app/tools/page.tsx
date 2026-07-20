"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- MEDISEA HESAPLAYICI VERİTABANI (SİSTEMATİK GÜNCELLEME) ---
const TOOLS_DATABASE = [
  {
    category: "Klinik Nütrisyon (Beslenme)",
    icon: "🍏",
    items: [
      { slug: "nrs-2002", name: "NRS-2002", desc: "Yatan hastalarda beslenme riski taraması" },
      { slug: "must", name: "MUST", desc: "Malnutrition Universal Screening Tool — toplum & poliklinik" },
      { slug: "mna", name: "MNA® (Kısa Form)", desc: "Geriatrik popülasyon nütrisyonel değerlendirme" },
      { slug: "sga", name: "SGA", desc: "Sübjektif Global Değerlendirme — klinik nütrisyon muayenesi" },
      { slug: "glim", name: "GLIM Kriterleri", desc: "Küresel malnütrisyon tanı protokolü" },
      { slug: "conut", name: "CONUT", desc: "Controlling Nutritional Status — albumin + kolesterol + lenfosit" },
      { slug: "pni", name: "PNI", desc: "Prognostik Nütrisyon İndeksi — albumin + lenfosit" },
      { slug: "gnri", name: "GNRI", desc: "Geriyatrik Nütrisyon Risk İndeksi — albumin + ideal ağırlık" },
      { slug: "refeeding-risk", name: "Refeeding Sendromu Riski", desc: "NICE kriterleri — beslenme başlatmada hipofosfatemi riski" },
      { slug: "nutrition-needs", name: "Enerji & Protein Gereksinimi", desc: "Klinik duruma göre kcal/pro hesaplayıcı" },
    ]
  },
  {
    category: "Nefroloji",
    icon: "🧪",
    items: [
      { slug: "egfr", name: "eGFR (CKD-EPI 2021)", desc: "Race-free böbrek fonksiyon analizi" },
      { slug: "kdigo-aki", name: "KDIGO AKI Evrelemesi", desc: "Akut böbrek hasarı evrelemesi (kreatinin + idrar çıkışı)" },
      { slug: "sodium", name: "Sodyum Yönetimi", desc: "TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı" },
      { slug: "abg", name: "Asit-Baz Analizi (ABG)", desc: "Primer bozukluk · kompansasyon formülleri · AG · delta-delta · A-a gradyant" },
      { slug: "ktv", name: "Kt/V — Daugirdas II", desc: "Hemodiyaliz yeterliliği · spKt/V · eKt/V · URR" },
      { slug: "osmolal-gap", name: "Serum Osmolal Gap", desc: "Ölçülen − hesaplanan osmolalite · toksik alkol taraması · tahmini madde düzeyleri" },
      { slug: "spot-urine", name: "Spot İdrar Hesaplamaları", desc: "PCR · ACR · FENa · FEÜre · TTKG · İdrar Anyon Açığı · İdrar Osmolal Gap" },
      { slug: "corrected-calcium", name: "Düzeltilmiş Kalsiyum", desc: "Albumin'e göre Ca+2 hesaplama" },
      { slug: "anion-gap", name: "Anyon Açığı", desc: "Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi)" },
    ]
  },
  {
    category: "Romatoloji",
    icon: "🦴",
    items: [
      { slug: "das28", name: "DAS28 (ESR/CRP)", desc: "Romatoid artrit hastalık aktivite skoru" },
      { slug: "cdai", name: "CDAI", desc: "Klinik Hastalık Aktivite İndeksi — RA (lab gerektirmez)" },
      { slug: "sdai", name: "SDAI", desc: "Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP" },
      { slug: "haq-di", name: "HAQ-DI", desc: "Sağlık Değerlendirme Anketi — Engellilik İndeksi" },
      { slug: "basdai", name: "BASDAI", desc: "Bath Ankilozan Spondilit Hastalık Aktivite İndeksi" },
      { slug: "asdas", name: "ASDAS-CRP/ESR", desc: "Ankilozan Spondilit Hastalık Aktivite Skoru" },
      { slug: "dapsa", name: "DAPSA", desc: "Psoriatik Artrit Hastalık Aktivite Skoru" },
      { slug: "fibromiyalji", name: "Fibromiyalji 2016", desc: "ACR 2016 — WPI + Semptom Şiddet Skalası tanı kriterleri" },
      { slug: "sle", name: "SLE Kriterleri", desc: "Sistemik Lupus Eritematozus sınıflama kriterleri" },
      { slug: "sledai2k", name: "SLEDAI-2K", desc: "SLE hastalık aktivite indeksi" },
      { slug: "rapid3", name: "RAPID3", desc: "Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global" },
      { slug: "gout-acr", name: "Gut ACR 2015", desc: "ACR/EULAR gut hastalığı sınıflama kriterleri — MSU + domain skoru" },
      { slug: "essdai", name: "ESSDAI", desc: "Sjögren Hastalık Aktivite İndeksi — 12 ekstraglandüler domain" },
      { slug: "mrss", name: "mRSS", desc: "Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge)" },
      { slug: "behcet", name: "Behçet — ICBD 2014", desc: "Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan)" },
    ]
  },
  {
    category: "Endokrinoloji & Metabolizma",
    icon: "🦋",
    items: [
      { slug: "hba1c-eag", name: "HbA1c → Ortalama Glukoz", desc: "Tahmini ortalama glukoz (ADA/NGSP)" },
      { slug: "homa-ir", name: "HOMA-IR", desc: "İnsülin direnci indeksi (açlık glukoz × insülin)" },
      { slug: "findrisc", name: "FINDRISC", desc: "Tip 2 diyabet 10 yıllık risk taraması" },
      { slug: "bmi", name: "BMI & İdeal Vücut Ağırlığı", desc: "Vücut kitle indeksi + Devine / Hamwi formülleri" },
      { slug: "bmr", name: "BMR & TDEE", desc: "Bazal metabolizma hızı — Mifflin–St Jeor" },
      { slug: "steroid-dose", name: "Steroid Eşdeğer Doz", desc: "Kortikosteroid dönüşüm tablosu" },
      { slug: "corrected-sodium", name: "Düzeltilmiş Sodyum", desc: "Hiperglisemi düzeltmesi (Katz formülü)" },
      { slug: "corrected-calcium", name: "Düzeltilmiş Kalsiyum", desc: "Albumin'e göre Ca+2 hesaplama" },
      { slug: "tirads", name: "ACR TI-RADS", desc: "Tiroid nodülü US değerlendirme — kompozisyon, ekojenite, şekil, sınır, odaklar + İİAB kararı" },
    ]
  },
  {
    category: "Onkoloji",
    icon: "🎗️",
    items: [
      { slug: "bsa", name: "Vücut Yüzey Alanı (BSA)", desc: "Mosteller formülü — kemoterapi dozlama" },
      { slug: "ecog", name: "ECOG Performans Durumu", desc: "Fonksiyonel kapasite / tedavi uygunluğu" },
      { slug: "calvert", name: "Calvert Formülü", desc: "Karboplatin AUC bazlı doz hesaplama" },
      { slug: "mascc", name: "MASCC Risk İndeksi", desc: "Febril nötropenide komplikasyon riski" },
      { slug: "khorana", name: "Khorana Skoru", desc: "Kemoterapi ilişkili VTE riski" },
      { slug: "anc", name: "ANC Hesaplama", desc: "Mutlak nötrofil sayısı ve nötropeni evrelemesi" },
      { slug: "ipi", name: "IPI Skoru", desc: "Non-Hodgkin lenfoma prognostik indeksi" },
    ]
  },
  {
    category: "Kardiyoloji",
    icon: "❤️",
    items: [
      { slug: "heart-score", name: "HEART Skoru", desc: "Göğüs ağrısı risk stratifikasyonu" },
      { slug: "chads-vasc", name: "CHA₂DS₂-VASc Skoru", desc: "AF'de inme riski hesaplama" },
      { slug: "has-bled", name: "HAS-BLED Skoru", desc: "Antikoagülasyon kanama riski" },
      { slug: "timi-ua", name: "TIMI Skoru (UA/NSTEMI)", desc: "Akut koroner sendrom risk stratifikasyonu" },
      { slug: "grace", name: "GRACE 2.0 Skoru", desc: "AKS/NSTEMI hastane içi mortalite riski" },
      { slug: "endocarditis", name: "Duke Kriterleri", desc: "Enfektif Endokardit tanı deşifresi" },
    ]
  },
  {
    category: "Acil & Kritik Bakım",
    icon: "🚨",
    items: [
      { slug: "wells-pe", name: "Wells Skoru (PE)", desc: "Pulmoner emboli klinik olasılığı" },
      { slug: "wells-dvt", name: "Wells Skoru (DVT)", desc: "Derin ven trombozu klinik olasılığı" },
      { slug: "perc", name: "PERC Kriterleri", desc: "PE düşük risk dışlama protokolü" },
      { slug: "padua", name: "Padua Skoru", desc: "Yatan dahili hastalarda VTE profilaksi kararı" },
      { slug: "qsofa", name: "qSOFA Skoru", desc: "Hızlı sepsis yatak başı değerlendirme" },
      { slug: "sofa", name: "SOFA Skoru", desc: "Yoğun bakımda organ yetmezliği takibi" },
      { slug: "news2", name: "NEWS2 Skoru", desc: "Klinik kötüleşme erken uyarı sistemi" },
      { slug: "gcs", name: "Glasgow Koma Skalası", desc: "Bilinç düzeyi değerlendirmesi (E+V+M)" },
      { slug: "ciwa-ar", name: "CIWA-Ar", desc: "Alkol yoksunluğu şiddeti — 10 madde, nöbet/deliryum riski değerlendirme" },
      { slug: "4t-hit", name: "4T Skoru — HIT", desc: "Heparine bağlı trombositopeni klinik olasılık skoru (4 kriter, 0–8 puan)" },
      { slug: "infusion", name: "İnfüzyon Hesaplama", desc: "IV doz ve damla sayısı asistanı" },
      { slug: "heart", name: "HEART Skoru", desc: "Akut göğüs ağrısı kardiyak risk triyajı — 5 kriter (H-E-A-R-T)" },
      { slug: "timi-ua", name: "TIMI UA/NSTEMI", desc: "Kararsız angina/NSTEMI 14 günlük olay riski — 7 kriter" },
      { slug: "nihss", name: "NIHSS", desc: "NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi" },
      { slug: "rts", name: "RTS", desc: "Revize Travma Skoru — GCS + SKB + Solunum hızı, tahmini sağkalım" },
      { slug: "canadian-ct", name: "Kanada BT Kural", desc: "Minör kafa travmasında BT endikasyonu — yüksek/orta risk kriterleri" },
    ]
  },
  {
    category: "Göğüs Hastalıkları & Enfeksiyon",
    icon: "🫁",
    items: [
      { slug: "curb65", name: "CURB-65 Skoru", desc: "Toplum kökenli pnömoni triyaj kararı" },
      { slug: "psi-port", name: "PSI/PORT Skoru", desc: "Pnömonide 30 günlük mortalite tahmini" },
      { slug: "cat-copd", name: "CAT Skoru", desc: "KOAH Değerlendirme Testi — 8 Likert maddesi, semptom yükü" },
      { slug: "mmrc", name: "mMRC Dispne", desc: "Modifiye Medical Research Council dispne ölçeği — Grade 0–4" },
      { slug: "act", name: "ACT", desc: "Astım Kontrol Testi — 5 soru, kontrolsüz/iyi kontrol/tam kontrol" },
      { slug: "bode", name: "BODE İndeksi", desc: "KOAH 4 yıllık mortalite tahmini — BMI + FEV1 + mMRC + 6DYT" },
      { slug: "berlin-ards", name: "Berlin ARDS Kriterleri", desc: "ARDS tanı ve şiddet sınıflaması — hafif/orta/ağır" },
    ]
  },
  {
    category: "Allerji & İmmünoloji",
    icon: "🌸",
    items: [
      { slug: "anaphylaxis", name: "Anafilaksi Kriterleri", desc: "NIAID/FAAN 3 kriter — epinefrin endikasyonu" },
      { slug: "tnss", name: "TNSS", desc: "Total Nazal Semptom Skoru — 4 semptom, 0–12" },
      { slug: "uas7", name: "UAS7", desc: "Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği" },
      { slug: "dlqi", name: "DLQI", desc: "Dermatoloji Yaşam Kalitesi İndeksi — 10 madde, 0–30" },
      { slug: "scorad", name: "SCORAD", desc: "Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif" },
    ]
  },
  {
    category: "Palyatif Bakım",
    icon: "🕊️",
    items: [
      { slug: "karnofsky", name: "Karnofsky (KPS)", desc: "0–100 performans skalası — fonksiyonel kapasite ve prognoz" },
      { slug: "pps", name: "Palliative Performance Scale", desc: "PPS v2 — palyatif bakımda 5 domain fonksiyonel durum" },
      { slug: "ppi", name: "Palyatif Prognostik İndeks (PPI)", desc: "Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta)" },
      { slug: "pap-score", name: "PaP Score", desc: "Palyatif Prognostik Skor — 30 günlük sağkalım (Grup A/B/C)" },
      { slug: "esas", name: "ESAS", desc: "Edmonton Semptom Değerlendirme — 9 semptom, 0–10 skala" },
    ]
  },
  {
    category: "Endokrin Testler",
    icon: "🔬",
    items: [
      { slug: "dst", name: "Deksametazon Süpresyon Testi (DST)", desc: "1 mg / 2 mg LDDST / 8 mg HDDST — Cushing tarama & lokalizasyon" },
      { slug: "ogtt", name: "OGTT Yorumlama", desc: "T2DM/prediyabet, gestasyonel diyabet (GDM), akromegali GH süpresyonu" },
      { slug: "acth-stim", name: "ACTH Stimülasyon Testi", desc: "250 μg / 1 μg protokol — adrenal yetmezlik kortizol yanıtı" },
      { slug: "tft", name: "Tiroid Fonksiyon Testi (TFT)", desc: "TSH / FT4 / FT3 patern tanıma — hipo, hiper, subklinik, santral" },
      { slug: "gh-test", name: "Büyüme Hormonu Testleri", desc: "GH eksikliği stimülasyon (ITT/glukagon) & akromegali OGTT süpresyonu" },
    ]
  },
  {
    category: "Nöroloji",
    icon: "🧠",
    items: [
      { slug: "abcd2", name: "ABCD² Skoru", desc: "TİA sonrası 2 günlük inme riski tahmini" },
    ]
  },
  {
    category: "Hepatoloji & Gastroenteroloji",
    icon: "🍺",
    items: [
      { slug: "meld-na", name: "MELD-Na Skoru", desc: "ESKH mortalite tahmini" },
      { slug: "child-pugh", name: "Child-Pugh Sınıflaması", desc: "Siroz şiddet ve prognozu" },
      { slug: "glasgow-blatchford", name: "Glasgow-Blatchford Skoru", desc: "Üst GİS kanaması — endoskopi öncesi risk" },
      { slug: "rockall", name: "Rockall Skoru", desc: "Üst GİS kanaması — yeniden kanama ve mortalite" },
      { slug: "ranson", name: "Ranson Kriterleri", desc: "Akut pankreatit şiddet değerlendirmesi" },
    ]
  },
  {
    category: "Genel Araçlar",
    icon: "🔄",
    items: [
      { slug: "charlson", name: "Charlson Komorbidite İndeksi", desc: "CCI — 10 yıllık mortalite tahmini" },
      { slug: "unit-converter", name: "Birim Çevirici", desc: "Sık kullanılan laboratuvar birim dönüşümleri" },
    ]
  },
  {
    category: "Geriatri",
    icon: "👴",
    items: [
      { slug: "barthel",      name: "Barthel ADL İndeksi",     desc: "Günlük yaşam aktiviteleri — fonksiyonel bağımsızlık değerlendirmesi (0–100)" },
      { slug: "lawton-iadl",  name: "Lawton IADL",             desc: "Enstrümental günlük yaşam aktiviteleri — 8 madde (alışveriş, ilaç, finans)" },
      { slug: "gds-15",       name: "GDS-15",                  desc: "Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı" },
      { slug: "frail",        name: "FRAIL Skalası",            desc: "Kırılganlık (frailty) tarama — Sağlıklı / Pre-kırılgan / Kırılgan" },
      { slug: "morse-fall",   name: "Morse Düşme Riski",        desc: "Hastanede düşme riski değerlendirme skalası — 6 madde" },
    ]
  },
  {
    category: "Yoğun Bakım Ünitesi (YBÜ)",
    icon: "💉",
    items: [
      { slug: "apache2", name: "APACHE II", desc: "Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini" },
      { slug: "rass", name: "RASS", desc: "Richmond Ajitasyon–Sedasyon Skalası — −5/+4, sedasyon hedefi" },
      { slug: "cam-icu", name: "CAM-ICU", desc: "YBÜ deliryum taraması — 4 özellik, PADIS kılavuzu önerisi" },
      { slug: "murray", name: "Murray Skoru", desc: "Akciğer hasar skoru — ARDS şiddet değerlendirmesi, ECMO eşiği ≥ 2.5" },
      { slug: "braden", name: "Braden Skalası", desc: "Bası yarası risk değerlendirmesi — 6 alt ölçek, 6–23 puan" },
    ]
  },
  {
    category: "Hematoloji",
    icon: "🩸",
    items: [
      { slug: "ipi",      name: "IPI",              desc: "Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS)" },
      { slug: "flipi",    name: "FLIPI",             desc: "Foliküler lenfoma prognoz indeksi — 0–5 puan, 10 yıllık OS / PF" },
      { slug: "ipss-r",   name: "IPSS-R",            desc: "MDS Revize Prognostik Skorlama — sitogenetik + blast + CBC parametreleri" },
      { slug: "isth-dic", name: "ISTH DIC Skoru",    desc: "Yaygın damar içi pıhtılaşma — açık DIC tanı algoritması (≥ 5 puan)" },
      { slug: "hscore",   name: "HScore",             desc: "HLH olasılık skoru — 9 parametre, hemofagositik lenfohistiyositoz" },
    ]
  }
];

export default function ToolsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = TOOLS_DATABASE.map(cat => ({
    ...cat,
    items: cat.items.filter(it => 
      it.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      it.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 space-y-12">

        {/* NAVİGASYON */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            Geri
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all"
          >
            🏠 Ana Sayfa
          </Link>
        </div>

        {/* BAŞLIK PANELİ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-500 text-sm animate-pulse">☀️</span>
              <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-[0.3em]">MediSea Karar Destek</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-blue-950 uppercase italic tracking-tighter leading-none">
              Klinik <span className="text-slate-400 not-italic uppercase">Araçlar</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-3 max-w-xl">
              MediSea ekosistemiyle uyumlu, hızlı referans ve güvenilir klinik skorlama modülleri.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Ara (Örn: GFR, Wells, Beslenme...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl pl-14 pr-6 py-5 text-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all placeholder:text-slate-300 font-bold shadow-inner"
            />
          </div>
        </div>

        {/* ARAÇ KARTLARI GRİD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
          {filteredData.map((cat, idx) => (
            <div key={idx} className="space-y-5">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-900/5 flex items-center justify-center border border-blue-900/10 shadow-sm text-xl">
                   {cat.icon}
                </div>
                <h2 className="text-xs font-black text-blue-900 uppercase tracking-[0.25em]">{cat.category}</h2>
              </div>

              <div className="grid gap-4">
                {cat.items.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-center justify-between p-7 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-amber-400 hover:bg-white hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300"
                  >
                    <div className="space-y-1.5 flex-grow pr-6">
                      <div className="text-base font-black text-blue-950 uppercase italic group-hover:text-blue-700 transition-colors leading-tight">
                        {tool.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none group-hover:text-slate-600">
                        {tool.desc}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-amber-400 group-hover:border-amber-400 transition-all shadow-sm group-hover:shadow-md">
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ALT PANEL */}
        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6 mt-16 text-center">
          <div className="flex items-start gap-4 justify-center opacity-60 max-w-2xl mx-auto">
            <span className="text-amber-500 text-xl">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              MediSea araçları sağlık profesyonelleri için karar destek amaçlıdır. Klinik değerlendirmenin yerini alamaz. Veriler tıbbi sorumluluk içermez.
            </p>
          </div>
          <div className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.4em]">
            © 2026 MediSea Donanması • Klinik Karar Destek Birimi
          </div>
        </div>

      </div>
    </div>
  );
}