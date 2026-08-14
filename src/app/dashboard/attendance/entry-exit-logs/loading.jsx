export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}