import { Plus } from "lucide-react";

import { entityConfigs } from "@/lib/config/entities";

import type { EntityName, Project, ViewId } from "@/types";

export default function AppHeader({
  view,
  project,
  onAdd,
}: {
  view: ViewId;

  project: Project | null;

  onAdd: (entity: EntityName) => void;
}) {
  const title =
    view === "detail"
      ? project?.name
      : view === "dashboard"
        ? "Cockpit"
        : view === "agenda"
          ? "Agenda"
          : entityConfigs[view as EntityName]?.title;

  /*
   * Le bouton Ajouter n'apparaît
   * que pour les véritables entités CRUD.
   *
   * Agenda = vue calculée des Actions.
   * Timesheet = possède son bouton
   * spécifique "Saisir du temps".
   */
  const canAdd =
    view !== "dashboard" &&
    view !== "detail" &&
    view !== "agenda" &&
    view !== "timesheets" &&
    view !== "actions";

  return (
    <header className="header">
      <div>
        <b>{title}</b>

        <div className="muted">Pilotage multi-projets</div>
      </div>

      {canAdd && (
        <button
          type="button"
          className="btn"
          onClick={() => onAdd(view as EntityName)}
        >
          <Plus size={16} />
          Ajouter
        </button>
      )}
    </header>
  );
}
