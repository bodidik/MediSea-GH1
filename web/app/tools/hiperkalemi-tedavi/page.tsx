"use client";

import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import ToolShare from "@/app/tools/components/ToolShare";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Hiperkalemi acil tedavisi — KAYDIRAN ile ÇIKARAN ayrımı.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BU ARACIN TEK İŞİ ŞU AYRIMI GÖRÜNÜR KILMAK:
 *
 *   STABİLİZE  kalsiyum        potasyumu DÜŞÜRMEZ — yalnızca membranı korur
 *   KAYDIRIR   insülin, beta   potasyum vücutta KALIR, hücre içine geçer
 *   ÇIKARIR    diyaliz, bağlayıcı, diüretik
 *
 * Kaydıran tedaviler geçici: etkileri 2-6 saatte biter ve potasyum GERİ
 * ÇIKAR. Çıkaran bir yol kurulmazsa hasta birkaç saat sonra aynı yerde,
 * ama bu kez "tedavi edildi" sanılarak izleniyor olur.
 *
 * Kalsiyumu "potasyum düşürücü" sanmak da aynı sınıftan: EKG düzelir,
 * potasyum aynı kalır. Araç bu yüzden her satırın MEKANİZMASINI yazıyor.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ARAÇ TEDAVİ KARARI VERMEZ. Aciliyeti EKG, potasyumun yükselme HIZI ve
 * sebebi belirler; burada yalnızca doz aritmetiği ve mekanizma ayrımı var.
 */

type Etki = "stabilize" | "kaydirir" | "cikarir";

type Mudahale = {
  slug: string;
  ad: string;
  etki: Etki;
  doz: string;
  baslangic: string;
  sure: string;
  not: string;
  /** Bu müdahale hangi durumda gösterilir. Eşik DİZİSİ yok — açık koşul. */
  uygun: (k: number, ekg: boolean, anuric: boolean) => boolean;
};

const ETKI_ETIKET: Record<Etki, { ad: string; renk: string; aciklama: string }> = {
  stabilize: {
    ad: "STABİLİZE",
    renk: "bg-rose-100 text-rose-800 border-rose-300",
    aciklama: "Potasyumu DÜŞÜRMEZ — miyokardı korur",
  },
  kaydirir: {
    ad: "KAYDIRIR",
    renk: "bg-amber-100 text-amber-800 border-amber-300",
    aciklama: "Potasyum vücutta kalır, hücre içine geçer — GEÇİCİ",
  },
  cikarir: {
    ad: "ÇIKARIR",
    renk: "bg-emerald-100 text-emerald-800 border-emerald-300",
    aciklama: "Potasyumu vücuttan gerçekten uzaklaştırır",
  },
};

