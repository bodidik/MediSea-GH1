// Tüm branşların ortak kimlik bilgisi (başlık, ikon, renk paleti).
// Hem ana sayfa (app/(site)/page.tsx) hem de branş sayfası
// (app/(site)/topics/[slug]/page.tsx) BURADAN okur — renk/ikon tek
// yerden yönetilsin, iki dosyada tekrar hardcode edilmesin.

export type SpecialtyCategory = "dahili" | "destek";

export type Specialty = {
  title: string;
  slug: string;
  desc: string;
  icon: string;
  /** hover: border + shadow accent (kart hover durumunda) */
  color: string;
  /** ikon arkaplanı (açık ton) */
  bg: string;
  /** vurgu metin rengi (ok ikonu, "konulara git" vb.) */
  text: string;
  category: SpecialtyCategory;
};

// category: "dahili" (organ/sistem branşları) veya "destek" (multidisipliner / özel içerik)
// Her kategori kendi içinde alfabetik sırada — grid daha derli toplu görünsün diye.
export const SPECIALTIES: Specialty[] = [
  {
    title: "Endokrinoloji",
    slug: "endokrinoloji",
    desc: "Diyabet, Tiroid, Adrenal",
    icon: "🦋",
    color: "hover:border-purple-500 hover:shadow-purple-100",
    bg: "bg-purple-50",
    text: "text-purple-600",
    category: "dahili",
  },
  {
    title: "Enfeksiyon",
    slug: "enfeksiyon",
    desc: "Sepsis, Menenjit, Antibiyotikler",
    icon: "🦠",
    color: "hover:border-teal-500 hover:shadow-teal-100",
    bg: "bg-teal-50",
    text: "text-teal-600",
    category: "dahili",
  },
  {
    title: "Gastroenteroloji",
    slug: "gastroenteroloji",
    desc: "Konu anlatımları, Hepatoloji, İBH",
    icon: "🍎",
    color: "hover:border-orange-500 hover:shadow-orange-100",
    bg: "bg-orange-50",
    text: "text-orange-600",
    category: "dahili",
  },
  {
    title: "Genel Dahiliye",
    slug: "genel-dahiliye",
    desc: "İç hastalıkları, tanı ve tedavi süreçleri",
    icon: "⚕️",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
    category: "dahili",
  },
  {
    title: "Göğüs Hast.",
    slug: "gogus",
    desc: "KOAH, Astım, Pnömoni",
    icon: "🫁",
    color: "hover:border-cyan-500 hover:shadow-cyan-100",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    category: "dahili",
  },
  {
    title: "Hematoloji",
    slug: "hematoloji",
    desc: "Anemiler, Lösemiler, Pıhtılaşma",
    icon: "🩸",
    color: "hover:border-rose-500 hover:shadow-rose-100",
    bg: "bg-rose-50",
    text: "text-rose-600",
    category: "dahili",
  },
  {
    title: "Kardiyoloji",
    slug: "kardiyoloji",
    desc: "AKS, Kalp Yetersizliği, Aritmiler",
    icon: "❤️",
    color: "hover:border-red-500 hover:shadow-red-100",
    bg: "bg-red-50",
    text: "text-red-600",
    category: "dahili",
  },
  {
    title: "Nefroloji",
    slug: "nefroloji",
    desc: "ABH, KBH, Elektrolitler",
    icon: "💧",
    color: "hover:border-emerald-500 hover:shadow-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-500",
    category: "dahili",
  },
  {
    title: "Onkoloji",
    slug: "onkoloji",
    desc: "Solid Tümörler, Aciller",
    icon: "🎗️",
    color: "hover:border-yellow-500 hover:shadow-yellow-100",
    bg: "bg-amber-50",
    text: "text-amber-600",
    category: "dahili",
  },
  {
    title: "Romatoloji",
    slug: "romatoloji",
    desc: "Artritler, Vaskülitler, SLE",
    icon: "🦴",
    color: "hover:border-indigo-500 hover:shadow-indigo-100",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    category: "dahili",
  },
  {
    title: "Klinik Nütrisyon",
    slug: "klinik-nutrisyon",
    desc: "Enteral ve Parenteral Nütrisyon, ESPEN/ASPEN Kılavuzları, Malnütrisyon Yönetimi, PEG ve Refeeding Sendromu",
    icon: "🍏",
    color: "hover:border-emerald-500 hover:shadow-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    category: "destek",
  },
  {
    title: "Literatür & Journal Club",
    slug: "journal-club",
    desc: "En güncel Faz 3 çalışmaları ve literatür özetleri",
    icon: "📰",
    color: "hover:border-sky-500 hover:shadow-sky-100",
    bg: "bg-sky-50",
    text: "text-sky-600",
    category: "destek",
  },
  {
    title: "Palyatif",
    slug: "palyatif",
    desc: "Ağrı yönetimi, semptom kontrolü, yaşam sonu bakımı",
    icon: "🕊️",
    color: "hover:border-teal-500 hover:shadow-teal-100",
    bg: "bg-teal-50",
    text: "text-teal-600",
    category: "destek",
  },
];

export const CATEGORY_ORDER: SpecialtyCategory[] = ["dahili", "destek"];
export const CATEGORY_META: Record<SpecialtyCategory, { label: string }> = {
  dahili: { label: "Dahili Branşlar" },
  destek: { label: "Destek & Özel İçerik" },
};

/** Slug'a göre branş kimliğini bulur; tanımsız bir branş için nötr bir varsayılan döner. */
export function getSpecialty(slug: string): Specialty {
  const found = SPECIALTIES.find((s) => s.slug === slug);
  if (found) return found;
  return {
    title: slug.replace(/-/g, " "),
    slug,
    desc: "",
    icon: "📚",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-slate-50",
    text: "text-blue-600",
    category: "dahili",
  };
}
