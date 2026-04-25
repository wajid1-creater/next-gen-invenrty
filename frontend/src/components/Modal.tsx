'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-labelledby="modal-title"
        className={`relative bg-white rounded-lg shadow-[0_24px_48px_rgba(9,9,11,0.18)] ${sizeMap[size]} w-full max-h-[90vh] overflow-auto animate-scale-in`}
      >
        <div className="sticky top-0 bg-white z-10 flex items-start justify-between px-5 py-4 border-b border-zinc-200">
          <div>
            <h3 id="modal-title" className="text-base font-semibold text-zinc-900">
              {title}
            </h3>
            {subtitle && <p className="text-[13px] text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 hover:bg-zinc-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-zinc-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
