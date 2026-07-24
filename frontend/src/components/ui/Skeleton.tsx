interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
}

export default function Skeleton({ className = '', count = 1, height = 'h-4' }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${height} rounded`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 ${className}`}>
      <div className="skeleton h-4 w-24 mb-3 rounded" />
      <div className="skeleton h-8 w-32 mb-2 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-800/50">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 flex-1 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
