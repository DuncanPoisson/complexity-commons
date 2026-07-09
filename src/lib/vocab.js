/* ───────────────────────── vocabularies ───────────────────────── */

export const TOPICS = ["Networks", "Agent-Based Models", "Dynamics & Chaos", "Self-Organization", "Cellular Automata", "Game Theory", "Information Theory", "Scaling & Power Laws", "Evolution & Adaptation"];
export const FORMATS = ["Video", "Interactive Simulation", "Notebook", "Course", "Website", "Paper", "Book", "Slides"];
export const LEVELS = ["General Audience", "Undergraduate", "Graduate", "Research"];
export const DIFFICULTIES = ["Introductory", "Intermediate", "Advanced"];
export const FLAG_TYPES = ["Broken link", "Outdated content", "Factual error", "Metadata problem", "Other"];
export const ROLES = ["viewer", "contributor", "admin"];

export const EMPTY = { title: "", url: "", format: FORMATS[0], topics: [], level: LEVELS[1], description: "", usage: "", prereqs: "", difficulty: DIFFICULTIES[0], time: "", author: "", license: "", citation: "" };
