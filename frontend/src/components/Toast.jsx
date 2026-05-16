import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
};

const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-rose-50 border-rose-200 text-rose-700',
  info:    'bg-sky-50 border-sky-200 text-sky-700',
};

const Toast = ({ message, type = 'success', onClose }) => {
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-modal max-w-sm animate-slide-up ${STYLES[type]}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;
