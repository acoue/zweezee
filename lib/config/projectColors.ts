export const PROJECT_COLOR_KEYS = [
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "pink",
    "coral",
    "orange",
    "amber",
    "lime",
    "emerald",
    "teal",
] as const;

export type ProjectColorKey =
    typeof PROJECT_COLOR_KEYS[number];

export interface ProjectColor {
    key: ProjectColorKey;
    label: string;
    solid: string;
    soft: string;
    border: string;
    text: string;
}

export const PROJECT_COLORS: Record<
    ProjectColorKey,
    ProjectColor
> = {
    sky: {
        key: "sky",
        label: "Bleu ciel",
        solid: "#7dd3fc",
        soft: "#f0f9ff",
        border: "#bae6fd",
        text: "#0369a1",
    },

    blue: {
        key: "blue",
        label: "Bleu",
        solid: "#93c5fd",
        soft: "#eff6ff",
        border: "#bfdbfe",
        text: "#1d4ed8",
    },

    indigo: {
        key: "indigo",
        label: "Indigo",
        solid: "#a5b4fc",
        soft: "#eef2ff",
        border: "#c7d2fe",
        text: "#4338ca",
    },

    violet: {
        key: "violet",
        label: "Violet",
        solid: "#c4b5fd",
        soft: "#f5f3ff",
        border: "#ddd6fe",
        text: "#6d28d9",
    },

    purple: {
        key: "purple",
        label: "Pourpre",
        solid: "#d8b4fe",
        soft: "#faf5ff",
        border: "#e9d5ff",
        text: "#7e22ce",
    },

    pink: {
        key: "pink",
        label: "Rose",
        solid: "#f9a8d4",
        soft: "#fdf2f8",
        border: "#fbcfe8",
        text: "#be185d",
    },

    coral: {
        key: "coral",
        label: "Corail",
        solid: "#fda4af",
        soft: "#fff1f2",
        border: "#fecdd3",
        text: "#be123c",
    },

    orange: {
        key: "orange",
        label: "Orange",
        solid: "#fdba74",
        soft: "#fff7ed",
        border: "#fed7aa",
        text: "#c2410c",
    },

    amber: {
        key: "amber",
        label: "Ambre",
        solid: "#fcd34d",
        soft: "#fffbeb",
        border: "#fde68a",
        text: "#b45309",
    },

    lime: {
        key: "lime",
        label: "Citron vert",
        solid: "#bef264",
        soft: "#f7fee7",
        border: "#d9f99d",
        text: "#4d7c0f",
    },

    emerald: {
        key: "emerald",
        label: "Émeraude",
        solid: "#6ee7b7",
        soft: "#ecfdf5",
        border: "#a7f3d0",
        text: "#047857",
    },

    teal: {
        key: "teal",
        label: "Turquoise",
        solid: "#5eead4",
        soft: "#f0fdfa",
        border: "#99f6e4",
        text: "#0f766e",
    },
};

const DEFAULT_PROJECT_COLOR: ProjectColor = PROJECT_COLORS.sky;

/**
 * Sécurise les anciennes valeurs ou une valeur absente.
 */
export function getProjectColor(
    key?: string | null
): ProjectColor {
    if (
        key &&
        key in PROJECT_COLORS
    ) {
        return PROJECT_COLORS[
            key as ProjectColorKey
        ];
    }

    return DEFAULT_PROJECT_COLOR;
}