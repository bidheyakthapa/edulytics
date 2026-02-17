export default function Field({ label, hint, children }) {
  return (
    <div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
