// C:\Users\hucig\Medknowledge\web\app\lib\reading-marks.ts
//
// Okuma sayfalarındaki vurguların saklanması ve DOM'a uygulanması.
// Saf DOM + localStorage — React'e bağımlı değil, bileşenden ayrı düşünülebilir.
//
// Konumlandırma mantığı: bir vurgu, "hangi [data-readable] konteynerinde,
// o konteynerin düz metninde hangi karakter aralığında" olduğuyla saklanır.
// Vurgu boyarken DOM'a <mark> eklenir ama metin içeriği hiç değişmez —
// bu yüzden ofsetler boyama sonrası da geçerli kalır, sıralama önemli değildir.
//
// Konteyner KİMLİĞİ, öznitelikteki değerdir (data-readable="pearl:p-aml-01").
// Değer boşsa sayfadaki sırası kullanılır. Kimlik kullanmanın sebebi: soru
// çözüm gibi sayfalarda yol değişmeden içerik değişir — sıra numarası orada
// yanlış içeriğe yapışırdı, kimlik yapışmaz.

export type MarkStyle = "y" | "g" | "b" | "p" | "bold" | "u";

export type ReadingMark = {
  id: string;
  /** Konteyner kimliği — data-readable değeri, yoksa sıra numarası */
  k: string;
  /** Konteyner metnindeki mutlak karakter aralığı [s, e) */
  s: number;
  e: number;
  /** Seçilen metnin kendisi — içerik değişirse eşleşmez, o vurgu atlanır */
  t: string;
  st: MarkStyle;
  /** Vurgunun hemen öncesindeki bağlam (tekrar kartlarının cloze sorusu için) */
  b?: string;
  /** Vurgunun hemen sonrasındaki bağlam */
  a?: string;
};

// v2: konteyner sıra numarası yerine kimlik saklanıyor (v1 kayıtları okunmaz)
const KEY_PREFIX = "medisea:marks:v2:";
const ATTR = "data-ms-hl";

/* ── Depolama ──────────────────────────────────────────────────────────── */

export function storageKey(pathname: string) {
  return KEY_PREFIX + pathname;
}

/**
 * BOZUK KAYIT ATILMAZ, YEDEĞE TAŞINIR.
 *
 * Bir dönem `catch { return [] }` vardı ve gerekçesi "bozuk kayıt okuma
 * deneyimini kilitlemesin"di — o kısmı doğru. Ama ölçüldü: bozuk kayıt
 * tohumlanınca ekranda 0 vurgu çıkıyor, kullanıcıya HİÇBİR ŞEY
 * söylenmiyor (`role="alert"` kutusu 0) ve kullanıcı YENİ bir vurgu
 * yaptığı anda kaydetme bozuk kaydın ÜZERİNE yazıyor — veri kalıcı olarak
 * gidiyordu.
 *
 * Deponun kendi emsali bunun tersi ve belgede "sınıf kapalı" diye
 * kayıtlı: `UserContext` bozuk kaydı `ydus_premium_user_bozuk` anahtarına
 * TAŞIYIP normale devam ediyor. Aynı davranış burada da uygulanıyor;
 * yedek anahtar `<anahtar>:bozuk`.
 *
 * Yedeğe yazmak da başarısız olabilir (depo dolu/engelli) — o durumda
 * ham kayda DOKUNULMUYOR, yani en kötü ihtimalle eski davranışa dönülüyor.
 */
export function loadMarks(pathname: string): ReadingMark[] {
  const anahtar = storageKey(pathname);
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(anahtar);
  } catch {
    return []; // depo engelli — okunacak bir şey yok
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    try {
      localStorage.setItem(anahtar + ":bozuk", raw);
      localStorage.removeItem(anahtar);
    } catch {
      // yedekleyemedik: ham kaydı OLDUĞU GİBİ bırak
    }
    return [];
  }
}

/**
 * Vurguları saklar. BAŞARIYI DÖNDÜRÜR — çağıran taraf sessizce yutmamalı:
 * depo dolduğunda kullanıcıya kaydedildi demek, kaydetmemekten beterdir.
 */
/**
 * Kaydetme SONUCU — sebebiyle birlikte.
 *
 * Bir dönem `boolean` dönüyordu ve yorumu iki sebebi ZATEN biliyordu
 * ("kota dolu / gizli sekme"), ama arayüz tek sebebi basıyordu:
 * "Tarayıcı depolaması dolu — Yer aç". Ölçüldü (canlı, depo erişimi
 * engellenerek): depo DOLU değil ENGELLİYKEN de aynı mesaj çıkıyordu,
 * yani kullanıcı boşuna yer açmaya çalışıyordu. Bu depoda "yanlış sebep
 * bildirme" ayrıca avlanan bir kusur.
 */
