/* ───────────────────────── design tokens ───────────────────────── */

/* Palette: official SFI 2017 brand colors (2017_SFI_palette.pdf) */
export const INK = "#322b29";          // SFI near-black
export const DARK = "#322b29";
export const ACCENT = "#af2f23";       // SFI red
export const STAR = "#d49a34";         // SFI gold
export const PAPER = "#f7f6f3";
export const GRAD = "linear-gradient(100deg, #58455f 0%, #005d77 100%)"; // Complexity Explorer banner gradient (plum → teal)
export const HEAD = { fontFamily: 'ui-sans-serif, "Helvetica Neue", Arial, sans-serif', fontWeight: 700, letterSpacing: "-0.01em" }; // bold grotesque headlines
export const FORMAT_COLORS = {
  "Video": "#af2f23",
  "Interactive Simulation": "#008e94",
  "Notebook": "#d49a34",
  "Course": "#58455f",
  "Website": "#51661a",
  "Paper": "#a27635",
  "Book": "#005d77",
  "Slides": "#d15a2a",
};
export const MONO = { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' };
export const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
export const clamp3 = { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" };

export const inputCls = "w-full px-3 py-2 rounded border text-sm bg-white";
export const inputStyle = { borderColor: "#d4d5d3", color: INK };
