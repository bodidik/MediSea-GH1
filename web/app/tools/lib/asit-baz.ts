/**
 * Asit-baz yorumlama motoru.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN AYRI MODÜL: Bu mantık sayfanın içinde yazılıydı ve yalnızca tarayıcıda
 * sınanabiliyordu; o yüzden aşağıdaki üç kusur uzun süre görülmedi. Saf
 * fonksiyon olarak ayrılınca girdi/çıktı tablosu doğrudan sürülebiliyor.
 *
 * MOTORUN ASIL İŞİ TEK BİR ETİKET BASMAK DEĞİL, BULUNAN BOZUKLUKLARIN
 * HEPSİNİ LİSTELEMEK. Mikst bozuklukta "primer" diye tek bir ad yazmak,
 * tablonun yarısını gizler:
 *
 *   1. pH 7.38 · PaCO₂ 60 · HCO₃⁻ 35  ->  eski kod "NORMAL" diyordu.
 *      Gerçekte solunum asidozu + metabolik alkaloz bir arada; pH ikisinin
 *      birbirini dengelemesiyle normale geliyor.
 *   2. pH 7.40 · Na 140 · Cl 100 · HCO₃⁻ 24 (AG 16)  ->  "NORMAL" diyordu.
 *      Yüksek anyon açığı, pH ve HCO₃⁻ normalken bile metabolik asidozun
 *      KANITIDIR; onu dengeleyen ikinci bir bozukluk vardır.
 *   3. AG yüksekken HCO₃⁻ 24'ün ÜSTÜNDEyse delta oranı eksi çıkıyor ve eski
 *      kod bunu "Δ/Δ < 1" sayıp "eşzamanlı non-AG asidoz" diyordu — tam
 *      tersi doğru (eşlik eden metabolik alkaloz).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Sabitler ve formüller DEĞİŞTİRİLMEDİ; aracın önceki sürümünde ne varsa o.
 * Değişen şey yalnızca bu değerlerden çıkarılan sonuç.
 */

export const PH_ALT = 7.35;
export const PH_UST = 7.45;
export const PH_REF = 7.4;
export const PCO2_ALT = 35;
export const PCO2_UST = 45;
export const HCO3_ALT = 22;
export const HCO3_UST = 26;
export const AG_UST = 12;

/** Makullük sınırları: bunların dışındaki bir değer ölçüm değil yazım hatasıdır. */
export const SINIRLAR = {
  ph: [6.5, 8.0],
  pco2: [5, 150],
  hco3: [1, 60],
  na: [90, 200],
  cl: [50, 150],
  albumin: [0.5, 7],
  laktat: [0.1, 30],
  pao2: [10, 700],
  fio2: [0.21, 1],
  yas: [0, 120],
} as const;

/**
 * STANDART BAZ FAZLASI (SBE) — Siggaard-Andersen / Van Slyke.
 *
 *   SBE = 0.9287 × (HCO₃⁻ − 24.4 + 14.83 × (pH − 7.4))
 *
 * NEDEN: her kan gazı cihazı BE basıyor ve araçta yoktu. Ölçtüğü şey
 * HCO₃⁻'ten FARKLI — HCO₃⁻ solunum kompanzasyonundan etkilenir (kronik
 * solunum asidozunda böbrek onu yükseltir), SBE ise metabolik bileşeni
 * pH'ı da hesaba katarak ayırır. İkisi aynı şeyi ölçmez.
 *
 * BULGU ÜRETMEZ. İkinci bir okuma olarak gösterilir ve HCO₃⁻ tabanlı
 * sonuçla ayrıştığında bunu SÖYLER. Bu depoda "aynı karar iki kaynaktan"
 * defalarca gerçek kusur ürettiği için bulgu listesinin tek kaynağı
 * korunuyor: pH · PaCO₂ · HCO₃⁻ · AG.
 */
export const SBE_NORMAL_BANT = 2;
export const SBE_FORMUL = "SBE = 0.9287 × (HCO₃⁻ − 24.4 + 14.83 × (pH − 7.4))";

export function standartBazFazlasi(ph: number, hco3: number) {
  return Math.round(0.9287 * (hco3 - 24.4 + 14.83 * (ph - 7.4)) * 10) / 10;
}

/**
 * MUTLAK DELTA GAP eşiği: ΔAG − ΔHCO₃⁻.
 *
 * Delta ORANI zaten hesaplanıyor. İkisi aynı soruyu farklı ölçeklerde
 * soruyor ve BÜYÜK deltalarda AYRIŞIYORLAR — örnek: ΔAG 20, ΔHCO₃⁻ 12
 * için oran 1.67 ("saf") ama Δgap +8 ("eşlik eden alkaloz"). Bu yüzden
 * ikisi de gösteriliyor, ayrıştıklarında söyleniyor ve BULGU LİSTESİNİ
 * yalnızca ORAN kuruyor.
 */
export const DELTA_GAP_BANT = 6;

