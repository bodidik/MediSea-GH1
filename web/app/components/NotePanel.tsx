"use client";
// C:\Users\hucig\Medknowledge\web\app\components\NotePanel.tsx
//
// Okuma sayfalarının kenarından açılan not defteri.
// İki kip: yazı (klavye) ve çizim (kalem/parmak).
//
// Dokunmatik + kalemli cihazlar için tasarlandı:
//  · Basınç duyarlı çizgi kalınlığı (PointerEvent.pressure)
//  · Avuç reddi — kalem bir kez görüldüyse parmak artık çizmez, sadece kaydırır
//  · Kalemin silgi ucu (buttons & 32) otomatik silgiye geçer
//
// KAYDIRMA TUVALDE ELLE YAPILIR. `touch-action` işaretçi türünü ayırt etmez;
// kalem de dokunma sayılır. Parmak kaydırabilsin diye tuvale `pan-y` verilince
// KALEMİN KENDİ HAREKETİ de kaydırma jesti oluyordu: tablette yazarken alttaki
// metin kayıyor, yazı bozuluyordu. Bu yüzden tuval `touch-action: none` ile
// bütün jestleri kendi üstüne alır, parmakla kaydırmayı aşağıdaki
// pointer işleyicileri `scrollTop` ile kendisi uygular.
//
// Çizim, PNG olarak değil VURUŞ (stroke) dizisi olarak saklanır: çözünürlükten
// bağımsız, panel genişliği değişince yeniden ölçeklenir, tek tek silinebilir.

import { useCallback, useEffect, useRef, useState } from "react";
import { panoyaKopyala } from "@/app/lib/pano";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { pageTitle, touchIndex } from "@/app/lib/study-index";
import { bozukYedegiOku, degistiBildir, guvenliNesneOku, kurtarildiMi } from "@/app/lib/depo";
import { sayfaKimligi, suankiSorgu } from "@/app/lib/reading-marks";
import { cizimSirasi, noktaSil, vurusBas, type Pt, type Stroke } from "@/app/lib/murekkep";
import NotOnizleme, { gorunenBolum } from "@/app/components/NotOnizleme";

type Mode = "text" | "draw";
type Paper = "cizgili" | "kareli" | "bos";
/** Çizim aracı. Kalemin silgi ucu hangi araç seçili olursa olsun siler. */
type Arac = "kalem" | "fosfor" | "silgi";
type SilgiTuru = "nokta" | "cizgi";

const KEY = (p: string) => `medisea:notes:v1:${p}`;

const WIDTH_KEY = "medisea:notew";
const PAPER_KEY = "medisea:notepaper";

const INKS = ["#1E293B", "#2563EB", "#DC2626", "#16A34A", "#D97706", "#7C3AED"];
const FOSFORLAR = ["#FACC15", "#4ADE80", "#F472B6", "#60A5FA"];

/**
 * Renklerin ADI — dördünün de `title`ı "Renk"ti ve erişilebilir adları
 * birbirinden ayrılmıyordu. Ölçüldü: ekran okuyucu dört düğmeyi de "Renk"
 * diye okuyor, kullanıcı hangisini seçtiğini bilemiyordu. Renk tek başına
 * bilgi taşıyamaz; adı yazıyla verilmeli.
 */
const INK_ADI: Record<string, string> = {
  "#1E293B": "koyu gri",
  "#2563EB": "mavi",
  "#DC2626": "kırmızı",
  "#16A34A": "yeşil",
  "#D97706": "turuncu",
  "#7C3AED": "mor",
  "#FACC15": "sarı",
  "#4ADE80": "açık yeşil",
  "#F472B6": "pembe",
  "#60A5FA": "açık mavi",
};
const NIBS = [2, 4, 7];
/** Geri alma geçmişinin tavanı (durum anlık görüntüsü sayısı). */
const GECMIS_TAVAN = 60;
/** Kalem bu kadar süre kıpırdamadan durursa vuruş düz çizgiye oturur (ms). */
const DUZ_CIZGI_MS = 400;
/** Nokta silgisinin yarıçapı (normalize, panel genişliğine göre). */
const SILGI_R = 0.022;

/** Kâğıt çizgi aralığı (px). Kareli kip aynı aralığı iki eksende kullanır. */
const ARALIK = 28;
const KAGIT_RENK = "#E2E8F0";
/** Kâğıt deseni. İlk katman SAYDAM zeminlidir, yoksa ikinciyi örterdi. */
const KAGIT: Record<Paper, string> = {
  cizgili: `repeating-linear-gradient(transparent 0 ${ARALIK - 1}px, ${KAGIT_RENK} ${ARALIK - 1}px ${ARALIK}px)`,
  kareli:
    `repeating-linear-gradient(transparent 0 ${ARALIK - 1}px, ${KAGIT_RENK} ${ARALIK - 1}px ${ARALIK}px),` +
    `repeating-linear-gradient(90deg, transparent 0 ${ARALIK - 1}px, ${KAGIT_RENK} ${ARALIK - 1}px ${ARALIK}px)`,
  bos: "none",
};
const KAGITLAR: [Paper, string, string][] = [
  ["cizgili", "≡", "Çizgili"],
  ["kareli", "▦", "Kareli"],
  ["bos", "▢", "Boş"],
];

/** Panel genişliği ön ayarları — tablette sürükleme tutamağı zahmetli. */
const BOYUTLAR: [number, string, string][] = [
  [340, "S", "Dar — konu metni açıkta kalsın"],
  [500, "M", "Orta"],
  [720, "L", "Geniş — uzun çizim"],
];

/** Avuç, kalem ucundan çok daha geniş bir temas alanı bildirir. */
const avucMu = (ev: React.PointerEvent) => ev.width > 35 || ev.height > 35;

/** Panelin görünüm penceresinde kaplayabileceği en fazla oran — render ile AYNI. */
const NOT_EN_FAZLA_VW = 0.94;
/** Vurgu rozetinin panelin yanına sığması için gereken boşluk (px). */
const ROZET_ICIN_GEREKEN = 100;
/** Kalem kalktıktan sonra avucun tuvali kaydırmaması için ölü süre (ms). */
const KALEM_OLU_SURE = 700;

