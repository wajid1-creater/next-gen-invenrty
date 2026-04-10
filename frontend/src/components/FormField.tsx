interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

export default function FormField({ label, children, required, hint }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 ${className}`}
    />
  );
}

export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 transition-all duration-200 hover:border-gray-300 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 appearance-none ${className}`}
    >
      {children}
    </select>
  );
}

export function Button({ variant = 'primary', className = '', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {
  const base = 'px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 justify-center';
  const variants = {
    primary: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/30',
    secondary: 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}
