export type ViewId =
  | "dashboard"
  | "projects"
  | "actions"
  | "risks"
  | "events"
  | "milestones"
  | "timesheets"
  | "detail";

export type Health = "GREEN" | "ORANGE" | "RED";

export type EntityName =
  | "projects"
  | "actions"
  | "risks"
  | "events"
  | "milestones"
  | "timesheets";

export type TimesheetScope =
  | "PROJECT"
  | "MAINTENANCE";

export interface Project {
  id: string;
  name: string;
  description?: string | null;

  projectEnabled: boolean;
  maintenanceEnabled: boolean;

  phase?: string | null;
  progress?: number | null;

  health: Health;
  color: string;
}

export interface RelatedProject {
  id: string;
  name: string;
}

export interface Action {
  id: string;
  reference: string;
  title: string;
  owner?: string | null;
  dueDate?: string | null;
  status: string;
  priority: string;
  source?: string | null;
  projectId: string;
  project?: RelatedProject;
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
}
export interface Milestone {
  id: string;
  reference: string;
  title: string;
  dueDate: string;
  status: string;
  projectId: string;
  project?: RelatedProject;
}

export interface ProjectEvent {
  id: string;
  reference: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  type: string;
  projectId: string;
  project?: RelatedProject;
}

export interface TimesheetEntry {
  id: string;

  date: string;
  activity: string;
  hours: number | string;
  scope: TimesheetScope;

  projectId: string;
  project?: RelatedProject;

  workItemId?: string | null;
  workItem?: {
    id: string;
    reference: string;
    title: string;
    type: WorkItemType;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];
  actions: Action[];
  risks: Risk[];
  events: ProjectEvent[];
  milestones: Milestone[];
  timesheets: TimesheetEntry[];

  workItems: WorkItem[];
}

export interface ModalState {
  entity: EntityName;
  item?: Record<string, unknown> | null;
}

export type WorkItemType =
  | "TASK"
  | "BUG"
  | "EVOLUTION"
  | "INCIDENT";

export type WorkItemStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export interface WorkItem {
  id: string;
  reference: string;
  title: string;
  description?: string | null;

  type: WorkItemType;
  status: WorkItemStatus;
  priority: string;

  owner?: string | null;
  dueDate?: string | null;

  projectId: string;
  project?: RelatedProject;

  createdAt: string;
  updatedAt: string;
}