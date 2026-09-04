"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { aramaAnahtariKur, aramaAnahtariEslesir } from "@/app/lib/arama";
import { siteIciGecmisVar } from "@/app/lib/gecmis";

// --- MEDISEA HESAPLAYICI VERİTABANI (SİSTEMATİK GÜNCELLEME) ---
const TOOLS_DATABASE = [
  {
    category: "Klinik Nütrisyon (Beslenme)",
    slug: "nutrisyon",
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
    slug: "nefroloji",
    icon: "🧪",
    items: [
      { slug: "egfr", name: "eGFR (CKD-EPI 2021)", desc: "Race-free böbrek fonksiyon analizi" },
      { slug: "kdigo-aki", name: "KDIGO AKI Evrelemesi", desc: "Akut böbrek hasarı evrelemesi (kreatinin + idrar çıkışı)" },
      { slug: "sodium", name: "Sodyum Yönetimi", desc: "TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı" },
      { slug: "abg", name: "Asit-Baz Analizi (ABG)", desc: "Mikst bozukluk ayrımı · pH normalken bile gizli asidoz · kompansasyon · anyon açığı · delta-delta" },
      { slug: "ktv", name: "Kt/V — Daugirdas II", desc: "Hemodiyaliz yeterliliği · spKt/V · eKt/V · URR" },
      { slug: "osmolal-gap", name: "Serum Osmolal Gap", desc: "Ölçülen − hesaplanan osmolalite · toksik alkol taraması · tahmini madde düzeyleri" },
      { slug: "spot-urine", name: "Spot İdrar Hesaplamaları", desc: "PCR · ACR · FENa · FEÜre · TTKG · İdrar Anyon Açığı · İdrar Osmolal Gap" },
      { slug: "corrected-calcium", name: "Düzeltilmiş Kalsiyum", desc: "Albumin'e göre Ca+2 hesaplama" },
      { slug: "anion-gap", name: "Anyon Açığı", desc: "Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi)" },
    ]
  },
  {
    category: "Romatoloji",
    slug: "romatoloji",
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
      { slug: "sle", name: "SLEDAI-2K", desc: "Lupus hastalık aktivite indeksi — 24 tanımlayıcı, 0–105" },
      { slug: "rapid3", name: "RAPID3", desc: "Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global" },
      { slug: "gout-acr", name: "Gut ACR 2015", desc: "ACR/EULAR gut hastalığı sınıflama kriterleri — MSU + domain skoru" },
      { slug: "essdai", name: "ESSDAI", desc: "Sjögren Hastalık Aktivite İndeksi — 12 ekstraglandüler domain" },
      { slug: "mrss", name: "mRSS", desc: "Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge)" },
      { slug: "behcet", name: "Behçet — ICBD 2014", desc: "Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan)" },
    ]
  },
  {
    category: "Endokrinoloji & Metabolizma",
    slug: "endokrinoloji",
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
    slug: "onkoloji",
    icon: "🎗️",
    items: [
      { slug: "bsa", name: "Vücut Yüzey Alanı (BSA)", desc: "Mosteller formülü — kemoterapi dozlama" },
      { slug: "ecog", name: "ECOG Performans Durumu", desc: "Fonksiyonel kapasite / tedavi uygunluğu" },
      { slug: "calvert", name: "Calvert Formülü", desc: "Karboplatin AUC bazlı doz hesaplama" },
      { slug: "mascc", name: "MASCC Risk İndeksi", desc: "Febril nötropenide komplikasyon riski" },
      { slug: "khorana", name: "Khorana Skoru", desc: "Kemoterapi ilişkili VTE riski" },
      { slug: "anc", name: "ANC Hesaplama", desc: "Mutlak nötrofil sayısı ve nötropeni evrelemesi" },
      { slug: "ipi", name: "IPI Skoru", desc: "Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS)" },
    ]
  },
  {
    category: "Kardiyoloji",
    slug: "kardiyoloji",
    icon: "❤️",
    items: [
      { slug: "chads-vasc", name: "CHA₂DS₂-VASc Skoru", desc: "AF'de inme riski hesaplama" },
      { slug: "has-bled", name: "HAS-BLED Skoru", desc: "Antikoagülasyon kanama riski" },
      { slug: "timi-ua", name: "TIMI Skoru (UA/NSTEMI)", desc: "Kararsız angina/NSTEMI 14 günlük olay riski — 7 kriter" },
      { slug: "grace", name: "GRACE Skoru", desc: "AKS/NSTEMI hastane içi mortalite — toplamsal puan (1.0)" },
      { slug: "endocarditis", name: "Duke Kriterleri", desc: "Enfektif Endokardit tanı deşifresi" },
    ]
  },
  {
    category: "Acil & Kritik Bakım",
    slug: "acil",
    icon: "🚨",
    items: [
      { slug: "wells-pe", name: "Wells Skoru (PE)", desc: "Pulmoner emboli klinik olasılığı" },
      { slug: "wells-dvt", name: "Wells Skoru (DVT)", desc: "Derin ven trombozu klinik olasılığı" },
      { slug: "perc", name: "PERC Kriterleri", desc: "PE düşük risk dışlama protokolü" },
      { slug: "padua", name: "Padua Skoru", desc: "Yatan dahili hastalarda VTE profilaksi kararı" },
      { slug: "caprini", name: "Caprini VTE", desc: "Cerrahi hastada VTE risk modeli — skoru değiştirmeden kanama riskini ayrıca okur" },
      { slug: "qsofa", name: "qSOFA Skoru", desc: "Hızlı sepsis yatak başı değerlendirme" },
      { slug: "sofa", name: "SOFA Skoru", desc: "Yoğun bakımda organ yetmezliği takibi" },
      { slug: "news2", name: "NEWS2 Skoru", desc: "Klinik kötüleşme erken uyarı sistemi" },
      { slug: "gcs", name: "Glasgow Koma Skalası", desc: "Bilinç düzeyi değerlendirmesi (E+V+M)" },
      { slug: "ciwa-ar", name: "CIWA-Ar", desc: "Alkol yoksunluğu şiddeti — 10 madde, nöbet/deliryum riski değerlendirme" },
      { slug: "4t-hit", name: "4T Skoru — HIT", desc: "Heparine bağlı trombositopeni klinik olasılık skoru (4 kriter, 0–8 puan)" },
      { slug: "heart", name: "HEART Skoru", desc: "Akut göğüs ağrısı kardiyak risk triyajı — 5 kriterin beşi de yanıtlanmadan sonuç basmaz" },
      { slug: "timi-ua", name: "TIMI Skoru (UA/NSTEMI)", desc: "Kararsız angina/NSTEMI 14 günlük olay riski — 7 kriter" },
      { slug: "nihss", name: "NIHSS", desc: "NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi" },
      { slug: "rts", name: "RTS", desc: "Revize Travma Skoru — GCS + SKB + Solunum hızı, tahmini sağkalım" },
      { slug: "canadian-ct", name: "Kanada BT Kural", desc: "Minör kafa travmasında BT endikasyonu — yüksek/orta risk kriterleri" },
    ]
  },
  {
    category: "İlaç İnfüzyonu & Doz Hesabı",
    slug: "infuzyon",
    icon: "💉",
    items: [
      { slug: "nac-infuzyon", name: "NAC İnfüzyonu", desc: "Parasetamol intoksikasyonunda IV N-asetilsistein — 3 torba ve SNAP rejimi, kiloya göre doz ve mL/saat" },
      { slug: "digoksin-toksisitesi", name: "Digoksin Toksisitesi", desc: "Fab flakon sayısı — düzey, alınan miktar ve ampirik: üç ayrı formül; Fab sonrası düzey yorumlanamaz" },
      { slug: "lipid-emulsiyon", name: "Lipid Emülsiyon (LAST)", desc: "Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor" },
      { slug: "naloksan-infuzyon", name: "Naloksan İnfüzyonu", desc: "Saatlik hız uyandıran bolusun 2/3'ü — antidot zehirden ÖNCE bitiyor, izlem süresi opioide göre değişir" },
      { slug: "fomepizol", name: "Fomepizol Dozu", desc: "Metanol ve etilen glikol zehirlenmesinde yükleme ve idame dozları — diyaliz aralığı dahil" },
      { slug: "hiperkalemi-tedavi", name: "Hiperkalemi Tedavisi", desc: "Kaydıran ile çıkaranı ayırır — kalsiyum ve insülin potasyumu DÜŞÜRMEZ, etkileri bitince geri çıkar" },
      { slug: "potasyum-replasman", name: "Potasyum Replasmanı", desc: "IV potasyumda hız, derişim ve süre sınırları — periferik ve santral yol ayrı" },
      { slug: "magnezyum-infuzyon", name: "Magnezyum İnfüzyonu", desc: "Endikasyona göre doz, süre ve pompa hızı — torsades ile replasman hızları zıt" },
      { slug: "kalsiyum-infuzyon", name: "Kalsiyum İnfüzyonu", desc: "Glukonat/klorür dönüşümü — aynı ampul üç kat farklı elementer kalsiyum taşır" },
      { slug: "fosfat-replasman", name: "Fosfat Replasmanı", desc: "Zorunlu potasyum/sodyum yükü — süreyi çoğu zaman fosfat değil potasyum sınırlıyor" },
      { slug: "bikarbonat-infuzyon", name: "Bikarbonat Açığı", desc: "NaHCO₃ açık hesabı — ampul karşılığı ve izotonik infüzyon hacmi, dağılım katsayısı seçilebilir" },
      { slug: "vazoaktif-infuzyon", name: "Vazoaktif İnfüzyon", desc: "Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir" },
      { slug: "sedasyon-infuzyon", name: "Sedasyon & Analjezi İnfüzyonu", desc: "Yedi ilaç — doz tabanı ilaca göre değişir; remifentanil tek dakika tabanlı olan" },
      { slug: "heparin-nomogram", name: "Heparin Nomogramı", desc: "Kiloya göre IV heparin yükleme ve idame dozu — VTE ve AKS ayrı, tavanlar açıkça bildiriliyor" },
      { slug: "antikoagulan-geri-dondurme", name: "Antikoagülan Geri Döndürme", desc: "Protamin, 4F-PCC, K vitamini ve idarucizumab — üç ayrı dozlama mantığı: miktara, kiloya ve hiçbirine bağlı olmayan" },
      { slug: "tromboliz-doz", name: "Tromboliz Dozu (rt-PA)", desc: "İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim" },
      { slug: "status-epileptikus", name: "Status Epileptikus", desc: "Yükleme dozları ve HIZ sınırları — fenitoin 50 mg/dk aşılırsa hipotansiyon ve aritmi" },
      { slug: "dka-infuzyon", name: "DKA Kurulumu", desc: "Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir" },
      { slug: "infusion", name: "İnfüzyon Hesaplama", desc: "IV doz ve damla sayısı asistanı" },
    ]
  },

  {
    category: "Göğüs Hastalıkları & Enfeksiyon",
    slug: "gogus-enfeksiyon",
    icon: "🫁",
    items: [
      { slug: "curb65", name: "CURB-65 Skoru", desc: "Toplum kökenli pnömoni triyaj kararı" },
      { slug: "psi-port", name: "PSI/PORT Skoru", desc: "Pnömonide 30 günlük mortalite tahmini" },
      { slug: "cat-copd", name: "CAT Skoru", desc: "KOAH Değerlendirme Testi — 8 Likert maddesi, semptom yükü" },
      { slug: "mmrc", name: "mMRC Dispne", desc: "Modifiye Medical Research Council dispne ölçeği — Grade 0–4" },
      { slug: "act", name: "ACT", desc: "Astım Kontrol Testi — 5 soru, kontrolsüz/iyi kontrol/tam kontrol" },
      { slug: "bode", name: "BODE İndeksi", desc: "KOAH 4 yıllık mortalite tahmini — BMI + FEV1 + mMRC + 6DYT" },
      { slug: "berlin-ards", name: "Berlin ARDS Kriterleri", desc: "ARDS tanı ve şiddet sınıflaması — hafif/orta/ağır" },
      { slug: "ariscat", name: "ARISCAT", desc: "Preoperatif pulmoner komplikasyon riski — 7 değişken, düzeltilebilir yük okuması" },
    ]
  },
  {
    category: "Allerji & İmmünoloji",
    slug: "allerji-immunoloji",
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
    slug: "palyatif",
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
    slug: "endokrin-testler",
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
    slug: "noroloji",
    icon: "🧠",
    items: [
      { slug: "nihss", name: "NIHSS", desc: "NIH İnme Skalası — 11 alan, akut inme şiddet değerlendirmesi" },
      { slug: "rankin", name: "Modifiye Rankin (mRS)", desc: "İnme sonrası işlevsel sonuç — 0–6 derece, yapılandırılmış görüşme çapraz kontrolü" },
      { slug: "four", name: "FOUR Skoru", desc: "Koma değerlendirmesi — entübe hastada GKS'nin yerini alır, locked-in ve apneyi yakalar" },
      { slug: "fisher", name: "Fisher Skalası", desc: "SAK'ta vazospazm riski — modifiye ve orijinal Fisher aynı BT bulgusundan" },
      { slug: "abcd2", name: "ABCD² Skoru", desc: "TİA sonrası 2 günlük inme riski tahmini" },
    ]
  },
  {
    category: "Hepatoloji & Gastroenteroloji",
    slug: "hepatoloji-gastro",
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
    slug: "genel",
    icon: "🔄",
    items: [
      { slug: "charlson", name: "Charlson Komorbidite İndeksi", desc: "CCI — 10 yıllık mortalite tahmini" },
      { slug: "unit-converter", name: "Birim Çevirici", desc: "Sık kullanılan laboratuvar birim dönüşümleri" },
    ]
  },
  {
    category: "Geriatri",
    slug: "geriatri",
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
    slug: "ybu",
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
    slug: "hematoloji",
    icon: "🩸",
    items: [
      { slug: "ipi",      name: "IPI Skoru",        desc: "Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS)" },
      { slug: "flipi",    name: "FLIPI",             desc: "Foliküler lenfoma prognoz indeksi — 0–5 puan, 10 yıllık OS / PF" },
      { slug: "ipss-r",   name: "IPSS-R",            desc: "MDS Revize Prognostik Skorlama — sitogenetik + blast + CBC parametreleri" },
      { slug: "isth-dic", name: "ISTH DIC Skoru",    desc: "Yaygın damar içi pıhtılaşma — açık DIC tanı algoritması (≥ 5 puan)" },
      { slug: "hscore",   name: "HScore",             desc: "HLH olasılık skoru — 9 parametre, hemofagositik lenfohistiyositoz" },
    ]
  }
];

