'use client';
import baseToast, { Toaster as BaseToaster, type Toast } from 'react-hot-toast';

/**
 * Centralised toast helpers so every page renders the same shape, colours,
 * and duration. Pages should import `toast` from here, never directly from
 * react-hot-toast.
 *
 * Mount `<AppToaster />` once at the root layout — pages don't need to add
 * their own `<Toaster />`.
 */

const baseStyle: Toast['style'] = {
  borderRadius: '14px',
  background: '#0f172a',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 500,
  padding: '12px 14px',
  boxShadow: '0 12px 32px -8px rgba(15,23,42,0.35)',
};

export const toast = {
  success(msg: string) {
    return baseToast.success(msg, {
      style: baseStyle,
      iconTheme: { primary: '#10b981', secondary: '#0f172a' },
      duration: 3000,
    });
  },
  error(msg: string) {
    return baseToast.error(msg, {
      style: { ...baseStyle, background: '#7f1d1d' },
      iconTheme: { primary: '#fff', secondary: '#7f1d1d' },
      duration: 4500,
    });
  },
  info(msg: string) {
    return baseToast(msg, {
      style: baseStyle,
      icon: 'ℹ️',
      duration: 3000,
    });
  },
  loading(msg: string) {
    return baseToast.loading(msg, { style: baseStyle });
  },
  dismiss(id?: string) {
    baseToast.dismiss(id);
  },
};

export function AppToaster() {
  return <BaseToaster position="top-center" gutter={10} />;
}
