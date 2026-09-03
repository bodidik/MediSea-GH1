"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

/*
 * Modifiye Rankin Skalası (mRS) — van Swieten et al., Stroke 1988.
 *
 * SLUG "rankin", "mrs" DEĞİL: bu depoda zaten `mrss` var (Rodnan deri
 * skoru) ve iki slug tek harf farkla ayrışıyordu. Adres bir kimliktir;
 * görsel olarak karışan iki slug, paylaşılan bağlantıda sessiz bir yanlış
 * araç açar.
 *
 * Seçim PUANLA değil İNDEKSLE saklanıyor — burada derece ile indeks bugün
 * aynı sayı (0..6), yani şekil latent. Ama bu depoda "aynı puanlı iki şık
 * tek düğme olur" sınıfı ALTI kez ölçüldü (apache2 · gout-acr · pap-score ·
 * nutrition-needs · tirads · nihss); indeks, ileride bir ara derece
 * eklenirse kusuru baştan imkânsız kılıyor.
 */
const DERECELER: { derece: number; label: string; sub: string }[] = [
  { derece: 0, label: "Semptom yok", sub: "Hiçbir semptom bulunmuyor" },
  { derece: 1, label: "Anlamlı özürlülük yok", sub: "Semptomu var ama her zamanki tüm görev ve aktivitelerini yapabiliyor" },
  { derece: 2, label: "Hafif özürlülük", sub: "Önceki aktivitelerinin tümünü yapamıyor; kendi işlerini yardımsız görebiliyor" },
  { derece: 3, label: "Orta özürlülük", sub: "Bir miktar yardım gerekiyor; yardımsız yürüyebiliyor" },
  { derece: 4, label: "Orta-ağır özürlülük", sub: "Yardımsız yürüyemiyor; bedensel ihtiyaçlarını yardımsız karşılayamıyor" },
  { derece: 5, label: "Ağır özürlülük", sub: "Yatağa bağımlı, inkontinan; sürekli hemşirelik bakımı ve ilgi gerektiriyor" },
  { derece: 6, label: "Ölüm", sub: "Hasta kaybedildi" },
];

/*
 * İYİ SONUÇ EŞİĞİ İLAN EDİLİYOR VE UYGULANIYOR. Bu depoda "ilan edilip
 * uygulanmayan kural" sınıfı YEDİ kez ölçüldü (haq-di · murray · apache2 ·
 * anaphylaxis · canadian-ct · rts · sodium); hepsinde metin doğruydu,
 * eksik olan hesaptı. Eşik sabitten geliyor, aşağıdaki bant ve cetvel
 * metinleri de ondan TÜRÜYOR — elle yazılmıyor.
 */
const IYI_SONUC_TAVANI = 2;
const OLUM = Math.max(...DERECELER.map(d => d.derece));

/*
 * ÇAPRAZ KONTROL — yapılandırılmış görüşme akışı.
 *
 * mRS'in yayımlanmış zaafı gözlemciler arası uyumsuzluk; yapılandırılmış
 * soru dizisi onu azaltıyor. Buradaki akış mRS'in KENDİ derece tanımlarını
 * sırayla soruyor, yeni bir klinik iddia üretmiyor: her sorunun "hayır"
 * dalı bir sonraki dereceye geçiyor.
 *
 * İKİNCİ OKUMA olarak duruyor — hüküm DOĞRUDAN SEÇİMDEN kuruluyor.
 * Aynı disiplin abg (Δgap) ve sodium (desalinasyon) turlarında ölçüldü:
 * ikinci okuma ayrışırsa SÖYLÜYOR, birincil sonucu DEĞİŞTİRMİYOR.
 *
 * Ölüm (6) bu akışta yok: o bir gözlem, görüşme sonucu değil.
 *
 * ⚠ AKIŞIN YÖNÜ SORUDAN SORUYA DEĞİŞİYOR ve tek yön varsaymak SESSİZCE
 * yanlış derece üretiyordu — ölçümle yakalandı. İlk soruda AKIŞI DURDURAN
 * cevap "hayır" (semptom yoksa mRS 0), sonrakilerde "evet" (yapabiliyorsa
 * o derecede duruyor). Bu yüzden her kayıt kendi `durduran` cevabını
 * taşıyor; ortak bir kural yok. Son soru her iki dalda da duruyor.
 */
