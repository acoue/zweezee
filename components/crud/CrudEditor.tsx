import { entityConfigs } from "@/lib/config/entities";
import { toInputDate } from "@/lib/formatters";
import type { ModalState, Project } from "@/types";
export default function CrudEditor({
  modal,
  projects,
  onSave,
  onClose,
}: {
  modal: ModalState;
  projects: Project[];
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const config = entityConfigs[modal.entity],
    item: any = modal.item || {};
  return (
    <div className="modal">
      <form className="modalbox" onSubmit={onSave}>
        <div className="between">
          <h2>
            {item.id ? "Modifier" : "Ajouter"} · {config.title}
          </h2>
          <button type="button" className="btn ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="formgrid">
          {config.fields.map((field) => (
            <label key={field.key} className={field.full ? "full" : ""}>
              {field.type === "checkbox" ? (
                <div className="checkbox-field">
                  <input
                    type="checkbox"
                    name={field.key}
                    defaultChecked={item[field.key] ?? false}
                  />

                  <span>{field.label}</span>
                </div>
              ) : (
                <>
                  {field.label}

                  {field.type === "project" ? (
                    <select
                      className="input"
                      name={field.key}
                      defaultValue={item[field.key] || item.projectId || ""}
                      required={field.required}
                    >
                      <option value="">Sélectionner</option>

                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  ) : field.type.startsWith("select:") ? (
                    <select
                      className="input"
                      name={field.key}
                      defaultValue={
                        item[field.key] ||
                        field.type.split(":")[1].split("|")[0]
                      }
                    >
                      {field.type
                        .split(":")[1]
                        .split("|")
                        .map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                    </select>
                  ) : (
                    <input
                      className="input"
                      name={field.key}
                      type={field.type}
                      step={field.type === "number" ? "0.5" : undefined}
                      defaultValue={
                        field.type === "date"
                          ? toInputDate(item[field.key])
                          : (item[field.key] ?? "")
                      }
                      required={field.required}
                    />
                  )}
                </>
              )}
            </label>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <button className="btn">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