const MUDAHALELER: Mudahale[] = [
  {
    slug: "kalsiyum",
    ad: "Kalsiyum glukonat %10",
    etki: "stabilize",
    doz: "10 mL IV, 2–3 dakikada",
    baslangic: "1–3 dakika",
    sure: "30–60 dakika",
    not: "EKG değişikliği varsa İLK yapılacak iş. Potasyumu düşürmez; etki bitince EKG yeniden bozulabilir, gerekirse tekrarlanır. Santral yol varsa kalsiyum klorür daha az hacimle aynı işi yapar ama periferden verilmez (doku nekrozu).",
    uygun: (k, ekg) => ekg || k >= 6.5,
  },
  {
    slug: "insulin",
    ad: "Regüler insülin + dekstroz",
    etki: "kaydirir",
    doz: "10 Ü IV + 25 g dekstroz (50 mL %50)",
    baslangic: "15–30 dakika",
    sure: "4–6 saat",
    not: "En güvenilir kaydırıcı. Kan şekeri 250 mg/dL üzerindeyse dekstroz VERİLMEZ. Hipoglisemi geç gelir (1–3 saat) — tek ölçümle bırakma, en az 6 saat izle.",
    uygun: (k) => k >= 6,
  },
  {
    slug: "salbutamol",
    ad: "Salbutamol (nebül)",
    etki: "kaydirir",
    doz: "10–20 mg nebül, 15 dakikada",
    baslangic: "30 dakika",
    sure: "2–4 saat",
    not: "DOZ ASTIM DOZUNUN YAKLAŞIK 8 KATI — 2.5 mg hiperkalemide etkisiz kalır. Hastaların yaklaşık dörtte birinde yanıt yok, o yüzden tek başına kullanılmaz. Taşikardi ve tremor beklenir.",
    uygun: (k) => k >= 6,
  },
  {
    slug: "bikarbonat",
    ad: "Sodyum bikarbonat",
    etki: "kaydirir",
    doz: "metabolik asidoz VARSA, açığa göre",
    baslangic: "değişken",
    sure: "değişken",
    not: "Yalnızca eşlik eden metabolik asidozda anlamlı. Asidozu olmayan hastada potasyumu düşürdüğü gösterilmemiştir; sodyum yükü ve hacim yüklenmesi riski kalır. Kalsiyumla AYNI YOLDAN verilmez (çökelme).",
    uygun: (k) => k >= 6,
  },
  {
    slug: "diuretik",
    ad: "Furosemid",
    etki: "cikarir",
    doz: "40 mg IV (böbrek işlevine göre)",
    baslangic: "30–60 dakika",
    sure: "birkaç saat",
    not: "İdrar çıkışı olan hastada işe yarar. Anürik hastada ETKİSİZ — orada tek gerçek çıkarma yolu diyalizdir.",
    uygun: (k, _ekg, anuric) => k >= 5.5 && !anuric,
  },
  {
    slug: "baglayici",
    ad: "Potasyum bağlayıcı (oral)",
    etki: "cikarir",
    doz: "yeni kuşak bağlayıcı, günlük",
    baslangic: "saatler",
    sure: "sürekli",
    not: "ACİL DEĞİL — etkisi saatler içinde başlar, akut tabloyu çevirmez. Kaydıran tedavinin etkisi bitmeden çıkarma sağlamak için köprü olarak düşünülür. Bağırsak hareketi olmayan hastada verilmez.",
    uygun: (k) => k >= 5.5,
  },
  {
    slug: "diyaliz",
    ad: "Hemodiyaliz",
    etki: "cikarir",
    doz: "acil seans",
    baslangic: "dakikalar",
    sure: "kalıcı (seans boyunca)",
    not: "Anürik, diyaliz hastası ya da kaydıran tedaviye yanıtsız hiperkalemide KESİN çözüm. Seans sonrası potasyum yeniden yükselebilir (rebound) — sonrasında ölçüm tekrarlanır.",
    uygun: (k, ekg, anuric) => anuric || k >= 6.5 || (ekg && k >= 6),
  },
];

/** Makullük sınırı — klinik sınır değil. Bunun dışında sayı BASILMAZ. */
const K_ALT = 2.5;
const K_UST = 10;

/**
 * Ağırlık sınıflaması. Eşik DİZİSİ yok: sınır açık koşulla yazılıyor.
 *
 * YAZI RENGİ BANDA GÖRE VERİLİYOR ve bu ölçümle konuldu. Bir dönem her
 * bantta `text-white` vardı; ölçüldüğünde 12 yazının 9'u eşiğin altındaydı
 * çünkü amber bantları AÇIK zemin: HAFİF 1.58, ORTA 1.99, NORMAL 3.34.
 * İlk tarama bunu görmemişti — yalnızca AĞIR bandı çizilmişti ve o
 * neredeyse geçiyordu. Koşullu render edilen bandı görmek için değeri
 * kasten her bandın aralığına götürmek gerekti.
 *
 * `bg-emerald-600` de `bg-emerald-700`e indirildi: beyaz yazı orada 3.50
 * veriyordu, küçük metin eşiği 4.5.
 * Eşik sayısı ile etiket ayrı alanlarda durursa çelişebilir ve çelişki
 * sessizdir (bkz. esik-etiket-denetim.cjs — gerçek bir doz hatasından doğdu).
 */
function agirlik(k: number, ekg: boolean) {
  if (ekg) return { ad: "HAYATI TEHDİT EDEN", renk: "bg-rose-600", yazi: "text-white", not: "EKG değişikliği aciliyeti potasyum değerinden bağımsız olarak belirler." };
  if (k >= 6.5) return { ad: "AĞIR", renk: "bg-rose-600", yazi: "text-white", not: "EKG hemen çekilmeli; değişiklik yoksa bile acil tedavi başlar." };
  if (k >= 6) return { ad: "ORTA", renk: "bg-amber-500", yazi: "text-slate-900", not: "Kaydıran tedavi ve çıkarma yolu birlikte planlanır." };
  if (k >= 5.5) return { ad: "HAFİF", renk: "bg-amber-400", yazi: "text-slate-900", not: "Sebep aranır; ilaç gözden geçirilir, çıkarma yolu kurulur." };
  return { ad: "NORMAL SINIRDA", renk: "bg-emerald-700", yazi: "text-white", not: "Acil müdahale gerekmez. Yükselme HIZI değerden daha önemli olabilir." };
}

