export default function TopicBar({ topic }) {
  const percentage = topic.avg_mastery
    ? Math.round(parseFloat(topic.avg_mastery) * 100)
    : 0;

  const barColor =
    percentage >= 70
      ? "bg-green-400"
      : percentage >= 40
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{topic.topic_name}</span>
        <span className="text-slate-500">
          {percentage}% avg · {topic.student_count} students
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
