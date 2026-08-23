"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";
import {
  yorumla,
  araliktaMi,
  SINIRLAR,
  PH_ALT,
  PH_UST,
  PCO2_ALT,
  PCO2_UST,
  HCO3_ALT,
  HCO3_UST,
  AG_UST,
  type Bulgu,
  KOMPANZASYON_CETVELI,
} from "@/app/tools/lib/asit-baz";

/**
 * Asit-baz analizi. Yorumlama mantığı `lib/asit-baz.ts` içinde saf fonksiyon
 * olarak duruyor; burada yalnızca girdi toplanıp sonuç basılıyor.
 */

/**
 * MODÜL DÜZEYİNDE. Sayfa bileşeninin İÇİNDE tanımlanırsa her render'da yeni
 * bir bileşen kimliği oluşur, React <input>u söküp yeniden takar ve kullanıcı
 * HER RAKAMDAN SONRA odağı kaybeder — "170 yazmak için kutuya üç kez tıklamak"
 * diye bildirilen kusur tam olarak budur.
 */
function SayiAlani({
  id,
  etiket,
  deger,
  ayarla,
  ipucu,
  birim,
}: {
  id: string;
  etiket: string;
  deger: string;
  ayarla: (v: string) => void;
  ipucu: string;
  birim: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1"
      >
        {etiket}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={deger}
          onChange={(e) => ayarla(e.target.value)}
          placeholder={ipucu}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-900 outline-none font-bold text-base transition-all pr-12"
        />
        {birim && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-500">
            {birim}
          </span>
        )}
      </div>
    </div>
  );
}

const RENK: Record<string, { yazi: string; zemin: string; kenar: string }> = {
  asidoz: { yazi: "text-rose-800", zemin: "bg-rose-50", kenar: "border-rose-300" },
  alkaloz: { yazi: "text-sky-800", zemin: "bg-sky-50", kenar: "border-sky-300" },
};

function bulguRengi(b: Bulgu) {
  return b.tip.includes("alkaloz") ? RENK.alkaloz : RENK.asidoz;
}

