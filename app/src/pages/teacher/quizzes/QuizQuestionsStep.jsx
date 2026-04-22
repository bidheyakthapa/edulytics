import { FiChevronLeft, FiChevronRight, FiTrash2 } from "react-icons/fi";
import Field from "../../../components/ui/Field.jsx";
import { createEmptyQuestion } from "../../../utils/quizTemplates.js";

export default function QuizQuestionsStep({
  topics,
  loadingTopics,
  questions,
  setQuestions,
  activeIndex,
  setActiveIndex,
  onBack,
  onReview,
}) {
  const active = questions[activeIndex];

  const goPrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const goNext = () => {
    if (activeIndex < questions.length - 1) {
      setActiveIndex(activeIndex + 1);
      return;
    }
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
    setActiveIndex(questions.length);
  };

  const removeQuestion = () => {
    if (questions.length <= 1) return;

    setQuestions((prev) => prev.filter((_, idx) => idx !== activeIndex));
    setActiveIndex((prev) => Math.max(0, Math.min(prev, questions.length - 2)));
  };

  const setQuestionField = (key, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeIndex ? { ...q, [key]: value } : q)),
    );
  };

  const setOptionText = (optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeIndex) return q;

        const options = q.options.map((o, i) =>
          i === optionIndex ? { ...o, option_text: value } : o,
        );

        return { ...q, options };
      }),
    );
  };

  const markCorrect = (optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeIndex) return q;

        const options = q.options.map((o, i) => ({
          ...o,
          is_correct: i === optionIndex,
        }));

        return { ...q, options };
      }),
    );
  };

  const addOption = () => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeIndex) return q;
        return {
          ...q,
          options: [...q.options, { option_text: "", is_correct: false }],
        };
      }),
    );
  };

  const removeOption = (optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== activeIndex) return q;
        if (q.options.length <= 2) return q;

        const removedWasCorrect = q.options[optionIndex]?.is_correct;
        let options = q.options.filter((_, i) => i !== optionIndex);

        if (removedWasCorrect) {
          options = options.map((o, i) => ({ ...o, is_correct: i === 0 }));
        }

        return { ...q, options };
      }),
    );
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Question {activeIndex + 1} of {questions.length}
          </div>
          <div className="text-xs text-slate-500">
            Click Next on the last question to create a new one.
          </div>
        </div>

        {questions.length > 1 ? (
          <button
            onClick={removeQuestion}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm
                       text-slate-700 hover:bg-slate-50 cursor-pointer"
            type="button"
          >
            <FiTrash2 />
            Remove Question
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4">
        {/* Topic */}
        <Field
          label="Topic"
          hint="Pick the concept this question tests. Used for analytics."
        >
          <select
            value={active.topic_id}
            onChange={(e) => setQuestionField("topic_id", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm
                       outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 cursor-pointer"
            disabled={loadingTopics}
          >
            <option value="">
              {loadingTopics ? "Loading topics..." : "Select topic"}
            </option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Question">
          <input
            value={active.question_text}
            onChange={(e) => setQuestionField("question_text", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="Enter your question..."
          />
        </Field>

        <div>
          <div className="text-sm font-medium text-slate-700">Options</div>

          <div className="mt-2 grid gap-3">
            {active.options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3"
              >
                <input
                  value={opt.option_text}
                  onChange={(e) => setOptionText(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none
                             focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  placeholder={`Option ${idx + 1}`}
                />

                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-${activeIndex}`}
                    checked={opt.is_correct}
                    onChange={() => markCorrect(idx)}
                    className="cursor-pointer"
                  />
                  Correct
                </label>

                <button
                  onClick={() => removeOption(idx)}
                  disabled={active.options.length <= 2}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-white
                             disabled:opacity-50 cursor-pointer"
                  type="button"
                  title="Remove option"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addOption}
            className="mt-3 w-full rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm
                       text-primary-700 hover:bg-primary-100 transition cursor-pointer"
            type="button"
          >
            + Add option
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm
                       text-slate-700 hover:bg-slate-50 cursor-pointer"
              type="button"
            >
              <FiChevronLeft />
              Back
            </button>

            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm
                       text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              type="button"
            >
              <FiChevronLeft />
              Prev Question
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReview}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              type="button"
            >
              Review
            </button>

            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white text-sm
                         hover:bg-primary-700 transition cursor-pointer"
              type="button"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
