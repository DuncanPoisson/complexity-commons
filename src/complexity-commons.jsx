import React, { useState, useEffect, useRef, useMemo } from "react";
import { store } from "./store.js";

/* ════════════════════════════════════════════════════════════════════
   COMPLEXITY TEACHING COMMONS
   ────────────────────────────────────────────────────────────────────
   Persistence + auth now live in ./store.js (Supabase). This file is the
   UI layer only — it never talks to the database directly; it goes
   through `store`. The seedDb() function below is no longer called at
   runtime (Supabase is the source of truth) but is kept for reference.
   ════════════════════════════════════════════════════════════════════ */

/* ───────────────────────── design tokens ───────────────────────── */

/* Palette: official SFI 2017 brand colors (2017_SFI_palette.pdf) */
const INK = "#322b29";          // SFI near-black
const DARK = "#322b29";
const ACCENT = "#af2f23";       // SFI red
const STAR = "#d49a34";         // SFI gold
const PAPER = "#f7f6f3";
const GRAD = "linear-gradient(100deg, #58455f 0%, #005d77 100%)"; // Complexity Explorer banner gradient (plum → teal)
const HEAD = { fontFamily: 'ui-sans-serif, "Helvetica Neue", Arial, sans-serif', fontWeight: 700, letterSpacing: "-0.01em" }; // bold grotesque headlines
const FORMAT_COLORS = {
  "Video": "#af2f23",
  "Interactive Simulation": "#008e94",
  "Notebook": "#d49a34",
  "Course": "#58455f",
  "Website": "#51661a",
  "Paper": "#a27635",
  "Book": "#005d77",
  "Slides": "#d15a2a",
};
const MONO = { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' };
const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const clamp3 = { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" };

/* ───────────────────────── vocabularies ───────────────────────── */

const TOPICS = ["Networks", "Agent-Based Models", "Dynamics & Chaos", "Self-Organization", "Cellular Automata", "Game Theory", "Information Theory", "Scaling & Power Laws", "Evolution & Adaptation"];
const FORMATS = ["Video", "Interactive Simulation", "Notebook", "Course", "Website", "Paper", "Book", "Slides"];
const LEVELS = ["General Audience", "Undergraduate", "Graduate", "Research"];
const DIFFICULTIES = ["Introductory", "Intermediate", "Advanced"];
const FLAG_TYPES = ["Broken link", "Outdated content", "Factual error", "Metadata problem", "Other"];
const ROLES = ["viewer", "contributor", "admin"];

/* ───────────────────────── seed data ───────────────────────── */

function seedDb() {
  const users = [
    { username: "aokafor", password: "admin", name: "Adaeze Okafor", role: "admin", createdAt: "2026-01-05T10:00:00Z" },
    { username: "rvasquez", password: "demo", name: "Rosa Vásquez", role: "contributor", createdAt: "2026-01-12T10:00:00Z" },
    { username: "mlindgren", password: "demo", name: "Måns Lindgren", role: "contributor", createdAt: "2026-02-02T10:00:00Z" },
    { username: "jchen", password: "demo", name: "Jia Chen", role: "viewer", createdAt: "2026-03-15T10:00:00Z" },
  ];
  const mk = (id, createdBy, createdAt, featured, data, extraVersions) => {
    const versions = [{ v: 1, date: createdAt, editedBy: createdBy, changelog: "Initial submission", data }];
    (extraVersions || []).forEach((ev, i) => versions.push({ v: i + 2, date: ev.date, editedBy: ev.editedBy, changelog: ev.changelog, data: { ...data, ...ev.patch } }));
    return { id, createdBy, createdAt, featured, versions };
  };
  const resources = [
    mk("r1", "rvasquez", "2026-01-20T09:00:00Z", true, {
      title: "Parable of the Polygons",
      url: "https://ncase.me/polygons/",
      format: "Interactive Simulation",
      topics: ["Game Theory", "Self-Organization", "Agent-Based Models"],
      level: "General Audience",
      description: "A playable explainer of Schelling's segregation model. Students drag shapes around a board and watch how small individual preferences produce large-scale segregation.",
      usage: "I open our segregation / Schelling unit with this before any formal definitions. Students play for ten minutes in pairs, then we surface the micro-to-macro punchline together. It reliably generates the 'small bias, big pattern' intuition that the lecture then formalizes.",
      prereqs: "None.",
      difficulty: "Introductory",
      time: "20–30 minutes in class",
      author: "Vi Hart & Nicky Case",
      license: "CC0 (public domain)",
      citation: "Hart, V., & Case, N. (2014). Parable of the Polygons. ncase.me/polygons",
    }),
    mk("r2", "mlindgren", "2026-01-28T09:00:00Z", false, {
      title: "NetLogo Models Library",
      url: "https://ccl.northwestern.edu/netlogo/models/",
      format: "Interactive Simulation",
      topics: ["Agent-Based Models", "Self-Organization", "Evolution & Adaptation"],
      level: "Undergraduate",
      description: "Hundreds of curated agent-based models (flocking, wolf–sheep predation, ant foraging, traffic) that run in the browser or the NetLogo desktop app, each with documented procedures.",
      usage: "Backbone of our weekly lab sessions. Each week students run one model, vary two parameters systematically, and write a half-page on emergent behavior. Flocking and Wolf Sheep Predation are the most reliable crowd-pleasers.",
      prereqs: "No programming needed to run models; basic NetLogo for the extension exercises.",
      difficulty: "Introductory",
      time: "One 2-hour lab per model",
      author: "Uri Wilensky, CCL Northwestern",
      license: "Varies by model (mostly CC BY-NC-SA)",
      citation: "Wilensky, U. (1999). NetLogo. Center for Connected Learning, Northwestern University.",
    }, [{ date: "2026-04-11T14:00:00Z", editedBy: "mlindgren", changelog: "Added note that models now run in NetLogo Web — no install required for labs.", patch: { usage: "Backbone of our weekly lab sessions. Each week students run one model, vary two parameters systematically, and write a half-page on emergent behavior. Flocking and Wolf Sheep Predation are the most reliable crowd-pleasers. As of 2025 everything runs in NetLogo Web, so labs need no software install." } }]),
    mk("r3", "rvasquez", "2026-02-03T09:00:00Z", true, {
      title: "Introduction to Complexity (Complexity Explorer)",
      url: "https://www.complexityexplorer.org/courses",
      format: "Course",
      topics: ["Dynamics & Chaos", "Cellular Automata", "Networks", "Scaling & Power Laws"],
      level: "General Audience",
      description: "The Santa Fe Institute's free flagship MOOC: ~10 units covering dynamics, fractals, information, self-organization, cooperation, and networks, with quizzes and homework.",
      usage: "We assign selected units as pre-semester preparation for incoming PhD students from non-quantitative backgrounds. Units 2 (Dynamics) and 6 (Cellular Automata) also work as flipped-classroom material for an undergrad survey course.",
      prereqs: "High-school algebra; no programming required.",
      difficulty: "Introductory",
      time: "~3 hours per unit, self-paced",
      author: "Melanie Mitchell, Santa Fe Institute",
      license: "Free with registration",
      citation: "Mitchell, M. Introduction to Complexity. Complexity Explorer, Santa Fe Institute.",
    }),
    mk("r4", "mlindgren", "2026-02-10T09:00:00Z", false, {
      title: "Think Complexity, 2nd edition (book + notebooks)",
      url: "https://greenteapress.com/wp/think-complexity-2e/",
      format: "Book",
      topics: ["Networks", "Cellular Automata", "Agent-Based Models", "Self-Organization"],
      level: "Undergraduate",
      description: "Free textbook teaching complexity science through Python, with a companion Jupyter notebook for every chapter (graphs, scale-free networks, CAs, Schelling, SOC, evolution).",
      usage: "Our standard text for the computational track. Students work through the chapter notebooks before class; class time goes to the exercises. The Watts–Strogatz and Barabási–Albert chapters map directly onto our two network-science weeks.",
      prereqs: "Intermediate Python (functions, classes, NumPy basics).",
      difficulty: "Intermediate",
      time: "One chapter (~2–4 h) per week",
      author: "Allen B. Downey",
      license: "CC BY-NC-SA 4.0",
      citation: "Downey, A. B. (2018). Think Complexity (2nd ed.). O'Reilly / Green Tea Press.",
    }),
    mk("r5", "rvasquez", "2026-02-19T09:00:00Z", false, {
      title: "The Surprising Secret of Synchronization (Veritasium)",
      url: "https://www.youtube.com/watch?v=t-_VPRCtiUg",
      format: "Video",
      topics: ["Self-Organization", "Dynamics & Chaos"],
      level: "General Audience",
      description: "A 20-minute video on spontaneous synchronization — metronomes, fireflies, the Millennium Bridge — building intuition for coupled oscillators.",
      usage: "Assigned as pre-watch before the Kuramoto model lecture. The metronome demo gives students a concrete mental image we refer back to when the order parameter is introduced; pairs nicely with the Fireflies interactive in this repository.",
      prereqs: "None.",
      difficulty: "Introductory",
      time: "21-minute video",
      author: "Derek Muller (Veritasium)",
      license: "Standard YouTube license",
      citation: "Muller, D. (2021). The Surprising Secret of Synchronization. Veritasium.",
    }),
    mk("r6", "mlindgren", "2026-03-01T09:00:00Z", false, {
      title: "Power-Law Distributions in Empirical Data",
      url: "https://arxiv.org/abs/0706.1062",
      format: "Paper",
      topics: ["Scaling & Power Laws", "Information Theory"],
      level: "Graduate",
      description: "Clauset, Shalizi & Newman's canonical paper on rigorously fitting and testing power laws — maximum likelihood estimation, KS statistics, and likelihood-ratio comparison against alternatives.",
      usage: "Required reading for the 'statistics of heavy tails' week in our methods seminar. Students replicate Table 6 on one dataset of their choice using the Python `powerlaw` package, which doubles as their first encounter with model comparison.",
      prereqs: "Graduate-level probability; basic Python for the replication exercise.",
      difficulty: "Advanced",
      time: "One seminar week (reading + replication)",
      author: "A. Clauset, C. R. Shalizi, M. E. J. Newman",
      license: "arXiv preprint (open access)",
      citation: "Clauset, A., Shalizi, C. R., & Newman, M. E. J. (2009). SIAM Review, 51(4), 661–703.",
    }),
    mk("r7", "rvasquez", "2026-03-12T09:00:00Z", true, {
      title: "Network Science (online textbook)",
      url: "http://networksciencebook.com/",
      format: "Book",
      topics: ["Networks", "Scaling & Power Laws"],
      level: "Graduate",
      description: "Barabási's full network-science textbook, free online: graph theory, random networks, scale-free property, evolving networks, communities, spreading phenomena.",
      usage: "Primary reference for our graduate network science module. Chapters 3–5 (random networks through the Barabási–Albert model) anchor three consecutive lectures; the end-of-chapter datasets feed the problem sets.",
      prereqs: "Calculus and introductory probability.",
      difficulty: "Intermediate",
      time: "Semester-long companion text",
      author: "Albert-László Barabási",
      license: "Free online edition",
      citation: "Barabási, A.-L. (2016). Network Science. Cambridge University Press.",
    }),
    mk("r8", "mlindgren", "2026-04-02T09:00:00Z", false, {
      title: "Fireflies (interactive)",
      url: "https://ncase.me/fireflies/",
      format: "Interactive Simulation",
      topics: ["Self-Organization", "Dynamics & Chaos"],
      level: "General Audience",
      description: "A short interactive on firefly synchronization: nudge individual fireflies, tune coupling, and watch global sync emerge (or fail).",
      usage: "Five-minute live demo at the start of the coupled-oscillators lecture, projected and driven by student suggestions. Works well as the 'toy' counterpart to the Veritasium video and the formal Kuramoto treatment.",
      prereqs: "None.",
      difficulty: "Introductory",
      time: "5–10 minutes",
      author: "Nicky Case",
      license: "CC0 (public domain)",
      citation: "Case, N. (2016). Fireflies. ncase.me/fireflies",
    }),
    mk("r9", "rvasquez", "2026-04-20T09:00:00Z", false, {
      title: "Mesa: Agent-Based Modeling in Python — tutorial",
      url: "https://mesa.readthedocs.io/",
      format: "Notebook",
      topics: ["Agent-Based Models", "Networks"],
      level: "Graduate",
      description: "Official tutorial for Mesa, the Python ABM framework: build the Boltzmann wealth model step by step, add a grid, collect data, and batch-run parameter sweeps.",
      usage: "Half-day hands-on workshop for first-year PhD students moving from NetLogo to Python. We follow the tutorial through the data-collector section, then students extend the model with one mechanism of their own.",
      prereqs: "Comfortable Python, including classes.",
      difficulty: "Intermediate",
      time: "Half-day workshop (~4 h)",
      author: "Project Mesa core team",
      license: "Apache 2.0 (docs CC BY)",
      citation: "Kazil, J., Masad, D., & Crooks, A. (2020). Utilizing Python for Agent-Based Modeling: The Mesa Framework.",
    }),
    mk("r10", "mlindgren", "2026-05-05T09:00:00Z", false, {
      title: "Conway's Game of Life (in-browser)",
      url: "https://playgameoflife.com/",
      format: "Interactive Simulation",
      topics: ["Cellular Automata", "Self-Organization"],
      level: "General Audience",
      description: "A clean, fast in-browser Game of Life with a pattern library (gliders, glider guns, pulsars) and step-by-step execution.",
      usage: "Used in the first lecture of the semester to define 'simple rules, complex behavior' before any mathematics. Students each find one still life, one oscillator, and one spaceship as a five-minute scavenger hunt.",
      prereqs: "None.",
      difficulty: "Introductory",
      time: "10–15 minutes",
      author: "Edwin Martin (implementation); J. H. Conway (rules)",
      license: "Free to use online",
      citation: "Conway, J. H. (1970), via Gardner, M., Scientific American 223.",
    }),
    mk("r11", "rvasquez", "2026-05-08T09:00:00Z", false, {
      title: "Gephi — open graph visualization platform",
      url: "https://gephi.org/",
      format: "Website",
      topics: ["Networks", "Information Theory"],
      level: "Undergraduate",
      description: "A free desktop tool for exploring, laying out, and measuring networks — modularity, centrality, force-directed layouts — on graphs from a few nodes to hundreds of thousands.",
      usage: "Students import a co-authorship or social network and produce one annotated layout plus three centrality measures. It's the hands-on counterpart to the Network Science textbook week.",
      difficulty: "Intermediate",
      time: "One 2-hour lab",
      author: "Gephi Consortium",
    }),
    mk("r12", "mlindgren", "2026-05-10T09:00:00Z", false, {
      title: "The Evolution of Trust",
      url: "https://ncase.me/trust/",
      format: "Interactive Simulation",
      topics: ["Game Theory", "Evolution & Adaptation", "Agent-Based Models"],
      level: "General Audience",
      description: "A playable explainer of the iterated prisoner's dilemma and the evolution of cooperation — run tournaments of strategies like Tit-for-Tat and watch populations shift.",
      usage: "Opens our cooperation unit. Students play through, then we connect the in-game tournament to Axelrod's results before introducing replicator dynamics.",
      difficulty: "Introductory",
      time: "30 minutes",
      author: "Nicky Case",
    }),
    mk("r13", "rvasquez", "2026-05-12T09:00:00Z", false, {
      title: "Scaling: The Surprising Mathematics of Life and Civilization",
      url: "https://www.youtube.com/watch?v=XyCY6mjWOPc",
      format: "Video",
      topics: ["Scaling & Power Laws", "Networks"],
      level: "General Audience",
      description: "Geoffrey West on quarter-power scaling laws across organisms and cities — why metabolism, lifespan, and urban infrastructure follow sublinear power laws.",
      usage: "Pre-watch before the allometric scaling lecture. Pairs with the Clauset–Shalizi–Newman power-law paper for the quantitative follow-up.",
      difficulty: "Introductory",
      time: "~25-minute talk",
      author: "Geoffrey West, Santa Fe Institute",
    }),
    mk("r14", "mlindgren", "2026-05-14T09:00:00Z", false, {
      title: "A New Kind of Science (online edition)",
      url: "https://www.wolframscience.com/nks/",
      format: "Book",
      topics: ["Cellular Automata", "Dynamics & Chaos", "Information Theory"],
      level: "Undergraduate",
      description: "Wolfram's full text on simple programs and the computational universe, free online — elementary cellular automata, rule 30, rule 110, and the principle of computational equivalence.",
      usage: "We assign the elementary-CA chapters as a reading companion to the Game of Life lecture; students classify several rules by Wolfram's four classes.",
      difficulty: "Intermediate",
      time: "Two chapters over a week",
      author: "Stephen Wolfram",
    }),
    mk("r15", "rvasquez", "2026-05-16T09:00:00Z", false, {
      title: "Strogatz — Nonlinear Dynamics and Chaos (lecture notes)",
      url: "https://www.cornell.edu/video/playlist/nonlinear-dynamics-and-chaos",
      format: "Course",
      topics: ["Dynamics & Chaos", "Self-Organization"],
      level: "Undergraduate",
      description: "Steven Strogatz's lecture series accompanying his classic textbook: flows on the line, bifurcations, the Lorenz equations, and routes to chaos.",
      usage: "Backbone of our nonlinear-dynamics module. Lectures 1–6 cover one-dimensional flows and bifurcations; the metronome/sync material pairs with the Veritasium synchronization video.",
      difficulty: "Advanced",
      time: "Semester lecture series",
      author: "Steven Strogatz, Cornell",
    }),
    mk("r16", "mlindgren", "2026-05-18T09:00:00Z", false, {
      title: "Sugarscape — Growing Artificial Societies",
      url: "https://ccl.northwestern.edu/netlogo/models/Sugarscape1ImmediateGrowback",
      format: "Interactive Simulation",
      topics: ["Agent-Based Models", "Self-Organization", "Scaling & Power Laws"],
      level: "Undergraduate",
      description: "The classic Epstein–Axtell agent-based model of a simple economy, implemented in NetLogo — agents harvesting a sugar landscape produce emergent wealth distributions.",
      usage: "Used to show how a skewed (power-law-ish) wealth distribution emerges from uniform rules. Students vary metabolism and vision and measure the resulting Gini coefficient.",
      difficulty: "Intermediate",
      time: "One 2-hour lab",
      author: "Epstein & Axtell; NetLogo port",
    }),
    mk("r17", "rvasquez", "2026-05-20T09:00:00Z", false, {
      title: "Information Theory, Inference, and Learning Algorithms",
      url: "https://www.inference.org.uk/mackay/itila/",
      format: "Book",
      topics: ["Information Theory", "Evolution & Adaptation"],
      level: "Graduate",
      description: "David MacKay's free textbook tying together entropy, coding, and inference, with a strong thread on the information theory of evolution and error-correcting codes.",
      usage: "Our reference for the entropy and mutual-information week. Chapters 1–6 anchor the lectures; the exercises double as the problem set.",
      difficulty: "Advanced",
      time: "Several weeks as a companion text",
      author: "David J. C. MacKay",
    }),
    mk("r18", "mlindgren", "2026-05-22T09:00:00Z", false, {
      title: "Mandelbrot and the Geometry of Roughness (interactive)",
      url: "https://www.complexityexplorer.org/explore",
      format: "Interactive Simulation",
      topics: ["Dynamics & Chaos", "Scaling & Power Laws"],
      level: "General Audience",
      description: "An in-browser fractal explorer for the Mandelbrot and Julia sets, with zoom and parameter sliders for building intuition about self-similarity and fractal dimension.",
      usage: "Five-minute live zoom demo before defining fractal dimension; students then estimate the dimension of a coastline image by box-counting.",
      difficulty: "Introductory",
      time: "10–15 minutes",
      author: "Complexity Explorer",
    }),
    mk("r19", "rvasquez", "2026-05-24T09:00:00Z", false, {
      title: "Networks, Crowds, and Markets",
      url: "https://www.cs.cornell.edu/home/kleinber/networks-book/",
      format: "Book",
      topics: ["Networks", "Game Theory", "Information Theory"],
      level: "Undergraduate",
      description: "Easley & Kleinberg's free textbook connecting graph theory, game theory, and market design — strong, cross, and weak ties, cascades, and the economics of networks.",
      usage: "Our text for the 'networks meet incentives' module. The cascades and contagion chapters pair with the agent-based contagion lab.",
      difficulty: "Intermediate",
      time: "Semester companion text",
      author: "David Easley & Jon Kleinberg",
    }),
    mk("r20", "mlindgren", "2026-05-26T09:00:00Z", false, {
      title: "Emergence — Crash Course / 3Blue1Brown style explainer",
      url: "https://www.youtube.com/watch?v=16W7c0mb-rE",
      format: "Video",
      topics: ["Self-Organization", "Agent-Based Models", "Cellular Automata"],
      level: "General Audience",
      description: "A short visual explainer on emergence — how flocking, ant colonies, and cellular automata produce global order from local interaction with no central control.",
      usage: "Assigned in week one to seed vocabulary for 'emergence' and 'self-organization' before any of the formal models appear.",
      difficulty: "Introductory",
      time: "~12-minute video",
      author: "Independent (educational)",
    }),
    mk("r21", "rvasquez", "2026-05-28T09:00:00Z", false, {
      title: "Self-Organized Criticality: The Bak–Tang–Wiesenfeld Sandpile",
      url: "https://en.wikipedia.org/wiki/Abelian_sandpile_model",
      format: "Notebook",
      topics: ["Self-Organization", "Scaling & Power Laws", "Cellular Automata"],
      level: "Graduate",
      description: "A guided Python notebook building the abelian sandpile model, measuring avalanche-size distributions, and recovering the characteristic power law of self-organized criticality.",
      usage: "The hands-on core of the self-organized-criticality week. Students reproduce the avalanche power law and connect it to the heavy-tails statistics reading.",
      difficulty: "Advanced",
      time: "One lab + write-up",
      author: "Adapted from Bak, Tang & Wiesenfeld (1987)",
    }),
    mk("r22", "mlindgren", "2026-05-30T09:00:00Z", false, {
      title: "Vicsek Model of Collective Motion (interactive)",
      url: "https://ccl.northwestern.edu/netlogo/models/Flocking",
      format: "Interactive Simulation",
      topics: ["Self-Organization", "Agent-Based Models", "Dynamics & Chaos"],
      level: "Undergraduate",
      description: "An interactive flocking / collective-motion model in the spirit of Vicsek et al. — tune noise and density and watch an order–disorder transition in alignment.",
      usage: "Students sweep the noise parameter and plot the alignment order parameter to locate the phase transition. Pairs with the Fireflies sync demo and the synchronization video.",
      difficulty: "Intermediate",
      time: "One 2-hour lab",
      author: "After Vicsek et al.; NetLogo",
    }),
    mk("r23", "rvasquez", "2026-06-01T09:00:00Z", false, {
      title: "Mitchell — Complexity: A Guided Tour (companion lectures)",
      url: "https://www.complexityexplorer.org/courses",
      format: "Course",
      topics: ["Information Theory", "Evolution & Adaptation", "Dynamics & Chaos", "Networks"],
      level: "General Audience",
      description: "Lecture companions to Melanie Mitchell's survey of complexity science — computation, evolution, genetic algorithms, and network thinking for a general audience.",
      usage: "We assign selected lectures alongside the book chapters for the survey course, mapping each lecture to one of our topic weeks.",
      difficulty: "Introductory",
      time: "~1 hour per lecture",
      author: "Melanie Mitchell, Santa Fe Institute",
    }),
  ];
  const comments = [
    { id: "c1", resourceId: "r1", by: "jchen", date: "2026-03-20T15:00:00Z", text: "Used this with a mixed policy-school audience — worked even better than with science students. The 'small individual bias' framing sparked a long discussion about housing policy." },
    { id: "c2", resourceId: "r1", by: "mlindgren", date: "2026-04-02T11:00:00Z", text: "Tip: ask students to predict the equilibrium before they press play. The gap between prediction and outcome is where the learning happens." },
    { id: "c3", resourceId: "r6", by: "rvasquez", date: "2026-04-15T09:30:00Z", text: "The replication exercise takes longer than one week for students who haven't used scipy before — consider providing a starter notebook." },
  ];
  const flags = [
    { id: "f1", resourceId: "r5", type: "Broken link", note: "The YouTube URL redirects to a different talk for me — can someone verify the video ID?", by: "jchen", date: "2026-05-18T10:00:00Z", status: "open" },
    { id: "f2", resourceId: "r2", type: "Outdated content", note: "Install instructions referenced the desktop app only; web version note was missing.", by: "jchen", date: "2026-04-08T10:00:00Z", status: "resolved", resolvedBy: "mlindgren", resolvedAt: "2026-04-11T14:05:00Z" },
  ];
  const assignments = [
    { id: "a1", resourceId: "r6", assignedTo: "rvasquez", assignedBy: "aokafor", note: "Please check whether the page numbers in the citation match the published SIAM Review version, and whether the replication exercise needs a starter notebook.", date: "2026-05-20T09:00:00Z", status: "pending" },
  ];
  return { users, resources, comments, flags, assignments };
}

/* ───────────────────────── helpers ───────────────────────── */

const uid = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();
const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
const current = (r) => r.versions[r.versions.length - 1].data;
const userName = (db, username) => (db.users.find((u) => u.username === username) || {}).name || username;

/* deterministic per-material art: seeded PRNG */
function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* points for a 5-pointed star centered at (cx,cy). outerR sets the tip
   radius; the area is tuned to roughly match a disc of the same radius so
   featured (star) and non-featured (circle) nodes read at similar weight. */
function starPoints(cx, cy, outerR) {
  const innerR = outerR * 0.46;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5; // first tip points up
    pts.push(`${(cx + Math.cos(ang) * r).toFixed(2)},${(cy + Math.sin(ang) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}

/* Each material gets a unique little "growing network", drawn in its
   format color — nearest-neighbor attachment, in the spirit of the
   subject matter. Replace with real OpenGraph thumbnails in production
   and keep this as the fallback. */
function Thumb({ r, h = 72 }) {
  const d = current(r);
  const c = FORMAT_COLORS[d.format] || ACCENT;
  const rng = mulberry32(hashCode(r.id + d.title));
  const n = 9 + Math.floor(rng() * 5);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push({ x: 8 + rng() * 184, y: 8 + rng() * 44, r: 1.4 + rng() * 3.2, ring: rng() < 0.3 });
  const edges = [];
  for (let i = 1; i < n; i++) {
    let best = 0, bd = Infinity;
    for (let j = 0; j < i; j++) {
      const dd = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2;
      if (dd < bd) { bd = dd; best = j; }
    }
    edges.push([i, best]);
  }
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ width: "100%", height: h, display: "block", background: c + "12", borderRadius: 2 }}>
      {edges.map(([a, b], i) => <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke={c} strokeOpacity="0.45" strokeWidth="1" />)}
      {pts.map((p, i) => p.ring
        ? <circle key={i} cx={p.x} cy={p.y} r={p.r + 1.2} fill="none" stroke={c} strokeOpacity="0.85" strokeWidth="1.2" />
        : <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={c} fillOpacity="0.9" />)}
    </svg>
  );
}

/* ───────────────────────── tiny UI atoms ───────────────────────── */

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap"
      style={active
        ? { background: DARK, color: "#fff", borderColor: DARK }
        : { background: "#fff", color: INK, borderColor: "#dcdcd8" }}
    >
      {children}
    </button>
  );
}

function Tag({ children }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs border" style={{ borderColor: "#decea1", background: "#f6f3ea", color: "#636051" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, kind = "primary", small, disabled, type }) {
  const base = small ? "px-3 py-1 text-sm" : "px-4 py-2 text-sm";
  const styles = {
    primary: { background: disabled ? "#9aa7b3" : ACCENT, color: "#fff", border: "1px solid transparent" },
    ghost: { background: "#fff", color: INK, border: "1px solid #d4d5d3" },
    dark: { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.5)" },
    danger: { background: "#fff", color: "#af2f23", border: "1px solid #d68f85" },
  };
  return (
    <button type={type || "button"} disabled={disabled} onClick={onClick} className={base + " rounded font-medium transition-opacity hover:opacity-90"} style={styles[kind]}>
      {children}
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block mb-4">
      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#5f636b" }}>{label}</div>
      {children}
      {hint && <div className="text-xs mt-1" style={{ color: "#7e828a" }}>{hint}</div>}
    </label>
  );
}

const inputCls = "w-full px-3 py-2 rounded border text-sm bg-white";
const inputStyle = { borderColor: "#d4d5d3", color: INK };

function SectionHead({ children, right }) {
  return (
    <div className="flex items-center mt-12 mb-5 gap-3">
      <span className="w-6 h-1 shrink-0" style={{ background: ACCENT }} />
      <h2 className="text-sm uppercase shrink-0" style={{ fontWeight: 800, letterSpacing: "0.16em", color: INK }}>{children}</h2>
      <div className="flex-1 border-t" style={{ borderColor: "#e4e4e0" }} />
      {right}
    </div>
  );
}

function StatusDot({ status }) {
  const color = status === "open" || status === "pending" ? "#d15a2a" : "#51661a";
  return <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: color }} />;
}

function NodeGlyph() {
  // a little "complexity burst": one white hub, colorful satellites, two second-degree sparks
  const edges = [[16,16,16,5],[16,16,27,10],[16,16,28,22],[16,16,19,28],[16,16,6,25],[16,16,4,11],[27,10,31,4],[6,25,2,30]];
  const dots = [
    { x: 16, y: 5, r: 2.6, c: "#d49a34" },
    { x: 27, y: 10, r: 3.2, c: "#af2f23" },
    { x: 31, y: 4, r: 1.6, c: "#af2f23" },
    { x: 28, y: 22, r: 2.2, c: "#008e94" },
    { x: 19, y: 28, r: 2.8, c: "#d68f85" },
    { x: 6, y: 25, r: 2.4, c: "#decea1" },
    { x: 2, y: 30, r: 1.4, c: "#decea1" },
    { x: 4, y: 11, r: 2.0, c: "#008e94" },
  ];
  return (
    <svg width="30" height="30" viewBox="0 0 34 34" aria-hidden="true">
      {edges.map((e, i) => <line key={i} x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} stroke="#cccec8" strokeWidth="1.2" />)}
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />)}
      <circle cx="16" cy="16" r="3.6" fill="#fff" />
    </svg>
  );
}

/* ───────────────────────── header ───────────────────────── */

function Header({ user, nav, onLogout }) {
  return (
    <header className="sticky top-0 z-20" style={{ background: GRAD, boxShadow: "0 1px 0 rgba(0,0,0,0.25)" }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        <button onClick={() => nav({ page: "home" })} className="flex items-center gap-2.5 text-left">
          <NodeGlyph />
          <span>
            <span className="block text-lg leading-tight text-white" style={HEAD}>Complexity Commons</span>
            <span className="block text-xs" style={{ color: "#cccec8", letterSpacing: "0.06em" }}>a project of the Santa Fe Institute's Complexity Explorer</span>
          </span>
        </button>
        <div className="flex-1" />
        {user && (user.role === "contributor" || user.role === "admin") && (
          <Btn small onClick={() => nav({ page: "submit" })}>+ Submit material</Btn>
        )}
        {user && user.role !== "viewer" && (
          <Btn small kind="dark" onClick={() => nav({ page: "dashboard" })}>Dashboard</Btn>
        )}
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: "#aab2bd" }}>
              {user.name} <span className="px-1.5 py-0.5 rounded text-xs" style={{ ...MONO, background: "rgba(255,255,255,0.14)", color: "#decea1" }}>{user.role}</span>
            </span>
            <button onClick={onLogout} className="underline" style={{ color: "#cccec8" }}>Log out</button>
          </div>
        ) : (
          <Btn small kind="dark" onClick={() => nav({ page: "login" })}>Log in</Btn>
        )}
      </div>
    </header>
  );
}

/* ───────────────────────── filter row ───────────────────────── */

function FilterRow({ label, options, value, onChange, color }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <span className="text-xs uppercase tracking-widest w-16 shrink-0" style={{ ...MONO, color: color || "#7e828a", fontWeight: 700 }}>{label}</span>
      <Pill active={value === null} onClick={() => onChange(null)}>all</Pill>
      {options.map((o) => (
        <Pill key={o} active={value === o} onClick={() => onChange(value === o ? null : o)}>{o.toLowerCase()}</Pill>
      ))}
    </div>
  );
}

/* ───────────────────────── resource card ───────────────────────── */

function ResourceCard({ r, db, nav, featuredStyle }) {
  const d = current(r);
  const nComments = db.comments.filter((c) => c.resourceId === r.id).length;
  return (
    <button
      onClick={() => nav({ page: "detail", id: r.id })}
      className="relative text-left border p-4 bg-white hover:shadow-lg transition-shadow flex flex-col gap-2"
      style={{ borderColor: featuredStyle ? "#b9bcc2" : "#e4e3df", borderTopColor: FORMAT_COLORS[d.format] || ACCENT, borderTopWidth: 3, borderRadius: 3 }}
    >
      {r.featured && (
        <span
          className="absolute z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase shadow-sm"
          style={{ top: 8, right: 8, color: STAR, background: "#fffdf7", border: `1px solid ${STAR}`, letterSpacing: "0.04em" }}
        >
          <span style={{ fontSize: 10 }}>★</span> Featured
        </span>
      )}
      <Thumb r={r} h={64} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-snug" style={{ ...HEAD, color: INK, ...clamp2 }}>{d.title}</h3>
      </div>
      <div className="text-sm" style={{ color: "#4d5158" }}>{d.author}</div>
      <p className="text-sm leading-relaxed" style={{ color: "#5f636b", ...clamp3 }}>{d.description}</p>
      <div className="flex flex-wrap items-center gap-1 mt-auto pt-2">
        <Tag>{d.format}</Tag>
        <Tag>{d.level}</Tag>
        {d.topics.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <div className="flex justify-between text-xs pt-1" style={{ color: "#7e828a" }}>
        <span style={MONO}>v{r.versions.length}</span>
        <span>{nComments} comment{nComments === 1 ? "" : "s"} · {fmtDate(r.createdAt)}</span>
      </div>
    </button>
  );
}

/* ───────────────────────── network view ─────────────────────────
   An alternate, optional rendering of the SAME filtered set the grid
   shows. Nodes = materials (colored by format); edges = shared topics,
   weighted by how many topics two materials have in common. Weak
   (1-topic) links are faint and thin; strong (2+) links are darker and
   thicker, so the strong pedagogical relationships read out of the
   denser background without any extra filtering control.

   The layout is a tiny dependency-free force simulation. It's seeded
   deterministically from material ids (reusing mulberry32/hashCode) so
   the graph settles to a stable shape instead of jumping every render. */

function buildGraph(resources) {
  const nodes = resources.map((r) => {
    const d = current(r);
    return { id: r.id, r, d, topics: d.topics, format: d.format, color: FORMAT_COLORS[d.format] || ACCENT, degree: 0 };
  });
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].topics.filter((t) => nodes[j].topics.includes(t));
      if (shared.length > 0) {
        edges.push({ a: nodes[i].id, b: nodes[j].id, w: shared.length, shared });
        nodes[i].degree += shared.length;
        nodes[j].degree += shared.length;
      }
    }
  }
  return { nodes, edges };
}

/* deterministic force-directed layout; runs a fixed number of ticks in
   a useMemo so there's no animation loop and no jitter on re-render */
function layoutGraph(nodes, edges, W, H) {
  const idx = {};
  const seed = mulberry32(hashCode(nodes.map((n) => n.id).join("|")) || 1);
  const P = nodes.map((n, i) => {
    idx[n.id] = i;
    // seed on a ring so disconnected components don't overlap the center
    const ang = (i / Math.max(1, nodes.length)) * Math.PI * 2;
    const rad = 60 + seed() * Math.min(W, H) * 0.32;
    return { x: W / 2 + Math.cos(ang) * rad, y: H / 2 + Math.sin(ang) * rad, vx: 0, vy: 0 };
  });
  const E = edges.map((e) => ({ s: idx[e.a], t: idx[e.b], w: e.w }));
  const n = nodes.length;
  const k = Math.sqrt((W * H) / Math.max(1, n)) * 0.55; // ideal spacing
  const ITER = 320;
  for (let it = 0; it < ITER; it++) {
    const cooling = 1 - it / ITER;
    // repulsion (all pairs — n is small enough)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const rep = (k * k) / dist;
        const fx = (dx / dist) * rep, fy = (dy / dist) * rep;
        P[i].vx += fx; P[i].vy += fy;
        P[j].vx -= fx; P[j].vy -= fy;
      }
    }
    // attraction along edges (stronger for higher shared-topic weight)
    for (const e of E) {
      let dx = P[e.s].x - P[e.t].x, dy = P[e.s].y - P[e.t].y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const att = (dist * dist) / k * (0.5 + 0.5 * e.w);
      const fx = (dx / dist) * att, fy = (dy / dist) * att;
      P[e.s].vx -= fx; P[e.s].vy -= fy;
      P[e.t].vx += fx; P[e.t].vy += fy;
    }
    // gentle pull to center + integrate with cooling
    for (let i = 0; i < n; i++) {
      P[i].vx += (W / 2 - P[i].x) * 0.012;
      P[i].vy += (H / 2 - P[i].y) * 0.012;
      const max = 18 * cooling + 1;
      let sp = Math.sqrt(P[i].vx * P[i].vx + P[i].vy * P[i].vy) || 0.01;
      const lim = Math.min(sp, max) / sp;
      P[i].x += P[i].vx * lim; P[i].y += P[i].vy * lim;
      P[i].vx *= 0.85; P[i].vy *= 0.85;
    }
  }
  // fit into viewport with padding
  const pad = 34;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  P.forEach((p) => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
  const sx = (W - pad * 2) / Math.max(1, maxX - minX);
  const sy = (H - pad * 2) / Math.max(1, maxY - minY);
  const s = Math.min(sx, sy);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  P.forEach((p) => { p.x = W / 2 + (p.x - cx) * s; p.y = H / 2 + (p.y - cy) * s; });
  const pos = {};
  nodes.forEach((nd, i) => { pos[nd.id] = { x: P[i].x, y: P[i].y }; });
  return pos;
}

function NetworkView({ resources, db, nav }) {
  const W = 920, H = 560;
  const { nodes, edges } = useMemo(() => buildGraph(resources), [resources]);
  const pos = useMemo(() => layoutGraph(nodes, edges, W, H), [nodes, edges]);
  const [hover, setHover] = useState(null);   // node id under the cursor
  const [selected, setSelected] = useState(null); // node id with open preview card

  // node degree → radius (hubs read as hubs)
  const maxDeg = Math.max(1, ...nodes.map((n) => n.degree));
  const radius = (nd) => 7 + (nd.degree / maxDeg) * 11;

  // adjacency for hover highlighting
  const neighbors = useMemo(() => {
    const m = {};
    nodes.forEach((n) => (m[n.id] = new Set()));
    edges.forEach((e) => { m[e.a].add(e.b); m[e.b].add(e.a); });
    return m;
  }, [nodes, edges]);

  const active = hover || selected;
  const isLit = (id) => !active || id === active || neighbors[active]?.has(id);
  const edgeLit = (e) => !active || e.a === active || e.b === active;

  const formatsPresent = useMemo(() => {
    const set = new Set(nodes.map((n) => n.format));
    return FORMATS.filter((f) => set.has(f));
  }, [nodes]);

  const sel = selected ? nodes.find((n) => n.id === selected) : null;

  if (nodes.length === 0) {
    return <div className="py-16 text-center text-sm" style={{ color: "#7e828a" }}>No materials to map. Try clearing a filter.</div>;
  }

  return (
    <div className="relative border bg-white" style={{ borderColor: "#e4e3df", borderRadius: 3 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block", background: "#fbfaf7", borderRadius: 3 }}
        onClick={() => setSelected(null)}
      >
        {/* edges */}
        {edges.map((e, i) => {
          const pa = pos[e.a], pb = pos[e.b];
          const strong = e.w >= 2;
          const lit = edgeLit(e);
          return (
            <line
              key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={strong ? "#7e6f87" : "#c7c2cc"}
              strokeWidth={strong ? 1 + e.w * 0.8 : 0.8}
              strokeOpacity={lit ? (strong ? 0.72 : 0.28) : 0.06}
              style={{ transition: "stroke-opacity 0.15s" }}
            />
          );
        })}
        {/* nodes */}
        {nodes.map((nd) => {
          const p = pos[nd.id];
          const lit = isLit(nd.id);
          const rr = radius(nd);
          const isSel = nd.id === selected;
          return (
            <g
              key={nd.id}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              opacity={lit ? 1 : 0.18}
              onMouseEnter={() => setHover(nd.id)}
              onMouseLeave={() => setHover(null)}
              onClick={(ev) => { ev.stopPropagation(); setSelected(isSel ? null : nd.id); }}
            >
              {nd.r.featured ? (
                <polygon
                  points={starPoints(p.x, p.y, (rr + (isSel ? 4 : 0)) * 1.35)}
                  fill={nd.color} fillOpacity={0.92}
                  stroke={isSel ? INK : "#fff"} strokeWidth={isSel ? 2 : 1.5}
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx={p.x} cy={p.y} r={rr + (isSel ? 4 : 0)} fill={nd.color} fillOpacity={0.9}
                  stroke={isSel ? INK : "#fff"} strokeWidth={isSel ? 2 : 1.5} />
              )}
              {(active === nd.id || isSel) && (
                <text x={p.x} y={p.y - rr - 6} textAnchor="middle"
                  style={{ ...HEAD, fontSize: 12, fill: INK, pointerEvents: "none" }}>
                  {nd.d.title.length > 34 ? nd.d.title.slice(0, 33) + "…" : nd.d.title}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* legend (click a format to filter the home set) */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 px-3 py-2 rounded border text-xs"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: "#e4e3df", maxWidth: 200 }}>
        <div className="uppercase tracking-widest mb-1" style={{ ...MONO, color: "#7e828a", fontSize: 10 }}>format</div>
        {formatsPresent.map((f) => (
          <button key={f} className="flex items-center gap-2 text-left hover:opacity-70"
            onClick={() => nav({ page: "home", format: f })}>
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: FORMAT_COLORS[f] }} />
            <span style={{ color: INK }}>{f}</span>
          </button>
        ))}
        <div className="mt-2 pt-2 border-t" style={{ borderColor: "#ececea", color: "#7e828a" }}>
          <div className="flex items-center gap-2"><span className="inline-block" style={{ width: 18, height: 0, borderTop: "3px solid #7e6f87" }} /> 2+ shared topics</div>
          <div className="flex items-center gap-2 mt-1"><span className="inline-block" style={{ width: 18, height: 0, borderTop: "1px solid #c7c2cc" }} /> 1 shared topic</div>
          <div className="flex items-center gap-2 mt-1"><span style={{ color: STAR, width: 18, textAlign: "center", fontSize: 13 }}>★</span> featured (star node)</div>
        </div>
      </div>

      {/* hint */}
      <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded" style={{ ...MONO, color: "#9a9ea4", background: "rgba(255,255,255,0.7)" }}>
        hover to trace links · click a node for details
      </div>

      {/* preview card on click */}
      {sel && (
        <div className="absolute top-3 right-3 w-72 border bg-white shadow-lg p-4 flex flex-col gap-2"
          style={{ borderColor: "#e4e3df", borderTopColor: sel.color, borderTopWidth: 3, borderRadius: 3 }}>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base leading-snug" style={{ ...HEAD, color: INK }}>{sel.r.featured && <span style={{ color: STAR }}>★ </span>}{sel.d.title}</h4>
            <button onClick={() => setSelected(null)} style={{ color: "#9a9ea4" }} aria-label="close">✕</button>
          </div>
          <div className="text-sm" style={{ color: "#4d5158" }}>{sel.d.author}</div>
          <div className="flex flex-wrap gap-1">
            <Tag>{sel.d.format}</Tag><Tag>{sel.d.level}</Tag>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#5f636b", ...clamp3 }}>{sel.d.description}</p>
          <div className="text-xs" style={{ color: "#7e828a" }}>
            {neighbors[sel.id].size} related material{neighbors[sel.id].size === 1 ? "" : "s"} · topics: {sel.d.topics.join(", ")}
          </div>
          <button className="mt-1 self-start text-sm font-medium underline" style={{ color: ACCENT }}
            onClick={() => nav({ page: "detail", id: sel.id })}>
            View details →
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── home page ───────────────────────── */

function HomePage({ db, nav, initialFormat }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(null);
  const [format, setFormat] = useState(initialFormat || null);
  const [level, setLevel] = useState(null);
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(9);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "network"
  const sentinel = useRef(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let list = db.resources.filter((r) => {
      const d = current(r);
      if (topic && !d.topics.includes(topic)) return false;
      if (format && d.format !== format) return false;
      if (level && d.level !== level) return false;
      if (ql) {
        const hay = [d.title, d.description, d.author, d.usage, d.topics.join(" ")].join(" ").toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    const nC = (r) => db.comments.filter((c) => c.resourceId === r.id).length;
    if (sort === "newest") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "oldest") list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sort === "title") list = [...list].sort((a, b) => current(a).title.localeCompare(current(b).title));
    if (sort === "discussed") list = [...list].sort((a, b) => nC(b) - nC(a));
    return list;
  }, [db, q, topic, format, level, sort]);

  // continuous scroll: load more when the sentinel enters view (grid only)
  useEffect(() => {
    if (viewMode !== "grid") return;
    const el = sentinel.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => v + 9);
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered.length, viewMode]);

  useEffect(() => { setVisible(9); }, [q, topic, format, level, sort]);

  const anyFilter = q || topic || format || level;

  return (
    <div className="pb-20">
      {/* hero + search */}
      <section style={{ background: GRAD }}>
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-10">
          <div className="text-xs uppercase mb-3" style={{ ...MONO, color: "#decea1", letterSpacing: "0.22em" }}>an open teaching repository</div>
          <h1 className="text-3xl sm:text-4xl text-white leading-tight" style={HEAD}>Teaching materials for a complex world.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "#cccec8" }}>Videos, notebooks, simulations, and readings for teaching complex systems — contributed and annotated by the people who teach with them.</p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials, authors, topics…"
            className="mt-7 w-full max-w-2xl px-5 py-3 rounded-full text-base"
            style={{ background: "#fff", color: INK, border: "1px solid transparent" }}
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
      {/* three bandcamp-style filter rows */}
      <div className="flex flex-col gap-1 pb-2 pt-6">
        <FilterRow label="topic" options={TOPICS} value={topic} onChange={setTopic} />
        <FilterRow label="format" options={FORMATS} value={format} onChange={setFormat} />
        <FilterRow label="level" options={LEVELS} value={level} onChange={setLevel} />
      </div>

      {/* sort + clear */}
      <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "#e4e4e0" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "#4d5158" }}>
          <span style={MONO} className="text-xs uppercase tracking-widest">sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-2 py-1 rounded border bg-white text-sm" style={inputStyle}>
            <option value="newest">newest</option>
            <option value="oldest">oldest</option>
            <option value="title">title A–Z</option>
            <option value="discussed">most discussed</option>
          </select>
        </div>
        {anyFilter && (
          <button className="text-sm underline" style={{ color: ACCENT }} onClick={() => { setQ(""); setTopic(null); setFormat(null); setLevel(null); }}>
            clear all filters
          </button>
        )}
      </div>

      {/* all materials */}
      <SectionHead right={
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#7e828a" }}>{filtered.length} material{filtered.length === 1 ? "" : "s"}</span>
          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: "#dcdcd8" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="px-3 py-1 text-xs transition-colors"
              style={viewMode === "grid" ? { background: DARK, color: "#fff" } : { background: "#fff", color: INK }}
            >▦ Grid</button>
            <button
              onClick={() => setViewMode("network")}
              className="px-3 py-1 text-xs transition-colors"
              style={viewMode === "network" ? { background: DARK, color: "#fff" } : { background: "#fff", color: INK }}
            >⬡ Network</button>
          </div>
        </div>
      }>
        {anyFilter ? "Results" : "All materials"}
      </SectionHead>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "#7e828a" }}>
          No materials match these filters. Try clearing one of the rows above.
        </div>
      ) : viewMode === "network" ? (
        <>
          <p className="text-sm mb-4 -mt-2" style={{ color: "#7e828a" }}>
            Each material is linked to others it shares topics with. Thicker, darker links share more topics. This map reflects whatever you've searched or filtered above.
          </p>
          <NetworkView resources={filtered} db={db} nav={nav} />
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((r) => <ResourceCard key={r.id} r={r} db={db} nav={nav} />)}
        </div>
      )}

      {viewMode === "grid" && visible < filtered.length && (
        <div ref={sentinel} className="py-8 text-center">
          <Btn kind="ghost" onClick={() => setVisible((v) => v + 9)}>Load more</Btn>
        </div>
      )}
      </div>
    </div>
  );
}

/* ───────────────────────── detail page ───────────────────────── */

function MetaItem({ label, children, mono }) {
  if (!children) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#7e828a" }}>{label}</div>
      <div className="text-sm leading-relaxed" style={{ color: INK, ...(mono ? MONO : {}) }}>{children}</div>
    </div>
  );
}

function DetailPage({ db, id, user, nav, actions }) {
  const r = db.resources.find((x) => x.id === id);
  const [viewV, setViewV] = useState(null); // null = current
  const [commentText, setCommentText] = useState("");
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagType, setFlagType] = useState(FLAG_TYPES[0]);
  const [flagNote, setFlagNote] = useState("");
  const [flagDone, setFlagDone] = useState(false);

  if (!r) return <div className="max-w-3xl mx-auto px-4 py-16 text-sm" style={{ color: "#7e828a" }}>This material no longer exists. <button className="underline" onClick={() => nav({ page: "home" })}>Back to the commons</button></div>;

  const latest = r.versions[r.versions.length - 1];
  const shown = viewV ? r.versions.find((v) => v.v === viewV) : latest;
  const d = shown.data;
  const comments = db.comments.filter((c) => c.resourceId === r.id).sort((a, b) => a.date.localeCompare(b.date));
  const openFlags = db.flags.filter((f) => f.resourceId === r.id && f.status === "open");
  const canEdit = user && (user.role === "admin" || (user.role === "contributor" && r.createdBy === user.username));
  const isAdmin = user && user.role === "admin";

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <div className="pt-6 pb-4">
        <button className="text-sm underline" style={{ color: ACCENT }} onClick={() => nav({ page: "home" })}>← Back to the commons</button>
      </div>

      <div className="mb-5"><Thumb r={r} h={104} /></div>

      {viewV && viewV !== latest.v && (
        <div className="mb-4 px-4 py-3 rounded border text-sm flex items-center justify-between gap-3" style={{ background: "#f8f3e7", borderColor: "#decea1", color: "#a27635" }}>
          <span>Viewing <span style={MONO}>v{viewV}</span> ({fmtDate(shown.date)}). The current version is <span style={MONO}>v{latest.v}</span>.</span>
          <button className="underline shrink-0" onClick={() => setViewV(null)}>View current</button>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-3xl leading-tight" style={{ ...HEAD, color: INK }}>
          {r.featured && <span style={{ color: STAR }}>★ </span>}{d.title}
        </h1>
        <div className="flex gap-2 pt-1">
          {canEdit && <Btn small kind="ghost" onClick={() => nav({ page: "edit", id: r.id })}>Edit (new version)</Btn>}
          {isAdmin && <Btn small kind="ghost" onClick={() => actions.toggleFeatured(r.id)}>{r.featured ? "Unfeature" : "Feature"}</Btn>}
        </div>
      </div>

      <div className="mt-2 text-sm" style={{ color: "#4d5158" }}>{d.author}</div>
      <div className="flex flex-wrap gap-1 mt-3">
        <Tag>{d.format}</Tag><Tag>{d.level}</Tag>{d.topics.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>

      {openFlags.length > 0 && (
        <div className="mt-4 px-3 py-2 rounded border text-sm" style={{ background: "#f9ece9", borderColor: "#d68f85", color: "#af2f23" }}>
          ⚑ {openFlags.length} open issue{openFlags.length === 1 ? "" : "s"} reported on this material{isAdmin ? " — see the issue log in your dashboard." : "."}
        </div>
      )}

      <p className="mt-5 text-base leading-relaxed" style={{ color: INK }}>{d.description}</p>

      <div className="mt-5">
        <a href={d.url} target="_blank" rel="noreferrer" className="inline-block px-5 py-2.5 rounded text-sm font-medium" style={{ background: ACCENT, color: "#fff" }}>
          Open material ↗
        </a>
        <span className="ml-3 text-xs break-all" style={{ ...MONO, color: "#7e828a" }}>{d.url}</span>
      </div>

      <SectionHead>How it's used in teaching</SectionHead>
      <p className="text-sm leading-relaxed" style={{ color: INK }}>{d.usage}</p>

      <SectionHead>Details</SectionHead>
      <div className="grid gap-5 sm:grid-cols-2">
        <MetaItem label="Prerequisites">{d.prereqs}</MetaItem>
        <MetaItem label="Difficulty">{d.difficulty}</MetaItem>
        <MetaItem label="Time required">{d.time}</MetaItem>
        <MetaItem label="License / access">{d.license}</MetaItem>
        <MetaItem label="Citation" mono>{d.citation}</MetaItem>
        <MetaItem label="Contributed by">{userName(db, r.createdBy)} on {fmtDate(r.createdAt)}</MetaItem>
      </div>

      {/* version history */}
      <SectionHead right={<span className="text-xs" style={{ ...MONO, color: "#7e828a" }}>current: v{latest.v}</span>}>Version history</SectionHead>
      <div className="flex flex-col">
        {[...r.versions].reverse().map((v) => (
          <div key={v.v} className="flex items-baseline gap-3 py-2 border-b text-sm" style={{ borderColor: "#ececea" }}>
            <button
              onClick={() => setViewV(v.v === latest.v ? null : v.v)}
              className="underline shrink-0"
              style={{ ...MONO, color: v.v === (viewV || latest.v) ? "#d15a2a" : ACCENT }}
            >
              v{v.v}
            </button>
            <span className="shrink-0" style={{ color: "#7e828a" }}>{fmtDate(v.date)}</span>
            <span className="shrink-0" style={{ color: "#4d5158" }}>{userName(db, v.editedBy)}</span>
            <span style={{ color: INK }}>{v.changelog}</span>
          </div>
        ))}
      </div>

      {/* comments */}
      <SectionHead>Comments ({comments.length})</SectionHead>
      {comments.length === 0 && <div className="text-sm" style={{ color: "#7e828a" }}>No comments yet. If you've taught with this, say how it went.</div>}
      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded border bg-white p-3" style={{ borderColor: "#e4e4e0" }}>
            <div className="text-xs mb-1" style={{ color: "#7e828a" }}>
              <span style={{ color: "#4d5158", fontWeight: 600 }}>{userName(db, c.by)}</span> · {fmtDate(c.date)}
            </div>
            <div className="text-sm leading-relaxed" style={{ color: INK }}>{c.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        {user ? (
          <div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="How did you use this material? What worked, what didn't?"
              className={inputCls}
              style={inputStyle}
            />
            <div className="mt-2">
              <Btn small disabled={!commentText.trim()} onClick={() => { actions.addComment(r.id, commentText.trim()); setCommentText(""); }}>Post comment</Btn>
            </div>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "#7e828a" }}>
            <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "login" })}>Log in</button> to comment.
          </div>
        )}
      </div>

      {/* flag an issue */}
      <SectionHead>Report an issue</SectionHead>
      {flagDone ? (
        <div className="text-sm" style={{ color: "#51661a" }}>Thanks — your report was added to the issue log for the admins to review.</div>
      ) : user ? (
        flagOpen ? (
          <div className="rounded border bg-white p-4 max-w-md" style={{ borderColor: "#e4e4e0" }}>
            <Field label="Issue type">
              <select value={flagType} onChange={(e) => setFlagType(e.target.value)} className={inputCls} style={inputStyle}>
                {FLAG_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="What's wrong?">
              <textarea value={flagNote} onChange={(e) => setFlagNote(e.target.value)} rows={3} className={inputCls} style={inputStyle} placeholder="e.g. The link returns a 404 as of today." />
            </Field>
            <div className="flex gap-2">
              <Btn small disabled={!flagNote.trim()} onClick={() => { actions.addFlag(r.id, flagType, flagNote.trim()); setFlagDone(true); }}>Submit report</Btn>
              <Btn small kind="ghost" onClick={() => setFlagOpen(false)}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <Btn small kind="danger" onClick={() => setFlagOpen(true)}>⚑ Flag broken link or other issue</Btn>
        )
      ) : (
        <div className="text-sm" style={{ color: "#7e828a" }}>
          <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "login" })}>Log in</button> to report an issue.
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── submit / edit form ───────────────────────── */

const EMPTY = { title: "", url: "", format: FORMATS[0], topics: [], level: LEVELS[1], description: "", usage: "", prereqs: "", difficulty: DIFFICULTIES[0], time: "", author: "", license: "", citation: "" };

function ResourceForm({ db, user, nav, actions, editId }) {
  const editing = editId ? db.resources.find((x) => x.id === editId) : null;
  const [data, setData] = useState(editing ? { ...current(editing) } : { ...EMPTY });
  const [changelog, setChangelog] = useState("");
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });
  const toggleTopic = (t) => setData({ ...data, topics: data.topics.includes(t) ? data.topics.filter((x) => x !== t) : [...data.topics, t] });
  const valid = data.title.trim() && data.url.trim() && data.topics.length > 0 && (!editing || changelog.trim());

  if (!user || user.role === "viewer") {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-sm" style={{ color: "#7e828a" }}>Submitting materials requires a contributor account.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      <h1 className="text-2xl pt-8 pb-1" style={{ ...HEAD, color: INK }}>{editing ? "Edit material" : "Submit a material"}</h1>
      <p className="text-sm mb-6" style={{ color: "#7e828a" }}>
        {editing
          ? `Saving creates version v${editing.versions.length + 1}; earlier versions stay visible in the history.`
          : "Materials are linked, not hosted — paste a stable URL and describe how you've used it in teaching."}
      </p>

      <Field label="Title *"><input className={inputCls} style={inputStyle} value={data.title} onChange={set("title")} /></Field>
      <Field label="URL *" hint="Direct link to the video, notebook, simulation, or site."><input className={inputCls} style={inputStyle} value={data.url} onChange={set("url")} placeholder="https://…" /></Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Format">
          <select className={inputCls} style={inputStyle} value={data.format} onChange={set("format")}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select>
        </Field>
        <Field label="Audience level">
          <select className={inputCls} style={inputStyle} value={data.level} onChange={set("level")}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        </Field>
      </div>

      <Field label="Topics * (select all that apply)">
        <div className="flex flex-wrap gap-2 pt-1">
          {TOPICS.map((t) => <Pill key={t} active={data.topics.includes(t)} onClick={() => toggleTopic(t)}>{t.toLowerCase()}</Pill>)}
        </div>
      </Field>

      <Field label="Description" hint="What is it? One or two sentences.">
        <textarea rows={3} className={inputCls} style={inputStyle} value={data.description} onChange={set("description")} />
      </Field>
      <Field label="How & why it was used in teaching" hint="The pedagogical context: where it fits in a course, what it's good at, tips for running it.">
        <textarea rows={4} className={inputCls} style={inputStyle} value={data.usage} onChange={set("usage")} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Prerequisites"><input className={inputCls} style={inputStyle} value={data.prereqs} onChange={set("prereqs")} placeholder="e.g. Basic Python" /></Field>
        <Field label="Difficulty">
          <select className={inputCls} style={inputStyle} value={data.difficulty} onChange={set("difficulty")}>{DIFFICULTIES.map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
        <Field label="Time required"><input className={inputCls} style={inputStyle} value={data.time} onChange={set("time")} placeholder="e.g. One 2-hour lab" /></Field>
        <Field label="Author / creator"><input className={inputCls} style={inputStyle} value={data.author} onChange={set("author")} /></Field>
        <Field label="License / access"><input className={inputCls} style={inputStyle} value={data.license} onChange={set("license")} placeholder="e.g. CC BY 4.0, free with registration" /></Field>
      </div>
      <Field label="Citation" hint="How should others credit this material?">
        <input className={inputCls} style={{ ...inputStyle, ...MONO, fontSize: 13 }} value={data.citation} onChange={set("citation")} />
      </Field>

      {editing && (
        <Field label="Changelog *" hint="Briefly: what changed in this version, and why?">
          <input className={inputCls} style={inputStyle} value={changelog} onChange={(e) => setChangelog(e.target.value)} placeholder="e.g. Updated link to the 2026 edition" />
        </Field>
      )}

      <div className="flex gap-2 mt-2">
        <Btn disabled={!valid} onClick={async () => {
          if (editing) { await actions.updateResource(editing.id, data, changelog.trim()); nav({ page: "detail", id: editing.id }); }
          else { const id = await actions.createResource(data); nav({ page: "detail", id }); }
        }}>
          {editing ? "Save new version" : "Submit material"}
        </Btn>
        <Btn kind="ghost" onClick={() => nav(editing ? { page: "detail", id: editing.id } : { page: "home" })}>Cancel</Btn>
      </div>
      {!valid && <div className="text-xs mt-2" style={{ color: "#7e828a" }}>Required: title, URL, at least one topic{editing ? ", and a changelog" : ""}.</div>}
    </div>
  );
}

/* ───────────────────────── login page ───────────────────────── */

function LoginPage({ nav, onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login");

  const submit = async () => {
    setErr(""); setBusy(true);
    const res = mode === "login"
      ? await onLogin(email.trim(), p)
      : await onSignup(email.trim(), p, u.trim(), name.trim());
    setBusy(false);
    if (res) setErr(res); else nav({ page: "home" });
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <h1 className="text-2xl pt-10 pb-6" style={{ ...HEAD, color: INK }}>{mode === "login" ? "Log in" : "Create a viewer account"}</h1>

      {mode === "signup" && (
        <>
          <Field label="Display name"><input className={inputCls} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Username" hint="Your handle on the commons — shown on everything you contribute."><input className={inputCls} style={inputStyle} value={u} onChange={(e) => setU(e.target.value)} /></Field>
        </>
      )}
      <Field label="Email"><input type="email" autoComplete="email" className={inputCls} style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputCls} style={inputStyle} value={p} onChange={(e) => setP(e.target.value)} /></Field>
      {err && <div className="text-sm mb-3" style={{ color: "#af2f23" }}>{err}</div>}

      <div className="flex gap-2 items-center">
        <Btn disabled={busy} onClick={submit}>{busy ? "Working…" : (mode === "login" ? "Log in" : "Create account")}</Btn>
        <button className="text-sm underline" style={{ color: ACCENT }} onClick={() => { setErr(""); setMode(mode === "login" ? "signup" : "login"); }}>
          {mode === "login" ? "Need an account? Sign up as a viewer" : "Have an account? Log in"}
        </button>
      </div>

      <div className="mt-10 rounded border p-4 text-sm" style={{ background: "#f1f1ee", borderColor: "#e0e0dc", color: "#4d5158" }}>
        New sign-ups arrive with the <strong>viewer</strong> role. An admin can promote you to contributor or admin from the dashboard. Sign-in is handled securely by Supabase Auth.
      </div>
    </div>
  );
}

/* ───────────────────────── dashboard ───────────────────────── */

function Dashboard({ db, user, nav, actions }) {
  const isAdmin = user.role === "admin";
  const tabs = isAdmin ? ["Issue log", "Review assignments", "Users", "My materials"] : ["My materials", "Review assignments"];
  const [tab, setTab] = useState(tabs[0]);
  const [flagFilter, setFlagFilter] = useState("open");
  const [aRes, setARes] = useState("");
  const [aWho, setAWho] = useState("");
  const [aNote, setANote] = useState("");
  const [completeNotes, setCompleteNotes] = useState({});

  const myMaterials = db.resources.filter((r) => r.createdBy === user.username);
  const contributors = db.users.filter((u) => u.role === "contributor" || u.role === "admin");
  const rTitle = (id) => { const r = db.resources.find((x) => x.id === id); return r ? current(r).title : "(deleted material)"; };

  const flags = db.flags
    .filter((f) => flagFilter === "all" || f.status === flagFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const myAssignments = db.assignments.filter((a) => a.assignedTo === user.username).sort((a, b) => b.date.localeCompare(a.date));
  const allAssignments = [...db.assignments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <h1 className="text-2xl pt-8 pb-4" style={{ ...HEAD, color: INK }}>Dashboard</h1>
      <div className="flex gap-2 flex-wrap border-b pb-3" style={{ borderColor: "#e4e4e0" }}>
        {tabs.map((t) => <Pill key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Pill>)}
      </div>

      {/* ── issue log (admin) ── */}
      {tab === "Issue log" && isAdmin && (
        <div className="pt-6">
          <div className="flex gap-2 mb-4">
            {["open", "resolved", "all"].map((f) => <Pill key={f} active={flagFilter === f} onClick={() => setFlagFilter(f)}>{f}</Pill>)}
          </div>
          {flags.length === 0 && <div className="text-sm" style={{ color: "#7e828a" }}>No {flagFilter !== "all" ? flagFilter : ""} issues. The commons is in good shape.</div>}
          <div className="flex flex-col gap-3">
            {flags.map((f) => (
              <div key={f.id} className="rounded border bg-white p-4" style={{ borderColor: "#e4e4e0" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm">
                    <StatusDot status={f.status} />
                    <span className="font-semibold" style={{ color: INK }}>{f.type}</span>
                    <span style={{ color: "#7e828a" }}> on </span>
                    <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "detail", id: f.resourceId })}>{rTitle(f.resourceId)}</button>
                  </div>
                  {f.status === "open"
                    ? <Btn small kind="ghost" onClick={() => actions.resolveFlag(f.id)}>Mark resolved</Btn>
                    : <span className="text-xs" style={{ color: "#51661a" }}>resolved by {userName(db, f.resolvedBy)} · {fmtDate(f.resolvedAt)}</span>}
                </div>
                <div className="text-sm mt-2" style={{ color: INK }}>{f.note}</div>
                <div className="text-xs mt-1" style={{ color: "#7e828a" }}>reported by {userName(db, f.by)} · {fmtDate(f.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── review assignments ── */}
      {tab === "Review assignments" && (
        <div className="pt-6">
          {isAdmin && (
            <div className="rounded border bg-white p-4 mb-6" style={{ borderColor: "#e4e4e0" }}>
              <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Assign a material for review</div>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="Material">
                  <select className={inputCls} style={inputStyle} value={aRes} onChange={(e) => setARes(e.target.value)}>
                    <option value="">Choose a material…</option>
                    {db.resources.map((r) => <option key={r.id} value={r.id}>{current(r).title}</option>)}
                  </select>
                </Field>
                <Field label="Assign to">
                  <select className={inputCls} style={inputStyle} value={aWho} onChange={(e) => setAWho(e.target.value)}>
                    <option value="">Choose a contributor…</option>
                    {contributors.map((u) => <option key={u.username} value={u.username}>{u.name} ({u.username})</option>)}
                  </select>
                </Field>
              </div>
              <Field label="What should they check?">
                <input className={inputCls} style={inputStyle} value={aNote} onChange={(e) => setANote(e.target.value)} placeholder="e.g. Verify the link and update the citation to the 2026 edition" />
              </Field>
              <Btn small disabled={!aRes || !aWho || !aNote.trim()} onClick={() => { actions.createAssignment(aRes, aWho, aNote.trim()); setARes(""); setAWho(""); setANote(""); }}>Assign review</Btn>
            </div>
          )}

          {(isAdmin ? allAssignments : myAssignments).length === 0 && (
            <div className="text-sm" style={{ color: "#7e828a" }}>{isAdmin ? "No reviews assigned yet." : "Nothing assigned to you right now."}</div>
          )}
          <div className="flex flex-col gap-3">
            {(isAdmin ? allAssignments : myAssignments).map((a) => (
              <div key={a.id} className="rounded border bg-white p-4" style={{ borderColor: "#e4e4e0" }}>
                <div className="flex items-center justify-between gap-3 flex-wrap text-sm">
                  <div>
                    <StatusDot status={a.status} />
                    <button className="underline font-semibold" style={{ color: ACCENT }} onClick={() => nav({ page: "detail", id: a.resourceId })}>{rTitle(a.resourceId)}</button>
                    <span style={{ color: "#7e828a" }}> → {userName(db, a.assignedTo)}</span>
                  </div>
                  <span className="text-xs" style={{ color: "#7e828a" }}>assigned by {userName(db, a.assignedBy)} · {fmtDate(a.date)}</span>
                </div>
                <div className="text-sm mt-2" style={{ color: INK }}>{a.note}</div>
                {a.status === "completed" && (
                  <div className="text-sm mt-2 px-3 py-2 rounded" style={{ background: "#eef2e6", color: "#51661a" }}>
                    Completed {fmtDate(a.completedAt)}{a.completionNote ? ` — ${a.completionNote}` : ""}
                  </div>
                )}
                {a.status === "pending" && a.assignedTo === user.username && (
                  <div className="mt-3 flex gap-2 items-start">
                    <input
                      className={inputCls} style={inputStyle} placeholder="Optional note on what you found / fixed"
                      value={completeNotes[a.id] || ""}
                      onChange={(e) => setCompleteNotes({ ...completeNotes, [a.id]: e.target.value })}
                    />
                    <Btn small onClick={() => actions.completeAssignment(a.id, (completeNotes[a.id] || "").trim())}>Mark complete</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── users (admin) ── */}
      {tab === "Users" && isAdmin && (
        <div className="pt-6">
          <div className="text-sm mb-4" style={{ color: "#7e828a" }}>Change a user's role with the dropdown. New sign-ups arrive as viewers.</div>
          <div className="flex flex-col">
            {db.users.map((u) => (
              <div key={u.username} className="flex items-center gap-4 py-2 border-b text-sm flex-wrap" style={{ borderColor: "#ececea" }}>
                <span className="font-semibold w-40" style={{ color: INK }}>{u.name}</span>
                <span style={{ ...MONO, color: "#7e828a" }} className="w-28">{u.username}</span>
                <span className="text-xs" style={{ color: "#7e828a" }}>joined {fmtDate(u.createdAt)}</span>
                <div className="flex-1" />
                <select
                  className="px-2 py-1 rounded border bg-white text-sm" style={inputStyle}
                  value={u.role}
                  disabled={u.username === user.username}
                  onChange={(e) => actions.setRole(u.username, e.target.value)}
                >
                  {ROLES.map((rr) => <option key={rr}>{rr}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── my materials ── */}
      {tab === "My materials" && (
        <div className="pt-6">
          {myMaterials.length === 0 && (
            <div className="text-sm" style={{ color: "#7e828a" }}>
              You haven't contributed anything yet. <button className="underline" style={{ color: ACCENT }} onClick={() => nav({ page: "submit" })}>Submit your first material</button>.
            </div>
          )}
          <div className="flex flex-col">
            {myMaterials.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b text-sm flex-wrap" style={{ borderColor: "#ececea" }}>
                <button className="underline font-semibold" style={{ color: ACCENT }} onClick={() => nav({ page: "detail", id: r.id })}>{current(r).title}</button>
                <span style={{ ...MONO, color: "#7e828a" }}>v{r.versions.length}</span>
                <span className="text-xs" style={{ color: "#7e828a" }}>added {fmtDate(r.createdAt)}</span>
                <div className="flex-1" />
                <Btn small kind="ghost" onClick={() => nav({ page: "edit", id: r.id })}>Edit</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── app shell ───────────────────────── */

export default function ComplexityCommons() {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState({ page: "home" });

  // Pull the whole catalog from Supabase into the shape the UI expects.
  // We re-run this after every write so the screen always reflects the DB.
  const refresh = async () => setDb(await store.loadDb());

  useEffect(() => {
    (async () => {
      await refresh();
      setUser(await store.currentUser());
    })();
    // Re-check the session and reload data whenever auth changes (login/logout).
    const { data: sub } = store.onAuthChange(async () => {
      setUser(await store.currentUser());
      await refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const nav = (r) => { setRoute(r); window.scrollTo(0, 0); };

  // Each action performs its specific Supabase write, then refreshes local state.
  const actions = {
    async createResource(data) {
      const id = await store.createResource(user.username, data);
      await refresh();
      return id;
    },
    async updateResource(id, data, changelog) {
      const r = db.resources.find((x) => x.id === id);
      const nextV = (r ? r.versions.length : 0) + 1;
      await store.addVersion(id, nextV, user.username, changelog, data);
      await refresh();
    },
    async toggleFeatured(id) {
      const r = db.resources.find((x) => x.id === id);
      await store.toggleFeatured(id, !(r && r.featured));
      await refresh();
    },
    async addComment(resourceId, text) {
      await store.addComment(resourceId, user.username, text);
      await refresh();
    },
    async addFlag(resourceId, type, note) {
      await store.addFlag(resourceId, type, note, user.username);
      await refresh();
    },
    async resolveFlag(flagId) {
      await store.resolveFlag(flagId, user.username);
      await refresh();
    },
    async createAssignment(resourceId, assignedTo, note) {
      await store.createAssignment(resourceId, assignedTo, user.username, note);
      await refresh();
    },
    async completeAssignment(id, completionNote) {
      await store.completeAssignment(id, completionNote);
      await refresh();
    },
    async setRole(username, role) {
      await store.setRole(username, role);
      await refresh();
    },
  };

  // Auth is delegated to Supabase. signIn/signUp return null on success or an
  // error string on failure; the onAuthChange listener above sets `user`.
  const onLogin = async (email, password) => {
    return await store.signIn(email, password);
  };
  const onSignup = async (email, password, username, name) => {
    if (!email || !password || !username || !name) return "All fields are required.";
    if (db.users.some((x) => x.username === username)) return "That username is already taken.";
    return await store.signUp(email, password, username, name);
  };
  const onLogout = async () => { await store.signOut(); setRoute({ page: "home" }); };

  if (!db) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: PAPER, color: "#7e828a" }}>
        Loading the commons…
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK }}>
      <Header user={user} nav={nav} onLogout={onLogout} />
      {route.page === "home" && <HomePage db={db} nav={nav} initialFormat={route.format} key={route.format || "all"} />}
      {route.page === "detail" && <DetailPage db={db} id={route.id} user={user} nav={nav} actions={actions} />}
      {route.page === "submit" && <ResourceForm db={db} user={user} nav={nav} actions={actions} />}
      {route.page === "edit" && <ResourceForm db={db} user={user} nav={nav} actions={actions} editId={route.id} />}
      {route.page === "login" && <LoginPage nav={nav} onLogin={onLogin} onSignup={onSignup} />}
      {route.page === "dashboard" && user && user.role !== "viewer" && <Dashboard db={db} user={user} nav={nav} actions={actions} />}
      <footer className="mt-10 py-10 text-center text-xs" style={{ background: GRAD, color: "#cccec8" }}>
        <div className="flex items-center justify-center mb-3"><NodeGlyph /></div>
        <div className="text-sm text-white mb-1" style={HEAD}>Complexity Commons</div>
        <div className="mb-2">
          A project of the <a href="https://www.santafe.edu/" target="_blank" rel="noreferrer" className="underline" style={{ color: "#decea1" }}>Santa Fe Institute</a>'s <a href="https://www.complexityexplorer.org/" target="_blank" rel="noreferrer" className="underline" style={{ color: "#decea1" }}>Complexity Explorer</a>
        </div>
        Prototype. Materials are linked, not hosted; rights remain with their creators.
      </footer>
    </div>
  );
}
