import type { EntityName } from "@/types";
export async function saveEntity(
  entity: EntityName,
  payload: Record<string, unknown>,
  id?: string,
) {
  const response = await fetch(`/api/${entity}${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Erreur lors de l’enregistrement");
  return result;
}
export async function deleteEntity(entity: EntityName, id: string) {
  const response = await fetch(`/api/${entity}/${id}`, { method: "DELETE" });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Erreur lors de la suppression");
  return result;
}
