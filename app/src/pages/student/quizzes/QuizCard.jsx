import { FiClock, FiCheckCircle, FiPlayCircle } from "react-icons/fi";

export default function QuizCard({ quiz, onAttempt, onViewResult }) {
  const timeInMinutes = Math.round((quiz.time_limit_sec || 600) / 60);
  const alreadyAttempted = Number(quiz.attemptCount) > 0;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-slate-800">{quiz.title}</div>

        {alreadyAttempted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-1 text-xs text-green-700">
            <FiCheckCircle />
            Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-200 px-2 py-1 text-xs text-primary-700">
            <FiPlayCircle />
            New
          </span>
        )}
      </div>

      {quiz.description && (
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
          {quiz.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
        <FiClock />
        <span>{timeInMinutes} min</span>
      </div>

      <div className="mt-4">
        {alreadyAttempted ? (
          <button
            onClick={onViewResult}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-300 px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition cursor-pointer"
            type="button"
          >
            View Result
          </button>
        ) : (
          <button
            onClick={onAttempt}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 transition cursor-pointer"
            type="button"
          >
            <FiPlayCircle />
            Start Quiz
          </button>
        )}
      </div>
    </div>
  );
}
