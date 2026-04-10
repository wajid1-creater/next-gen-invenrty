import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({ label, value, icon: Icon, color, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={!trendUp ? 'rotate-180' : ''}>
                <path d="M6 2L10 7H2L6 2Z" fill="currentColor"/>
              </svg>
              {trend}
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
