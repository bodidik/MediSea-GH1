import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ADI, rotaMeta } from "@/lib/site";
import { EnAracListesi, enAraclar } from "@/lib/en-arac";

/**
 * İNGİLİZCE ANA SAYFA — Türkçe `/`un karşılığı ve İngilizce sitenin girişi.
 *
 * Çevrilmemiş bir Türkçe sayfadan İngilizceye geçen (ya da otomatik
 * yönlendirilen) okuyucu buraya düşer (bkz. lib/dil.ts → ingilizceHedef).
 * Kapsam DÜRÜST yazılır: sitenin gövdesi Türkçe, İngilizce baskı yalnızca
 * listedeki hesaplayıcılar. Kütüphane burada bağlanmaz — İngilizce okuyucuyu
 * Türkçe sayfaya göndermek, ikizin tek sözünü bozar.
 */
export function generateMetadata(): Metadata {
  const n = enAraclar().length;
  const m = rotaMeta({
    baslik: "",
    aciklama: `${n} free clinical calculators and scores for internal medicine, from MediSea. No sign-up required.`,
    yol: "/",
    dil: "en",
  });
  /* Ana sayfa başlığı şablonsuz: "X · MEDISEA" değil, adın kendisi. */
  return { ...m, title: { absolute: `${SITE_ADI} — Clinical calculators for internal medicine` } };
}

export default function IngilizceAnaSayfa() {
  const n = enAraclar().length;
  return (
    <div className="px-4 py-10 text-blue-950">
      <div className="mx-auto max-w-3xl space-y-10">
        <section className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">MediSea · English edition</p>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-blue-950 sm:text-4xl">
            Clinical calculators for internal medicine
          </h1>
          <p className="max-w-[62ch] text-base font-semibold leading-relaxed text-slate-700">
            Bedside scores and risk calculators from MediSea, a clinical reference for internal
            medicine residents and specialists. Free, no sign-up.
          </p>
          <Link
            href="/en/tools"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-blue-950 px-5 text-sm font-black text-white hover:bg-blue-800"
          >
            {`Browse ${n} calculators`}
          </Link>
        </section>

        <section aria-labelledby="en-araclar" className="space-y-4">
          <h2 id="en-araclar" className="mt-0 font-sans text-lg font-black tracking-tight text-blue-950">
            Available in English
          </h2>
          <EnAracListesi />
        </section>

        <section aria-labelledby="en-baski" className="space-y-3 border-t border-slate-200 pt-8">
          <h2 id="en-baski" className="mt-0 font-sans text-lg font-black tracking-tight text-blue-950">
            About the English edition
          </h2>
          <p className="max-w-[62ch] text-sm leading-relaxed text-slate-700">
            MediSea is written in Turkish. The English edition currently covers the calculators
            listed above; more are added as they are translated. Every English text is reviewed
            by a physician before it is published.
          </p>
          <p className="max-w-[62ch] text-sm leading-relaxed text-slate-700">
            The content on this site is for educational purposes and does not replace a
            physician&apos;s clinical judgment. Diagnostic and treatment decisions should be based
            on current guidelines, the patient&apos;s own condition and local protocols.
          </p>
        </section>
      </div>
    </div>
  );
}
