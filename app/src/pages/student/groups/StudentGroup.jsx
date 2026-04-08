import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiUsers } from "react-icons/fi";

export default function StudentGroup() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/groups/my-group", {
          withCredentials: true,
        });
        setProjects(res.data);
      } catch {
        toast.error("Failed to load your group");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-semibold text-slate-800">My Group</h1>
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <div className="font-medium text-slate-800">
            You are not in a group yet
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Your teacher hasn't assigned groups yet. Check back later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">My Group</h1>
      <p className="mt-1 text-sm text-slate-600">
        Your assigned project groups for this semester.
      </p>

      <div className="mt-5 space-y-5">
        {projects.map((project) => (
          <div
            key={project.project_title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            {/* Project info */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-800">
                  {project.project_title}
                </div>
                {project.project_description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {project.project_description}
                  </p>
                )}
                <div className="mt-1 text-xs text-slate-400">
                  Created by {project.teacher_name}
                </div>
              </div>
              <span
                className="rounded-full border border-slate-100 bg-slate-50
                               px-3 py-1 text-xs text-slate-600 whitespace-nowrap"
              >
                Group {project.group_number}
              </span>
            </div>

            {/* Members */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
                <FiUsers />
                Group Members
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-xl border
                               border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary-400 shrink-0" />
                    {member.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
