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
import type {
  AppData,
  EntityName,
  ModalState,
  Project,
  TimesheetEntry,
  ViewId,
} from "@/types";
import TimesheetView from "@/components/timesheet/TimesheetView";
import TimesheetEditor from "@/components/timesheet/TimesheetEditor";
import ActionsView from "@/components/actions/ActionsView";
import AgendaView from "@/components/agenda/AgendaView";

export default function App({ initial }: { initial: AppData }) {
  const [data, setData] = useState<AppData>(initial);
  const [view, setView] = useState<ViewId>("dashboard");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [timesheetModal, setTimesheetModal] = useState<{
    entry?: TimesheetEntry | null;
  } | null>(null);

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

  async function handleSaveTimesheet(payload: Record<string, unknown>) {
    if (!timesheetModal) {
      return;
    }

    const id = timesheetModal.entry?.id;

    try {
      const saved = await saveEntity("timesheets", payload, id);

      setData((current) => ({
        ...current,

        timesheets: id
          ? current.timesheets.map((entry) => (entry.id === id ? saved : entry))
          : [saved, ...current.timesheets],
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
      await deleteEntity("timesheets", id);

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
  /*
   * =====================================
   * NAVIGATION
   * =====================================
   */

  function changeView(nextView: ViewId) {
    setView(nextView);

    if (nextView !== "detail") {
      setSelectedProject(null);
    }
  }

  function openProject(project: Project) {
    setSelectedProject(project);

    setView("detail");
  }

  /*
   * =====================================
   * CRUD GENERIQUE
   * =====================================
   */

  function openEditor(
    entity: EntityName,

    item: Record<string, unknown> | null = null,
  ) {
    setModal({
      entity,
      item,
    });
  }

  /*
   * =====================================
   * ENREGISTREMENT
   * =====================================
   */

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!modal) {
      return;
    }

    const form = new FormData(event.currentTarget);

    const payload: Record<string, unknown> = {};

    for (const field of entityConfigs[modal.entity].fields) {
      if (field.type === "checkbox") {
        payload[field.key] = form.get(field.key) === "on";

        continue;
      }

      const value = form.get(field.key);
      if (field.type === "number") {
        payload[field.key] =
          value === "" || value === null ? null : Number(value);

        continue;
      }

      payload[field.key] = value;
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

      if (modal.entity === "projects" && selectedProject?.id === id) {
        setSelectedProject(saved);
      }

      setModal(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
      );
    }
  }

  /*
   * =====================================
   * SUPPRESSION
   * =====================================
   */

  async function handleDelete(
    entity: EntityName,

    id: string,
  ) {
    const confirmed = window.confirm("Supprimer cet élément ?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntity(entity, id);

      setData((current) => ({
        ...current,

        [entity]: (current[entity] as any[]).filter((item) => item.id !== id),
      }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression",
      );
    }
  }

  /*
   * =====================================
   * AFFICHAGE
   * =====================================
   */

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
          )}
          {view === "projects" && (
            <ProjectsView projects={data.projects} onOpen={openProject} />
          )}
          {view === "detail" && selectedProject && (
            <ProjectDetail
              project={selectedProject}
              data={data}
              onEditProject={() =>
                openEditor(
                  "projects",
                  selectedProject as unknown as Record<string, unknown>,
                )
              }
              onAdd={openEditor}
              onEdit={openEditor}
              onDelete={handleDelete}
            />
          )}
          {view !== "dashboard" &&
            view !== "projects" &&
            view !== "detail" &&
            view !== "agenda" &&
            view !== "timesheets" &&
            view !== "actions" && (
              <CrudList
                entity={view as EntityName}
                rows={data[view as EntityName] as any[]}
                onEdit={(item) =>
                  openEditor(
                    view as EntityName,

                    item,
                  )
                }
                onDelete={(id) =>
                  handleDelete(
                    view as EntityName,

                    id,
                  )
                }
              />
            )}
          {view === "actions" && (
            <ActionsView
              actions={data.actions}
              projects={data.projects}
              timesheets={data.timesheets}
              onAdd={() => openEditor("actions")}
              onEdit={(action) =>
                openEditor(
                  "actions",
                  action as unknown as Record<string, unknown>,
                )
              }
              onDelete={(id) => handleDelete("actions", id)}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              actions={data.actions}
              projects={data.projects}
              onEdit={(action) =>
                openEditor(
                  "actions",

                  action as unknown as Record<string, unknown>,
                )
              }
            />
          )}
          {view === "timesheets" && (
            <TimesheetView
              entries={data.timesheets}
              projects={data.projects}
              actions={data.actions}
              onAdd={handleAddTimesheet}
              onEdit={handleEditTimesheet}
              onDelete={handleDeleteTimesheet}
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
      {timesheetModal && (
        <TimesheetEditor
          entry={timesheetModal.entry}
          projects={data.projects}
          actions={data.actions}
          onSave={handleSaveTimesheet}
          onClose={() => setTimesheetModal(null)}
        />
      )}
    </div>
  );
}

/*
 * =====================================
 * AGENDA TEMPORAIRE
 * =====================================
 *
 * Ce composant permet de compiler
 * immédiatement après la suppression
 * de Event.
 *
 * On le remplacera ensuite par
 * components/agenda/AgendaView.tsx.
 */

// function AgendaPlaceholder({ actions }: { actions: AppData["actions"] }) {
//   const datedActions = actions.filter(
//     (action) => action.startDate || action.dueDate,
//   );

//   return (
//     <>
//       <h1>Agenda</h1>

//       <p className="muted">Vue calculée depuis les dates des actions.</p>

//       <div className="list">
//         {datedActions.map((action) => (
//           <div key={action.id} className="listitem between">
//             <div>
//               <small className="muted">
//                 {action.reference}
//                 {" · "}
//                 {action.project?.name}
//               </small>

//               <strong
//                 style={{
//                   display: "block",
//                 }}
//               >
//                 {action.title}
//               </strong>

//               <small className="muted">
//                 {action.startDate && (
//                   <>
//                     Début :{" "}
//                     {new Date(action.startDate).toLocaleDateString("fr-FR")}
//                   </>
//                 )}

//                 {action.startDate && action.dueDate && " · "}

//                 {action.dueDate && (
//                   <>
//                     Échéance :{" "}
//                     {new Date(action.dueDate).toLocaleDateString("fr-FR")}
//                   </>
//                 )}
//               </small>
//             </div>

//             <span className="pill">{action.type}</span>
//           </div>
//         ))}

//         {datedActions.length === 0 && (
//           <div className="listitem muted">Aucune </div>
//         )}
//       </div>
//     </>
//   );
// }
