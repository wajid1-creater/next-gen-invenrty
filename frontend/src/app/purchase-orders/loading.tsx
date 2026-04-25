import AuthGuard from '@/components/AuthGuard';
import { Skeleton, ListSkeleton } from '@/components/Skeleton';

export default function PurchaseOrdersLoading() {
  return (
    <AuthGuard>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={200} height={26} />
            <Skeleton width={300} height={12} />
          </div>
          <Skeleton width={140} height={40} rounded="xl" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2"
            >
              <Skeleton width={32} height={20} />
              <Skeleton width={60} height={20} rounded="full" />
            </div>
          ))}
        </div>
        <ListSkeleton rows={5} />
      </div>
    </AuthGuard>
  );
}
