export default function MasteryDot({ p_know }) {
  if (p_know === null) {
    return <span className="text-slate-300 text-xs">—</span>;
  }

  const percentage = Math.round(p_know * 100);

  const color =
    percentage >= 70
      ? "bg-green-100 text-green-700"
      : percentage >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-600";

  return (
    <span
      className={`inline-block rounded-lg px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {percentage}%
    </span>
  );
}
