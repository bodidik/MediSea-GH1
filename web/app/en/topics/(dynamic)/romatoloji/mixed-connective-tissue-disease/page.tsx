export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function Page() {
  return (
    <article className="prose prose-neutral max-w-4xl mx-auto p-6">
      <h1>Mixed Connective Tissue Disease (MCTD)</h1>

      <p>
        MCTD is an overlap connective tissue disease characterized by high-titer anti–U1 RNP
        antibodies and a combination of clinical features from SLE, systemic sclerosis (SSc),
        and polymyositis/dermatomyositis (PM/DM). Raynaud phenomenon, puffy hands, arthritis,
        myositis, esophageal dysmotility, and pulmonary involvement (notably pulmonary
        hypertension and/or interstitial lung disease; ILD) are typical.
      </p>

      <h2>Epidemiology and Course</h2>
      <p>
        It is uncommon, predominantly affecting women (2nd–4th decades). The course is variable;
        some patients evolve toward a defined phenotype (SLE/SSc/PM). Long-term outcomes are
        driven mainly by lung involvement and pulmonary hypertension.
      </p>

      <h2>Pathogenesis & Immunology</h2>
      <ul>
        <li><b>Genetic/Immune:</b> HLA associations; high-titer anti–U1 RNP is a key serologic hallmark.</li>
        <li><b>Inflammation–Fibrosis axis:</b> Endothelial dysfunction, vasospasm, microangiopathy, fibroblast activation.</li>
        <li><b>Environmental triggers:</b> Viral exposures, smoking, silica (evidence varies).</li>
      </ul>

      <h2>Clinical Features</h2>
      <ul>
        <li><b>Vascular:</b> Raynaud; capillaroscopy with dilated/giant capillaries.</li>
        <li><b>MSK:</b> Symmetric non-erosive arthritis/arthralgia; proximal muscle weakness when myositis present.</li>
        <li><b>Skin:</b> Puffy hands, sclerodactyly-like tightening, telangiectasia.</li>
        <li><b>GI:</b> Esophageal dysmotility, reflux; small-bowel dysmotility occasionally.</li>
        <li><b>Lung:</b> ILD (often NSIP), pulmonary hypertension (major driver of morbidity).</li>
        <li><b>Cardiac:</b> Pericarditis, arrhythmia; right heart strain with PH.</li>
        <li><b>Renal/Neuro:</b> Usually mild; overt lupus nephritis is uncommon.</li>
      </ul>

      <h2>Laboratory & Serology</h2>
      <ul>
        <li><b>Serology:</b> ANA positive; <b>high-titer anti–U1 RNP</b> defines the entity.</li>
        <li>Complements often normal or mildly reduced; anti-dsDNA typically negative or low.</li>
        <li>Muscle enzymes (CK/aldolase) elevated with myositis; inflammatory markers modestly elevated.</li>
      </ul>

      <h2>Classification/Diagnosis</h2>
      <p>
        Commonly used sets are <b>Alarcón-Segovia</b> and <b>Kasukawa</b>. In practice, diagnosis requires
        high-titer anti–U1 RNP plus sufficient features across the SLE/SSc/PM domains. Record overlap against
        SLE (2019 EULAR/ACR), SSc (2013 ACR/EULAR), and PM/DM (EULAR/ACR) frameworks.
      </p>

      <h2>Differential Diagnosis</h2>
      <ul>
        <li>SLE (anti-dsDNA/anti-Sm, nephritis propensity, low complements)</li>
        <li>SSc (anti-centromere/anti–topoisomerase I, prominent skin thickening, PH/ILD pattern)</li>
        <li>PM/DM (proximal weakness, EMG/MRI/biopsy confirmation)</li>
        <li>Drug-induced/other systemic autoimmune diseases</li>
      </ul>

      <h2>Assessment & Monitoring</h2>
      <ul>
        <li><b>Lung:</b> PFT incl. DLCO, HRCT; echocardiography ± RHC for PH.</li>
        <li><b>Muscle:</b> CK/aldolase, strength testing; EMG/MRI ± biopsy.</li>
        <li><b>Vascular:</b> Digital ulcers/ischemia; capillaroscopy.</li>
        <li><b>GI:</b> Manometry/contrast studies as needed.</li>
      </ul>

      <h2>Treatment (Organ/Territory-Based)</h2>
      <ul>
        <li><b>Raynaud/digital ulcers:</b> CCBs, PDE5 inhibitors, endothelin receptor antagonists, prostacyclin analogs; thermal protection and smoking cessation.</li>
        <li><b>ILD:</b> Mycophenolate mofetil first-line; cyclophosphamide; antifibrotic nintedanib in selected cases.</li>
        <li><b>Pulmonary hypertension:</b> PDE5i, ERAs, prostacyclin analogs; manage within PH programs.</li>
        <li><b>Arthritis:</b> NSAIDs/short-course glucocorticoids; hydroxychloroquine; methotrexate if no lung/PH concerns.</li>
        <li><b>Myositis:</b> Glucocorticoids + steroid-sparing (MMF, azathioprine); refractory: IVIG/rituximab in selected cases.</li>
        <li><b>GI reflux/dysmotility:</b> PPI, prokinetics; aspiration precautions.</li>
      </ul>

      <h2>Prognosis & Complications</h2>
      <p>
        Long-term outcomes depend on PH and ILD. Digital ulcers risk infection and tissue loss.
        Address osteoporosis, infection risk, and cardiometabolic health. Multidisciplinary planning
        for pregnancy is advised during low disease activity.
      </p>

      <hr className="my-6" />
      <section className="text-sm opacity-70 mt-4">
        📖 References: Harrison, Cecil/Goldman, UpToDate, EULAR/ACR guidance, Kelly’s, Firestein, Dubois, Oxford, ACR Primer.
      </section>

      <p className="mt-6">
        <Link href="/en/topics/romatoloji" className="underline">← Back to Rheumatology index</Link>
      </p>
    </article>
  );
}


