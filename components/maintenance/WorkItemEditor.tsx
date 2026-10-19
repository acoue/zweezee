"use client";

import type {
  Project,
  WorkItem,
} from "@/types";

interface WorkItemEditorProps {
  item?: WorkItem | null;
  project: Project;

  onSave: (
    payload: Record<string, unknown>
  ) => Promise<void> | void;

  onClose: () => void;
}

export default function WorkItemEditor({
  item,
  project,
  onSave,
  onClose,
}: WorkItemEditorProps) {
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const payload = {
      title: String(
        form.get("title") || ""
      ),

      description: String(
        form.get("description") || ""
      ),

      type: String(
        form.get("type") || "TASK"
      ),

      status: String(
        form.get("status") || "TODO"
      ),

      priority: String(
        form.get("priority") || "MEDIUM"
      ),

      owner: String(
        form.get("owner") || ""
      ),

      dueDate: String(
        form.get("dueDate") || ""
      ),

      projectId: project.id,
    };

    await onSave(payload);
  }

  const dueDate =
    item?.dueDate
      ? new Date(item.dueDate)
          .toISOString()
          .slice(0, 10)
      : "";

  return (
    <div className="modal">
      <form
        className="modalbox"
        onSubmit={handleSubmit}
      >
        <div className="between">
          <div>
            <h2>
              {item
                ? `Modifier ${item.reference}`
                : "Nouvel élément de maintenance"}
            </h2>

            <p className="muted">
              Projet : {project.name}
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
          {/* TITRE */}

          <label className="full">
            Titre

            <input
              className="input"
              name="title"
              required
              autoFocus
              defaultValue={
                item?.title || ""
              }
            />
          </label>

          {/* TYPE */}

          <label>
            Type

            <select
              className="input"
              name="type"
              defaultValue={
                item?.type || "TASK"
              }
            >
              <option value="TASK">
                Tâche
              </option>

              <option value="BUG">
                Bug
              </option>

              <option value="INCIDENT">
                Incident
              </option>

              <option value="EVOLUTION">
                Évolution
              </option>
            </select>
          </label>

          {/* STATUT */}

          <label>
            Statut

            <select
              className="input"
              name="status"
              defaultValue={
                item?.status || "TODO"
              }
            >
              <option value="TODO">
                À faire
              </option>

              <option value="IN_PROGRESS">
                En cours
              </option>

              <option value="BLOCKED">
                Bloqué
              </option>

              <option value="DONE">
                Terminé
              </option>

              <option value="CANCELLED">
                Annulé
              </option>
            </select>
          </label>

          {/* PRIORITÉ */}

          <label>
            Priorité

            <select
              className="input"
              name="priority"
              defaultValue={
                item?.priority || "MEDIUM"
              }
            >
              <option value="LOW">
                Basse
              </option>

              <option value="MEDIUM">
                Moyenne
              </option>

              <option value="HIGH">
                Haute
              </option>

              <option value="CRITICAL">
                Critique
              </option>
            </select>
          </label>

          {/* RESPONSABLE */}

          <label>
            Responsable

            <input
              className="input"
              name="owner"
              defaultValue={
                item?.owner || ""
              }
            />
          </label>

          {/* ÉCHÉANCE */}

          <label>
            Échéance

            <input
              className="input"
              name="dueDate"
              type="date"
              defaultValue={dueDate}
            />
          </label>

          {/* DESCRIPTION */}

          <label className="full">
            Description

            <textarea
              className="input"
              name="description"
              rows={5}
              defaultValue={
                item?.description || ""
              }
            />
          </label>
        </div>

        <div
          className="between"
          style={{
            marginTop: 24,
          }}
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
          >
            {item
              ? "Enregistrer les modifications"
              : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}