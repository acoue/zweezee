"use client";
import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import ProjectsView from "@/components/projects/ProjectsView";
import ProjectDetail from "@/components/projects/ProjectDetail";
import CrudList from "@/components/crud/CrudList";
import CrudEditor from "@/components/crud/CrudEditor";
import { entityConfigs } from "@/lib/config/entities";
import { deleteEntity, saveEntity } from "@/lib/entityApi";
import WorkItemEditor from "@/components/maintenance/WorkItemEditor";
import TimesheetEditor from "@/components/timesheet/TimesheetEditor";
import TimesheetView from "@/components/timesheet/TimesheetView";
import type {
  AppData,
  EntityName,
  ModalState,
  Project,
  TimesheetEntry,
  ViewId,
  WorkItem,
} from "@/types";

export default function App({ initial }: { initial: AppData }) {
  const [data, setData] = useState(initial);
  const [view, setView] = useState<ViewId>("dashboard");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [workItemModal, setWorkItemModal] = useState<{
    project: Project;
    item?: WorkItem | null;
  } | null>(null);
  const [timesheetModal, setTimesheetModal] = useState<{
    entry?: TimesheetEntry | null;
  } | null>(null);

  function changeView(next: ViewId) {
    setView(next);
    if (next !== "detail") setSelectedProject(null);
  }
  function openProject(project: Project) {
    setSelectedProject(project);
    setView("detail");
  }
  function openEditor(
    entity: EntityName,
    item: Record<string, unknown> | null = null,
  ) {
    setModal({ entity, item });
  }
  function handleAddTimesheet() {
    setTimesheetModal({
      entry: null,
    });
  }

  function handleEditTimesheet(entry: TimesheetEntry) {
    setTimesheetModal({
      entry,
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};

    for (const field of entityConfigs[modal.entity].fields) {
      if (field.type === "checkbox") {
        payload[field.key] = form.get(field.key) === "on";

        continue;
      }

      const value = form.get(field.key);

      payload[field.key] = field.type === "number" ? Number(value) : value;
    }

    try {
      const id = String((modal.item as any)?.id || "") || undefined;
      const saved = await saveEntity(modal.entity, payload, id);
      setData((current) => ({
        ...current,
        [modal.entity]: id
          ? (current[modal.entity] as any[]).map((item) =>
              item.id === id ? saved : item,
            )
          : [...(current[modal.entity] as any[]), saved],
      }));
      if (modal.entity === "projects" && selectedProject?.id === id)
        setSelectedProject(saved);
      setModal(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur");
    }
  }
  function handleAddWorkItem(project: Project) {
    setWorkItemModal({
      project,
      item: null,
    });
  }

  function handleEditWorkItem(project: Project, item: WorkItem) {
    setWorkItemModal({
      project,
      item,
    });
  }

  async function handleSaveWorkItem(payload: Record<string, unknown>) {
    if (!workItemModal) {
      return;
    }

    const existingItem = workItemModal.item;

    const id = existingItem?.id;

    try {
      const response = await fetch(
        id ? `/api/workitems/${id}` : "/api/workitems",
        {
          method: id ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement");
      }

      setData((current) => ({
        ...current,

        workItems: id
          ? current.workItems.map((item) => (item.id === id ? result : item))
          : [result, ...current.workItems],
      }));

      setWorkItemModal(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
      );
    }
  }

  async function handleDelete(entity: EntityName, id: string) {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      await deleteEntity(entity, id);
      setData((current) => ({
        ...current,
        [entity]: (current[entity] as any[]).filter((item) => item.id !== id),
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur");
    }
  }

  async function handleDeleteWorkItem(id: string) {
    const confirmed = window.confirm("Supprimer cet élément de maintenance ?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/workitems/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }

      setData((current) => ({
        ...current,

        workItems: current.workItems.filter((item) => item.id !== id),
      }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression",
      );
    }
  }

  async function handleSaveTimesheet(payload: Record<string, unknown>) {
    if (!timesheetModal) {
      return;
    }

    const existingEntry = timesheetModal.entry;

    const id = existingEntry?.id;

    try {
      const response = await fetch(
        id ? `/api/timesheets/${id}` : "/api/timesheets",
        {
          method: id ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Erreur lors de l'enregistrement du temps",
        );
      }

      setData((current) => ({
        ...current,

        timesheets: id
          ? current.timesheets.map((entry) =>
              entry.id === id ? result : entry,
            )
          : [result, ...current.timesheets],
      }));

      setTimesheetModal(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement du temps",
      );
    }
  }

  async function handleDeleteTimesheet(id: string) {
    const confirmed = window.confirm("Supprimer cette saisie de temps ?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }

      setData((current) => ({
        ...current,

        timesheets: current.timesheets.filter((entry) => entry.id !== id),
      }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression",
      );
    }
  }
  return (
    <div className="shell">
      <Sidebar view={view} onChange={changeView} />
      <main className="main">
        <AppHeader
          view={view}
          project={selectedProject}
          onAdd={(entity) => openEditor(entity)}
        />
        <div className="content">
          {view === "dashboard" && (
            <Dashboard data={data} onOpenProject={openProject} />
          )}{" "}
          {view === "projects" && (
            <ProjectsView projects={data.projects} onOpen={openProject} />
          )}{" "}
          {view !== "dashboard" &&
            view !== "projects" &&
            view !== "detail" &&
            view !== "timesheets" && (
              <CrudList
                entity={view as EntityName}
                rows={data[view as EntityName] as any[]}
                onEdit={(item) => openEditor(view as EntityName, item)}
                onDelete={(id) => handleDelete(view as EntityName, id)}
              />
            )}{" "}
          {view === "timesheets" && (
            <TimesheetView
              entries={data.timesheets}
              projects={data.projects}
              onAdd={handleAddTimesheet}
              onEdit={handleEditTimesheet}
              onDelete={handleDeleteTimesheet}
            />
          )}
          {view === "detail" && selectedProject && (
            <ProjectDetail
              project={selectedProject}
              data={data}
              onEditProject={() =>
                openEditor("projects", selectedProject as any)
              }
              onAdd={openEditor}
              onEdit={openEditor}
              onDelete={handleDelete}
              onAddWorkItem={handleAddWorkItem}
              onEditWorkItem={handleEditWorkItem}
              onDeleteWorkItem={handleDeleteWorkItem}
            />
          )}
        </div>
      </main>
      {modal && (
        <CrudEditor
          modal={modal}
          projects={data.projects}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {workItemModal && (
        <WorkItemEditor
          project={workItemModal.project}
          item={workItemModal.item}
          onSave={handleSaveWorkItem}
          onClose={() => setWorkItemModal(null)}
        />
      )}
      {timesheetModal && (
        <TimesheetEditor
          entry={timesheetModal.entry}
          projects={data.projects}
          workItems={data.workItems}
          onSave={handleSaveTimesheet}
          onClose={() => setTimesheetModal(null)}
        />
      )}
    </div>
  );
}
