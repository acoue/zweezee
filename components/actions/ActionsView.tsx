"use client";

import { useMemo, useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import type {
  Action,
  ActionStatus,
  ActionType,
  Project,
  TimesheetEntry,
} from "@/types";

interface ActionsViewProps {
  actions: Action[];

  projects: Project[];

  timesheets: TimesheetEntry[];

  onAdd: () => void;

  onEdit: (action: Action) => void;

  onDelete: (id: string) => void;
}

const typeLabels: Record<ActionType, string> = {
  ACTION: "Action",
  TASK: "Tâche",
  BUG: "Bug",
  INCIDENT: "Incident",
  EVOLUTION: "Évolution",
  JALON: "Jalon",
};

const statusLabels: Record<ActionStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  BLOCKED: "Bloquée",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

const actionTypes: ActionType[] = [
  "ACTION",
  "TASK",
  "BUG",
  "INCIDENT",
  "EVOLUTION",
  "JALON",
];

export default function ActionsView({
  actions,
  projects,
  timesheets,
  onAdd,
  onEdit,
  onDelete,
}: ActionsViewProps) {
  const [projectFilter, setProjectFilter] = useState("ALL");

  const [typeFilter, setTypeFilter] = useState<ActionType | "ALL">("ALL");

  const [statusFilter, setStatusFilter] = useState<ActionStatus | "ALL">("ALL");

  /*
   * Temps réellement saisi,
   * regroupé par Action.
   */
  const consumedByAction = useMemo(() => {
    const totals = new Map<string, number>();

    timesheets.forEach((entry) => {
      if (!entry.actionId) {
        return;
      }

      const current = totals.get(entry.actionId) ?? 0;

      totals.set(entry.actionId, current + Number(entry.hours));
    });

    return totals;
  }, [timesheets]);

  const filtered = useMemo(
    () =>
      actions.filter((action) => {
        if (projectFilter !== "ALL" && action.projectId !== projectFilter) {
          return false;
        }

        if (typeFilter !== "ALL" && action.type !== typeFilter) {
          return false;
        }

        if (statusFilter !== "ALL" && action.status !== statusFilter) {
          return false;
        }

        return true;
      }),

    [actions, projectFilter, typeFilter, statusFilter],
  );

  return (
    <>
      <div className="between">
        <div>
          <h1>Actions</h1>

          <p className="muted">
            Actions projet, maintenance, incidents et jalons.
          </p>
        </div>

        <button type="button" className="btn" onClick={onAdd}>
          <Plus size={16} />
          Ajouter une action
        </button>
      </div>

      {/* FILTRES */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >
        <div className="formgrid">
          <label>
            Projet
            <select
              className="input"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
            >
              <option value="ALL">Tous les projets</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Statut
            <select
              className="input"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ActionStatus | "ALL")
              }
            >
              <option value="ALL">Tous les statuts</option>

              <option value="TODO">À faire</option>

              <option value="IN_PROGRESS">En cours</option>

              <option value="BLOCKED">Bloquée</option>

              <option value="DONE">Terminée</option>

              <option value="CANCELLED">Annulée</option>
            </select>
          </label>
        </div>

        <div
          className="tabs"
          style={{
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          <button
            type="button"
            className={"tab " + (typeFilter === "ALL" ? "active" : "")}
            onClick={() => setTypeFilter("ALL")}
          >
            Tous
          </button>

          {actionTypes.map((type) => (
            <button
              type="button"
              key={type}
              className={"tab " + (typeFilter === type ? "active" : "")}
              onClick={() => setTypeFilter(type)}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE */}

      <div
        className="list"
        style={{
          marginTop: 20,
        }}
      >
        {filtered.map((action) => {
          const consumed = consumedByAction.get(action.id) ?? 0;

          const estimated = action.estimatedHours
            ? Number(action.estimatedHours)
            : null;

          return (
            <div key={action.id} className="listitem between">
              <div
                style={{
                  flex: 1,
                }}
              >
                <div className="row">
                  <strong>{action.reference}</strong>

                  <span className="pill">{typeLabels[action.type]}</span>

                  <span className="pill">{statusLabels[action.status]}</span>
                </div>

                <div
                  style={{
                    marginTop: 5,
                  }}
                >
                  {action.title}
                </div>

                <small className="muted">
                  {action.project?.name}

                  {action.owner && ` · ${action.owner}`}

                  {action.dueDate &&
                    ` · Échéance ${new Date(action.dueDate).toLocaleDateString(
                      "fr-FR",
                    )}`}
                </small>
              </div>

              <div
                style={{
                  minWidth: 120,
                }}
              >
                {estimated !== null ? (
                  <>
                    <strong>
                      {consumed}
                      {" / "}
                      {estimated}
                      {" h"}
                    </strong>

                    <div
                      className="bar"
                      style={{
                        marginTop: 7,
                      }}
                    >
                      <span
                        style={{
                          width: `${Math.min(
                            100,
                            (consumed / Math.max(estimated, 0.01)) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                ) : consumed > 0 ? (
                  <strong>
                    {consumed}
                    {" h"}
                  </strong>
                ) : null}
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => onEdit(action)}
                  aria-label="Modifier"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  className="btn danger"
                  onClick={() => onDelete(action.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="listitem muted">
            Aucune action ne correspond aux filtres.
          </div>
        )}
      </div>
    </>
  );
}
