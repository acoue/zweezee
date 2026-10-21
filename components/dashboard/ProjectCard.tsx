import HealthBadge from "@/components/ui/HealthBadge";

import { getProjectColor } from "@/lib/config/projectColors";

import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;

  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const color = getProjectColor(project.color);

  return (
    <button
      type="button"
      className="card project project-card"
      onClick={() => onOpen(project)}
      style={{
        borderColor: color.border,

        background: `linear-gradient(
            135deg,
            ${color.soft} 0%,
            #ffffff 48%
          )`,
      }}
    >
      <div className="between">
        <div className="row">
          <span
            className="project-color-dot"
            style={{
              backgroundColor: color.solid,
            }}
          />

          <div>
            <b>{project.name}</b>

            <div className="muted">{project.phase || "Sans phase"}</div>
          </div>
        </div>

        <HealthBadge health={project.health} />
      </div>

      {project.description && <p>{project.description}</p>}

      {project.projectEnabled && (
        <>
          <div className="between">
            <small>Avancement</small>

            <small>{project.progress ?? 0} %</small>
          </div>

          <div className="bar">
            <span
              style={{
                width: `${project.progress ?? 0}%`,

                backgroundColor: color.solid,
              }}
            />
          </div>
        </>
      )}

      <div
        className="project-card-footer"
        style={{
          color: color.text,
        }}
      >
        {project.projectEnabled && "Projet / évolution"}

        {project.projectEnabled && project.maintenanceEnabled && " · "}

        {project.maintenanceEnabled && "Maintenance / RUN"}
      </div>
    </button>
  );
}
