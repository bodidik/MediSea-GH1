// FILE: web/app/topics/loading.tsx
export default function LoadingTopics() {
return (
<div className="p-6 md:p-10 max-w-6xl mx-auto animate-pulse space-y-4">
<div className="h-8 w-48 bg-gray-200 rounded" />
<div className="rounded-2xl border p-4 bg-white">
<div className="h-8 bg-gray-200 rounded" />
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{Array.from({ length: 6 }).map((_, i) => (
<div key={i} className="h-28 bg-gray-200 rounded-2xl" />
))}
</div>
</div>
);
}