const SORULAR: { id: string; soru: string; ipucu: string; durduran: boolean; derece: number; digerDerece?: number }[] = [
  { id: "semptom", soru: "Hastanın herhangi bir semptomu var mı?", ipucu: "Baş ağrısı, güçsüzlük, konuşma güçlüğü, görme kaybı dahil", durduran: false, derece: 0 },
  { id: "aktivite", soru: "Her zamanki görev ve aktivitelerinin TÜMÜNÜ yapabiliyor mu?", ipucu: "İş, hobiler, sosyal roller — inme öncesiyle aynı düzeyde", durduran: true, derece: 1 },
  { id: "ozbakim", soru: "Kendi işlerini YARDIMSIZ görebiliyor mu?", ipucu: "Giyinme, yemek yeme, tuvalet, alışveriş ve para işleri", durduran: true, derece: 2 },
  { id: "yurume", soru: "Yardımsız YÜRÜYEBİLİYOR mu?", ipucu: "Baston ve yürüteç sayılır; başka bir kişinin desteği SAYILMAZ", durduran: true, derece: 3 },
  { id: "yatak", soru: "Yatağa bağımlı ve sürekli hemşirelik bakımı gerektiriyor mu?", ipucu: "İnkontinans ve gece dahil sürekli ilgi", durduran: true, derece: 5, digerDerece: 4 },
];

/* İlk durduran cevap dereceyi belirliyor; son soruda iki dal da duruyor. */
function capraDerece(yanit: Record<string, boolean | null>): number | null {
  for (const s of SORULAR) {
    const v = yanit[s.id];
    if (v === null || v === undefined) return null;
    if (v === s.durduran) return s.derece;
    if (s.digerDerece !== undefined) return s.digerDerece;
  }
  return null;
}

/* Akışın o an gerçekten SORDUĞU soru — önceki cevaplar dalı kapatmışsa
 * sonraki sorular ekrana hiç gelmiyor (ölü kontrol üretmemek için). */
function gorunurSorular(yanit: Record<string, boolean | null>): string[] {
  const gorunur: string[] = [];
  for (const s of SORULAR) {
    gorunur.push(s.id);
    const v = yanit[s.id];
    if (v === null || v === undefined) break;
    if (v === s.durduran) break;
    if (s.digerDerece !== undefined) break;
  }
  return gorunur;
}

const bantBul = (d: number) =>
  d === OLUM
    ? { label: "ÖLÜM", color: "slate", sub: "mRS 6" }
    : d <= IYI_SONUC_TAVANI
      ? { label: "İYİ SONUÇ", color: "emerald", sub: `mRS 0–${IYI_SONUC_TAVANI} — bağımsız` }
      : { label: "BAĞIMLI", color: "rose", sub: `mRS ${IYI_SONUC_TAVANI + 1}–${OLUM - 1} — günlük yaşamda yardım gerekiyor` };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
  slate:   { bg: "bg-slate-100",  border: "border-slate-300",   text: "text-slate-700",   badge: "bg-slate-700 text-white" },
};

const kimlik = (id: string) => String(id).replace(/[^a-zA-Z0-9]+/g, "-");

