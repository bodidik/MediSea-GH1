"use client";
// C:\Users\hucig\Medknowledge\web\app\(site)\calisma-alanim\page.tsx
//
// Tüm sayfalardaki vurgu ve notların tek listesi.
// Veri tarayıcıda (localStorage) durduğu için sayfa istemci tarafında çalışır.

import { useEffect, useMemo, useRef, useState } from "react";
import { aramaEslesir } from "@/app/lib/arama";
import Link from "next/link";
import { collectAll, purge, toMarkdown, type StudyEntry } from "@/app/lib/study-index";
import StrokePreview, { type Stroke } from "@/app/components/StrokePreview";
import StudyBackup from "@/app/components/StudyBackup";
import StudyCoverage from "@/app/components/StudyCoverage";
import SyncDurumu from "@/app/components/SyncDurumu";

type Filter = "all" | "marks" | "notes";

const SWATCH: Record<string, string> = {
  y: "#FACC15",
  g: "#4ADE80",
  b: "#60A5FA",
  p: "#F472B6",
  bold: "#94A3B8",
  u: "#94A3B8",
};

export default function StudyWorkspace() {
  const [entries, setEntries] = useState<StudyEntry[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setEntries(collectAll());
  }, []);

  const totals = useMemo(() => {
    const list = entries ?? [];
    return {
      sayfa: list.length,
      vurgu: list.reduce((n, e) => n + e.marks.length, 0),
      not: list.filter((e) => e.note?.text?.trim()).length,
      cizim: list.reduce((n, e) => n + (e.note?.strokes?.length ?? 0), 0),
    };
  }, [entries]);

  const shown = useMemo(() => {
    let list = entries ?? [];
    if (filter === "marks") list = list.filter((e) => e.marks.length > 0);
    if (filter === "notes") list = list.filter((e) => e.note);
    /**
     * Arama AKSAN KATLAR — `toLocaleLowerCase("tr")` tek başına yetmiyor.
     *
     * Ölçüldü: altı gerçekçi sorgunun DÖRDÜ kaçıyordu, çünkü küçük harfe
     * çevirmek `ö`yü `o` yapmıyor. Kullanıcı kendi notunu arıyor ve
     * bulamıyordu:
     *
     *   "gogus"  → "Göğüs Hastalıkları"    bulunamıyordu
     *   "bobrek" → "Böbrek Yetmezliği"     bulunamıyordu
     *   "sok"    → "Şok ve Sıvı Tedavisi"  bulunamıyordu
     *   "colyak" → "Çölyak Hastalığı"      bulunamıyordu
     *
     * `aramaEslesir` iki tarafı da aynı kuralla normalleştiriyor (küçük
     * harf + `ı→i` + NFD ile birleşik işaretleri sökme), yani Türkçe
     * karakter yazmayan klavyede de çalışıyor.
     *
     * BOŞ SORGU TUZAĞI: `aramaEslesir` boş sorguda bilerek `false` döner —
     * doğrudan `.filter()` içine konursa listeyi tümden boşaltır (`/tools`
     * bir tur böyle boş kaldı). Buradaki `if (aranan)` koruması o yüzden
     * ŞART ve kaldırılmamalı.
     */
    const aranan = q.trim();
    if (aranan) {
      list = list.filter(
        (e) =>
          aramaEslesir(e.title, aranan) ||
          e.marks.some((m) => aramaEslesir(m.t, aranan)) ||
          aramaEslesir(e.note?.text ?? "", aranan)
      );
    }
    return list;
  }, [entries, filter, q]);

  const download = () => {
    const md = toMarkdown(entries ?? []);
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "calisma-notlarim.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Silinen kartın odağı KAYBOLMASIN.
   *
   * Ölçüldü: ortadaki kayıt silindiğinde `document.activeElement` `<body>`
   * oluyordu — düğme DOM'dan kalkınca odak kök ögeye düşüyor. Klavyeyle
   * gezen kullanıcı yerini tamamen kaybediyor ve listeye dönmek için
   * sayfayı en baştan Tab'lamak zorunda kalıyor. Aynı kural not defteri
   * için zaten yazılıydı (kapanışta odak açan düğmeye döner).
   *
   * Odak listedeki bir sonraki "Sil" düğmesine gidiyor; kayıt kalmadıysa
   * listenin kendisine (`tabIndex={-1}`), çünkü orada artık düğme yok.
   */
  const listeRef = useRef<HTMLDivElement>(null);
  const [odakBekliyor, setOdakBekliyor] = useState(false);

  /**
   * Odak taşıma ETKİDE yapılır, silme anında DEĞİL.
   *
   * İlk deneme `requestAnimationFrame` ile yapıldı ve ÖLÇÜMDE ÇALIŞMADI:
   * odak yine `<body>`ye düşüyordu. Sebep, kare React'in commit'inden önce
   * gelebiliyor — o anda eski düğme hâlâ DOM'da, yenisi henüz yok.
   * Bayrağı duruma koyup `entries` değiştikten SONRA çalışan bir etkide
   * odaklamak sırayı garantiliyor.
   *
   * Ref LİSTEDE değil, listeyi de boş durumu da kapsayan dış sarmalayıcıda:
   * son kayıt silindiğinde liste tümden kalkıyor ve ref `null` oluyordu —
   * ölçüldü, odak yine `<body>`ye düşüyordu. Dış sarmalayıcı her iki dalda
   * da duruyor.
   */
  useEffect(() => {
    if (!odakBekliyor) return;
    setOdakBekliyor(false);
    const kalan = listeRef.current?.querySelectorAll<HTMLButtonElement>("[data-sil]");
    if (kalan && kalan.length) kalan[0].focus();
    else listeRef.current?.focus();
  }, [entries, odakBekliyor]);

  const remove = (path: string, title: string) => {
    if (!confirm(`"${title}" sayfasındaki tüm vurgu ve notlar silinsin mi?`)) return;
    purge(path);
    setEntries(collectAll());
    setOdakBekliyor(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-4 py-8 font-sans sm:px-6">
      <div ref={listeRef} tabIndex={-1} className="mx-auto max-w-5xl outline-none">

        {/* Başlık */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-blue-950" />
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-blue-950 sm:text-3xl">
                Çalışma Alanım
              </h1>
              {/* "bu cihazda saklanır" sabit yazısı kaldırıldı: giriş yapmış
                  kullanıcı için doğru değil, veri sunucuya da gidiyor. Gerçek
                  durum aşağıdaki göstergede, canlı olarak. */}
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Vurgularım ve notlarım
              </p>
            </div>
          </div>

          {totals.sayfa > 0 && (
            <div className="flex flex-wrap gap-2">
              {totals.vurgu > 0 && (
                <Link
                  href="/tekrar"
                  className="rounded-full bg-yellow-400 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-blue-950 transition-all hover:bg-yellow-300 active:scale-95"
                >
                  ⚡ Tekrar et
                </Link>
              )}
              <button
                onClick={download}
                className="rounded-full bg-blue-950 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-95"
              >
                ↓ Markdown indir
              </button>
            </div>
          )}
        </div>

        {/* Verinin nerede durduğu — girişsizken uyarı, girişliyken güvence */}
        <div className="mb-6">
          <SyncDurumu genis />
        </div>

        {/* Yükleniyor */}
        {entries === null && (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
            Yükleniyor…
          </div>
        )}

        {/* Boş durum */}
        {entries !== null && entries.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center sm:p-16">
            <div className="mb-3 text-4xl">🖍</div>
            <h2 className="mb-2 text-lg font-black uppercase italic tracking-tight text-blue-950">
              Henüz not almadın
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-500">
              Bir konu sayfasında metni seçtiğinde vurgulama çubuğu çıkar. Sağ kenardaki{" "}
              <span className="font-bold text-slate-700">📝 Not</span> tutamağıyla da o sayfaya
              özel yazı ve el çizimi notu tutabilirsin.
            </p>
            <Link
              href="/topics"
              className="inline-block rounded-full bg-blue-950 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-95"
            >
              Kütüphaneye git →
            </Link>
          </div>
        )}

        {/* Kapsama — hangi branşta neye hiç bakılmadığını gösterir */}
        {entries !== null && <StudyCoverage />}

        {/* Yedekleme — boş durumda DA görünür: yeni cihaza geçen kullanıcı
            buraya boş ekranla düşer, geri yükleme yolu burada olmazsa
            yedeğini hiç kullanamaz. */}
        {entries !== null && <StudyBackup onChanged={() => setEntries(collectAll())} />}

        {/* İçerik */}
        {entries !== null && entries.length > 0 && (
          <>
            {/* Özet + filtre */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {[
                  [totals.sayfa, "Sayfa"],
                  [totals.vurgu, "Vurgu"],
                  [totals.not, "Not"],
                  [totals.cizim, "Çizgi"],
                ].map(([n, label]) => (
                  <div key={label as string} className="px-3.5 py-2 text-center">
                    <div className="text-base font-black leading-none text-blue-950">{n}</div>
                    <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(
                  [
                    ["all", "Tümü"],
                    ["marks", "Vurgular"],
                    ["notes", "Notlar"],
                  ] as [Filter, string][]
                ).map(([f, label]) => (
                  <button
                    key={f}
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f ? "bg-blue-950 text-white" : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara…"
                className="min-w-[140px] flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] text-slate-700 outline-none transition-colors placeholder:text-slate-300 focus:border-blue-400"
              />
            </div>

            {shown.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400">
                Bu filtreyle eşleşen kayıt yok.
              </div>
            )}

            <div className="space-y-3">
              {shown.map((e) => (
                <EntryCard key={e.path} entry={e} onRemove={remove} />
              ))}
            </div>

            {/* Buradaki "yalnızca bu tarayıcıda tutulur" satırı kaldırıldı:
                giriş yapmış kullanıcı için YANLIŞ, veri sunucuya da gidiyor.
                Aynı iddia yukarıdaki alt başlıktan da bu sebeple çıkarılmıştı
                (bkz. sayfa başındaki not), bu kopya atlanmış. Verinin nerede
                durduğunu SyncDurumu canlı olarak söylüyor, yedekleme yolunu
                da StudyBackup anlatıyor; üçüncü ve sabit bir tekrar
                gereksizdi. */}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Tek sayfa kartı ─────────────────────────────────────────────────────── */

function EntryCard({
  entry,
  onRemove,
}: {
  entry: StudyEntry;
  onRemove: (path: string, title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const noteText = entry.note?.text?.trim() ?? "";
  const strokes = entry.note?.strokes ?? [];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {entry.branch && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                {entry.branch}
              </span>
            )}
            {entry.at > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                {new Date(entry.at).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {/* inline-block + dikey boşluk: satır yüksekliği tek başına 17px
              kalıyordu, dokunma hedefi eşiği 24px. */}
          <Link
            href={entry.path}
            className="inline-block py-1 text-sm font-black uppercase italic leading-tight tracking-tight text-blue-950 hover:text-blue-600"
          >
            {entry.title}
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {entry.marks.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="flex -space-x-1">
                  {Array.from(new Set(entry.marks.map((m) => m.st)))
                    .slice(0, 4)
                    .map((st) => (
                      <span
                        key={st}
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-white"
                        style={{ background: SWATCH[st] ?? "#94A3B8" }}
                      />
                    ))}
                </span>
                {entry.marks.length} vurgu
              </span>
            )}
            {noteText && <span>✎ {noteText.length} karakter not</span>}
            {strokes.length > 0 && <span>✍ {strokes.length} çizgi</span>}
          </div>
        </div>

        {strokes.length > 0 && <StrokeThumb strokes={strokes} />}

        {/* Aralık bilerek geniş: küçük ve bitişik iki düğmeden biri yıkıcı.
            Silme onay soruyor ama yanlış tıklamayı hiç yaşatmamak daha iyi. */}
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            {open ? "Kapat" : "Aç"}
          </button>
          <button
            onClick={() => onRemove(entry.path, entry.title)}
            data-sil
            /* Üç kayıtta üç düğmenin de adı yalnızca "Sil"di. Düğmeler
               arasında gezen ekran okuyucu kullanıcısı hangisini sildiğini
               bilemiyordu. `title` ad olmuyor: içerik boş değilse hesaplama
               sırası onu hiç kullanmıyor. */
            aria-label={`${entry.title} sayfasındaki her şeyi sil`}
            title="Bu sayfadaki her şeyi sil"
            className="rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            Sil
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 p-4">
          {entry.marks.length > 0 && (
            <div>
              <h3 className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Vurgular
              </h3>
              <ul className="space-y-1.5">
                {entry.marks.map((m) => (
                  <li key={m.id} className="flex gap-2">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: SWATCH[m.st] ?? "#94A3B8" }}
                    />
                    <span className="text-[14px] leading-snug text-slate-700">
                      {m.t.replace(/\s+/g, " ").trim()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {noteText && (
            <div>
              <h3 className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Not
              </h3>
              <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-relaxed text-slate-700">
                {noteText}
              </pre>
            </div>
          )}

          <Link
            href={entry.path}
            className="inline-block rounded-full bg-blue-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900"
          >
            Sayfaya git →
          </Link>
        </div>
      )}
    </article>
  );
}

/* ── El çizimi önizlemesi ────────────────────────────────────────────────── */

function StrokeThumb({ strokes }: { strokes: Stroke[] }) {
  return (
    <div className="hidden h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white sm:block">
      <StrokePreview strokes={strokes} width={64} maxRatio={0.7} strokeScale={2.5} className="w-full" />
    </div>
  );
}
