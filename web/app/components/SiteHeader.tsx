"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { searchAction } from "@/app/actions"; // Senin orijinal arama eylemin

// Arama sonucu tipi
type SearchResult = {
  title: string;
  section: string;
  slug: string;
  type: 'topic' | 'section';
};

/**
 * Menüde gösterilen araç kategorileri — araç sayısı en yüksek altı grup.
 * Kimlikler app/tools/page.tsx içindeki TOOLS_DATABASE slug'larıyla birebir
 * aynı olmalı; tutmazsa bağlantı süzgeci boş açar. Tam liste "Tüm Araçlar"da.
 */
const ARAC_KATEGORILERI = [
  { slug: "acil",          icon: "🚨", ad: "Acil & Kritik Bakım" },
  { slug: "romatoloji",    icon: "🦴", ad: "Romatoloji" },
  { slug: "nutrisyon",     icon: "🍏", ad: "Klinik Nütrisyon" },
  { slug: "nefroloji",     icon: "🧪", ad: "Nefroloji" },
  { slug: "endokrinoloji", icon: "🦋", ad: "Endokrinoloji" },
  { slug: "kardiyoloji",   icon: "❤️", ad: "Kardiyoloji" },
];

/**
 * ÇIKIŞTAN SONRAKİ YÖNLENDİRMEYİ NEXTAUTH'A BIRAKMIYORUZ — sebebi ölçüldü.
 *
 * `signOut({ callbackUrl: "/" })` göreli adresi NextAuth'un ÇIKARDIĞI taban
 * adrese göre çözüyor. Dev sunucusu `next dev -H 0.0.0.0` ile bağlandığı için
 * o taban `http://0.0.0.0:3000` oluyordu ve çıkış yapan kullanıcı tarayıcının
 * ERR_ADDRESS_INVALID ekranına düşüyordu. `0.0.0.0` bir DİNLEME adresi,
 * gidilecek adres değil.
 *
 * Ölçüldü: yerelde `/api/auth/providers` `http://0.0.0.0:3000/…` döndürüyor,
 * tarayıcı ise `http://localhost:3000`de. CANLIDA taban doğru
 * (`https://medi-sea-gh-1.vercel.app`) — yani kusur yalnızca geliştirme
 * ortamında görünüyordu, kullanıcılara ulaşmıyordu.
 *
 * İLK ÇÖZÜM FİKRİ YANLIŞTI ve bunu ancak kütüphanenin kaynağı gösterdi:
 * `callbackUrl: window.location.origin + "/"` de kurtarmazdı. @auth/core'un
 * varsayılan `redirect` geri çağrısı (node_modules/@auth/core/lib/init.js)
 * mutlak adresi TABANLA karşılaştırıyor ve origin tutmuyorsa TABANA düşüyor:
 *
 *     if (url.startsWith("/"))                  return `${baseUrl}${url}`;
 *     else if (new URL(url).origin === baseUrl) return url;
 *     return baseUrl;                           // ← 0.0.0.0'a döner
 *
 * Yani ne göreli ne de farklı host taşıyan mutlak adres işe yarardı.
 *
 * Çare: `redirect: false` ile oturumu kapat, yönlendirmeyi tarayıcıya bırak.
 * Göreli `/` adresini tarayıcı BULUNULAN sayfaya göre çözer — localhost,
 * LAN IP'si (telefondan bakarken) ve üretim alan adında da doğru olan tek
 * yol bu. `NEXTAUTH_URL`i sabitlemek LAN erişimini bozardı, `-H 0.0.0.0`ı
 * kaldırmak telefondan denemeyi.
 *
 * Yeni bir çıkış düğmesi eklersen `signOut`u DOĞRUDAN çağırma, bunu kullan.
 */
async function cikisYap() {
  await signOut({ redirect: false });
  window.location.href = "/";
}