export default function AbgPage() {
  const [ph, setPh] = React.useState("");
  const [pco2, setPco2] = React.useState("");
  const [hco3, setHco3] = React.useState("");
  const [pao2, setPao2] = React.useState("");
  const [fio2, setFio2] = React.useState("0.21");
  const [na, setNa] = React.useState("");
  const [cl, setCl] = React.useState("");
  const [alb, setAlb] = React.useState("");
  const [yas, setYas] = React.useState("");
  const [sure, setSure] = React.useState<"akut" | "kronik">("akut");

  const sayi = (ham: string) => (ham.trim() === "" ? null : parseLocaleNumber(ham));

  const phN = sayi(ph);
  const pco2N = sayi(pco2);
  const hco3N = sayi(hco3);
  const pao2N = sayi(pao2);
  const fio2N = sayi(fio2);
  const naN = sayi(na);
  const clN = sayi(cl);
  const albN = sayi(alb);
  const yasN = sayi(yas);

  const cekirdekVar = phN !== null && pco2N !== null && hco3N !== null;

  /**
   * Makul olmayan girdiyi ADIYLA söyle. parseLocaleNumber çözemediği her şeyi
   * 0 döndürüyor; sessizce 0 ile hesaplamak, bu depoda ölçülmüş en pahalı
   * kusur sınıfı (boş formdan ağır klinik etiket üretmek).
   */
  const hatali: string[] = [];
  if (phN !== null && !araliktaMi(phN, SINIRLAR.ph)) hatali.push("pH");
  if (pco2N !== null && !araliktaMi(pco2N, SINIRLAR.pco2)) hatali.push("PaCO₂");
  if (hco3N !== null && !araliktaMi(hco3N, SINIRLAR.hco3)) hatali.push("HCO₃⁻");
  if (naN !== null && !araliktaMi(naN, SINIRLAR.na)) hatali.push("Na⁺");
  if (clN !== null && !araliktaMi(clN, SINIRLAR.cl)) hatali.push("Cl⁻");
  if (albN !== null && !araliktaMi(albN, SINIRLAR.albumin)) hatali.push("Albümin");
  if (pao2N !== null && !araliktaMi(pao2N, SINIRLAR.pao2)) hatali.push("PaO₂");
  if (fio2N !== null && !araliktaMi(fio2N, SINIRLAR.fio2)) hatali.push("FiO₂");
  if (yasN !== null && !araliktaMi(yasN, SINIRLAR.yas)) hatali.push("Yaş");

  const y =
    cekirdekVar && hatali.length === 0
      ? yorumla({
          ph: phN!,
          pco2: pco2N!,
          hco3: hco3N!,
          na: naN,
          cl: clN,
          albumin: albN,
          sure,
        })
      : null;

  const solunumVar = y?.bulgular.some((b) => b.tip.startsWith("solunum")) ?? false;

  /* ── Oksijenasyon ─────────────────────────────────────────────────── */
  const oksGecerli =
    pao2N !== null &&
    fio2N !== null &&
    pco2N !== null &&
    araliktaMi(pao2N, SINIRLAR.pao2) &&
    araliktaMi(fio2N, SINIRLAR.fio2) &&
    araliktaMi(pco2N, SINIRLAR.pco2);
  const paO2Alveol = oksGecerli ? fio2N! * 713 - pco2N! / 0.8 : null;
  const aaFark = paO2Alveol !== null ? paO2Alveol - pao2N! : null;
  const yasGecerli = yasN !== null && araliktaMi(yasN, SINIRLAR.yas);
  const aaNormal = yasGecerli ? yasN! / 4 + 4 : null;
  const pf = oksGecerli ? Math.round(pao2N! / fio2N!) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="abg" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span aria-hidden="true">🩸</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs" aria-hidden="true">
                ☀️
              </span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
                Asit-Baz Analizi
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">
              Mikst bozukluk ayrımı · kompanzasyon · anyon açığı · delta-delta
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong>Araç kan gazını yorumlar, tanı koymaz.</strong> Bir bozukluğun{" "}
            <em>nedeni</em> (laktat, ketoz, üremi, ishal, kusma, ilaç…) buradaki
            sayılardan çıkmaz. Yorum, girilen değerlerin kendi aralarındaki
            ilişkiye dayanır ve klinik tabloyla birlikte değerlendirilir.
          </p>
        </div>

        {/* ── Girdi ─────────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Arteriyel kan gazı (zorunlu)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SayiAlani id="ab-ph" etiket="pH" deger={ph} ayarla={setPh} ipucu="7.35–7.45" birim="" />
            <SayiAlani id="ab-pco2" etiket="PaCO₂" deger={pco2} ayarla={setPco2} ipucu="35–45" birim="mmHg" />
            <SayiAlani id="ab-hco3" etiket="HCO₃⁻" deger={hco3} ayarla={setHco3} ipucu="22–26" birim="mEq/L" />
          </div>

          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pt-2 border-t border-slate-100">
            Elektrolitler — anyon açığı için
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SayiAlani id="ab-na" etiket="Na⁺" deger={na} ayarla={setNa} ipucu="ör. 138" birim="mEq/L" />
            <SayiAlani id="ab-cl" etiket="Cl⁻" deger={cl} ayarla={setCl} ipucu="ör. 102" birim="mEq/L" />
            <SayiAlani id="ab-alb" etiket="Albümin" deger={alb} ayarla={setAlb} ipucu="ör. 4.0" birim="g/dL" />
          </div>

          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pt-2 border-t border-slate-100">
            Oksijenasyon — isteğe bağlı
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SayiAlani id="ab-pao2" etiket="PaO₂" deger={pao2} ayarla={setPao2} ipucu="ör. 85" birim="mmHg" />
            <SayiAlani id="ab-fio2" etiket="FiO₂" deger={fio2} ayarla={setFio2} ipucu="0.21" birim="0–1" />
            <SayiAlani id="ab-yas" etiket="Hasta yaşı" deger={yas} ayarla={setYas} ipucu="ör. 55" birim="yıl" />
          </div>
        </div>

        {hatali.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4" role="alert">
            <p className="text-[12px] leading-relaxed text-rose-900">
              <strong>Şu değer(ler) beklenen aralığın çok dışında:</strong>{" "}
              {hatali.join(", ")}. Yorum yapılmadı — yazım hatası olabilir.
            </p>
          </div>
        )}

        {/* Akut / kronik: hesapla bulunamaz, klinik bilgi gerekir */}
        {solunumVar && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">
              Solunum bozukluğu akut mu, kronik mi?
            </p>
            <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
              Bu ayrımı sayılar veremez — böbrek yanıtı günler içinde oturur.
              Seçim beklenen HCO₃⁻ aralığını, dolayısıyla mikst bozukluk kararını
              doğrudan değiştirir.
            </p>
            <div className="flex gap-3">
              {(["akut", "kronik"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={sure === t}
                  onClick={() => setSure(t)}
                  className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                    ${sure === t ? "bg-blue-900 border-blue-900 text-white" : "bg-slate-50 border-slate-200 text-blue-900"}`}
                >
                  {t === "akut" ? "Akut" : "Kronik"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── YORUM ─────────────────────────────────────── */}
        {!y ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm font-bold text-slate-600" role="status">
              Yorum için pH, PaCO₂ ve HCO₃⁻ girin. Na⁺ ve Cl⁻ eklerseniz anyon
              açığı ve gizli bozukluk ayrımı da yapılır.
            </p>
          </div>
        ) : (
          <div className="bg-blue-900 rounded-[2rem] p-6 shadow-xl space-y-4">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">
              Yorum
            </span>
            <p className="text-xl font-black text-white leading-snug">{y.ozet}</p>

            <div className="flex flex-wrap gap-2">
              {[
                { e: "pH", v: phN!.toFixed(2), d: y.phDurumu === "asidemi" ? "↓ asidemi" : y.phDurumu === "alkalemi" ? "↑ alkalemi" : "normal", ok: y.phDurumu === "normal" },
                { e: "PaCO₂", v: `${pco2N}`, d: pco2N! > PCO2_UST ? "↑ yüksek" : pco2N! < PCO2_ALT ? "↓ düşük" : "normal", ok: pco2N! >= PCO2_ALT && pco2N! <= PCO2_UST },
                { e: "HCO₃⁻", v: `${hco3N}`, d: hco3N! > HCO3_UST ? "↑ yüksek" : hco3N! < HCO3_ALT ? "↓ düşük" : "normal", ok: hco3N! >= HCO3_ALT && hco3N! <= HCO3_UST },
                ...(y.agEtkin !== null
                  ? [{ e: "Anyon açığı", v: `${y.agEtkin}`, d: y.agYuksek ? "↑ yüksek" : "normal", ok: !y.agYuksek }]
                  : []),
              ].map((c) => (
                <div key={c.e} className="rounded-2xl px-4 py-2 border bg-blue-950/50 border-blue-800">
                  <div className="text-[8px] font-black uppercase tracking-widest text-blue-300">{c.e}</div>
                  <div className="text-base font-black text-white">{c.v}</div>
                  <div className={`text-[9px] font-black ${c.ok ? "text-emerald-300" : "text-amber-300"}`}>{c.d}</div>
                </div>
              ))}
            </div>

            {y.bulgular.length > 0 && (
              <ul className="space-y-2">
                {y.bulgular.map((b) => {
                  const r = bulguRengi(b);
                  return (
                    <li key={b.tip} className={`rounded-2xl border-2 p-4 ${r.zemin} ${r.kenar}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-black ${r.yazi}`}>{b.baslik}</span>
                        {b.sinirda && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            sınırda
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 mt-1">{b.gerekce}</p>
                      {b.sinirda && (
                        <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                          Sapma formülün kendi belirsizliği kadar; ayrı bir bozukluk
                          olmayabilir. Klinik tabloya bakın.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {y.kompanzasyon && (
              <div className={`rounded-2xl p-4 border-2 ${y.kompanzasyon.yeterli ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"}`}>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">
                  Kompanzasyon kontrolü
                </div>
                <p className="text-[11px] font-mono font-bold text-blue-900">{y.kompanzasyon.formul}</p>
                <p className={`text-sm font-black mt-1 ${y.kompanzasyon.yeterli ? "text-emerald-800" : "text-amber-900"}`}>
                  Beklenen {y.kompanzasyon.beklenenAlt}–{y.kompanzasyon.beklenenUst}{" "}
                  {y.kompanzasyon.birim} · ölçülen {y.kompanzasyon.olculen}
                </p>
                <p className={`text-[11px] font-bold mt-1 ${y.kompanzasyon.yeterli ? "text-emerald-800" : "text-amber-900"}`}>
                  {y.kompanzasyon.yeterli ? "Beklenen aralıkta." : y.kompanzasyon.yorum}
                </p>
              </div>
            )}

            {y.notlar.length > 0 && (
              <ul className="space-y-2 pt-1">
                {y.notlar.map((n, i) => (
                  <li key={i} className="text-[11px] leading-relaxed text-blue-100 flex gap-2">
                    <span aria-hidden="true">·</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Anyon açığı ve delta ──────────────────────── */}
        {y && y.ag !== null && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Anyon açığı &amp; delta-delta
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 text-center bg-slate-50 border border-slate-200">
                <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-600">
                  Anyon açığı
                </div>
                <div className="text-3xl font-black text-blue-900">{y.ag}</div>
                <div className="text-[9px] font-bold mt-1 text-slate-600">Na⁺ − Cl⁻ − HCO₃⁻</div>
              </div>
              <div className={`rounded-2xl p-4 text-center border ${y.agYuksek ? "bg-rose-50 border-rose-300" : "bg-emerald-50 border-emerald-300"}`}>
                <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${y.agYuksek ? "text-rose-800" : "text-emerald-800"}`}>
                  {y.agDuzeltilmis !== null ? "Albümin düzeltmeli" : "Değerlendirilen"}
                </div>
                <div className={`text-3xl font-black ${y.agYuksek ? "text-rose-800" : "text-emerald-800"}`}>
                  {y.agEtkin}
                </div>
                <div className={`text-[9px] font-bold mt-1 ${y.agYuksek ? "text-rose-800" : "text-emerald-800"}`}>
                  {y.agYuksek ? `↑ yüksek (N: ≤${AG_UST})` : `normal (N: ≤${AG_UST})`}
                </div>
              </div>
            </div>

            {y.agYuksek && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                {y.deltaOran !== null ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { e: "ΔAG", v: y.deltaAG },
                        { e: "ΔHCO₃⁻", v: y.deltaHCO3 },
                        { e: "Δ/Δ", v: y.deltaOran },
                      ].map((k) => (
                        <div key={k.e} className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-200">
                          <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{k.e}</div>
                          <div className="text-xl font-black text-blue-900">{k.v}</div>
                        </div>
                      ))}
                    </div>
                    <p className="rounded-xl px-4 py-3 text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-900">
                      {y.deltaYorum}
                    </p>
                  </>
                ) : (
                  <p className="rounded-xl px-4 py-3 text-[11px] font-bold bg-amber-50 border border-amber-300 text-amber-900">
                    {y.deltaYorum}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Oksijenasyon ──────────────────────────────── */}
        {oksGecerli && aaFark !== null && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Oksijenasyon</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`rounded-2xl p-4 text-center border ${aaNormal !== null && aaFark > aaNormal ? "bg-rose-50 border-rose-300" : "bg-slate-50 border-slate-200"}`}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-600">
                  A-a gradyanı
                </div>
                <div className="text-3xl font-black text-blue-900">{aaFark.toFixed(0)}</div>
                <div className="text-[9px] font-bold mt-1 text-slate-600">
                  {aaNormal !== null
                    ? aaFark > aaNormal
                      ? `↑ yaşa göre beklenenin (≈${aaNormal.toFixed(0)}) üstünde`
                      : `yaşa göre beklenen aralıkta (≈${aaNormal.toFixed(0)})`
                    : "yaş girilmedi — beklenen değer hesaplanamıyor"}
                </div>
              </div>
              {pf !== null && (
                <div className="rounded-2xl p-4 text-center bg-slate-50 border border-slate-200">
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-600">
                    P/F oranı
                  </div>
                  <div className="text-3xl font-black text-blue-900">{pf}</div>
                  <div className="text-[9px] font-bold mt-1 text-slate-600">
                    {pf >= 300 ? "300 üstü" : pf >= 200 ? "200–300 aralığında" : pf >= 100 ? "100–200 aralığında" : "100 altında"}
                  </div>
                </div>
              )}
            </div>
            {/* ARDS bir kan gazı bulgusu DEĞİL: Berlin ölçütleri zamanlama,
                görüntüleme ve PEEP koşulu da ister. Araç evre adı basmıyor. */}
            <p className="text-[11px] text-slate-700 leading-relaxed">
              P/F oranı tek başına ARDS tanısı koydurmaz; Berlin ölçütleri bir
              haftalık zaman penceresi, iki taraflı görüntüleme bulgusu, kalp
              yetmezliğiyle açıklanamama ve <strong>en az 5 cmH₂O PEEP</strong>{" "}
              koşulunu da arar. A-a gradyanı deniz seviyesi içindir.
            </p>
            <p className="text-[10px] font-bold text-slate-600">
              PAO₂ = FiO₂ × 713 − PaCO₂/0.8 = {paO2Alveol!.toFixed(1)} mmHg
            </p>
          </div>
        )}

        {/* ── Referans ──────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
            Kullanılan kompanzasyon formülleri
          </p>
          <div className="space-y-2">
            {/* Cetvel motorun sabitlerinden TÜRER — elle yazılmış bir kopya
                değil. Bir dönem burada aynı sayılar ikinci kez yazılıydı ve
                motor değişse cetvel sessizce bayatlardı. */}
            {KOMPANZASYON_CETVELI.map((r) => (
              <div key={r.durum} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 py-1.5 border-b border-slate-100">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest w-full sm:w-48 sm:shrink-0">
                  {r.durum}
                </span>
                <span className="text-[11px] font-bold text-blue-900 font-mono">{r.formul}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed mt-4">
            Referans aralıkları: pH {PH_ALT}–{PH_UST} · PaCO₂ {PCO2_ALT}–{PCO2_UST} mmHg ·
            HCO₃⁻ {HCO3_ALT}–{HCO3_UST} mEq/L · anyon açığı ≤{AG_UST}. Kendi
            laboratuvarınızın aralıkları farklıysa yorum da değişir.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ ph: phN ?? 0, pco2: pco2N ?? 0, hco3: hco3N ?? 0, na: naN ?? 0, cl: clN ?? 0 }} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Yorum yalnızca girilen sayılara dayanır. Anyon açığı Na⁺ ve Cl⁻
              girilmeden hesaplanamaz; girilmediğinde gizli metabolik asidoz
              gözden kaçabilir. Akut/kronik seçimi kompanzasyon beklentisini
              değiştirdiği için mikst bozukluk kararını doğrudan etkiler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
