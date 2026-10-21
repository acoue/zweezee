import {
  BellRing,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Timer,
} from "lucide-react";
import type { ViewId } from "@/types";
const items = [
  {
    id: "dashboard",
    label: "Accueil",
    icon: LayoutDashboard,
  },

  {
    id: "projects",
    label: "Projets",
    icon: FolderKanban,
  },

  {
    id: "actions",
    label: "Actions",
    icon: ListTodo,
  },

  {
    id: "agenda",
    label: "Agenda",
    icon: CalendarDays,
  },

  {
    id: "risks",
    label: "Risques",
    icon: BellRing,
  },

  {
    id: "timesheets",
    label: "Timesheet",
    icon: Timer,
  },
] as const;
export default function Sidebar({
  view,
  onChange,
}: {
  view: ViewId;
  onChange: (view: ViewId) => void;
}) {
  return (
    <aside className="side">
      <div className="brand">
        <div className="logo">Z</div>
        <div>
          <b>Zweezee</b>
          <div className="muted">Cockpit projets</div>
        </div>
      </div>
      <nav className="nav">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => onChange(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
