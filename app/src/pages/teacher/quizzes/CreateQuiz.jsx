import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import StepPill from "../../../components/ui/StepPill.jsx";
import { createEmptyQuestion } from "../../../utils/quizTemplates.js";

import QuizDetailsStep from "./QuizDetailsStep.jsx";
import QuizQuestionsStep from "./QuizQuestionsStep.jsx";
import QuizReviewStep from "./QuizReviewStep.jsx";

export default function CreateQuiz({
  canUseSemester,
  semesterId,
  onCancel,
  onCreated,

  // NEW props for edit
  editMode = false,
  quizId = null,
}) {
  // 1) wizard step
  const [step, setStep] = useState(1);

  // 2) topics for dropdown
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // 3) edit lock state
  const [attemptCount, setAttemptCount] = useState(0);
  const structureLocked = editMode && attemptCount > 0;

  // 4) quiz meta
  const [meta, setMeta] = useState({
    title: "",
    description: "",
    time_limit_min: 10,
  });

  // 5) questions state
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);

  // 6) loading quiz when editing
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const totalSteps = structureLocked ? 1 : 3;

  // ---------- load topics ----------
  useEffect(() => {
    const loadTopics = async () => {
      if (!canUseSemester) return;

      setLoadingTopics(true);
      try {
        const res = await axios.get("/api/topics", {
          params: { semesterId },
          withCredentials: true,
        });
        setTopics(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load topics");
      } finally {
        setLoadingTopics(false);
      }
    };

    loadTopics();
  }, [canUseSemester, semesterId]);

  // ---------- load quiz for edit ----------
  useEffect(() => {
    const loadQuiz = async () => {
      if (!editMode || !quizId) return;

      setLoadingQuiz(true);
      try {
        const res = await axios.get(`/api/quizzes/${quizId}`, {
          withCredentials: true,
        });

        const { quiz, questions: qs, attemptCount: ac } = res.data;

        setAttemptCount(Number(ac || 0));

        // hydrate meta
        setMeta({
          title: quiz.title || "",
          description: quiz.description || "",
          time_limit_min: Math.max(
            1,
            Math.round((quiz.time_limit_sec || 600) / 60),
          ),
        });

        // hydrate questions
        setQuestions(
          (qs || []).map((q) => ({
            topic_id: String(q.topic_id ?? ""),
            question_text: q.question_text ?? "",
            options: (q.options || []).map((o) => ({
              option_text: o.option_text ?? "",
              is_correct: Boolean(o.is_correct),
            })),
          })),
        );

        setActiveIndex(0);
        setStep(1);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load quiz");
        onCancel?.();
      } finally {
        setLoadingQuiz(false);
      }
    };

    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, quizId]);

  // ---------- step validation ----------
  const canGoNextFromDetails = useMemo(() => {
    return meta.title.trim().length >= 2 && Number(meta.time_limit_min) >= 1;
  }, [meta.title, meta.time_limit_min]);

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question_text.trim())
        return `Question ${i + 1}: question text is required`;
      if (!q.topic_id) return `Question ${i + 1}: topic is required`;
      if (q.options.length < 2)
        return `Question ${i + 1}: at least 2 options required`;
      if (q.options.some((o) => !o.option_text.trim()))
        return `Question ${i + 1}: all option texts are required`;

      const correctCount = q.options.filter((o) => o.is_correct).length;
      if (correctCount !== 1)
        return `Question ${i + 1}: pick exactly 1 correct option`;
    }
    return null;
  };

  // ---------- submit ----------
  const [saving, setSaving] = useState(false);

  const submitCreate = async () => {
    const error = validateQuestions();
    if (error) return toast.error(error);

    setSaving(true);
    try {
      const payload = {
        semester_id: Number(semesterId),
        title: meta.title.trim(),
        description: meta.description.trim(),
        time_limit_sec: Number(meta.time_limit_min) * 60,
        questions: questions.map((q) => ({
          topic_id: Number(q.topic_id),
          question_text: q.question_text.trim(),
          options: q.options.map((o) => ({
            option_text: o.option_text.trim(),
            is_correct: o.is_correct,
          })),
        })),
      }; // do nothing

      await axios.post("/api/quizzes", payload, { withCredentials: true });
      toast.success("Quiz created!");
      onCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    // if structure is locked, only meta can be saved
    setSaving(true);
    try {
      const metaPayload = {
        title: meta.title.trim(),
        description: meta.description.trim(),
        time_limit_sec: Number(meta.time_limit_min) * 60,
      };

      if (structureLocked) {
        await axios.patch(`/api/quizzes/${quizId}/meta`, metaPayload, {
          withCredentials: true,
        });
        toast.success("Quiz updated!");
        onCreated?.();
        return;
      }

      const error = validateQuestions();
      if (error) {
        toast.error(error);
        return;
      }

      const fullPayload = {
        semester_id: Number(semesterId),
        ...metaPayload,
        questions: questions.map((q) => ({
          topic_id: Number(q.topic_id),
          question_text: q.question_text.trim(),
          options: q.options.map((o) => ({
            option_text: o.option_text.trim(),
            is_correct: o.is_correct,
          })),
        })),
      };

      await axios.patch(`/api/quizzes/${quizId}`, fullPayload, {
        withCredentials: true,
      });

      toast.success("Quiz updated!");
      onCreated?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!canGoNextFromDetails)
      return toast.error("Please fill quiz details properly.");
    if (editMode) return submitEdit();
    return submitCreate();
  };

  // ---------- UI guards ----------
  if (!canUseSemester) {
    return (
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {editMode ? "Edit Quiz" : "Create Quiz"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Select a course and semester first.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            type="button"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (loadingQuiz) {
    return <div className="text-sm text-slate-600">Loading quiz...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            {editMode ? "Edit Quiz" : "Create Quiz"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Step {step} of {totalSteps}
          </p>

          {structureLocked ? (
            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This quiz has attempts ({attemptCount}). Questions/options are
              locked. You can only edit title/description/time.
            </div>
          ) : null}
        </div>

        <button
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
          type="button"
        >
          Cancel
        </button>
      </div>

      {/* Stepper */}
      {!structureLocked && (
        <div className="mt-4 flex gap-2">
          <StepPill active={step === 1}>Details</StepPill>
          <StepPill active={step === 2}>Questions</StepPill>
          <StepPill active={step === 3}>Review</StepPill>
        </div>
      )}

      {/* Step content */}
      {step === 1 && (
        <QuizDetailsStep
          meta={meta}
          setMeta={setMeta}
          canGoNext={canGoNextFromDetails}
          onNext={() => {
            if (structureLocked) return;
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <QuizQuestionsStep
          topics={topics}
          loadingTopics={loadingTopics}
          questions={questions}
          setQuestions={setQuestions}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onBack={() => setStep(1)}
          onReview={() => {
            if (structureLocked) {
              toast.error("Questions are locked for attempted quizzes.");
              return;
            }
            const error = validateQuestions();
            if (error) return toast.error(error);
            setStep(3);
          }}
          disabled={structureLocked}
        />
      )}

      {step === 3 && (
        <QuizReviewStep
          meta={meta}
          topics={topics}
          questions={questions}
          saving={saving}
          onEdit={() => setStep(2)}
          onSubmit={handleSubmit}
          structureLocked={structureLocked}
          isEdit={editMode}
        />
      )}
    </div>
  );
}