export type KayitSonuc = "ok" | "dolu" | "engelli";

/** Kota hatası mı, erişim hatası mı? Tarayıcılar farklı ad/kod kullanıyor. */
function kotaHatasiMi(e: unknown): boolean {
  const h = e as { name?: string; code?: number };
  return h?.name === "QuotaExceededError" ||
    h?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    h?.code === 22 || h?.code === 1014;
}

export function saveMarks(pathname: string, marks: ReadingMark[]): KayitSonuc {
  try {
    if (marks.length === 0) localStorage.removeItem(storageKey(pathname));
    else localStorage.setItem(storageKey(pathname), JSON.stringify(marks));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("medisea:changed"));
    return "ok";
  } catch (e) {
    return kotaHatasiMi(e) ? "dolu" : "engelli";
  }
}

/* ── Konteynerler ──────────────────────────────────────────────────────── */

export function containers(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-readable]"));
}

/**
 * Konteynerin kimliği: öznitelik değeri, yoksa sayfadaki sırası.
 *
 * JSX'te değersiz yazılan `data-readable` DOM'a `data-readable="true"` olarak
 * basılır. Bunu KİMLİK saymıyoruz — aksi halde aynı sayfadaki iki değersiz
 * konteyner de "true" olur, biri diğerini eşlemede ezerdi.
 */
export function keyOf(el: HTMLElement, index: number): string {
  const v = el.getAttribute("data-readable")?.trim();
  if (!v || v === "true") return String(index);
  return v;
}

/** Sayfadaki konteynerleri kimliklerine göre eşler. */
export function containerMap(): Map<string, HTMLElement> {
  const map = new Map<string, HTMLElement>();
  containers().forEach((el, i) => map.set(keyOf(el, i), el));
  return map;
}

/**
 * Konteyner kümesinin parmak izi. İçerik değişince (ör. sonraki soru) değişir,
 * bizim <mark> eklememizle değişmez — yeniden boyama tetiğini buna bakarak veririz.
 */
export function containerSignature(): string {
  return containers()
    .map((el, i) => keyOf(el, i))
    .join("|");
}

/* ── Metin düğümü yardımcıları ─────────────────────────────────────────── */

function firstTextIn(n: Node): Text | null {
  if (n.nodeType === Node.TEXT_NODE) return n as Text;
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  return w.nextNode() as Text | null;
}

function lastTextIn(n: Node): Text | null {
  if (n.nodeType === Node.TEXT_NODE) return n as Text;
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  let cur: Node | null;
  while ((cur = w.nextNode())) last = cur as Text;
  return last;
}

/**
 * Seçim uçları her zaman metin düğümü olmaz (eleman + çocuk indeksi de olabilir).
 * Bu fonksiyon her iki durumu da en yakın metin düğümüne indirger.
 */
function toTextPoint(node: Node, offset: number): { node: Text; offset: number } | null {
  if (node.nodeType === Node.TEXT_NODE) return { node: node as Text, offset };

  const after = node.childNodes[offset];
  if (after) {
    const t = firstTextIn(after);
    if (t) return { node: t, offset: 0 };
  }
  const before = node.childNodes[offset - 1];
  if (before) {
    const t = lastTextIn(before);
    if (t) return { node: t, offset: t.length };
  }
  const any = firstTextIn(node);
  return any ? { node: any, offset: 0 } : null;
}

/** Konteynerin düz metnindeki mutlak karakter ofseti. Bulunamazsa -1. */
export function offsetOf(root: HTMLElement, node: Node, offset: number): number {
  const point = toTextPoint(node, offset);
  if (!point) return -1;

  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  let cur: Node | null;
  while ((cur = w.nextNode())) {
    if (cur === point.node) return total + point.offset;
    total += (cur as Text).length;
  }
  return -1;
}

/** Mutlak ofsetlerden normalize edilmiş (uçları metin düğümü olan) bir Range kurar. */
export function rangeFrom(root: HTMLElement, s: number, e: number): Range | null {
  if (s >= e) return null;

  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  let startNode: Text | null = null;
  let startOff = 0;
  let endNode: Text | null = null;
  let endOff = 0;
  let cur: Node | null;

  while ((cur = w.nextNode())) {
    const t = cur as Text;
    const len = t.length;
    if (!startNode && total + len > s) {
      startNode = t;
      startOff = s - total;
    }
    if (startNode && total + len >= e) {
      endNode = t;
      endOff = e - total;
      break;
    }
    total += len;
  }

  if (!startNode || !endNode) return null;

  const range = document.createRange();
  try {
    range.setStart(startNode, Math.max(0, Math.min(startOff, startNode.length)));
    range.setEnd(endNode, Math.max(0, Math.min(endOff, endNode.length)));
  } catch {
    return null;
  }
  return range.collapsed ? null : range;
}

