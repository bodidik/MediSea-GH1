"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * ASPECTS — Alberta Stroke Program Early CT Score (Barber ve ark., Lancet 2000).
 * 10'dan başlanır; orta serebral arter alanındaki 10 bölgenin her birinde erken iskemik
 * değişiklik (hipodansite, gri-beyaz cevher ayrımının kaybı, fokal şişme) varsa 1 düşülür.
 *
 * İşaretlenen şey TUTULUM; skor = 10 − tutulan bölge sayısı. Ekranda ikisi yan yana
 * gösteriliyor — ters okunursa (sağlam bölgeleri işaretlemek) skor tam tersine döner.
 */
const BOLGELER = [
  { id: "C", ad: "C — Kaudat", duzey: "Gangliyonik" },
  { id: "L", ad: "L — Lentiform çekirdek", duzey: "Gangliyonik" },
  { id: "IC", ad: "IC — İnternal kapsül", duzey: "Gangliyonik" },
  { id: "I", ad: "I — İnsüler şerit", duzey: "Gangliyonik" },
  { id: "M1", ad: "M1 — Anterior MCA korteksi", duzey: "Gangliyonik" },
  { id: "M2", ad: "M2 — İnsulanın lateralindeki MCA korteksi", duzey: "Gangliyonik" },
  { id: "M3", ad: "M3 — Posterior MCA korteksi", duzey: "Gangliyonik" },
  { id: "M4", ad: "M4 — Anterior MCA alanı (M1'in üstü)", duzey: "Supragangliyonik" },
  { id: "M5", ad: "M5 — Lateral MCA alanı (M2'nin üstü)", duzey: "Supragangliyonik" },
  { id: "M6", ad: "M6 — Posterior MCA alanı (M3'ün üstü)", duzey: "Supragangliyonik" },
] as const;

const BANTLAR: Bant[] = [
  { aralik: "8–10", etiket: "Küçük/yok erken iskemi", alt: "Trombektomi için olumlu görüntüleme profili (diğer ölçütlerle birlikte).", renk: "emerald" },
  { aralik: "6–7", etiket: "Orta erken iskemi", alt: "Ön dolaşım büyük damar tıkanıklığında 6 saat içinde trombektomi kılavuz ölçütü ASPECTS ≥ 6 idi (AHA/ASA 2019).", renk: "amber" },
  { aralik: "3–5", etiket: "Geniş erken iskemi", alt: "Büyük infarkt çekirdeği — güncel randomize çalışmalar bu grupta da trombektomi yararı gösterdi; merkez protokolüne göre değerlendirin.", renk: "orange" },
  { aralik: "0–2", etiket: "Çok geniş iskemi", alt: "Kötü fonksiyonel sonuç ve semptomatik kanama riski yüksek.", renk: "rose" },
];

const bantBul = (s: number) => (s >= 8 ? BANTLAR[0] : s >= 6 ? BANTLAR[1] : s >= 3 ? BANTLAR[2] : BANTLAR[3]);

export default function AspectsPage() {
  const [tutulum, setTutulum] = React.useState<ReadonlySet<string>>(new Set());
  const [basladi, setBasladi] = React.useState(false);
  const degistir = (id: string) => {
    setBasladi(true);
    setTutulum((s) => {
      const y = new Set(s);
      if (y.has(id)) y.delete(id);
      else y.add(id);
      return y;
    });
  };
  const skor = basladi ? 10 - tutulum.size : null;

  return (
    <OlcekKabugu
      slug="aspects"
      ikon="🖥️"
      baslik="ASPECTS"
      altBaslik="Alberta Stroke Program Early CT Score · 0–10"
      paylasim={{ aspects: skor }}
      not={
        <>
          <p>
            Yalnızca orta serebral arter alanı inmesinde ve kontrastsız BT'de geçerlidir; posterior dolaşım için pc-ASPECTS ayrı bir skordur.
            İki kesit düzeyi (gangliyonik ve supragangliyonik) birlikte değerlendirilir; bir bölgenin yalnızca bir kısmının tutulumu da 1 puan düşürür.
          </p>
          <p>Barber PA ve ark., Lancet 2000; Powers WJ ve ark., AHA/ASA akut iskemik inme kılavuzu 2019.</p>
        </>
      }
    >
      <fieldset className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <legend className="px-2 text-[12px] font-black text-blue-900">Erken iskemik değişiklik OLAN bölgeleri işaretleyin</legend>
        {(["Gangliyonik", "Supragangliyonik"] as const).map((duzey) => (
          <div key={duzey} className="mt-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{duzey} düzey</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BOLGELER.filter((b) => b.duzey === duzey).map((b) => {
                const aktif = tutulum.has(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                      ${aktif ? "border-rose-600 bg-rose-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                  >
                    <input type="checkbox" checked={aktif} onChange={() => degistir(b.id)} className="w-4 h-4 accent-rose-700 shrink-0" />
                    <span className="text-[12px] font-bold text-blue-950">{b.ad}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => { setBasladi(true); setTutulum(new Set()); }}
          className="mt-4 w-full min-h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-[12px] font-black text-blue-900 hover:border-blue-300"
        >
          Hiçbir bölgede erken iskemi yok (ASPECTS 10)
        </button>
      </fieldset>

      <SkorPaneli
        skor={skor}
        payda={10}
        bantlar={BANTLAR}
        aktif={skor === null ? null : bantBul(skor)}
        eksikMetni="Tutulan bölgeleri işaretleyin ya da 'hiçbiri' seçin"
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">10 − {tutulum.size} tutulan bölge{tutulum.size ? ` (${[...tutulum].join(", ")})` : ""}</p> : null}
      />
    </OlcekKabugu>
  );
}
