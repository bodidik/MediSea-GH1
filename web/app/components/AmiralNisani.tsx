"use client";

import { useEffect, useState } from "react";
import { tarihYazisi } from "@/app/lib/tarih";

/**
 * AMİRAL NİŞANI ve ESKİME İŞARETİ — konu sayfasının başlığı altında.
 *
 * Kullanıcı kuralı (31 Eki 2026):
 * - Nişan yalnız `meta.nisan: "amiral"` taşıyan, ölçütü karşılayan sayfaya:
 *   en az bir çalışma tablosu ve bir kılavuzlar arası fark tablosu, rakamlar
 *   yayının kendi metninden, künyeler `meta.kaynaklar`da. Elle verilir.
 * - Nişan güncelleme tarihinden itibaren BİR YIL geçerli. Süre dolunca nişan
 *   askıya alınır; sayfa güncellenince (updatedAt ilerleyince) süre yeniden
 *   başlar.
 * - Nişansız sayfa da bir yılı aşınca "eskimiş" işareti alır.
 *
 * Süre ZAMANA BAĞLI: konu sayfası derlemede üretiliyor (SSG), sunucuda
 * hesaplanan değer yayın gününde donar. Bu yüzden sunucu değeri yalnız ilk
 * çizim içindir; istemci kurulunca bugünün tarihiyle yeniden hesaplar.
 */
export const NISAN_SURESI_GUN = 365;


const GUN = 86_400_000;

function gecenGun(iso: string, simdi: number): number | null {
  const t = Date.parse(`${iso}T12:00:00`);
  return Number.isFinite(t) ? Math.floor((simdi - t) / GUN) : null;
}

type Props = {
  /** `isoTarih(meta.updatedAt)` — tarih yoksa hiçbir şey çizilmez. */
  iso: string | undefined;
  amiral: boolean;
  /** Sunucunun hesapladığı an; istemci kurulunca bugüne güncellenir. */
  sunucuAni: number;
};

export default function AmiralNisani({ iso, amiral, sunucuAni }: Props) {
  const [simdi, setSimdi] = useState(sunucuAni);
  useEffect(() => setSimdi(Date.now()), []);

  if (!iso) return null;
  const gun = gecenGun(iso, simdi);
  if (gun === null) return null;
  const eskimis = gun > NISAN_SURESI_GUN;

  if (amiral && !eskimis) {
    const bitis = tarihYazisi(Date.parse(`${iso}T12:00:00`) + NISAN_SURESI_GUN * GUN, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return (
      <div className="mt-3 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
        <AmiralSimgesi soluk={false} />
        <span className="min-w-0 leading-tight">
          <span className="block text-[12px] font-black uppercase tracking-wider text-amber-900">Amiral sayfası</span>
          <span className="block text-[11px] font-medium text-slate-700">
            Çalışma tablosu ve kılavuzlar arası fark tablosuyla, yayın metninden derinleştirildi
            {bitis ? ` · nişan ${bitis} tarihine kadar geçerli` : ""}
          </span>
        </span>
      </div>
    );
  }

  if (!eskimis) return null;

  return (
    <div className="mt-3 inline-flex max-w-full items-center gap-2.5 rounded-xl border border-stone-300 bg-stone-100 px-3 py-2">
      {amiral ? <AmiralSimgesi soluk /> : <PasSimgesi />}
      <span className="min-w-0 leading-tight">
        <span className="block text-[12px] font-black uppercase tracking-wider text-stone-800">
          {amiral ? "Amiral nişanı askıda" : "Eskimiş sayfa"}
        </span>
        <span className="block text-[11px] font-medium text-stone-700">
          Son güncellemenin üzerinden bir yıldan fazla geçti; kılavuz ve çalışmalar değişmiş olabilir
        </span>
      </span>
    </div>
  );
}

function AmiralSimgesi({ soluk }: { soluk: boolean }) {
  const zemin = soluk ? "#78716c" : "#1e3a8a";
  const altin = soluk ? "#d6d3d1" : "#fbbf24";
  const halka = soluk ? "#a8a29e" : "#f59e0b";
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0" fill="none">
      <circle cx="16" cy="16" r="15" fill={zemin} />
      <circle cx="16" cy="16" r="13" stroke={halka} strokeWidth="1.5" />
      <path d="M16 4.5l1.3 2.7 3 .4-2.2 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.2-2 3-.4z" fill={altin} />
      <g stroke={altin} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="14.6" r="1.6" />
        <path d="M16 16.2v9.3M12.4 18.6h7.2M9.6 21.4c1.2 3 3.6 4.4 6.4 4.4s5.2-1.4 6.4-4.4" />
      </g>
    </svg>
  );
}

/** Paslanmış çapa — nişansız eskimiş sayfa. */
function PasSimgesi() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0" fill="none">
      <circle cx="16" cy="16" r="15" fill="#e7e5e4" stroke="#a8a29e" />
      <g stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        <circle cx="16" cy="9.6" r="1.8" />
        <path d="M16 11.4v13M11.6 14.6h8.8M8.6 18.8c1.4 3.6 4.2 5.6 7.4 5.6s6-2 7.4-5.6" />
      </g>
    </svg>
  );
}
