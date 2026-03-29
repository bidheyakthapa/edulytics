import { FiClock } from "react-icons/fi";

export default function TimerBadge({ timeLeft }) {
  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // turns red when under 1 minute
  const isUrgent = timeLeft <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium
        ${
          isUrgent
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-white text-slate-700"
        }`}
    >
      <FiClock className={isUrgent ? "text-red-500" : "text-slate-400"} />
      {formatted}
    </div>
  );
}
