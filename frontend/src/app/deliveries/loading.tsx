import AuthGuard from '@/components/AuthGuard';
import { Skeleton, ListSkeleton } from '@/components/Skeleton';

export default function DeliveriesLoading() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={200} height={26} />
            <Skeleton width={320} height={12} />
          </div>
          <Skeleton width={140} height={40} rounded="xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2"
            >
              <Skeleton width={40} height={28} />
              <Skeleton width={70} height={10} />
            </div>
          ))}
        </div>
        <ListSkeleton rows={5} />
      </div>
    </AuthGuard>
  );
}
