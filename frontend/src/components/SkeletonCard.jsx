const SkeletonCard = () => (
  <div className="card">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="skeleton h-5 w-3/4 mb-2" />
        <div className="skeleton h-3.5 w-1/2" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full ml-2" />
    </div>
    <div className="skeleton h-3.5 w-full mb-2" />
    <div className="skeleton h-3.5 w-2/3 mb-4" />
    <div className="flex gap-2 pt-4 border-t border-slate-100">
      <div className="skeleton h-9 flex-1 rounded-xl" />
      <div className="skeleton h-9 w-9 rounded-xl" />
      <div className="skeleton h-9 w-9 rounded-xl" />
    </div>
  </div>
);

export default SkeletonCard;
