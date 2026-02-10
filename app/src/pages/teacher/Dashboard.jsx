export default function TeacherDashboard() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        Select a course + semester from the top bar to start managing topics and
        quizzes.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card
          title="Topics"
          desc="Create and manage topic lists per semester."
        />
        <Card
          title="Quizzes"
          desc="Build quizzes and tag questions by topic."
        />
      </div>
    </div>
  );
}

function Card({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
      <div className="text-sm font-semibold text-primary-700">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
    </div>
  );
}
