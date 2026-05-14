export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function Page() {
  return (
    <article className="prose prose-neutral max-w-4xl mx-auto p-6">
      <h1>Rheumatoid Arthritis (RA)</h1>

      <p>
        Rheumatoid arthritis (RA) is a chronic, systemic autoimmune disease
        primarily affecting synovial joints, characterized by progressive joint
        destruction and functional loss. The prevalence is 0.5–1% and it is 2–3
        times more common in women, with onset typically between ages 30–50.
      </p>

      <h2>Pathogenesis</h2>
      <p>
        Genetic susceptibility (HLA-DR4, DR1), environmental factors (smoking,
        periodontal disease, microbiome), and immunologic mechanisms contribute
        to RA. Antigen presentation, CD4+ T-cell activation, B-cell production
        of RF/anti-CCP, and proinflammatory cytokines (TNF-α, IL-6, IL-1) drive
        synovial proliferation and pannus formation.
      </p>

      <h2>Clinical Features</h2>
      <ul>
        <li>Symmetric polyarthritis (MCP, PIP, wrist, MTP joints)</li>
        <li>Morning stiffness (≥1 hour)</li>
        <li>Extra-articular features: nodules, vasculitis, interstitial lung disease, ocular involvement</li>
      </ul>

      <h2>Diagnosis</h2>
      <p>
        The 2010 ACR/EULAR classification criteria are used. Anti-CCP and RF
        positivity, acute-phase reactants (ESR, CRP), clinical joint involvement,
        and symptom duration are considered.
      </p>

      <h2>Treatment</h2>
      <p>
        RA therapy follows a “treat-to-target” strategy aiming for remission or
        low disease activity. Treatment steps:
      </p>
      <ol>
        <li>Conventional DMARDs: methotrexate (first-line), leflunomide, sulfasalazine, hydroxychloroquine</li>
        <li>Biologic DMARDs: TNF inhibitors, abatacept, tocilizumab, rituximab</li>
        <li>Targeted synthetic DMARDs: JAK inhibitors (tofacitinib, baricitinib)</li>
      </ol>

      <h2>Complications</h2>
      <p>
        Cardiovascular disease, pulmonary involvement, increased risk of
        lymphoma, and drug toxicities are major contributors to morbidity.
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


