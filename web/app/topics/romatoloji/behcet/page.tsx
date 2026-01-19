export const runtime = "nodejs";
export const revalidate = 7776000;
import ChildLinks from "@/components/ChildLinks";
export default function Page() {
  return (
    <main className="prose max-w-3xl px-4 py-8">
      <h1>Behçet Hastalığı</h1>
      <p className="text-sm opacity-70">
        Bu özet; Harrison’s, UpToDate, EULAR kılavuzları ve temel romatoloji
        kaynaklarına dayanmaktadır.
      </p>

      <h2>Tanım & Epidemiyoloji</h2>
      <ul>
        <li>Tekrarlayan oral aft + genital ülser + üveit üçlüsü tipik.</li>
        <li>İpek Yolu coğrafyasında sık; M 20–40 yaşlarda daha belirgin.</li>
      </ul>

      <h2>Patogenez (kısa)</h2>
      <ul>
        <li>Otoinflamatuvar spektrumda; HLA-B51 ile ilişki.</li>
        <li>Nötrofil hiperaktivitesi, endotelyal inflamasyon.</li>
      </ul>

      <h2>Klinik</h2>
      <ul>
        <li>Mukokutanöz: oral/genital ülser, eritema nodozum/psödofollikülit.</li>
        <li>Göz: ön/arka üveit, hipopiyon; görme kaybı riski.</li>
        <li>Vasküler: venöz tromboz, pulmoner arter anevrizması.</li>
        <li>Nöro-Behçet: parankimal/non-parankimal formlar.</li>
      </ul>

      <h2>Tanı (klinik)</h2>
      <ul>
        <li>ICBD puan bazlı yaklaşım; paterji testi destekleyici.</li>
        <li>Diferansiyel: HSV, aftöz stomatit, Crohn, vaskülitler.</li>
      </ul>

      <h2>Tedavi (özet)</h2>
      <ul>
        <li>Mukokutanöz: kolşisin ± topikal/az doz steroid; dirençte azatiyoprin, apremilast.</li>
        <li>Göz/majör organ: yüksek doz steroid + immünsüpresif; ağırda anti-TNF.</li>
        <li>Vasküler: arter anevrizmasında immünsüpresyon öncelikli; trombozda bireysel karar.</li>
      </ul>

      <h2>İzlem</h2>
      <ul>
        <li>Göz ve vasküler tutulumda yakın kontrol; relaps önleme stratejileri.</li>
      </ul>

      <ChildLinks appSubPath="topics/romatoloji/behcet" premiumHref="/premium/behcet" />
    </main>
  );
}

