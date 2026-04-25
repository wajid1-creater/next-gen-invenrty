import AuthGuard from '@/components/AuthGuard';
import { Skeleton, ListSkeleton } from '@/components/Skeleton';

export default function NotificationsLoading() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={200} height={26} />
            <Skeleton width={220} height={12} />
          </div>
          <Skeleton width={160} height={36} rounded="xl" />
        </div>
        <ListSkeleton rows={6} />
      </div>
    </AuthGuard>
  );
}