/* ── Boyama ────────────────────────────────────────────────────────────── */

function textNodesIn(range: Range): Text[] {
  const root = range.commonAncestorContainer;
  if (root.nodeType === Node.TEXT_NODE) return [root as Text];

  const out: Text[] = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = w.nextNode())) {
    if (range.intersectsNode(n)) out.push(n as Text);
  }
  return out;
}

/**
 * Range'i <mark> etiketleriyle sarar. Range'in uçları metin düğümü olmalı —
 * her zaman rangeFrom() çıktısı verilmeli.
 */
export function paint(range: Range, id: string, st: MarkStyle): boolean {
  const nodes = textNodesIn(range);
  if (!nodes.length) return false;

  const cls = `ms-hl ms-hl-${st}`;
  let painted = false;

  for (const node of nodes) {
    const s = node === range.startContainer ? range.startOffset : 0;
    const e = node === range.endContainer ? range.endOffset : node.length;
    if (s >= e) continue;

    // splitText yerinde çalışır: node her zaman baştaki parçayı tutar
    let target = node;
    if (e < target.length) target.splitText(e);
    if (s > 0) target = target.splitText(s);

    const el = document.createElement("mark");
    el.className = cls;
    el.setAttribute(ATTR, id);
    target.parentNode?.insertBefore(el, target);
    el.appendChild(target);
    painted = true;
  }

  return painted;
}

/** Bir vurgunun <mark> sargılarını söker, metni yerinde bırakır. */
export function unpaint(id: string) {
  strip(`mark[${ATTR}="${cssEscape(id)}"]`);
}

/** Sayfadaki tüm vurgu sargılarını söker — yeniden boyamayı tekrarlanabilir kılar. */
export function unpaintAll() {
  strip(`mark[${ATTR}]`);
}

function strip(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
    parent.normalize(); // bölünmüş metin düğümlerini geri birleştir
  });
}

/** Verilen aralığın kestiği mevcut vurguların id'leri. */
export function markIdsIn(range: Range): string[] {
  const ids = new Set<string>();
  const root = range.commonAncestorContainer;
  const scope = (root.nodeType === Node.TEXT_NODE ? root.parentNode : root) as HTMLElement | null;
  if (!scope) return [];

  scope.querySelectorAll(`mark[${ATTR}]`).forEach((el) => {
    if (range.intersectsNode(el)) {
      const id = el.getAttribute(ATTR);
      if (id) ids.add(id);
    }
  });

  // seçim tek bir mark'ın içindeyse yukarıdaki sorgu onu bulamaz
  const anc = (range.startContainer.parentElement)?.closest(`mark[${ATTR}]`);
  const id = anc?.getAttribute(ATTR);
  if (id) ids.add(id);

  return Array.from(ids);
}

/**
 * Vurgunun çevresindeki metni döndürür — tekrar kartında "boşluk doldurma"
 * sorusu bundan kurulur. Cümle sınırında kırpar, yoksa karakter sayısıyla.
 */
export function contextAround(
  root: HTMLElement,
  s: number,
  e: number,
  span = 130
): { before: string; after: string } {
  const full = root.textContent ?? "";
  const rawBefore = full.slice(Math.max(0, s - span), s);
  const rawAfter = full.slice(e, e + span);

  // baştaki parçayı son cümle başlangıcından itibaren al
  const cut = rawBefore.search(/[.!?:;]\s+[^.!?:;]*$/);
  const before = cut >= 0 ? rawBefore.slice(cut + 1) : rawBefore;

  // sondaki parçayı ilk cümle sonunda kes
  const stop = rawAfter.search(/[.!?]\s/);
  const after = stop >= 0 ? rawAfter.slice(0, stop + 1) : rawAfter;

  return { before: before.replace(/\s+/g, " ").trim(), after: after.replace(/\s+/g, " ").trim() };
}

/** İlk <mark> elemanını ekranda görünür hale getirir. */
export function scrollToMark(id: string) {
  const el = document.querySelector(`mark[${ATTR}="${cssEscape(id)}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function markAttr() {
  return ATTR;
}

// CSS.escape her tarayıcıda yok; id'lerimiz zaten [a-z0-9] ama garanti olsun
function cssEscape(v: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(v);
  return v.replace(/["\\]/g, "\\$&");
}
