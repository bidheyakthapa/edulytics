export default function StudentDashboard() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your quizzes, mastery and group details will appear here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card
          title="Available Quizzes"
          desc="Attempt quizzes for your semester."
        />
        <Card
          title="Topic Mastery"
          desc="See weak and strong topics over time."
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
