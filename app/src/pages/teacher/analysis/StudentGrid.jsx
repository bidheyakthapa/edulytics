import MasteryDot from "./MasteryDot.jsx";

export default function StudentGrid({ students }) {
  if (students.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
        No students found for this semester.
      </div>
    );
  }

  return (
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
  );
}
