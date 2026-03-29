import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TimerBadge from "./TimerBadge.jsx";
import ResultScreen from "./ResultScreen.jsx";

export default function AttemptQuiz({ quizId, onDone, onCancel }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // stores selected option per question: { [question_id]: selected_option_id }
  const [answers, setAnswers] = useState({});

  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const timerRef = useRef(null);

  // ── fetch quiz questions from backend ─────────────────────────────────────
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/student/quizzes/${quizId}`, {
          withCredentials: true,
        });
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.quiz.time_limit_sec);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load quiz");
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // ── countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || result) return;

    if (timeLeft <= 0) {
      handleSubmit(true); // auto submit when time runs out
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, result]);

  // ── select an option for a question ──────────────────────────────────────
  const selectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // ── submit quiz ───────────────────────────────────────────────────────────
  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;

    clearTimeout(timerRef.current);

    if (!isAutoSubmit) {
      const unansweredCount = questions.filter((q) => !answers[q.id]).length;
      if (unansweredCount > 0) {
        const confirmed = window.confirm(
          `You have ${unansweredCount} unanswered question(s). Submit anyway?`,
        );
        if (!confirmed) return;
      }
    }

    setSubmitting(true);

    // only send questions the student actually answered
    // backend handles unanswered ones as incorrect automatically
    const payload = Object.entries(answers).map(
      ([question_id, selected_option_id]) => ({
        question_id: Number(question_id),
        selected_option_id: Number(selected_option_id),
      }),
    );

    try {
      const res = await axios.post(
        `/api/student/quizzes/${quizId}/submit`,
        { answers: payload },
        { withCredentials: true },
      );

      setResult({
        totalScore: res.data.totalScore,
        totalQuestions: res.data.totalQuestions,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit quiz");
      setSubmitting(false);
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="text-sm text-slate-600">Loading quiz...</div>;
  }

  // ── result screen ─────────────────────────────────────────────────────────
  if (result) {
    return <ResultScreen result={result} quiz={quiz} onDone={onDone} />;
  }

  const activeQuestion = questions[activeIndex];
  const totalAnswered = Object.keys(answers).length;
  const progressPercent = Math.round((totalAnswered / questions.length) * 100);

  return (
    <div>
      {/* Header with title and timer */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{quiz.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Question {activeIndex + 1} of {questions.length}
          </p>
        </div>
        <TimerBadge timeLeft={timeLeft} />
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {totalAnswered} of {questions.length} answered
      </p>

      {/* Question card */}
      <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-800">
          Q{activeIndex + 1}. {activeQuestion.question_text}
        </div>

        <div className="mt-4 grid gap-3">
          {activeQuestion.options.map((opt) => {
            const isSelected = answers[activeQuestion.id] === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => selectOption(activeQuestion.id, opt.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition cursor-pointer
                  ${
                    isSelected
                      ? "border-primary-400 bg-primary-50 text-primary-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                type="button"
              >
                {opt.option_text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={activeIndex === 0}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          type="button"
        >
          Previous
        </button>

        {/* dots for quick jumping between questions */}
        <div className="hidden sm:flex items-center gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition cursor-pointer
                ${
                  i === activeIndex
                    ? "bg-primary-600 scale-125"
                    : answers[q.id]
                      ? "bg-primary-300"
                      : "bg-slate-200"
                }`}
              type="button"
              title={`Question ${i + 1}`}
            />
          ))}
        </div>

        {activeIndex < questions.length - 1 ? (
          <button
            onClick={() => setActiveIndex((i) => i + 1)}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 transition cursor-pointer"
            type="button"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-60 transition cursor-pointer"
            type="button"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>

      {/* Cancel link at bottom */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          type="button"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  );
}
