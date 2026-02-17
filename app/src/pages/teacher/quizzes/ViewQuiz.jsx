import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ViewQuiz({ quizId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await axios.get(`/api/quizzes/${quizId}`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  if (loading) {
    return <div className="text-sm text-slate-600">Loading quiz...</div>;
  }

  if (!data) {
    return (
      <div>
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm cursor-pointer"
        >
          Back
        </button>
        <div className="mt-4 text-sm text-slate-600">Quiz not found.</div>
      </div>
    );
  }

  const { quiz, questions, attemptCount } = data;

  return (
    <div>
      <button
        onClick={onBack}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm cursor-pointer"
      >
        Back
      </button>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="text-lg font-semibold text-slate-800">{quiz.title}</div>

        {quiz.description && (
          <div className="mt-2 text-sm text-slate-600">{quiz.description}</div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          Time: {Math.round((quiz.time_limit_sec || 600) / 60)} min • Attempts:{" "}
          {attemptCount}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="font-medium text-slate-800">
              Q{i + 1}. {q.question_text}
            </div>

            <ul className="mt-3 grid gap-2">
              {q.options.map((opt) => (
                <li
                  key={opt.id}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    opt.is_correct
                      ? "border-primary-200 bg-primary-50 text-primary-800"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {opt.option_text}
                  {opt.is_correct && (
                    <span className="ml-2 text-xs font-semibold">
                      (correct)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
