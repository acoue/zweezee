import type { ProjectColorKey,} from "@/lib/config/projectColors";

export type ViewId =
  | "dashboard"
  | "projects"
  | "actions"
  | "risks"
  | "agenda"
  | "timesheets"
  | "detail";

export type EntityName =
  | "projects"
  | "actions"
  | "risks"
  | "timesheets";

export type Health =
  | "GREEN"
  | "ORANGE"
  | "RED";

export type Priority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type ActionType =
  | "ACTION"
  | "BUG"
  | "EVOLUTION"
  | "JALON";

export type ActionStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export interface RelatedProject {
  id: string;
  name: string;
  color: string;
}

export interface RelatedAction {
  id: string;
  reference: string;
  title: string;
  type: ActionType;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;

  projectEnabled: boolean;
  maintenanceEnabled: boolean;

  phase?: string | null;
  progress?: number | null;

  health: Health;
  color: ProjectColorKey;

  createdAt?: string;
  updatedAt?: string;
}

export interface Action {
  id: string;

  reference: string;
  type: ActionType;

  title: string;
  description?: string | null;

  startDate?: string | null;
  dueDate?: string | null;

  estimatedHours?: number | string | null;

  owner?: string | null;

  status: ActionStatus;
  priority: Priority;

  source?: string | null;

  projectId: string;
  project?: RelatedProject;

  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;

  reference: string;

  title: string;

  probability: number;
  impact: number;

  level: string;

  owner?: string | null;
  mitigation?: string | null;

  projectId: string;
  project?: RelatedProject;

  createdAt?: string;
  updatedAt?: string;
}

export interface TimesheetEntry {
  id: string;

  date: string;

  hours: number | string;

  activity: string;

  projectId: string;
  project?: RelatedProject;

  actionId?: string | null;
  action?: RelatedAction | null;

  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];

  actions: Action[];

  risks: Risk[];

  timesheets: TimesheetEntry[];
}

export interface ModalState {
  entity: EntityName;

  item?: Record<string, unknown> | null;
}