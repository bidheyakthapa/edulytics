import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiArrowLeft } from "react-icons/fi";

export default function ViewResult({ quizId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/student/quizzes/${quizId}/result`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load result");
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId]);

  if (loading) {
    return <div className="text-sm text-slate-600">Loading result...</div>;
  }

  const { quiz, attempt, questions } = data;
  const percentage = Math.round(
    (attempt.total_score / attempt.total_questions) * 100,
  );
  const isPassing = percentage >= 50;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 transition cursor-pointer"
          type="button"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{quiz.title}</h1>
          <p className="text-sm text-slate-500">
            {attempt.total_score} / {attempt.total_questions} correct &middot;{" "}
            {percentage}%
          </p>
        </div>
      </div>

      {/* Score summary */}
      <div
        className={`mt-5 rounded-2xl border p-4 text-center
          ${
            isPassing
              ? "border-green-100 bg-green-50"
              : "border-amber-100 bg-amber-50"
          }`}
      >
        <div className="text-2xl font-bold text-slate-800">
          {attempt.total_score}{" "}
          <span className="text-lg font-normal text-slate-400">
            / {attempt.total_questions}
          </span>
        </div>
        <div
          className={`mt-1 text-sm font-medium
            ${isPassing ? "text-green-700" : "text-amber-700"}`}
        >
          {isPassing ? "Well done!" : "Keep practicing!"}
        </div>
      </div>

      {/* Per question breakdown */}
      <div className="mt-5 space-y-3">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`rounded-2xl border p-4
              ${
                q.is_correct
                  ? "border-green-100 bg-white"
                  : "border-red-100 bg-white"
              }`}
          >
            {/* Question text */}
            <div className="flex items-start gap-2">
              {q.is_correct ? (
                <FiCheckCircle className="mt-0.5 shrink-0 text-green-500" />
              ) : (
                <FiXCircle className="mt-0.5 shrink-0 text-red-400" />
              )}
              <span className="text-sm font-medium text-slate-800">
                Q{i + 1}. {q.question_text}
              </span>
            </div>

            {/* Answer info */}
            <div className="mt-3 space-y-1 pl-6">
              {/* What they picked */}
              <div className="text-xs text-slate-500">
                Your answer:{" "}
                <span
                  className={
                    q.is_correct
                      ? "text-green-700 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {q.selected_option?.text ?? "Not answered"}
                </span>
              </div>

              {/* Correct answer — only show if they got it wrong */}
              {!q.is_correct && (
                <div className="text-xs text-slate-500">
                  Correct answer:{" "}
                  <span className="text-green-700 font-medium">
                    {q.correct_option?.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Back button */}
      <div className="mt-6">
        <button
          onClick={onBack}
          className="rounded-xl bg-primary-600 px-5 py-2 text-sm text-white hover:bg-primary-700 transition cursor-pointer"
          type="button"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}
