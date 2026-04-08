import { FiUsers, FiChevronRight } from "react-icons/fi";

export default function ProjectCard({ project, onOpen }) {
  const hasGroups = Number(project.group_count) > 0;

  return (
    <div
      onClick={onOpen}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm
                 hover:border-primary-200 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-800">{project.title}</div>
          {project.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <FiChevronRight className="mt-1 shrink-0 text-slate-400" />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FiUsers />
          {project.group_size} per group
        </span>

        {hasGroups ? (
          <span
            className="rounded-full bg-green-50 border border-green-100
                           px-2 py-0.5 text-green-700"
          >
            {project.group_count} groups generated
          </span>
        ) : (
          <span
            className="rounded-full bg-amber-50 border border-amber-100
                           px-2 py-0.5 text-amber-700"
          >
            Not generated yet
          </span>
        )}
      </div>
    </div>
  );
}
