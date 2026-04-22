export default function WeakTopicsBar({ topics }) {
  if (topics.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
        No mastery data yet.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {topics.map((topic) => {
        const pct = topic.avg_mastery ? Math.round(topic.avg_mastery * 100) : 0;

        return (
          <div
            key={topic.topic_name}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {topic.topic_name}
              </span>
              <span className="text-green-500 font-medium">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-green-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
