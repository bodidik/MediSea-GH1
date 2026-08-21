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
  pao2: [10, 700],
  fio2: [0.21, 1],
  yas: [0, 120],
} as const;

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

function kompanzasyonHesapla(
  tip: BozuklukTip,
  sure: "akut" | "kronik",
  pco2: number,
  hco3: number,
): Kompanzasyon | null {
  if (tip === "metabolik-alkaloz") {
    const b = 0.7 * hco3 + 21;
    const alt = yuvarla(b - 5);
    const ust = yuvarla(b + 5);
    return {
      formul: "PaCO₂ = 0.7 × HCO₃⁻ + 21 ± 5",
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
    const b = 1.5 * hco3 + 8;
    const alt = yuvarla(b - 2);
    const ust = yuvarla(b + 2);
    return {
      formul: "PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2  (Winter)",
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
    const carpan = sure === "kronik" ? 3.5 : 1;
    const pay = sure === "kronik" ? 3 : 2;
    const b = 24 + ((pco2 - 40) / 10) * carpan;
    const alt = yuvarla(b - pay);
    const ust = yuvarla(b + pay);
    return {
      formul: `HCO₃⁻ = 24 + (ΔPaCO₂/10) × ${carpan}  (${sure})`,
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
    const carpan = sure === "kronik" ? 5 : 2;
    const b = 24 - ((40 - pco2) / 10) * carpan;
    const alt = yuvarla(b - 2);
    const ust = yuvarla(b + 2);
    return {
      formul: `HCO₃⁻ = 24 − (ΔPaCO₂/10) × ${carpan}  (${sure})`,
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
    hhHesaplanan,
    hhTutarsiz,
    ozet,
    notlar,
  };
}
