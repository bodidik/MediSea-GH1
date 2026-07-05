"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Visibility = "V" | "M" | "P";
type SectionBlock = { heading: string; html: string; visibility?: Visibility };
type TopicItem = {
  slug: string;
  branch?: string;
  title: string;
  summary?: string;
  sections?: SectionBlock[];
  section?: string;
};

type QuickMode = "paragraph" | "bullets" | "html";
type BoxTemplateKey = "kritik" | "sinav" | "uyari" | "oneri" | "not";
type TagKey = "onemli" | "sinav_spotu" | "ipucu" | "dikkat";

function escapeHtml(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Site genelinde kullanılan Tailwind kart diliyle uyumlu üretim
function bulletsToHtml(text: string) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•*]\s*/, "")); // - • * başlarını kırp
  if (!lines.length) return "";
  return `<ul class="text-[11px] text-slate-700 space-y-2 list-disc list-inside ml-1">${lines
    .map((l) => `<li>${escapeHtml(l)}</li>`)
    .join("")}</ul>`;
}

function paraToHtml(text: string) {
  const t = String(text || "").trim();
  if (!t) return "";
  return `<p class="text-[11.5px] leading-relaxed mb-3 text-slate-700">${escapeHtml(t)}</p>`;
}

// Sitede kullanılan renkli "bilgi kutusu" şablonları
const BOX_TEMPLATES: Record<BoxTemplateKey, { label: string; build: (title: string, body: string) => string }> = {
  kritik: {
    label: "🔴 Kritik / Acil (koyu kırmızı)",
    build: (t, b) =>
      `<div class="bg-rose-950 border border-rose-800 p-5 rounded-2xl shadow-xl text-white mb-4"><h4 class="font-black text-rose-400 text-[12px] uppercase tracking-widest mb-2">${escapeHtml(t)}</h4><p class="text-[11px] text-rose-100 leading-relaxed">${escapeHtml(b)}</p></div>`,
  },
  sinav: {
    label: "🧭 Sınav Spotu (koyu lacivert)",
    build: (t, b) =>
      `<div class="bg-indigo-900 border border-indigo-700 p-4 rounded-xl shadow-xl text-white mb-4"><h4 class="font-black text-indigo-300 text-[11px] uppercase mb-2">${escapeHtml(t)}</h4><p class="text-[11px] text-indigo-100 leading-relaxed">${escapeHtml(b)}</p></div>`,
  },
  uyari: {
    label: "⚠️ Uyarı (amber)",
    build: (t, b) =>
      `<div class="bg-amber-50 border-l-4 border-amber-500 p-4 shadow-sm mb-4"><h4 class="font-black text-amber-900 text-[11px] uppercase mb-1">${escapeHtml(t)}</h4><p class="text-[11px] text-amber-800 leading-relaxed">${escapeHtml(b)}</p></div>`,
  },
  oneri: {
    label: "✅ Öneri / İyi Uygulama (yeşil)",
    build: (t, b) =>
      `<div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm mb-4"><h4 class="font-black text-emerald-900 text-[11px] uppercase mb-2">${escapeHtml(t)}</h4><p class="text-[11px] text-emerald-800 leading-relaxed">${escapeHtml(b)}</p></div>`,
  },
  not: {
    label: "📎 Nötr Not (gri)",
    build: (t, b) =>
      `<div class="bg-slate-100 border border-slate-300 p-4 rounded-xl shadow-sm mb-4"><h4 class="font-black text-slate-800 text-[11px] uppercase mb-2">${escapeHtml(t)}</h4><p class="text-[11px] text-slate-700 leading-relaxed">${escapeHtml(b)}</p></div>`,
  },
};

// Metnin yanına iliştirilebilen küçük rozet etiketleri
const TAG_TEMPLATES: Record<TagKey, { label: string; html: string }> = {
  onemli: {
    label: "⚠️ Önemli",
    html: `<span class="inline-block bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded ml-2 align-middle">⚠️ Önemli</span>`,
  },
  sinav_spotu: {
    label: "📝 Sınavda Çıktı",
    html: `<span class="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded ml-2 align-middle">📝 Sınavda Çıktı</span>`,
  },
  ipucu: {
    label: "💡 İpucu",
    html: `<span class="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded ml-2 align-middle">💡 İpucu</span>`,
  },
  dikkat: {
    label: "🚨 Dikkat",
    html: `<span class="inline-block bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded ml-2 align-middle">🚨 Dikkat</span>`,
  },
};

