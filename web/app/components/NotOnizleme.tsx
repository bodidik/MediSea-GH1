"use client";
// Not defterinin biçimlenmiş görünümü (NotePanel → "Önizle").
//
// Not DÜZ METİN olarak saklanır (yedek, senkron, Markdown dışa aktarımı
// değişmesin); burada küçük bir Markdown alt kümesi React ögelerine çevrilir.
// `dangerouslySetInnerHTML` YOK: kullanıcının yazdığı `<` karakteri metin
// olarak kalır.
//
//   ## başlık · - madde · - [ ] / - [x] yapılacak · > alıntı · **kalın**
//   §[Bölüm başlığı] — okunan sayfadaki o başlığa kaydırır

import type { ReactNode } from "react";

/** Okuma alanındaki bölüm başlıkları (h2/h3), sayfa sırasıyla. */
function basliklar(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-readable] h2, [data-readable] h3")
  ).filter((h) => (h.textContent || "").trim().length > 0);
}

/** Başlık adı — konu sayfasındaki bağlantı işareti ("#") ayıklanır. */
const ad = (h: HTMLElement) =>
  (h.textContent || "").replace(/\s+/g, " ").trim().replace(/^#\s*/, "");

/**
 * Şu an okunan bölüm: görünümün üst kısmını (başlık çubuğunun altı) geçmiş
 * son başlık. Hiçbiri geçmediyse ilk başlık; başlık yoksa null.
 */
export function gorunenBolum(): string | null {
  const hs = basliklar();
  if (!hs.length) return null;
  let secilen = hs[0];
  for (const h of hs) {
    if (h.getBoundingClientRect().top <= 140) secilen = h;
    else break;
  }
  return ad(secilen) || null;
}

/** Başlığa kaydır; bulunamazsa false (bağlantı başka sayfanın bölümüne ait). */
function bolumeGit(hedef: string): boolean {
  const h = basliklar().find((x) => ad(x) === hedef);
  if (!h) return false;
  h.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/** Satır içi: **kalın** ve §[bölüm]. */
function satirIci(s: string, anahtar: string): ReactNode[] {
  const parcalar: ReactNode[] = [];
  const desen = /\*\*([^*]+)\*\*|§\[([^\]]+)\]/g;
  let son = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = desen.exec(s))) {
    if (m.index > son) parcalar.push(s.slice(son, m.index));
    if (m[1] !== undefined) {
      parcalar.push(<strong key={`${anahtar}-${i++}`} className="font-bold text-slate-900">{m[1]}</strong>);
    } else {
      const hedef = m[2];
      parcalar.push(
        <button
          key={`${anahtar}-${i++}`}
          type="button"
          onClick={(e) => {
            if (!bolumeGit(hedef)) e.currentTarget.title = "Bu bölüm bu sayfada bulunamadı";
          }}
          className="mx-0.5 inline rounded-md bg-blue-50 px-1.5 py-0.5 text-[12px] font-bold text-blue-800 underline-offset-2 hover:underline"
        >
          § {hedef}
        </button>
      );
    }
    son = desen.lastIndex;
  }
  if (son < s.length) parcalar.push(s.slice(son));
  return parcalar;
}

export default function NotOnizleme({
  metin,
  gorevCevir,
}: {
  metin: string;
  /** Satır numarasıyla çağrılır: [ ] ↔ [x] */
  gorevCevir: (satir: number) => void;
}) {
  if (!metin.trim()) {
    return <p className="text-[13px] text-slate-500">Henüz not yok.</p>;
  }
  const satirlar = metin.split("\n");
  const ogeler: ReactNode[] = [];

  satirlar.forEach((satir, n) => {
    const k = `s${n}`;
    let m: RegExpMatchArray | null;
    if (!satir.trim()) {
      ogeler.push(<div key={k} className="h-2" />);
    } else if ((m = satir.match(/^#{1,3}\s+(.*)$/))) {
      ogeler.push(
        <h4 key={k} className="mt-2 font-serif text-[15px] font-bold text-blue-950">
          {satirIci(m[1], k)}
        </h4>
      );
    } else if ((m = satir.match(/^\s*- \[([ xX])\]\s?(.*)$/))) {
      const bitti = m[1] !== " ";
      ogeler.push(
        <label key={k} className="flex cursor-pointer items-start gap-2 py-0.5 text-[14px] leading-snug text-slate-700">
          <input
            type="checkbox"
            checked={bitti}
            onChange={() => gorevCevir(n)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-800"
          />
          <span className={bitti ? "text-slate-500 line-through" : ""}>{satirIci(m[2], k)}</span>
        </label>
      );
    } else if ((m = satir.match(/^\s*[-*]\s+(.*)$/))) {
      ogeler.push(
        <div key={k} className="flex gap-2 py-0.5 text-[14px] leading-snug text-slate-700">
          <span aria-hidden="true" className="text-slate-400">•</span>
          <span>{satirIci(m[1], k)}</span>
        </div>
      );
    } else if ((m = satir.match(/^>\s?(.*)$/))) {
      ogeler.push(
        <blockquote key={k} className="my-0.5 border-l-4 border-sky-300 bg-sky-50 px-2.5 py-1 text-[13px] italic leading-snug text-slate-700">
          {satirIci(m[1], k)}
        </blockquote>
      );
    } else {
      ogeler.push(
        <p key={k} className="text-[14px] leading-relaxed text-slate-700">
          {satirIci(satir, k)}
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{ogeler}</div>;
}
