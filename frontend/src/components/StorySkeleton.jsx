export const StorySkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between animate-pulse h-[420px]"
        >
          <div>
            <div className="w-full h-48 bg-slate-100 rounded-xl mb-4" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-20 h-5 bg-slate-100 rounded-md" />
              <div className="w-16 h-5 bg-slate-100 rounded-md" />
            </div>
            <div className="w-3/4 h-6 bg-slate-200 rounded-md mb-2" />
            <div className="w-full h-4 bg-slate-100 rounded mb-1" />
            <div className="w-5/6 h-4 bg-slate-100 rounded" />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-24 h-4 bg-slate-200 rounded" />
            </div>
            <div className="w-12 h-4 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