const ETKI_SIRA: Etki[] = ["stabilize", "kaydirir", "cikarir"];

/**
 * MODÜL DÜZEYİNDE — sayfa içinde tanımlanırsa React her render'da kontrolü
 * söküp yeniden takar ve odak kaybolur (CI kapısı: ic-bilesen-denetim).
 */
function SayiAlani({
  id, etiket, birim, deger, ayarla, ipucu,
}: {
  id: string; etiket: string; birim: string; deger: string;
  ayarla: (v: string) => void; ipucu?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
        {etiket}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-describedby={birim ? `${id}-birim` : undefined}
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-24 text-xl font-black text-blue-900 focus:border-blue-900 outline-none"
        />
        <span id={`${id}-birim`} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">{birim}</span>
      </div>
    </div>
  );
}

function AcKapa({
  id, etiket, aciklama, acik, degistir,
}: {
  id: string; etiket: string; aciklama: string; acik: boolean; degistir: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-pressed={acik}
      onClick={() => degistir(!acik)}
      className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all ${
        acik ? "bg-blue-900 border-blue-900" : "bg-white border-slate-200 hover:border-blue-900/30"
      }`}
    >
      <span className={`block text-[12px] font-black ${acik ? "text-white" : "text-blue-900"}`}>{etiket}</span>
      <span className={`block text-[10px] mt-0.5 leading-snug ${acik ? "text-blue-200" : "text-slate-600"}`}>
        {aciklama}
      </span>
    </button>
  );
}

function MudahaleKarti({ m }: { m: Mudahale }) {
  const e = ETKI_ETIKET[m.etki];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black tracking-widest ${e.renk}`}>
          {e.ad}
        </span>
        <h3 className="text-[13px] font-black text-blue-900 font-sans mt-0">{m.ad}</h3>
      </div>
      <p className="text-[15px] font-black text-blue-900">{m.doz}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-700">
        <span>
          <strong className="text-slate-600">Başlangıç:</strong> {m.baslangic}
        </span>
        <span>
          <strong className="text-slate-600">Süre:</strong> {m.sure}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-700">{m.not}</p>
    </div>
  );
}

