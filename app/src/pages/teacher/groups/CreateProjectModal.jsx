import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal.jsx";
import Field from "../../../components/ui/Field.jsx";

export default function CreateProjectModal({ semesterId, onCreated, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    group_size: "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    form.title.trim().length >= 2 && Number(form.group_size) >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await axios.post(
        "/api/groups/projects",
        {
          title: form.title.trim(),
          description: form.description.trim(),
          group_size: Number(form.group_size),
          semester_id: Number(semesterId),
        },
        { withCredentials: true },
      );
      toast.success("Project created!");
      onCreated();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Create Project">
      <h2 className="text-lg font-semibold text-slate-800">Create Project</h2>
      <p className="mt-1 text-sm text-slate-500">
        Groups will be generated from students in this semester.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="e.g. Final Year Project"
          />
        </Field>

        <Field label="Description (optional)">
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="Short description of the project..."
          />
        </Field>

        <Field label="Group Size">
          <input
            type="number"
            min={2}
            value={form.group_size}
            onChange={(e) => setField("group_size", e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none
                       focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            placeholder="e.g. 4"
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700
                     hover:bg-slate-50 transition cursor-pointer"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm text-white
                     hover:bg-primary-700 disabled:opacity-60 transition cursor-pointer"
          type="button"
        >
          {saving ? "Creating..." : "Create Project"}
        </button>
      </div>
    </Modal>
  );
}
