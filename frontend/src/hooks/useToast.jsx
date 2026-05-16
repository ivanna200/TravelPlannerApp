import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast mora biti unutar ToastProvider');
  return ctx;
};
