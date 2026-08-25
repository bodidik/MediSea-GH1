import type { Metadata } from "next";
import Link from "next/link";
import { SPECIALTIES } from "@/app/lib/specialties";

/**
 * Özel 404.
 *
 * Öncesinde Next'in varsayılan ekranı çıkıyordu: İngilizce, markasız ve
 * çıkışsız. Türkçe bir tıp kaynağında bu hem yabancı duruyor hem de
 * ziyaretçiyi kaybediyor — gidecek yer göstermeyen bir hata sayfası, sekmeyi
 * kapatma davetidir.
 *
 * Bu sayfa bir çıkış listesi sunuyor: kütüphane, araçlar ve branşlar.
 * Arama motorundan gelen ziyaretçi yanlış adrese düşse bile sitede kalabilir.
 *
 * noindex: hata sayfasının dizine girmesi anlamsız.
 *
 * KÖK ÖGE `<main>` — bu sayfa AppShell ALMIYOR. Ölçüldü (canlı 404):
 * `main`, `nav`, `header`, `footer` sayısı DÖRDÜ DE SIFIRDI. Sebebi
 * belgede yazan sınıfın aynısı: AppShell yalnızca `(site)/layout.tsx`te
 * kurulu, `app/not-found.tsx` ise kökte ve eşleşmeyen adreslerde kök
 * düzenle birlikte çiziliyor.
 *
 * `<main>` kök DÜZENE konulamaz: o zaman AppShell'in kendi `<main
 * id="icerik">`i ile çakışır ve `(site)` sayfalarında İKİ main landmark'ı
 * oluşur (geçersiz; ekran okuyucu hangisinin ana içerik olduğunu bilemez).
 * Bu yüzden landmark burada, tıpkı `app/giris/layout.tsx`teki gibi.
 *
 * Üst menü ve alt bilgi bilerek verilmiyor: 404 odaklanmış bir yüzey ve
 * çıkış listesini kendi içinde taşıyor.
 */
export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  description:
    "Aradığın sayfa MediSea'de yok. Kütüphaneden ya da klinik araçlardan devam edebilirsin.",
  robots: { index: false, follow: true },

  /**
   * canonical ve og:url BİLEREK KALDIRILIYOR (`null` Next'te miras alınan
   * alanı siler).
   *
   * Bu sayfa TEK bir adreste değil, sitedeki HER kırık adreste çiziliyor —
   * yani kendini gösteren bir canonical yazılamaz. Kaldırılmazsa kökün
   * `canonical: "/"` değeri miras alınıyordu ve her kırık bağlantı
   * "ben ana sayfanın kopyasıyım" diyordu; üstelik sayfa aynı anda
   * `noindex` taşıyor, yani noindex sinyali ANA SAYFAYA işaret eden bir
   * canonical'la eşleşiyordu.
   *
   * `og:title` ayrıca YAZILMIYOR: Next onu sayfanın kendi `title`ından
   * türetiyor (ölçüldü). Elle yazmak dosya tabanlı paylaşım görselinin
   * mirasını keserdi.
   */
  alternates: { canonical: null },
};

export default function BulunamadiSayfasi() {
  return (
    <main className="min-h-screen bg-slate-50 text-blue-950 font-sans px-4 py-16">
      <div className="max-w-3xl mx-auto">

        <div className="border-l-8 border-blue-900 pl-6 py-2 mb-10">
          {/*
            Opaklık /50 DEĞİL /80: saydam metin, alfayı zemine bindirmeyen bir
            ölçümde opak sanılır. Ölçüldü — /50 bu künyeyi beyaz zeminde 2.67
            kontrasta düşürüyordu (eşik 4.5), /80 ise 5.92 veriyor.

            /80 sitenin kendi değeri: kaynakta 188 kullanım /80, yalnızca bu
            sayfadaki iki satır /50 kalmıştı.
          */}
          <div className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.3em] mb-2">
            404 · Sayfa bulunamadı
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">
            Aradığın sayfa burada değil
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-4 max-w-xl leading-relaxed">
            Adres değişmiş ya da sayfa hiç var olmamış olabilir. Aşağıdan
            devam edebilirsin.
          </p>
        </div>

        {/* Ana çıkışlar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <Link
            href="/topics"
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-900/30 hover:shadow-lg transition-all"
          >
            <div aria-hidden="true" className="text-2xl mb-2">📚</div>
            <div className="text-sm font-black text-blue-950 uppercase italic">Kütüphane</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Branşlara göre konu anlatımları
            </div>
          </Link>

          <Link
            href="/tools"
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-900/30 hover:shadow-lg transition-all"
          >
            <div aria-hidden="true" className="text-2xl mb-2">🧮</div>
            <div className="text-sm font-black text-blue-950 uppercase italic">Klinik Araçlar</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Hesaplayıcılar ve skorlar
            </div>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-900/30 hover:shadow-lg transition-all"
          >
            <div aria-hidden="true" className="text-2xl mb-2">⚓</div>
            <div className="text-sm font-black text-blue-950 uppercase italic">Ana Sayfa</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Baştan başla
            </div>
          </Link>
        </div>

        {/* Branşlar — doğrudan bir yere düşmek isteyen için */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-8">
          <h2 className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.25em] mb-4">
            Branşlar
          </h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((b) => (
              <Link
                key={b.slug}
                href={`/topics/${b.slug}`}
                className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-black uppercase tracking-widest text-blue-900 hover:border-blue-900/30 hover:bg-white transition-all"
              >
                {b.title}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
