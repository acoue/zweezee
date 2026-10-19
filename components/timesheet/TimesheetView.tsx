"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import type {
  Project,
  TimesheetEntry,
  TimesheetScope,
} from "@/types";

interface TimesheetViewProps {
  entries: TimesheetEntry[];
  projects: Project[];
  onAdd: () => void;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (id: string) => void;
}

interface ProjectMonthlySummary {
  project: Project;
  total: number;
  projectHours: number;
  maintenanceHours: number;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function entryMonthKey(value: string) {
  const date = new Date(value);
  return monthKey(date);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function scopeLabel(scope: TimesheetScope) {
  return scope === "MAINTENANCE"
    ? "Maintenance / RUN"
    : "Projet / évolution";
}

function hoursLabel(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function TimesheetView({
  entries,
  projects,
  onAdd,
  onEdit,
  onDelete,
}: TimesheetViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    () => {
      const latestEntry = [...entries].sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )[0];

      if (latestEntry) {
        const date = new Date(latestEntry.date);
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );
      }

      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }
  );

  const [projectFilter, setProjectFilter] =
    useState("ALL");

  const currentMonthKey = monthKey(selectedMonth);

  const monthlyEntries = useMemo(
    () =>
      entries
        .filter(
          (entry) =>
            entryMonthKey(entry.date) ===
            currentMonthKey
        )
        .filter(
          (entry) =>
            projectFilter === "ALL" ||
            entry.projectId === projectFilter
        )
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        ),
    [entries, currentMonthKey, projectFilter]
  );

  const summaries = useMemo<ProjectMonthlySummary[]>(
    () =>
      projects
        .map((project) => {
          const projectEntries = entries.filter(
            (entry) =>
              entry.projectId === project.id &&
              entryMonthKey(entry.date) ===
                currentMonthKey
          );

          const projectHours = projectEntries
            .filter(
              (entry) => entry.scope === "PROJECT"
            )
            .reduce(
              (sum, entry) =>
                sum + Number(entry.hours),
              0
            );

          const maintenanceHours = projectEntries
            .filter(
              (entry) =>
                entry.scope === "MAINTENANCE"
            )
            .reduce(
              (sum, entry) =>
                sum + Number(entry.hours),
              0
            );

          return {
            project,
            projectHours,
            maintenanceHours,
            total: projectHours + maintenanceHours,
          };
        })
        .filter((summary) => summary.total > 0)
        .sort((a, b) => b.total - a.total),
    [entries, projects, currentMonthKey]
  );

  const totalHours = summaries.reduce(
    (sum, summary) => sum + summary.total,
    0
  );

  const totalProjectHours = summaries.reduce(
    (sum, summary) => sum + summary.projectHours,
    0
  );

  const totalMaintenanceHours = summaries.reduce(
    (sum, summary) =>
      sum + summary.maintenanceHours,
    0
  );

  function changeMonth(offset: number) {
    setSelectedMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1
        )
    );
  }

  return (
    <>
      <div className="between timesheet-heading">
        <div>
          <h1>Timesheet</h1>

          <p className="muted">
            Temps passé par projet et par mois,
            distinguant projet et maintenance.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={onAdd}
        >
          <Plus size={16} />
          Saisir du temps
        </button>
      </div>

      <div className="timesheet-toolbar">
        <div className="month-selector">
          <button
            type="button"
            className="btn ghost"
            onClick={() => changeMonth(-1)}
            aria-label="Mois précédent"
          >
            <ChevronLeft size={17} />
          </button>

          <strong>{monthLabel(selectedMonth)}</strong>

          <button
            type="button"
            className="btn ghost"
            onClick={() => changeMonth(1)}
            aria-label="Mois suivant"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <label className="timesheet-project-filter">
          <span className="muted">Projet</span>

          <select
            className="input"
            value={projectFilter}
            onChange={(event) =>
              setProjectFilter(event.target.value)
            }
          >
            <option value="ALL">
              Tous les projets
            </option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid g3 timesheet-totals">
        <div className="card timesheet-total-card">
          <small className="muted">
            Charge totale du mois
          </small>
          <h2>{hoursLabel(totalHours)} h</h2>
        </div>

        <div className="card">
          <small className="muted">
            Projet / évolution
          </small>
          <h2>{hoursLabel(totalProjectHours)} h</h2>
        </div>

        <div className="card">
          <small className="muted">
            Maintenance / RUN
          </small>
          <h2>
            {hoursLabel(totalMaintenanceHours)} h
          </h2>
        </div>
      </div>

      <section className="timesheet-summary-section">
        <h2>Répartition mensuelle</h2>

        <div className="timesheet-summary-list">
          {summaries.map((summary) => {
            const maxTotal = summaries[0]?.total || 1;
            const width =
              (summary.total / maxTotal) * 100;

            return (
              <button
                type="button"
                className="timesheet-summary-row"
                key={summary.project.id}
                onClick={() =>
                  setProjectFilter(summary.project.id)
                }
              >
                <div className="timesheet-summary-title">
                  <strong>{summary.project.name}</strong>
                  <span>{hoursLabel(summary.total)} h</span>
                </div>

                <div className="timesheet-month-bar">
                  <span style={{ width: `${width}%` }} />
                </div>

                <div className="timesheet-summary-details">
                  {summary.projectHours > 0 && (
                    <span>
                      Projet : {hoursLabel(summary.projectHours)} h
                    </span>
                  )}

                  {summary.maintenanceHours > 0 && (
                    <span>
                      Maintenance : {hoursLabel(summary.maintenanceHours)} h
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {summaries.length === 0 && (
            <div className="card muted">
              Aucun temps saisi pour ce mois.
            </div>
          )}
        </div>
      </section>

      <section className="timesheet-detail-section">
        <div className="between">
          <div>
            <h2>Détail des activités</h2>
            <p className="muted">
              {monthlyEntries.length} saisie
              {monthlyEntries.length > 1 ? "s" : ""}
            </p>
          </div>

          {projectFilter !== "ALL" && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => setProjectFilter("ALL")}
            >
              Effacer le filtre
            </button>
          )}
        </div>

        <div className="list">
          {monthlyEntries.map((entry) => (
            <div
              className="listitem between"
              key={entry.id}
            >
              <div className="timesheet-entry-main">
                <div className="row">
                  <strong>
                    {entry.project?.name ?? "Projet supprimé"}
                  </strong>

                  <span
                    className={`pill timesheet-scope-pill ${
                      entry.scope === "MAINTENANCE"
                        ? "maintenance"
                        : "project"
                    }`}
                  >
                    {scopeLabel(entry.scope)}
                  </span>

                  {entry.workItem && (
                    <span className="pill">
                      {entry.workItem.reference}
                    </span>
                  )}
                </div>

                <div>{entry.activity}</div>

                <small className="muted">
                  {shortDate(entry.date)}
                  {entry.workItem
                    ? ` · ${entry.workItem.title}`
                    : ""}
                </small>
              </div>

              <div className="timesheet-entry-actions">
                <strong>
                  {hoursLabel(Number(entry.hours))} h
                </strong>

                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => onEdit(entry)}
                  aria-label="Modifier"
                >
                  <Pencil size={15} />
                </button>

                <button
                  type="button"
                  className="btn danger"
                  onClick={() => onDelete(entry.id)}
                  aria-label="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {monthlyEntries.length === 0 && (
            <div className="listitem muted">
              Aucune activité pour la sélection courante.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
