"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Klinik Kırılganlık Ölçeği (CFS) — Rockwood 2005, 2.0 sürümü (2020).
 * Hesap yok: klinisyen hastayı dokuz tanımdan BİRİNE yerleştirir. Araç tanımları
 * yan yana koyar ve seçilen düzeyin grubunu söyler.
 */
const DUZEYLER = [
  { n: 1, ad: "Çok formda", tanim: "Sağlam, aktif, enerjik ve motive. Düzenli egzersiz yapar; yaşına göre en formda olanlardandır." },
  { n: 2, ad: "Formda", tanim: "Aktif hastalık belirtisi yok, ama 1. düzeydekinden daha az formda. Zaman zaman ya da mevsimsel olarak egzersiz yapar." },
  { n: 3, ad: "İyi idare ediyor", tanim: "Tıbbi sorunları iyi kontrol altında, ama belirtileri olabilir. Rutin yürüyüş dışında düzenli olarak aktif değildir." },
  { n: 4, ad: "Çok hafif kırılgan", tanim: "Günlük yardıma bağımlı değil, ama belirtileri etkinliklerini kısıtlıyor. Sık yakınma: 'yavaşladım', gün içinde yorgunluk." },
  { n: 5, ad: "Hafif kırılgan", tanim: "Belirgin yavaşlama; ileri günlük işlerde (finans, ulaşım, ağır ev işi) yardıma ihtiyaç duyar. Tipik olarak alışveriş, tek başına dışarı çıkma, yemek hazırlama ve ev işleri giderek bozulur." },
  { n: 6, ad: "Orta kırılgan", tanim: "Ev dışı tüm etkinliklerde ve ev işlerinde yardım gerekir. Merdivende sorun yaşar, banyoda yardıma, giyinmede asgari yardıma (yönlendirme, gözetim) ihtiyaç duyar." },
  { n: 7, ad: "Ağır kırılgan", tanim: "Fiziksel ya da bilişsel sebeple kişisel bakımda tamamen bağımlı. Buna karşın durumu stabil, ~6 ay içinde ölüm riski yüksek görünmüyor." },
  { n: 8, ad: "Çok ağır kırılgan", tanim: "Kişisel bakımda tamamen bağımlı, yaşamın sonuna yaklaşıyor. Hafif bir hastalıktan bile tipik olarak toparlanamaz." },
  { n: 9, ad: "Terminal dönemde", tanim: "Yaşam sonuna yaklaşıyor: beklenen yaşam süresi < 6 ay, ama başka yönden belirgin kırılganlık göstermiyor (terminal dönemdeki pek çok kişi yakın zamana kadar egzersiz yapabilir)." },
] as const;

const BANTLAR: Bant[] = [
  { aralik: "1–3", etiket: "Kırılgan değil", alt: "Fit ya da hastalığı kontrol altında; kırılganlık yok.", renk: "emerald" },
  { aralik: "4", etiket: "Çok hafif kırılgan", alt: "Bağımsız ama yavaşlamış — önleyici müdahale için pencere.", renk: "amber" },
  { aralik: "5–6", etiket: "Hafif–orta kırılgan", alt: "Enstrümental / temel günlük işlerde yardım gerekiyor — kapsamlı geriatrik değerlendirme.", renk: "orange" },
  { aralik: "7–9", etiket: "Ağır kırılgan", alt: "Tam bağımlılık ya da yaşam sonu — bakım hedefleri ve yoğun girişimlerin yararı konuşulmalı.", renk: "rose" },
];

function bantBul(n: number): Bant {
  if (n <= 3) return BANTLAR[0];
  if (n === 4) return BANTLAR[1];
  if (n <= 6) return BANTLAR[2];
  return BANTLAR[3];
}

export default function KlinikKirilganlikPage() {
  const [secili, setSecili] = React.useState<number | null>(null);
  const bant = secili !== null ? bantBul(secili) : null;

  return (
    <OlcekKabugu
      slug="klinik-kirilganlik"
      ikon="🍂"
      baslik="Klinik Kırılganlık Ölçeği"
      altBaslik="CFS 2.0 · Rockwood · 1–9 düzey"
      paylasim={{ cfs: secili }}
      not={
        <>
          <p>
            <strong>Nasıl puanlanır:</strong> hastanın <strong>akut hastalıktan yaklaşık 2 hafta önceki</strong> olağan durumu esas alınır — o günkü akut tablo değil.
            Demanslı hastada kırılganlık düzeyi genellikle demansın evresine karşılık gelir (hafif demans 5, orta 6, ağır 7).
          </p>
          <p>
            65 yaş ve üzeri için geliştirilmiştir; genç erişkinlerde ve tek bir sabit engelliliği (ör. öğrenme güçlüğü) olanlarda geçerli değildir.
            Bir tarama ölçeğidir, kapsamlı geriatrik değerlendirmenin yerini tutmaz. Rockwood K ve ark., CMAJ 2005; CFS 2.0, 2020.
          </p>
        </>
      }
    >
      <div role="group" aria-labelledby="cfs-baslik" className="space-y-2">
        <p id="cfs-baslik" className="text-[11px] font-black text-slate-600 uppercase tracking-widest px-1">
          Hastanın 2 hafta önceki durumuna en uyan tanımı seçin
        </p>
        {DUZEYLER.map((d) => {
          const aktif = secili === d.n;
          return (
            <button
              key={d.n}
              type="button"
              aria-pressed={aktif}
              onClick={() => setSecili(aktif ? null : d.n)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all
                ${aktif ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"}`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shrink-0
                  ${aktif ? "bg-amber-400 text-blue-900" : "bg-slate-100 text-blue-900"}`}
              >
                {d.n}
              </span>
              <span className="min-w-0">
                <span className={`block text-[12px] font-black uppercase tracking-wide ${aktif ? "text-white" : "text-blue-900"}`}>{d.ad}</span>
                <span className={`block text-[11px] leading-snug mt-0.5 ${aktif ? "text-blue-100" : "text-slate-600"}`}>{d.tanim}</span>
              </span>
            </button>
          );
        })}
      </div>

      <SkorPaneli skor={secili} payda={9} bantlar={BANTLAR} aktif={bant} eksikMetni="Bir düzey seçin" />
    </OlcekKabugu>
  );
}
