export const runtime = "nodejs";
export const revalidate = 7776000;

import ChildLinks from "@/components/ChildLinks";

export default function Page() {
  return (
<main className="prose max-w-3xl px-4 py-8">
      <h1>Sistemik Skleroz (Skleroderma)</h1>
      <p className="text-sm opacity-70">
        Bu özet; Harrison’s, UpToDate, EULAR/ACR kılavuzları ve temel romatoloji kaynaklarına dayanmaktadır.
      </p>

      <h2>Tanım & Alt Tipler</h2>
      <ul>
        <li>Fibrozis, vaskülopati ve otoimmünite ile seyreden sistemik hastalık.</li>
        <li>Sınıflama: diffüz kütanöz (dcSSc), limitli kütanöz (lcSSc/CREST).</li>
      </ul>

      <h2>Patogenez (kısa)</h2>
      <ul>
        <li>Endotelyal hasar → Raynaud → vasküler yeniden şekillenme.</li>
        <li>Fibroblast aktivasyonu → kolajen artışı → doku fibrozisi.</li>
      </ul>

      <h2>Klinik</h2>
      <ul>
        <li>Cilt: sklerodaktili, telanjiektazi, kalsinozis.</li>
        <li>İç organ: akciğer (ILD/PAH), GİS dismotilite, böbrek krizi.</li>
      </ul>

      <h2>Seroloji & Tanı</h2>
      <ul>
        <li>ANA pozitif; anti-Scl-70 (dcSSc/ILD), anti-centromere (lcSSc/PAH), anti-RNA pol III (renal kriz) ile ilişki.</li>
        <li>EULAR/ACR sınıflama kriterleri; organ tutulumuna yönelik taramalar.</li>
      </ul>

      <h2>Tedavi (özet)</h2>
      <ul>
        <li>Raynaud: soğuktan kaçınma, CCB; refrakterde IV prostasiklin.</li>
        <li>ILD: MMF veya siklofosfamid; seçilmişte nintedanib.</li>
        <li>PAH: endotelin antagonistleri, PDE-5 inhibitörleri vb.</li>
        <li>Renal kriz: ACE-i (erken, agresif); steroid yüksek dozundan kaçın.</li>
      </ul>

      <h2>İzlem</h2>
      <ul>
        <li>DLCO/spirometri, EKO, böbrek ve cilt skorlamalarıyla düzenli takip.</li>
      </ul>

          <ChildLinks appSubPath="en/topics/rheumatology/systemic-sclerosis"
              premiumHref="/en/premium/usmle-step2"
              premiumLabel="PREMIUM USMLE Step 2" />
</main>

      );
}


