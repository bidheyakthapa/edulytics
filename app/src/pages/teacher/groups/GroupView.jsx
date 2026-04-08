import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";

// each student card is draggable
import { useDraggable, useDroppable } from "@dnd-kit/core";

function StudentChip({ student }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: String(student.id) });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-xl border border-slate-100
                  bg-slate-50 px-3 py-2 text-sm text-slate-700 cursor-grab
                  select-none transition
                  ${isDragging ? "opacity-50 shadow-lg" : "hover:bg-slate-100"}`}
    >
      <div className="h-2 w-2 rounded-full bg-primary-400 shrink-0" />
      {student.name}
    </div>
  );
}

function GroupColumn({ group }) {
  const { setNodeRef, isOver } = useDroppable({
    id: String(group.id),
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-4 min-h-[160px] transition
        ${isOver ? "border-primary-300 bg-primary-50" : "border-slate-100 bg-white"}`}
    >
      <div className="text-xs font-semibold text-slate-500 mb-3">
        Group {group.group_number}
        <span className="ml-2 text-slate-400">
          ({group.members.length} members)
        </span>
      </div>
      <div className="space-y-2">
        {group.members.map((student) => (
          <StudentChip key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
}

export default function GroupView({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/groups/projects/${projectId}`, {
        withCredentials: true,
      });
      setProject(res.data.project);
      setGroups(res.data.groups);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // fetch on mount
  useState(() => {
    fetchGroups();
  }, [projectId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await axios.post(
        `/api/groups/projects/${projectId}/generate`,
        {},
        { withCredentials: true },
      );
      toast.success("Groups generated!");
      await fetchGroups();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to generate groups");
    } finally {
      setGenerating(false);
    }
  };

  // find which group a student belongs to
  const findStudentGroup = (studentId) => {
    return groups.find((g) =>
      g.members.some((m) => String(m.id) === String(studentId)),
    );
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const draggedStudentId = active.id;
    const droppedOnGroupId = over.id;

    // find the group the dragged student is currently in
    const fromGroup = findStudentGroup(draggedStudentId);
    if (!fromGroup) return;

    // if dropped on the same group do nothing
    if (String(fromGroup.id) === String(droppedOnGroupId)) return;

    const toGroup = groups.find(
      (g) => String(g.id) === String(droppedOnGroupId),
    );
    if (!toGroup) return;

    // we need to swap — pick the first member of the target group
    // teacher dragged student A onto a group column, we swap with first member
    if (toGroup.members.length === 0) {
      toast.error("Cannot swap with an empty group");
      return;
    }

    // find student B — the one being swapped out from target group
    // we swap dragged student with whoever is first in target group
    const studentA = fromGroup.members.find(
      (m) => String(m.id) === String(draggedStudentId),
    );
    const studentB = toGroup.members[0];

    try {
      await axios.put(
        `/api/groups/projects/${projectId}/swap`,
        {
          student_a_id: studentA.id,
          student_b_id: studentB.id,
        },
        { withCredentials: true },
      );

      // optimistic UI update
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === fromGroup.id) {
            return {
              ...g,
              members: g.members.map((m) =>
                m.id === studentA.id ? studentB : m,
              ),
            };
          }
          if (g.id === toGroup.id) {
            return {
              ...g,
              members: g.members.map((m) =>
                m.id === studentB.id ? studentA : m,
              ),
            };
          }
          return g;
        }),
      );

      toast.success(`Swapped ${studentA.name} and ${studentB.name}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to swap students");
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-600">Loading groups...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50
                       transition cursor-pointer"
            type="button"
          >
            <FiArrowLeft />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {project?.title}
            </h1>
            {project?.description && (
              <p className="text-sm text-slate-500">{project.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600
                     px-4 py-2 text-sm text-white hover:bg-primary-700
                     disabled:opacity-60 transition cursor-pointer"
          type="button"
        >
          <FiRefreshCw className={generating ? "animate-spin" : ""} />
          {generating
            ? "Generating..."
            : groups.length > 0
              ? "Regenerate"
              : "Generate Groups"}
        </button>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <div className="font-medium text-slate-800">No groups yet</div>
          <div className="mt-1 text-sm text-slate-600">
            Click "Generate Groups" to run the algorithm.
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-xs text-slate-400">
            Drag a student card and drop it onto another group to swap.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <GroupColumn key={group.id} group={group} />
              ))}
            </div>
          </DndContext>
        </>
      )}
    </div>
  );
}
