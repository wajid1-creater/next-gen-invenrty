import AuthGuard from '@/components/AuthGuard';
import { Skeleton, CardGridSkeleton } from '@/components/Skeleton';

export default function SuppliersLoading() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={200} height={26} />
            <Skeleton width={260} height={12} />
          </div>
          <Skeleton width={140} height={40} rounded="xl" />
        </div>
        <CardGridSkeleton count={6} cols={3} />
      </div>
    </AuthGuard>
  );
}
