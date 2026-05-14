export type CanonicalDoc = {
  title: string
  sections: { heading?: string; text: string }[]
  meta?: { updatedAt?: string; tags?: string[] }
}

/** Kanonik içeriği diskten okur (JSON). */
export async function loadCanonical(section: string, slug: string): Promise<CanonicalDoc | null> {
  // Node fs dinamik import (app router server)
  const fs = await import('fs')
  const path = await import('path')
  const base = path.join(process.cwd(), 'content', 'canonical', section, slug + '.json')
  if (!fs.existsSync(base)) return null
  const raw = fs.readFileSync(base, 'utf8')
  try { return JSON.parse(raw) as CanonicalDoc } catch { return null }
}

/** Backend üstünden çeviri denemesi; yoksa kimlik fonksiyonu (TR=EN fallback). */
export async function translateBlock(text: string, targetLang: 'tr'|'en'): Promise<string> {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!url) return text
  try {
    const res = await fetch(url + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // backend yoksa da patlamasın diye kısa timeout (edge’de ignore edilir)
      body: JSON.stringify({ text, targetLang })
    })
    if (!res.ok) return text
    const data = await res.json().catch(()=>null)
    const out = (data && (data.translated as string)) || text
    return out
  } catch { return text }
}

/** Belgenin tüm bloklarını çevirir. Backend yoksa orijinal metni döner. */
export async function localize(doc: CanonicalDoc, targetLang: 'tr'|'en'): Promise<CanonicalDoc> {
  const out: CanonicalDoc = { title: doc.title, sections: [], meta: doc.meta }
  out.title = await translateBlock(doc.title, targetLang)
  for (const s of doc.sections) {
    const heading = s.heading ? await translateBlock(s.heading, targetLang) : undefined
    const text    = await translateBlock(s.text, targetLang)
    out.sections.push({ heading, text })
  }
  return out
}

/** Kardeş (TR↔EN) url üretir. */
export function siblingHref(lang: 'tr'|'en', section: string, slug: string) {
  const to = lang === 'tr' ? 'en' : 'tr'
  return '/' + to + '/topics/' + section + '/' + slug
}