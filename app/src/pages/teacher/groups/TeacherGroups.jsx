import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import { useTeacherContextStore } from "../../../store/teacherContextStore.js";
import ProjectCard from "./ProjectCard.jsx";
import GroupView from "./GroupView.jsx";
import CreateProjectModal from "./CreateProjectModal.jsx";
import ConfirmDialog from "../../../components/ConfirmDialog.jsx";

export default function TeacherGroups() {
  const { semesterId } = useTeacherContextStore();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [viewingProjectId, setViewingProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/groups/projects/${projectToDelete.id}`, {
        withCredentials: true,
      });
      toast.success("Project deleted");
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const fetchProjects = async () => {
    if (!semesterId) return;
    setLoading(true);
    try {
      const res = await axios.get("/api/groups/projects", {
        params: { semesterId },
        withCredentials: true,
      });
      setProjects(res.data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProjects([]);
    fetchProjects();
  }, [semesterId]);

  if (!semesterId) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <div className="font-medium text-slate-800">No semester selected</div>
        <div className="mt-1 text-sm text-slate-600">
          Select a course and semester from the top bar.
        </div>
      </div>
    );
  }

  if (viewingProjectId) {
    return (
      <GroupView
        projectId={viewingProjectId}
        onBack={() => {
          setViewingProjectId(null);
          fetchProjects();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Groups</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create projects and generate balanced student groups.
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600
                     px-4 py-2 text-sm text-white hover:bg-primary-700
                     transition cursor-pointer"
          type="button"
        >
          <FiPlus />
          New Project
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-sm text-slate-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="font-medium text-slate-800">No projects yet</div>
            <div className="mt-1 text-sm text-slate-600">
              Create a project to get started with group formation.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => setViewingProjectId(project.id)}
                onDelete={() => setProjectToDelete(project)}
              />
            ))}
          </div>
        )}
      </div>

      {openCreate && (
        <CreateProjectModal
          semesterId={semesterId}
          onCreated={() => {
            setOpenCreate(false);
            fetchProjects();
          }}
          onClose={() => setOpenCreate(false)}
        />
      )}

      <ConfirmDialog
        open={Boolean(projectToDelete)}
        title="Delete project?"
        message={`This will delete "${projectToDelete?.title}" and all its groups. This cannot be undone.`}
        confirmText="Delete"
        onCancel={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
