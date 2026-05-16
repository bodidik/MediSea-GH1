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

function normRefs(x: any) {
  const arr = Array.isArray(x) ? x : [];
  return arr
    .map((r) => {
      if (!r) return null;
      if (typeof r === "string") return { label: r };
      return {
        label: String(r.label || "").trim() || "Kaynak",
        url: r.url ? String(r.url) : undefined,
        year: typeof r.year === "number" ? r.year : undefined,
      };
    })
    .filter(Boolean) as { label: string; url?: string; year?: number }[];
}

function hasFreeNoteBlock(blocks: SectionBlock[]) {
  return blocks.some((b) => String(b.title || "").trim().toLowerCase() === "serbest not");
}

export default function AdminTopicsStudio() {
  // filters
  const [q, setQ] = useState("");
  const [section, setSection] = useState("");
  const [lang, setLang] = useState<"TR" | "EN">("TR");

  // list
  const [listLoading, setListLoading] = useState(false);
  const [listErr, setListErr] = useState<string | null>(null);
  const [items, setItems] = useState<TopicItem[]>([]);

  // selected
  const [activeSlug, setActiveSlug] = useState<string>("");

  // editor
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [item, setItem] = useState<TopicItem | null>(null);

  // editable fields
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [blocks, setBlocks] = useState<SectionBlock[]>([]);
  const [tagsText, setTagsText] = useState("");
  const [refsText, setRefsText] = useState(""); // JSON array
  
  // --- state ---
const [appendBlock, setAppendBlock] = useState<string>("");
const [appendHtml, setAppendHtml] = useState<string>("");
const [appendMode, setAppendMode] = useState<"after" | "before">("after");
{/* QUICK APPEND */}
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
        <option key={i} value={b.title}>{b.title}</option>
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
      disabled={!item || saving || !blocks.length}
    >
      Ekle ve Kaydet
    </button>
  </div>

  <textarea
    className="border rounded p-2 text-sm w-full font-mono"
    rows={4}
    placeholder='Örn: <p><b>SLE ve Akciğer:</b> ...</p>'
    value={appendHtml}
    onChange={(e) => setAppendHtml(e.target.value)}
  />

  <div className="text-[11px] opacity-70">
    Not: Bu işlem sadece seçili bloğun HTML’ine ek yapar; diğer bloklara dokunmaz.
  </div>
</section>

// item yüklendikten sonra default target seç
useEffect(() => {
  if (!item) return;
  const first = (blocks?.[0]?.title || "").trim();
  setAppendBlock(first || "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [item]);

function applyAppend(blocksIn: SectionBlock[]) {
  const target = appendBlock.trim();
  if (!target) return blocksIn;
  const add = appendHtml.trim();
  if (!add) return blocksIn;

  return blocksIn.map((b) => {
    if ((b.title || "").trim() !== target) return b;
    const cur = String(b.html || "");
    const nextHtml = appendMode === "before" ? (add + "\n" + cur) : (cur + "\n" + add);
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
  setSaving(true);
  setErr(null);
  setOkMsg(null);

  try {
    const nextBlocks = applyAppend(blocks);

    const qs = new URLSearchParams();
    qs.set("lang", lang);
    if (section.trim()) qs.set("section", section.trim().toLowerCase());

    const payload = {
      title: title.trim(),
      summary,
      sections: nextBlocks,
      // tags/references varsa senin mevcut payload’ına ekle
    };

    const r = await fetch(`/api/topics/${encodeURIComponent(item.slug)}?${qs.toString()}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);

    // state güncelle
    setBlocks(nextBlocks);
    setAppendHtml("");
    setOkMsg("Ekleme kaydedildi.");
  } catch (e: any) {
    setErr(e?.message || "Kaydetme hatası");
  } finally {
    setSaving(false);
  }
}

  async function fetchList() {
    setListLoading(true);
    setListErr(null);

    try {
      const qs = new URLSearchParams();
      const qq = q.trim();
      if (qq) qs.set("q", qq);
      if (section.trim()) qs.set("section", section.trim().toLowerCase());
      qs.set("lang", lang);
      qs.set("limit", "50");
      qs.set("sort", "-updatedAt");

      // 1) search endpoint dene
      let r = await fetch(`/api/topics/search?${qs.toString()}`, { cache: "no-store" });
      let j: any = null;

      if (r.ok) {
        j = await r.json().catch(() => null);
        const arr = Array.isArray(j?.items) ? j.items : [];
        setItems(
          arr.map((x: any) => ({
            slug: String(x?.slug || "").trim(),
            title: String(x?.title || "").trim() || String(x?.slug || ""),
            section: String(x?.section || "").toLowerCase(),
            lang: (String(x?.lang || "TR").toUpperCase() === "EN" ? "EN" : "TR") as any,
            summary: String(x?.summary || ""),
            updatedAt: String(x?.updatedAt || ""),
          }))
        );
        return;
      }

      // 2) fallback list endpoint
      r = await fetch(`/api/topics?${qs.toString()}`, { cache: "no-store" });
      if (!r.ok) throw new Error("Liste alınamadı");
      j = await r.json().catch(() => null);

      const arr = Array.isArray(j?.items) ? j.items : [];
      setItems(
        arr.map((x: any) => ({
          slug: String(x?.slug || "").trim(),
          title: String(x?.title || "").trim() || String(x?.slug || ""),
          section: String(x?.section || "").toLowerCase(),
          lang: (String(x?.lang || "TR").toUpperCase() === "EN" ? "EN" : "TR") as any,
          summary: String(x?.summary || ""),
          updatedAt: String(x?.updatedAt || ""),
        }))
      );
    } catch (e: any) {
      setListErr(e?.message || "Liste hatası");
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }

  async function loadBySlug(slug: string) {
    const s = String(slug || "").trim();
    if (!s) return;

    setActiveSlug(s);
    setLoading(true);
    setErr(null);
    setOkMsg(null);
    setItem(null);

    try {
      const qs = new URLSearchParams();
      qs.set("lang", lang);
      if (section.trim()) qs.set("section", section.trim().toLowerCase());

      const r = await fetch(`/api/topics/${encodeURIComponent(s)}?${qs.toString()}`, {
        cache: "no-store",
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok || !j?.item) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);

      const it: TopicItem = j.item;

      setItem(it);
      setTitle(String(it.title || ""));
      setSummary(String(it.summary || ""));
      setBlocks(normBlocks(it.sections));
      setTagsText(Array.isArray(it.tags) ? it.tags.join(", ") : "");
      setRefsText(JSON.stringify(normRefs(it.references), null, 2));

      if (!section.trim() && it.section) setSection(String(it.section));
      setOkMsg("Yüklendi.");
    } catch (e: any) {
      setErr(e?.message || "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!item) return;

    setSaving(true);
    setErr(null);
    setOkMsg(null);

    try {
      const qs = new URLSearchParams();
      qs.set("lang", lang);
      if (section.trim()) qs.set("section", section.trim().toLowerCase());

      const tags = tagsText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      // refs parse: bozulursa SİLME -> mevcut item.references'ı koru
      let references: any[] = item.references || [];
      try {
        const parsed = JSON.parse(refsText || "[]");
        if (Array.isArray(parsed)) references = parsed;
      } catch {
        // no-op
      }

      const payload = {
        title: title.trim(),
        summary,
        sections: blocks.map((b) => ({
          title: String(b.title || "").trim() || "Bölüm",
          html: String(b.html || ""),
          visibility: (b.visibility || "V") as Visibility,
        })),
        tags,
        references,
      };

      const r = await fetch(`/api/topics/${encodeURIComponent(item.slug)}?${qs.toString()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) throw new Error(j?.error || j?.message || `HTTP ${r.status}`);

      const next = j?.item ? (j.item as TopicItem) : item;
      setItem(next);

      // Kaydet sonrası editor state'i de “backend dönen” ile tazele (geri dönme azaltır)
      setTitle(String(next.title || ""));
      setSummary(String(next.summary || ""));
      setBlocks(normBlocks(next.sections));
      setTagsText(Array.isArray(next.tags) ? next.tags.join(", ") : tagsText);
      setRefsText(JSON.stringify(normRefs(next.references), null, 2));

      setOkMsg("Kaydedildi.");

      // listeyi tazele (updatedAt değiştiyse)
      fetchList();
    } catch (e: any) {
      setErr(e?.message || "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  function addBlock() {
    setBlocks((prev) => [...prev, { title: "Yeni Blok", html: "", visibility: "V" }]);
  }

  function addFreeNoteBlock() {
    setBlocks((prev) => {
      if (hasFreeNoteBlock(prev)) return prev;
      return [...prev, { title: "Serbest Not", html: "", visibility: "V" }];
    });
    setOkMsg(null);
    setErr(null);
  }

  function removeBlock(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewHref = useMemo(() => {
    const sec = String(item?.section || section || "").trim().toLowerCase();
    if (!item?.slug || !sec) return "";
    return `/tr/topics/${encodeURIComponent(sec)}/${encodeURIComponent(item.slug)}`;
  }, [item?.slug, item?.section, section]);

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm opacity-70">
            <Link className="underline" href="/admin">
              Admin
            </Link>{" "}
            / content / topics
          </div>
          <h1 className="text-2xl font-bold">Content Studio · Topics</h1>
          <p className="text-sm opacity-70">
            Arat → seç → içerik (summary/blocks/tags/references) serbestçe düzenle → kaydet.
          </p>
        </div>

        {previewHref ? (
          <a className="text-sm underline opacity-80 hover:opacity-100" href={previewHref} target="_blank" rel="noreferrer">
            Sayfayı aç →
          </a>
        ) : null}
      </header>

      {/* Filters */}
      <section className="border rounded-xl p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_140px_120px] gap-2">
          <input
            className="border rounded p-2 text-sm"
            placeholder="Ara: başlık / slug (boş bırak: son güncellenenler)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            className="border rounded p-2 text-sm"
            placeholder="section (opsiyonel)"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
          <select className="border rounded p-2 text-sm" value={lang} onChange={(e) => setLang(e.target.value === "EN" ? "EN" : "TR")}>
            <option value="TR">TR</option>
            <option value="EN">EN</option>
          </select>
          <button
            className="border rounded p-2 text-sm bg-neutral-50 hover:bg-neutral-100 disabled:opacity-50"
            onClick={fetchList}
            disabled={listLoading}
          >
            {listLoading ? "Aranıyor…" : "Ara"}
          </button>
        </div>

        {listErr ? <div className="text-sm text-red-600">{listErr}</div> : null}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Left list */}
        <section className="border rounded-xl bg-white overflow-hidden">
          <div className="border-b px-3 py-2 text-sm font-semibold">Sonuçlar ({items.length})</div>
          <div className="max-h-[70vh] overflow-auto">
            {items.map((x) => {
              const active = x.slug === activeSlug;
              return (
                <button
                  key={x.slug}
                  onClick={() => loadBySlug(x.slug)}
                  className={`w-full text-left px-3 py-2 border-b hover:bg-neutral-50 ${active ? "bg-neutral-50" : ""}`}
                >
                  <div className="text-sm font-medium">{x.title}</div>
                  <div className="text-[11px] opacity-70 font-mono">{x.slug}</div>
                  <div className="text-[11px] opacity-60">
                    {x.section || "—"} · {x.lang || "TR"} {x.updatedAt ? `· ${x.updatedAt}` : ""}
                  </div>
                </button>
              );
            })}
            {!items.length ? <div className="p-3 text-sm opacity-70">Sonuç yok.</div> : null}
          </div>
        </section>

        {/* Right editor */}
        <section className="border rounded-xl bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Editör</div>
            <div className="flex items-center gap-2">
              <button
                className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50 disabled:opacity-50"
                onClick={save}
                disabled={!item || saving}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>

          {loading ? <div className="h-24 bg-neutral-100 rounded" /> : null}
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          {okMsg ? <div className="text-sm text-green-700">{okMsg}</div> : null}

          {!item ? (
            <div className="text-sm opacity-70">Soldan bir konu seç (slug) veya arama yap.</div>
          ) : (
            <>
              <div className="text-xs opacity-70">
                Aktif: <span className="font-mono">{item.slug}</span>{" "}
                {item.section ? `· ${item.section}` : ""} {item.updatedAt ? `· ${item.updatedAt}` : ""}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-70">Başlık</div>
                <input className="border rounded p-2 text-sm w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-70">Özet (summary)</div>
                <textarea
                  className="border rounded p-2 text-sm w-full"
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Özeti buraya yapıştır…"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold opacity-70">Tags (virgülle)</div>
                  <input
                    className="border rounded p-2 text-sm w-full"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="örn: IBD, ulcerative-colitis, treatment"
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
                  <div className="text-[11px] opacity-60">
                    Not: JSON bozuksa kaydetmede mevcut references korunur (silinmez).
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t pt-3">
                <div className="text-sm font-semibold">Blocks (sections)</div>
                <div className="flex items-center gap-2">
                  <button
                    className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50"
                    onClick={addFreeNoteBlock}
                    disabled={hasFreeNoteBlock(blocks)}
                    title="Okurken eksik gördüğün şeyleri özgürce eklemek için"
                  >
                    + Serbest Not
                  </button>
                  <button className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50" onClick={addBlock}>
                    + Yeni blok
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {blocks.map((b, i) => (
                  <section key={i} className="border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">
                        Blok #{i + 1}{" "}
                        {String(b.title || "").trim().toLowerCase() === "serbest not" ? (
                          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full border bg-neutral-50">serbest</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="border rounded px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                          onClick={() => moveBlock(i, -1)}
                          disabled={i === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="border rounded px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
                          onClick={() => moveBlock(i, 1)}
                          disabled={i === blocks.length - 1}
                        >
                          ↓
                        </button>
                        <button className="border rounded px-2 py-1 text-xs hover:bg-neutral-50" onClick={() => removeBlock(i)}>
                          Sil
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-2">
                      <input
                        className="border rounded p-2 text-sm"
                        value={b.title}
                        onChange={(e) => setBlocks((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
                        placeholder="Blok başlığı"
                      />
                      <select
                        className="border rounded p-2 text-sm"
                        value={(b.visibility || "V") as any}
                        onChange={(e) => setBlocks((prev) => prev.map((x, idx) => (idx === i ? { ...x, visibility: e.target.value as any } : x)))}
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
                      onChange={(e) => setBlocks((prev) => prev.map((x, idx) => (idx === i ? { ...x, html: e.target.value } : x)))}
                      placeholder="HTML içeriği buraya yapıştır…"
                    />
                  </section>
                ))}
              </div>

              <details className="border rounded-xl p-3 bg-neutral-50">
                <summary className="cursor-pointer text-sm font-semibold">Debug JSON</summary>
                <pre className="text-[11px] whitespace-pre-wrap mt-2">
                  {JSON.stringify(
                    { slug: item.slug, title, summary, tags: tagsText, sections: blocks, references: refsText },
                    null,
                    2
                  )}
                </pre>
              </details>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