export default function InlineTopicEditor({ item }: { item: TopicItem }) {
  const router = useRouter();

  const initialBlocks = useMemo(
    () => (Array.isArray(item.sections) ? item.sections : []),
    [item.sections]
  );

  const [summary, setSummary] = useState(item.summary || "");
  const [blocks, setBlocks] = useState<SectionBlock[]>(initialBlocks);

  // Quick add UI (yeni serbest blok)
  const [mode, setMode] = useState<QuickMode>("bullets");
  const [quickText, setQuickText] = useState("");
  const [blockTitle, setBlockTitle] = useState("Özet");
  const [visibility, setVisibility] = useState<Visibility>("V");
  const [appendTarget, setAppendTarget] = useState<"summary" | "newblock">("newblock");

  // Bilgi kutusu ekleme UI
  const [boxTemplate, setBoxTemplate] = useState<BoxTemplateKey>("uyari");
  const [boxTitle, setBoxTitle] = useState("");
  const [boxBody, setBoxBody] = useState("");
  const [boxTarget, setBoxTarget] = useState<string>("__new__"); // "__new__" ya da blok index'i (string)

  // Hızlı etiket ekleme UI
  const [tagTarget, setTagTarget] = useState<string>(""); // blok index'i (string)
  const [tagKey, setTagKey] = useState<TagKey>("onemli");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function put(payload: any) {
    const branchQS = item.branch ? `&branch=${encodeURIComponent(item.branch)}` : "";
    const r = await fetch(`/api/topics/${encodeURIComponent(item.slug)}?lang=TR${branchQS}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);
    return j;
  }

  async function persistBlocks(nextBlocks: SectionBlock[], successMsg: string) {
    setSaving(true);
    setErr(null);
    setOkMsg(null);
    try {
      await put({ summary, sections: nextBlocks });
      setBlocks(nextBlocks);
      setOkMsg(successMsg);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  async function saveSummaryOnly() {
    setSaving(true);
    setErr(null);
    setOkMsg(null);
    try {
      // Summary-only: sections göndermiyoruz => bloklara dokunmaz
      await put({ summary });
      setOkMsg("Özet kaydedildi.");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  // --- Mevcut blok düzenleme (yazım hatası / cümle değişikliği / silme) ---
  function updateBlockField(index: number, field: "heading" | "html", value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  async function saveOneBlock(index: number) {
    await persistBlocks(blocks, `Blok #${index + 1} kaydedildi.`);
  }

  async function deleteBlock(index: number) {
    if (!window.confirm("Bu bloğu tamamen silmek istediğine emin misin?")) return;
    const next = blocks.filter((_, i) => i !== index);
    await persistBlocks(next, `Blok #${index + 1} silindi.`);
  }

  async function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    await persistBlocks(next, "Sıralama güncellendi.");
  }

  // --- Bilgi kutusu ekleme ---
  async function insertBox() {
    const title = boxTitle.trim();
    const body = boxBody.trim();
    if (!title || !body) {
      setErr("Kutu başlığı ve metni boş olamaz.");
      return;
    }
    const html = BOX_TEMPLATES[boxTemplate].build(title, body);

    if (boxTarget === "__new__") {
      const next = [...blocks, { heading: title, html, visibility: "V" as Visibility }];
      await persistBlocks(next, "Bilgi kutusu yeni blok olarak eklendi.");
    } else {
      const idx = Number(boxTarget);
      const next = blocks.map((b, i) => (i === idx ? { ...b, html: (b.html || "") + html } : b));
      await persistBlocks(next, `Bilgi kutusu Blok #${idx + 1}'in sonuna eklendi.`);
    }
    setBoxTitle("");
    setBoxBody("");
  }

  // --- Hızlı etiket ekleme (mevcut bloğun sonuna küçük rozet) ---
  async function insertTag() {
    if (tagTarget === "") {
      setErr("Önce etiketin ekleneceği bloğu seç.");
      return;
    }
    const idx = Number(tagTarget);
    const tagHtml = TAG_TEMPLATES[tagKey].html;
    const next = blocks.map((b, i) => (i === idx ? { ...b, html: (b.html || "") + tagHtml } : b));
    await persistBlocks(next, `"${TAG_TEMPLATES[tagKey].label}" etiketi Blok #${idx + 1}'e eklendi.`);
  }

  // --- Serbest yeni blok ekleme (mevcut davranış) ---
  function buildQuickHtml() {
    if (mode === "html") return String(quickText || "").trim();
    if (mode === "paragraph") return paraToHtml(quickText);
    return bulletsToHtml(quickText);
  }

  async function applyQuick() {
    const html = buildQuickHtml();
    if (!html) {
      setErr("İçerik boş olamaz.");
      return;
    }

    if (appendTarget === "summary") {
      setSaving(true);
      setErr(null);
      setOkMsg(null);
      try {
        const addition = mode === "bullets" ? "\n" + quickText.trim() : "\n\n" + quickText.trim();
        const nextSummary = (summary || "").trim() ? summary.trim() + addition : quickText.trim();
        await put({ summary: nextSummary });
        setSummary(nextSummary);
        setQuickText("");
        setOkMsg("Özete eklendi.");
        router.refresh();
      } catch (e: any) {
        setErr(e?.message || "Kaydetme hatası");
      } finally {
        setSaving(false);
      }
      return;
    }

    // new block olarak ekle (site kuralı: alan adı "heading", "title" değil)
    const heading = String(blockTitle || "").trim() || "Yeni Blok";
    const nextBlocks: SectionBlock[] = [...blocks, { heading, html, visibility }];
    await persistBlocks(nextBlocks, "Yeni blok eklendi ve kaydedildi.");
    setQuickText("");
  }

  return (
    <section className="p-4 md:p-6 bg-neutral-50 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-neutral-700">
          İçerik Paneli (TR)
        </div>
        {saving ? <div className="text-xs opacity-70">Kaydediliyor…</div> : null}
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
      {okMsg ? <div className="text-xs text-green-700">{okMsg}</div> : null}

      {/* Özet */}
      <div className="space-y-1 border rounded-xl p-3 bg-white">
        <div className="text-xs font-medium text-neutral-700">Konu özeti</div>
        <textarea
          className="w-full border rounded p-2 text-sm bg-white"
          rows={3}
          placeholder="Özeti buraya yapıştır…"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={saveSummaryOnly}
            disabled={saving}
            className="text-sm px-3 py-1 rounded border bg-white hover:bg-neutral-100"
          >
            Özeti Kaydet
          </button>
        </div>
      </div>

      {/* Mevcut Bloklar: cümle/yazım düzeltme, silme, sıralama, etiket ekleme */}
      <div className="border rounded-xl p-3 bg-white space-y-3">
        <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
          Mevcut Bloklar ({blocks.length})
        </div>
        <p className="text-[11px] text-neutral-500">
          Bir cümleyi beğenmediysen, yazım hatası varsa veya HTML'i elden geçirmek istersen doğrudan
          aşağıdan düzenleyip "Kaydet" diyebilirsin.
        </p>

        {blocks.length === 0 && (
          <div className="text-xs text-neutral-400 italic">Henüz hiç blok yok.</div>
        )}

        {blocks.map((b, i) => (
          <div key={i} className="border rounded-lg p-3 bg-neutral-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-neutral-400">#{i + 1}</span>
              <input
                className="flex-1 border rounded p-1.5 text-sm bg-white font-semibold"
                value={b.heading}
                onChange={(e) => updateBlockField(i, "heading", e.target.value)}
              />
              <button
                onClick={() => moveBlock(i, -1)}
                disabled={saving || i === 0}
                title="Yukarı taşı"
                className="text-xs px-2 py-1 rounded border bg-white hover:bg-neutral-100 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveBlock(i, 1)}
                disabled={saving || i === blocks.length - 1}
                title="Aşağı taşı"
                className="text-xs px-2 py-1 rounded border bg-white hover:bg-neutral-100 disabled:opacity-30"
              >
                ↓
              </button>
            </div>

            <textarea
              className="w-full border rounded p-2 text-xs font-mono bg-white"
              rows={4}
              value={b.html}
              onChange={(e) => updateBlockField(i, "html", e.target.value)}
            />

            <div className="flex justify-between items-center">
              <button
                onClick={() => deleteBlock(i)}
                disabled={saving}
                className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 bg-white hover:bg-red-50"
              >
                Sil
              </button>
              <button
                onClick={() => saveOneBlock(i)}
                disabled={saving}
                className="text-xs px-3 py-1 rounded border bg-white hover:bg-neutral-100 font-semibold"
              >
                Bu Bloğu Kaydet
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bilgi Kutusu Ekle: hazır renkli şablonlar */}
      <div className="border rounded-xl p-3 bg-white space-y-2">
        <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
          Bilgi Kutusu Ekle
        </div>
        <p className="text-[11px] text-neutral-500">
          Sitedeki renkli kutu stillerinden birini seç, başlık ve metni yaz; yeni bir blok olarak ya
          da mevcut bir bloğun sonuna eklenebilir.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select
            className="border rounded p-2 text-sm bg-white"
            value={boxTemplate}
            onChange={(e) => setBoxTemplate(e.target.value as BoxTemplateKey)}
          >
            {(Object.keys(BOX_TEMPLATES) as BoxTemplateKey[]).map((k) => (
              <option key={k} value={k}>
                {BOX_TEMPLATES[k].label}
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2 text-sm bg-white"
            value={boxTarget}
            onChange={(e) => setBoxTarget(e.target.value)}
          >
            <option value="__new__">Yeni blok olarak ekle</option>
            {blocks.map((b, i) => (
              <option key={i} value={String(i)}>
                Blok #{i + 1} sonuna ekle — {b.heading}
              </option>
            ))}
          </select>
        </div>

        <input
          className="w-full border rounded p-2 text-sm bg-white"
          placeholder="Kutu başlığı (ör. Sınav Spotu, Kritik Uyarı...)"
          value={boxTitle}
          onChange={(e) => setBoxTitle(e.target.value)}
        />
        <textarea
          className="w-full border rounded p-2 text-sm bg-white"
          rows={3}
          placeholder="Kutu metni…"
          value={boxBody}
          onChange={(e) => setBoxBody(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={insertBox}
            disabled={saving}
            className="text-sm px-3 py-1 rounded border bg-white hover:bg-neutral-100"
          >
            Kutuyu Ekle ve Kaydet
          </button>
        </div>
      </div>

      {/* Hızlı Etiket Ekle: metnin yanına küçük rozet */}
      <div className="border rounded-xl p-3 bg-white space-y-2">
        <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
          Hızlı Etiket Ekle
        </div>
        <p className="text-[11px] text-neutral-500">
          "Önemli", "Sınavda Çıktı" gibi küçük bir rozeti seçtiğin bloğun sonuna ekler.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_120px] gap-2">
          <select
            className="border rounded p-2 text-sm bg-white"
            value={tagTarget}
            onChange={(e) => setTagTarget(e.target.value)}
          >
            <option value="">Blok seç…</option>
            {blocks.map((b, i) => (
              <option key={i} value={String(i)}>
                Blok #{i + 1} — {b.heading}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2 text-sm bg-white"
            value={tagKey}
            onChange={(e) => setTagKey(e.target.value as TagKey)}
          >
            {(Object.keys(TAG_TEMPLATES) as TagKey[]).map((k) => (
              <option key={k} value={k}>
                {TAG_TEMPLATES[k].label}
              </option>
            ))}
          </select>
          <button
            onClick={insertTag}
            disabled={saving}
            className="text-sm px-3 py-1 rounded border bg-white hover:bg-neutral-100"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* Serbest Yeni Blok Ekle */}
      <div className="border rounded-xl p-3 bg-white space-y-2">
        <div className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
          Serbest Yeni Blok / Özete Ekleme
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[160px_160px_1fr_120px] gap-2">
          <select
            className="border rounded p-2 text-sm bg-white"
            value={mode}
            onChange={(e) => setMode(e.target.value as QuickMode)}
          >
            <option value="bullets">Madde listesi</option>
            <option value="paragraph">Paragraf</option>
            <option value="html">HTML</option>
          </select>

          <select
            className="border rounded p-2 text-sm bg-white"
            value={appendTarget}
            onChange={(e) => setAppendTarget(e.target.value as any)}
          >
            <option value="newblock">Yeni blok</option>
            <option value="summary">Özete ekle</option>
          </select>

          <input
            className="border rounded p-2 text-sm bg-white"
            placeholder="Blok başlığı (Yeni blok seçiliyse)"
            value={blockTitle}
            onChange={(e) => setBlockTitle(e.target.value)}
            disabled={appendTarget !== "newblock"}
          />

          <select
            className="border rounded p-2 text-sm bg-white"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            disabled={appendTarget !== "newblock"}
          >
            <option value="V">V</option>
            <option value="M">M</option>
            <option value="P">P</option>
          </select>
        </div>

        <textarea
          className="w-full border rounded p-2 text-sm bg-white"
          rows={6}
          placeholder={
            mode === "bullets"
              ? "- Madde 1\n- Madde 2\n- Madde 3"
              : mode === "paragraph"
                ? "Tek paragraf metin yapıştır…"
                : "<p>HTML yapıştır…</p>"
          }
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
        />

        <div className="flex justify-end">
          <button
            onClick={applyQuick}
            disabled={saving}
            className="text-sm px-3 py-1 rounded border bg-white hover:bg-neutral-100"
          >
            Ekle ve Kaydet
          </button>
        </div>

        <div className="text-[11px] opacity-70">
          Not: "Özete ekle" düz metin olarak ekler. "Yeni blok" HTML üretip sections'a ekler.
        </div>
      </div>
    </section>
  );
}
