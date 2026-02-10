import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { useTeacherContextStore } from "../../store/teacherContextStore.js";
import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";

export default function TeacherTopics() {
  const { courseId, semesterId } = useTeacherContextStore();

  const [topics, setTopics] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // modal state
  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeTopic, setActiveTopic] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);

  const canUsePage = useMemo(() => {
    return Boolean(courseId) && Boolean(semesterId);
  }, [courseId, semesterId]);

  const fetchTopics = async () => {
    if (!semesterId) return;
    setLoadingList(true);
    try {
      const res = await axios.get("/api/topics", {
        params: { semesterId },
        withCredentials: true,
      });
      setTopics(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load topics");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    setTopics([]);
    if (semesterId) fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId]);

  const openCreate = () => {
    setMode("create");
    setActiveTopic(null);
    setName("");
    setOpenForm(true);
  };

  const openEdit = (t) => {
    setMode("edit");
    setActiveTopic(t);
    setName(t.name);
    setOpenForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Topic name is required");

    setSaving(true);
    try {
      if (mode === "create") {
        await axios.post(
          "/api/topics",
          { semesterId: Number(semesterId), name: name.trim() },
          { withCredentials: true },
        );
        toast.success("Topic created");
      } else {
        await axios.patch(
          `/api/topics/${activeTopic.id}`,
          { name: name.trim() },
          { withCredentials: true },
        );
        toast.success("Topic updated");
      }

      setOpenForm(false);
      await fetchTopics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (t) => {
    setTopicToDelete(t);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!topicToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/topics/${topicToDelete.id}`, {
        withCredentials: true,
      });
      toast.success("Topic deleted");
      setOpenDelete(false);
      setTopicToDelete(null);
      await fetchTopics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (!canUsePage) {
    return (
      <div className="min-h-[320px] grid place-items-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800">
            Select course & semester
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Use the top bar to choose a course and semester to manage topics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Topics</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create topics for the selected semester. These will be used in
            quizzes and analytics.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white text-sm
                     hover:bg-primary-700 transition cursor-pointer"
          type="button"
        >
          <FiPlus />
          Add Topic
        </button>
      </div>

      <div className="mt-6">
        {loadingList ? (
          <div className="text-sm text-slate-600">Loading topics...</div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold w-40">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {topics.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={2}>
                        No topics yet.
                      </td>
                    </tr>
                  ) : (
                    topics.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-slate-800">{t.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(t)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                              type="button"
                            >
                              <FiEdit2 />
                              Edit
                            </button>
                            <button
                              onClick={() => askDelete(t)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                              type="button"
                            >
                              <FiTrash2 />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* floating + button (mobile) */}
      <button
        onClick={openCreate}
        className="sm:hidden fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary-600 text-white
                   grid place-items-center shadow-lg hover:bg-primary-700 transition cursor-pointer"
        type="button"
        aria-label="Add topic"
      >
        <FiPlus className="text-xl" />
      </button>

      {/* Add/Edit modal */}
      <Modal
        open={openForm}
        title={mode === "create" ? "Add Topic" : "Edit Topic"}
        onClose={() => setOpenForm(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpenForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={submitForm}
              disabled={saving}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
              type="button"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <form onSubmit={submitForm} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Topic name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none
                         focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              placeholder="e.g. DBMS, OS, React Hooks"
              autoFocus
            />
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={openDelete}
        title="Delete topic?"
        message={`This will delete "${topicToDelete?.name}". You won't be able to use it in quizzes.`}
        confirmText="Delete"
        onCancel={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
