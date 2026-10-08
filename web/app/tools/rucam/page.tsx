"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * RUCAM — Roussel Uclaf Causality Assessment Method, güncellenmiş sürüm
 * (Danan G, Teschke R. Int J Mol Sci 2016;17:14). İlaç/bitki kaynaklı karaciğer
 * hasarında (DILI) nedensellik. Hasar tipi R oranıyla belirlenir; seyir,
 * risk etkeni ve yeniden maruziyet maddeleri tipe göre farklı puanlanır.
 * Aralık −9 … +14.
 */
type Tip = "hs" | "kol";
type Madde = { id: string; baslik: string; aciklama?: string; secenekler: Secenek[]; iliskisiz?: number };

const TIPLER: ReadonlyArray<{ id: Tip; label: string }> = [
  { id: "hs", label: "Hepatoselüler (R ≥ 5)" },
  { id: "kol", label: "Kolestatik (R ≤ 2) ya da mikst (2 < R < 5)" },
];

function maddeler(tip: Tip): Madde[] {
  const hs = tip === "hs";
  return [
    {
      id: "baslangic",
      baslik: "1. İlaç/bitki başlangıcından hasara kadar geçen süre",
      aciklama: hs
        ? "Kesildikten sonra başlayan hasarda süre kesilme gününden sayılır (yavaş metabolize olan ilaçlar hariç ≤ 15 gün)."
        : "Kesildikten sonra başlayan hasarda süre kesilme gününden sayılır (yavaş metabolize olan ilaçlar hariç ≤ 30 gün).",
      secenekler: [
        { label: "5–90 gün (yeniden maruziyette 1–15 gün)", pts: 2 },
        { label: "< 5 ya da > 90 gün (yeniden maruziyette > 15 gün)", pts: 1 },
        { label: hs ? "Kesildikten sonra ≤ 15 gün içinde" : "Kesildikten sonra ≤ 30 gün içinde", pts: 1 },
        { label: hs ? "İlaçtan önce ya da kesildikten > 15 gün sonra" : "İlaçtan önce ya da kesildikten > 30 gün sonra", pts: 0 },
      ],
      iliskisiz: 3,
    },
    hs
      ? {
          id: "seyir-hs",
          baslik: "2. İlaç kesildikten sonra ALT seyri (zirveden ULN'ye olan farkın azalması)",
          secenekler: [
            { label: "8 gün içinde ≥ %50 azalma", pts: 3 },
            { label: "30 gün içinde ≥ %50 azalma", pts: 2 },
            { label: "Bilgi yok ya da ilaca devam", pts: 0 },
            { label: "30. günden sonra ≥ %50 azalma", pts: 0 },
            { label: "30. günden sonra < %50 azalma ya da yeniden yükselme", pts: -2 },
          ],
        }
      : {
          id: "seyir-kol",
          baslik: "2. İlaç kesildikten sonra ALP (ya da total bilirubin) seyri",
          secenekler: [
            { label: "180 gün içinde ≥ %50 azalma", pts: 2 },
            { label: "180 gün içinde < %50 azalma", pts: 1 },
            { label: "Bilgi yok, kalıcı, artıyor ya da ilaca devam", pts: 0 },
          ],
        },
    {
      id: hs ? "risk-alkol-hs" : "risk-alkol-kol",
      baslik: hs ? "3a. Alkol kullanımı (kadın > 2, erkek > 3 standart içki/gün)" : "3a. Alkol kullanımı (kadın > 2, erkek > 3 standart içki/gün) ya da gebelik",
      secenekler: [
        { label: "Yok", pts: 0 },
        { label: "Var", pts: 1 },
      ],
    },
    {
      id: "risk-yas",
      baslik: "3b. Yaş",
      secenekler: [
        { label: "< 55", pts: 0 },
        { label: "≥ 55", pts: 1 },
      ],
    },
    {
      id: "eszamanli",
      baslik: "4. Eş zamanlı ilaç/bitki",
      secenekler: [
        { label: "Yok ya da bilgi yok", pts: 0 },
        { label: "Var, başlangıç zamanı uyumsuz", pts: 0 },
        { label: "Var, başlangıç zamanı uyumlu ya da düşündürücü", pts: -1 },
        { label: "Bilinen hepatotoksin, zaman uyumlu", pts: -2 },
        { label: "Rolüne kanıt var (pozitif yeniden maruziyet ya da doğrulanmış test)", pts: -3 },
      ],
    },
    {
      id: "alternatif",
      baslik: "5. Alternatif nedenlerin dışlanması",
      aciklama:
        "Grup I (7): HAV (anti-HAV IgM) · HBV (HBsAg, anti-HBc IgM, HBV DNA) · HCV (anti-HCV, HCV RNA) · HEV (anti-HEV IgM/IgG, HEV RNA) · hepatobiliyer görüntüleme · alkolizm (AST/ALT ≥ 2) · yakın zamanda akut hipotansiyon. " +
        "Grup II (5): altta yatan hastalık komplikasyonları (sepsis, metastatik malignite, otoimmün hepatit, kronik hepatit B/C, PBK/PSK, genetik karaciğer hastalıkları) · CMV · EBV · HSV · VZV.",
      secenekler: [
        { label: "Grup I ve II'nin tümü makul ölçüde dışlandı", pts: 2 },
        { label: "Grup I'in 7 nedeni dışlandı", pts: 1 },
        { label: "Grup I'in 5 ya da 6 nedeni dışlandı", pts: 0 },
        { label: "Grup I'in 5'ten azı dışlandı", pts: -2 },
        { label: "Alternatif neden yüksek olasılıklı", pts: -3 },
      ],
    },
    {
      id: "bilinen",
      baslik: "6. İlacın bilinen hepatotoksisitesi",
      secenekler: [
        { label: "Ürün bilgisinde (KÜB) yer alıyor", pts: 2 },
        { label: "Yayımlanmış, ürün bilgisinde yok", pts: 1 },
        { label: "Bilinmiyor", pts: 0 },
      ],
    },
    {
      id: hs ? "yeniden-hs" : "yeniden-kol",
      baslik: "7. İstemsiz yeniden maruziyete yanıt",
      secenekler: hs
        ? [
            { label: "Yalnız bu ilaçla ALT iki katına çıktı (maruziyet öncesi ALT < 5 × ULN)", pts: 3 },
            { label: "İlk reaksiyondaki ilaçlarla birlikte verildiğinde ALT iki katına çıktı", pts: 1 },
            { label: "Aynı koşullarda ALT arttı ama ULN altında kaldı", pts: -2 },
            { label: "Diğer durumlar / yeniden maruziyet yok", pts: 0 },
          ]
        : [
            { label: "Yalnız bu ilaçla ALP (ve bilirubin) iki katına çıktı (maruziyet öncesi ALP < 2 × ULN)", pts: 3 },
            { label: "İlk reaksiyondaki ilaçlarla birlikte verildiğinde ALP iki katına çıktı", pts: 1 },
            { label: "Aynı koşullarda ALP arttı ama ULN altında kaldı", pts: -2 },
            { label: "Diğer durumlar / yeniden maruziyet yok", pts: 0 },
          ],
    },
  ];
}