/**
 * Kategori artık `useSearchParams()` ile DEĞİL, sunucu sayfasından prop
 * olarak geliyor.
 *
 * Neden: `useSearchParams()` bir istemci bileşeninde Suspense sınırı
 * istiyor ve Next o alt ağacı sunucuda HİÇ render etmiyor — sunulan şey
 * `fallback`, yani boş bir kutu. Ölçüldü (canlı, sunucu HTML'i):
 * /tools 19 KB, `<h1>` 0, `<h2>` 0, `<a>` 0. Karşılaştırma için sunucu
 * bileşeni olan /topics 98 KB ve 43 bağlantı basıyor. Yani 114 aracın hub
 * bağlantısı ilk tarama dalgasında hiç yoktu.
 */
/**
 * Arama anahtarları MODÜL DÜZEYİNDE bir kez kuruluyor.
 *
 * Süzgeç her tuş vuruşunda 130 aracı geziyor; anahtarı çağrı anında kurmak
 * tuş başına yüzlerce normalleştirme demekti (Türkçe küçültme + NFKD + iki
 * regex). Veri modül düzeyinde sabit, anahtar da öyle.
 */
const ARAC_ANAHTARI: Record<string, ReturnType<typeof aramaAnahtariKur>> =
  Object.fromEntries(
    TOOLS_DATABASE.flatMap(cat =>
      cat.items.map(it => [cat.slug + "/" + it.slug, aramaAnahtariKur(it.slug, it.name, it.desc, cat.category)] as const)
    )
  );

