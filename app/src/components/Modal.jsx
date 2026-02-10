export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-xl px-3 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="px-5 py-4">{children}</div>

          {footer ? (
            <div className="px-5 py-4 border-t border-slate-100">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
