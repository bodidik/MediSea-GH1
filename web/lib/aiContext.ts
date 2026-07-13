// FILE: web/lib/aiContext.ts
// Bir konunun içeriğini (+ varsa ek kaynak dosyasını) AI için düz metin bağlama çevirir.
import fs from "fs";
import path from "path";

const MAX_CONTEXT = 14000; // karakter — token maliyetini sınırlamak için

interface Satir { yil?: string; metin?: string }
interface TabloSatir { hucreler?: string[] }
interface Blok {
  tip: string;
  baslik?: string;
  metin?: string;
  tur?: string;
  satirlar?: (Satir | TabloSatir)[];
  kolonlar?: string[];
}
interface Konu {
  meta?: { baslik?: string; altbaslik?: string };
  icerik?: Blok[];
}

function guvenli(p: string) {
  return /^[a-zA-Z0-9-]+$/.test(p);
}

function bloklariMetne(bloklar: Blok[]): string {
  const parcalar: string[] = [];
  for (const b of bloklar) {
    if (b.baslik) parcalar.push(`## ${b.baslik}`);
    if (b.tip === "metin" && b.satirlar) {
      for (const s of b.satirlar as Satir[]) {
        if (s.metin) parcalar.push((s.yil ? `[${s.yil}] ` : "") + s.metin);
      }
    } else if (b.tip === "tablo" && b.satirlar) {
      if (b.kolonlar?.length) parcalar.push(b.kolonlar.join(" | "));
      for (const s of b.satirlar as TabloSatir[]) {
        if (s.hucreler?.length) parcalar.push(s.hucreler.join(" | "));
      }
    } else if (b.tip === "bilgi_kutusu" && b.metin) {
      parcalar.push(`(${b.tur || "bilgi"}) ${b.metin}`);
    }
  }
  // Markdown vurgu işaretlerini temizle
  return parcalar.join("\n").replace(/\*\*/g, "");
}

export interface TopicContext {
  baslik: string;
  context: string;
}

export function buildTopicContext(branch: string, topic: string): TopicContext | null {
  if (!guvenli(branch) || !guvenli(topic)) return null;

  const konuYolu = path.join(
    process.cwd(), "content", "premium", "ydus", "topics", branch, `${topic}.json`
  );
  let konu: Konu;
  try {
    konu = JSON.parse(fs.readFileSync(konuYolu, "utf-8")) as Konu;
  } catch {
    return null;
  }

  const baslik = konu.meta?.baslik || topic;
  const parcalar: string[] = [];
  if (konu.meta?.altbaslik) parcalar.push(konu.meta.altbaslik);
  if (konu.icerik?.length) parcalar.push(bloklariMetne(konu.icerik));

  // Ek kaynak dosyası (opsiyonel): content/premium/ydus/kaynaklar/{branch}/{topic}.md
  const kaynakYolu = path.join(
    process.cwd(), "content", "premium", "ydus", "kaynaklar", branch, `${topic}.md`
  );
  try {
    const ek = fs.readFileSync(kaynakYolu, "utf-8").trim();
    if (ek) parcalar.push(`\n### EK KAYNAKLAR\n${ek}`);
  } catch {
    // ek kaynak yoksa sorun değil
  }

  let context = parcalar.join("\n\n").trim();
  if (context.length > MAX_CONTEXT) context = context.slice(0, MAX_CONTEXT) + "\n…";

  return { baslik, context };
}
