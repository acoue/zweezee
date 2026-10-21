"use client";

import { useMemo, useState } from "react";

import type { Action, Project, TimesheetEntry } from "@/types";

interface TimesheetEditorProps {
  entry?: TimesheetEntry | null;

  projects: Project[];

  actions: Action[];

  onSave: (payload: Record<string, unknown>) => Promise<void> | void;

  onClose: () => void;
}

export default function TimesheetEditor({
  entry,
  projects,
  actions,
  onSave,
  onClose,
}: TimesheetEditorProps) {

  const [projectId, setProjectId] = useState(
    entry?.projectId ?? projects[0]?.id ?? "",
  );
  const [actionId, setActionId] = useState(entry?.actionId ?? "");
  const availableActions = useMemo(
    () =>
      actions
        .filter((action) => action.projectId === projectId)
        .sort((a, b) => a.reference.localeCompare(b.reference)),

    [actions, projectId],
  );
  function handleProjectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextProjectId = event.target.value;

    setProjectId(nextProjectId);

    setActionId("");
  }

  /*
   * Soumission du formulaire.
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      date: String(form.get("date") ?? ""),

      projectId,

      actionId: actionId || null,

      hours: Number(form.get("hours") ?? 0),

      activity: String(form.get("activity") ?? ""),
    };

    await onSave(payload);
  }

  /*
   * Date proposée dans le formulaire.
   */
  const defaultDate = entry?.date
    ? new Date(entry.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <div className="modal">
      <form className="modalbox" onSubmit={handleSubmit}>
        {/* ========================= */}
        {/* EN-TÊTE                  */}
        {/* ========================= */}

        <div className="between">
          <div>
            <h2>{entry ? "Modifier le temps saisi" : "Saisir du temps"}</h2>

            <p className="muted">
              Enregistre le temps réellement passé sur un projet ou une action.
            </p>
          </div>

          <button type="button" className="btn ghost" onClick={onClose}>
            Fermer
          </button>
        </div>

        {/* ========================= */}
        {/* FORMULAIRE               */}
        {/* ========================= */}

        <div className="formgrid">
          {/* DATE */}

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

          {/* PROJET */}

          <label>
            Projet / application
            <select
              className="input"
              name="projectId"
              required
              value={projectId}
              onChange={handleProjectChange}
            >
              <option value="">Sélectionner</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          {/* ACTION */}

          <label className="full">
            Action associée
            <select
              className="input"
              name="actionId"
              value={actionId}
              onChange={(event) => setActionId(event.target.value)}
            >
              <option value="">Temps général sur le projet</option>

              {availableActions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.reference}

                  {" · "}

                  {action.title}
                </option>
              ))}
            </select>
          </label>

          {/* TEMPS */}

          <label>
            Temps passé
            <input
              className="input"
              type="number"
              name="hours"
              min="0.25"
              max="24"
              step="0.25"
              required
              defaultValue={entry ? Number(entry.hours) : 1}
            />
            <small className="muted">
              En heures, par tranche de 15 minutes.
            </small>
          </label>

          {/* ACTIVITÉ */}

          <label className="full">
            Activité réalisée
            <textarea
              className="input"
              name="activity"
              rows={4}
              required
              defaultValue={entry?.activity ?? ""}
              placeholder={
                "Ex. préparation COSUI, correction du bug, atelier métier..."
              }
            />
          </label>
        </div>

        {/* ========================= */}
        {/* ACTIONS                  */}
        {/* ========================= */}

        <div
          className="between"
          style={{
            marginTop: 24,
          }}
        >
          <button type="button" className="btn ghost" onClick={onClose}>
            Annuler
          </button>

          <button type="submit" className="btn" disabled={!projectId}>
            {entry ? "Enregistrer les modifications" : "Ajouter au Timesheet"}
          </button>
        </div>
      </form>
 
    </div>
  );
}
