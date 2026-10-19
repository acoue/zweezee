"use client";

import { useMemo, useState } from "react";

import type {
  Project,
  TimesheetEntry,
  TimesheetScope,
  WorkItem,
} from "@/types";

interface TimesheetEditorProps {
  entry?: TimesheetEntry | null;
  projects: Project[];
  workItems: WorkItem[];
  onSave: (payload: Record<string, unknown>) => Promise<void> | void;
  onClose: () => void;
}

export default function TimesheetEditor({
  entry,
  projects,
  workItems,
  onSave,
  onClose,
}: TimesheetEditorProps) {
  const [projectId, setProjectId] = useState(
    entry?.projectId ?? projects[0]?.id ?? ""
  );

  const [scope, setScope] = useState<TimesheetScope>(
    entry?.scope ?? "PROJECT"
  );

  const availableWorkItems = useMemo(
    () =>
      workItems.filter(
        (item) => item.projectId === projectId
      ),
    [workItems, projectId]
  );

  const selectedProject = projects.find(
    (project) => project.id === projectId
  );

  function handleProjectChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const nextProjectId = event.target.value;
    const nextProject = projects.find(
      (project) => project.id === nextProjectId
    );

    setProjectId(nextProjectId);

    if (
      scope === "MAINTENANCE" &&
      !nextProject?.maintenanceEnabled
    ) {
      setScope("PROJECT");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const workItemId = String(
      form.get("workItemId") ?? ""
    );

    const payload = {
      date: String(form.get("date") ?? ""),
      projectId,
      scope,
      hours: Number(form.get("hours") ?? 0),
      activity: String(form.get("activity") ?? ""),
      workItemId:
        scope === "MAINTENANCE" && workItemId
          ? workItemId
          : null,
    };

    await onSave(payload);
  }

  const defaultDate = entry?.date
    ? new Date(entry.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const canUseProject =
    selectedProject?.projectEnabled ?? false;

  const canUseMaintenance =
    selectedProject?.maintenanceEnabled ?? false;

  return (
    <div className="modal">
      <form
        className="modalbox"
        onSubmit={handleSubmit}
      >
        <div className="between">
          <div>
            <h2>
              {entry
                ? "Modifier le temps saisi"
                : "Saisir du temps"}
            </h2>

            <p className="muted">
              La charge sera intégrée au récapitulatif
              mensuel du projet.
            </p>
          </div>

          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        <div className="formgrid">
          <label>
            Date

            <input
              className="input"
              type="date"
              name="date"
              required
              defaultValue={defaultDate}
            />
          </label>

          <label>
            Projet / application

            <select
              className="input"
              name="projectId"
              required
              value={projectId}
              onChange={handleProjectChange}
            >
              <option value="">
                Sélectionner
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

          <fieldset className="full timesheet-scope">
            <legend>Nature du temps</legend>

            <label className="scope-option">
              <input
                type="radio"
                name="scope"
                value="PROJECT"
                checked={scope === "PROJECT"}
                disabled={!canUseProject}
                onChange={() => setScope("PROJECT")}
              />

              <span>
                <strong>Projet / évolution</strong>
                <small>
                  Pilotage, conception, développement,
                  recette ou préparation de mise en production.
                </small>
              </span>
            </label>

            <label className="scope-option">
              <input
                type="radio"
                name="scope"
                value="MAINTENANCE"
                checked={scope === "MAINTENANCE"}
                disabled={!canUseMaintenance}
                onChange={() => setScope("MAINTENANCE")}
              />

              <span>
                <strong>Maintenance / RUN</strong>
                <small>
                  Bug, incident, évolution légère ou tâche
                  de maintien en conditions opérationnelles.
                </small>
              </span>
            </label>
          </fieldset>

          {scope === "MAINTENANCE" && (
            <label className="full">
              Élément de maintenance facultatif

              <select
                className="input"
                name="workItemId"
                defaultValue={entry?.workItemId ?? ""}
              >
                <option value="">
                  Activité RUN générale, sans ticket
                </option>

                {availableWorkItems.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.reference} · {item.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Temps passé en heures

            <input
              className="input"
              type="number"
              name="hours"
              min="0.25"
              max="24"
              step="0.25"
              required
              defaultValue={
                entry ? Number(entry.hours) : 1
              }
            />
          </label>

          <label className="full">
            Activité réalisée

            <textarea
              className="input"
              name="activity"
              rows={4}
              required
              defaultValue={entry?.activity ?? ""}
              placeholder="Ex. préparation du COSUI, analyse du bug, atelier métier..."
            />
          </label>
        </div>

        {!canUseProject && !canUseMaintenance && (
          <p className="timesheet-warning">
            Le projet sélectionné ne possède aucun mode
            de suivi actif.
          </p>
        )}

        <div
          className="between"
          style={{ marginTop: 24 }}
        >
          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn"
            disabled={
              !projectId ||
              (!canUseProject && !canUseMaintenance)
            }
          >
            {entry
              ? "Enregistrer les modifications"
              : "Ajouter au mois"}
          </button>
        </div>
      </form>
    </div>
  );
}
