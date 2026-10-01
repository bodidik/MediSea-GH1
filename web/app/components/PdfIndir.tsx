"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { geriyleBagla } from "@/app/lib/geri";
import GoogleIleDevam from "@/app/components/GoogleIleDevam";

/**
 * Konu sayfasını PDF olarak kaydetme.
 *
 * - ÜYE: günde `GUNLUK_PDF_HAKKI` konu (lib/pdf-hak.ts; sayaç sunucuda).
 *   Düğme önce `/api/pdf-hak`a sorar, izin gelirse baskı penceresini açar.
 *   Aynı konu aynı gün yeniden indirilirse hak yemez.
 * - ZİYARETÇİ: düğme görünür; basınca "üye girişi gerekir" kutusu açılır
 *   (Google · ücretsiz üye ol · giriş) ve dönüş adresi bu konu.
 *
 * Mekanizma tarayıcının baskı penceresi ("PDF olarak kaydet"); `@media print`
 * (globals.css) gezinmeyi ve sabit katmanları gizliyor.
 *
 * DÜRÜST SINIR: bu bir kolaylık, kilit DEĞİL — Ctrl+P herkese açık. Sayaç
 * yalnız bu düğmenin yolunu sınırlar.
 *
 * Dosya adı `document.title`dan gelir: baskı süresince konu başlığına
 * çevrilip `afterprint`te geri alınır.
 */
type Hak = { kalan: number; sinir: number; buKonuAlindi?: boolean };

const SINIF =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black uppercase tracking-widest text-blue-900 shadow-sm hover:border-blue-900/30 transition-colors disabled:opacity-60";

function yazdir(baslik: string) {
  const eski = document.title;
  document.title = `${baslik} — MediSea`;
  const geriAl = () => {
    document.title = eski;
    window.removeEventListener("afterprint", geriAl);
  };
  window.addEventListener("afterprint", geriAl);
  window.print();
}

export default function PdfIndir({ baslik }: { baslik: string }) {
  const { status } = useSession();
  const yol = usePathname();
  const [hak, setHak] = React.useState<Hak | null>(null);
  const [mesaj, setMesaj] = React.useState<string | null>(null);
  const [bekliyor, setBekliyor] = React.useState(false);
  const [uyariAcik, setUyariAcik] = React.useState(false);
  const kutuId = React.useId();

  React.useEffect(() => {
    if (status !== "authenticated") return;
    let iptal = false;
    fetch(`/api/pdf-hak?yol=${encodeURIComponent(yol)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!iptal && j) setHak(j); })
      .catch(() => {});
    return () => { iptal = true; };
  }, [status, yol]);

  /* Oturum durumu belli olmadan çizme: üyeye bir an "üye ol" göstermek yanıltır. */
  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <div data-baskida-gizle className="mt-3">
        <button
          type="button"
          className={SINIF}
          aria-expanded={uyariAcik}
          aria-controls={uyariAcik ? kutuId : undefined}
          onClick={() => setUyariAcik((a) => !a)}
        >
          <span aria-hidden="true">📄</span>{" PDF indir"}
        </button>
        {uyariAcik && (
          <div
            id={kutuId}
            role="status"
            className="mt-3 max-w-sm rounded-2xl border border-blue-200 bg-blue-50 p-4 normal-case tracking-normal"
          >
            <p className="mt-0 mb-3 text-sm font-bold text-blue-950">
              PDF indirmek için üye girişi yapmanız gerekir.
            </p>
            <p className="mt-0 mb-3 text-xs font-semibold text-slate-600">
              Üyelik ücretsiz; üyeler günde 3 konuyu PDF olarak indirebilir.
            </p>
            <GoogleIleDevam geri={yol} ayrac="veya" />
            <div className="flex flex-wrap gap-2">
              <Link
                href={geriyleBagla("/kayit", yol)}
                className="rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
              >
                Ücretsiz üye ol
              </Link>
              <Link
                href={geriyleBagla("/giris", yol)}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-950 hover:border-blue-400"
              >
                Giriş yap
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  const doldu = hak !== null && hak.kalan === 0 && !hak.buKonuAlindi;

  return (
    <div data-baskida-gizle className="mt-3">
      <button
        type="button"
        className={SINIF}
        disabled={bekliyor || doldu}
        onClick={async () => {
          setBekliyor(true);
          setMesaj(null);
          try {
            const r = await fetch("/api/pdf-hak", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ yol }),
            });
            const j = await r.json().catch(() => null);
            if (j && typeof j.kalan === "number") {
              setHak({ kalan: j.kalan, sinir: j.sinir, buKonuAlindi: !!j.izin });
            }
            if (r.ok && j?.izin) {
              setMesaj("Açılan pencerede hedef olarak “PDF olarak kaydet”i seç.");
              yazdir(baslik);
            } else if (r.status === 429) {
              setMesaj("Bugünkü PDF hakkın doldu; yarın yenilenir.");
            } else {
              setMesaj("PDF hakkın şu an denetlenemedi; birazdan tekrar dene.");
            }
          } catch {
            setMesaj("Bağlantı kurulamadı; birazdan tekrar dene.");
          } finally {
            setBekliyor(false);
          }
        }}
      >
        <span aria-hidden="true">📄</span>{" PDF olarak indir"}
      </button>
      {hak && (
        <p className="mt-2 mb-0 text-xs font-semibold text-slate-600">
          {hak.buKonuAlindi
            ? `Bu konu bugün indirildi; yeniden indirmek hak yemez. Kalan: ${hak.kalan}/${hak.sinir}`
            : doldu
              ? `Bugünkü ${hak.sinir} PDF hakkın doldu; yarın yenilenir.`
              : `Bugün kalan PDF hakkın: ${hak.kalan}/${hak.sinir}`}
        </p>
      )}
      {mesaj && (
        <p role="status" className="mt-2 mb-0 text-xs font-semibold text-slate-600">
          {mesaj}
        </p>
      )}
    </div>
  );
}
