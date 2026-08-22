"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

/**
 * MASCC Risk İndeksi — febril nötropenide komplikasyon riski.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BURADA PUANLAMA TERSTİ VE CANLIDA ÖLÇÜLDÜ.
 *
 * Eski kodda etiketler OLUMLU yazılıydı ("Hipotansiyon Yok · +5") ama hesap
 * değişken ADINA uyuyordu: `hypotension ? 0 : 5`. Yani kullanıcı doğru olanı
 * yapıp "Hipotansiyon Yok" kutusunu işaretlediğinde puan EKLENMİYOR,
 * çıkarılıyordu. Altı kutunun DÖRDÜ kendi etiketinin tersine puanlıyordu.
 *
 * Ölçüm (canlı, gerçek tıklamalarla):
 *   dokunulmamış        19
 *   + "Hipotansiyon Yok" 14   (+5 olmalıydı)
 *   + "KOAH Yok"         10   (+4 olmalıydı)
 *   + "Dehidratasyon Yok" 11  (+3 olmalıydı)
 *   + "Yaş < 60"         12   (+2 olmalıydı)
 * Bütün olumlu özellikleri taşıyan hasta 12 alıp "YÜKSEK RİSK" çıkıyordu;
 * gerçek MASCC'si 26, yani mümkün olan en düşük risk.
 *
 * ÇARE, İŞARETİ DÜZELTMEK DEĞİL BELİRSİZLİĞİ KALDIRMAK: her öge artık bir
 * SORU ve cevap açıkça Evet/Hayır. "Evet" olumlu özelliğin VAR olduğunu
 * söyler ve puanı ekler. Değişken adı ile etiketin ters düşebileceği bir yer
 * kalmıyor.
 *
 * İKİNCİ KUSUR — BOŞ FORMDAN KLİNİK ETİKET. Hiç dokunulmamış sayfa
 * "19 · YÜKSEK RİSK" basıyordu. Yedi ögenin yedisi de yanıtlanmadan artık
 * sınıflama basılmıyor.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Cevap = "evet" | "hayir" | null;

/** Sorular OLUMLU özelliği sorar; "Evet" puanı EKLER. Toplam en çok 26. */
const OGELER = [
  { id: "hipotansiyon", soru: "Hipotansiyon yok mu?", alt: "Sistolik kan basıncı > 90 mmHg", puan: 5 },
  { id: "koah", soru: "Aktif KOAH yok mu?", alt: "Kronik obstrüktif akciğer hastalığı", puan: 4 },
  { id: "solid", soru: "Solid tümör mü, ya da önceden fungal enfeksiyon yok mu?", alt: "Hematolojik malignitede geçirilmiş fungal enfeksiyon yoksa da geçerli", puan: 4 },
  { id: "dehidratasyon", soru: "IV sıvı gerektiren dehidratasyon yok mu?", alt: "", puan: 3 },
  { id: "ayaktan", soru: "Ateş başladığında hasta ayaktan mıydı?", alt: "Hastane dışında", puan: 3 },
  { id: "yas", soru: "Hasta 60 yaşından küçük mü?", alt: "", puan: 2 },
] as const;

type OgeId = (typeof OGELER)[number]["id"];

const YUK = [
  { p: 5, label: "Semptom yok ya da hafif semptom" },
  { p: 3, label: "Orta düzey semptom" },
  { p: 0, label: "Ciddi semptom / genel durum kötü" },
];

const ESIK = 21;
const ENCOK = 26;

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanan bileşen her render'da yeni kimlik
 * alır ve React kontrolü söküp yeniden takar.
 */
