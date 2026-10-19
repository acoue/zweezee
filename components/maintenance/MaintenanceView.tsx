"use client";

import { useMemo, useState } from "react";

import {
  Bug,
  CircleAlert,
  Lightbulb,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import type { WorkItem, WorkItemType } from "@/types";

type Filter = "ALL" | WorkItemType;

interface Props {
  workItems: WorkItem[];

  onAdd: () => void;

  onEdit: (item: WorkItem) => void;

  onDelete: (id: string) => void;
}

const typeLabels: Record<WorkItemType, string> = {
  BUG: "Bug",
  INCIDENT: "Incident",
  EVOLUTION: "Évolution",
  TASK: "Tâche",
};

const typeIcons = {
  BUG: Bug,
  INCIDENT: CircleAlert,
  EVOLUTION: Lightbulb,
  TASK: ListTodo,
};

export default function MaintenanceView({
  workItems,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") {
      return workItems;
    }

    return workItems.filter((item) => item.type === filter);
  }, [workItems, filter]);

  const openItems = workItems.filter(
    (item) => item.status !== "DONE" && item.status !== "CANCELLED",
  );

  const blocked = workItems.filter((item) => item.status === "BLOCKED");

  return (
    <section className="maintenance">
      <div className="between">
        <div>
          <h2>Maintenance / RUN</h2>

          <p className="muted">
            Bugs, incidents, évolutions et tâches de maintenance.
          </p>
        </div>

        <button className="btn" onClick={onAdd}>
          <Plus size={15} />
          Ajouter
        </button>
      </div>

      <div className="grid g3">
        <div className="card">
          <small className="muted">Ouverts</small>

          <h2>{openItems.length}</h2>
        </div>

        <div className="card">
          <small className="muted">Bloqués</small>

          <h2>{blocked.length}</h2>
        </div>

        <div className="card">
          <small className="muted">Total</small>

          <h2>{workItems.length}</h2>
        </div>
      </div>

      <div
        className="tabs"
        style={{
          marginTop: 20,
        }}
      >
        <FilterButton
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
        >
          Tous
        </FilterButton>

        <FilterButton
          active={filter === "BUG"}
          onClick={() => setFilter("BUG")}
        >
          Bugs
        </FilterButton>

        <FilterButton
          active={filter === "INCIDENT"}
          onClick={() => setFilter("INCIDENT")}
        >
          Incidents
        </FilterButton>

        <FilterButton
          active={filter === "EVOLUTION"}
          onClick={() => setFilter("EVOLUTION")}
        >
          Évolutions
        </FilterButton>

        <FilterButton
          active={filter === "TASK"}
          onClick={() => setFilter("TASK")}
        >
          Tâches
        </FilterButton>
      </div>

      <div className="list">
        {filtered.map((item) => {
          const Icon = typeIcons[item.type];

          return (
            <div className="listitem between" key={item.id}>
              <div className="row">
                <div className={"workitem-icon " + item.type.toLowerCase()}>
                  <Icon size={16} />
                </div>

                <div>
                  <div className="row">
                    <strong>{item.reference}</strong>

                    <span className="pill">{typeLabels[item.type]}</span>
                  </div>

                  <div>{item.title}</div>

                  <small className="muted">
                    {item.owner || "Non affecté"}
                    {" · "}
                    {item.status}
                  </small>
                </div>
              </div>

              <div className="actions">
                <button className="btn ghost" onClick={() => onEdit(item)}>
                  <Pencil size={15} />
                </button>

                <button
                  className="btn danger"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="listitem muted">Aucun élément de maintenance.</div>
        )}
      </div>
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={"tab " + (active ? "active" : "")} onClick={onClick}>
      {children}
    </button>
  );
}
