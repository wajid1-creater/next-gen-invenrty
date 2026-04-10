interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="animate-slide-in-right">{action}</div>}
    </div>
  );
}
