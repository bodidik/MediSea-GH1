export const runtime = "nodejs";
export const revalidate = 7776000;
import ChildLinks from "@/components/ChildLinks";
import Link from "next/link";

const items: Array<{ href: string; label: string }> = [];
export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Kardiyoloji — Dizin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it:any) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.href.split("/").slice(-1)[0]}</div>
          </Link>
        ))}
      </div>
      <ChildLinks appSubPath="topics/topics/kardiyoloji" premiumHref="/premium/ydus" premiumLabel="PREMİUM YDUS" />
</main>
  );
}









