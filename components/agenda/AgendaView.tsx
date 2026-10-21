"use client";

import { useMemo, useState } from "react";

import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import type { Action, ActionType, Project } from "@/types";

interface AgendaViewProps {
  actions: Action[];

  projects: Project[];

  onEdit: (action: Action) => void;
}

type AgendaEventKind = "START" | "DUE";

interface AgendaEvent {
  id: string;

  date: Date;

  kind: AgendaEventKind;

  action: Action;
}

const typeLabels: Record<ActionType, string> = {
  ACTION: "Action",
  TASK: "Tâche",
  BUG: "Bug",
  INCIDENT: "Incident",
  EVOLUTION: "Évolution",
  JALON: "Jalon",
};

const typeClasses: Record<ActionType, string> = {
  ACTION: "agenda-action",
  TASK: "agenda-task",
  BUG: "agenda-bug",
  INCIDENT: "agenda-incident",
  EVOLUTION: "agenda-evolution",
  JALON: "agenda-milestone",
};

const actionTypes: ActionType[] = [
  "ACTION",
  "TASK",
  "BUG",
  "INCIDENT",
  "EVOLUTION",
  "JALON",
];

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isOverdue(event: AgendaEvent) {
  /*
   * Une date de début passée
   * n'est pas un retard.
   */
  if (event.kind !== "DUE") {
    return false;
  }

  if (event.action.status === "DONE" || event.action.status === "CANCELLED") {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return event.date.getTime() < today.getTime();
}

export default function AgendaView({
  actions,
  projects,
  onEdit,
}: AgendaViewProps) {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );

  const [projectFilter, setProjectFilter] = useState("ALL");

  const [typeFilter, setTypeFilter] = useState<ActionType | "ALL">("ALL");

  /*
   * =================================
   * CONSTRUCTION DES ÉVÉNEMENTS
   * =================================
   *
   * Une même action peut générer
   * deux entrées Agenda :
   *
   * - date de début
   * - échéance
   */
  const events = useMemo(() => {
    const result: AgendaEvent[] = [];

    actions.forEach((action) => {
      if (action.startDate) {
        result.push({
          id: `${action.id}-start`,

          date: new Date(action.startDate),

          kind: "START",

          action,
        });
      }

      if (action.dueDate) {
        /*
         * Si début et échéance
         * sont le même jour,
         * on préfère n'afficher
         * que l'échéance.
         */
        const due = new Date(action.dueDate);

        const start = action.startDate ? new Date(action.startDate) : null;

        if (start && sameDay(start, due)) {
          const startIndex = result.findIndex(
            (event) => event.id === `${action.id}-start`,
          );

          if (startIndex >= 0) {
            result.splice(startIndex, 1);
          }
        }

        result.push({
          id: `${action.id}-due`,

          date: due,

          kind: "DUE",

          action,
        });
      }
    });

    return result
      .filter(
        (event) =>
          event.date.getFullYear() === selectedMonth.getFullYear() &&
          event.date.getMonth() === selectedMonth.getMonth(),
      )
      .filter(
        (event) =>
          projectFilter === "ALL" || event.action.projectId === projectFilter,
      )
      .filter(
        (event) => typeFilter === "ALL" || event.action.type === typeFilter,
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [actions, selectedMonth, projectFilter, typeFilter]);

  /*
   * Événements regroupés
   * par journée.
   */
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, AgendaEvent[]>();

    events.forEach((event) => {
      const key = [
        event.date.getFullYear(),

        String(event.date.getMonth() + 1).padStart(2, "0"),

        String(event.date.getDate()).padStart(2, "0"),
      ].join("-");

      const group = groups.get(key) ?? [];

      group.push(event);

      groups.set(key, group);
    });

    return Array.from(groups.entries());
  }, [events]);

  function changeMonth(offset: number) {
    setSelectedMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  return (
    <>
      {/* ============================= */}
      {/* EN-TÊTE                      */}
      {/* ============================= */}

      <div className="between">
        <div>
          <h1>Agenda</h1>

          <p className="muted">
            Vue automatiquement calculée depuis les dates des actions.
          </p>
        </div>
      </div>

      {/* ============================= */}
      {/* OUTILS                       */}
      {/* ============================= */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >
        <div className="agenda-toolbar">
          <div className="month-selector">
            <button
              type="button"
              className="btn ghost"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft size={17} />
            </button>

            <strong className="agenda-month">
              {monthLabel(selectedMonth)}
            </strong>

            <button
              type="button"
              className="btn ghost"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>

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
        </div>

        {/* =========================== */}
        {/* FILTRES TYPES              */}
        {/* =========================== */}

        <div
          className="tabs"
          style={{
            marginTop: 18,
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

      {/* ============================= */}
      {/* LÉGENDE                      */}
      {/* ============================= */}

      <div
        className="row agenda-legend"
        style={{
          marginTop: 18,
        }}
      >
        <span className="agenda-kind start">Début</span>

        <span className="agenda-kind due">Échéance</span>

        <span className="agenda-kind overdue">En retard</span>
      </div>

      {/* ============================= */}
      {/* AGENDA                       */}
      {/* ============================= */}

      <div
        className="agenda-list"
        style={{
          marginTop: 16,
        }}
      >
        {groupedEvents.map(([dateKey, dayEvents]) => {
          const day = dayEvents[0].date;

          return (
            <section key={dateKey} className="agenda-day">
              <div className="agenda-date">
                <strong>{formatDate(day)}</strong>
              </div>

              <div className="agenda-day-events">
                {dayEvents.map((event) => {
                  const overdue = isOverdue(event);

                  return (
                    <div
                      key={event.id}
                      className={[
                        "agenda-entry",

                        typeClasses[event.action.type],

                        overdue ? "is-overdue" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="agenda-entry-marker" aria-hidden="true" />

                      <div className="agenda-entry-content">
                        <div className="row">
                          <strong>{event.action.reference}</strong>

                          <span className="pill">
                            {typeLabels[event.action.type]}
                          </span>

                          <span
                            className={`agenda-kind ${
                              overdue
                                ? "overdue"
                                : event.kind === "START"
                                  ? "start"
                                  : "due"
                            }`}
                          >
                            {overdue
                              ? "En retard"
                              : event.kind === "START"
                                ? "Début"
                                : "Échéance"}
                          </span>
                        </div>

                        <div className="agenda-entry-title">
                          {event.action.title}
                        </div>

                        <small className="muted">
                          {event.action.project?.name}

                          {event.action.owner && ` · ${event.action.owner}`}
                        </small>
                      </div>

                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => onEdit(event.action)}
                        aria-label="Modifier l'action"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {groupedEvents.length === 0 && (
          <div className="card muted">Aucune action datée pour ce mois.</div>
        )}
      </div>
    </>
  );
}
