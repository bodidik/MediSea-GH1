"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { aramaNormalize } from "@/app/lib/arama";

/**
 * Kütüphane girişi: branş kartları + anlık arama.
 *
 * Önceki sürüm aramayı Express arka ucuna soruyordu. Arka uç canlıda hiç
 * çalışmadığı için uç, hata yerine UYDURMA sonuç döndürüyordu ve sayfa
 * bunları gerçekmiş gibi basıyordu: ziyaretçi 411 konuluk kütüphanenin
 * girişinde "ARANAN KELİME İLE İLGİLİ YEDEK SONUÇ 1" görüyordu.
 *
 * Artık veri sayfayla birlikte geliyor ve arama tarayıcıda çalışıyor:
 * ağ yok, arka uç yok, uydurma yok.
 */

export type KonuKaydi = { brans: string; slug: string; baslik: string };
export type BransKarti = {
  slug: string;
  baslik: string;
  aciklama: string;
  ikon: string;
  konuSayisi: number;
};

/**
 * Türkçe katlama artık ORTAK yardımcıdan geliyor (app/lib/arama.ts).
 *
 * Buradaki yerel `katla()` doğru çalışıyordu ama aynı işi yapan ikinci bir
 * uygulamaydı: araç sayfası, site geneli arama ve inciler ortak yardımcıyı
 * kullanıyor. Tekrarlanan mantık er geç ayrışır — bu depoda aynı sınıf kusur
 * yetki kontrolünde yaşandı (bkz. lib/yonetici.ts).
 *
 * Davranış farkı YOK: ikisi de mevcut içeriğin tamamında birebir aynı sonucu
 * veriyor (ölçüldü). Ortak sürüm ayrıca Türkçe olmayan aksanları da katlıyor,
 * yani ileride "Ménière" ya da "Sjögren" gibi bir başlık eklenirse "meniere"
 * yazan kullanıcı da bulabilecek.
 */

