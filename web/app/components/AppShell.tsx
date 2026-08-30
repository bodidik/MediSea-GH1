import SiteHeader from "@/app/components/SiteHeader";
import ReadingTools from "@/app/components/ReadingTools";
import NotePanel from "@/app/components/NotePanel";
import { KLINIK_SORUMLULUK } from "@/app/lib/sorumluluk";
import ReadingHint from "@/app/components/ReadingHint";
import Link from "next/link";
import React from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">

      {/* İÇERİĞE ATLA — yalnızca klavyeyle odaklanınca görünür.
          Masaüstü başlığında 13 odaklanabilir öge var (9 branş bağlantısı,
          arama, giriş, kayıt, menü); klavye kullanıcısı bunları HER sayfada
          tek tek geçmek zorundaydı. */}
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        İçeriğe atla
      </a>

      {/* ÜST MENÜ */}
      <SiteHeader />

      {/* ANA İÇERİK (Sitenin ortası) */}
      {/**
       * `tabIndex={-1}` ATLAMA BAĞLANTISI İÇİN ŞART — belgede kayıtlı kural
       * araç sayfalarında uygulanıyordu, site kabuğunda UYGULANMIYORDU.
       *
       * ÖLÇÜLDÜ (canlı):
       *   araç sayfası : hedef `<span id="arac-icerik" tabindex="-1">`  ✓
       *   site kabuğu  : hedef `<main id="icerik">`, tabindex YOK        ✗
       *
       * Kuralın gerekçesi belgede yazılı: odaklanabilir OLMAYAN bir ögeye
       * atlandığında tarayıcı görünümü kaydırır ama ODAĞI TAŞIMAZ — sonraki
       * Tab yine gezinmenin başına döner ve atlama bağlantısı hiçbir işe
       * yaramaz. Ekran okuyucu da varış noktasını duyurmaz.
       *
       * `focus:outline-none`: `<main>` bütün sayfayı kapsıyor, çevresine
       * halka çizmek görsel gürültü olurdu. Halka gerçekten gezilebilir
       * ögelerin işi; buraya odak yalnızca programla (atlama ile) geliyor.
       */}
      <main id="icerik" tabIndex={-1} className="flex-1 w-full flex flex-col focus:outline-none">
        {children}
      </main>

      {/* Okuma araçları — yalnızca [data-readable] taşıyan sayfalarda görünür */}
      <ReadingTools />
      <NotePanel />
      <ReadingHint />

      {/* --- YENİ PREMİUM FOOTER --- */}
      <footer className="bg-blue-950 text-blue-200/70 border-t-4 border-amber-500 mt-auto relative overflow-hidden">
        {/* Arka plan süslemesi (Işık hüzmesi) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
            
            {/* 1. Kolon: Logo ve Vizyon */}
            <div className="md:col-span-5">
              <Link href="/" className="inline-block font-black text-3xl tracking-tight text-white mb-4">
                <span className="text-blue-500 italic">Medi</span>Sea
              </Link>
              <p className="text-sm leading-relaxed max-w-sm mb-6 font-medium">
                Tıp profesyonelleri ve asistan hekimler için güncel, kanıta dayalı ve pratik iç hastalıkları klinik rehberi. Nöbetlerde ve YDUS sürecinde en güçlü silahınız.
              </p>
              {/* Sosyal medya ikonları (𝕏, in) kaldırıldı: <span> olarak
                  duruyorlardı — imleç "pointer", üzerine gelince hareket
                  ediyorlardı, ama bağlantı da tıklama işleyicisi de yoktu.
                  Yani tıklanabilir görünüp hiçbir şey yapmıyorlardı; klavyeyle
                  de erişilemiyorlardı. Sahte etkileşim vaadi, hiç ikon
                  olmamasından kötü. Hesaplar açılınca gerçek <a> olarak geri
                  konabilirler. */}
            </div>

            {/* 2. Kolon: Hızlı Erişim */}
            <div className="md:col-span-3">
              <h2 className="font-sans mt-0 text-white font-black uppercase tracking-widest text-xs mb-6 border-b border-blue-800/50 pb-3">
                Kütüphane
              </h2>
              <ul className="space-y-1 text-sm font-semibold">
                <li><Link href="/topics/hematoloji" className="block py-1.5 hover:text-amber-400 transition-colors">Hematoloji</Link></li>
                <li><Link href="/topics/romatoloji" className="block py-1.5 hover:text-amber-400 transition-colors">Romatoloji</Link></li>
                <li><Link href="/topics/gastroenteroloji" className="block py-1.5 hover:text-amber-400 transition-colors">Gastroenteroloji</Link></li>
                <li><Link href="/topics/onkoloji" className="block py-1.5 hover:text-amber-400 transition-colors">Tıbbi Onkoloji</Link></li>
              </ul>
            </div>

            {/* 3. Kolon: Kurumsal & Araçlar */}
            <div className="md:col-span-4">
              <h2 className="font-sans mt-0 text-white font-black uppercase tracking-widest text-xs mb-6 border-b border-blue-800/50 pb-3">
                Platform
              </h2>
              <ul className="space-y-1 text-sm font-semibold">
                <li>
                  {/* /premium diye bir rota yok; premium tanıtımı dil önekiyle duruyor. */}
                  <Link href="/tr/premium/ydus" className="flex items-center gap-2 py-1.5 text-amber-400 hover:text-amber-300 transition-colors">
                    Premium YDUS <span aria-hidden="true" className="text-amber-500">★</span>
                  </Link>
                </li>
                <li><Link href="/tools" className="block py-1.5 hover:text-white transition-colors">Klinik Araçlar & Algoritmalar</Link></li>
                <li><Link href="/calisma-alanim" className="block py-1.5 hover:text-white transition-colors">Çalışma Alanım</Link></li>
                <li><Link href="/tekrar" className="block py-1.5 hover:text-white transition-colors">Tekrar</Link></li>
                <li><Link href="/uyelik" className="block py-1.5 hover:text-white transition-colors">Üyelik</Link></li>
                {/* "Hakkımızda" ve "İletişim" bağlantıları kaldırıldı: sayfaları
                    hiç yazılmamıştı ve ikisi de 404 veriyordu. Bu sayfalar
                    yazarın kim olduğu ve hangi kanaldan ulaşılacağı gibi
                    uydurulamayacak bilgi istiyor; içerik hazır olunca geri
                    konacak. Tıbbi içerikte yazar künyesi güven için önemli. */}
              </ul>
            </div>

          </div>

          {/* Klinik sorumluluk — bu satir ICERIK degil KABUK isi.
              Olculdu: 423 gorunur konunun 359unda (%85) hicbir sorumluluk
              ifadesi yok ve alt bilgi de sessizdi; oysa 130 aracin 130unda
              ayni uyari ARAC KABUGU tarafindan basiliyor. 423 icerik
              dosyasina metin yazmak yerine — icerik kullanicinin isi —
              uyari, araclardaki gibi kabuktan geliyor ve (site) grubundaki
              her sayfayi birden kapsiyor. Dil, araclarin ev sesinden alindi. */}
          <p className="mt-10 text-[11px] leading-relaxed text-blue-100/90">
            {KLINIK_SORUMLULUK}
          </p>

          {/* Alt Bilgi (Copyright) */}
          <div className="pt-8 border-t border-blue-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-blue-400">
            <div>
              &copy; {new Date().getFullYear()} MediSea Eğitim Platformu. Tüm hakları saklıdır.
            </div>
            {/* Gizlilik Politikası ve Kullanım Koşulları bağlantıları geçici
                olarak kaldırıldı; ikisinin de sayfası yoktu, 404 veriyorlardı.
                Var olmayan bir hukuk metnine bağlantı vermek, bağlantı
                vermemekten kötü. Ödeme alınmadan ÖNCE yazılmaları gerekiyor
                (KVKK aydınlatma yükümlülüğü) — o zaman buraya geri konacaklar. */}
            {/* Koyu zeminde blue-500 yalnızca 4.00 kontrast veriyor — opaklığı
                artırmak yetmiyor, rengin kendisi yeterince açık değil.
                blue-300 eşiği geçiyor. */}
            <div className="text-blue-300 hidden md:block border-l border-blue-900 pl-4 ml-4">
              Sürüm 2.0.1
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}