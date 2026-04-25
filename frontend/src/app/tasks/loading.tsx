import AuthGuard from '@/components/AuthGuard';
import { Skeleton } from '@/components/Skeleton';

export default function TasksLoading() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={180} height={26} />
            <Skeleton width={260} height={12} />
          </div>
          <Skeleton width={120} height={40} rounded="xl" />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, col) => (
            <div key={col} className="space-y-3">
              <Skeleton width="100%" height={36} rounded="xl" />
              {Array.from({ length: 3 }).map((_, row) => (
                <div
                  key={row}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2"
                >
                  <Skeleton width="80%" height={14} />
                  <Skeleton width="60%" height={10} />
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <Skeleton width={20} height={20} rounded="full" />
                    <Skeleton width={70} height={20} rounded="lg" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
