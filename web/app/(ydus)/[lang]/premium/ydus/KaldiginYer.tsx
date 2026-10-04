"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ChevronRight } from "lucide-react";

/**
 * KALDIĞIN YERDEN DEVAM — panonun en üstü.
 *
 * QuizEngine yarım kalan setin imlecini zaten `quiz-progress-<id>` altında
 * saklıyordu, ama bu bilgi yalnızca kullanıcı AYNI sete kendisi geri
 * dönerse işe yarıyordu: pano bir katalogdu ve geri dönen kullanıcıya
 * nerede kaldığını söylemiyordu. Bu kart en son dokunulan yarım seti gösterir.
 *
 * Kayıt `t` (zaman), `b` (branş), `ad` (başlık), `n` (soru sayısı) taşıyorsa
 * okunur; bu alanlar eklenmeden önce yazılmış eski kayıtlar yok sayılır
 * (bağlantı kurmak için branş şart). Sunucuda hiçbir şey basılmaz — depo
 * yalnız tarayıcıda; hidrasyon farkı olmasın diye kart montajdan sonra çizilir.
 */
type Yarim = { id: string; u: string; b: string; ad: string; i: number; n: number; cevap: number; t: number };

const ONEK = "quiz-progress-";

function yarimlariOku(): Yarim[] {
  const out: Yarim[] = [];
  try {
    for (let k = 0; k < localStorage.length; k++) {
      const anahtar = localStorage.key(k);
      if (!anahtar || !anahtar.startsWith(ONEK)) continue;
      const id = anahtar.slice(ONEK.length);
      if (!id || id === "undefined") continue;
      try {
        const v = JSON.parse(localStorage.getItem(anahtar) || "null");
        if (!v || typeof v !== "object") continue;
        const { i, s, t, b, u, ad, n } = v as Record<string, unknown>;
        if (typeof b !== "string" || !/^[a-z0-9-]+$/.test(b)) continue;
        // u: adresteki dosya kimliği. Depo anahtarı İÇ kimliği taşıyor ve
        // iç kimlikle kurulan bağlantı 404 veriyor — u yoksa kart çizilmez.
        if (typeof u !== "string" || !/^[A-Za-z0-9_-]+$/.test(u)) continue;
        if (typeof t !== "number" || typeof n !== "number" || typeof i !== "number") continue;
        if (n <= 0 || i >= n) continue;
        const cevap = s && typeof s === "object" ? Object.keys(s).length : 0;
        if (cevap === 0 && i === 0) continue;
        out.push({ id, u, b, ad: typeof ad === "string" && ad.trim() ? ad : id, i, n, cevap, t });
      } catch {}
    }
  } catch {}
  return out.sort((x, y) => y.t - x.t);
}

function ne_zaman(t: number): string {
  const dk = Math.round((Date.now() - t) / 60000);
  if (dk < 2) return "az önce";
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.round(dk / 60);
  if (sa < 24) return `${sa} saat önce`;
  const gun = Math.round(sa / 24);
  return gun === 1 ? "dün" : `${gun} gün önce`;
}

export default function KaldiginYer({ lang }: { lang: string }) {
  const [liste, setListe] = useState<Yarim[] | null>(null);
  useEffect(() => setListe(yarimlariOku()), []);

  if (!liste || liste.length === 0) return null;
  const [son, ...digerleri] = liste;
  const yuzde = Math.round((son.cevap / son.n) * 100);

  return (
    <section aria-labelledby="kaldigin-yer-baslik" className="mb-6">
      <Link
        href={`/${lang}/premium/ydus/quiz-coz?branch=${son.b}&id=${encodeURIComponent(son.u)}`}
        className="block bg-white rounded-xl border-2 border-emerald-300 px-5 py-4 hover:border-emerald-500 transition-colors group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <RotateCcw size={20} className="text-emerald-700" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="kaldigin-yer-baslik" className="text-[11px] text-emerald-800 font-semibold" style={{ marginTop: 0, fontFamily: "inherit" }}>
                Kaldığın yerden devam · {ne_zaman(son.t)}
              </h2>
              <p className="text-sm font-semibold text-slate-800 line-clamp-2">{son.ad}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {son.cevap}/{son.n} soru cevaplandı · sıradaki: {son.i + 1}. soru
              </p>
            </div>
          </div>
          <span className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-white bg-emerald-700 px-3 py-1.5 rounded-lg group-hover:bg-emerald-800 transition-colors">
            Devam et <ChevronRight size={14} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-emerald-50 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${yuzde}%` }} />
        </div>
      </Link>
      {digerleri.length > 0 && (
        <p className="text-[11px] text-slate-600 mt-2 px-1">
          Yarım kalan {digerleri.length} set daha:{" "}
          {digerleri.slice(0, 3).map((y, k) => (
            <span key={y.id}>
              {k > 0 && " · "}
              <Link
                href={`/${lang}/premium/ydus/quiz-coz?branch=${y.b}&id=${encodeURIComponent(y.u)}`}
                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
              >
                {y.ad}
              </Link>
            </span>
          ))}
          {digerleri.length > 3 && ` ve ${digerleri.length - 3} set`}
        </p>
      )}
    </section>
  );
}
