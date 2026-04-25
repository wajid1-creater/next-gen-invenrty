import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'plain' | 'card';
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = 'plain',
}: EmptyStateProps) {
  const inner = (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center mb-4">
        <Icon size={18} className="text-zinc-500" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && (
        <p className="text-[13px] text-zinc-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-lg border border-zinc-200/80 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
        {inner}
      </div>
    );
  }
  return inner;
}
