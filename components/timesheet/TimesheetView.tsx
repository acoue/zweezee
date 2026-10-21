"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import type { Action, Project, TimesheetEntry } from "@/types";

interface TimesheetViewProps {
  entries: TimesheetEntry[];
  projects: Project[];
  actions: Action[];
  onAdd: () => void;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (id: string) => void;
}

interface ProjectMonthlySummary {
  project: Project;
  total: number;
  generalHours: number;
  actionHours: number;
  maintenanceHours: number;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function entryMonthKey(value: string) {
  return monthKey(new Date(value));
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

function hoursLabel(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,

    maximumFractionDigits: 2,
  }).format(value);
}

/*
 * Types considérés comme
 * Maintenance / RUN.
 */
function isMaintenanceType(type?: string) {
  return ["BUG", "INCIDENT", "EVOLUTION", "TASK"].includes(type ?? "");
}

function actionTypeLabel(type?: string) {
  switch (type) {
    case "ACTION":
      return "Action";

    case "TASK":
      return "Tâche";

    case "BUG":
      return "Bug";

    case "INCIDENT":
      return "Incident";

    case "EVOLUTION":
      return "Évolution";

    case "JALON":
      return "Jalon";

    default:
      return "Projet";
  }
}

export default function TimesheetView({
  entries,
  projects,
  actions,
  onAdd,
  onEdit,
  onDelete,
}: TimesheetViewProps) {
  /*
   * ===============================
   * MOIS COURANT
   * ===============================
   */

  const [selectedMonth, setSelectedMonth] = useState(() => {
    /*
     * S'il existe déjà des saisies,
     * on ouvre le mois de la saisie
     * la plus récente.
     */
    const latestEntry = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];

    if (latestEntry) {
      const date = new Date(latestEntry.date);

      return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    /*
     * Sinon mois actuel.
     */
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  /*
   * Filtre projet.
   */
  const [projectFilter, setProjectFilter] = useState("ALL");

  const currentMonthKey = monthKey(selectedMonth);

  /*
   * ===============================
   * SAISIES DU MOIS
   * ===============================
   */

  const monthlyEntries = useMemo(
    () =>
      entries
        .filter((entry) => entryMonthKey(entry.date) === currentMonthKey)
        .filter(
          (entry) =>
            projectFilter === "ALL" || entry.projectId === projectFilter,
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),

    [entries, currentMonthKey, projectFilter],
  );

  const actionConsumption = useMemo(() => {
    const map = new Map<string, number>();

    /*
     * Important :
     * ici nous utilisons toutes les saisies,
     * pas uniquement celles du mois.
     *
     * Une estimation d'Action représente
     * la charge totale de l'Action.
     */
    entries.forEach((entry) => {
      if (!entry.actionId) {
        return;
      }
      const current = map.get(entry.actionId) ?? 0;
      map.set(entry.actionId, current + Number(entry.hours));
    });

    return map;
  }, [entries]);

  const trackedActions = useMemo(() => {
    return actions
      .filter(
        (action) =>
          action.estimatedHours !== null && action.estimatedHours !== undefined,
      )
      .map((action) => {
        const estimated = Number(action.estimatedHours);
        const consumed = actionConsumption.get(action.id) ?? 0;
        const remaining = estimated - consumed;
        const percent = estimated > 0 ? (consumed / estimated) * 100 : 0;
        return {
          action,
          estimated,
          consumed,
          remaining,
          percent,
        };
      })
      .sort((left, right) => right.percent - left.percent);
  }, [actions, actionConsumption]);

  const visibleTrackedActions = trackedActions.filter(
    (item) =>
      projectFilter === "ALL" || item.action.projectId === projectFilter,
  );

  const totalEstimated = visibleTrackedActions.reduce(
    (total, item) => total + item.estimated,

    0,
  );

  const totalConsumedOnActions = visibleTrackedActions.reduce(
    (total, item) => total + item.consumed,

    0,
  );

  const estimatedDelta = totalConsumedOnActions - totalEstimated;

  /*
   * ===============================
   * SYNTHÈSE PAR PROJET
   * ===============================
   */

  const summaries = useMemo<ProjectMonthlySummary[]>(
    () =>
      projects
        .map((project) => {
          const projectEntries = entries.filter(
            (entry) =>
              entry.projectId === project.id &&
              entryMonthKey(entry.date) === currentMonthKey,
          );

          /*
           * Temps sans action.
           *
           * Exemple :
           * pilotage général,
           * préparation COPIL,
           * activité transverse...
           */
          const generalHours = projectEntries
            .filter((entry) => !entry.actionId)
            .reduce(
              (total, entry) => total + Number(entry.hours),

              0,
            );

          /*
           * Temps affecté
           * explicitement à une action.
           */
          const actionHours = projectEntries
            .filter((entry) => !!entry.actionId)
            .reduce(
              (total, entry) => total + Number(entry.hours),

              0,
            );

          /*
           * Temps RUN.
           *
           * Il découle désormais
           * directement du type Action.
           */
          const maintenanceHours = projectEntries
            .filter((entry) => isMaintenanceType(entry.action?.type))
            .reduce(
              (total, entry) => total + Number(entry.hours),

              0,
            );

          return {
            project,

            generalHours,

            actionHours,

            maintenanceHours,

            total: generalHours + actionHours,
          };
        })

        /*
         * Ne pas afficher les projets
         * sans activité sur le mois.
         */
        .filter((summary) => summary.total > 0)

        /*
         * Les projets consommant le
         * plus apparaissent en premier.
         */
        .sort((a, b) => b.total - a.total),

    [entries, projects, currentMonthKey],
  );

  /*
   * ===============================
   * TOTAUX
   * ===============================
   */

  const totalHours = summaries.reduce(
    (total, summary) => total + summary.total,

    0,
  );

  const totalMaintenanceHours = summaries.reduce(
    (total, summary) => total + summary.maintenanceHours,

    0,
  );

  const totalProjectHours = Math.max(0, totalHours - totalMaintenanceHours);

  /*
   * ===============================
   * NAVIGATION MOIS
   * ===============================
   */

  function changeMonth(offset: number) {
    setSelectedMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  /*
   * ===============================
   * AFFICHAGE
   * ===============================
   */

  return (
    <>
      {/* ============================= */}
      {/* EN-TÊTE                      */}
      {/* ============================= */}

      <div className="between timesheet-heading">
        <div>
          <h1>Timesheet</h1>

          <p className="muted">
            Temps réellement passé par projet et par mois.
          </p>
        </div>

        <button type="button" className="btn" onClick={onAdd}>
          <Plus size={16} />
          Saisir du temps
        </button>
      </div>

      {/* ============================= */}
      {/* SÉLECTION MOIS / PROJET      */}
      {/* ============================= */}

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
      </div>

      {/* ============================= */}
      {/* TOTAUX                       */}
      {/* ============================= */}

      <div className="grid g3 timesheet-totals">
        <div className="card timesheet-total-card">
          <small className="muted">Charge totale du mois</small>

          <h2>{hoursLabel(totalHours)} h</h2>
        </div>

        <div className="card">
          <small className="muted">Projet / évolution</small>

          <h2>{hoursLabel(totalProjectHours)} h</h2>
        </div>

        <div className="card">
          <small className="muted">Maintenance / RUN</small>

          <h2>{hoursLabel(totalMaintenanceHours)} h</h2>
        </div>
      </div>

      {/* ============================= */}
      {/* RÉPARTITION PAR PROJET       */}
      {/* ============================= */}

      <section className="timesheet-summary-section">
        <h2>Répartition mensuelle</h2>

        <div className="timesheet-summary-list">
          {summaries.map((summary) => {
            const maxTotal = summaries[0]?.total || 1;

            const width = (summary.total / maxTotal) * 100;

            return (
              <button
                type="button"
                className="timesheet-summary-row"
                key={summary.project.id}
                onClick={() => setProjectFilter(summary.project.id)}
              >
                <div className="timesheet-summary-title">
                  <strong>{summary.project.name}</strong>

                  <span>{hoursLabel(summary.total)} h</span>
                </div>

                <div className="timesheet-month-bar">
                  <span
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>

                <div className="timesheet-summary-details">
                  <span>
                    Projet :{" "}
                    {hoursLabel(
                      Math.max(0, summary.total - summary.maintenanceHours),
                    )}{" "}
                    h
                  </span>

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
            <div className="card muted">Aucun temps saisi pour ce mois.</div>
          )}
        </div>
      </section>

      <section className="timesheet-estimated-section">
        <div className="between">
          <div>
            <h2>Estimé vs réalisé</h2>

            <p className="muted">
              Consommation cumulée des Actions possédant une estimation.
            </p>
          </div>
        </div>

        <div
          className="grid g3"
          style={{
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <div className="card">
            <small className="muted">Charge estimée</small>

            <h2>{hoursLabel(totalEstimated)} h</h2>
          </div>

          <div className="card">
            <small className="muted">Temps réalisé</small>

            <h2>{hoursLabel(totalConsumedOnActions)} h</h2>
          </div>

          <div
            className={
              estimatedDelta > 0 ? "card estimate-overrun" : "card estimate-ok"
            }
          >
            <small className="muted">Écart</small>

            <h2>
              {estimatedDelta > 0 ? "+" : ""}
              {hoursLabel(estimatedDelta)} h
            </h2>
          </div>
        </div>

        <div className="list">
          {visibleTrackedActions.map(
            ({ action, estimated, consumed, remaining, percent }) => {
              const overrun = consumed > estimated;

              return (
                <div key={action.id} className="listitem">
                  <div className="between">
                    <div>
                      <div className="row">
                        <strong>{action.reference}</strong>

                        <span className="pill">{action.type}</span>

                        {overrun && (
                          <span className="estimate-warning">Dépassement</span>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                        }}
                      >
                        {action.title}
                      </div>

                      <small className="muted">{action.project?.name}</small>
                    </div>

                    <div className="estimate-values">
                      <div>
                        <small>Estimé</small>

                        <strong>{hoursLabel(estimated)} h</strong>
                      </div>

                      <div>
                        <small>Réalisé</small>

                        <strong>{hoursLabel(consumed)} h</strong>
                      </div>

                      <div>
                        <small>
                          {remaining >= 0 ? "Reste" : "Dépassement"}
                        </small>

                        <strong className={remaining < 0 ? "text-overrun" : ""}>
                          {hoursLabel(Math.abs(remaining))} h
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      overrun ? "estimate-bar overrun" : "estimate-bar"
                    }
                  >
                    <span
                      style={{
                        width: `${Math.min(100, percent)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )}

          {visibleTrackedActions.length === 0 && (
            <div className="listitem muted">
              Aucune Action avec une charge estimée.
            </div>
          )}
        </div>
      </section>

      {/* ============================= */}
      {/* DÉTAIL DES SAISIES           */}
      {/* ============================= */}

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
          {monthlyEntries.map((entry) => {
            const maintenance = isMaintenanceType(entry.action?.type);

            return (
              <div className="listitem between" key={entry.id}>
                <div className="timesheet-entry-main">
                  <div className="row">
                    <strong>{entry.project?.name ?? "Projet supprimé"}</strong>

                    {entry.action ? (
                      <>
                        <span
                          className={`pill timesheet-scope-pill ${
                            maintenance ? "maintenance" : "project"
                          }`}
                        >
                          {actionTypeLabel(entry.action.type)}
                        </span>

                        <span className="pill">{entry.action.reference}</span>
                      </>
                    ) : (
                      <span className="pill timesheet-scope-pill project">
                        Temps projet
                      </span>
                    )}
                  </div>

                  <div>{entry.activity}</div>

                  <small className="muted">
                    {shortDate(entry.date)}

                    {entry.action && (
                      <>
                        {" · "}
                        {entry.action.title}
                      </>
                    )}
                  </small>
                </div>

                <div className="timesheet-entry-actions">
                  <strong>{hoursLabel(Number(entry.hours))} h</strong>

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
            );
          })}

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
