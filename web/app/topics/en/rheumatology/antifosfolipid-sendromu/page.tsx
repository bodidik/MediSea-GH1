import ChildLinks from "@/components/ChildLinks";
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

export default function Page() {
  return (
    <article className="prose prose-neutral max-w-4xl mx-auto p-6">
      <h1>Antifosfolipid Sendromu (APS)</h1>
      <p className="opacity-70">Bu sayfa placeholder’dır. İçerik eklenecektir.</p>
      <hr className="my-6" />
      <p><Link className="underline" href="/topics/romatoloji">← Romatoloji dizine dön</Link></p>
      <p><Link className="underline" href="/topics/romatoloji/behcet">Behçet dizinine git</Link></p>
    <hr className="my-6" />
<section className="text-sm opacity-70 mt-4">
  📖 Kaynaklar: Harrison, Cecil, UpToDate, EULAR, ACR, Kelly’s, Firestein, Dubois, Oxford, ACR Primer
</section>
</article>
  );
}




