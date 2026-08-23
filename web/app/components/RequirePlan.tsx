// C:\Users\hucig\Medknowledge\web\app\components\RequirePlan.tsx
"use client";
import React from "react";
import Link from "next/link";

export default function RequirePlan({
  min = "V",
  plan = "P",
  baslik,
  children,
}: {
  min?: "V" | "M" | "P";
  plan?: "V" | "M" | "P";
  /** Kilitli kartın erişilebilir adını ayırt etmek için. Aynı sayfada
   *  birden çok kilitli kart varsa hepsi "Planları gör" diye okunurdu. */
  baslik?: string;
  children: React.ReactNode;
}) {
  // Orijinal VIP Kapı Mantığı (Bozulmadı)
  const ok = (min === "V") || (min === "M" && (plan === "M" || plan === "P")) || (min === "P" && plan === "P");

  if (!ok) {
    /**
     * KİLİTLİ KART BİR BAĞLANTIDIR — bir dönem ÖLÜ bir bilgi kutusuydu.
     *
     * Ölçüldü (/tr/premium, ücretsiz kullanıcı): sayfanın TAMAMINDA sıfır
     * bağlantı ve sıfır düğme vardı. Yedi kilitli kart aynı cümleyi yedi kez
     * tekrarlıyor ("daha yüksek bir üyelik planı gerekiyor") ve hiçbiri
     * tıklanabilir değildi. Premium'a GİRİŞ sayfası, üyelik almanın yolunu
     * göstermiyordu; kullanıcının tek çıkışı tarayıcının geri tuşuydu.
     *
     * Belgedeki kural: "Çıkış yolu ver. Her hata kartında geri dönülecek bir
     * bağlantı olsun; yoksa kullanıcı çıkmazda kalır." Kilitli içerik de aynı
     * sınıf — kilidi göstermek yetmiyor, açmanın yolunu da göstermeli.
     *
     * ZEMİN OPAK OLMAK ZORUNDA. Bu kart bir dönem `bg-slate-800/50` idi ve
     * sayfanın zeminine göre değişiyordu: /profile beyaz olduğu için orta
     * griye biniyor, üstündeki açık yazı 2.48 kontrastta kalıyordu (ölçüldü).
     * `koyu-yuzey` ayrıca globals.css'teki genel koyulaştırmayı bu ağaçta
     * geri alıyor — ağaçta açık kart YOK, doğrulandı.
     *
     * Başlık artık `<h3>` DEĞİL: yedi kilitli kart yedi özdeş "Özel İçerik"
     * başlığı basıyordu ve belge taslağını gürültüye boğuyordu. Ad, kartın
     * kendi `aria-label`ında ve konusuyla birlikte veriliyor.
     */
    return (
      <Link
        href="/uyelik"
        /* Etiket "planları gör" DEĞİL — ölçüldü: /uyelik sayfasının ilk
           başlığı "Premium henüz satışta değil" ve fiyat bilinçli olarak yok.
           "Planları gör" bir fiyat listesi vaat ediyordu; hedef onu
           karşılamıyordu. "Neler dahil" sayfanın bugün GERÇEKTEN anlattığı
           şey (ücretsiz/premium ayrımı, kapsam sayıları) ve satış açılınca
           da yanlışlaşmıyor. Avlanan "ilan ≠ gerçek" sınıfını kendi
           etiketinde üretme. */
        aria-label={baslik ? `${baslik}: üyelikle açılır — neler dahil?` : "Üyelikle açılır — neler dahil?"}
        className="koyu-yuzey group my-2 flex items-center gap-3 rounded-xl border border-blue-900/50 bg-slate-800 p-4 shadow-inner transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-200">Üyelikle açılır</span>
          <span className="block text-xs font-medium text-slate-400">Neler dahil?</span>
        </span>

        <span
          aria-hidden="true"
          className="ml-auto flex-shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </Link>
    );
  }

  return <>{children}</>;
}