export default function KutuphaneArama({
  konular,
  branslar,
}: {
  konular: KonuKaydi[];
  branslar: BransKarti[];
}) {
  const [sorgu, setSorgu] = useState("");
  /**
   * SORGU ADRESTE TAŞINIYOR — kardeş yüzeyle (`/tools`) aynı gerekçe.
   *
   * Ölçüldü: "tiroid" yazıp (27 sonuç bağlantısı) bir konuyu açıp GERİ tuşuna
   * basınca kutu BOŞALIYOR ve liste 13 branş kartına dönüyordu. Kaydırma
   * konumu ise tarayıcı tarafından geri yükleniyor — ikisi birleşince
   * kullanıcı bırakmadığı bir sayfaya dönüyor.
   *
   * `useSearchParams()` KULLANILMIYOR: bu depoda ölçülmüş bir kusur, sayfayı
   * sunucuda üretilmez hâle getiriyor. Adres bir kez ELDEN okunuyor ve
   * `history.replaceState` ile tazeleniyor — gezinme yok, geçmiş şişmiyor,
   * sayfa statik kalıyor.
   *
   * Bayrak DURUM (ref değil): adres okunmadan yazmak, okunacak değeri siler.
   */
  const [adresOkundu, setAdresOkundu] = useState(false);

  useEffect(() => {
    setSorgu(new URLSearchParams(window.location.search).get("ara") ?? "");
    setAdresOkundu(true);
  }, []);

  useEffect(() => {
    if (!adresOkundu) return;
    const p = new URLSearchParams(window.location.search);
    const s = sorgu.trim();
    if (s) p.set("ara", s);
    else p.delete("ara");
    const q = p.toString();
    const yeni = window.location.pathname + (q ? `?${q}` : "") + window.location.hash;
    if (yeni !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(window.history.state, "", yeni);
    }
  }, [sorgu, adresOkundu]);

  const aranan = aramaNormalize(sorgu);
  const sonuclar = useMemo(() => {
    if (aranan.length < 2) return [];
    return konular
      .filter((k) => aramaNormalize(k.baslik).includes(aranan))
      .sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"))
      .slice(0, 60);
  }, [aranan, konular]);

  const bransAdi = (slug: string) => branslar.find((b) => b.slug === slug)?.baslik || slug;

  /* Ekran okuyucuya sonuç sayısını duyurur.

     Ölçüldü: kardeş iki süzgeç yüzeyinin (başlık araması ve /tools) İKİSİNDE
     de canlı bölge VAR, burada YOKTU — yani okuyucuyla yazan kullanıcı liste
     daralırken hiçbir geri bildirim almıyordu.

     `status` (alert değil): sonuç sayısı acil bir kesinti değil. Ve bölge
     KOŞULSUZ render ediliyor — `status` içerik değişmeden ÖNCE DOM'da
     bulunmak zorunda, sonradan eklenirse ilk mesaj kaçar (belgedeki kural).
     Aşağıdaki sonuç bloğu `aranan.length >= 2` ile kapılı, o yüzden bölge
     onun DIŞINDA duruyor. */
  const durumMetni =
    aranan.length < 2
      ? ""
      : sonuclar.length === 0
        ? `"${sorgu}" için konu bulunamadı.`
        : `${sonuclar.length} konu bulundu.`;

  return (
    <div>
      <div role="status" aria-live="polite" className="sr-only">{durumMetni}</div>

      {/* ARAMA */}
      <div className="relative mb-8">
        <span aria-hidden="true" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          aria-label="Kütüphanede konu ara"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          placeholder="Konu ara (örn: hiponatremi, anemi, tiroid)…"
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl pl-14 pr-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
        />
      </div>

      {/* SONUÇLAR */}
      {aranan.length >= 2 && (
        <div className="mb-12">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.25em]">
              Sonuçlar
            </h2>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              {sonuclar.length === 0
                ? "eşleşme yok"
                : sonuclar.length === 60
                  ? "ilk 60"
                  : `${sonuclar.length} konu`}
            </span>
          </div>

          {sonuclar.length === 0 ? (
            <div className="rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-sm font-bold text-slate-500">
                &quot;{sorgu}&quot; için konu bulunamadı.
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Farklı bir terim dene ya da aşağıdan branşa göz at.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sonuclar.map((k) => (
                <Link
                  key={`${k.brans}/${k.slug}`}
                  href={`/topics/${k.brans}/${k.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-blue-900/30 hover:shadow-lg"
                >
                  <div className="min-w-0 flex-1">
                    {/* line-clamp-2, truncate DEĞİL — branş kartlarıyla aynı
                        sınıf, aynı içerik (konu başlıkları). Ölçüldü (canlı,
                        375px, "sendrom" sorgusu): 24 sonucun 15'i kesikti,
                        en kötüsü 444px gerektirip 281px'lik kutuda duruyordu.
                        Gereken satır: 1 satır 9 · 2 satır 11 · 3 satır 4.
                        2 tavanı 24 sonucun 20'sini TAM gösteriyor; 3'e
                        çıkarmak bir sonuç listesini gereksiz gürültülü yapar
                        ve tam başlık zaten bir dokunuş uzakta. */}
                    <div className="line-clamp-2 text-[13px] font-black uppercase italic leading-tight tracking-tight text-blue-950">
                      {k.baslik}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {bransAdi(k.brans)}
                    </div>
                  </div>
                  <span className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BRANŞLAR */}
      <div>
        <h2 className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.25em] mb-4">
          Branşlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branslar.map((b) => (
            <Link
              key={b.slug}
              href={`/topics/${b.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-900/30 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <span aria-hidden="true" className="text-2xl">{b.ikon}</span>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {b.konuSayisi} konu
                </span>
              </div>
              <div className="mt-3 text-sm font-black uppercase italic tracking-tight text-blue-950">
                {b.baslik}
              </div>
              {b.aciklama && (
                <div className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
                  {b.aciklama}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