export default function HiperkalemiTedaviSayfasi() {
  const [k, setK] = React.useState("");
  const [ekg, setEkg] = React.useState(false);
  const [anuric, setAnuric] = React.useState(false);

  const kNum = parseLocaleNumber(k);
  const kTamam = sayiGirildiMi(k) && kNum >= K_ALT && kNum <= K_UST;

  const secilen = kTamam ? MUDAHALELER.filter((m) => m.uygun(kNum, ekg, anuric)) : [];
  const a = kTamam ? agirlik(kNum, ekg) : null;
  /**
   * ÖLÇÜLDÜ VE DÜZELTİLDİ — koşul bir dönem `kaydiranVar && !cikaranVar` idi
   * ve HİÇ ateşlemiyordu: bağlayıcı k >= 5.5'te her zaman "çıkarır" grubunda,
   * yani "çıkaran yok" durumu yapısal olarak oluşamıyordu. On kombinasyon
   * denendi, onunda da uyarı çıkmadı — ekranda duran ama hiçbir şeyi
   * değiştirmeyen denetim sınıfı.
   *
   * Uyarının gerçek klinik içeriği zaten "kaydıranın etkisi biter" ve bu,
   * kaydıran bir tedavi listelendiği ANDA doğru. Koşul ona bağlandı.
   */
  const kaydiranVar = secilen.some((m) => m.etki === "kaydirir");

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="hiperkalemi-tedavi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Hiperkalemi Tedavisi
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Kaydıran ile çıkaranı ayırır
            </p>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-rose-600 text-lg" aria-hidden="true">🛑</span>
          <div className="text-[12px] leading-relaxed text-rose-900 space-y-2">
            <p>
              <strong>Kalsiyum potasyumu DÜŞÜRMEZ.</strong> Miyokard membranını
              stabilize eder — EKG düzelir, potasyum aynı kalır. &ldquo;Kalsiyum
              verdik, düzeldi&rdquo; demek tedaviyi yarıda bırakmaktır.
            </p>
            <p>
              <strong>İnsülin ve beta-agonist de düşürmez, KAYDIRIR.</strong>{" "}
              Potasyum vücutta kalır ve 4–6 saatte geri çıkar. Çıkaran bir yol
              (diüretik, bağlayıcı, diyaliz) kurulmazsa hasta birkaç saat sonra
              aynı yerde olur — ama bu kez tedavi edilmiş sayılarak.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <SayiAlani id="hk-k" etiket="Serum potasyum" birim="mmol/L" deger={k} ayarla={setK} ipucu="ör. 6.4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AcKapa
              id="hk-ekg"
              etiket="EKG değişikliği var"
              aciklama="Sivri T, geniş QRS, P kaybı, sinüzoidal ritim"
              acik={ekg}
              degistir={setEkg}
            />
            <AcKapa
              id="hk-anuri"
              etiket="Anürik / diyaliz hastası"
              aciklama="İdrar çıkışı yok ya da son dönem böbrek yetmezliği"
              acik={anuric}
              degistir={setAnuric}
            />
          </div>
        </div>

        {kTamam && a ? (
          <>
            <div className={`${a.renk} ${a.yazi} rounded-[2rem] p-6 shadow-xl`}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] block">
                Potasyum {kNum} mmol/L
              </span>
              <div className="mt-1 text-3xl font-black">{a.ad}</div>
              <p className="mt-2 text-[12px] leading-relaxed">{a.not}</p>
            </div>

            {kaydiranVar && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4" role="status">
                <p className="text-[12px] leading-relaxed text-amber-900">
                  <strong>Aşağıdaki kaydıran tedavilerin etkisi 4–6 saatte
                  biter</strong> ve potasyum geri çıkar. Listedeki tek ÇIKARAN
                  yolun gerçekten işlediğini doğrulayın: furosemid idrar çıkışı
                  varsa, bağlayıcı saatler içinde (acil tabloyu çevirmez),
                  diyaliz kesin. Kaydırmayı tedavi sanmak, hastayı birkaç saat
                  sonra aynı yerde ama &ldquo;tedavi edilmiş&rdquo; sayarak
                  izlemek demektir.
                </p>
              </div>
            )}

            {ETKI_SIRA.map((etki) => {
              const grup = secilen.filter((m) => m.etki === etki);
              if (!grup.length) return null;
              const e = ETKI_ETIKET[etki];
              return (
                <div key={etki} className="space-y-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest font-sans mt-0">
                      {e.ad}
                    </h2>
                    <span className="text-[11px] text-slate-700">{e.aciklama}</span>
                  </div>
                  {grup.map((m) => (
                    <MudahaleKarti key={m.slug} m={m} />
                  ))}
                </div>
              );
            })}

            {!secilen.length && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
                <p className="text-[12px] font-black text-slate-600">
                  Bu değerde acil müdahale listelenmiyor. Sebep araştırması ve
                  ilaç gözden geçirmesi yine de gerekir.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[12px] font-black text-slate-600">
              Serum potasyum değerini girin ({K_ALT}–{K_UST} mmol/L).
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <p className="text-[11px] text-slate-700 leading-relaxed">
            <strong className="text-blue-900">Aciliyeti tek başına sayı belirlemez.</strong>{" "}
            Potasyumun ne kadar HIZLI yükseldiği, EKG bulgusu ve sebebi (rabdomiyoliz,
            tümör lizisi, ilaç, böbrek yetmezliği) planı değiştirir. Yavaş yükselen
            kronik hiperkalemi ile saatler içinde çıkan akut hiperkalemi aynı değerde
            aynı şey değildir. Yalancı hiperkalemi (hemolizli örnek, aşırı trombositoz)
            tedaviye başlamadan önce dışlanır.
          </p>
          <div className="flex justify-center border-b border-t border-slate-100 py-4">
            <ToolShare params={{}} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Dozlar erişkin, yaygın protokollerdir; kendi kurumunuzun protokolüyle
              karşılaştırın. Sodyum polistiren sülfonat bu araçta YOKTUR: akut
              hiperkalemide etkinliği gösterilmemiştir ve sorbitolle birlikte
              bağırsak nekrozu bildirilmiştir — listelemek, acil bir tabloda işe
              yaramayan bir seçeneği masaya koymak olurdu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
