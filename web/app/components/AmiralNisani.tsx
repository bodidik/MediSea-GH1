/**
 * AMİRAL NİŞANI — `meta.nisan: "amiral"` taşıyan konu sayfasının başlığında.
 *
 * Denizcilikte en yüksek rütbe: sayfa ileri okuma düzeyine çıkarıldı demek.
 * Ölçütü (kullanıcı kararı, 31 Eki 2026): en az bir çalışma tablosu ve bir
 * kılavuzlar arası fark tablosu, rakamlar yayının kendi metninden, künyeler
 * `meta.kaynaklar`da. Nişan elle verilir; ilan değil iş olsun diye
 * ölçütü karşılamayan sayfaya konmaz.
 */
export function amiralMi(meta: unknown): boolean {
  return (meta as { nisan?: unknown } | null | undefined)?.nisan === "amiral";
}

export default function AmiralNisani() {
  return (
    <div className="mt-3 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0" fill="none">
        <circle cx="16" cy="16" r="15" fill="#1e3a8a" />
        <circle cx="16" cy="16" r="13" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M16 4.5l1.3 2.7 3 .4-2.2 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.2-2 3-.4z" fill="#fbbf24" />
        <g stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="14.6" r="1.6" />
          <path d="M16 16.2v9.3M12.4 18.6h7.2M9.6 21.4c1.2 3 3.6 4.4 6.4 4.4s5.2-1.4 6.4-4.4" />
        </g>
      </svg>
      <span className="min-w-0 leading-tight">
        <span className="block text-[12px] font-black uppercase tracking-wider text-amber-900">Amiral sayfası</span>
        <span className="block text-[11px] font-medium text-slate-700">
          Çalışma tablosu ve kılavuzlar arası fark tablosuyla, yayın metninden derinleştirildi
        </span>
      </span>
    </div>
  );
}
