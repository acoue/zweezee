"use client";

import {
  AlertTriangle,
  Bug,
  CalendarClock,
  CircleAlert,
  Clock3,
  ShieldAlert,
} from "lucide-react";
import MetricCard from "./MetricCard";
import ProjectCard from "./ProjectCard";
import type { AppData, Project } from "@/types";
import { getProjectColor } from "@/lib/config/projectColors";

interface DashboardProps {
  data: AppData;

  onOpenProject: (project: Project) => void;
}

export default function Dashboard({ data, onOpenProject }: DashboardProps) {
  /*
   * On travaille au jour près.
   */
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  /*
   * ====================================
   * ACTIONS OUVERTES
   * ====================================
   */

  const openActions = data.actions.filter(
    (action) => action.status !== "DONE" && action.status !== "CANCELLED",
  );

  /*
   * Actions dont l'échéance
   * est dépassée.
   */
  const overdueActions = openActions.filter((action) => {
    if (!action.dueDate) {
      return false;
    }

    const due = new Date(action.dueDate);

    due.setHours(0, 0, 0, 0);

    return due.getTime() < today.getTime();
  });

  /*
   * Actions bloquées.
   */
  const blockedActions = openActions.filter(
    (action) => action.status === "BLOCKED",
  );

  /*
   * ====================================
   * RISQUES
   * ====================================
   *
   * Criticité =
   * probability × impact.
   *
   * On conserve le seuil >= 12
   * utilisé jusque-là dans Zweezee.
   */
  const highRisks = data.risks.filter(
    (risk) => risk.probability * risk.impact >= 12,
  );

  /*
   * ====================================
   * JALONS
   * ====================================
   *
   * Un jalon est désormais
   * simplement une Action JALON.
   */
  const upcomingMilestones = openActions
    .filter((action) => action.type === "JALON" && !!action.dueDate)
    .filter((action) => new Date(action.dueDate!).getTime() >= today.getTime())
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    );

  /*
   * ====================================
   * PROCHAINES ÉCHÉANCES
   * ====================================
   */

  const upcomingActions = openActions
    .filter(
      (action) =>
        !!action.dueDate &&
        new Date(action.dueDate!).getTime() >= today.getTime(),
    )
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    )
    .slice(0, 6);

  /*
   * ====================================
   * TIMESHEET DU MOIS
   * ====================================
   */

  const currentMonth = today.getMonth();

  const currentYear = today.getFullYear();

  const currentMonthEntries = data.timesheets.filter((entry) => {
    const date = new Date(entry.date);

    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const monthHours = currentMonthEntries.reduce(
    (total, entry) => total + Number(entry.hours),

    0,
  );

  /*
   * Charge du mois par projet.
   */
  const hoursByProject = data.projects
    .map((project) => {
      const hours = currentMonthEntries
        .filter((entry) => entry.projectId === project.id)
        .reduce(
          (total, entry) => total + Number(entry.hours),

          0,
        );

      return {
        project,
        hours,
      };
    })
    .filter((item) => item.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  /*
   * Maximum uniquement utilisé
   * pour dimensionner les barres.
   */
  const maxProjectHours = hoursByProject[0]?.hours || 1;

  return (
    <>
      {/* ============================ */}
      {/* TITRE                       */}
      {/* ============================ */}

      <div>
        <h1>Bonjour Anthony</h1>

        <p className="muted">
          Synthèse du portefeuille et des points nécessitant ton attention.
        </p>
      </div>

      {/* ============================ */}
      {/* INDICATEURS                 */}
      {/* ============================ */}

      <div
        className="grid g4"
        style={{
          marginTop: 22,
        }}
      >
        <MetricCard
          tone="rose"
          value={overdueActions.length}
          label="actions en retard"
        />

        <MetricCard
          tone="amber"
          value={blockedActions.length}
          label="actions bloquées"
        />

        <MetricCard
          tone="violet"
          value={highRisks.length}
          label="risques élevés"
        />

        <MetricCard
          tone="sky"
          value={upcomingMilestones.length}
          label="jalons à venir"
        />
      </div>

      {/* ============================ */}
      {/* PORTEFEUILLE                */}
      {/* ============================ */}

      <section
        style={{
          marginTop: 34,
        }}
      >
        <div className="between">
          <div>
            <h2>Portefeuille projets</h2>

            <p className="muted">Santé et avancement des projets suivis.</p>
          </div>
        </div>

        <div
          className="grid g3"
          style={{
            marginTop: 14,
          }}
        >
          {data.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={onOpenProject}
            />
          ))}
        </div>
      </section>

      {/* ============================ */}
      {/* BAS DU DASHBOARD            */}
      {/* ============================ */}

      <div className="dashboard-bottom-grid">
        {/* ========================== */}
        {/* PROCHAINES ÉCHÉANCES      */}
        {/* ========================== */}

        <section>
          <div className="between">
            <div>
              <h2>À venir</h2>

              <p className="muted">Prochaines échéances des Actions.</p>
            </div>

            <CalendarClock size={20} className="dashboard-section-icon" />
          </div>

          <div
            className="list"
            style={{
              marginTop: 12,
            }}
          >
            {upcomingActions.map((action) => {
              const project = data.projects.find(
                (item) => item.id === action.projectId,
              );

              const projectColor = getProjectColor(project?.color);

              return (
                <div
                  key={action.id}
                  className="listitem"
                  style={{
                    borderLeft: `4px solid ${projectColor.solid}`,
                  }}
                >
                  <div className="between">
                    <div>
                      <div className="row">
                        <strong>{action.reference}</strong>

                        <span className="pill">{action.type}</span>
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                        }}
                      >
                        {action.title}
                      </div>

                      {project && (
                        <small
                          style={{
                            color: projectColor.text,
                          }}
                        >
                          {project.name}
                        </small>
                      )}
                    </div>

                    <div className="dashboard-due-date">
                      <Clock3 size={14} />

                      {new Date(action.dueDate!).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
              );
            })}

            {upcomingActions.length === 0 && (
              <div className="listitem muted">Aucune échéance à venir.</div>
            )}
          </div>
        </section>

        {/* ========================== */}
        {/* CHARGE DU MOIS            */}
        {/* ========================== */}

        <section>
          <div className="between">
            <div>
              <h2>Charge du mois</h2>

              <p className="muted">
                {new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                }).format(today)}
              </p>
            </div>

            <div className="dashboard-month-total">
              {formatHours(monthHours)}

              {" h"}
            </div>
          </div>

          <div
            className="card"
            style={{
              marginTop: 12,
            }}
          >
            <div className="dashboard-hours-list">
              {hoursByProject.map(({ project, hours }) => {
                const projectColor = getProjectColor(project.color);

                return (
                  <div key={project.id} className="dashboard-hours-row">
                    <div className="between">
                      <div className="row">
                        <span
                          className="project-color-dot"
                          style={{
                            backgroundColor: projectColor.solid,
                          }}
                        />

                        <strong>{project.name}</strong>
                      </div>

                      <span>{formatHours(hours)} h</span>
                    </div>

                    <div className="dashboard-hours-bar">
                      <span
                        style={{
                          width: `${(hours / maxProjectHours) * 100}%`,

                          backgroundColor: projectColor.solid,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {hoursByProject.length === 0 && (
                <div className="muted">Aucun temps saisi ce mois-ci.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ============================ */}
      {/* ALERTES                     */}
      {/* ============================ */}

      {(overdueActions.length > 0 ||
        blockedActions.length > 0 ||
        highRisks.length > 0) && (
        <section
          style={{
            marginTop: 34,
          }}
        >
          <div className="between">
            <div>
              <h2>Points d'attention</h2>

              <p className="muted">
                Éléments nécessitant une vigilance particulière.
              </p>
            </div>

            <AlertTriangle size={20} className="dashboard-warning-icon" />
          </div>

          <div
            className="grid g3"
            style={{
              marginTop: 14,
            }}
          >
            {/* ACTIONS EN RETARD */}

            {overdueActions.length > 0 && (
              <div className="card dashboard-alert-card">
                <div className="row">
                  <CircleAlert size={18} />

                  <strong>Retards</strong>
                </div>

                <p>
                  {overdueActions.length}

                  {" action"}

                  {overdueActions.length > 1 ? "s" : ""}

                  {" en retard."}
                </p>
              </div>
            )}

            {/* BLOQUANTS */}

            {blockedActions.length > 0 && (
              <div className="card dashboard-alert-card">
                <div className="row">
                  <AlertTriangle size={18} />

                  <strong>Blocages</strong>
                </div>

                <p>
                  {blockedActions.length}

                  {" action"}

                  {blockedActions.length > 1 ? "s" : ""}

                  {" bloquée"}

                  {blockedActions.length > 1 ? "s" : ""}

                  {"."}
                </p>
              </div>
            )}

            {/* RISQUES */}

            {highRisks.length > 0 && (
              <div className="card dashboard-alert-card">
                <div className="row">
                  <ShieldAlert size={18} />

                  <strong>Risques</strong>
                </div>

                <p>
                  {highRisks.length}

                  {" risque"}

                  {highRisks.length > 1 ? "s" : ""}

                  {" avec une criticité ≥ 12."}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function formatHours(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,

    maximumFractionDigits: 2,
  }).format(value);
}
