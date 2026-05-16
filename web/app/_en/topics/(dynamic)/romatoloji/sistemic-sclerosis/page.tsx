export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function Page() {
  return (
    <article className="prose prose-neutral max-w-4xl mx-auto p-6">
      <h1>Systemic Sclerosis (Scleroderma)</h1>

      <p>
        Systemic sclerosis (SSc) is a chronic, progressive autoimmune connective
        tissue disease characterized by fibroblast activation, widespread tissue
        fibrosis, immune dysregulation, and microvascular damage. Clinical
        spectrum ranges from limited cutaneous forms to severe multiorgan
        involvement.
      </p>

      <h2>Epidemiology</h2>
      <p>
        The prevalence is 50–300 per million, more common in women (4–6:1), with
        onset usually between 30–50 years. Ethnic and geographic factors impact
        clinical phenotype and prognosis.
      </p>

      <h2>Pathogenesis</h2>
      <ul>
        <li><b>Genetic:</b> HLA-DR, HLA-DQ variants</li>
        <li><b>Immunologic:</b> Anti-centromere, anti-Scl-70 (topoisomerase I), anti-RNA polymerase III antibodies</li>
        <li><b>Vascular:</b> Endothelial injury, vasospasm, intimal proliferation</li>
        <li><b>Fibrosis:</b> Excess fibroblast activation via TGF-β, PDGF</li>
      </ul>

      <h2>Clinical Features</h2>
      <ul>
        <li><b>Skin:</b> Sclerodactyly, salt-and-pepper pigmentation, digital ulcers</li>
        <li><b>Raynaud phenomenon:</b> Often the first manifestation</li>
        <li><b>GI tract:</b> Esophageal dysmotility, reflux, malabsorption</li>
        <li><b>Lung:</b> Interstitial lung disease, pulmonary hypertension</li>
        <li><b>Renal:</b> Scleroderma renal crisis (hypertensive emergency, AKI)</li>
        <li><b>Cardiac:</b> Fibrosis, arrhythmia, pericardial effusion</li>
      </ul>

      <h2>Clinical Subtypes</h2>
      <ol>
        <li><b>Diffuse cutaneous SSc:</b> Extensive skin involvement, early risk of organ disease</li>
        <li><b>Limited cutaneous SSc (CREST):</b> Calcinosis, Raynaud, Esophageal dysmotility, Sclerodactyly, Telangiectasia</li>
      </ol>

      <h2>Diagnosis</h2>
      <p>
        The 2013 ACR/EULAR classification criteria are applied. ANA is positive
        in 90%, with disease-specific autoantibody profiles aiding diagnosis.
      </p>

      <h2>Treatment</h2>
      <ul>
        <li>Raynaud & digital ulcers: calcium channel blockers, endothelin receptor antagonists, prostacyclin analogs</li>
        <li>Interstitial lung disease: mycophenolate mofetil, cyclophosphamide, nintedanib</li>
        <li>Pulmonary hypertension: sildenafil, bosentan, prostacyclin analogs</li>
        <li>Renal crisis: ACE inhibitors (first-line)</li>
        <li>Skin/joint disease: methotrexate, immunosuppressives</li>
      </ul>

      <h2>Prognosis</h2>
      <p>
        Diffuse cutaneous subtype has poorer prognosis. Lung and cardiac
        involvement drive mortality. Pulmonary hypertension and renal crisis
        remain the strongest predictors of adverse outcomes.
      </p>

      <hr className="my-6" />
      <section className="text-sm opacity-70 mt-4">
        📖 References: Harrison, Cecil, UpToDate, EULAR, ACR, Kelly’s, Firestein,
        Dubois, Oxford, ACR Primer
      </section>

      <p className="mt-6">
        <Link href="/en/topics/romatoloji" className="underline">
          ← Back to Rheumatology index
        </Link>
      </p>
    </article>
  );
}