export type BozuklukTip =
  | "metabolik-asidoz-ag"
  | "metabolik-asidoz-nonag"
  | "metabolik-asidoz"
  | "metabolik-alkaloz"
  | "solunum-asidozu"
  | "solunum-alkalozu";

export interface Bulgu {
  tip: BozuklukTip;
  baslik: string;
  /** Bu bulguya hangi sayıdan varıldı — kullanıcı hesabı doğrulayabilsin diye. */
  gerekce: string;
  birincil: boolean;
  /**
   * Kompanzasyon beklenen aralığın KIYISINDA kaldığında true. Winter gibi
   * formüllerin kendi belirsizliği var; 1-2 birimlik sapmayı kesin bir ikinci
   * tanı gibi sunmak fazla okuma olur. Bulgu yine listeleniyor ama "sınırda"
   * olduğu söyleniyor.
   */
  sinirda?: boolean;
}

export interface Kompanzasyon {
  formul: string;
  beklenenAlt: number;
  beklenenUst: number;
  olculen: number;
  birim: string;
  yeterli: boolean;
  yorum: string;
}

export interface Girdi {
  ph: number;
  pco2: number;
  hco3: number;
  na?: number | null;
  cl?: number | null;
  albumin?: number | null;
  /** Laktat — yüksek anyon açığının ne kadarını açıkladığını ayrıştırır. */
  laktat?: number | null;
  /** Solunum bozukluğu akut mu kronik mi — klinik bilgi, hesapla bulunamaz. */
  sure?: "akut" | "kronik";
}

export interface Yorum {
  gecerli: boolean;
  phDurumu: "asidemi" | "alkalemi" | "normal";
  bulgular: Bulgu[];
  mikst: boolean;
  kompanzasyon: Kompanzasyon | null;
  ag: number | null;
  agDuzeltilmis: number | null;
  agEtkin: number | null;
  agYuksek: boolean;
  deltaAG: number | null;
  deltaHCO3: number | null;
  deltaOran: number | null;
  deltaYorum: string | null;
  /** ΔAG − ΔHCO₃⁻. Orandan bağımsız ikinci okuma; bulgu üretmez. */
  deltaGap: number | null;
  deltaGapYorum: string | null;
  /** Oran ile mutlak Δgap farklı sonuç veriyorsa açıklaması. */
  deltaGapCelisi: string | null;
  /** Standart baz fazlası — metabolik bileşenin solunumdan bağımsız ölçüsü. */
  sbe: number | null;
  sbeYonu: "asidoz" | "alkaloz" | "normal";
  /** SBE, HCO₃⁻ tabanlı bulgularla ayrışıyorsa açıklaması. */
  sbeCelisi: string | null;
  /** Laktat girildiyse: değeri, laktat dışı AG ve yorumu. */
  laktat: number | null;
  laktatKalanAG: number | null;
  laktatYorum: string | null;
  /** Henderson-Hasselbalch ile hesaplanan HCO₃⁻ ve ölçülenden farkı. */
  hhHesaplanan: number | null;
  hhTutarsiz: boolean;
  ozet: string;
  /** Motorun cevaplayamadığı, kullanıcıya sorulması gereken şeyler. */
  notlar: string[];
}

const yuvarla = (n: number, b = 1) => Math.round(n * 10 ** b) / 10 ** b;

export function araliktaMi(deger: number, sinir: readonly [number, number]) {
  return deger >= sinir[0] && deger <= sinir[1];
}

/** Girdinin sayı OLARAK makul olup olmadığı. Ham dize boşsa çağrılmaz. */
export function makulMu(ph: number, pco2: number, hco3: number) {
  return (
    araliktaMi(ph, SINIRLAR.ph) &&
    araliktaMi(pco2, SINIRLAR.pco2) &&
    araliktaMi(hco3, SINIRLAR.hco3)
  );
}

/**
 * KOMPANZASYON SABİTLERİ — TEK KAYNAK.
 *
 * Bu sayılar bir dönem ÜÇ yerde ayrı ayrı yazılıydı: hesabın içinde
 * (`0.7 * hco3 + 21`), hemen ALTINDAKİ formül dizesinde
 * ("PaCO₂ = 0.7 × HCO₃⁻ + 21 ± 5") ve `abg` sayfasındaki referans
 * cetvelinde. Üçü de elle güncellenmek zorundaydı.
 *
 * Ölçüldüğünde üçü de uyuşuyordu — yani bu bir kusur DÜZELTMESİ değil,
 * ayrışma İMKÂNININ kaldırılması. Bu depoda "aynı değer iki yerde ayrı
 * tutuluyorsa er geç ayrışır" kalıbı defalarca gerçek kusur üretti:
 * premium modül ilanı, eşik–etiket çifti, payda–tavan, spot-urine'de
 * rengin karardan bağımsız hesaplanması. Çare her seferinde aynıydı:
 * tek kaynağa bağla.
 */
