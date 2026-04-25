import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Compact stat tile. No gradient icons, no scale-on-hover, no colored shadows.
 * The accent ring on the icon is the only colour cue — used sparingly.
 */
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Tailwind text colour for the icon — kept neutral by default. */
  iconClass?: string;
  trend?: string;
  trendUp?: boolean;
  hint?: string;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  iconClass = 'text-zinc-700',
  trend,
  trendUp,
  hint,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-zinc-200/80 shadow-[0_1px_2px_rgba(9,9,11,0.04)] hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center">
          <Icon size={14} className={iconClass} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-zinc-900 tabular-nums tracking-tight">{value}</p>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
              trendUp ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}
