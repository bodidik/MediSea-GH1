import Link from "next/link";

/**
 * Yer tutucu sayfa — ama yer tutucu da bir sayfa.
 *
 * Ölçüldü (canlı): sayfada `h1` SIFIRDI. Ölçülen öteki bütün sayfalarda tam
 * bir tane var; burada başlık düz bir `<div>` içindeydi, yani ekran okuyucu
 * için sayfanın adı yoktu.
 *
 * Çıkış bağlantısı da yoktu. Bu depoda boş durumların kuralı belli ve öteki
 * boş durumlar (Çalışma Alanım, Tekrar) onu uyguluyor: ne olduğunu söyle,
 * ne zaman değişeceğini söyleme sözü verme, ve gidilecek bir yer bırak.
 *
 * `font-sans mt-0`: globals.css `h1..h3`e serif yazı tipi ve 24px üst boşluk
 * veriyor, Tailwind sınıfları bunu EZMİYOR. Bu bir arayüz etiketi, okuma
 * başlığı değil — görünüm korunuyor.
 */
export default function GuidelinesPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <span className="text-3xl block mb-4" aria-hidden="true">
        🧭
      </span>
      <h1 className="font-sans mt-0 mb-2 text-base font-bold text-slate-700">
        Rehberler ve Kılavuzlar
      </h1>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        Bu bölüm henüz hazır değil. O zamana kadar kılavuz bilgileri konu
        anlatımlarının içinde, ilgili başlıkların yanında duruyor.
      </p>
      <Link
        href="/topics"
        className="inline-block rounded-xl bg-blue-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800"
      >
        Kütüphaneye git →
      </Link>
    </div>
  );
}