export default function ToolsIcerik() {
  const router = useRouter();
  /* Doğrudan giren kullanıcıda `router.back()` sekmeyi siteden ÇIKARIYORDU
     (ölçüldü, bkz. app/lib/gecmis.ts). Sunucuda false — hidrasyon uyumlu. */
  const [geriVar, setGeriVar] = useState(false);
  useEffect(() => { setGeriVar(siteIciGecmisVar()); }, []);

  /**
   * Kategori ne sunucudan prop olarak ne de `useSearchParams()` ile geliyor —
   * ikisinin de bedeli ölçüldü:
   *
   * - `useSearchParams()` Suspense sınırı istiyor ve Next alt ağacı sunucuda
   *   HİÇ üretmiyor; sayfa 19 KB ve sıfır bağlantıyla servis ediliyordu.
   * - Sunucuda `searchParams` okumak rotayı dinamikleştiriyor; CDN'de her
   *   istek MISS oluyordu (ölçüldü: üst üste üç istek, hepsi MISS; kıyas
   *   /topics PRERENDER).
   *
   * Bu yol ikisini de çözüyor: sayfa statik prerender ediliyor, sunucu HTML'i
   * SÜZÜLMEMİŞ tam listeyi (117 bağlantı) taşıyor, kategori hidrasyondan
   * sonra uygulanıyor.
   *
   * Süzgeç iki yoldan geliyor ve ikisi de karşılanmalı:
   * 1. Başka sayfadan `/tools?kategori=x` ile gelinirse bileşen sıfırdan
   *    kurulur — adres bir kez okunur (aşağıdaki effect).
   * 2. Sayfadaki kategori rozetine tıklanırsa bileşen kurulu kalır ve effect
   *    tekrar çalışmaz; bu yüzden rozetler durumu KENDİ günceller.
   */
  const [kategori, setKategori] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  /* Adres okunmadan URL'e YAZMAK, okunacak değeri siler. Bu depoda kayıtlı
     sınıf ("depoya yazan etki, yükleme bitmeden yazarsa veriyi SİLER") ve
     orada `useRef` YETMEDİĞİ ölçülmüştü — bayrak DURUM olmalı. */
  const [adresOkundu, setAdresOkundu] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setKategori(p.get("kategori"));
    setSearchTerm(p.get("ara") ?? "");
    setAdresOkundu(true);
  }, []);

  /**
   * ARAMA TERİMİ ADRESE YANSITILIYOR — sebebi ÖLÇÜLDÜ.
   *
   * Canlıda sürüldü: "kalsiyum" yazıp (3 sonuç) bir aracı açıp GERİ tuşuna
   * basınca sorgu KAYBOLUYOR (kutu boş, liste yeniden 130 kart) ama kaydırma
   * konumu GERİ YÜKLENİYOR (400 → 400). İkisi birleşince en kötü hâl çıkıyor:
   * kullanıcı bırakmadığı bir listeye, anlamı olmayan bir yükseklikte dönüyor.
   *
   * Kategori süzgeci aynı turda ölçüldü ve SAĞLAM: o adreste taşınıyor
   * (`?kategori=acil`), yani geri dönüşte süzgeç de kaydırma da korunuyor.
   * Ayrışan tek şey, yalnızca istemci durumunda yaşayan arama terimiydi.
   *
   * `useSearchParams()` KULLANILMIYOR (yukarıdaki nota bak) ve sunucu
   * `searchParams` okumuyor — sayfa statik prerender olarak kalıyor.
   * `history.replaceState` gezinme yapmıyor, yalnızca mevcut geçmiş kaydının
   * adresini tazeliyor; geri dönüşte bileşen sıfırdan kurulup adresi okuyor.
   *
   * Boş sorguda parametre SİLİNİYOR — adreste `?ara=` bırakmak, boş kutuyla
   * süzülmüş bir liste ilan etmek olurdu.
   *
   * `kategori` de bağımlılıkta: rozete tıklamak `/tools?kategori=x`e gezinip
   * adresi baştan yazıyor, yani `ara` orada düşüyor ve yeniden eklenmesi
   * gerekiyor. En kötü ihtimalle (etki, yönlendiricinin adresi yazmasından
   * önce çalışırsa) adres `ara` taşımadan kalır — yazılan metin React
   * durumunda olduğu için ekranda hiçbir şey kaybolmaz.
   */
  useEffect(() => {
    if (!adresOkundu) return;
    const p = new URLSearchParams(window.location.search);
    const s = searchTerm.trim();
    if (s) p.set("ara", s);
    else p.delete("ara");
    const q = p.toString();
    const yeni = window.location.pathname + (q ? `?${q}` : "") + window.location.hash;
    if (yeni !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(window.history.state, "", yeni);
    }
  }, [searchTerm, kategori, adresOkundu]);

  // Menüden gelen kategori bağlantısı burada karşılanıyor: /tools?kategori=nefroloji
  const aktifKategori = kategori;
  const kategoriGecerli = TOOLS_DATABASE.some(c => c.slug === aktifKategori);
  const seciliKategori = kategoriGecerli ? aktifKategori : null;

  /**
   * BOŞ ARAMA HER ŞEYİ GEÇİRİR — bu satır silinirse sayfa tamamen boşalır.
   *
   * `aramaEslesir` boş sorguda bilerek `false` döner ("eşleşme var mı?"
   * sorusunun doğru cevabı budur; vurgulama gibi çağrı yerlerinde boş
   * sorgunun her şeyi işaretlemesi kusur olurdu). Ama burada soru
   * "eşleşme var mı" değil, "listede kalsın mı" — ve arama kutusu boşken
   * cevap HER ZAMAN evet.
   *
   * Ölçüldü: bu koruma unutulduğunda kutu boşken 114 aracın hepsi elendi,
   * sayfa "0 araç listeleniyor" dedi ve hub'daki 117 araç bağlantısının
   * tamamı kayboldu — yani arama motoru için de sayfa boştu.
   */
  /**
   * MOBILDE KATEGORILER KATLI ACILIR.
   *
   * Olculdu (canli, 375px): belge 21066px = 25.9 EKRAN ve 133 kart tek
   * basina 14974px — belgenin %71'i. Ilk arac karti 1403px'te, yani ilk
   * ekranda tek bir hesaplayici yok.
   *
   * SUNUCU HTML'i DEGISMIYOR: baslangic durumu `null` (hicbiri kapali) ve
   * ilk istemci render'i da oyle — hidrasyon uyusmazligi yok. Katlama
   * yalnizca mount'tan SONRA, dar gorunumde uygulaniyor.
   *
   * `<details>` secildi cunku icerik kapaliyken de DOM'da KALIYOR: kosullu
   * render 133 baglantiyi agactan dusururdu ve bu depoda `/tools`un sunucu
   * HTML'inde sifir baglantiya dusmesi kayitli bir gerileme.
   */
  const [kapaliKategoriler, setKapaliKategoriler] = useState<Set<string> | null>(null);

  const cipKabiRef = useRef<HTMLDivElement>(null);

  /**
   * SECILI CIP GORUNUME KAYDIRILIR.
   *
   * Mobilde cip satiri tek sira ve yatay kayiyor; 19 rozetin cogu ekran
   * disinda. `?kategori=x` ile gelen kullanici hangi suzgecin acik oldugunu
   * goremezdi — `aria-current` dogru ama gorsel isaret ulasilmaz kalirdi.
   */
  useEffect(() => {
    const kap = cipKabiRef.current;
    if (!kap) return;
    const secili = kap.querySelector('[aria-current]');
    if (secili && kap.scrollWidth > kap.clientWidth) {
      secili.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }, [seciliKategori]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return;
    setKapaliKategoriler(new Set(TOOLS_DATABASE.map((c) => c.slug)));
  }, []);

  const aramaBos = !searchTerm.trim();

  /**
   * ARAMA ve KATEGORI SECIMI katlamayi EZER.
   *
   * Kapali bir kategoride eslesen araci gizlemek, aramayi sessizce bozardi:
   * sayac "3 arac bulundu" derken ekranda hicbir kart olmazdi.
   */
  const zorlaAcik = !aramaBos || !!seciliKategori;
  const acikMi = (slug: string) =>
    zorlaAcik || !kapaliKategoriler || !kapaliKategoriler.has(slug);

  const filteredData = TOOLS_DATABASE
    .filter(cat => !seciliKategori || cat.slug === seciliKategori)
    .map(cat => ({
      ...cat,
      /**
       * Türkçe-duyarlı eşleşme (app/lib/arama.ts): `toLowerCase()` Türkçe
       * klavyeden gelen "İ" harfini bozuyordu ve 290 kelime bulunamaz
       * haldeydi. Aksan katlaması sayesinde "gogus" da "Göğüs"ü buluyor.
       *
       * SLUG da aranıyor ve eşleşme NOKTALAMAYA duyarsız (bkz. arama.ts):
       * ölçüldü, 130 aracın 65'i kendi slug'ıyla, 106'sı noktalamasız kendi
       * adıyla bulunamıyordu — "curb65", "chads", "childpugh" sıfır sonuç.
       *
       * KATEGORİ ADI da aranıyor: araçların çoğu kısaltmayla adlandırılmış
       * (NYHA, CHA2DS2-VASc, GRACE…), bu yüzden "nefroloji" ya da "nütrisyon"
       * arayan kullanıcı hiçbir sonuç göremiyordu. Kategori zaten
       * yapılandırılmış veri; tıbbi bir karar gerektirmeden aranabilir.
       */
      items: aramaBos
        ? cat.items
        : cat.items.filter(it => aramaAnahtariEslesir(ARAC_ANAHTARI[cat.slug + "/" + it.slug], searchTerm)),
    })).filter(cat => cat.items.length > 0);

  // Benzersiz araç sayılır, listeleme değil: bazı araçlar birden fazla branşta
  // görünüyor (ör. düzeltilmiş kalsiyum hem nefroloji hem endokrinde). Kayıtları
  // toplamak "117 araç" gibi gerçekte olmayan bir sayı üretiyordu.
  const toplamArac = new Set(TOOLS_DATABASE.flatMap(c => c.items.map(i => i.slug))).size;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 space-y-12">

        {/* NAVİGASYON */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          {geriVar && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            Geri
          </button>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all"
          >
            🏠 Ana Sayfa
          </Link>
          {/* KÜTÜPHANEYE BAĞ. Ölçüldü (canlı): `/tools` sayfasında `<header>`
              YOK (AppShell almıyor), genel arama kutusu YOK ve `/topics`e
              SIFIR bağlantı vardı — sayfadaki tek araç-dışı bağlantı `/` idi.
              Yani 130 hesaplayıcının giriş noktasından 410 konuluk
              kütüphaneye tek yol ana sayfadan geçmekti. */}
          <Link
            href="/topics"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all"
          >
            📚 Kütüphane
          </Link>
        </div>

        {/* BAŞLIK PANELİ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span aria-hidden="true" className="text-amber-500 text-sm animate-pulse">☀️</span>
              <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.3em]">MediSea Karar Destek</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-blue-950 uppercase italic tracking-tighter leading-none">
              Klinik <span className="text-slate-400 not-italic uppercase">Araçlar</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-3 max-w-xl">
              MediSea ekosistemiyle uyumlu, hızlı referans ve güvenilir klinik skorlama modülleri.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <span aria-hidden="true" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              aria-label="Araçlarda ara"
              placeholder="Ara (Örn: GFR, Wells, Beslenme...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl pl-14 pr-6 py-5 text-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all placeholder:text-slate-300 font-bold shadow-inner"
            />
          </div>

          {/* Süzme sonucu — arama yazarken liste sessizce değişiyordu.
              İki ayrı karar burada:

              1) Bölge ilk render'dan itibaren DOM'da duruyor. `role="status"`
                 sonradan EKLENEN düğümü değil, içeriği DEĞİŞEN düğümü
                 duyurur; koşullu basılsaydı ilk mesaj kaçardı.

              2) Sayı BENZERSİZ slug üzerinden. Kayıtları toplamak LİSTELEME
                 sayısını verir, araç sayısını değil, çünkü bazı araçlar
                 iki branşta birden listeleniyor (aynı gerekçe toplamArac
                 hesabında da yazılı). */}
          <div role="status" aria-live="polite" className="sr-only">
            {(() => {
              const n = new Set(filteredData.flatMap((c) => c.items.map((i) => i.slug))).size;
              return searchTerm ? `${n} araç bulundu.` : `${n} araç listeleniyor.`;
            })()}
          </div>
        </div>

        {/* KATEGORİ SÜZGECİ

            Rozet adresleri arama terimini de TAŞIYOR. Sebebi ölçüldü: rozete
            tıklamak `/tools?kategori=x`e gezinip adresi baştan yazıyor ve
            `ara` orada düşüyordu. Yukarıdaki yansıtma etkisi bunu kurtaramaz —
            etki, yönlendirici adresi yazmadan ÖNCE çalışıyor (ölçüldü: rozet
            tıklamasından sonra adres `?kategori=nefroloji`, `ara` yok).
            Gezinmenin kendisine terimi koymak yarışı tümden kaldırıyor.

            Sunucu HTML'i DEĞİŞMİYOR: `searchTerm` hem sunucuda hem ilk
            istemci render'ında boş, yani rozet adresleri orada eskisi gibi
            `/tools?kategori=x`. */}
        {/* MOBILDE TEK SIRA. Olculdu (375px): saran cip blogu 800px, yani
            belgenin neredeyse bir ekrani yalnizca kategori rozetleriydi.
            Kaydirma kabina KLAVYE ERISIMI ayrica gerekmiyor: icindeki her
            oge odaklanabilir bir baglanti, yani Tab kabi zaten suruyor
            (tablo kaplarinda durum farkliydi, orada metin vardi). */}
        {/* MOBILDE SUZGEC SERIDI — cip satiri orada gizli oldugu icin,
            aktif suzgeci GOREBILMENIN ve KALDIRABILMENIN tek yolu bu.
            Yalnizca bir kategori seciliyken ciziliyor; olagan gorunumde
            ekranda hicbir sey yok. */}
        {seciliKategori ? (
          <div className="flex items-center gap-2 md:hidden">
            <span className="min-w-0 flex-1 truncate rounded-full bg-blue-950 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white">
              {TOOLS_DATABASE.find((c) => c.slug === seciliKategori)?.category}
            </span>
            <Link
              href={aramaBos ? "/tools" : `/tools?ara=${encodeURIComponent(searchTerm.trim())}`}
              onClick={() => setKategori(null)}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-blue-900/30 hover:text-blue-900"
            >
              Tümü{" "}
              <span className="rounded-full bg-blue-900/10 px-1.5 font-bold tabular-nums">{toplamArac}</span>
            </Link>
          </div>
        ) : null}

        {/* CIP SATIRI ARTIK YALNIZCA MASAUSTUNDE. Olculdu (canli, 375px):
            cip metinleri akordeon basliklariyla BIREBIR ayni
            ("🍏Klinik Nütrisyon (Beslenme)10" ile "🍏Klinik Nütrisyon
            (Beslenme)10›"), yani mobilde ayni 18 kategori iki ayri
            affordansla duruyordu. Masaustunde akordeonlarin hepsi ACIK,
            yani orada kompakt bir dizin yok ve cipler tek suzgec — bu
            yuzden orada kaliyor. */}
        <div ref={cipKabiRef} className="hidden gap-2 md:flex md:flex-wrap">
          <Link
            href={aramaBos ? "/tools" : `/tools?ara=${encodeURIComponent(searchTerm.trim())}`}
            aria-current={!seciliKategori ? "true" : undefined}
            onClick={() => setKategori(null)}
            className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all shrink-0 whitespace-nowrap ${
              !seciliKategori
                ? "bg-blue-950 text-white border-blue-950"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-900/30 hover:text-blue-900"
            }`}
          >
            Tümü{" "}
            <span
              className={`px-1.5 rounded-full font-bold tabular-nums ${
                !seciliKategori ? "bg-white/15" : "bg-blue-900/10"
              }`}
            >
              {toplamArac}
            </span>
          </Link>
          {TOOLS_DATABASE.map(cat => (
            <Link
              key={cat.slug}
              href={
                aramaBos
                  ? `/tools?kategori=${cat.slug}`
                  : `/tools?kategori=${cat.slug}&ara=${encodeURIComponent(searchTerm.trim())}`
              }
              aria-current={seciliKategori === cat.slug ? "true" : undefined}
              onClick={() => setKategori(cat.slug)}
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                seciliKategori === cat.slug
                  ? "bg-blue-950 text-white border-blue-950"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-900/30 hover:text-blue-900"
              }`}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.category}
              <span
                className={`px-1.5 rounded-full font-bold tabular-nums ${
                  seciliKategori === cat.slug ? "bg-white/15" : "bg-blue-900/10"
                }`}
              >
                {cat.items.length}
              </span>
            </Link>
          ))}
        </div>

        {/* SONUÇ YOK */}
        {filteredData.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <div aria-hidden="true" className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-bold text-slate-500">
              &quot;{searchTerm}&quot; için sonuç yok.
            </p>
            {/* İki çıkış: aynı yüzeyde kalmak ya da KÜTÜPHANEYE geçmek.
                Bu kutu yalnızca "Aramayı temizle" sunuyordu; oysa burada
                aranan terimlerin çoğu (hastalık, semptom) araç değil KONU.
                Aynı sınıf site başlığındaki aramada da vardı ve orada da
                çıkış yolu eklendi. */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-900 hover:bg-slate-200 transition-colors"
              >
                Aramayı temizle
              </button>
              <Link
                href="/topics"
                className="rounded-full bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-800 hover:bg-blue-100 transition-colors"
              >
                Kütüphaneye bak
              </Link>
            </div>
          </div>
        )}

        {/* ARAÇ KARTLARI GRİD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
          {filteredData.map((cat, idx) => (
            <details
              key={idx}
              open={acikMi(cat.slug)}
              onToggle={(e) => {
                // ZORLA ACIK durumda toggle YOK SAYILIYOR. Olculdu: arama
                // sirasinda `open` prop u true olunca tarayici toggle atiyor
                // ve isleyici o kategorileri KALICI tercihten siliyordu —
                // aramayi temizleyen kullanici 3 kategoriyi acik buluyordu.
                if (zorlaAcik) return;
                const acik = (e.currentTarget as HTMLDetailsElement).open;
                setKapaliKategoriler((onceki) => {
                  const yeni = new Set(onceki ?? []);
                  if (acik) yeni.delete(cat.slug); else yeni.add(cat.slug);
                  return yeni;
                });
              }}
              className="space-y-5 [&[open]>summary_.ms-ok]:rotate-90"
            >
              {/* Baslik SUMMARY'nin icinde: belge taslagi korunuyor (h2),
                  acma/kapama da klavyeyle calisiyor — summary dogustan
                  odaklanabilir ve Enter/Space ile calisiyor. */}
              <summary className="flex items-center gap-3 pl-2 cursor-pointer list-none marker:content-[''] rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                <div aria-hidden="true" className="w-9 h-9 rounded-2xl bg-blue-900/5 flex items-center justify-center border border-blue-900/10 shadow-sm text-xl">
                   {cat.icon}
                </div>
                <h2 className="text-xs font-black text-blue-900 uppercase tracking-[0.25em]">{cat.category}</h2>
                <span className="text-[10px] font-black text-slate-400 tabular-nums">{cat.items.length}</span>
                <span aria-hidden="true" className="ms-ok ml-auto mr-2 text-slate-300 transition-transform">›</span>
              </summary>

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
            </details>
          ))}
        </div>

        {/* ALT PANEL */}
        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6 mt-16 text-center">
          <div className="flex items-start gap-4 justify-center max-w-2xl mx-auto">
            <span aria-hidden="true" className="text-amber-500 text-xl">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              MediSea araçları sağlık profesyonelleri için karar destek amaçlıdır. Klinik değerlendirmenin yerini alamaz. Veriler tıbbi sorumluluk içermez.
            </p>
          </div>
          <div className="text-[9px] font-black text-blue-900/80 uppercase tracking-[0.4em]">
            © 2026 MediSea Donanması • Klinik Karar Destek Birimi
          </div>
        </div>

      </div>
    </div>
  );
}