export default function SiteHeader() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // "loading" sırasında hiçbir şey basılmıyor: giriş yapmış kullanıcıya önce
  // "Giriş / Üye Ol" gösterip sonra adıyla değiştirmek, oturumun açık
  // olmadığı izlenimini veren bir titreme yaratıyor.
  const oturumHazir = status !== 'loading';
  const girisli = status === 'authenticated';
  const kullaniciAdi = (session?.user?.name || session?.user?.email || '').split(' ')[0];
  const plan = (session?.user as { plan?: string } | undefined)?.plan;

  // Branşlar Listesi
  const branches = [
    { name: "Romatoloji", slug: "romatoloji" },
    { name: "Gastro", slug: "gastroenteroloji" },
    { name: "Endokrin", slug: "endokrinoloji" },
    { name: "Nefroloji", slug: "nefroloji" },
    { name: "Hematoloji", slug: "hematoloji" },
    { name: "Kardiyoloji", slug: "kardiyoloji" },
    { name: "Enfeksiyon", slug: "enfeksiyon" },
    { name: "Göğüs", slug: "gogus" },
    { name: "Onkoloji", slug: "onkoloji" },
  ];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  /* Arama BAŞARISIZ olduğunda "Sonuç bulunamadı" demek, kullanıcıya
     içeriğin var olmadığını ÖĞRETİR. Ayrıca hata dalı results'ı
     temizlemediği için önceki sorgunun sonuçları yeni sorgunun altında
     kalıyordu. İkisi de ölçüldü. */
  const [aramaHatasi, setAramaHatasi] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * ARAMA DURUMU — ekran okuyucuya duyurulan metin.
   *
   * Ölçüldü: sonuçlar belirdiğinde sayfada HİÇ canlı bölge yoktu
   * (role=status / aria-live sayısı 0), yani klavye ve ekran okuyucuyla
   * gezen kullanıcı için arama sessizce çalışıyordu — kutuya yazıyor,
   * hiçbir şey duyulmuyor.
   *
   * Bölge aşağıda KOŞULSUZ render ediliyor. Belgedeki kural: `status`,
   * `alert`ten farklı olarak içerik değişmeden ÖNCE DOM'da bulunmak
   * zorunda; sonradan eklenirse ilk mesaj kaçar.
   */
  const aramaDurumu =
    query.length < 2   ? "" :
    loading            ? "Aranıyor…" :
    aramaHatasi        ? "Arama şu an yapılamıyor." :
    results.length > 0 ? `${results.length} sonuç bulundu.` :
                         "Sonuç bulunamadı.";

  // Arama Motoru Mantığı
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const data = await searchAction(query);
          setResults(data);
          setAramaHatasi(false);
        } catch (error) {
          // Teknik ayrıntı konsola; kullanıcıya BAYAT sonuç gösterilmez.
          console.error("Arama hatası", error);
          setResults([]);
          setAramaHatasi(true);
        } finally {
          setLoading(false);
          setIsOpen(true);
        }
      } else {
        setResults([]);
        setAramaHatasi(false);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center px-4 max-w-[1800px] mx-auto gap-2 sm:gap-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 font-black text-lg sm:text-2xl text-slate-900 tracking-tight shrink-0">
          <span className="text-blue-600 italic">Medi</span><span className="text-slate-300">Sea</span>
        </Link>

        {/* BRANŞ LİNKLERİ (lg ve üstü)
            min-w-0 + shrink: yer daralınca şerit içeride kayar, header'ı taşırmaz.
            mask-edges: yalnızca kaydığı aralıkta (1024–1140) kenarları söndürür — bkz. globals.css.
            2xl'de aralık kısılır: vitrin butonları da geldiği için arama kutusuna yer bırakır. */}
        <nav className="hidden lg:flex items-center gap-4 2xl:gap-3 overflow-x-auto no-scrollbar mask-edges min-w-0">
          {/* py-1.5: bu bağlantılar 19.5px yüksekliğindeydi, AA eşiği 24px.
              Kusur telefon ölçümlerinde HİÇ görünmedi çünkü şerit
              `hidden lg:flex` — 1024px altında hiç render edilmiyor.
              Başlık h-16 (64px) olduğu için dikey boşluk düzeni bozmuyor. */}
          {branches.map((branch) => (
            <Link
              key={branch.slug}
              href={`/topics/${branch.slug}`}
              className="inline-block py-1.5 text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {branch.name}
            </Link>
          ))}
        </nav>

        {/* ORTA: ARAMA KUTUSU
            min-w-0 VERİLMEZ: input border-box olduğu için yatay padding'inin
            altına inemez (pl-10+pr-10+border = 82px). Kutuyu zorla daraltmak
            input'u sarmalayıcıdan taşırıp "Üye Ol" düğmesinin üstüne bindiriyor.
            Daralmayı branş şeridi karşılar; dar telefonlarda ise padding küçülür. */}
        <div className="flex-1 max-w-xl relative ml-auto" ref={wrapperRef}>
          <div className="relative group">
            <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            {/* aria-label: placeholder erişilebilir ad yerine geçmez —
                yazmaya başlayınca kaybolur ve kimi okuyucular onu ad değil
                ipucu sayar. Ölçümde uygulamadaki dokuz form alanının
                hiçbirinin adı yoktu. */}
            <input
              type="text"
              aria-label="Sitede ara"
              placeholder="Hastalık, semptom veya vaka ara..."
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              /* ESC açılır sonuç penceresini kapatır. Belgedeki kural: panel
                 açan her yüzey ESC ile kapanmalı. Ölçüldü — bu pencerede
                 Escape hiç işlenmiyordu (defaultPrevented false, pencere açık
                 kalıyordu); dışarı tıklamak tek kapatma yoluydu, yani fare
                 kullanamayan biri pencereyi kapatamıyordu.
                 Sorgu KORUNUYOR: ESC veri kaybettirmemeli (not defterinde de
                 aynı kural). Temizlemek için yanındaki düğme var. */
              onKeyDown={(e) => {
                if (e.key === "Escape" && isOpen) { e.preventDefault(); setIsOpen(false); }
              }}
            />
            
            {loading && (
              <span className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}

            {!loading && query.length > 0 && (
              /* Ölçüldü: bu düğmenin erişilebilir adı YOKTU (yalnızca SVG
                 taşıyor, metin yok) ve dokunma hedefi 20x20 idi — belgedeki
                 24px alt sınırın altında. İkon aria-hidden, ad aria-label ile
                 veriliyor; kutu w-6 h-6 ile 24px'e çıkarıldı (ikon aynı boyutta
                 kaldı, konum input'un pr-9 boşluğunun içinde). */
              <button
                type="button"
                aria-label="Aramayı temizle"
                onClick={() => { setQuery(""); setIsOpen(false); }}
                className="absolute right-2.5 top-2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div role="status" aria-live="polite" className="sr-only">{aramaDurumu}</div>

          {/* SONUÇ PENCERESİ */}
          {isOpen && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {results.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-50 mb-1">
                    Sonuçlar
                  </div>
                  {results.map((result, index) => (
                    <Link
                      key={index}
                      href={result.type === 'section' ? `/topics/${result.section}` : `/topics/${result.section}/${result.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 group border-l-4 border-transparent hover:border-blue-500 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${result.type === 'section' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {result.type === 'section' ? '📂' : '📄'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{result.title}</p>
                        <p className="text-xs text-slate-500 capitalize">
                           {result.type === 'section' ? 'Ana Bölüm' : `${result.section} Rehberi`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                !loading && (
                   <div className="p-8 text-center text-slate-500">
                      <div className="text-4xl mb-2" aria-hidden="true">{aramaHatasi ? "📡" : "🤔"}</div>
                      {aramaHatasi ? (
                        <>
                          <p className="text-sm font-medium">Arama şu an yapılamıyor.</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Bu, aradığın konunun olmadığı anlamına gelmez — birazdan tekrar dene.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Sonuç bulunamadı.</p>
                          <p className="text-xs text-slate-400 mt-1">Farklı bir kelime deneyin.</p>
                        </>
                      )}
                   </div>
                )
              )}
            </div>
          )}
        </div>

        {/* --- VİTRİN BUTONLARI ---
            2xl (1536px) altında gizli: xl'de açılınca satır ~1560px istiyordu ve
            1280–1550 arasında sayfayı yatay kaydırıyordu. Bu aralıkta hamburger menüde. */}
        <div className="hidden 2xl:flex items-center gap-2 shrink-0 ml-2">
          <Link href="/tr/premium/ydus" className="bg-amber-400 hover:bg-amber-500 text-blue-950 text-xs font-black tracking-widest px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            PREMİUM YDUS <span>⚓</span>
          </Link>
          
          {/* KLİNİK ARAÇLAR AÇILIR MENÜ (DROPDOWN) */}
          <div className="relative group">
            <Link href="/tools" className="bg-white hover:bg-slate-50 border border-slate-200 text-blue-950 text-xs font-black tracking-widest px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
              <span>🧪</span> KLİNİK ARAÇLAR
              {/* Oku ekledik */}
              <svg className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Fare Üzerine Gelince Açılan Liste */}
            {/*
              `group-focus-within:` varyantları FAREYE EŞİTLİK için: menü bir
              dönem yalnızca `group-hover:` ile açılıyordu ve klavyeyle hiç
              açılamıyordu.

              Ölçüldü (1600px, yani kapsayıcının gerçekten çizildiği genişlik):
              menü `visibility: hidden` kaldığı için yedi kategori bağlantısı
              odak sırasına HİÇ girmiyordu — `focus()` çağrılsa bile
              `activeElement` olmuyorlardı. Tuzak ya da görünmez odak hedefi
              yoktu; içerik klavyeyle basitçe erişilemezdi.

              Not: aynı kategoriler `/tools` sayfasında da listeli, yani içerik
              kaybı değil kısayol kaybıydı. `group-focus-within` bu dosyada
              zaten kullanılan kalıp (arama ikonu).
            */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 z-50 overflow-hidden p-2">
              {/* Kategoriler araç veritabanındaki gerçek gruplar. Burada bir dönem
                  "Algoritmalar" ve "İlaç Etkileşimleri" yazıyordu; ikisinin de
                  sayfası hiç yazılmamıştı, üç bağlantı da 404 veriyordu. */}
              {ARAC_KATEGORILERI.map(k => (
                <Link
                  key={k.slug}
                  href={`/tools?kategori=${k.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors group/item"
                >
                  <span aria-hidden="true" className="text-lg">{k.icon}</span>
                  <span className="text-sm font-bold text-slate-700 group-hover/item:text-blue-700">{k.ad}</span>
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              
              <Link href="/tools" className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group/item">
                <span className="text-[10px] font-black tracking-widest text-slate-400 group-hover/item:text-slate-600">TÜM ARAÇLAR</span>
                <span className="text-slate-300 group-hover/item:text-slate-500 group-hover/item:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SAĞ: GİRİŞ / ÜYE OL */}
        {/*
          320px'te boşluklar KISILDI (yalnızca taban değerler; `sm:` ve üstü
          değişmedi).

          Ölçüldü: bu grup `shrink-0`, yani hiç daralmıyor ve 305px'lik
          belgede sağ kenarı 312'ye taşıyordu — SİTENİN HER SAYFASI 320px'te
          6.86px yatay kayıyordu. 320px hâlâ yaygın (iPhone SE ve benzerleri)
          ve bu depoda mobil ölçümün tek genişlikte yapılmaması kuralı zaten
          yazılı.

          Kaynak elle tahmin edilmedi: `scrollTo(9999,0)` ile gerçek kayma
          ölçüldü, sonra belge genişliğini aşan kutular sıralandı ve en sağı
          boyayan öge `elementFromPoint` ile doğrulandı.
        */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 ml-0 sm:ml-2 border-l border-slate-200 pl-1.5 sm:pl-6">
          {oturumHazir && !girisli && (
            <>
              {/* py-1.5: 20px yüksekliğindeydi. `hidden md:block` olduğu için
                  telefon genişliğinde hiç render edilmiyor — bu yüzden
                  önceki dokunma hedefi taramalarında görünmedi. */}
              <Link href="/giris" className="hidden md:block py-1.5 text-sm font-bold text-slate-600 hover:text-blue-700 transition-colors">
                Giriş
              </Link>
              <Link href="/kayit" className="bg-blue-950 text-white text-xs sm:text-sm font-bold px-3 sm:px-6 py-2.5 rounded-full hover:bg-blue-800 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
                <span>Üye Ol</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse hidden sm:block"></span>
              </Link>
            </>
          )}

          {oturumHazir && girisli && (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3 hover:border-blue-300 hover:bg-white transition-all max-w-[10rem] sm:max-w-none"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-black uppercase text-white">
                  {kullaniciAdi.charAt(0) || '?'}
                </span>
                <span className="truncate text-sm font-bold text-blue-950">{kullaniciAdi}</span>
                {plan === 'premium' && (
                  <span className="hidden sm:block rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-950">
                    Premium
                  </span>
                )}
              </Link>
              <button
                onClick={() => cikisYap()}
                className="hidden md:block text-sm font-bold text-slate-500 hover:text-blue-700 transition-colors whitespace-nowrap"
              >
                Çıkış
              </button>
            </>
          )}

          {/* HAMBURGER (branşlar / araçlar / premium - 2xl altında) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menü"
            aria-expanded={menuOpen}
            /* 36×36'dan 44×44'e: mobilde ana gezinme kontrolü bu düğme ve
               ölçümde dokunma hedefi önerilen 44px'in altındaydı. */
            className="2xl:hidden flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors shrink-0"
          >
            {menuOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* --- MOBİL / TABLET AÇILIR MENÜ --- */}
      {menuOpen && (
        <div className="2xl:hidden border-t border-slate-100 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1800px] mx-auto px-5 py-5 space-y-5">

            {/* Branşlar (lg ve altı - üstteki nav gizliyken) */}
            <div className="lg:hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Branşlar</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {branches.map((branch) => (
                  <Link
                    key={branch.slug}
                    href={`/topics/${branch.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-[13px] font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
                  >
                    {branch.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 lg:hidden"></div>

            {/* Vitrin linkleri (2xl altı - üstteki butonlar gizliyken) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/tr/premium/ydus"
                onClick={() => setMenuOpen(false)}
                className="bg-amber-400 hover:bg-amber-500 text-blue-950 text-xs font-black tracking-widest px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                PREMİUM YDUS <span>⚓</span>
              </Link>
              <Link
                href="/tools"
                onClick={() => setMenuOpen(false)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-950 text-xs font-black tracking-widest px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                🧪 KLİNİK ARAÇLAR
              </Link>
            </div>

            {/* Giriş / Çıkış (md altı - sağdaki link gizliyken) */}
            <div className="md:hidden pt-1">
              {girisli ? (
                <button
                  onClick={() => { setMenuOpen(false); cikisYap(); }}
                  className="block w-full text-center text-sm font-bold text-slate-600 hover:text-blue-700 transition-colors py-2"
                >
                  Çıkış Yap
                </button>
              ) : (
                <Link
                  href="/giris"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center text-sm font-bold text-slate-600 hover:text-blue-700 transition-colors py-2"
                >
                  Giriş Yap
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}