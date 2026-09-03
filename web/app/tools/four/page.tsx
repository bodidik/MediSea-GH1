"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/*
 * FOUR skoru (Full Outline of UnResponsiveness) — Wijdicks et al.,
 * Ann Neurol 2005.
 *
 * Seçim PUANLA değil İNDEKSLE saklanıyor. Bugün hiçbir bileşende çift puan
 * yok, yani şekil latent — ama bu depoda "aynı puanlı iki şık tek düğme
 * olur" sınıfı apache2 · gout-acr · pap-score · nutrition-needs · tirads ve
 * nihss ile ALTI kez ölçüldü. İndeks, ileride bir şık eklenirse kusuru
 * baştan imkânsız kılıyor.
 */
const BILESENLER: {
  id: string;
  harf: string;
  label: string;
  detail: string;
  options: { label: string; pts: number }[];
}[] = [
  {
    id: "goz",
    harf: "E",
    label: "E — Göz Yanıtı",
    detail: "Takip için parmağınızı yatay ve dikey hareket ettirin; yanıt yoksa göz kapağını açıp bakın",
    options: [
      { label: "0 — Ağrıya rağmen göz kapakları kapalı kalıyor", pts: 0 },
      { label: "1 — Göz kapakları kapalı; AĞRIYLA açılıyor", pts: 1 },
      { label: "2 — Göz kapakları kapalı; YÜKSEK SESLE açılıyor", pts: 2 },
      { label: "3 — Göz kapakları açık ama TAKİP YOK", pts: 3 },
      { label: "4 — Göz kapakları açık (veya açtırılıyor); takip ediyor ya da komutla göz kırpıyor", pts: 4 },
    ],
  },
  {
    id: "motor",
    harf: "M",
    label: "M — Motor Yanıt",
    detail: "Üç komutu da deneyin; yanıt yoksa tırnak yatağı veya supraorbital ağrılı uyaran verin",
    options: [
      { label: "0 — Ağrıya yanıt yok veya jeneralize miyoklonik status", pts: 0 },
      { label: "1 — Ağrıya EKSTANSİYON yanıtı", pts: 1 },
      { label: "2 — Ağrıya FLEKSİYON yanıtı", pts: 2 },
      { label: "3 — Ağrıyı LOKALİZE ediyor", pts: 3 },
      { label: "4 — Komutla başparmak / yumruk / barış işareti yapıyor", pts: 4 },
    ],
  },
  {
    id: "beyinsapi",
    harf: "B",
    label: "B — Beyin Sapı Refleksleri",
    detail: "Pupil ve kornea refleksini birlikte değerlendirin; ikisi de yoksa öksürük refleksine bakın",
    options: [
      { label: "0 — Pupil, kornea VE öksürük refleksi yok", pts: 0 },
      { label: "1 — Pupil ve kornea refleksi yok (öksürük korunmuş)", pts: 1 },
      { label: "2 — Pupil VEYA kornea refleksi yok", pts: 2 },
      { label: "3 — Bir pupil geniş ve fikse", pts: 3 },
      { label: "4 — Pupil ve kornea refleksleri mevcut", pts: 4 },
    ],
  },
  {
    id: "solunum",
    harf: "R",
    label: "R — Solunum",
    detail: "Entübe hastada ventilatör hızıyla hastanın kendi hızını karşılaştırın",
    options: [
      { label: "0 — Ventilatör hızında soluyor veya APNE", pts: 0 },
      { label: "1 — Ventilatör hızının ÜSTÜNDE soluyor", pts: 1 },
      { label: "2 — Entübe değil; DÜZENSİZ solunum", pts: 2 },
      { label: "3 — Entübe değil; Cheyne-Stokes solunum paterni", pts: 3 },
      { label: "4 — Entübe değil; düzenli solunum paterni", pts: 4 },
    ],
  },
];

/*
 * Tavan ELLE yazılmıyor: bu depoda elle yazılan sayı defalarca sessizce
 * yalana döndü (nihss'te "/ 42" tam bu şekilde bayatlamıştı).
 */
const TAVAN = BILESENLER.reduce((s, b) => s + Math.max(...b.options.map(o => o.pts)), 0);

/*
 * BANT MERDİVENİ BİLEREK YOK. Yayımlanmış FOUR'da adlandırılmış şiddet
 * bandı bulunmuyor; skorun klinik değeri BİLEŞEN PROFİLİNDE (E_M_B_R_) ve
 * hasta kaydına da öyle geçiyor. Toplamı beş renkli banda bölmek uydurma
 * bir partisyon olurdu. Aşağıdaki dört durumun dördü de şıkların KENDİ
 * tanımından türüyor — yeni bir klinik iddia değil:
 *   16      -> dört bileşen de tam
 *    0      -> E0 M0 B0 R0; şıkların tanımı gereği pupil/kornea/öksürük yok
 *              ve apne var (beyin ölümü değerlendirmesinin ön koşulu)
 *   B<=1    -> "pupil ve kornea refleksi yok" (şıkkın kendi metni)
 *   R<=1    -> "ventilatör hızında/üstünde" (şıkkın kendi metni)
 */
