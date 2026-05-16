import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

const items = [{"title":"Differential Diagnosis","href":"/en/topics/nefroloji/renal-transplantasyon/differential-diagnosis"},{"title":"Epidemiology","href":"/en/topics/nefroloji/renal-transplantasyon/epidemiology"},{"title":"Overview","href":"/en/topics/nefroloji/renal-transplantasyon/overview"},{"title":"Clinical Features","href":"/en/topics/nefroloji/renal-transplantasyon/clinical-features"},{"title":"Comorbidities And Complications","href":"/en/topics/nefroloji/renal-transplantasyon/comorbidities-and-complications"},{"title":"Laboratory And İmaging","href":"/en/topics/nefroloji/renal-transplantasyon/laboratory-and-imaging"},{"title":"Special Populations","href":"/en/topics/nefroloji/renal-transplantasyon/special-populations"},{"title":"Pathogenesis","href":"/en/topics/nefroloji/renal-transplantasyon/pathogenesis"},{"title":"Classification Diagnostic Criteria","href":"/en/topics/nefroloji/renal-transplantasyon/classification-diagnostic-criteria"},{"title":"Treatment","href":"/en/topics/nefroloji/renal-transplantasyon/treatment"}];

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Renal Transplantasyon — Index</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <hr className="my-6" />
      <p className="text-sm opacity-70">
        Looking for Turkish content?{" "}
        <Link className="underline" href={items.length ? items[0].href.replace('/en/','/').split('/').slice(0,-1).join('/') : "#"}>
          View TR topic
        </Link>
      </p>
      <ChildLinks appSubPath="en/topics/renal-transplantasyon/page.tsx" />
</main>

  );
}



