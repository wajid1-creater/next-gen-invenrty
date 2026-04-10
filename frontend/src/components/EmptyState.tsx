import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mb-5 animate-float">
        <Icon size={32} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1.5 text-center max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