function EvetHayirSatiri({
  id,
  soru,
  alt,
  puan,
  deger,
  ayarla,
}: {
  id: string;
  soru: string;
  alt: string;
  puan: number;
  deger: Cevap;
  ayarla: (v: Cevap) => void;
}) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <span id={`${id}-etiket`} className="text-sm font-bold text-blue-900 block">
          {soru}
        </span>
        {alt && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{alt}</span>}
      </div>
      <span className="text-[10px] font-black tracking-widest text-slate-500 shrink-0">
        Evet ise +{puan}
      </span>
      <div className="flex gap-2 shrink-0" role="group" aria-labelledby={`${id}-etiket`}>
        {(["evet", "hayir"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={deger === v}
            onClick={() => ayarla(deger === v ? null : v)}
            className={`px-5 py-2.5 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all
              ${
                deger === v
                  ? v === "evet"
                    ? "bg-blue-900 border-blue-900 text-white"
                    : "bg-slate-700 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-900/30"
              }`}
          >
            {v === "evet" ? "Evet" : "Hayır"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MasccPage() {
  const [yuk, setYuk] = React.useState<number | null>(null);
  const [cevaplar, setCevaplar] = React.useState<Record<OgeId, Cevap>>(
    Object.fromEntries(OGELER.map((o) => [o.id, null])) as Record<OgeId, Cevap>,
  );

  const yanitlanan = (yuk === null ? 0 : 1) + OGELER.filter((o) => cevaplar[o.id] !== null).length;
  const toplamOge = OGELER.length + 1;
  const tamam = yanitlanan === toplamOge;

  const skor = tamam
    ? yuk! + OGELER.reduce((t, o) => t + (cevaplar[o.id] === "evet" ? o.puan : 0), 0)
    : null;
  const dusukRisk = skor !== null && skor >= ESIK;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="mascc" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🎗️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                MASCC Risk İndeksi
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Febril nötropenide komplikasyon riski · yüksek puan = düşük risk
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Bu indekste yüksek puan İYİdir.</strong> Her soru olumlu bir
            özelliği sorar; &ldquo;Evet&rdquo; puanı ekler. Toplam {ENCOK} üzerinden
            hesaplanır ve {ESIK} puan ve üzeri düşük riskli grubu tanımlar.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Değerlendirme
            </span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {yanitlanan}/{toplamOge} yanıtlandı
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-sm font-bold text-blue-900 block">Hastalık yükü / semptom şiddeti</span>
            <div className="grid gap-1.5">
              {YUK.map((o) => (
                <button
                  key={o.p}
                  type="button"
                  aria-pressed={yuk === o.p}
                  onClick={() => setYuk(yuk === o.p ? null : o.p)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                    ${yuk === o.p ? "bg-blue-900 border-blue-900" : "bg-white border-slate-200 hover:border-blue-900/30"}`}
                >
                  <span className={`text-[12px] font-bold flex-1 ${yuk === o.p ? "text-white" : "text-blue-900"}`}>
                    {o.label}
                  </span>
                  <span className={`text-[10px] font-black ${yuk === o.p ? "text-amber-400" : "text-slate-500"}`}>
                    +{o.p}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {OGELER.map((o) => (
            <EvetHayirSatiri
              key={o.id}
              id={`mascc-${o.id}`}
              soru={o.soru}
              alt={o.alt}
              puan={o.puan}
              deger={cevaplar[o.id]}
              ayarla={(v) => setCevaplar((p) => ({ ...p, [o.id]: v }))}
            />
          ))}
        </div>

        {tamam ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">MASCC</span>
              <div className="text-5xl font-black text-white">{skor}</div>
              <span className="text-[10px] font-black text-blue-300 mt-1">/ {ENCOK}</span>
            </div>
            <div
              className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed
                ${dusukRisk ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}
            >
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                Risk
              </span>
              <p
                className={`text-2xl font-black italic tracking-tight ${dusukRisk ? "text-emerald-800" : "text-rose-800"}`}
              >
                {dusukRisk ? "Düşük risk" : "Yüksek risk"}
              </p>
              <p className={`text-sm font-bold mt-1 ${dusukRisk ? "text-emerald-800" : "text-rose-800"}`}>
                {dusukRisk
                  ? `Eşik: ≥${ESIK} puan · ayaktan oral antibiyotik değerlendirilebilir`
                  : `Eşik: <${ESIK} puan · hastane yatışı ve IV antibiyotik önerilir`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm font-bold text-slate-600" role="status">
              {toplamOge - yanitlanan} öge yanıtlanmadı. Yanıtlanmayan bir öge
              &ldquo;hayır&rdquo; anlamına GELMEZ; hepsi yanıtlanmadan risk sınıflaması
              basılmaz.
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              MASCC indeksi febril nötropenik hastalarda <strong>düşük riskli grubu</strong>{" "}
              (ayaktan tedavi adayı) belirlemek için kullanılır; yüksek riski derecelendirmez.
              Nihai karar kurumsal protokol ve klinik değerlendirmeyle birlikte verilir.
              İndeks, nötropeni süresi ve derinliği gibi bazı önemli etkenleri içermez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