export default function NotePanel() {
  const pathname = usePathname();

  const [enabled, setEnabled] = useState(false);
  /** Adresin sorgusu — aşağıdaki yoklama izliyor; `usePathname()` görmüyor. */
  const [sorgu, setSorgu] = useState(suankiSorgu);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [width, setWidth] = useState(420);
  const [paper, setPaper] = useState<Paper>("cizgili");

  const [text, setText] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  /* GEÇMİŞ DURUM ANLIK GÖRÜNTÜLERİYLE tutulur. Eskiden "geri al" yalnızca
     SON VURUŞU çıkarıyordu: silgiyle yapılan silme geri alınamıyordu, üstelik
     silmeden sonra basılan "geri al" silinenle ilgisiz son vuruşu da
     götürüyordu. Her kalem/silgi jesti artık tek bir geçmiş adımı. */
  const [gecmis, setGecmis] = useState<Stroke[][]>([]);
  const [ileri, setIleri] = useState<Stroke[][]>([]);
  /** Yazı kipinde biçimlenmiş görünüm (onay kutuları tıklanabilir). */
  const [onizleme, setOnizleme] = useState(false);
  /* Pano KURTARMA yolu: depo dolduğunda kullanıcıya "yazıyı kopyala"
     deniyor. Kopyalama sessizce başarısız olursa not gerçekten
     kayboluyordu — sonuç artık söyleniyor. */
  const [panoOk, setPanoOk] = useState<boolean | null>(null);
  useEffect(() => {
    if (panoOk === null) return;
    const t = setTimeout(() => setPanoOk(null), 3000);
    return () => clearTimeout(t);
  }, [panoOk]);

  const [ink, setInk] = useState(INKS[0]);
  const [fosforRenk, setFosforRenk] = useState(FOSFORLAR[0]);
  const [nib, setNib] = useState(NIBS[1]);
  const [arac, setArac] = useState<Arac>("kalem");
  const [silgiTuru, setSilgiTuru] = useState<SilgiTuru>("nokta");
  const erasing = arac === "silgi";
  const [hasPen, setHasPen] = useState(false);
  const [dirty, setDirty] = useState(false);
  /** Depo dolu vb. nedenle son kaydetme başarısız oldu mu */
  const [kayitHatasi, setKayitHatasi] = useState(false);
  /** Bu sayfanın notu bozuktu ve yedeğe taşındı mı (bu oturumda). */
  const [kurtarildi, setKurtarildi] = useState(false);
  /** Notun okundugu GERCEK anahtar (eski ortak kayda dusulmus olabilir). */
  const [okunanAnahtar, setOkunanAnahtar] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const drawing = useRef<Stroke | null>(null);
  /** Parmakla kaydırma: son y konumu (tuval jestleri kendi üstüne aldığı için) */
  const kaydirma = useRef<number | null>(null);
  /** Kalemin son temas anı — avuç, kalem kalkar kalkmaz kaydırmasın diye */
  const sonKalem = useRef(0);
  const strokesRef = useRef<Stroke[]>([]);
  strokesRef.current = strokes;
  /** Silgi jesti başlamadan önceki durum — jest bitince TEK geçmiş adımı olur. */
  const jestOncesi = useRef<Stroke[] | null>(null);
  /** Bitmiş vuruşların önbelleği: kalem hareket ederken yalnızca yeni vuruş çizilir. */
  const tabanRef = useRef<HTMLCanvasElement | null>(null);
  /** Düz çizgi zamanlayıcısı + son hareket noktası. */
  const duzZaman = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Not anahtarinin yol yarisi: sorgusuz sayfalarda pathname ile AYNI. */
  const sayfa = sayfaKimligi(pathname, sorgu);

  /* ── Sayfa okuma sayfası mı? ─────────────────────────────────────────────
   *
   * ⚠ ARAMA SÜRELİ OLAMAZ — konteyner SONRADAN belirebiliyor.
   *
   * Burası 20 animasyon karesi (~0.3 sn) deneyip vazgeçiyor ve bir daha
   * bakmıyordu. Ölçüldü (yerel üretim derlemesi, gerçek arayüz): soru çözüm
   * sayfasında `[data-readable]` yalnızca kullanıcı bir şık işaretledikten
   * SONRA basılıyor (açıklama bloğu), yani pencere çoktan kapanmış oluyor —
   * cevaptan 2,5 sn sonra bile konteyner VAR, not tutamağı YOK. Yani not
   * defteri o yüzeyde hiç açılmıyordu.
   *
   * A/B: konteyneri sunucu HTML'inde gelen konu sayfasında tutamak VAR,
   * cevaptan sonra beliren quiz sayfasında YOKTU.
   *
   * Kardeş bileşen bu sorunu zaten çözmüş: `ReadingTools` 600 ms'lik bir
   * yoklama kullanıyor ve belgedeki gerekçe kayıtlı — "MutationObserver
   * hızlı yoldur ama zamanlaması kaçabiliyor; 600 ms'lik bir yoklama
   * garantidir". Aynı yol burada da kullanılıyor.
   *
   * Bulunmayan sayfalarda (araç sayfaları, listeler) tek yaptığı şey 600
   * ms'de bir `querySelector` — ve panel açılmıyor (negatif kontrol edildi).
   *
   * AYNI YOKLAMA ADRESİN SORGUSUNU DA İZLİYOR. Sebebi ölçüldü:
   * `usePathname()` sorgu değişince DEĞİŞMİYOR, dolayısıyla notun kimliğini
   * sorguya bağlamak tek başına yetmez — quiz A'dan quiz B'ye yalnızca sorgu
   * değişerek geçildiğinde etkiler yeniden çalışmazdı. `useSearchParams()`
   * bilerek kullanılmıyor: belgede kayıtlı, o kanca alt ağacı sunucuda
   * üretilmez hâle getiriyor ve bu bileşen hem `AppShell`de hem `(ydus)`
   * düzeninde. Depodaki çözüm `/tools`ta zaten kullanılıyor — adresi
   * doğrudan oku.
   *
   * Yoklama bilerek DURMUYOR: durursa sorgu değişimi kaçar. `setState`
   * yalnızca değer GERÇEKTEN değişince çağrılıyor, yani yeniden çizim
   * üretmiyor (`ReadingTools`in "imza aynıysa hiçbir iş yapmaz" kalıbı).
   */
  useEffect(() => {
    let stop = false;

    const bak = () => {
      if (stop) return;
      setEnabled((o) => {
        const v = !!document.querySelector("[data-readable]");
        return o === v ? o : v;
      });
      setSorgu((o) => {
        const v = suankiSorgu();
        return o === v ? o : v;
      });
    };

    setEnabled(false);
    setOpen(false);
    bak();
    const zamanlayici = setInterval(bak, 600);

    return () => {
      stop = true;
      clearInterval(zamanlayici);
    };
  }, [pathname]);

  /* ── Kayıtlı notu yükle ──────────────────────────────────────────────── */
  useEffect(() => {
    /**
     * Bozuk not ATILMAZ, yedeğe taşınır. Ölçüldü: bozuk kayıtta panel BOŞ
     * açılıyor ve kullanıcıya hiçbir şey söylenmiyor; kullanıcı "burada
     * notum yok" sanıp yazdığı anda ELLE YAZDIĞI eski not gidiyordu.
     */
    let anahtar = KEY(sayfa);
    let doc = guvenliNesneOku<{ text?: string; strokes?: Stroke[] }>(anahtar);

    /**
     * ESKİ ORTAK NOT KAYBOLMASIN.
     *
     * Kimlik sorguyu da içerince, daha önce çıplak yola yazılmış notların
     * anahtarı değişiyor. Onları YOK SAYMAK sessiz veri kaybı olurdu; bu
     * depoda kural açık — kullanıcının yazdığı hiçbir şey sessizce
     * kaybolmaz. Bu yüzden kapsamlı anahtar BOŞSA eski anahtar okunuyor.
     *
     * Yalnızca OKUNUYOR: ilk düzenlemede not artık kapsamlı anahtara
     * yazılıyor, yani içerik kaybolmadan yerine oturuyor. Eski kayıt
     * silinmiyor — hangi quize ait olduğu bilinemez, dolayısıyla henüz
     * düzenlenmemiş kardeş yüzeylerde görünmeye devam etmesi (bugünkü
     * davranış) doğru olan.
     */
    if (!doc && sayfa !== pathname) {
      const eski = guvenliNesneOku<{ text?: string; strokes?: Stroke[] }>(KEY(pathname));
      if (eski) { doc = eski; anahtar = KEY(pathname); }
    }

    setText(typeof doc?.text === "string" ? doc.text : "");
    setStrokes(Array.isArray(doc?.strokes) ? doc.strokes : []);
    setKurtarildi(kurtarildiMi(anahtar));
    setOkunanAnahtar(anahtar);
    setGecmis([]);
    setIleri([]);
    setDirty(false);
  }, [pathname, sayfa]);

  /* ── Panel tercihleri (sayfadan bağımsız, bir kez okunur) ────────────── */
  useEffect(() => {
    try {
      const w = Number(localStorage.getItem(WIDTH_KEY));
      if (w >= 300 && w <= 900) setWidth(w);
      const k = localStorage.getItem(PAPER_KEY);
      if (k === "cizgili" || k === "kareli" || k === "bos") setPaper(k);
    } catch {}
  }, []);

  /* ── Kaydet (gecikmeli) ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      let ok = true;
      try {
        if (!text.trim() && strokes.length === 0) {
          localStorage.removeItem(KEY(sayfa));
        } else {
          localStorage.setItem(KEY(sayfa), JSON.stringify({ text, strokes, at: Date.now() }));
          touchIndex(sayfa, pageTitle());
        }
        /* SİLME dalı da duyurulmalı — bir dönem yalnızca kaydetme dalı
           duyuruyordu. Bedeli tek yönlü: senkron birleştirmesi hiçbir şeyi
           SİLMİYOR, yani sunucuya ulaşmayan bir silme bir sonraki uzlaşmada
           notu GERİ GETİRİYOR. Kardeş yazıcı (reading-marks.saveMarks) iki
           dalı da duyuruyor; buradaki tek fark unutulmuş bir kopyaydı.

           `dropFromIndex` BİLEREK çağrılmıyor: aynı sayfada vurgular
           duruyor olabilir ve dizin kaydı onlara da hizmet ediyor. */
        degistiBildir();
      } catch {
        // Depo dolu. SESSİZCE GEÇMEK YASAK: aşağıda "Kaydedildi" yazan bir
        // başlık var; hata yutulursa kullanıcıya notu güvendeymiş gibi
        // görünür ve sekmeyi kapatınca kaybeder.
        ok = false;
      }
      setKayitHatasi(!ok);
      setDirty(false);
    }, 600);
    return () => clearTimeout(t);
  }, [text, strokes, dirty, sayfa]);

  /* ── Panel genişliğini FAB'lara duyur (ReadingTools rozetini kaydırır) ─
   *
   * İKİ GERÇEKLİK VARDI: değişkene HAM `width` yazılıyordu ama panel
   * `min(width, 94vw)` ile çiziliyor. Ölçüldü (canlı, 375px): panel 353px,
   * değişken 420px — rozet panelden 67px FAZLA kaydırılıyordu.
   *
   * Daha ağırı, kaymanın kendisiydi: 375px'te panel ekranın %94'ünü
   * kapladığı için yanında yer KALMIYOR. Rozet `left -125 / right -65`,
   * yani tümüyle ekran dışında — ama `display` hâlâ `flex`, `visibility`
   * `visible`, `aria-hidden` YOK. Ölçüldü: "Vurgularım (1)" düğmesi
   * GERÇEKTEN odaklanıyor (`document.activeElement`), yani klavyeyle gezen
   * kullanıcı GÖREMEDİĞİ bir denetimin üstünde duruyor ve o denetim vurgu
   * SİLME düğmelerini açıyor. Belgede kayıtlı `opacity-0` sınıfının
   * birebir aynısı, bu kez `translateX` ile.
   *
   * Çare iki parçalı: değişken GERÇEK genişliği taşıyor, ve yan yana yer
   * yoksa rozet `display: none` ile tümden kaldırılıyor (odak sırasından ve
   * erişilebilirlik ağacından da düşsün diye). Panel kapanınca geri geliyor.
   */
  useEffect(() => {
    const kok = document.documentElement;
    const yaz = () => {
      const gercek = open ? Math.min(width, window.innerWidth * NOT_EN_FAZLA_VW) : 0;
      kok.style.setProperty("--ms-note-w", `${gercek}px`);
      /* Rozet ~60px, iki yanında ~20px kenar boşluğu istiyor. */
      const yerVar = !open || window.innerWidth - gercek >= ROZET_ICIN_GEREKEN;
      kok.style.setProperty("--ms-not-yer", yerVar ? "flex" : "none");
    };
    yaz();
    window.addEventListener("resize", yaz);
    return () => {
      window.removeEventListener("resize", yaz);
      kok.style.setProperty("--ms-note-w", "0px");
      kok.style.setProperty("--ms-not-yer", "flex");
    };
  }, [open, width]);

  /* ── Odak yönetimi ────────────────────────────────────────────────────
   *
   * Ölçüldü: panel açılınca odak <body>'ye düşüyordu. Klavye kullanan biri
   * paneli açtıktan sonra not alanına ulaşmak için sayfayı en baştan
   * Tab'lamak zorunda kalıyordu — panel ekranı kaplayan bir çekmece olduğu
   * halde.
   *
   * Odak ilk denetime değil PANELİN KENDİSİNE veriliyor: ekran okuyucu önce
   * "Not defteri" adını ve rolünü duyuruyor, sonraki Tab ilk denetime gidiyor.
   * Kapanışta odak tutamağa geri dönüyor; aksi hâlde odak yine kaybolurdu.
   */
  const panelRef = useRef<HTMLElement | null>(null);
  const tutamakRef = useRef<HTMLButtonElement | null>(null);
  const acilmistiRef = useRef(false);

  useEffect(() => {
    if (open) {
      acilmistiRef.current = true;
      const t = setTimeout(() => panelRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    // Yalnızca gerçekten açıkken kapandıysa odağı geri ver — ilk yüklemede
    // sayfanın odağını çalmasın.
    if (acilmistiRef.current) {
      acilmistiRef.current = false;
      const t = setTimeout(() => tutamakRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ── ESC ile kapat ────────────────────────────────────────────────────
   * Gerçek Escape tuşuyla ölçüldü: panel kapanmıyordu. Ekranı kaplayan bir
   * çekmecede ESC beklenen çıkış yolu; yoksa fare kullanamayan kullanıcının
   * tek çaresi kapatma düğmesini Tab'layarak bulmak.
   */
  useEffect(() => {
    if (!open) return;
    const dinle = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
    };
    window.addEventListener("keydown", dinle);
    return () => window.removeEventListener("keydown", dinle);
  }, [open]);

  /* ── Vurgudan alıntı geldiğinde ─────────────────────────────────────── */
  useEffect(() => {
    const onQuote = (ev: Event) => {
      const q = (ev as CustomEvent<{ text: string }>).detail?.text?.trim();
      if (!q) return;
      setMode("text");
      setOpen(true);
      setText((prev) => (prev ? `${prev.replace(/\s*$/, "")}\n\n> ${q}\n` : `> ${q}\n`));
      setDirty(true);
    };
    window.addEventListener("medisea:note-quote", onQuote);
    return () => window.removeEventListener("medisea:note-quote", onQuote);
  }, []);

  /* ── Tuval çizimi ────────────────────────────────────────────────────── */

  // Yazı yüzeyinin yüksekliği: en az 1.4 en, çizim aşağı taştıkça uzar
  const surfaceH = useCallback(() => {
    let low = 1.4;
    for (const s of strokesRef.current) for (const p of s.p) if (p[1] + 0.25 > low) low = p[1] + 0.25;
    return low;
  }, []);

  /**
   * Bitmiş vuruşları ÖNBELLEK tuvaline basar, sonra görünür tuvale kopyalar.
   *
   * Vuruş artık doldurulmuş bir eğri anahattı (`lib/murekkep`); kalem her
   * kıpırdadığında bütün çizimi yeniden hesaplamak uzun notlarda tablette
   * gecikme demek. Önbellek yalnızca vuruş listesi değişince yenilenir,
   * hareket sırasında görünür tuvale `drawImage` ile kopyalanıp üstüne tek
   * bir canlı vuruş çizilir.
   */
  const redraw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    if (!W || !H) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.round(W * dpr);
    const ph = Math.round(H * dpr);
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
    }
    const taban = tabanRef.current ?? (tabanRef.current = document.createElement("canvas"));
    taban.width = pw;
    taban.height = ph;
    const tctx = taban.getContext("2d");
    const ctx = cv.getContext("2d");
    if (!tctx || !ctx) return;
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, W, H);
    for (const s of cizimSirasi(strokesRef.current)) vurusBas(tctx, s, W);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pw, ph);
    ctx.drawImage(taban, 0, 0);
  }, []);

  /** Önbelleği kopyala + canlı vuruşu üstüne çiz (kalem hareket ederken). */
  const canliCiz = () => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    const taban = tabanRef.current;
    const s = drawing.current;
    if (!cv || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (taban && taban.width === cv.width && taban.height === cv.height) ctx.drawImage(taban, 0, 0);
    if (!s) return;
    const dpr = cv.width / (cv.clientWidth || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vurusBas(ctx, s, cv.clientWidth);
  };

  useEffect(() => {
    if (mode !== "draw" || !open) return;
    redraw();
    const ro = new ResizeObserver(() => redraw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [mode, open, strokes, width, redraw]);

  /* ── Geçmiş ──────────────────────────────────────────────────────────── */

  /** Yeni durumu yaz; öncekini geri alma geçmişine koy. */
  const commit = (onceki: Stroke[], sonraki: Stroke[]) => {
    if (onceki === sonraki) return;
    setStrokes(sonraki);
    setGecmis((g) => [...g, onceki].slice(-GECMIS_TAVAN));
    setIleri([]);
    setDirty(true);
  };

  /* ── Kalem / parmak girişi ───────────────────────────────────────────── */

  const norm = (ev: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    const W = r.width || 1;
    const pressure =
      ev.pointerType === "pen" ? (ev.pressure > 0 ? ev.pressure : 0.5) : 0.5;
    return [
      round3((ev.clientX - r.left) / W),
      round3((ev.clientY - r.top) / W),
      round2(pressure),
    ];
  };

  /**
   * Silgi hareketi — durumu doğrudan değiştirir, geçmiş adımı jest bitince
   * (`onUp`) tek seferde yazılır. Çizgi silgisi değdiği vuruşun tamamını,
   * nokta silgisi yalnızca değdiği kısmı siler (vuruş parçalara bölünür).
   */
  const eraseAt = (pt: Pt) => {
    const cur = strokesRef.current;
    let sonraki = cur;
    if (silgiTuru === "nokta") {
      sonraki = noktaSil(cur, pt, SILGI_R);
    } else {
      const hit = cur.findIndex((s) =>
        s.p.some((p) => Math.hypot(p[0] - pt[0], p[1] - pt[1]) < 0.035)
      );
      if (hit !== -1) sonraki = cur.filter((_, i) => i !== hit);
    }
    if (sonraki === cur) return;
    strokesRef.current = sonraki;
    setStrokes(sonraki);
  };

  const duzZamanlayiciKapat = () => {
    if (duzZaman.current) clearTimeout(duzZaman.current);
    duzZaman.current = null;
  };

  /**
   * DÜZ ÇİZGİ: kalem vuruşun sonunda kıpırdamadan beklerse vuruş, ilk
   * noktadan son noktaya düz bir çizgiye oturur (tabletteki not
   * uygulamalarının alışılmış jesti). Kısa karalamalar etkilenmez.
   */
  const duzZamanlayiciKur = () => {
    duzZamanlayiciKapat();
    duzZaman.current = setTimeout(() => {
      const s = drawing.current;
      if (!s || s.p.length < 6) return;
      const a = s.p[0];
      const b = s.p[s.p.length - 1];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.06) return;
      const n = 12;
      const bas = s.p.reduce((t, p) => t + p[2], 0) / s.p.length;
      s.p = Array.from({ length: n + 1 }, (_, i) => [
        round3(a[0] + ((b[0] - a[0]) * i) / n),
        round3(a[1] + ((b[1] - a[1]) * i) / n),
        round2(bas),
      ] as Pt);
      canliCiz();
    }, DUZ_CIZGI_MS);
  };

  const onDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (ev.pointerType === "pen") {
      if (!hasPen) setHasPen(true);
      sonKalem.current = Date.now();
    }

    // Avuç reddi: kalem görüldüyse parmak ÇİZMEZ, tuvali kaydırır. Kaydırmayı
    // tarayıcıya bırakamayız (bkz. dosya başı: `touch-action` kalemi de kapsar),
    // bu yüzden elle yapılır. Avucun kendisi ve kalem daha yeni kalkmışsa gelen
    // temas kaydırmaz — yazarken sayfa oynamasın.
    if (hasPen && ev.pointerType === "touch") {
      if (avucMu(ev) || Date.now() - sonKalem.current < KALEM_OLU_SURE) return;
      try {
        canvasRef.current?.setPointerCapture(ev.pointerId);
      } catch {}
      kaydirma.current = ev.clientY;
      return;
    }

    ev.preventDefault();
    try {
      // işaretçi artık etkin değilse fırlatır — çizimi engellememeli
      canvasRef.current?.setPointerCapture(ev.pointerId);
    } catch {}

    const pt = norm(ev);
    // kalemin silgi ucu ya da yan tuş → silgi
    const eraserTip = ev.pointerType === "pen" && (ev.buttons & 32) !== 0;
    if (erasing || eraserTip) {
      jestOncesi.current = strokesRef.current;
      eraseAt(pt);
      drawing.current = null;
      return;
    }
    drawing.current =
      arac === "fosfor"
        ? { c: fosforRenk, w: nib, p: [pt], h: 1 }
        : { c: ink, w: nib, p: [pt] };
    canliCiz();
    duzZamanlayiciKur();
  };

  const onMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (ev.pointerType === "pen") sonKalem.current = Date.now();

    if (hasPen && ev.pointerType === "touch") {
      const yzey = surfaceRef.current;
      if (kaydirma.current !== null && yzey) {
        yzey.scrollTop -= ev.clientY - kaydirma.current;
        kaydirma.current = ev.clientY;
      }
      return;
    }

    if (!drawing.current) {
      if (jestOncesi.current && ev.buttons) eraseAt(norm(ev));
      return;
    }
    const pt = norm(ev);
    const last = drawing.current.p[drawing.current.p.length - 1];
    // çok yakın noktaları at — depo şişmesin
    if (Math.hypot(pt[0] - last[0], pt[1] - last[1]) < 0.004) return;
    drawing.current.p.push(pt);
    canliCiz();
    duzZamanlayiciKur();
  };

  const onUp = () => {
    kaydirma.current = null;
    duzZamanlayiciKapat();

    // Silgi jesti bitti: jest boyunca yapılan bütün silmeler TEK geçmiş adımı.
    const once = jestOncesi.current;
    jestOncesi.current = null;
    if (once) {
      if (once !== strokesRef.current) {
        setGecmis((g) => [...g, once].slice(-GECMIS_TAVAN));
        setIleri([]);
        setDirty(true);
      }
      return;
    }

    const s = drawing.current;
    drawing.current = null;
    if (!s || !s.p.length) return;
    commit(strokesRef.current, [...strokesRef.current, s]);
  };

  /* ── Eylemler ────────────────────────────────────────────────────────── */

  // NOT: set çağrıları güncelleyicinin DIŞINDA yapılır. React güncelleyici
  // fonksiyonları saf sayar ve gerektiğinde iki kez çalıştırabilir — içeride
  // setState çağırmak vuruşun iki kez eklenmesine yol açıyordu.
  const undo = () => {
    if (!gecmis.length) return;
    const onceki = gecmis[gecmis.length - 1];
    setGecmis(gecmis.slice(0, -1));
    setIleri((r) => [...r, strokesRef.current]);
    setStrokes(onceki);
    setDirty(true);
  };

  const redoOne = () => {
    if (!ileri.length) return;
    const sonraki = ileri[ileri.length - 1];
    setIleri(ileri.slice(0, -1));
    setGecmis((g) => [...g, strokesRef.current].slice(-GECMIS_TAVAN));
    setStrokes(sonraki);
    setDirty(true);
  };

  /* ── Kısayollar: Ctrl/⌘+Z geri, Ctrl/⌘+Shift+Z ya da Ctrl+Y ileri ──
     Yalnızca çizim kipinde ve odak bir yazı alanında DEĞİLKEN: yazı
     alanının kendi geri alması tarayıcının işi. */
  useEffect(() => {
    if (!open || mode !== "draw") return;
    const dinle = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const hedef = e.target;
      if (hedef instanceof Element && hedef.closest("input, textarea, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        redoOne();
      }
    };
    window.addEventListener("keydown", dinle);
    return () => window.removeEventListener("keydown", dinle);
  });

  const clearDraw = () => {
    if (strokes.length && !confirm("Çizimin tamamı silinsin mi? (Geri al ile dönebilirsin)")) return;
    commit(strokesRef.current, []);
  };

  /* ── Yazı biçimleme ──────────────────────────────────────────────────── */

  /** Seçimi sarar ya da satır başına önek koyar; imleci anlamlı yere bırakır. */
  const bicimle = (tur: "kalin" | "baslik" | "madde" | "gorev" | "alinti" | "bolum") => {
    const ta = textareaRef.current;
    const bas = ta?.selectionStart ?? text.length;
    const son = ta?.selectionEnd ?? text.length;
    let yeni = text;
    let imlec = son;

    if (tur === "kalin") {
      const secili = text.slice(bas, son) || "kalın";
      yeni = text.slice(0, bas) + `**${secili}**` + text.slice(son);
      imlec = bas + secili.length + 4;
    } else if (tur === "bolum") {
      const b = gorunenBolum();
      if (!b) return;
      const ek = `§[${b}]`;
      const onEk = bas > 0 && text[bas - 1] !== "\n" ? " " : "";
      yeni = text.slice(0, bas) + onEk + ek + text.slice(son);
      imlec = bas + onEk.length + ek.length;
    } else {
      const onek = { baslik: "## ", madde: "- ", gorev: "- [ ] ", alinti: "> " }[tur];
      const satirBasi = text.lastIndexOf("\n", bas - 1) + 1;
      yeni = text.slice(0, satirBasi) + onek + text.slice(satirBasi);
      imlec = son + onek.length;
    }
    setText(yeni);
    setDirty(true);
    requestAnimationFrame(() => {
      const t = textareaRef.current;
      if (!t) return;
      t.focus();
      t.setSelectionRange(imlec, imlec);
    });
  };

  /** Önizlemede onay kutusu: ilgili satırın [ ] ↔ [x] işaretini çevirir. */
  const gorevCevir = (satir: number) => {
    const satirlar = text.split("\n");
    const s = satirlar[satir];
    if (s === undefined) return;
    satirlar[satir] = /^(\s*)- \[ \]/.test(s)
      ? s.replace(/^(\s*)- \[ \]/, "$1- [x]")
      : s.replace(/^(\s*)- \[[xX]\]/, "$1- [ ]");
    setText(satirlar.join("\n"));
    setDirty(true);
  };

  /** Kâğıt deseni CSS'te gradyan, PNG'de çizgi — indirilen dosya ekranla aynı olsun. */
  const paintPaper = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    if (paper === "bos") return;
    ctx.strokeStyle = KAGIT_RENK;
    ctx.lineWidth = 1;
    for (let y = ARALIK - 0.5; y < H; y += ARALIK) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    if (paper !== "kareli") return;
    for (let x = ARALIK - 0.5; x < W; x += ARALIK) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  };

  const exportPng = () => {
    const src = canvasRef.current;
    if (!src) return;
    const out = document.createElement("canvas");
    const scale = 2;
    out.width = src.clientWidth * scale;
    out.height = src.clientHeight * scale;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.scale(scale, scale);
    paintPaper(ctx, src.clientWidth, src.clientHeight);
    for (const s of cizimSirasi(strokes)) vurusBas(ctx, s, src.clientWidth);

    const a = document.createElement("a");
    a.download = `not-${pathname.split("/").filter(Boolean).pop() || "sayfa"}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  };

  const kagitSec = (k: Paper) => {
    setPaper(k);
    try {
      localStorage.setItem(PAPER_KEY, k);
    } catch {}
  };

  /* ── Panel genişliği ─────────────────────────────────────────────────── */
  const boyutSec = (w: number) => {
    setWidth(w);
    try {
      localStorage.setItem(WIDTH_KEY, String(w));
    } catch {}
  };

  const startResize = (ev: React.PointerEvent) => {
    ev.preventDefault();
    const el = ev.currentTarget;
    try {
      // Tutamak parmakla da çekilebilmeli; yakalama olmadan işaretçi tutamaktan
      // çıkar çıkmaz olaylar kesiliyor.
      el.setPointerCapture(ev.pointerId);
    } catch {}
    const startX = ev.clientX;
    const startW = width;
    const move = (e: PointerEvent) => {
      const w = Math.min(900, Math.max(320, startW + (startX - e.clientX)));
      setWidth(w);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      try {
        localStorage.setItem(WIDTH_KEY, String(widthRef.current));
      } catch {}
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  const widthRef = useRef(width);
  widthRef.current = width;

  if (!enabled) return null;

  const hasContent = text.trim().length > 0 || strokes.length > 0;

  return (
    <>
      {/* ── Kenar tutamağı ── */}
      {!open && (
        <button
          data-ms-ui
          ref={tutamakRef}
          onClick={() => setOpen(true)}
          title="Not defteri"
          aria-label="Not defterini aç"
          className="fixed right-0 top-1/2 z-[54] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-slate-200 bg-white/95 px-2 py-4 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:pr-3 active:scale-95"
        >
          <span aria-hidden="true" className="text-base">📝</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 [writing-mode:vertical-rl]">
            Not
          </span>
          {hasContent && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
        </button>
      )}

      {/* ── Panel ── */}
      {open && (
        <>
          {/* Yalnız telefonda arka planı karart. Tablette KARARTMA YOK: not
              tutmanın amacı konuya bakarak yazmak, karartma metni görünmez
              yapıyordu. */}
          <div
            data-ms-ui
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[56] bg-slate-950/20 backdrop-blur-[1px] md:hidden"
          />

          {/* role="dialog" + ad: panelin ne olduğu ekran okuyucuya duyurulsun.
              aria-modal BİLEREK verilmiyor — masaüstünde karartma yok ve
              sayfanın geri kalanı kullanılabilir durumda; modal demek yanlış
              olurdu. tabIndex={-1} odağın panele verilebilmesi için. */}
          <aside
            data-ms-ui
            ref={panelRef}
            role="dialog"
            aria-label="Not defteri"
            tabIndex={-1}
            style={{ width: `min(${width}px, 94vw)` }}
            className="fixed right-0 top-0 z-[57] flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl outline-none"
          >
            {/* Genişlik tutamağı. Telefonda panel zaten tam en, orada gizli. */}
            <div
              onPointerDown={startResize}
              style={{ touchAction: "none" }}
              title="Genişliği ayarla"
              className="group absolute left-0 top-0 z-10 hidden h-full w-4 cursor-col-resize items-center justify-center bg-transparent hover:bg-blue-400/20 md:flex lg:w-3"
            >
              <span className="h-10 w-1 rounded-full bg-slate-300 transition-colors group-hover:bg-blue-500" />
            </div>

            {/* başlık */}
            <header className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
              <span aria-hidden="true" className="text-base">📝</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-blue-950">
                  Not Defteri
                </div>
                {/* role="status": "Kaydediliyor…" → "Kaydedildi" → "⚠ Kaydedilemedi"
                    geçişleri duyurulsun. Depo dolduğunda not KAYBOLUYOR; bunu
                    göremeyen kullanıcının da öğrenmesi gerekiyor. Ayrıntı kutusu
                    ayrıca canlı bölge YAPILMADI — aynı olayı iki kez duyurmak
                    gürültü olur, bu satır zaten hatayı söylüyor. */}
                <div
                  role="status"
                  className={`truncate text-[9px] font-bold uppercase tracking-widest ${
                    kayitHatasi ? "text-rose-600" : "text-slate-400"
                  }`}
                >
                  {kayitHatasi
                    ? "⚠ Kaydedilemedi"
                    : dirty
                      ? "Kaydediliyor…"
                      : hasContent
                        ? "Kaydedildi"
                        : "Bu sayfa için"}
                </div>
              </div>
              <Link
                href="/calisma-alanim"
                title="Çalışma Alanım — tüm not ve vurgularım"
                className="rounded-full px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                🗂
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                /* Adı "✕"di — ölçüldü. `title` ad OLMUYOR: hesaplama sırası
                   içeriği önce alıyor ve içerik boş değil. */
                aria-label="Not defterini kapat"
                title="Kapat"
              >
                ✕
              </button>
            </header>

            {/* Kaydetme başarısız — kullanıcı notu kaybetmeden kurtarabilsin.

                role="alert": bu kutu kullanıcı YAZDIKTAN SONRA, kaydetme
                düşünce DOM'a giriyor. Duyurulmazsa ekran okuyucu kullanıcısı
                notunun kaybolacağını hiç öğrenmiyor — ReadingTools'taki
                vurgu uyarısında ölçülen kusurun birebir kardeşi. */}
            {/* Kurtarma tek başına YETMEZ: veri korunuyor ama kullanıcı boş bir
                defter görüp "burada notum yok" sanıyor ve üstüne yazıyor. Yedek
                de kullanıcının ulaşamadığı bir anahtarda duruyordu — kopyalama
                düğmesi onu erişilebilir kılıyor (kota kurtarmasının emsali). */}
            {kurtarildi && (
              <div role="alert" className="border-b border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="mb-2 text-[11px] font-semibold leading-snug text-amber-900">
                  Bu sayfadaki kayıtlı not okunamadı, bu yüzden defter boş açıldı.
                  Eski kayıt SİLİNMEDİ — yedeğe alındı; aşağıya yazacağın not ayrıca saklanır.
                </p>
                <button
                  onClick={() => void panoyaKopyala(bozukYedegiOku(okunanAnahtar) ?? "").then(setPanoOk)}
                  className="rounded-lg bg-amber-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-amber-600"
                >
                  Eski kaydı kopyala
                </button>
              </div>
            )}

            {kayitHatasi && (
              <div role="alert" className="border-b border-rose-200 bg-rose-50 px-3 py-2.5">
                <p className="mb-2 text-[11px] font-semibold leading-snug text-rose-700">
                  Tarayıcı depolaması dolu olduğu için bu not kaydedilemedi. Sekmeyi
                  kapatırsan kaybolur.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => void panoyaKopyala(text).then(setPanoOk)}
                    disabled={!text.trim()}
                    className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-rose-500 disabled:opacity-40"
                  >
                    Yazıyı kopyala
                  </button>
                  {panoOk !== null && (
                    <span role="alert" className={panoOk
                      ? "self-center text-[10px] font-bold text-emerald-700"
                      : "self-center text-[10px] font-bold text-rose-700"}>
                      {panoOk ? "Kopyalandı" : "Kopyalanamadı — metni seçip Ctrl/⌘ + C"}
                    </span>
                  )}
                  {strokes.length > 0 && (
                    <button
                      onClick={exportPng}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-rose-500"
                    >
                      Çizimi indir
                    </button>
                  )}
                  <Link
                    href="/calisma-alanim"
                    className="rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Yer aç
                  </Link>
                </div>
              </div>
            )}

            {/* kip seçimi + panel boyutu */}
            <div className="flex items-center gap-1 border-b border-slate-100 px-3 py-2">
              {(
                [
                  ["text", "✎", "Yazı"],
                  ["draw", "✍", "Çizim"],
                ] as [Mode, string, string][]
              ).map(([m, icon, label]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  /* Kip seçici: hangisinin ETKİN olduğu yalnızca renkle
                     anlatılıyordu. `aria-pressed` doğru öznitelik --
                     `aria-expanded` DEĞİL, çünkü bir şey açıp kapatmıyor. */
                  aria-pressed={mode === m}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                    mode === m
                      ? "bg-blue-950 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
              {/* Sürükleme tutamağı tablette zahmetli; hazır boyutlar tek dokunuş. */}
              <span className="mx-1 hidden h-5 w-px bg-slate-200 md:block" />
              <div className="hidden md:flex md:gap-0.5">
                {BOYUTLAR.map(([w, label, title]) => (
                  <button
                    key={w}
                    onClick={() => boyutSec(w)}
                    /* Adları "S" / "M" / "L" idi; anlam `title`da kalıyordu
                       ve `title` ad olmuyor (içerik dolu). `aria-pressed`
                       de eklendi: hangi genişliğin ETKİN olduğu yalnızca
                       renkle anlatılıyordu. */
                    aria-label={`Panel genişliği: ${title}`}
                    aria-pressed={Math.abs(width - w) < 30}
                    title={title}
                    className={`h-7 w-7 rounded-lg text-[10px] font-black transition-colors ${
                      Math.abs(width - w) < 30
                        ? "bg-slate-900 text-white"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── YAZI KİPİ ── */}
            {mode === "text" && (
              <>
                {/* biçim çubuğu — Markdown'ın küçük bir alt kümesi; metin düz
                    metin olarak saklanır (yedek, senkron, dışa aktarım aynı) */}
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-3 py-1.5">
                  {(
                    [
                      ["kalin", "B", "Kalın", "font-black"],
                      ["baslik", "H", "Başlık", "font-black"],
                      ["madde", "•", "Madde", ""],
                      ["gorev", "☐", "Yapılacak", ""],
                      ["alinti", "❝", "Alıntı", ""],
                    ] as ["kalin" | "baslik" | "madde" | "gorev" | "alinti", string, string, string][]
                  ).map(([tur, isaret, ad, ek]) => (
                    <button
                      key={tur}
                      type="button"
                      onClick={() => {
                        setOnizleme(false);
                        bicimle(tur);
                      }}
                      aria-label={ad}
                      title={ad}
                      className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-[13px] text-slate-600 transition-colors hover:bg-slate-100 ${ek}`}
                    >
                      {isaret}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setOnizleme(false);
                      bicimle("bolum");
                    }}
                    aria-label="Okuduğun bölüme bağlantı ekle"
                    title="Okuduğun bölüme bağla — önizlemede tıklayınca o başlığa gider"
                    className="flex h-7 items-center gap-1 rounded-lg px-2 text-[12px] font-bold text-blue-800 transition-colors hover:bg-blue-50"
                  >
                    § <span className="hidden sm:inline">Bölüme bağla</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnizleme((v) => !v)}
                    aria-pressed={onizleme}
                    className={`ml-auto h-7 rounded-lg px-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                      onizleme ? "bg-blue-950 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Önizle
                  </button>
                </div>

                {onizleme ? (
                  <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                    <NotOnizleme metin={text} gorevCevir={gorevCevir} />
                  </div>
                ) : (
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setDirty(true);
                  }}
                  /* Alanın erişilebilir ADI yoktu: ad, aşağıdaki 130
                     karakterlik placeholder'a düşüyordu. İki bedeli birden
                     vardı — ekran okuyucu odakta iki paragraflık yönergeyi
                     "alan adı" diye okuyor, VE kullanıcı bir şey yazdığı anda
                     placeholder kaybolduğu için alan tümden ADSIZ kalıyordu.
                     Yani kendi notuna dönen kullanıcı hiçbir etiket duymuyor.
                     Placeholder ipucu olarak kalıyor; ad artık sabit. */
                  aria-label="Not metni"
                  placeholder={
                    "Bu sayfaya dair notların…\n\nÜstteki düğmelerle başlık, madde, yapılacak ekleyebilir; § ile okuduğun bölüme bağlantı koyabilirsin. Vurgu araç çubuğundaki 🗒 düğmesi seçtiğin metni buraya alıntı olarak gönderir."
                  }
                  /* ODAK HALKASI: `outline-none` varsayılan halkayı kaldırıyor ve
                     burada yerine hiçbir şey konmamıştı — odakta tek işaret imleçti.
                     Ölçüldü: `outline-none` taşıyan 146 etkileşimli ögenin 145'i
                     deponun halka kalıbını taşıyor, bu sonuncusu istisnaydı.
                     `ring-inset`: alan panel gövdesini kapladığı için dıştan halka
                     kenarlara taşardı. */
                  className="flex-1 resize-none overscroll-contain px-4 py-3 text-[14px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-700"
                />
                )}
                <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {text.length} karakter
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => void panoyaKopyala(text).then(setPanoOk)}
                      disabled={!text}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
                    >
                      Kopyala
                    </button>
                    <button
                      onClick={() => {
                        if (text && !confirm("Not silinsin mi?")) return;
                        setText("");
                        setDirty(true);
                      }}
                      disabled={!text}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-30"
                    >
                      Temizle
                    </button>
                  </div>
                </footer>
              </>
            )}

            {/* ── ÇİZİM KİPİ ── */}
            {mode === "draw" && (
              <>
                {/* araç çubuğu — 1. satır: araç + geçmiş */}
                <div className="flex items-center gap-1 border-b border-slate-100 px-3 pt-2 pb-1.5">
                  {(
                    [
                      ["kalem", "✒", "Kalem"],
                      ["fosfor", "🖍", "Fosforlu"],
                      ["silgi", "⌫", "Silgi"],
                    ] as [Arac, string, string][]
                  ).map(([a, isaret, ad]) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setArac(a)}
                      aria-pressed={arac === a}
                      className={`flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition-colors ${
                        arac === a
                          ? a === "silgi"
                            ? "bg-rose-700 text-white"
                            : "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span aria-hidden="true">{isaret}</span>
                      {ad}
                    </button>
                  ))}
                  <span className="ml-auto" />
                  <button
                    type="button"
                    onClick={undo}
                    disabled={!gecmis.length}
                    aria-label="Geri al (Ctrl+Z)"
                    title="Geri al (Ctrl+Z)"
                    className="h-7 rounded-lg px-2 text-[13px] transition-colors hover:bg-slate-100 disabled:opacity-25"
                  >
                    ↶
                  </button>
                  <button
                    type="button"
                    onClick={redoOne}
                    disabled={!ileri.length}
                    aria-label="İleri al (Ctrl+Y)"
                    title="İleri al (Ctrl+Y)"
                    className="h-7 rounded-lg px-2 text-[13px] transition-colors hover:bg-slate-100 disabled:opacity-25"
                  >
                    ↷
                  </button>
                </div>

                {/* 2. satır: seçili aracın ayarları + kâğıt */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 pb-2 pt-1">
                  {arac !== "silgi" &&
                    (arac === "fosfor" ? FOSFORLAR : INKS).map((c) => {
                      const secili = arac === "fosfor" ? fosforRenk === c : ink === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => (arac === "fosfor" ? setFosforRenk(c) : setInk(c))}
                          aria-label={`${arac === "fosfor" ? "Fosforlu" : "Kalem"} rengi: ${INK_ADI[c] ?? c}`}
                          aria-pressed={secili}
                          className={`h-6 w-6 rounded-full ring-2 ring-offset-1 transition-transform hover:scale-110 ${
                            secili ? "ring-blue-500" : "ring-transparent"
                          }`}
                          style={{ background: c }}
                        />
                      );
                    })}
                  {arac !== "silgi" && (
                    <>
                      <span className="mx-1 h-5 w-px bg-slate-200" />
                      {NIBS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNib(n)}
                          aria-label={`Uç kalınlığı: ${n}`}
                          aria-pressed={nib === n}
                          className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                            nib === n ? "bg-slate-900" : "hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className="rounded-full"
                            style={{
                              width: n + 2,
                              height: n + 2,
                              background: nib === n ? "#fff" : "#64748B",
                            }}
                          />
                        </button>
                      ))}
                    </>
                  )}
                  {arac === "silgi" &&
                    (
                      [
                        ["nokta", "Nokta silgisi", "Yalnız değdiği kısmı siler"],
                        ["cizgi", "Çizgi silgisi", "Değdiği çizginin tamamını siler"],
                      ] as [SilgiTuru, string, string][]
                    ).map(([t, ad, aciklama]) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSilgiTuru(t)}
                        aria-pressed={silgiTuru === t}
                        title={aciklama}
                        className={`h-6 rounded-lg px-2 text-[11px] font-bold transition-colors ${
                          silgiTuru === t ? "bg-rose-100 text-rose-800" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {ad}
                      </button>
                    ))}
                  <span className="ml-auto" />
                  {KAGITLAR.map(([k, icon, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => kagitSec(k)}
                      aria-label={`${label} sayfa`}
                      aria-pressed={paper === k}
                      title={`${label} sayfa`}
                      className={`h-6 rounded-lg px-2 text-[11px] transition-colors ${
                        paper === k
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* tuval */}
                <div
                  ref={surfaceRef}
                  className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 p-2"
                >
                  <canvas
                    ref={canvasRef}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onPointerLeave={onUp}
                    style={{
                      width: "100%",
                      height: `${surfaceH() * 100}%`,
                      aspectRatio: `1 / ${surfaceH()}`,
                      // Bütün jestler tuvalin: kalem yazarken hiçbir şey kaymaz.
                      // Parmakla kaydırmayı onDown/onMove elle uygular.
                      touchAction: "none",
                      backgroundImage: KAGIT[paper],
                    }}
                    className="w-full cursor-crosshair rounded-xl border border-slate-200 bg-white shadow-inner"
                  />
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <span className="text-[10px] font-semibold leading-snug text-slate-500">
                    {hasPen ? "Kalem yazar · parmak kaydırır" : `${strokes.length} çizgi`}
                    <span className="hidden sm:inline"> · sonda bekle → düz çizgi</span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={exportPng}
                      disabled={!strokes.length}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
                    >
                      PNG indir
                    </button>
                    <button
                      onClick={clearDraw}
                      disabled={!strokes.length}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-30"
                    >
                      Temizle
                    </button>
                  </div>
                </footer>
              </>
            )}
          </aside>
        </>
      )}
    </>
  );
}

const round3 = (v: number) => Math.round(v * 1000) / 1000;
const round2 = (v: number) => Math.round(v * 100) / 100;
