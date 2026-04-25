import AuthGuard from '@/components/AuthGuard';
import { Skeleton, StatsGridSkeleton, CardGridSkeleton } from '@/components/Skeleton';

export default function DashboardLoading() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton width={140} height={28} />
          <Skeleton width={420} height={14} />
        </div>
        <StatsGridSkeleton count={8} />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardGridSkeleton count={1} cols={2} />
          </div>
          <CardGridSkeleton count={1} cols={2} />
        </div>
      </div>
    </AuthGuard>
  );
}
