const MessageSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-base-200 animate-pulse"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-base-200 animate-pulse"></div>
            <div className="h-3 w-16 bg-base-200 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
