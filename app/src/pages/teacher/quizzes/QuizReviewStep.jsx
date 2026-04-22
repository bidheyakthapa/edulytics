export default function QuizReviewStep({
  meta,
  topics,
  questions,
  saving,
  onEdit,
  onSubmit,
  isEdit = false,
}) {
  const getTopicName = (topicId) => {
    return topics.find((t) => String(t.id) === String(topicId))?.name || "—";
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Review</div>
          <div className="mt-1 text-sm text-slate-600">
            Confirm everything before creating the quiz.
          </div>
        </div>

        <button
          onClick={onEdit}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
          type="button"
        >
          Back to Questions
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="font-semibold text-slate-800">
          {meta.title || "(No title)"}
        </div>

        {meta.description ? (
          <div className="mt-1 text-sm text-slate-600">{meta.description}</div>
        ) : null}

        <div className="mt-2 text-xs text-slate-500">
          Time limit:{" "}
          <span className="font-medium">{meta.time_limit_min} min</span> •
          Questions: <span className="font-medium">{questions.length}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {questions.map((q, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-800">
                Q{i + 1}. {q.question_text || "(empty)"}
              </div>
              <div className="text-xs text-slate-500">
                Topic:{" "}
                <span className="font-medium">{getTopicName(q.topic_id)}</span>
              </div>
            </div>

            <ul className="mt-3 grid gap-2">
              {q.options.map((o, idx) => (
                <li
                  key={idx}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    o.is_correct
                      ? "border-primary-200 bg-primary-50 text-primary-800"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {o.option_text || "(empty option)"}
                  {o.is_correct ? (
                    <span className="ml-2 text-xs font-semibold">
                      (correct)
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onEdit}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
          type="button"
        >
          Edit
        </button>

        <button
          onClick={onSubmit}
          disabled={saving}
          className="rounded-xl bg-primary-600 px-5 py-2 text-white text-sm hover:bg-primary-700
                     disabled:opacity-60 cursor-pointer"
          type="button"
        >
          {saving
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Quiz"
              : "Create Quiz"}
        </button>
      </div>
    </div>
  );
}
