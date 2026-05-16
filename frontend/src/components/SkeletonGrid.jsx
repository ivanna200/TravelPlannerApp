import SkeletonCard from './SkeletonCard';

const SkeletonGrid = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonGrid;