export const KOMPANZASYON_SABIT = {
  metabolikAsidoz:  { egim: 1.5, sabit: 8,  bant: 2, ek: "  (Winter)" },
  metabolikAlkaloz: { egim: 0.7, sabit: 21, bant: 5, ek: "" },
  solunumAsidozu:   { akut: { carpan: 1, bant: 2 }, kronik: { carpan: 3.5, bant: 3 } },
  solunumAlkalozu:  { akut: { carpan: 2, bant: 2 }, kronik: { carpan: 5,   bant: 2 } },
} as const;

const metabolikFormul = (s: { egim: number; sabit: number; bant: number; ek: string }) =>
  `PaCO₂ = ${s.egim} × HCO₃⁻ + ${s.sabit} ± ${s.bant}${s.ek}`;

/** `abg` sayfasındaki referans cetveli — motorun kullandığı sayılardan türer. */
export const KOMPANZASYON_CETVELI: ReadonlyArray<{ durum: string; formul: string }> = [
  { durum: "Metabolik asidoz",  formul: metabolikFormul(KOMPANZASYON_SABIT.metabolikAsidoz) },
  { durum: "Metabolik alkaloz", formul: metabolikFormul(KOMPANZASYON_SABIT.metabolikAlkaloz) },
  { durum: "Solunum asidozu (akut)",    formul: `ΔHCO₃⁻ = ΔPaCO₂/10 × ${KOMPANZASYON_SABIT.solunumAsidozu.akut.carpan}` },
  { durum: "Solunum asidozu (kronik)",  formul: `ΔHCO₃⁻ = ΔPaCO₂/10 × ${KOMPANZASYON_SABIT.solunumAsidozu.kronik.carpan}` },
  { durum: "Solunum alkalozu (akut)",   formul: `ΔHCO₃⁻ = ΔPaCO₂/10 × ${KOMPANZASYON_SABIT.solunumAlkalozu.akut.carpan}` },
  { durum: "Solunum alkalozu (kronik)", formul: `ΔHCO₃⁻ = ΔPaCO₂/10 × ${KOMPANZASYON_SABIT.solunumAlkalozu.kronik.carpan}` },
];

function kompanzasyonHesapla(
  tip: BozuklukTip,
  sure: "akut" | "kronik",
  pco2: number,
  hco3: number,
): Kompanzasyon | null {
  if (tip === "metabolik-alkaloz") {
    const s = KOMPANZASYON_SABIT.metabolikAlkaloz;
    const b = s.egim * hco3 + s.sabit;
    const alt = yuvarla(b - s.bant);
    const ust = yuvarla(b + s.bant);
    return {
      formul: metabolikFormul(s),
      beklenenAlt: alt,
      beklenenUst: ust,
      olculen: pco2,
      birim: "mmHg",
      yeterli: pco2 >= alt && pco2 <= ust,
      yorum:
        pco2 > ust
          ? "Beklenenden yüksek PaCO₂ — eşlik eden solunum asidozu"
          : "Beklenenden düşük PaCO₂ — eşlik eden solunum alkalozu",
    };
  }
  if (tip.startsWith("metabolik-asidoz")) {
    const s = KOMPANZASYON_SABIT.metabolikAsidoz;
    const b = s.egim * hco3 + s.sabit;
    const alt = yuvarla(b - s.bant);
    const ust = yuvarla(b + s.bant);
    return {
      formul: metabolikFormul(s),
      beklenenAlt: alt,
      beklenenUst: ust,
      olculen: pco2,
      birim: "mmHg",
      yeterli: pco2 >= alt && pco2 <= ust,
      yorum:
        pco2 > ust
          ? "Beklenenden yüksek PaCO₂ — eşlik eden solunum asidozu"
          : "Beklenenden düşük PaCO₂ — eşlik eden solunum alkalozu",
    };
  }
  if (tip === "solunum-asidozu") {
    const s = KOMPANZASYON_SABIT.solunumAsidozu[sure];
    const b = 24 + ((pco2 - 40) / 10) * s.carpan;
    const alt = yuvarla(b - s.bant);
    const ust = yuvarla(b + s.bant);
    return {
      formul: `HCO₃⁻ = 24 + (ΔPaCO₂/10) × ${s.carpan}  (${sure})`,
      beklenenAlt: alt,
      beklenenUst: ust,
      olculen: hco3,
      birim: "mEq/L",
      yeterli: hco3 >= alt && hco3 <= ust,
      yorum:
        hco3 > ust
          ? "Beklenenden yüksek HCO₃⁻ — eşlik eden metabolik alkaloz"
          : "Beklenenden düşük HCO₃⁻ — eşlik eden metabolik asidoz",
    };
  }
  if (tip === "solunum-alkalozu") {
    const s = KOMPANZASYON_SABIT.solunumAlkalozu[sure];
    const b = 24 - ((40 - pco2) / 10) * s.carpan;
    const alt = yuvarla(b - s.bant);
    const ust = yuvarla(b + s.bant);
    return {
      formul: `HCO₃⁻ = 24 − (ΔPaCO₂/10) × ${s.carpan}  (${sure})`,
      beklenenAlt: alt,
      beklenenUst: ust,
      olculen: hco3,
      birim: "mEq/L",
      yeterli: hco3 >= alt && hco3 <= ust,
      yorum:
        hco3 > ust
          ? "Beklenenden yüksek HCO₃⁻ — eşlik eden metabolik alkaloz"
          : "Beklenenden düşük HCO₃⁻ — eşlik eden metabolik asidoz",
    };
  }
  return null;
}

