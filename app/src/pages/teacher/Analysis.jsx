import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTeacherContextStore } from "../../store/teacherContextStore.js";

export default function TeacherAnalysis() {
  const { semesterId } = useTeacherContextStore();

  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!semesterId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [topicsRes, studentsRes] = await Promise.all([
          axios.get("/api/analysis/topics", {
            params: { semesterId },
            withCredentials: true,
          }),
          axios.get("/api/analysis/students", {
            params: { semesterId },
            withCredentials: true,
          }),
        ]);
        setTopics(topicsRes.data);
        setStudents(studentsRes.data);
      } catch {
        toast.error("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [semesterId]);

  if (!semesterId) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <div className="font-medium text-slate-800">No semester selected</div>
        <div className="mt-1 text-sm text-slate-600">
          Select a course and semester from the top bar to view analysis.
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">Class Analysis</h1>
      <p className="mt-1 text-sm text-slate-600">
        Topic mastery and student performance for this semester.
      </p>

      {/* Topic mastery bars */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700">
          Topic Mastery — Class Average
        </h2>

        {topics.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
            No mastery data yet for this semester.
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {topics.map((topic) => (
              <TopicBar key={topic.topic_id} topic={topic} />
            ))}
          </div>
        )}
      </div>

      {/* Student mastery grid */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-700">
          Student Mastery Breakdown
        </h2>

        {students.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
            No students found for this semester.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Student
                  </th>
                  {students[0].topics.map((t) => (
                    <th
                      key={t.topic_id}
                      className="px-4 py-3 text-center font-medium text-slate-600 whitespace-nowrap"
                    >
                      {t.topic_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr
                    key={student.student_id}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                      {student.student_name}
                    </td>
                    {student.topics.map((t) => (
                      <td key={t.topic_id} className="px-4 py-3 text-center">
                        <MasteryDot p_know={t.p_know} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicBar({ topic }) {
  const percentage = topic.avg_mastery
    ? Math.round(parseFloat(topic.avg_mastery) * 100)
    : 0;

  const barColor =
    percentage >= 70
      ? "bg-green-400"
      : percentage >= 40
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{topic.topic_name}</span>
        <span className="text-slate-500">
          {percentage}% avg · {topic.student_count} students
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MasteryDot({ p_know }) {
  if (p_know === null) {
    return <span className="text-slate-300 text-xs">—</span>;
  }

  const percentage = Math.round(p_know * 100);

  const color =
    percentage >= 70
      ? "bg-green-100 text-green-700"
      : percentage >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-600";

  return (
    <span
      className={`inline-block rounded-lg px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {percentage}%
    </span>
  );
}
