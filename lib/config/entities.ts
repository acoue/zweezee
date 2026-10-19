import type { EntityName } from "@/types";
export type FieldType =
  | "text"
  | "number"
  | "date"
  | "checkbox"
  | "project"
  | `select:${string}`;
export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  full?: boolean;
}
export interface EntityConfig {
  title: string;
  singular: string;
  fields: FieldConfig[];
}
export const entityConfigs: Record<EntityName, EntityConfig> = {
  projects: {
    title: "Projets",
    singular: "projet",
    fields: [
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "description", label: "Description", type: "text", full: true },
      {
        key: "phase",
        label: "Phase",
        type: "select:Cadrage|Conception|Développement|Recette|Production|Stabilisation",
      },
      { key: "progress", label: "Avancement %", type: "number" },
      { key: "health", label: "Santé", type: "select:GREEN|ORANGE|RED" },
      { key: "color", label: "Couleur", type: "select:sky|violet|emerald" },
      {
        key: "projectEnabled",
        label: "Suivi projet / évolution",
        type: "checkbox",
      },
      {
        key: "maintenanceEnabled",
        label: "Maintenance / RUN",
        type: "checkbox",
      },
    ],
  },
  actions: {
    title: "Actions",
    singular: "action",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "projectId", label: "Projet", type: "project", required: true },
      { key: "owner", label: "Responsable", type: "text" },
      { key: "dueDate", label: "Échéance", type: "date" },
      {
        key: "status",
        label: "Statut",
        type: "select:TODO|IN_PROGRESS|BLOCKED|DONE|CANCELLED",
      },
      {
        key: "priority",
        label: "Priorité",
        type: "select:LOW|MEDIUM|HIGH|CRITICAL",
      },
      { key: "source", label: "Origine", type: "text" },
    ],
  },
  risks: {
    title: "Risques",
    singular: "risque",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "projectId", label: "Projet", type: "project", required: true },
      { key: "probability", label: "Probabilité /5", type: "number" },
      { key: "impact", label: "Impact /5", type: "number" },
      {
        key: "level",
        label: "Niveau",
        type: "select:Mineur|Modéré|Élevé|Critique",
      },
      { key: "owner", label: "Responsable", type: "text" },
      {
        key: "mitigation",
        label: "Plan de traitement",
        type: "text",
        full: true,
      },
    ],
  },
  events: {
    title: "Agenda",
    singular: "événement",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "projectId", label: "Projet", type: "project", required: true },
      { key: "startsAt", label: "Début", type: "date", required: true },
      { key: "endsAt", label: "Fin", type: "date" },
      {
        key: "type",
        label: "Type",
        type: "select:COMMITTEE|MEETING|MILESTONE|ACTION|DECISION|RISK",
      },
    ],
  },
  milestones: {
    title: "Jalons",
    singular: "jalon",
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "projectId", label: "Projet", type: "project", required: true },
      { key: "dueDate", label: "Échéance", type: "date", required: true },
      {
        key: "status",
        label: "Statut",
        type: "select:PLANNED|IN_PROGRESS|DONE|CANCELLED",
      },
    ],
  },
  timesheets: {
    title: "Timesheet",
    singular: "entrée de temps",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "projectId", label: "Projet", type: "project", required: true },
      { key: "activity", label: "Activité", type: "text", required: true },
      { key: "hours", label: "Charge (h)", type: "number", required: true },
    ],
  },
};
