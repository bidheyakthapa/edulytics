export default function StepPill({ active, children }) {
  const base =
    "px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer select-none";
  const activeCls = "bg-primary-50 text-primary-700 border-primary-200";
  const idleCls = "bg-white text-slate-600 border-slate-200";

  return (
    <div className={`${base} ${active ? activeCls : idleCls}`}>{children}</div>
  );
}
