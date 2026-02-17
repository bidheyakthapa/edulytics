import Field from "../../../components/ui/Field.jsx";

export default function QuizDetailsStep({
  meta,
  setMeta,
  canGoNext,
  onNext,
  structureLocked = false,
  onSaveMeta,
  saving = false,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4">
        <Field label="Title">
          <input
            value={meta.title}
            onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="e.g. React Basics Quiz"
          />
        </Field>

        <Field label="Description (optional)">
          <textarea
            value={meta.description}
            onChange={(e) =>
              setMeta((m) => ({ ...m, description: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            rows={4}
            placeholder="Short note about what this quiz covers..."
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Time Limit (minutes)">
            <input
              type="number"
              min={1}
              value={meta.time_limit_min}
              onChange={(e) =>
                setMeta((m) => ({
                  ...m,
                  time_limit_min: Number(e.target.value),
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                         focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </Field>
        </div>

        <div className="flex justify-end">
          {structureLocked ? (
            <button
              disabled={!canGoNext || saving}
              onClick={onSaveMeta}
              className="rounded-xl bg-primary-600 px-5 py-2 text-white text-sm hover:bg-primary-700
                 disabled:opacity-60 transition cursor-pointer"
              type="button"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          ) : (
            <button
              disabled={!canGoNext}
              onClick={onNext}
              className="rounded-xl bg-primary-600 px-5 py-2 text-white text-sm hover:bg-primary-700
                 disabled:opacity-60 transition cursor-pointer"
              type="button"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
