import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useTeacherContextStore } from "../../store/teacherContextStore.js";
import CreateQuiz from "./quizzes/CreateQuiz.jsx";
import ViewQuiz from "./quizzes/ViewQuiz.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";

export default function TeacherQuizzes() {
  const { courseId, semesterId } = useTeacherContextStore();

  const [mode, setMode] = useState("list");
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canUseSemester = Boolean(courseId) && Boolean(semesterId);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/quizzes", {
        params: semesterId ? { semesterId } : {},
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
    if (mode === "list") fetchQuizzes();
  }, [mode, semesterId]);

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await axios.delete(`/api/quizzes/${deleteId}`, { withCredentials: true });
      toast.success("Quiz deleted");
      setConfirmOpen(false);
      setDeleteId(null);
      fetchQuizzes();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeleteId(null);
  };

  if (mode === "create") {
    return (
      <CreateQuiz
        canUseSemester={canUseSemester}
        semesterId={semesterId}
        onCancel={() => setMode("list")}
        onCreated={() => {
          setMode("list");
          fetchQuizzes();
        }}
      />
    );
  }

  if (mode === "edit") {
    return (
      <CreateQuiz
        editMode
        quizId={selectedQuizId}
        canUseSemester={canUseSemester}
        semesterId={semesterId}
        onCancel={() => setMode("list")}
        onCreated={() => {
          setMode("list");
          fetchQuizzes();
        }}
      />
    );
  }

  if (mode === "view") {
    return <ViewQuiz quizId={selectedQuizId} onBack={() => setMode("list")} />;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Quizzes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create quizzes and tag each question with a topic for analytics.
          </p>
        </div>

        <button
          onClick={() => setMode("create")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white text-sm
                     hover:bg-primary-700 transition cursor-pointer"
          type="button"
        >
          <FiPlus />
          Create Quiz
        </button>
      </div>

      {!canUseSemester ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
          <div className="font-medium text-slate-800">
            Select course & semester
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Use the top bar to choose a course and semester.
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-slate-600">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <div className="font-medium text-slate-800">No quizzes yet</div>
              <div className="mt-1 text-sm text-slate-600">
                Create your first quiz for this semester.
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="font-semibold text-slate-800">{q.title}</div>

                  {q.description && (
                    <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {q.description}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    Time:{" "}
                    <span className="font-medium">
                      {Math.round((q.time_limit_sec || 600) / 60)} min
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedQuizId(q.id);
                        setMode("view");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm
                                 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      type="button"
                    >
                      <FiEye />
                      View
                    </button>

                    <button
                      onClick={() => {
                        setSelectedQuizId(q.id);
                        setMode("edit");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm
                                 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      type="button"
                    >
                      <FiEdit2 />
                      Edit
                    </button>

                    <button
                      onClick={() => askDelete(q.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm
                                 text-red-600 hover:bg-red-50 cursor-pointer"
                      type="button"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete quiz?"
        message="This will permanently remove the quiz (and its questions). If students have attempts, deletion may be blocked."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