const BANTLAR: Bant[] = [
  { aralik: "≤ 0", etiket: "Dışlandı", alt: "İlaç/bitki ile ilişki dışlanır — başka neden arayın.", renk: "slate" },
  { aralik: "1–2", etiket: "Olası değil", alt: "Nedensellik olası değil.", renk: "emerald" },
  { aralik: "3–5", etiket: "Mümkün", alt: "Nedensellik mümkün.", renk: "amber" },
  { aralik: "6–8", etiket: "Muhtemel", alt: "Nedensellik muhtemel.", renk: "orange" },
  { aralik: "≥ 9", etiket: "Yüksek olasılıklı", alt: "Nedensellik yüksek olasılıklı.", renk: "rose" },
];

export default function RucamPage() {
  const [secilenTip, setTip] = React.useState<Tip | null>(null);
  const [lab, setLab] = React.useState({ alt: "", altUln: "", alp: "", alpUln: "" });
  const labTam = Object.values(lab).every(sayiGirildiMi);
  const [a, au, p, pu] = [lab.alt, lab.altUln, lab.alp, lab.alpUln].map(parseLocaleNumber);
  const r = labTam && a > 0 && au > 0 && p > 0 && pu > 0 ? (a / au) / (p / pu) : null;
  const labHatali = labTam && r === null;
  const tip: Tip | null = r !== null ? (r >= 5 ? "hs" : "kol") : secilenTip;
  const [sel, setSel] = React.useState<Record<string, number | null>>({});
  const liste = tip ? maddeler(tip) : [];
  const yanitlanan = liste.filter((m) => sel[m.id] != null).length;
  const iliskisiz = liste.some((m) => m.iliskisiz !== undefined && sel[m.id] === m.iliskisiz);
  const tamam = tip !== null && yanitlanan === liste.length && !iliskisiz;
  const skor = tamam ? liste.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 0 ? BANTLAR[0] : skor <= 2 ? BANTLAR[1] : skor <= 5 ? BANTLAR[2] : skor <= 8 ? BANTLAR[3] : BANTLAR[4];
  const eksik = tip === null ? "Önce hasar tipini seçin" : iliskisiz ? "Zaman ilişkisi yok — vaka ilişkisiz sayılır, RUCAM hesaplanmaz" : `${liste.length - yanitlanan} madde yanıtlanmadı`;

  return (
    <OlcekKabugu
      slug="rucam"
      ikon="💊"
      baslik="RUCAM"
      altBaslik="İlaç/Bitki Kaynaklı Karaciğer Hasarı · Nedensellik · Güncel 2016"
      paylasim={{ rucam: skor }}
      not={
        <>
          <p>
            R = (ALT / ALT ULN) ÷ (ALP / ALP ULN), hasar fark edildiğindeki ilk değerlerle hesaplanır. RUCAM, ALT &gt; 5 × ULN ve/veya ALP &gt; 2 × ULN eşiğini
            karşılayan vakalarda uygulanır. Her şüpheli ilaç için ayrı hesaplanır.
          </p>
          <p>Danan G, Teschke R. RUCAM in drug and herb induced liver injury: the update. Int J Mol Sci 2016;17:14.</p>
        </>
      }
    >
      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[12px] font-black text-blue-900 leading-snug">R oranı — hasar fark edildiğindeki ilk değerler</p>
          <p className="text-[11px] text-slate-600 leading-snug mt-1">Dördü girilirse hasar tipi R'den belirlenir; girilmezse aşağıdan elle seçin.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {([
              ["alt", "ALT (U/L)"],
              ["altUln", "ALT üst sınırı (U/L)"],
              ["alp", "ALP (U/L)"],
              ["alpUln", "ALP üst sınırı (U/L)"],
            ] as const).map(([k, ad]) => (
              <label key={k} className="text-[11px] font-bold text-slate-700">
                {ad}
                <input
                  inputMode="decimal"
                  value={lab[k]}
                  onChange={(e) => setLab((o) => ({ ...o, [k]: e.target.value }))}
                  className="mt-1 w-full min-h-[44px] px-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-blue-950"
                />
              </label>
            ))}
          </div>
          {r !== null && (
            <p className="mt-3 text-[12px] font-black text-blue-900">
              R = {r.toFixed(2).replace(".", ",")} → {r >= 5 ? "hepatoselüler" : r <= 2 ? "kolestatik" : "mikst"}
            </p>
          )}
          {labHatali && (
            <p role="alert" className="mt-3 text-[12px] font-bold text-rose-700">
              R hesaplanamadı: dört değer de sıfırdan büyük olmalı.
            </p>
          )}
        </div>
        <SecimMaddesi
          id="tip"
          baslik="Hasar tipi (R oranı)"
          secenekler={TIPLER.map((t) => ({ label: t.label, pts: 0 }))}
          secili={tip === null ? null : TIPLER.findIndex((t) => t.id === tip)}
          aciklama={r !== null ? "R oranından belirlendi — değiştirmek için laboratuvar değerlerini düzenleyin." : undefined}
          onSec={(s) => r === null && setTip(s === null ? null : TIPLER[s].id)}
          rozetGizle
        />
        {liste.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id] ?? null} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} bantlar={BANTLAR} aktif={bant} eksikMetni={eksik} />
    </OlcekKabugu>
  );
}
