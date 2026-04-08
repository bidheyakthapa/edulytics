import { Link } from "react-router-dom";

export default function NextStepCard({ label, value, sub, to }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-slate-100 bg-white p-4
                 shadow-sm hover:border-primary-200 hover:shadow-md transition"
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
      <div className="mt-3 text-xs font-medium text-primary-600">Go →</div>
    </Link>
  );
}
