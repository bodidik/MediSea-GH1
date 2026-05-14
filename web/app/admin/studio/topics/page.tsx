// FILE: web/app/admin/studio/topics/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Visibility = "V" | "M" | "P";
type SectionBlock = { title: string; html: string; visibility?: Visibility };

type TopicItem = {
  slug: string;
  title: string;
  section?: string;
  lang?: "TR" | "EN";
  summary?: string;
  sections?: SectionBlock[];
  tags?: string[];
  references?: { label: string; url?: string; year?: number }[];
  updatedAt?: string;
};

function normBlocks(x: any): SectionBlock[] {
  const arr = Array.isArray(x) ? x : [];
  return arr.map((b) => ({
    title: String(b?.title || "").trim() || "Bölüm",
    html: String(b?.html || ""),
    visibility: (["V", "M", "P"].includes(String(b?.visibility)) ? b.visibility : "V") as Visibility,
  }));
}

function safeLower(s: any) {
  return String(s || "").toLowerCase().trim();
}

function parseTags(tagsText: string): string[] {
  return tagsText
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseRefs(refsText: string): any[] {
  // JSON array bekliyoruz. Bozuksa boş döndür.
  try {
    const parsed = JSON.parse(refsText || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminTopicsStudioSingle() {
  // target
  const [slug, setSlug] = useState("");
  const [section, setSection] = useState(""); // opsiyonel ama faydalı (canonical için)
  const [lang, setLang] = useState<"TR" | "EN">("TR");

  // load/save state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // loaded item
  const [item, setItem] = useState<TopicItem | null>(null);

  // editable fields
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [blocks, setBlocks] = useState<SectionBlock[]>([]);
  const [tagsText, setTagsText] = useState("");
  const [refsText, setRefsText] = useState("[]");

  // append tool
  const [appendBlock, setAppendBlock] = useState<string>("");
  const [appendMode, setAppendMode] = useState<"after" | "before">("after");
  const [appendHtml, setAppendHtml] = useState<string>("");

  const canLoad = useMemo(() => slug.trim().length > 0, [slug]);

  function buildQs() {
    const qs = new URLSearchParams();
    qs.set("lang", lang);
    if (section.trim()) qs.set("section", safeLower(section));
    return qs;
  }

  async function load() {
    if (!canLoad) return;

    setLoading(true);
    setErr(null);
    setOkMsg(null);
    setItem(null);

    try {
      const qs = buildQs();
      const r = await fetch(`/api/topics/${encodeURIComponent(slug.trim())}?${qs.toString()}`, {
        cache: "no-store",
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok || !j?.item) {
        throw new Error(j?.error || j?.message || `Load failed (HTTP ${r.status})`);
      }

      const it: TopicItem = j.item;

      setItem(it);
      setTitle(String(it.title || ""));
      setSummary(String(it.summary || ""));
      const nb = normBlocks(it.sections);
      setBlocks(nb);
      setTagsText(Array.isArray(it.tags) ? it.tags.join(", ") : "");
      setRefsText(JSON.stringify(Array.isArray(it.references) ? it.references : [], null, 2));

      // section boşsa dokümandan doldur
      if (!section.trim() && it.section) setSection(String(it.section));

      // append default
      const first = (nb?.[0]?.title || "").trim();
      setAppendBlock(first || "");
      setAppendHtml("");

      setOkMsg("Yüklendi.");
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }

  async function save(nextBlocks?: SectionBlock[]) {
    if (!item) return;

    setSaving(true);
    setErr(null);
    setOkMsg(null);

    try {
      const qs = buildQs();

      const payload = {
        title: title.trim(),
        summary,
        sections: (nextBlocks || blocks).map((b) => ({
          title: String(b.title || "").trim() || "Bölüm",
          html: String(b.html || ""),
          visibility: (b.visibility || "V") as Visibility,
        })),
        tags: parseTags(tagsText),
        references: parseRefs(refsText),
      };

      const r = await fetch(`/api/topics/${encodeURIComponent(item.slug)}?${qs.toString()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || j?.message || `Save failed (HTTP ${r.status})`);
      }

      const next = j?.item ? (j.item as TopicItem) : item;
      setItem(next);
      if (j?.item?.sections) setBlocks(normBlocks(j.item.sections));
      setOkMsg("Kaydedildi.");
    } catch (e: any) {
      setErr(e?.message || "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  function applyAppend(blocksIn: SectionBlock[]) {
    const target = appendBlock.trim();
    const add = appendHtml.trim();
    if (!target || !add) return blocksIn;

    return blocksIn.map((b) => {
      if ((b.title || "").trim() !== target) return b;
      const cur = String(b.html || "");
      const nextHtml = appendMode === "before" ? `${add}\n${cur}` : `${cur}\n${add}`;
      return { ...b, html: nextHtml };
    });
  }

  async function appendAndSave() {
    if (!item) return;

    const add = appendHtml.trim();
    if (!add) {
      setErr("Eklenecek içerik boş olamaz.");
      return;
    }
    if (!appendBlock.trim()) {
      setErr("Hangi bloğa ekleneceğini seç.");
      return;
    }

    const nextBlocks = applyAppend(blocks);
    setBlocks(nextBlocks);
    await save(nextBlocks);
    setAppendHtml("");
  }

  // Replace tool (JSON)
  const [replaceJson, setReplaceJson] = useState<string>("");

  useEffect(() => {
    // blocks state değişince replaceJson'ı güncelle (kullanıcı elle yazıyorsa overwrite etmemek için sadece boşken)
    if (!replaceJson.trim() && blocks.length) {
      setReplaceJson(JSON.stringify(blocks, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  async function replaceAllFromJson() {
    if (!item) return;
    setErr(null);
    setOkMsg(null);

    let parsed: any = null;
    try {
      parsed = JSON.parse(replaceJson || "[]");
    } catch {
      setErr("Replace JSON geçersiz. JSON parse edilemedi.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setErr("Replace JSON: Array bekleniyor (sections array).");
      return;
    }

    const nextBlocks = normBlocks(parsed);
    setBlocks(nextBlocks);
    await save(nextBlocks);
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-4">
      <header className="space-y-1">
        <div className="text-sm opacity-70">
          <Link className="underline" href="/admin">
            Admin
          </Link>{" "}
          / studio / topics
        </div>
        <h1 className="text-2xl font-bold">Topic Studio (Genel Editör)</h1>
        <p className="text-sm opacity-70">
          Slug ile yükle → istediğin kadar ekle/düzenle → kaydet. Bu sayfa “her topic için” tek araçtır.
        </p>
      </header>

      {/* Loader */}
      <section className="border rounded-xl p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_140px_120px] gap-2">
          <input
            className="border rounded p-2 text-sm"
            placeholder="slug (örn: systemic-lupus-erythematosus)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <input
            className="border rounded p-2 text-sm"
            placeholder="section (opsiyonel)"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
          <select
            className="border rounded p-2 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value === "EN" ? "EN" : "TR")}
          >
            <option value="TR">TR</option>
            <option value="EN">EN</option>
          </select>
          <button
            className="border rounded p-2 text-sm bg-neutral-50 hover:bg-neutral-100 disabled:opacity-50"
            onClick={load}
            disabled={!canLoad || loading}
          >
            {loading ? "Yükleniyor…" : "Yükle"}
          </button>
        </div>

        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        {okMsg ? <div className="text-sm text-green-700">{okMsg}</div> : null}

        {item ? (
          <div className="text-xs opacity-70">
            Aktif: <span className="font-mono">{item.slug}</span>{" "}
            {item.section ? `· ${item.section}` : ""} {item.updatedAt ? `· ${item.updatedAt}` : ""}
          </div>
        ) : null}

        {item ? (
          <a
            className="text-sm underline opacity-80 hover:opacity-100"
            href={`/${lang === "EN" ? "en" : "tr"}/topics/${encodeURIComponent(
              (item.section || section || "").toLowerCase()
            )}/${encodeURIComponent(item.slug)}`}
            target="_blank"
            rel="noreferrer"
          >
            Sayfayı aç →
          </a>
        ) : null}
      </section>

      {/* Editor */}
      <section className="border rounded-xl p-4 bg-white space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Editör</div>
          <button
            className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50 disabled:opacity-50"
            onClick={() => save()}
            disabled={!item || saving}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>

        {!item ? (
          <div className="text-sm opacity-70">Slug girip “Yükle” ile başlayın.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-70">Başlık</div>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-70">Tags (virgülle)</div>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="örn: SLE, lupus, pulmonology"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold opacity-70">Özet (summary)</div>
              <textarea
                className="border rounded p-2 text-sm w-full"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold opacity-70">References (JSON array)</div>
              <textarea
                className="border rounded p-2 text-sm w-full font-mono"
                rows={5}
                value={refsText}
                onChange={(e) => setRefsText(e.target.value)}
                placeholder='[{"label":"Kaynak","url":"...","year":2024}]'
              />
            </div>

            {/* Quick Append */}
            <section className="border rounded-xl p-3 bg-neutral-50 space-y-2">
              <div className="text-sm font-semibold">Hızlı Ekle (Append)</div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_140px] gap-2">
                <select
                  className="border rounded p-2 text-sm"
                  value={appendBlock}
                  onChange={(e) => setAppendBlock(e.target.value)}
                  disabled={!blocks.length}
                >
                  {!blocks.length ? <option value="">(blok yok)</option> : null}
                  {blocks.map((b, i) => (
                    <option key={i} value={b.title}>
                      {b.title}
                    </option>
                  ))}
                </select>

                <select
                  className="border rounded p-2 text-sm"
                  value={appendMode}
                  onChange={(e) => setAppendMode(e.target.value === "before" ? "before" : "after")}
                >
                  <option value="after">Sona ekle</option>
                  <option value="before">Başa ekle</option>
                </select>

                <button
                  className="border rounded p-2 text-sm bg-white hover:bg-neutral-100 disabled:opacity-50"
                  onClick={appendAndSave}
                  disabled={saving || !blocks.length}
                >
                  Ekle + Kaydet
                </button>
              </div>

              <textarea
                className="border rounded p-2 text-sm w-full font-mono"
                rows={4}
                placeholder='Örn: <h3>SLE ve Akciğer</h3><ul><li>...</li></ul>'
                value={appendHtml}
                onChange={(e) => setAppendHtml(e.target.value)}
              />
              <div className="text-[11px] opacity-70">
                Bu sadece seçilen bloğun HTML’ine ek yapar.
              </div>
            </section>

            {/* Blocks editor */}
            <div className="flex items-center justify-between gap-2 border-t pt-3">
              <div className="text-sm font-semibold">Blocks (sections)</div>
              <button
                className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50"
                onClick={() => setBlocks((prev) => [...prev, { title: "Yeni Blok", html: "", visibility: "V" }])}
              >
                + Yeni blok
              </button>
            </div>

            <div className="space-y-3">
              {blocks.map((b, i) => (
                <section key={i} className="border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">Blok #{i + 1}</div>

                    <div className="flex items-center gap-2">
                      <button
                        className="border rounded px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                        onClick={() =>
                          setBlocks((prev) => {
                            if (i === 0) return prev;
                            const next = [...prev];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            return next;
                          })
                        }
                        disabled={i === 0}
                      >
                        ↑
                      </button>
                      <button
                        className="border rounded px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                        onClick={() =>
                          setBlocks((prev) => {
                            if (i === prev.length - 1) return prev;
                            const next = [...prev];
                            [next[i + 1], next[i]] = [next[i], next[i + 1]];
                            return next;
                          })
                        }
                        disabled={i === blocks.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        className="border rounded px-2 py-1 text-xs hover:bg-neutral-50"
                        onClick={() => setBlocks((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-2">
                    <input
                      className="border rounded p-2 text-sm"
                      value={b.title}
                      onChange={(e) =>
                        setBlocks((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                      }
                      placeholder="Blok başlığı"
                    />
                    <select
                      className="border rounded p-2 text-sm"
                      value={(b.visibility || "V") as any}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((x, idx) => (idx === i ? { ...x, visibility: e.target.value as any } : x))
                        )
                      }
                    >
                      <option value="V">V</option>
                      <option value="M">M</option>
                      <option value="P">P</option>
                    </select>
                  </div>

                  <textarea
                    className="border rounded p-2 text-sm w-full font-mono"
                    rows={8}
                    value={b.html}
                    onChange={(e) =>
                      setBlocks((prev) => prev.map((x, idx) => (idx === i ? { ...x, html: e.target.value } : x)))
                    }
                    placeholder="HTML içeriği buraya yapıştır…"
                  />
                </section>
              ))}
              {!blocks.length ? (
                <div className="text-sm opacity-70 border rounded-xl p-3 bg-neutral-50">
                  Bu topic’te section/blocks yok. İstersen “+ Yeni blok” ile başlayıp kaydedebilirsin.
                </div>
              ) : null}
            </div>

            {/* Replace all (JSON) */}
            <section className="border rounded-xl p-3 bg-neutral-50 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">Komple Yeniden Yaz (Replace All Blocks)</div>
                <button
                  className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-100 disabled:opacity-50"
                  onClick={replaceAllFromJson}
                  disabled={saving}
                >
                  Replace + Kaydet
                </button>
              </div>

              <textarea
                className="border rounded p-2 text-sm w-full font-mono"
                rows={10}
                value={replaceJson}
                onChange={(e) => setReplaceJson(e.target.value)}
                placeholder='[{"title":"Giriş","html":"<p>...</p>","visibility":"V"}]'
              />
              <div className="text-[11px] opacity-70">
                Bu mod, sections array’ini tamamen değiştirir. JSON hatalıysa kaydetmez.
              </div>
            </section>

            <details className="border rounded-xl p-3">
              <summary className="cursor-pointer text-sm font-semibold">Debug JSON</summary>
              <pre className="text-[11px] whitespace-pre-wrap mt-2">
                {JSON.stringify(
                  { slug: item.slug, title, summary, tags: parseTags(tagsText), sections: blocks, references: parseRefs(refsText) },
                  null,
                  2
                )}
              </pre>
            </details>
          </>
        )}
      </section>
    </main>
  );
}
