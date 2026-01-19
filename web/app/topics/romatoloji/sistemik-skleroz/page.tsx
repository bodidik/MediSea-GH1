export const runtime = "nodejs";
export const revalidate = 7776000;
import ChildLinks from "@/components/ChildLinks";
export default function Page() {
  return (
    <main className="prose max-w-3xl px-4 py-8">
      <h1>Sistemik Skleroz</h1>
      <p className="text-sm opacity-70">Fibrozis, mikrovasküler hasar ve otoimmünite ile karakterize.</p>
<h2>Alt tipler</h2>
<ul><li>lcSSc (sınırlı), dcSSc (diffüz); Raynaud sıktır.</li></ul>
<h2>Klinik</h2>
<ul>
  <li>Deri sklerozu, telanjiektazi; GİS dismotilite; ILD/PAH; renal kriz.</li>
</ul>
<h2>Tanı</h2>
<ul>
  <li>ACR/EULAR; antikorlar: anti-centromere, anti-Scl-70, anti-RNA pol III.</li>
</ul>
<h2>Tedavi</h2>
<ul>
  <li>Raynaud: KKB; ILD: MMF/siklofosfamid (seçilmişte nintedanib); PAH: hedefe yönelik.</li>
  <li>Renal kriz: ACE inhibitörü acil; yüksek doz steroidden kaçın.</li>
</ul>
<h2>İzlem</h2>
<ul><li>PFT/HRCT, PAH taraması, böbrek ve cilt skorlamaları.</li></ul>

      <h2>Kaynaklar</h2>
      <ul className="text-sm">
        <li>Harrison’s Principles of Internal Medicine</li>
        <li>UpToDate (ilgili başlıklar)</li>
        <li>Goldman–Cecil Medicine</li>
        <li>Kelley & Firestein’s Textbook of Rheumatology</li>
        <li>EULAR / ACR kılavuzları</li>
        <li>NEJM / Lancet (review)</li>
        <li>StatPearls / Medscape</li>
      </ul>

      <ChildLinks appSubPath="topics/romatoloji/sistemik-skleroz"
                  premiumHref="/premium/ydus"
                  premiumLabel="PREMİUM YDUS" />
    </main>
  );
}

