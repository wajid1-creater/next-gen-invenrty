import AuthGuard from '@/components/AuthGuard';
import { Skeleton, TableSkeleton } from '@/components/Skeleton';

export default function ProductsLoading() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={220} height={26} />
            <Skeleton width={280} height={12} />
          </div>
          <Skeleton width={140} height={40} rounded="xl" />
        </div>
        <TableSkeleton rows={6} cols={7} />
      </div>
    </AuthGuard>
  );
}
