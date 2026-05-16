export const revalidate = 0;
export const dynamic = "force-dynamic";
// FILE: web/app/sections/loading.tsx
export default function LoadingSectionsIndex() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}




