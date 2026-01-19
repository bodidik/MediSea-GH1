export const runtime = "nodejs";
export const revalidate = 7776000;
import ChildLinks from "@/components/ChildLinks";
export default function Page() {
  return (
    <main className="prose max-w-3xl px-4 py-8">
      <h1>Sistemik Lupus Eritematozus (SLE)</h1>
      <p className="text-sm opacity-70">
        Bu özet; Harrison’s, UpToDate, Goldman-Cecil, Kelley’s Rheumatology,
        EULAR/ACR kılavuzları ve temel kaynaklara dayanmaktadır.
      </p>

      <h2>Tanım & Epidemiyoloji</h2>
      <ul><li>…</li></ul>

      <h2>Patogenez (kısa)</h2>
      <ul><li>…</li></ul>

      <h2>Klinik</h2>
      <ul><li>…</li></ul>

      <h2>Tanı</h2>
      <ul><li>…</li></ul>

      <h2>Tedavi</h2>
      <ul><li>…</li></ul>

      <h2>İzlem</h2>
      <ul><li>…</li></ul>

      <ChildLinks appSubPath="topics/romatoloji/sle" premiumHref="/premium/ydus" premiumLabel="PREMİUM YDUS" />
    </main>
  );
}

