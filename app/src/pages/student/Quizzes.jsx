import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import QuizCard from "./quizzes/QuizCard.jsx";
import AttemptQuiz from "./quizzes/AttemptQuiz.jsx";
import ViewResult from "./quizzes/ViewResult.jsx";

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptingQuizId, setAttemptingQuizId] = useState(null);
  const [viewingResultQuizId, setViewingResultQuizId] = useState(null);

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

  // when student finishes or cancels, go back to list
  const handleAttemptDone = () => {
    setAttemptingQuizId(null);
    fetchQuizzes(); // refresh so attempted status updates
  };

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

      <div className="mt-6">
        {loading ? (
          <div className="text-sm text-slate-600">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="font-medium text-slate-800">No quizzes yet</div>
            <div className="mt-1 text-sm text-slate-600">
              Your teacher hasn't assigned any quizzes yet.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {quizzes.map((quiz) => (
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
