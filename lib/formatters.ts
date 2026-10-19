import type { Health } from "@/types";
export function formatDate(value?:string|null){return value?new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)):"";}
export function toInputDate(value?:unknown){return value?new Date(String(value)).toISOString().slice(0,10):"";}
export const healthLabels:Record<Health,string>={GREEN:"Maîtrisé",ORANGE:"À surveiller",RED:"En difficulté"};
