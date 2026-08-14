import Link from "next/link";

/**
 * Ücretsiz plandaki kullanıcıya premium'u anlatan kart (/profile).
 *
 * Eskiden burada bir "Yükselt" düğmesi vardı ve `/api/plan/upgrade` ucuna
 * POST atıyordu. Ölçüldü: o uç YOK — canlıda 404. Yani kullanıcı düğmeye
 * basıyor ve "Yükseltme işlemi başarısız oldu" görüyordu. Üstelik projede
 * hiçbir ödeme sağlayıcısı entegrasyonu yok (web ve server'da arandı,
 * sıfır sonuç), dolayısıyla çalışan bir yükseltme akışı da yok.
 *
 * Kart kaldırılmadı: ücretsiz kullanıcıya premium'un varlığını duyurmak
 * hâlâ doğru. Ama artık olmayan bir işlemi tetiklemiyor — neyin ücretsiz
 * neyin premium olduğunu anlatan /uyelik sayfasına götürüyor. Fiyat ya da
 * koşul UYDURULMADI; ikisi de henüz kararlaştırılmadı.
 *
 * Bileşen artık istemci bileşeni değil: durum tutmasına gerek kalmadı.
 */
export default function UpgradeCard() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group transition-all hover:border-amber-500/50">

      {/* Premium Parıltı Efekti */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" aria-hidden="true"></div>

      <div className="relative z-10 flex flex-col min-w-0">
        <span className="text-lg font-bold text-amber-400 mb-0.5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Premium nedir?
        </span>
        <span className="text-xs font-medium text-slate-400">
          Neyin ücretsiz, neyin premium olduğunu gör.
        </span>
      </div>

      <div className="relative z-10 shrink-0">
        <Link
          href="/uyelik"
          className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold transition-all duration-300 shadow-lg shadow-amber-500/20"
        >
          İncele
        </Link>
      </div>

    </div>
  );
}
