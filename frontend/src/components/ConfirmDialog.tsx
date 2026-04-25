'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Promise-based confirmation dialog.
 *
 * Why: native `confirm()` looks unprofessional and can't be styled. Pages call
 * `await confirm({...})` exactly like the native API, get back a boolean, and
 * never have to manage modal open/close state themselves.
 *
 * Provider mounts once at the app root; consumers grab `useConfirm()`.
 */

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** "danger" colours the confirm button red and uses the warning icon. */
  variant?: 'default' | 'danger';
}

interface ConfirmState extends Required<Omit<ConfirmOptions, 'variant'>> {
  variant: NonNullable<ConfirmOptions['variant']>;
  resolver: (value: boolean) => void;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm() must be used inside <ConfirmProvider>');
  }
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [isPending, setIsPending] = useState(false);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      setState({
        title: opts.title,
        description: opts.description ?? '',
        confirmText: opts.confirmText ?? 'Confirm',
        cancelText: opts.cancelText ?? 'Cancel',
        variant: opts.variant ?? 'default',
        resolver: resolve,
      });
    });
  }, []);

  const close = useCallback(
    (value: boolean) => {
      if (!state) return;
      state.resolver(value);
      setState(null);
      setIsPending(false);
    },
    [state],
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') {
        setIsPending(true);
        close(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => close(false)}
            aria-hidden
          />
          <div
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby={state.description ? 'confirm-desc' : undefined}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-fade-in-scale"
          >
            <div className="flex items-start gap-4">
              <div
                className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${
                  state.variant === 'danger' ? 'bg-red-50' : 'bg-blue-50'
                }`}
                aria-hidden
              >
                <AlertTriangle
                  size={20}
                  className={state.variant === 'danger' ? 'text-red-500' : 'text-blue-500'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="confirm-title" className="text-base font-semibold text-gray-900">
                  {state.title}
                </h2>
                {state.description && (
                  <p id="confirm-desc" className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                    {state.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                disabled={isPending}
              >
                {state.cancelText}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setIsPending(true);
                  close(true);
                }}
                disabled={isPending}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-md transition-colors disabled:opacity-60 ${
                  state.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                }`}
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
