"use client";

/**
 * AĞIRLIKLI SINIFLAMA KRİTERLERİ — alan (domain) bazlı onay kutusu listesi.
 *
 * İki alan kuralı var ve kriter setleri bunları KARIŞTIRIYOR:
 *   "enYuksek"  alandaki işaretli maddelerden yalnızca EN YÜKSEK puanlı sayılır
 *               (EULAR/ACR 2019 SLE, ACR/EULAR 2013 sistemik skleroz)
 *   "toplam"    işaretli maddelerin hepsi toplanır (dev hücreli arterit, ANCA vaskülitleri)
 * "enYuksek" alanda kullanıcı birden çok maddeyi işaretleyebilir — gerçek hastada ikisi de
 * vardır — ama toplama yalnızca biri girer ve ekranda hangisinin sayıldığı yazılır.
 *
 * Puan hesabı `kriterPuani` ile bileşenden BAĞIMSIZ yapılıyor: sayfa sonucu, bileşen rozetleri
 * aynı fonksiyondan okur — ekranda sayılan madde ile toplama giren madde ayrışamaz.
 */
export type Kriter = { id: string; metin: string; puan: number };
export type KriterGrubu = { baslik: string; kural: "enYuksek" | "toplam"; maddeler: ReadonlyArray<Kriter> };

export function kriterPuani(gruplar: ReadonlyArray<KriterGrubu>, secili: ReadonlySet<string>) {
  const grupPuanlari = gruplar.map((g) => {
    const isaretli = g.maddeler.filter((m) => secili.has(m.id));
    if (isaretli.length === 0) return { puan: 0, sayilan: [] as string[] };
    if (g.kural === "toplam") return { puan: isaretli.reduce((t, m) => t + m.puan, 0), sayilan: isaretli.map((m) => m.id) };
    const enIyi = isaretli.reduce((a, b) => (b.puan > a.puan ? b : a));
    return { puan: enIyi.puan, sayilan: [enIyi.id] };
  });
  return { toplam: grupPuanlari.reduce((t, g) => t + g.puan, 0), grupPuanlari };
}

const isaretli = (p: number) => (p > 0 ? `+${p}` : `${p}`).replace(".", ",");

export default function PuanliKriterler({
  gruplar,
  secili,
  onDegistir,
}: {
  gruplar: ReadonlyArray<KriterGrubu>;
  secili: ReadonlySet<string>;
  onDegistir: (id: string) => void;
}) {
  const { grupPuanlari } = kriterPuani(gruplar, secili);
  return (
    <div className="space-y-3">
      {gruplar.map((g, gi) => {
        const gp = grupPuanlari[gi];
        return (
          <fieldset key={g.baslik} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <legend className="px-2 text-[12px] font-black text-blue-900">
              {g.baslik}
              <span className="ml-2 font-bold text-slate-600">
                {g.kural === "enYuksek" ? "· en yüksek puanlı madde sayılır" : ""} · alan puanı {isaretli(gp.puan)}
              </span>
            </legend>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {g.maddeler.map((m) => {
                const aktif = secili.has(m.id);
                const sayilmadi = aktif && !gp.sayilan.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
                      ${aktif ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
                  >
                    <input type="checkbox" checked={aktif} onChange={() => onDegistir(m.id)} className="w-4 h-4 accent-blue-900 shrink-0" />
                    <span className="flex-1 min-w-0 text-[12px] font-bold text-blue-950 leading-snug">
                      {m.metin}
                      {sayilmadi && <span className="block text-[11px] font-bold text-slate-600">aynı alanda daha yüksek puanlı madde sayıldı</span>}
                    </span>
                    <span
                      className={`shrink-0 min-w-[2.25rem] h-7 px-1.5 rounded-lg flex items-center justify-center text-[11px] font-black
                        ${m.puan < 0 ? "bg-rose-100 text-rose-900" : aktif ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-700"}`}
                    >
                      {isaretli(m.puan)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/** Onay kutusu kümesini değiştiren ortak işleyici. */
export function kumeDegistir(set: ReadonlySet<string>, id: string): Set<string> {
  const y = new Set(set);
  if (y.has(id)) y.delete(id);
  else y.add(id);
  return y;
}
