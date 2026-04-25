import AuthGuard from '@/components/AuthGuard';
import { Skeleton } from '@/components/Skeleton';

export default function ForecastingLoading() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton width={220} height={26} />
          <Skeleton width={360} height={12} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="flex-1" height={48} rounded="xl" />
            <Skeleton width={180} height={48} rounded="xl" />
          </div>
          <Skeleton width="100%" height={320} rounded="xl" />
        </div>
      </div>
    </AuthGuard>
  );
}
