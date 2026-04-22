import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import QuizCard from "./quizzes/QuizCard.jsx";
import AttemptQuiz from "./quizzes/AttemptQuiz.jsx";
import ViewResult from "./quizzes/ViewResult.jsx";

const FILTERS = ["All", "New", "Done"];

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptingQuizId, setAttemptingQuizId] = useState(null);
  const [viewingResultQuizId, setViewingResultQuizId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/student/quizzes", {
        withCredentials: true,
      });
      setQuizzes(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleAttemptDone = () => {
    setAttemptingQuizId(null);
    fetchQuizzes();
  };

  const filtered = quizzes.filter((q) => {
    if (activeFilter === "New") return Number(q.attemptCount) === 0;
    if (activeFilter === "Done") return Number(q.attemptCount) > 0;
    return true;
  });

  if (attemptingQuizId) {
    return (
      <AttemptQuiz
        quizId={attemptingQuizId}
        onDone={handleAttemptDone}
        onCancel={() => setAttemptingQuizId(null)}
      />
    );
  }

  if (viewingResultQuizId) {
    return (
      <ViewResult
        quizId={viewingResultQuizId}
        onBack={() => setViewingResultQuizId(null)}
      />
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-lg font-semibold text-slate-800">My Quizzes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Attempt quizzes assigned to your semester.
        </p>
      </div>

      {!loading && quizzes.length > 0 && (
        <div className="mt-4 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              type="button"
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition cursor-pointer
                ${
                  activeFilter === f
                    ? "bg-primary-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="text-sm text-slate-600">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="font-medium text-slate-800">No quizzes yet</div>
            <div className="mt-1 text-sm text-slate-600">
              Your teacher hasn't assigned any quizzes yet.
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="font-medium text-slate-800">
              No {activeFilter.toLowerCase()} quizzes
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {activeFilter === "New"
                ? "You've attempted all available quizzes!"
                : "You haven't attempted any quizzes yet."}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onAttempt={() => setAttemptingQuizId(quiz.id)}
                onViewResult={() => setViewingResultQuizId(quiz.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
