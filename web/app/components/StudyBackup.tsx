"use client";
// C:\Users\hucig\Medknowledge\web\app\components\StudyBackup.tsx
//
// Çalışma verisinin yedeklenmesi ve geri yüklenmesi.
//
// İçe aktarma iki adımlıdır: dosya seçilir → NE OLACAĞI gösterilir → onaylanır.
// Kullanıcı sonucu görmeden hiçbir şey yazılmaz; birleştirme varsayılandır,
// üzerine yazma ayrıca seçilir.

import { useEffect, useRef, useState } from "react";
import {
  applyImport,
  exportBackup,
  formatBytes,
  planImport,
  storageUsage,
  type ImportMode,
  type ImportPlan,
} from "@/app/lib/study-backup";

export default function StudyBackup({ onChanged }: { onChanged?: () => void }) {
  const [usage, setUsage] = useState<ReturnType<typeof storageUsage> | null>(null);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [durum, setDurum] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsage(storageUsage());
  }, []);

  const disariAktar = () => {
    const { blob, name, ozet } = exportBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    // Kart işareti yalnızca varsa yazılır: hiç flashcard çalışmamış kullanıcıya
    // "0 kart işareti" demek bilgi değil gürültü.
    const kartlar = ozet.kartIsareti ? ` · ${ozet.kartIsareti} kart işareti` : "";
    setDurum(
      `${ozet.sayfa} sayfa · ${ozet.vurgu} vurgu · ${ozet.cizgi} çizgi${kartlar} yedeklendi`
    );
  };

  const dosyaSecildi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = ""; // aynı dosya tekrar seçilebilsin
    if (!f) return;
    const icerik = await f.text();
    setText(icerik);
    setPlan(planImport(icerik));
    setDurum(null);
  };

  /**
   * İçe aktarma bitince ODAK DURUM MESAJINA gitsin.
   *
   * Ölçüldü: "Onayla ve üzerine yaz" tıklandıktan sonra düğme DOM'dan
   * kalkıyor ve odak `<body>`ye düşüyor. Uygulamanın EN YIKICI eylemi bu —
   * bütün çalışma verisi değişiyor — ve klavyeyle gezen kullanıcı hem
   * yerini kaybediyor hem de sonucu görmek için sayfayı yeniden taramak
   * zorunda kalıyor.
   *
   * Odak, ne olduğunu söyleyen cümlenin kendisine gidiyor. `role="status"`
   * zaten duyuruyor; odak da oraya gidince ekran okuyucu KULLANMAYAN
   * klavye kullanıcısı da mesajı görüyor.
   */
  const durumRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (durum) durumRef.current?.focus();
  }, [durum]);

  const onayla = () => {
    if (!text) return;
    const r = applyImport(text, mode);
    setPlan(null);
    setText(null);
    if (r.ok) {
      setUsage(storageUsage());
      setDurum("Geri yükleme tamam.");
      onChanged?.();
    } else {
      setDurum(r.hata ?? "Geri yükleme başarısız.");
    }
  };

  const iptal = () => {
    setPlan(null);
    setText(null);
  };

  const dolu = usage ? usage.oran : 0;
  const uyari = dolu > 0.75;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Yedekleme
        </h2>
        {usage && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            {formatBytes(usage.bytes)} kullanılıyor
          </span>
        )}
      </div>

      {/* depolama çubuğu */}
      {usage && usage.bytes > 0 && (
        <div className="mb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${uyari ? "bg-rose-500" : "bg-blue-950"}`}
              style={{ width: `${Math.min(100, dolu * 100)}%` }}
            />
          </div>
          {uyari && (
            <p className="mt-1.5 text-[11px] leading-snug text-rose-600">
              Tarayıcı depolaması dolmak üzere. Dolduğunda yeni notlar sessizce
              kaydedilemez — yedek al ve eski sayfaları temizle.
            </p>
          )}
        </div>
      )}

      {/* prova ekranı */}
      {plan ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          {!plan.ok ? (
            <>
              <p className="mb-3 text-[12px] font-semibold text-rose-600">{plan.hata}</p>
              <button
                onClick={iptal}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500"
              >
                Kapat
              </button>
            </>
          ) : (
            <>
              <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                Dosya içeriği
              </p>
              <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
                {plan.ozet!.sayfa} sayfa · {plan.ozet!.vurgu} vurgu · {plan.ozet!.not} not ·{" "}
                {plan.ozet!.cizgi} çizgi
                {plan.ozet!.tarih > 0 && (
                  <span className="text-slate-400">
                    {" "}
                    · {new Date(plan.ozet!.tarih).toLocaleDateString("tr-TR")}
                  </span>
                )}
              </p>

              <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
                {(
                  [
                    ["merge", "Birleştir"],
                    ["replace", "Üzerine yaz"],
                  ] as [ImportMode, string][]
                ).map(([m, l]) => (
                  <button
                    key={m}
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      mode === m
                        ? m === "replace"
                          ? "bg-rose-700 text-white"
                          : "bg-blue-950 text-white"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
                {mode === "merge" ? (
                  <>
                    {plan.yeniSayfa} yeni sayfa, {plan.yeniVurgu} yeni vurgu, {plan.yeniNot} yeni
                    not eklenecek.
                    {plan.ezilecekNot > 0 && (
                      <>
                        {" "}
                        <span className="text-amber-700">
                          {plan.ezilecekNot} not yedektekiyle değiştirilecek (yedek daha yeni).
                        </span>
                      </>
                    )}
                    {plan.atlanacakNot > 0 && (
                      <> {plan.atlanacakNot} not atlanacak (buradaki daha yeni).</>
                    )}
                  </>
                ) : (
                  <span className="text-rose-600">
                    Bu cihazdaki tüm vurgu, not ve tekrar geçmişi silinip yerine yedektekiler
                    yazılacak. Geri alınamaz.
                  </span>
                )}
              </p>

              <div className="flex gap-2">
                {/* Etiket mod seçicideki düğmelerle AYNI olmamalı — ikisi de
                    "Birleştir" yazınca hangisinin uyguladığı belirsizleşiyor. */}
                <button
                  onClick={onayla}
                  className={`rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 ${
                    mode === "replace" ? "bg-rose-500 hover:bg-rose-400" : "bg-blue-950 hover:bg-blue-900"
                  }`}
                >
                  {mode === "replace" ? "Onayla ve üzerine yaz" : "Onayla ve birleştir"}
                </button>
                <button
                  onClick={iptal}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-50"
                >
                  Vazgeç
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={disariAktar}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            ↓ Yedek al (.json)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            ↑ Yedekten yükle
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={dosyaSecildi}
            className="hidden"
          />
          {/* Koşullu basılmıyor: canlı bölge, içerik değişmeden ÖNCE DOM'da
              bulunmalı — sonradan eklenen bir bölgenin ilk mesajı kaçabiliyor.
              Boşken görünmez, yer kaplamıyor. */}
          <span
            ref={durumRef}
            tabIndex={-1}
            role="status"
            className="text-[11px] font-semibold text-emerald-600 outline-none"
          >
            {durum ?? ""}
          </span>
        </div>
      )}

      <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
        Çalışma verin yalnızca bu tarayıcıda tutulur. Başka bir cihaza taşımak ya da tarayıcı
        temizliğinden korumak için yedek al — JSON yedeği çizimleri ve tekrar takvimini de taşır,
        Markdown taşımaz.
      </p>
    </section>
  );
}
