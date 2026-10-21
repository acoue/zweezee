import { Pencil, Plus } from "lucide-react";

import CrudList from "@/components/crud/CrudList";
import HealthBadge from "@/components/ui/HealthBadge";
import { entityConfigs } from "@/lib/config/entities";

import type { AppData, EntityName, Project } from "@/types";

/**
 * Entites rattachees au cycle projet classique.
 *
 * Le Timesheet est volontairement exclu de cette liste :
 * il sera gere de maniere transverse entre le suivi projet
 * et la maintenance.
 */
const projectEntities: EntityName[] = [
  "actions",
  "risks"
];

interface ProjectDetailProps {
  project: Project;
  data: AppData;

  /** Modification des informations generales du projet. */
  onEditProject: () => void;
  /** CRUD generique : actions, risques, jalons et evenements. */
  onAdd: (entity: EntityName, defaults?: Record<string, unknown>) => void;
  onEdit: (entity: EntityName, item: Record<string, unknown>) => void;
  onDelete: (entity: EntityName, id: string) => void;
}

export default function ProjectDetail({
  project,
  data,
  onEditProject,
  onAdd,
  onEdit,
  onDelete,
}: ProjectDetailProps) {
  /**
   * Retourne les objets d'une entite appartenant
   * au projet actuellement affiche.
   */
  const linked = (entity: EntityName): Record<string, any>[] => {
    const rows = data[entity] as Record<string, any>[];

    return rows.filter((item) => item.projectId === project.id);
  };

  /** Actions projet encore ouvertes. */
  const openActions = data.actions.filter(
    (action) =>
      action.projectId === project.id &&
      action.status !== "DONE" &&
      action.status !== "CANCELLED",
  );

  return (
    <>
      {/* ================================= */}
      {/* EN-TETE                           */}
      {/* ================================= */}

      <div className="between">
        <div>
          <h1>{project.name}</h1>

          {project.description && (
            <p className="muted">{project.description}</p>
          )}

          <div className="row" style={{ marginTop: 10 }}>
            {project.projectEnabled && (
              <span className="pill">Projet / evolution</span>
            )}

            {project.maintenanceEnabled && (
              <span className="pill">Maintenance / RUN</span>
            )}
          </div>
        </div>

        <button type="button" className="btn" onClick={onEditProject}>
          <Pencil size={15} />
          Modifier
        </button>
      </div>

      {/* ================================= */}
      {/* SYNTHESE                          */}
      {/* ================================= */}

      <div className="grid g4" style={{ marginTop: 20 }}>
        {project.projectEnabled && (
          <div className="card">
            <small className="muted">Phase</small>

            <h3>{project.phase || "Non definie"}</h3>
          </div>
        )}

        {project.projectEnabled && (
          <div className="card">
            <small className="muted">Avancement</small>

            <h3>{project.progress ?? 0} %</h3>

            <div className="bar">
              <span
                style={{
                  width: `${project.progress ?? 0}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="card">
          <small className="muted">Sante</small>

          <h3>
            <HealthBadge health={project.health} />
          </h3>
        </div>

        {project.projectEnabled && (
          <div className="card">
            <small className="muted">Actions ouvertes</small>

            <h3>{openActions.length}</h3>
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* PARTIE PROJET / EVOLUTION         */}
      {/* ================================= */}

      {project.projectEnabled && (
        <section style={{ marginTop: 36 }}>
          <div>
            <h2>Projet / evolution</h2>

            <p className="muted">
              Pilotage du cycle projet, des actions, risques, jalons et
              evenements.
            </p>
          </div>

          {projectEntities.map((entity) => {
            const rows = linked(entity);

            return (
              <section key={entity} style={{ marginTop: 28 }}>
                <div className="between">
                  <div>
                    <h3>{entityConfigs[entity].title}</h3>

                    <small className="muted">
                      {rows.length} element
                      {rows.length > 1 ? "s" : ""}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      onAdd(entity, {
                        projectId: project.id,
                      })
                    }
                  >
                    <Plus size={15} />
                    Ajouter
                  </button>
                </div>

                <div style={{ marginTop: 12 }}>
                  <CrudList
                    entity={entity}
                    rows={rows}
                    showHeading={false}
                    onEdit={(item) => onEdit(entity, item)}
                    onDelete={(id) => onDelete(entity, id)}
                  />
                </div>
              </section>
            );
          })}
        </section>
      )}

      {/* ================================= */}
      {/* AUCUN MODE DE SUIVI               */}
      {/* ================================= */}

      {!project.projectEnabled && !project.maintenanceEnabled && (
        <div className="card" style={{ marginTop: 32 }}>
          <h3>Aucun mode de suivi actif</h3>

          <p className="muted">
            Modifie le projet pour activer le suivi Projet / evolution ou
            Maintenance / RUN.
          </p>

          <button type="button" className="btn" onClick={onEditProject}>
            <Pencil size={15} />
            Modifier le projet
          </button>
        </div>
      )}
    </>
  );
}