const AD: Record<BozuklukTip, string> = {
  "metabolik-asidoz-ag": "Yüksek anyon açıklı metabolik asidoz",
  "metabolik-asidoz-nonag": "Normal anyon açıklı (hiperkloremik) metabolik asidoz",
  "metabolik-asidoz": "Metabolik asidoz",
  "metabolik-alkaloz": "Metabolik alkaloz",
  "solunum-asidozu": "Solunum asidozu",
  "solunum-alkalozu": "Solunum alkalozu",
};

export function yorumla(g: Girdi): Yorum {
  const { ph, pco2, hco3 } = g;
  const sure = g.sure ?? "akut";

  const bos: Yorum = {
    gecerli: false,
    phDurumu: "normal",
    bulgular: [],
    mikst: false,
    kompanzasyon: null,
    ag: null,
    agDuzeltilmis: null,
    agEtkin: null,
    agYuksek: false,
    deltaAG: null,
    deltaHCO3: null,
    deltaOran: null,
    deltaYorum: null,
    deltaGap: null,
    deltaGapYorum: null,
    deltaGapCelisi: null,
    sbe: null,
    sbeYonu: "normal",
    sbeCelisi: null,
    laktat: null,
    laktatKalanAG: null,
    laktatYorum: null,
    hhHesaplanan: null,
    hhTutarsiz: false,
    ozet: "",
    notlar: [],
  };

  if (!makulMu(ph, pco2, hco3)) return bos;

  const notlar: string[] = [];

  /* ── Anyon açığı ──────────────────────────────────────────────────── */
  const na = g.na ?? null;
  const cl = g.cl ?? null;
  const alb = g.albumin ?? null;

  const agGecerli =
    na !== null && cl !== null && araliktaMi(na, SINIRLAR.na) && araliktaMi(cl, SINIRLAR.cl);
  const ag = agGecerli ? yuvarla(na! - cl! - hco3) : null;

  const albGecerli = alb !== null && araliktaMi(alb, SINIRLAR.albumin);
  const agDuzeltilmis = ag !== null && albGecerli ? yuvarla(ag + 2.5 * (4 - alb!)) : null;
  const agEtkin = agDuzeltilmis ?? ag;
  const agYuksek = agEtkin !== null && agEtkin > AG_UST;

  if (ag !== null && !albGecerli && ag <= AG_UST) {
    notlar.push(
      "Albümin girilmedi. Düşük albüminde anyon açığı olduğundan küçük ölçülür; " +
        "hipoalbüminemik bir hastada normal görünen AG aslında yüksek olabilir.",
    );
  }
  if (ag === null) {
    notlar.push(
      "Na⁺ ve Cl⁻ girilmeden anyon açığı hesaplanamaz; metabolik asidozun tipi " +
        "(yüksek AG / normal AG) ve gizli asidoz ayrımı yapılamaz.",
    );
  }

  /* ── Laktat ───────────────────────────────────────────────────────
   * Laktat monovalan bir anyon: mmol/L = mEq/L, yani anyon açığına
   * BİRE BİR katılır. Buradaki iş bir neden TAHMİN etmek değil, ölçülen
   * bir anyonun açığın ne kadarını KAPLADIĞINI ayrıştırmak.            */
  const lakHam = g.laktat ?? null;
  const laktat =
    lakHam !== null && araliktaMi(lakHam, SINIRLAR.laktat) ? yuvarla(lakHam, 2) : null;
  let laktatKalanAG: number | null = null;
  let laktatYorum: string | null = null;

  /* ── Standart baz fazlası ─────────────────────────────────────────── */
  const sbe = standartBazFazlasi(ph, hco3);
  const sbeYonu: Yorum["sbeYonu"] =
    sbe < -SBE_NORMAL_BANT ? "asidoz" : sbe > SBE_NORMAL_BANT ? "alkaloz" : "normal";
  let sbeCelisi: string | null = null;

  /* ── Henderson-Hasselbalch tutarlılığı ────────────────────────────── */
  const hhHesaplanan = yuvarla(0.03 * pco2 * Math.pow(10, ph - 6.1));
  const hhTutarsiz = Math.abs(hhHesaplanan - hco3) >= 2;

  /* ── pH durumu ────────────────────────────────────────────────────── */
  const asidemi = ph < PH_ALT;
  const alkalemi = ph > PH_UST;
  const phDurumu: Yorum["phDurumu"] = asidemi ? "asidemi" : alkalemi ? "alkalemi" : "normal";

  const metAsidoz = hco3 < HCO3_ALT;
  const metAlkaloz = hco3 > HCO3_UST;
  const solAsidoz = pco2 > PCO2_UST;
  const solAlkaloz = pco2 < PCO2_ALT;

  const bulgular: Bulgu[] = [];
  const ekle = (tip: BozuklukTip, gerekce: string, birincil: boolean, sinirda = false) => {
    if (bulgular.some((b) => b.tip === tip)) return;
    bulgular.push({ tip, baslik: AD[tip], gerekce, birincil, sinirda });
  };

  /** Ölçülen değerin beklenen aralığın dışına ne kadar taştığı. */
  const sapma = (k: Kompanzasyon) =>
    k.olculen > k.beklenenUst ? k.olculen - k.beklenenUst : k.beklenenAlt - k.olculen;
  const SINIRDA_ESIK = 2;

  /** Metabolik asidozun tipi AG biliniyorsa ayrılır, bilinmiyorsa genel kalır. */
  const metAsidozTipi = (): BozuklukTip =>
    agEtkin === null ? "metabolik-asidoz" : agYuksek ? "metabolik-asidoz-ag" : "metabolik-asidoz-nonag";

  let kompanzasyon: Kompanzasyon | null = null;

  if (asidemi) {
    if (metAsidoz && solAsidoz) {
      ekle(metAsidozTipi(), `HCO₃⁻ ${hco3} (<${HCO3_ALT})`, true);
      ekle("solunum-asidozu", `PaCO₂ ${pco2} (>${PCO2_UST})`, true);
      notlar.push(
        "İki bozukluk da asidemi yönünde olduğu için kompanzasyon formülü uygulanmaz: " +
          "burada yüksek PaCO₂ bir yanıt değil, ikinci bir bozukluktur.",
      );
    } else if (metAsidoz) {
      ekle(metAsidozTipi(), `HCO₃⁻ ${hco3} (<${HCO3_ALT})`, true);
      kompanzasyon = kompanzasyonHesapla("metabolik-asidoz", sure, pco2, hco3);
      if (kompanzasyon && !kompanzasyon.yeterli) {
        ekle(
          pco2 > kompanzasyon.beklenenUst ? "solunum-asidozu" : "solunum-alkalozu",
          `PaCO₂ ${pco2}, beklenen ${kompanzasyon.beklenenAlt}–${kompanzasyon.beklenenUst}`,
          false,
          sapma(kompanzasyon) <= SINIRDA_ESIK,
        );
      }
    } else if (solAsidoz) {
      ekle("solunum-asidozu", `PaCO₂ ${pco2} (>${PCO2_UST})`, true);
      kompanzasyon = kompanzasyonHesapla("solunum-asidozu", sure, pco2, hco3);
      if (kompanzasyon && !kompanzasyon.yeterli) {
        ekle(
          hco3 > kompanzasyon.beklenenUst ? "metabolik-alkaloz" : metAsidozTipi(),
          `HCO₃⁻ ${hco3}, beklenen ${kompanzasyon.beklenenAlt}–${kompanzasyon.beklenenUst}`,
          false,
          sapma(kompanzasyon) <= SINIRDA_ESIK,
        );
      }
    } else {
      notlar.push(
        "pH düşük olmasına rağmen PaCO₂ ve HCO₃⁻ normal aralıkta — değerler kendi " +
          "aralarında tutarsız. Örneği ve ölçümü kontrol edin.",
      );
    }
  } else if (alkalemi) {
    if (metAlkaloz && solAlkaloz) {
      ekle("metabolik-alkaloz", `HCO₃⁻ ${hco3} (>${HCO3_UST})`, true);
      ekle("solunum-alkalozu", `PaCO₂ ${pco2} (<${PCO2_ALT})`, true);
      notlar.push(
        "İki bozukluk da alkalemi yönünde olduğu için kompanzasyon formülü uygulanmaz: " +
          "burada düşük PaCO₂ bir yanıt değil, ikinci bir bozukluktur.",
      );
    } else if (metAlkaloz) {
      ekle("metabolik-alkaloz", `HCO₃⁻ ${hco3} (>${HCO3_UST})`, true);
      kompanzasyon = kompanzasyonHesapla("metabolik-alkaloz", sure, pco2, hco3);
      if (kompanzasyon && !kompanzasyon.yeterli) {
        ekle(
          pco2 > kompanzasyon.beklenenUst ? "solunum-asidozu" : "solunum-alkalozu",
          `PaCO₂ ${pco2}, beklenen ${kompanzasyon.beklenenAlt}–${kompanzasyon.beklenenUst}`,
          false,
          sapma(kompanzasyon) <= SINIRDA_ESIK,
        );
      }
    } else if (solAlkaloz) {
      ekle("solunum-alkalozu", `PaCO₂ ${pco2} (<${PCO2_ALT})`, true);
      kompanzasyon = kompanzasyonHesapla("solunum-alkalozu", sure, pco2, hco3);
      if (kompanzasyon && !kompanzasyon.yeterli) {
        ekle(
          hco3 > kompanzasyon.beklenenUst ? "metabolik-alkaloz" : metAsidozTipi(),
          `HCO₃⁻ ${hco3}, beklenen ${kompanzasyon.beklenenAlt}–${kompanzasyon.beklenenUst}`,
          false,
          sapma(kompanzasyon) <= SINIRDA_ESIK,
        );
      }
    } else {
      notlar.push(
        "pH yüksek olmasına rağmen PaCO₂ ve HCO₃⁻ normal aralıkta — değerler kendi " +
          "aralarında tutarsız. Örneği ve ölçümü kontrol edin.",
      );
    }
  } else {
    /* ── pH NORMAL ──────────────────────────────────────────────────────
     * Buradaki iki durum eski kodda "NORMAL" diye raporlanıyordu; ikisi de
     * mikst bozukluk. pH'ın normal olması bozukluk olmadığını göstermez,
     * yalnızca etkilerin birbirini götürdüğünü gösterir.                */
    /**
     * Bu iki dalda cevabı AKUT/KRONİK SEÇİMİ belirliyor: aynı sayılar "akut"
     * seçilirse mikst bozukluk, "kronik" seçilirse tam kompanze basit bozukluk
     * okunuyor. Seçimi motorun kendisi yapamaz, o yüzden kullanıcıya söylüyor.
     */
    if (solAsidoz && metAlkaloz) {
      const k = kompanzasyonHesapla("solunum-asidozu", sure, pco2, hco3);
      ekle("solunum-asidozu", `PaCO₂ ${pco2} (>${PCO2_UST})`, true);
      notlar.push(
        `pH normal, PaCO₂ yüksek ve HCO₃⁻ yüksek. Bu tabloda sonucu "${sure}" ` +
          "seçimi belirliyor: kronik seçilirse böbrek yanıtı bunu açıklar, akut " +
          "seçilirse yüksek HCO₃⁻ ayrı bir metabolik alkalozdur. Normal pH çoğu " +
          "zaman sürecin kronikleştiğini gösterir.",
      );
      if (k && k.yeterli) {
        kompanzasyon = k;
        notlar.push(
          "Yüksek HCO₃⁻, kronik solunum asidozunun beklenen böbrek yanıtıyla uyumlu. " +
            "Bu tabloda ayrı bir metabolik alkalozdan söz edilemez; ayrımı klinik yapar.",
        );
      } else {
        ekle(
          "metabolik-alkaloz",
          `HCO₃⁻ ${hco3}, beklenen ${k?.beklenenAlt}–${k?.beklenenUst}`,
          true,
          k ? sapma(k) <= SINIRDA_ESIK : false,
        );
        if (k) kompanzasyon = k;
      }
    } else if (solAlkaloz && metAsidoz) {
      const k = kompanzasyonHesapla("solunum-alkalozu", sure, pco2, hco3);
      ekle("solunum-alkalozu", `PaCO₂ ${pco2} (<${PCO2_ALT})`, true);
      notlar.push(
        `pH normal, PaCO₂ düşük ve HCO₃⁻ düşük. Bu tabloda sonucu "${sure}" ` +
          "seçimi belirliyor: kronik seçilirse böbrek yanıtı bunu açıklar, akut " +
          "seçilirse düşük HCO₃⁻ ayrı bir metabolik asidozdur. Normal pH çoğu " +
          "zaman sürecin kronikleştiğini gösterir.",
      );
      if (k && k.yeterli) {
        kompanzasyon = k;
        notlar.push(
          "Düşük HCO₃⁻, kronik solunum alkalozunun beklenen böbrek yanıtıyla uyumlu. " +
            "Bu tabloda ayrı bir metabolik asidozdan söz edilemez; ayrımı klinik yapar.",
        );
      } else {
        ekle(
          metAsidozTipi(),
          `HCO₃⁻ ${hco3}, beklenen ${k?.beklenenAlt}–${k?.beklenenUst}`,
          true,
          k ? sapma(k) <= SINIRDA_ESIK : false,
        );
        if (k) kompanzasyon = k;
      }
    } else if (solAsidoz || solAlkaloz || metAsidoz || metAlkaloz) {
      if (solAsidoz) ekle("solunum-asidozu", `PaCO₂ ${pco2} (>${PCO2_UST})`, true);
      if (solAlkaloz) ekle("solunum-alkalozu", `PaCO₂ ${pco2} (<${PCO2_ALT})`, true);
      if (metAsidoz) ekle(metAsidozTipi(), `HCO₃⁻ ${hco3} (<${HCO3_ALT})`, true);
      if (metAlkaloz) ekle("metabolik-alkaloz", `HCO₃⁻ ${hco3} (>${HCO3_UST})`, true);
    }
  }

  /* ── AG kuralı: pH ve HCO₃⁻ ne olursa olsun geçerli ────────────────
   * Yüksek anyon açığı, tek başına metabolik asidozun kanıtıdır. pH normal
   * ve HCO₃⁻ normalken bile: o zaman asidozu dengeleyen ikinci bir bozukluk
   * var demektir ve bu, gözden en çok kaçan tablodur.                  */
  if (agYuksek) {
    const zatenVar = bulgular.some((b) => b.tip === "metabolik-asidoz-ag");
    ekle("metabolik-asidoz-ag", `AG ${agEtkin} (>${AG_UST})`, !zatenVar && phDurumu === "normal");
    if (phDurumu === "normal" && !metAsidoz) {
      notlar.push(
        `pH ve HCO₃⁻ normal görünüyor ama anyon açığı ${agEtkin} — yüksek AG'li bir ` +
          "metabolik asidoz var ve onu dengeleyen ikinci bir bozukluk (çoğunlukla " +
          "metabolik alkaloz ya da solunum alkalozu) bulunuyor.",
      );
    }
  }
  /* Normal AG'li asidoz, yüksek AG bulgusuyla birlikte listelenmez. */
  if (agYuksek) {
    const i = bulgular.findIndex((b) => b.tip === "metabolik-asidoz-nonag");
    if (i >= 0) bulgular.splice(i, 1);
  }

  /* ── Delta-delta: yalnızca yüksek AG'li asidozda anlamlı ──────────── */
  let deltaAG: number | null = null;
  let deltaHCO3: number | null = null;
  let deltaOran: number | null = null;
  let deltaYorum: string | null = null;

  if (agYuksek && agEtkin !== null) {
    deltaAG = yuvarla(agEtkin - AG_UST);
    deltaHCO3 = yuvarla(24 - hco3);
    if (deltaHCO3 <= 0) {
      /* Eski kodun ters sonuç verdiği dal: HCO₃⁻ hiç düşmemiş. */
      deltaYorum =
        "HCO₃⁻ 24'ün altına inmemiş: yüksek AG'li asidoz varken bikarbonatın " +
        "düşmemesi, eşlik eden bir metabolik alkalozu gösterir. Oran bu tabloda " +
        "hesaplanmaz.";
      ekle("metabolik-alkaloz", `AG yüksek ama HCO₃⁻ ${hco3} (düşmemiş)`, false);
    } else {
      deltaOran = yuvarla(deltaAG / deltaHCO3, 2);
      if (deltaOran < 1) {
        deltaYorum = "Δ/Δ < 1 → eşlik eden normal anyon açıklı (hiperkloremik) metabolik asidoz";
        ekle("metabolik-asidoz-nonag", `Δ/Δ ${deltaOran} (<1)`, false);
      } else if (deltaOran <= 2) {
        deltaYorum = "Δ/Δ 1–2 → saf yüksek anyon açıklı metabolik asidoz";
      } else {
        deltaYorum = "Δ/Δ > 2 → eşlik eden metabolik alkaloz (ya da kronik solunum asidozu)";
        ekle("metabolik-alkaloz", `Δ/Δ ${deltaOran} (>2)`, false);
      }
    }
  }

  /* ── Mutlak Δgap: oranın yanında İKİNCİ okuma ─────────────────────
   * Bulgu ÜRETMEZ. Oran zaten bulgu üretiyor; ikisi de yaklaşık yöntem
   * olduğu için ikinci bir kaynağın da bulgu üretmesi, aynı listeyi iki
   * gerçeklikten beslemek olurdu.                                     */
  let deltaGap: number | null = null;
  let deltaGapYorum: string | null = null;
  let deltaGapCelisi: string | null = null;

  if (deltaAG !== null && deltaHCO3 !== null && deltaHCO3 > 0) {
    deltaGap = yuvarla(deltaAG - deltaHCO3);
    if (deltaGap > DELTA_GAP_BANT) {
      deltaGapYorum = `Δgap +${deltaGap} (> +${DELTA_GAP_BANT}) → eşlik eden metabolik alkaloz`;
    } else if (deltaGap < -DELTA_GAP_BANT) {
      deltaGapYorum = `Δgap ${deltaGap} (< −${DELTA_GAP_BANT}) → eşlik eden normal anyon açıklı metabolik asidoz`;
    } else {
      deltaGapYorum = `Δgap ${deltaGap} (−${DELTA_GAP_BANT} … +${DELTA_GAP_BANT}) → ek bir metabolik bozukluk göstermiyor`;
    }

    const yon = (d: number, alt: number, ust: number) => (d < alt ? "nonag" : d > ust ? "alkaloz" : "saf");
    const oranYon = deltaOran === null ? null : yon(deltaOran, 1, 2);
    const gapYon = yon(deltaGap, -DELTA_GAP_BANT, DELTA_GAP_BANT);
    if (oranYon !== null && oranYon !== gapYon) {
      deltaGapCelisi =
        "Oran ile mutlak Δgap farklı sonuç veriyor. İkisi de yaklaşık yöntem: " +
        "büyük deltalarda oran, küçük deltalarda mutlak fark daha kararlıdır. " +
        "Yukarıdaki bulgu listesi ORAN üzerinden kuruldu; ayrımı klinik tablo yapar.";
    }
  }

  /* ── Laktat: yüksek AG'nin ne kadarını açıklıyor ──────────────────── */
  if (laktat !== null && agEtkin !== null) {
    laktatKalanAG = yuvarla(agEtkin - laktat);
    if (agYuksek) {
      laktatYorum =
        laktatKalanAG > AG_UST
          ? `Laktat açığın ${laktat} mEq/L'sini kaplıyor; laktat dışı anyon açığı ` +
            `${laktatKalanAG} ve hâlâ ${AG_UST}'nin üstünde — açığı tek başına laktat ` +
            "açıklamıyor, ikinci bir yüksek anyon açığı nedeni aranmalı."
          : `Laktat dışı anyon açığı ${laktatKalanAG} (≤ ${AG_UST}) — yüksek anyon açığı ` +
            "laktatla açıklanıyor.";
    } else if (laktat >= 4) {
      laktatYorum =
        `Laktat ${laktat} mmol/L yüksek ama anyon açığı ${agEtkin} normal görünüyor. ` +
        (albGecerli
          ? "Albümin hesaba katıldı; laktatın açığa yansımaması eşlik eden bir " +
            "hipokloremik/alkalotik süreçle olabilir."
          : "Albümin girilmedi — hipoalbüminemi anyon açığını olduğundan küçük " +
            "gösterir ve bu tabloyu üretebilir.");
    } else {
      laktatYorum = `Laktat ${laktat} mmol/L — anyon açığına belirgin katkısı yok.`;
    }
  } else if (laktat !== null) {
    laktatYorum =
      `Laktat ${laktat} mmol/L. Anyon açığı hesaplanamadığı için katkısı ayrıştırılamıyor ` +
      "(Na⁺ ve Cl⁻ gerekli).";
  }

  /* ── SBE ile HCO₃⁻ tabanlı okumanın ayrışması ─────────────────────
   * Kronik solunum bozukluğunda böbrek yanıtı baz depolarını GERÇEKTEN
   * değiştirir, yani oradaki sapma bir kusur değil beklenen bulgudur.
   * Bu yüzden not iki okumayı da anlatıyor, birini yanlış ilan etmiyor. */
  const metAsidozBulgusu = bulgular.some((b) => b.tip.startsWith("metabolik-asidoz"));
  const metAlkalozBulgusu = bulgular.some((b) => b.tip === "metabolik-alkaloz");
  if (sbeYonu === "asidoz" && !metAsidozBulgusu) {
    sbeCelisi =
      `SBE ${sbe} mEq/L, yani baz açığı var — ama HCO₃⁻ tabanlı okuma metabolik ` +
      "asidoz göstermiyor. Sınırdaki HCO₃⁻ değerlerinde SBE daha duyarlıdır; kronik " +
      "solunum alkalozunda ise böbrek yanıtı SBE'yi eksiye çeker ve bu beklenen bir bulgudur.";
  } else if (sbeYonu === "alkaloz" && !metAlkalozBulgusu) {
    sbeCelisi =
      `SBE +${sbe} mEq/L, yani baz fazlası var — ama HCO₃⁻ tabanlı okuma metabolik ` +
      "alkaloz göstermiyor. Kronik solunum asidozunda böbrek yanıtı SBE'yi artıya " +
      "çeker ve bu beklenen bir bulgudur; aksi hâlde sınırda bir metabolik alkaloz düşünün.";
  }

  /* ── Özet ─────────────────────────────────────────────────────────── */
  const mikst = bulgular.length > 1;
  let ozet: string;
  if (bulgular.length === 0) {
    ozet = "Basit bir asit-baz bozukluğu saptanmadı.";
  } else if (!mikst) {
    const b = bulgular[0];
    ozet = kompanzasyon?.yeterli
      ? `Basit bozukluk: ${b.baslik.toLocaleLowerCase("tr")} — kompanzasyon beklenen aralıkta.`
      : `Basit bozukluk: ${b.baslik.toLocaleLowerCase("tr")}.`;
  } else {
    ozet =
      "Mikst bozukluk: " +
      bulgular.map((b) => b.baslik.toLocaleLowerCase("tr")).join(" + ") +
      ".";
  }

  if (hhTutarsiz) {
    notlar.push(
      `Henderson-Hasselbalch kontrolü: pH ve PaCO₂'den hesaplanan HCO₃⁻ ${hhHesaplanan} mEq/L, ` +
        `girilen ${hco3} mEq/L. Aradaki fark 2'yi aşıyor — değerler aynı örneğe ait olmayabilir ` +
        "ya da bir yazım/ölçüm hatası olabilir. Yorumu buna göre değerlendirin.",
    );
  }

  return {
    gecerli: true,
    phDurumu,
    bulgular,
    mikst,
    kompanzasyon,
    ag,
    agDuzeltilmis,
    agEtkin,
    agYuksek,
    deltaAG,
    deltaHCO3,
    deltaOran,
    deltaYorum,
    deltaGap,
    deltaGapYorum,
    deltaGapCelisi,
    sbe,
    sbeYonu,
    sbeCelisi,
    laktat,
    laktatKalanAG,
    laktatYorum,
    hhHesaplanan,
    hhTutarsiz,
    ozet,
    notlar,
  };
}
