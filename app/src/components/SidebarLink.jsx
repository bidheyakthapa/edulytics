import { NavLink } from "react-router-dom";

export default function SidebarLink({ to, label, icon, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition cursor-pointer",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-slate-700 hover:bg-slate-50",
        ].join(" ")
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
