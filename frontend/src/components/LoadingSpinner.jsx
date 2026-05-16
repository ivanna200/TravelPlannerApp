import { Plane } from 'lucide-react';

const LoadingSpinner = ({ text = 'Učitavanje...' }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-14 h-14 border-4 border-slate-200 rounded-full animate-spin border-t-sky-500" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Plane className="w-5 h-5 text-sky-500" />
      </div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{text}</p>
  </div>
);

export default LoadingSpinner;
