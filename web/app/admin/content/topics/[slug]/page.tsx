"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type SectionBlock = { title: string; html: string; visibility?: "V" | "M" | "P" };

type TopicItem = {
  slug: string;
  title: string;
  section?: string;
  lang?: "TR" | "EN";
  summary?: string;
  sections?: SectionBlock[];
  updatedAt?: string;
};

function normalizeBlocks(x: any): SectionBlock[] {
  const arr = Array.isArray(x) ? x : [];
  return arr.map((b) => ({
    title: String(b?.title || "").trim(),
    html: String(b?.html || ""),
    visibility: (["V", "M", "P"].includes(String(b?.visibility)) ? b.visibility : "V") as
      | "V"
      | "M"
      | "P",
  }));
}

export default function AdminTopicSlugEditor() {
  const params = useParams<{ slug: string }>();
  const slug = useMemo(() => decodeURIComponent(String(params?.slug || "")).trim(), [params]);

  const [lang, setLang] = useState<"TR" | "EN">("TR");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [item, setItem] = useState<TopicItem | null>(null);

  // editable
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [blocks, setBlocks] = useState<SectionBlock[]>([]);

  async function load() {
    if (!slug) return;
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const qs = new URLSearchParams();
      qs.set("lang", lang);

      const r = await fetch(`/api/topics/${encodeURIComponent(slug)}?${qs.toString()}`, {
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
      setBlocks(normalizeBlocks(it.sections));

      setOk("Yüklendi.");
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
    setOk(null);

    try {
      const qs = new URLSearchParams();
      qs.set("lang", lang);

      const payload = {
        title: title.trim(),
        summary,
        sections: blocks.map((b) => ({
          title: String(b.title || "").trim(),
          html: String(b.html || ""),
          visibility: (b.visibility || "V") as "V" | "M" | "P",
        })),
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

      // backend item döndürüyorsa tazele
      if (j?.item) setItem(j.item as TopicItem);

      setOk("Kaydedildi.");
    } catch (e: any) {
      setErr(e?.message || "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  function addBlock() {
    setBlocks((prev) => [...prev, { title: "Yeni Blok", html: "", visibility: "V" }]);
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang]);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <div className="text-sm opacity-70">
          <Link className="underline" href="/admin/content">
            Admin / Content
          </Link>{" "}
          / Topics / <span className="font-mono">{slug}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Topic Editor</h1>
          <div className="flex items-center gap-2">
            <select
              className="border rounded p-2 text-sm"
              value={lang}
              onChange={(e) => setLang(e.target.value === "EN" ? "EN" : "TR")}
            >
              <option value="TR">TR</option>
              <option value="EN">EN</option>
            </select>
            <button
              className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50 disabled:opacity-50"
              onClick={save}
              disabled={saving || !item}
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </div>

        {loading ? <div className="text-sm opacity-70">Yükleniyor…</div> : null}
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        {ok ? <div className="text-sm text-green-700">{ok}</div> : null}
      </header>

      {!item ? (
        <section className="border rounded-xl p-5 bg-white">
          <div className="opacity-70 text-sm">
            Konu bulunamadı veya backend/proxy erişilemiyor.
          </div>
        </section>
      ) : (
        <>
          <section className="border rounded-xl p-4 bg-white space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-70">Başlık</div>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold opacity-70">Aksiyon</div>
                <button
                  className="border rounded px-3 py-2 text-sm bg-white hover:bg-neutral-50 w-full"
                  onClick={addBlock}
                >
                  + Yeni blok
                </button>
                <div className="text-[11px] opacity-60 mt-2">
                  Görüntüleme sayfası:{" "}
                  <Link className="underline" href={`/tr/topics/${encodeURIComponent(String(item.section || ""))}/${encodeURIComponent(item.slug)}`}>
                    aç
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold opacity-70">Konu özeti (summary)</div>
              <textarea
                className="border rounded p-2 text-sm w-full"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Özeti buraya yapıştır…"
              />
            </div>
          </section>

          <section className="space-y-3">
            {blocks.map((b, i) => (
              <section key={i} className="border rounded-xl p-4 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">Blok #{i + 1}</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="border rounded px-2 py-1 text-xs bg-white hover:bg-neutral-50 disabled:opacity-50"
                      onClick={() => moveBlock(i, -1)}
                      disabled={i === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="border rounded px-2 py-1 text-xs bg-white hover:bg-neutral-50 disabled:opacity-50"
                      onClick={() => moveBlock(i, 1)}
                      disabled={i === blocks.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      className="border rounded px-2 py-1 text-xs bg-white hover:bg-neutral-50"
                      onClick={() => removeBlock(i)}
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
                      setBlocks((prev) =>
                        prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x))
                      )
                    }
                    placeholder="Blok başlığı"
                  />
                  <select
                    className="border rounded p-2 text-sm"
                    value={(b.visibility || "V") as any}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((x, idx) =>
                          idx === i ? { ...x, visibility: e.target.value as any } : x
                        )
                      )
                    }
                  >
                    <option value="V">V</option>
                    <option value="M">M</option>
                    <option value="P">P</option>
                  </select>
                </div>

                <textarea
                  className="border rounded p-2 text-sm w-full"
                  rows={10}
                  value={b.html}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((x, idx) => (idx === i ? { ...x, html: e.target.value } : x))
                    )
                  }
                  placeholder="HTML içeriği buraya yapıştır…"
                />
              </section>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
