function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentAttempts({ attempts }) {
  if (attempts.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
        No quiz attempts yet this semester.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {attempts.map((a, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl border
                     border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div>
            <div className="text-sm font-medium text-slate-800">
              {a.student_name}
            </div>
            <div className="text-xs text-slate-400">{a.quiz_title}</div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-slate-700">
              {a.total_score} / {a.total_questions}
            </div>
            <div className="text-xs text-slate-400">
              {timeAgo(a.attempted_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
