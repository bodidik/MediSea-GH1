"use client";

import { binlikBelirsizMi, parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * BELİRSİZ BİNLİK AYIRICISI UYARISI.
 *
 * Ayrıştırıcı `1.200`ü BİLEREK 1,2 okuyor (gerekçe `calc-utils`teki B2
 * dalında: sessiz tahmin yeni bir yanlış sayı sınıfı açardı). Ama sessiz
 * kalmak da doğru değil — aynı girdi 1200 kastedilmiş olabilir ve fark
 * BİN KAT. Bu bileşen davranışı DEĞİŞTİRMİYOR, yalnızca okunan değeri
 * söylüyor ve belirsizliği gidermenin yolunu veriyor.
 *
 * Yalnızca meşru değerleri 999'u AŞABİLEN alanlara takılıyor; 0–10 NRS gibi
 * alanlarda `1.200` zaten makullük kapısına takılır ve uyarı gürültü olurdu.
 *
 * `role="alert"` — sonuç değil KESİNTİ: kullanıcının yazdığı sayı düşündüğü
 * sayı olmayabilir. Kap KOŞULLU render ediliyor; `alert` `status`ün aksine
 * sonradan eklendiğinde de okunur.
 */
export default function BinlikUyari({
  girdiler,
}: {
  girdiler: ReadonlyArray<{ ad: string; ham: string }>;
}) {
  const belirsiz = girdiler.filter((g) => binlikBelirsizMi(g.ham));
  if (belirsiz.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"
    >
      <p className="text-[11px] font-black uppercase tracking-widest text-amber-800">
        Sayı okunuşu belirsiz
      </p>
      <ul className="mt-2 space-y-1">
        {belirsiz.map((g) => (
          <li key={g.ad} className="text-[13px] font-bold leading-snug text-amber-900">
            {g.ad}: <span className="font-black">{g.ham.trim()}</span> değeri{" "}
            <span className="font-black">
              {String(parseLocaleNumber(g.ham)).replace(".", ",")}
            </span>{" "}
            olarak okundu.
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] leading-relaxed text-amber-900">
        Binlik ayırıcı kastettiysen aradaki noktayı kaldır ya da boşluk
        kullan — <span className="font-black">1200</span> veya{" "}
        <span className="font-black">1 200</span>. Ondalık için virgül yaz:{" "}
        <span className="font-black">1,2</span>.
      </p>
    </div>
  );
}