const durumBul = (toplam: number, b: number, r: number) =>
  toplam === TAVAN
    ? { label: "TAM YANITLI", color: "emerald", sub: "Dört bileşen de tam" }
    : toplam === 0
      /* Etiket profille AYNI OLMAMALI: duyuru "profil — etiket" biçiminde
       * kuruluyor ve "E0 M0 B0 R0 — E0 M0 B0 R0" diye kendini tekrarlıyordu. */
      ? { label: "TÜM BİLEŞENLER 0", color: "rose", sub: "Beyin sapı refleksleri ve solunum yok — beyin ölümü değerlendirmesi gerektirir" }
      : b <= 1 || r <= 1
        ? { label: "KRİTİK BİLEŞEN", color: "rose", sub: "Beyin sapı refleksi ve/veya solunum kaybı var" }
        : { label: "BİLİNÇ BOZUKLUĞU", color: "amber", sub: "Bileşen profilini seri olarak takip edin" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

const kimlik = (id: string) => String(id).replace(/[^a-zA-Z0-9]+/g, "-");

export default function FourPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(BILESENLER.map(b => [b.id, null]))
  );

  const yanitlanan = Object.values(sel).filter(v => v !== null).length;
  const tamam = yanitlanan === BILESENLER.length;

  const puan = (id: string) => {
    const oi = sel[id];
    const b = BILESENLER.find(x => x.id === id);
    return oi !== null && b ? b.options[oi].pts : null;
  };

  const e = puan("goz");
  const m = puan("motor");
  const bsap = puan("beyinsapi");
  const r = puan("solunum");

  const toplam = tamam
    ? BILESENLER.reduce((s, b) => s + (b.options[sel[b.id] as number]?.pts ?? 0), 0)
    : null;

  /* Hasta kaydına giren gerçek çıktı bu: toplam değil profil. */
  const profil = tamam ? `E${e} M${m} B${bsap} R${r}` : null;

  const durum = toplam !== null ? durumBul(toplam, bsap as number, r as number) : null;
  const c = durum ? COLOR[durum.color] : null;

  /*
   * FOUR'un GKS'ye göre ayırt edici bulgusu: göz takibi puanlandığı için
   * locked-in tablosu yakalanabiliyor. Bayrak bir TANI koymuyor, o ayrımın
   * yapılması gerektiğini söylüyor.
   */
  const lockedIn = tamam && e === 4 && m === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="four" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">👁️</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">FOUR Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Full Outline of UnResponsiveness · {BILESENLER.length} Bileşen · 0–{TAVAN} Puan</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span aria-hidden="true" className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-[11px] leading-relaxed">
            GKS&apos;den farkı: <span className="font-black">sözel bileşen yok</span>, bu yüzden entübe hastada da eksiksiz uygulanabilir. Göz takibi puanlandığı için <span className="font-black">locked-in</span> tablosunu, beyin sapı ve solunum bileşenleri sayesinde <span className="font-black">herniasyon ve apneyi</span> yakalar.
          </p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{yanitlanan}/{BILESENLER.length} bileşen</span>
          <div className="flex flex-wrap gap-0.5">
            {BILESENLER.map(b => (
              <div key={b.id} className={`w-3 h-2 rounded-sm transition-all ${sel[b.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {BILESENLER.map(bilesen => (
            <div key={bilesen.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p id={`grp-b-${kimlik(bilesen.id)}`} className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{bilesen.label}</p>
              <p id={`grp-d-${kimlik(bilesen.id)}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{bilesen.detail}</p>
              <div role="group" aria-labelledby={`grp-b-${kimlik(bilesen.id)} grp-d-${kimlik(bilesen.id)}`} className="space-y-1.5">
                {bilesen.options.map((opt, oi) => (
                  <button aria-pressed={sel[bilesen.id] === oi} key={oi} type="button"
                    onClick={() => setSel(s => ({ ...s, [bilesen.id]: s[bilesen.id] === oi ? null : oi }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[bilesen.id] === oi ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[bilesen.id] === oi ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SonucDuyuru metin={durum && profil ? `${profil} — ${durum.label}` : null} />
        {toplam !== null && durum && c && profil ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">FOUR</span>
                <span className="text-4xl font-black text-white leading-none">{toplam}</span>
                <span className="text-[8px] text-blue-300">/ {TAVAN}</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{durum.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{durum.sub}</p>
              </div>
            </div>

            <div className="bg-white/70 border border-slate-200 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hasta kaydına yazılacak profil</p>
              <p className="text-lg font-black text-blue-900 tracking-widest mt-0.5">{profil}</p>
            </div>

            {lockedIn && (
              <p className="text-[10px] font-bold text-slate-600 bg-white/70 border border-slate-200 rounded-xl px-3 py-2 leading-relaxed">
                Göz takibi var (E4) ama ağrıya motor yanıt yok (M0) — <span className="font-black">locked-in sendromu</span> açısından değerlendirin. GKS bu ayrımı yapamaz.
              </p>
            )}

            <div className="grid grid-cols-4 gap-1 text-center">
              {BILESENLER.map(b => {
                const p = puan(b.id);
                return (
                  <div key={b.id} className={`rounded-lg p-2 ${p === 0 ? "bg-rose-700 text-white" : "bg-white/60 text-slate-600"}`}>
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-70">{b.harf}</div>
                    <div className="text-xl font-black leading-none">{p}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dört bileşeni de tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              FOUR skoru tek başına beyin ölümü tanısı koydurmaz; 0 puan yalnızca resmî beyin ölümü protokolünün başlatılmasını gerektirir. Sedasyon, nöromusküler blokaj, hipotermi ve metabolik bozukluklar bileşenleri baskılar — skor bunlar dışlanmadan yorumlanmamalıdır. Seri ölçüm tek ölçümden değerlidir. Wijdicks et al., Ann Neurol 2005.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
