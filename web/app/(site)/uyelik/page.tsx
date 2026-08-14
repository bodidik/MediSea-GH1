import type { Metadata } from "next";
import Link from "next/link";
import { icerikSayilari } from "@/lib/icerik-sayaci";

/**
 * Üyelik sayfası.
 *
 * Bu adres bir süre 404 veriyordu ve erişim kartındaki "Premium'a Geç"
 * düğmesi tam buraya gidiyordu: ücretsiz kullanıcı premium bir konuya
 * girip yükseltmek istediğinde boşluğa düşüyordu.
 *
 * Sayfada fiyat YOK ve e-posta toplanmıyor. İkisi de bilinçli: satış
 * henüz açılmadı, olmayan bir fiyatı yazmak yanıltıcı olur; ön kayıt
 * formu ise aydınlatma metni (gizlilik politikası) yayımlanmadan kişisel
 * veri toplamak demektir. Bunlar hazır olduğunda sayfa buna göre büyür.
 */

export const metadata: Metadata = {
  title: "Üyelik",
  description:
    "MediSea'da neyin ücretsiz, neyin Premium olduğunu açıklayan sayfa. Açık kütüphane ve çalışma araçları herkese açık; Premium, YDUS hazırlık materyalini kapsar.",
  alternates: { canonical: "/uyelik" },
  openGraph: {
    type: "website",
    title: "Üyelik — MediSea",
    description:
      "Açık kütüphane ve çalışma araçları ücretsiz. Premium, YDUS hazırlık materyalini kapsar.",
    url: "/uyelik",
  },
};

/**
 * Sayılar elle YAZILMIYOR, sayılıyor.
 *
 * Bu sayfada "13 branşta" ve "114 skor" sabit yazılıydı. Aynı kalıp sitenin
 * başka yerlerinde de vardı ve hepsinde aynı sonucu verdi: içerik büyürken
 * sabit sayı sessizce yalana dönüşüyor (ana sayfa "6+ araç" derken 114 araç
 * vardı). Satış sayfasında yanlış sayı, güveni doğrudan yaralar.
 *
 * Premium tarafa da somut sayı eklendi: önce yalnızca niteleyici cümleler
 * vardı ("derinlemesine anlatım"). Gerçek sayı hem daha ikna edici hem daha
 * dürüst — üstelik satış açılmadığı için kimseyi yanıltmıyor.
 */
function icerikKartlari(s: ReturnType<typeof icerikSayilari>) {
  const ucretsiz = [
    {
      baslik: "Açık kütüphane",
      metin: `${s.brans} branşta ${s.konu} konu anlatımı. Kayıt olmadan, sınırsız.`,
    },
    {
      baslik: "Klinik hesaplayıcılar",
      metin: `${s.arac} skor ve hesaplayıcı — eGFR'den Wells'e, hepsi serbest.`,
    },
    {
      baslik: "Çalışma araçları",
      metin:
        "Vurgulama, not defteri, tekrar destesi. Kendi işaretlemelerin cihazında durur, bir şey ödemeden çalışırsın.",
    },
  ];

  const premium = [
    {
      baslik: "YDUS konu anlatımları",
      metin: `Sınav odaklı ${s.premiumKonu} başlık; açık kütüphanenin üstüne kurulu derinlemesine anlatım.`,
    },
    {
      baslik: "Soru ve quiz setleri",
      metin: `${s.premiumSoru} açıklamalı soru. Yanlışlarını ayıklayıp yalnızca onları tekrar çözebilirsin.`,
    },
    {
      baslik: "Hızlı tekrar kartları",
      metin: `${s.premiumKart} kart. Bildiklerini işaretle, kalanları çalış; ilerlemen kayıtlı kalır.`,
    },
    {
      baslik: "Klinik vakalar",
      metin: `${s.premiumVaka} vaka; adım adım karar verdiren, gerçek hasta akışına yakın çözümler.`,
    },
  ];

  return { ucretsiz, premium };
}

export default function UyelikSayfasi() {
  const sayilar = icerikSayilari();
  const { ucretsiz: UCRETSIZ, premium: PREMIUM } = icerikKartlari(sayilar);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* BAŞLIK */}
        <div className="border-l-8 border-blue-900 pl-6 py-2">
          <div className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.3em] mb-2">
            MediSea Üyelik
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">
            Neyin ücretsiz,<br />neyin Premium olduğu
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-4 max-w-2xl leading-relaxed">
            Kısa cevap: okuduğun her şey ücretsiz. Premium, YDUS'a hazırlananlar
            için sınav odaklı materyali kapsıyor.
          </p>
        </div>

        {/* DURUM — dürüstlük burada başlıyor */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🚧</span>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide text-amber-900 mb-2">
                Premium henüz satışta değil
              </h2>
              <p className="text-sm text-amber-900/80 font-medium leading-relaxed">
                Sınav materyali hâlâ yazılıyor ve hazır olmadan para almak
                istemiyoruz. Bu sayfada bu yüzden fiyat göremezsin — satış
                açıldığında burada olacak. O zamana kadar açık kütüphanenin
                tamamı ve çalışma araçları kullanımına açık.
              </p>
            </div>
          </div>
        </div>

        {/* ÜCRETSİZ */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-lg">
              ✓
            </span>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-800">
              Ücretsiz — kalmaya da devam edecek
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {UCRETSIZ.map((k) => (
              <div key={k.baslik}>
                <h3 className="text-sm font-black text-blue-950 mb-1.5">{k.baslik}</h3>
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{k.metin}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PREMIUM */}
        <section className="bg-blue-950 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl border-t-8 border-amber-400">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-9 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-lg">
              ★
            </span>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
              Premium — YDUS hazırlığı
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PREMIUM.map((k) => (
              <div key={k.baslik}>
                <h3 className="text-sm font-black text-white mb-1.5">{k.baslik}</h3>
                <p className="text-[13px] text-blue-200/80 leading-relaxed font-medium">{k.metin}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-blue-300 font-bold uppercase tracking-widest mt-7 pt-6 border-t border-blue-900">
            Premium alan, premium içeriğin tamamına sahip olur — branş branş satılmaz.
          </p>
        </section>

        {/* NE YAPABİLİRSİN */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-blue-900/80 mb-3">
            Şimdi ne yapabilirsin
          </h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 max-w-2xl">
            Ücretsiz hesap açtığında vurguların, notların ve tekrar desten
            kaydedilmeye başlar. Premium açıldığında bu birikimin yerinde durur —
            baştan başlamazsın.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kayit"
              className="px-6 py-3 rounded-full bg-blue-950 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-colors"
            >
              Ücretsiz hesap aç
            </Link>
            <Link
              href="/topics"
              className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-blue-900 text-xs font-black uppercase tracking-widest hover:border-blue-900/30 transition-colors"
            >
              Kütüphaneye göz at
            </Link>
            <Link
              href="/tools"
              className="px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-blue-900 text-xs font-black uppercase tracking-widest hover:border-blue-900/30 transition-colors"
            >
              Klinik araçlar
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
