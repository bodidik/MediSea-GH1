"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HESAPLAYICI SONUCUNU EKRAN OKUYUCUYA DUYURUR + UZUN ARAÇLARDA ŞERİT OLARAK
 * GÖRÜNÜR KILAR.
 *
 * --- 1) DUYURU (canlı bölge) ---
 *
 * Ölçüldü: 130 klinik hesaplayıcının 130'unda sonuç SESSİZCE beliriyordu.
 * 42'si yalnızca hata/bildirim duyuruyordu (sebep kartları), 88'inde hiçbir
 * canlı bölge yoktu. Yani ekran okuyucuyla çalışan biri değer giriyor,
 * ekranda skor ve bant çiziliyor, hiçbir şey duyulmuyordu.
 *
 * `role="status"` — `alert` DEĞİL: sonuç acil bir kesinti değil, ve bölge
 * KOŞULSUZ render ediliyor. Belgede kayıtlı kural: `status` içerik
 * değişmeden ÖNCE DOM'da bulunmak zorunda; sonradan eklenirse ilk mesaj
 * kaçar. Bu yüzden bileşen `metin` boşken de bir kap basıyor.
 *
 * YALNIZCA BANT ETİKETİ duyuruluyor, SAYI değil — ve bu bilinçli:
 * serbest sayısal alanı olan araçlarda skor HER TUŞ VURUŞUNDA değişiyor,
 * yani sayıyı duyurmak "1", "1.", "1.2" diye gürültü üretirdi.
 *
 * --- 2) ŞERİT (görsel) ---
 *
 * Ölçüldü (canlı, 375px): uzun araçlarda sonuç paneli, kullanıcı kontrolleri
 * doldururken görünümün ÇOK ALTINDA kalıyor —
 *
 *   apache2  belge 3743px (4.6 ekran) · 87 kontrol · panel 2746px'te
 *   nihss    belge 5920px (7.3 ekran) · 57 kontrol · panel 4805px'te
 *   ciwa-ar  belge 6211px (7.6 ekran) · 57 kontrol · panel 5186px'te
 *
 * Yani 57 satırlık bir inme skalasını dolduran kullanıcı skorun değiştiğini
 * hiç görmüyordu; geri bildirim döngüsü kopuktu. (Kıyas: `bmi` belgesi
 * 2137px ve panel 763px'te — orada panel zaten görünür.)
 *
 * ŞERİT KENDİ KENDİNİ AYARLIYOR, eşik yok: panel görünümdeyse şerit hiç
 * çizilmiyor. Yani kısa araçlarda ölü bir katman değil, uzun araçlarda
 * kullanıcı kontrollerin arasındayken beliriyor.
 *
 * Şerit YALNIZCA panel AŞAĞIDAYKEN çıkıyor (kullanıcı henüz oraya
 * varmamışken). Kullanıcı paneli geçtiyse sonucu zaten görmüştür; orada
 * şerit göstermek gürültü olurdu.
 *
 * ŞERİT SAYIYI DEĞİL BANT ETİKETİNİ taşıyor — duyuruyla AYNI tek kaynak.
 * Skoru da basmak için 71 çağrı yerinden ikinci bir değişken geçirmek
 * gerekirdi ve o değişkenin adı araçtan araca farklı (`total`, `score`,
 * `puan`...); mekanik bir süpürmenin yanlış değişkeni seçmesi, klinik bir
 * hesaplayıcıda EKRANA YANLIŞ SAYI basmak demektir. Tam sayı bir dokunuş
 * uzakta: şeritteki düğme paneli görünüme getiriyor.
 *
 * `nextElementSibling` ile panel bulunuyor — 71 çağrı yerinin hepsinde
 * duyuru satırı panelin HEMEN ÖNÜNDE (yerleşim denetimiyle doğrulandı).
 * Şeridin kendisi de aynı fragment'ta render edildiği için kardeş
 * aramasında ATLANIYOR (`data-sonuc-serit`), yoksa panel yerine kendini
 * bulurdu. Panel çözülemezse şerit hiç çıkmıyor — sessizce yanlış bir
 * sonuç göstermektense hiç göstermemek doğru.
 */
export default function SonucDuyuru({ metin }: { metin: string | null }) {
  const duyuruRef = useRef<HTMLParagraphElement>(null);
  const seritRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<Element | null>(null);
  const [asagida, setAsagida] = useState(false);

  useEffect(() => {
    setAsagida(false);
    panelRef.current = null;
    if (!metin) return;

    let p: Element | null = duyuruRef.current?.nextElementSibling ?? null;
    while (p && p.hasAttribute("data-sonuc-serit")) p = p.nextElementSibling;
    if (!p || p.getBoundingClientRect().height < 40) return;
    panelRef.current = p;

    /* IntersectionObserver DEĞİL: bu ortamda sayfa boyanmadığında IO hiç
       ateşlemiyor (ölçüldü: visibilityState hidden · paint kaydı 0 ·
       IO 0 kez · rAF 0 kez), yani düzeltme DOĞRULANAMIYOR. Kaydırma olayı +
       getBoundingClientRect bir DÜZEN okumasıdır ve boyamadan bağımsız
       çalışır — hem ölçülebilir hem daha az varsayım. */
    const olc = () => {
      const el = panelRef.current;
      if (!el) return;
      setAsagida(el.getBoundingClientRect().top >= window.innerHeight);
    };
    olc();
    window.addEventListener("scroll", olc, { passive: true });
    window.addEventListener("resize", olc);
    return () => {
      window.removeEventListener("scroll", olc);
      window.removeEventListener("resize", olc);
    };
  }, [metin]);

  /* Şerit görünümün altını kapatıyor: odaklanan bir kontrol onun ALTINDA
     kalmasın (WCAG 2.4.11). Yükseklik TAHMİN EDİLMİYOR, ölçülüyor — bant
     etiketi iki satıra sarabiliyor. */
  useEffect(() => {
    const kok = document.documentElement;
    if (!asagida) {
      kok.style.scrollPaddingBottom = "";
      return;
    }
    kok.style.scrollPaddingBottom = (seritRef.current?.offsetHeight ?? 56) + 16 + "px";
    return () => {
      kok.style.scrollPaddingBottom = "";
    };
  }, [asagida, metin]);

  return (
    <>
      <p ref={duyuruRef} role="status" className="sr-only">
        {metin ? `Sonuç: ${metin}` : ""}
      </p>

      {asagida && metin ? (
        <div
          ref={seritRef}
          data-sonuc-serit=""
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-blue-900 bg-blue-950/95 px-4 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.25)] backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">
              Sonuç
            </span>
            <span className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-white line-clamp-2">
              {metin}
            </span>
            <button
              type="button"
              onClick={() => {
                /* Azaltılmış hareket tercihi JS kaydırmasına CSS'ten geçmiyor;
                   burada elle karşılanıyor. */
                const yavas = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;
                panelRef.current?.scrollIntoView({
                  block: "center",
                  behavior: yavas ? "auto" : "smooth",
                });
              }}
              className="shrink-0 rounded-xl bg-white px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-blue-950 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sonuca git
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
