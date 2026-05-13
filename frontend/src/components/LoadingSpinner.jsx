const LoadingSpinner = ({ text = 'Učitavanje...' }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="text-5xl mb-4 animate-bounce">✈️</div>
      <p className="text-slate-500 text-lg">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;