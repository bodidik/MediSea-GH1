"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Visibility = "V" | "M" | "P";
type SectionBlock = { title: string; html: string; visibility?: Visibility };
type TopicItem = {
  slug: string;
  title: string;
  summary?: string;
  sections?: SectionBlock[];
  section?: string;
};

type QuickMode = "paragraph" | "bullets" | "html";

function escapeHtml(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bulletsToHtml(text: string) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•*]\s*/, "")); // - • * başlarını kırp
  if (!lines.length) return "";
  return `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`;
}

function paraToHtml(text: string) {
  const t = String(text || "").trim();
  if (!t) return "";
  return `<p>${escapeHtml(t)}</p>`;
}

export default function InlineTopicEditor({ item }: { item: TopicItem }) {
  const router = useRouter();

  const initialBlocks = useMemo(
    () => (Array.isArray(item.sections) ? item.sections : []),
    [item.sections]
  );

  const [summary, setSummary] = useState(item.summary || "");
  const [blocks, setBlocks] = useState<SectionBlock[]>(initialBlocks);

  // Quick add UI
  const [mode, setMode] = useState<QuickMode>("bullets");
  const [quickText, setQuickText] = useState("");
  const [blockTitle, setBlockTitle] = useState("Özet");
  const [visibility, setVisibility] = useState<Visibility>("V");
  const [appendTarget, setAppendTarget] = useState<"summary" | "newblock">("newblock");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function put(payload: any) {
    const r = await fetch(`/api/topics/${encodeURIComponent(item.slug)}?lang=TR`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);
    return j;
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

    setSaving(true);
    setErr(null);
    setOkMsg(null);

    try {
      if (appendTarget === "summary") {
        // summary içine düz metin eklemek daha güvenli:
        // - summary normalde plain text; ama sen istersen burada \n\n ekleyebilirsin
        const addition =
          mode === "bullets"
            ? "\n" + quickText.trim()
            : "\n\n" + quickText.trim();

        const nextSummary = (summary || "").trim()
          ? (summary.trim() + addition)
          : quickText.trim();

        await put({ summary: nextSummary });
        setSummary(nextSummary);
        setQuickText("");
        setOkMsg("Özete eklendi.");
        router.refresh();
        return;
      }

      // new block olarak ekle
      const title = String(blockTitle || "").trim() || "Yeni Blok";
      const nextBlocks: SectionBlock[] = [
        ...blocks,
        { title, html, visibility },
      ];

      await put({ summary, sections: nextBlocks });
      setBlocks(nextBlocks);
      setQuickText("");
      setOkMsg("Yeni blok eklendi ve kaydedildi.");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border rounded-xl p-4 bg-neutral-50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-neutral-700">
          İçerik Paneli (TR)
        </div>
        {saving ? <div className="text-xs opacity-70">Kaydediliyor…</div> : null}
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
      {okMsg ? <div className="text-xs text-green-700">{okMsg}</div> : null}

      {/* Summary */}
      <div className="space-y-1">
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

      {/* Quick add */}
      <div className="border-t pt-3 space-y-2">
        <div className="text-xs font-medium text-neutral-700">Hızlı Ekle</div>

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
          Not: “Özete ekle” düz metin olarak ekler. “Yeni blok” HTML üretip sections’a ekler.
        </div>
      </div>
    </section>
  );
}