export default function RankinPage() {
  const [secim, setSecim] = React.useState<number | null>(null);
  const [yanit, setYanit] = React.useState<Record<string, boolean | null>>(
    Object.fromEntries(SORULAR.map(s => [s.id, null]))
  );

  const capraz = capraDerece(yanit);
  const gorunur = gorunurSorular(yanit);
  const yanitlanan = SORULAR.filter(s => yanit[s.id] !== null).length;

  const derece = secim !== null ? DERECELER[secim].derece : null;
  const bant = derece !== null ? bantBul(derece) : null;
  const c = bant ? COLOR[bant.color] : null;

  /* İki okuma ayrışıyor mu? Ölüm çapraz kontrolde yok, o yüzden 6 seçiliyse
   * karşılaştırma yapılmıyor — yoksa her ölüm vakasında sahte bir ayrışma
   * raporlanırdı. */
  const ayrisma =
    derece !== null && derece !== OLUM && capraz !== null && capraz !== derece;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="rankin" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🚶</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Modifiye Rankin (mRS)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">İnme sonrası işlevsel sonuç · {DERECELER.length} derece · 0–{OLUM}</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span aria-hidden="true" className="text-amber-400 text-base leading-none mt-0.5">💡</span>
          <p className="text-[11px] leading-relaxed">
            mRS <span className="font-black">şiddet değil sonuç</span> ölçer: hastanın günlük yaşamda ne kadar bağımsız olduğunu. Yayımlanmış zaafı <span className="font-black">gözlemciler arası uyumsuzluk</span> — aşağıdaki yapılandırılmış görüşme onu azaltmak için var ve dereceyi ikinci bir yoldan hesaplıyor.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p id="grp-derece" className="font-black text-blue-900 uppercase italic text-sm mb-0.5">Derece seçimi</p>
          <p id="grp-derece-d" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Klinik değerlendirmenize en uyan tek dereceyi seçin</p>
          <div role="group" aria-labelledby="grp-derece grp-derece-d" className="space-y-1.5">
            {DERECELER.map((d, i) => (
              <button aria-pressed={secim === i} key={d.derece} type="button"
                onClick={() => setSecim(s => (s === i ? null : i))}
                className={`w-full text-left flex items-start gap-3 px-3 py-2 rounded-xl border-2 transition-all
                  ${secim === i ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5
                  ${secim === i ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{d.derece}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-black">{d.label}</span>
                  <span className={`block text-[10px] font-bold leading-snug ${secim === i ? "text-blue-100" : "text-slate-500"}`}>{d.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-0.5">
            <p id="grp-capraz" className="font-black text-blue-900 uppercase italic text-sm">Yapılandırılmış görüşme</p>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{yanitlanan}/{SORULAR.length} soru</span>
          </div>
          <p id="grp-capraz-d" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Opsiyonel — dereceyi ikinci bir yoldan hesaplar, seçiminizi değiştirmez</p>
          <div className="space-y-2">
            {SORULAR.filter(s => gorunur.includes(s.id)).map(s => (
              <div key={s.id} className="border border-slate-100 bg-slate-50 rounded-xl p-3">
                <p id={`q-${kimlik(s.id)}`} className="text-[11px] font-black text-blue-900 leading-snug">{s.soru}</p>
                <p id={`q-d-${kimlik(s.id)}`} className="text-[9px] font-bold text-slate-400 leading-snug mt-0.5">{s.ipucu}</p>
                <div role="group" aria-labelledby={`q-${kimlik(s.id)} q-d-${kimlik(s.id)}`} className="flex gap-2 mt-2">
                  {[true, false].map(v => (
                    <button aria-pressed={yanit[s.id] === v} key={String(v)} type="button"
                      onClick={() => setYanit(y => ({ ...y, [s.id]: y[s.id] === v ? null : v }))}
                      className={`flex-1 px-3 py-1.5 rounded-lg border-2 text-[10px] font-black uppercase tracking-wider transition-all
                        ${yanit[s.id] === v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"}`}>
                      {v ? "Evet" : "Hayır"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {capraz !== null && (
            <p className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 leading-relaxed mt-3">
              Görüşme akışının verdiği derece: <span className="font-black text-blue-900">mRS {capraz}</span> — {DERECELER[capraz].label}
            </p>
          )}
        </div>

        {/* Önek YOK: SonucDuyuru metnin başına kendisi "Sonuç: " ekliyor.
            Buraya da yazınca duyuru "Sonuç: Sonuç: mRS 2" diye kendini
            tekrarlıyordu — ölçümle yakalandı. */}
        <SonucDuyuru metin={bant && derece !== null ? `mRS ${derece} — ${bant.label}` : null} />
        {derece !== null && bant && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">mRS</span>
                <span className="text-4xl font-black text-white leading-none">{derece}</span>
                <span className="text-[8px] text-blue-300">/ {OLUM}</span>
              </div>
              <div className="min-w-0">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{bant.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{bant.sub}</p>
              </div>
            </div>

            <div className="bg-white/70 border border-slate-200 rounded-xl px-3 py-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seçilen derecenin tanımı</p>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5 leading-relaxed">{DERECELER[secim as number].sub}</p>
            </div>

            {ayrisma && (
              <div className="bg-white/80 border-2 border-amber-300 rounded-xl px-3 py-2">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Çapraz kontrol — ikinci okuma ayrışıyor</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed mt-1">
                  Doğrudan seçiminiz <span className="font-black">mRS {derece}</span>, yapılandırılmış görüşme <span className="font-black">mRS {capraz}</span> veriyor. Yukarıdaki sonuç <span className="font-black">SEÇİMİNİZDEN</span> kuruldu. Ayrım genellikle iki yerde olur: <span className="font-black">yürüme</span> sorusu 2 ile 3&apos;ü, <span className="font-black">öz bakım</span> sorusu 3 ile 4&apos;ü ayırır.
                </p>
              </div>
            )}

            <div className="grid grid-cols-7 gap-1 text-center">
              {DERECELER.map(d => (
                <div key={d.derece} className={`rounded-lg py-2 ${d.derece === derece ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div className="text-base font-black leading-none">{d.derece}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bir derece seçin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              mRS inme öncesi durumdan bağımsız okunmamalıdır: bazal mRS&apos;i 3 olan bir hastada çıkış mRS&apos;inin 3 olması işlevsel kayıp OLMADIĞI anlamına gelir. &quot;İyi sonuç&quot; eşiği çalışmaya göre değişir; burada yaygın kullanılan <span className="font-black">0–{IYI_SONUC_TAVANI}</span> uygulanmıştır, bazı çalışmalar 0–1 kullanır. Derece bir görüşmeye dayanır, tek bir muayene anına değil. van Swieten et al., Stroke 1988.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
