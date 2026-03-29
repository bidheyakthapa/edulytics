import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function ResultScreen({ result, quiz, onDone }) {
  const percentage = Math.round(
    (result.totalScore / result.totalQuestions) * 100,
  );

  const isPassing = percentage >= 50;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">Quiz Complete</h1>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-center">
        {/* icon */}
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full
            ${isPassing ? "bg-green-50" : "bg-amber-50"}`}
        >
          {isPassing ? (
            <FiCheckCircle className="text-2xl text-green-600" />
          ) : (
            <FiAlertCircle className="text-2xl text-amber-500" />
          )}
        </div>

        <div className="mt-4 text-2xl font-bold text-slate-800">
          {result.totalScore}{" "}
          <span className="text-lg font-normal text-slate-400">
            / {result.totalQuestions}
          </span>
        </div>

        <div className="mt-1 text-sm text-slate-500">{percentage}% correct</div>

        <div className="mt-2 text-sm font-medium text-slate-700">
          {quiz.title}
        </div>

        <div
          className={`mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium
            ${isPassing ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
        >
          {isPassing ? "Well done!" : "Keep practicing!"}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Your topic mastery has been updated based on this attempt.
        </p>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          onClick={onDone}
          className="rounded-xl bg-primary-600 px-6 py-2 text-sm text-white hover:bg-primary-700 transition cursor-pointer"
          type="button"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}
