export const revalidate = 0;
export const dynamic = "force-dynamic";
// FILE: web/app/sections/[section]/loading.tsx
export default function LoadingSectionPage() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-pulse space-y-4">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-8 w-1/2 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}


