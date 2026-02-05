const Skeleton = ({ variant = 'text', width = 'w-full', height = 'h-4', className = '' }) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    avatar: 'rounded-full',
    thumbnail: 'rounded-xl',
    card: 'rounded-xl',
  };

  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 ${variants[variant]} ${width} ${height} ${className}`}
    />
  );
};

export const SkeletonPostCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" width="w-10" height="h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="w-24" />
          <Skeleton variant="text" width="w-16" height="h-3" />
        </div>
      </div>
      <Skeleton variant="thumbnail" width="w-full" height="h-48" />
      <Skeleton variant="title" width="w-3/4" />
      <Skeleton variant="text" width="w-full" />
      <Skeleton variant="text" width="w-5/6" />
      <div className="flex gap-2">
        <Skeleton variant="text" width="w-20" height="h-8" />
        <Skeleton variant="text" width="w-20" height="h-8" />
      </div>
    </div>
  );
};

export default Skeleton;
