/* CampusHub — single-file app: router, student + teacher portals, AI Companion.
   Data lives in localStorage (demo). Demo password for all seeded accounts: campus123 */
(() => {
"use strict";

/* ───────── Storage ───────── */
const KEY = "campushub.v1";
let db;
function sha256js(str) { // pure-JS fallback for browsers without crypto.subtle (e.g. http:// previews)
  const K = [], H = [];
  let isP = (n) => { for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }, f = (n) => ((n - Math.floor(n)) * 4294967296) | 0;
  for (let c = 2, n = 0; n < 64; c++) if (isP(c)) { if (n < 8) H[n] = f(Math.pow(c, 1 / 2)); K[n++] = f(Math.pow(c, 1 / 3)); }
  const bytes = unescape(encodeURIComponent(str)), l = bytes.length, w = [];
  for (let i = 0; i < l; i++) w[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
  w[l >> 2] |= 0x80 << (24 - (l % 4) * 8); w[(((l + 8) >> 6) << 4) + 15] = l * 8;
  const rr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let j = 0; j < w.length; j += 16) {
    const a = w.slice(j, j + 16), o = H.slice(0);
    for (let i = 0; i < 64; i++) {
      if (i >= 16) { const x = a[i - 15] | 0, y = a[i - 2] | 0; a[i] = (a[i - 16] | 0) + (rr(x, 7) ^ rr(x, 18) ^ (x >>> 3)) + (a[i - 7] | 0) + (rr(y, 17) ^ rr(y, 19) ^ (y >>> 10)) | 0; }
      const e = o[4], t1 = o[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & o[5]) ^ (~e & o[6])) + K[i] + (a[i] | 0), A = o[0];
      const t2 = (rr(A, 2) ^ rr(A, 13) ^ rr(A, 22)) + ((A & o[1]) ^ (A & o[2]) ^ (o[1] & o[2]));
      o.unshift((t1 + t2) | 0); o[4] = (o[4] + t1) | 0; o.pop();
    }
    for (let i = 0; i < 8; i++) H[i] = (H[i] + o[i]) | 0;
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
}
const sha = async (s) => {
  try { if (window.crypto && crypto.subtle) return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join(""); } catch {}
  return sha256js(s);
};
async function seedDb() {
  const fresh = window.CH_SEED();
  const demo = await sha("campus123");
  [...fresh.students, ...fresh.teachers].forEach((u) => (u.pw = demo));
  return fresh;
}
async function load() {
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
  if (db && (!Array.isArray(db.students) || !db.settings || !db.seq)) db = null; // corrupt or old data
  if (!db || db.version !== 1) { db = await seedDb(); save(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }
const nextId = (k) => db.seq[k]++;

/* ───────── Helpers ───────── */
const $ = (s, el = document) => el.querySelector(s);
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "No date");
const initials = (n) => n.split(/\s+/).map((w) => w[0]).filter((c) => /[A-Za-z]/.test(c)).slice(0, 2).join("").toUpperCase();
const SPECTRUM = ["violet", "pink", "orange", "yellow", "green", "cyan"];
const HEX = { violet: "#6d4aff", pink: "#ff4d8d", orange: "#ff8a1f", yellow: "#ffc61a", green: "#12c48b", cyan: "#14b0ff" };

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  tasks: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  events: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  att: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
  notes: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  help: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  spark: '<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/>',
};
const icon = (n, size = 20, stroke = "currentColor") => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* The CampusHub mark: six coloured nodes (the six modules) orbiting one hub. */
function logo(text = true) {
  const pts = [[20, 6, "violet"], [32, 13, "pink"], [32, 27, "orange"], [20, 34, "green"], [8, 27, "cyan"], [8, 13, "yellow"]];
  const dots = pts.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="6" fill="${HEX[c]}"/>`).join("");
  return `<span class="logo"><svg viewBox="0 0 40 40" role="img" aria-label="CampusHub logo">${dots}<circle cx="20" cy="20" r="5" fill="currentColor"/></svg>${text ? "CampusHub" : ""}</span>`;
}

function toast(msg) {
  document.querySelectorAll(".toast").forEach((x) => x.remove());
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; t.setAttribute("role", "status");
  document.body.appendChild(t); setTimeout(() => t.remove(), 2400);
}

/* Generic form modal */
function formModal({ title, fields, values = {}, submit = "Save", onSave }) {
  const ov = $("#overlay");
  const input = (f) => {
    const v = values[f.k] ?? f.def ?? "";
    const id = "f_" + f.k;
    if (f.type === "select") return `<select class="input" id="${id}" name="${f.k}">${f.options.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${h(val)}" ${String(v) === String(val) ? "selected" : ""}>${h(lab)}</option>`; }).join("")}</select>`;
    if (f.type === "textarea") return `<textarea class="input" id="${id}" name="${f.k}" ${f.req ? "required" : ""}>${h(v)}</textarea>`;
    return `<input class="input" id="${id}" name="${f.k}" type="${f.type || "text"}" value="${h(v)}" ${f.req ? "required" : ""} ${f.min !== undefined ? `min="${f.min}"` : ""}>`;
  };
  ov.innerHTML = `<div class="modal-bg"><form class="modal" role="dialog" aria-modal="true" aria-label="${h(title)}"><h3>${h(title)}</h3>
    ${fields.map((f) => `<div class="field"><label for="f_${f.k}">${h(f.label)}</label>${input(f)}</div>`).join("")}
    <div class="err" id="formErr"></div>
    <div class="acts"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary">${h(submit)}</button></div></form></div>`;
  const form = $("form", ov);
  const close = () => (ov.innerHTML = "");
  form.querySelector("input,select,textarea")?.focus();
  $("[data-close]", ov).onclick = close;
  $(".modal-bg", ov).onclick = (e) => { if (e.target.classList.contains("modal-bg")) close(); };
  form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const msg = onSave(data);
    if (msg) { $("#formErr").textContent = msg; return; }
    close();
  };
}
function confirmModal(text, onYes) {
  const ov = $("#overlay");
  ov.innerHTML = `<div class="modal-bg"><div class="modal" role="alertdialog" aria-modal="true"><h3>${h(text)}</h3><div class="acts"><button class="btn btn-ghost" data-close>Keep it</button><button class="btn btn-danger" data-yes>Delete</button></div></div></div>`;
  $("[data-close]", ov).onclick = () => (ov.innerHTML = "");
  $("[data-yes]", ov).onclick = () => { ov.innerHTML = ""; onYes(); };
}

/* ───────── Domain helpers ───────── */
const me = () => (db.session ? (db.session.role === "student" ? db.students : db.teachers).find((u) => u.id === db.session.id) : null);
const role = () => db.session?.role;
const course = (id) => db.courses.find((c) => c.id === id);
const teacher = (id) => db.teachers.find((t) => t.id === id);
const student = (id) => db.students.find((s) => s.id === id);
const courseLabel = (id) => { const c = course(id); return c ? `${c.code} · ${c.name}` : "General"; };

function attendanceFor(studentId, courseId) {
  const rec = db.attendance.filter((a) => a.studentId === studentId && a.courseId === courseId);
  const total = rec.length, attended = rec.filter((r) => r.status === "present").length;
  const pct = total ? Math.round((attended / total) * 1000) / 10 : 100;
  const ok = pct >= 75;
  return { total, attended, pct, ok,
    canMiss: total && ok ? Math.max(0, Math.floor((attended - 0.75 * total) / 0.75)) : 0,
    need: total && !ok ? Math.ceil((0.75 * total - attended) / 0.25) : 0 };
}
const myCourses = (sid) => db.enrollments.filter((e) => e.studentId === sid).map((e) => course(e.courseId)).filter(Boolean);
const overdue = (t) => t.due && t.due < today() && t.status !== "completed";
const STATUS = { pending: ["Pending", "orange"], in_progress: ["In progress", "cyan"], completed: ["Done", "green"] };
const PRIO = { low: ["Low", "green"], medium: ["Medium", "yellow"], high: ["High", "pink"] };
const tag = (label, c) => `<span class="tag c-${c}">${h(label)}</span>`;
const empty = (t, s) => `<div class="empty"><b>${h(t)}</b>${h(s)}</div>`;

/* ───────── Router ───────── */
const PUBLIC = ["", "login", "join", "privacy", "terms", "help"];
const route = () => (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
const go = (r) => { location.hash = "#/" + r; };

const NAV = {
  student: [["dashboard", "Dashboard", "grid", "violet"], ["tasks", "Tasks", "tasks", "violet"], ["events", "Events", "events", "pink"], ["resources", "Resources", "book", "cyan"], ["attendance", "Attendance", "att", "green"], ["notes", "Notes", "notes", "orange"], ["profile", "Profile", "user", "yellow"]],
  teacher: [["dashboard", "Overview", "grid", "violet"], ["attendance", "Attendance", "att", "green"], ["notes", "Notes", "notes", "orange"], ["resources", "Resources", "book", "cyan"], ["events", "Events", "events", "pink"], ["profile", "Profile", "user", "yellow"]],
};

function render() {
  const r = route();
  const app = $("#app");
  window.scrollTo(0, 0);
  if (db.session && !me()) db.session = null;
  document.documentElement.dataset.theme = db.settings.theme;

  if (db.session && (r === "" || r === "login" || r === "join")) return go("dashboard");
  if (!db.session && !PUBLIC.includes(r)) return go("login");

  if (!db.session) {
    app.innerHTML = r === "login" || r === "join" ? authPage(r) : r === "" ? landing() : publicDoc(r);
    bindAuth();
  } else {
    const pages = role() === "student" ? studentPages : teacherPages;
    const fn = pages[r] || docPages[r] || pages.dashboard;
    app.innerHTML = shell(r, fn());
    $(".side")?.addEventListener("click", () => $(".side").classList.remove("open"));
    if (fn.bind) fn.bind();
  }
  mountAI();
  document.title = "CampusHub" + (r ? " — " + (r[0].toUpperCase() + r.slice(1)) : " — Your whole campus in one colourful place");
}

/* ───────── Landing ───────── */
function landing() {
  const feats = [
    ["tasks", "violet", "Tasks that finish", "Prioritise, filter and tick off assignments. Overdue work is flagged before it hurts."],
    ["events", "pink", "Events worth joining", "Hackathons, workshops and career fairs with live seat counts and one-tap registration."],
    ["book", "cyan", "Two shelves of resources", "Faculty-published material for every course, plus a private shelf only you can see."],
    ["att", "green", "Attendance you can plan with", "See exactly how many classes you can miss, or must attend, to stay above 75%."],
    ["notes", "orange", "Teacher notes, searchable", "Revision notes from your faculty, grouped by course and easy to find."],
    ["spark", "yellow", "AI Companion", "Ask for a study plan, a topic explained or a nudge on what to do first."],
  ];
  return `
  <header class="nav">${logo()}<nav class="nav-links" aria-label="Sections"><a href="#features">Features</a><a href="#roles">Students &amp; faculty</a><a href="#/help">Help</a></nav>
    <div class="nav-actions"><a class="btn btn-ghost btn-sm" href="#/login">Log in</a><a class="btn btn-primary btn-sm" href="#/join">Join free</a></div></header>
  <main>
  <section class="hero">
    <div>
      <h1>Your whole campus in <span class="spec">one colourful place.</span></h1>
      <p class="lead">CampusHub brings tasks, events, attendance, notes and study resources together for students and faculty, with an AI Companion that helps you decide what to do next.</p>
      <div class="hero-cta"><a class="btn btn-spectrum" href="#/join">Create your student account</a><a class="btn btn-ghost" href="#/login">Try the demo</a></div>
      <div class="trust"><span><i class="dot bg-green"></i>Student and teacher portals</span><span><i class="dot bg-pink"></i>75% attendance planner</span><span><i class="dot bg-cyan"></i>Light and dark themes</span></div>
    </div>
    <div class="preview" aria-hidden="true">
      <div class="bar"><i class="bg-pink"></i><i class="bg-yellow"></i><i class="bg-green"></i></div>
      <div class="pv-grid">
        <div class="pv-tile c-violet"><b>4</b><span>Tasks open</span></div>
        <div class="pv-tile c-pink"><b>2</b><span>Events joined</span></div>
        <div class="pv-tile c-orange"><b>2</b><span>Due this week</span></div>
        <div class="pv-tile c-cyan"><b>4</b><span>Study resources</span></div>
        <div class="pv-tile c-green pv-wide"><div><b style="font-size:1.6rem">81.8%</b><span>Overall attendance</span></div><div class="meter"><i style="width:82%"></i></div></div>
      </div>
    </div>
  </section>
  <section class="section" id="features"><h2>Six modules. Six colours. Zero confusion.</h2><p class="sub">Every part of CampusHub has its own colour, so you always know where you are.</p>
    <div class="features">${feats.map(([i, c, t, d]) => `<article class="feature c-${c}"><div class="ico bg-${c}">${icon(i, 24, "#fff")}</div><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></section>
  <section class="section" id="roles"><h2>Built for both sides of the classroom.</h2>
    <div class="roles">
      <div class="role s"><h3>Students</h3><p>Everything you need between lectures.</p><ul><li>Track tasks and deadlines</li><li>Join campus events</li><li>Keep private study links</li><li>Stay above 75% attendance</li></ul><a class="btn btn-primary" href="#/join">Join as a student</a></div>
      <div class="role t"><h3>Faculty</h3><p>Less admin, more teaching.</p><ul><li>Mark attendance in seconds</li><li>See students at risk of shortage</li><li>Publish notes and resources</li><li>Create and manage events</li></ul><a class="btn btn-primary" href="#/login">Open the faculty demo</a></div>
    </div></section>
  </main>
  ${footer()}`;
}
const footer = () => `<footer class="footer"><div>${logo()}<div>© ${new Date().getFullYear()} CampusHub. Demo project.</div></div><nav aria-label="Legal"><a href="#/help">Help &amp; Support</a><a href="#/privacy">Privacy Policy</a><a href="#/terms">Terms &amp; Conditions</a></nav></footer>`;

/* ───────── Auth ───────── */
function authPage(mode) {
  const join = mode === "join";
  return `<div class="auth"><aside class="auth-art"><a href="#/">${logo()}</a><h2>Everything campus, finally in colour.</h2><p style="position:relative;z-index:1;max-width:36ch;opacity:.85">Tasks, events, attendance, notes and an AI Companion, in one place.</p></aside>
  <main class="auth-form"><a href="#/" class="logo" style="margin-bottom:26px">${logo()}</a>
    <h1>${join ? "Create your account" : "Welcome back"}</h1><p style="color:var(--muted)">${join ? "Student onboarding takes about a minute." : "Log in as a student or faculty member."}</p>
    <div class="tabs" role="tablist"><button class="${join ? "" : "on"}" data-go="login" role="tab">Log in</button><button class="${join ? "on" : ""}" data-go="join" role="tab">Join as student</button></div>
    <form id="authForm" novalidate>
    ${join ? `<div class="field"><label for="a_name">Full name</label><input class="input" id="a_name" name="name" autocomplete="name" required></div>` : ""}
    <div class="field"><label for="a_email">Email</label><input class="input" id="a_email" name="email" type="email" autocomplete="email" required></div>
    <div class="field"><label for="a_pw">Password</label><input class="input" id="a_pw" name="pw" type="password" autocomplete="${join ? "new-password" : "current-password"}" required></div>
    ${join ? `<div class="row"><div class="field"><label for="a_sid">Student ID</label><input class="input" id="a_sid" name="code" required></div><div class="field"><label for="a_dept">Department</label><input class="input" id="a_dept" name="dept" value="Computer Science" required></div></div>
    <div class="row"><div class="field"><label for="a_year">Year</label><select class="input" id="a_year" name="year">${[1, 2, 3, 4].map((y) => `<option>${y}</option>`).join("")}</select></div><div class="field"><label for="a_sem">Semester</label><select class="input" id="a_sem" name="semester">${[1, 2, 3, 4, 5, 6, 7, 8].map((y) => `<option>${y}</option>`).join("")}</select></div></div>` : ""}
    <div class="err" id="authErr" role="alert"></div>
    <button class="btn btn-spectrum" style="width:100%">${join ? "Create account" : "Log in"}</button></form>
    ${join ? "" : `<div class="demo-chips"><span style="font-size:.82rem;color:var(--muted);align-self:center">Demo accounts (password campus123):</span><button class="chip" data-demo="alex.johnson@university.edu">Student · Alex</button><button class="chip" data-demo="sharma@university.edu">Faculty · Dr. Sharma</button></div>`}
  </main></div>`;
}
function bindAuth() {
  const form = $("#authForm");
  document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go(b.dataset.go)));
  document.querySelectorAll("[data-demo]").forEach((b) => (b.onclick = () => { $("#a_email").value = b.dataset.demo; $("#a_pw").value = "campus123"; }));
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const err = (m) => ($("#authErr").textContent = m);
    const email = (d.email || "").trim().toLowerCase();
    if (!email || !d.pw) return err("Enter your email and password.");
    const pw = await sha(d.pw);
    if (route() === "join") {
      if (!d.name.trim() || !d.code.trim()) return err("Fill in your name and student ID.");
      if (d.pw.length < 6) return err("Use a password with at least 6 characters.");
      if (db.students.some((s) => s.email === email) || db.teachers.some((t) => t.email === email)) return err("That email is already registered. Log in instead.");
      if (db.students.some((s) => s.code.toLowerCase() === d.code.trim().toLowerCase())) return err("That student ID already exists.");
      const s = { id: nextId("student"), code: d.code.trim(), name: d.name.trim(), email, pw, dept: d.dept.trim(), year: +d.year, semester: +d.semester, bio: "", phone: "", address: "" };
      db.students.push(s);
      db.courses.forEach((c) => db.enrollments.push({ studentId: s.id, courseId: c.id }));
      db.session = { role: "student", id: s.id }; save(); go("dashboard"); toast("Welcome to CampusHub, " + s.name.split(" ")[0] + "!");
    } else {
      const s = db.students.find((x) => x.email === email && x.pw === pw);
      const t = db.teachers.find((x) => x.email === email && x.pw === pw);
      if (!s && !t) return err("Email or password is incorrect.");
      db.session = s ? { role: "student", id: s.id } : { role: "teacher", id: t.id }; save(); go("dashboard");
    }
  };
}

/* ───────── Shell ───────── */
function shell(active, content) {
  const u = me(), r = role();
  const nav = NAV[r].map(([k, l, i, c]) => `<a href="#/${k}" class="${active === k ? "on" : ""}"><span class="ico bg-${c}">${icon(i, 17, "#fff")}</span>${l}</a>`).join("");
  return `<div class="shell"><aside class="side" aria-label="Main">${`<a href="#/dashboard" style="padding:0">${logo()}</a>`}${nav}<h6>More</h6>
    <a href="#/settings" class="${active === "settings" ? "on" : ""}"><span class="ico" style="background:#4b4478">${icon("sliders", 17, "#fff")}</span>Settings</a>
    <a href="#/help" class="${active === "help" ? "on" : ""}"><span class="ico" style="background:#4b4478">${icon("help", 17, "#fff")}</span>Help &amp; Support</a>
    <div class="grow"></div><a href="#" data-act="logout"><span class="ico" style="background:#4b4478">${icon("out", 17, "#fff")}</span>Log out</a></aside>
  <div class="main"><header class="top"><div class="who"><button class="btn btn-ghost btn-sm menu-btn" data-act="menu" aria-label="Open menu">${icon("menu", 18)}</button><div class="avatar" aria-hidden="true">${h(initials(u.name))}</div><div><b>${h(u.name)}</b><div style="font-size:.8rem;color:var(--muted)">${r === "student" ? h(u.code) : h(u.title)}</div></div></div>
    <button class="btn btn-ghost btn-sm" data-act="theme">${db.settings.theme === "dark" ? "Light mode" : "Dark mode"}</button></header>
  <main class="page">${content}</main></div></div>`;
}
const head = (t, sub, action = "") => `<div class="page-head"><div><h1>${t}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${action}</div>`;

/* Global click delegation */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const a = el.dataset.act, id = +el.dataset.id || el.dataset.id;
  if (a === "logout") { e.preventDefault(); db.session = null; save(); go(""); }
  else if (a === "menu") $(".side").classList.toggle("open");
  else if (a === "theme") { db.settings.theme = db.settings.theme === "dark" ? "light" : "dark"; save(); render(); }
  else if (ACTIONS[a]) ACTIONS[a](id, el);
});
const ACTIONS = {};
const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };

/* ───────── Student pages ───────── */
const studentPages = {};
studentPages.dashboard = () => {
  const u = me(), t = db.tasks.filter((x) => x.studentId === u.id);
  const week = new Date(); week.setDate(week.getDate() + 7); const wk = week.toISOString().slice(0, 10);
  const open = t.filter((x) => x.status !== "completed");
  const dueWeek = open.filter((x) => x.due && x.due >= today() && x.due <= wk);
  const od = t.filter(overdue);
  const cs = myCourses(u.id).map((c) => ({ c, a: attendanceFor(u.id, c.id) }));
  const all = db.attendance.filter((a) => a.studentId === u.id);
  const overall = all.length ? Math.round((all.filter((a) => a.status === "present").length / all.length) * 1000) / 10 : 100;
  const low = cs.filter((x) => !x.a.ok);
  const regs = db.registrations.filter((r) => r.studentId === u.id);
  const events = db.events.filter((e) => e.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const next = open.filter((x) => x.due).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  return head(`Hi ${h(u.name.split(" ")[0])}, here's your day`, "Your tasks, events and attendance at a glance.") + `
  <div class="grid g4 keep" style="margin-bottom:16px">
    <div class="stat c-violet"><b>${open.length}</b><span>Open tasks</span></div>
    <div class="stat c-orange"><b>${dueWeek.length}</b><span>Due this week</span></div>
    <div class="stat c-pink"><b>${regs.length}</b><span>Events joined</span></div>
    <div class="stat ${low.length ? "c-pink" : "c-green"}"><b>${overall}%</b><span>Overall attendance</span></div>
  </div>
  ${od.length ? `<div class="item" style="border-color:var(--pink);margin-bottom:16px"><b class="c-pink tag">Overdue</b><div class="grow">You have ${od.length} overdue task${od.length > 1 ? "s" : ""}: ${od.map((x) => h(x.title)).join(", ")}.</div><a class="btn btn-sm btn-primary" href="#/tasks">Open tasks</a></div>` : ""}
  ${low.length ? `<div class="item" style="border-color:var(--orange);margin-bottom:16px"><b class="c-orange tag">Attendance</b><div class="grow">Below 75% in ${low.map((x) => h(x.c.code)).join(", ")}. Open Attendance to see how many classes to attend.</div><a class="btn btn-sm btn-primary" href="#/attendance">View</a></div>` : ""}
  <div class="grid g2">
    <section class="card"><h3>Up next</h3><div class="list">${next.length ? next.map((x) => `<div class="item"><div class="grow"><h4>${h(x.title)}</h4><p>${h(x.subject)} · due ${fmtDate(x.due)}</p></div>${tag(...PRIO[x.priority])}</div>`).join("") : empty("Nothing due", "Add a task to plan your week.")}</div></section>
    <section class="card"><h3>Upcoming events</h3><div class="list">${events.map((e) => `<div class="item"><div class="grow"><h4>${h(e.title)}</h4><p>${fmtDate(e.date)} · ${h(e.time)} · ${h(e.location)}</p></div></div>`).join("")}</div></section>
  </div>`;
};

studentPages.tasks = () => {
  const u = me(); const f = filters.tasks;
  let t = db.tasks.filter((x) => x.studentId === u.id);
  if (f.status) t = t.filter((x) => x.status === f.status);
  if (f.priority) t = t.filter((x) => x.priority === f.priority);
  if (f.q) t = t.filter((x) => (x.title + x.subject + x.description).toLowerCase().includes(f.q.toLowerCase()));
  t.sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const sel = (k, opts, ph) => `<select class="input" data-filter="tasks.${k}" aria-label="${ph}"><option value="">${ph}</option>${opts.map(([v, l]) => `<option value="${v}" ${f[k] === v ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  return head("Tasks", "Plan, prioritise and finish.", `<button class="btn btn-primary" data-act="task-add">Add task</button>`) + `
  <div class="toolbar"><input class="input" placeholder="Search tasks" value="${h(f.q)}" data-filter="tasks.q" aria-label="Search tasks">${sel("status", Object.entries(STATUS).map(([v, [l]]) => [v, l]), "Any status")}${sel("priority", Object.entries(PRIO).map(([v, [l]]) => [v, l]), "Any priority")}</div>
  <div class="list">${t.length ? t.map((x) => `<div class="item"><div class="grow"><h4>${h(x.title)}</h4><p>${h(x.description)}</p><p style="margin-top:6px">${tag(...STATUS[x.status])}${tag(...PRIO[x.priority])}<span>${h(x.subject)} · ${overdue(x) ? `<b style="color:var(--pink)">Overdue ${fmtDate(x.due)}</b>` : "Due " + fmtDate(x.due)}</span></p></div>
    <div class="acts">${x.status !== "completed" ? `<button class="btn btn-sm btn-ghost" data-act="task-done" data-id="${x.id}">Mark done</button>` : `<button class="btn btn-sm btn-ghost" data-act="task-reopen" data-id="${x.id}">Reopen</button>`}<button class="btn btn-sm btn-ghost" data-act="task-edit" data-id="${x.id}">Edit</button><button class="btn btn-sm btn-danger" data-act="task-del" data-id="${x.id}">Delete</button></div></div>`).join("") : empty("No tasks match", "Clear the filters or add a new task.")}</div>`;
};
const taskFields = [
  { k: "title", label: "Title", req: 1 }, { k: "description", label: "Description", type: "textarea" }, { k: "subject", label: "Subject" },
  { k: "due", label: "Due date", type: "date" },
  { k: "status", label: "Status", type: "select", options: Object.entries(STATUS).map(([v, [l]]) => [v, l]) },
  { k: "priority", label: "Priority", type: "select", options: Object.entries(PRIO).map(([v, [l]]) => [v, l]), def: "medium" },
];
Object.assign(ACTIONS, {
  "task-add": () => formModal({ title: "Add task", fields: taskFields, submit: "Add task", onSave: (d) => { if (!d.title.trim()) return "Give the task a title."; db.tasks.push({ id: nextId("task"), studentId: me().id, ...d, title: d.title.trim() }); save(); rerender(); toast("Task added"); } }),
  "task-edit": (id) => { const t = db.tasks.find((x) => x.id === id); formModal({ title: "Edit task", fields: taskFields, values: t, onSave: (d) => { if (!d.title.trim()) return "Give the task a title."; Object.assign(t, d); save(); rerender(); toast("Task updated"); } }); },
  "task-done": (id) => { db.tasks.find((x) => x.id === id).status = "completed"; save(); rerender(); toast("Marked done"); },
  "task-reopen": (id) => { db.tasks.find((x) => x.id === id).status = "pending"; save(); rerender(); },
  "task-del": (id) => confirmModal("Delete this task?", () => { db.tasks = db.tasks.filter((x) => x.id !== id); save(); rerender(); toast("Task deleted"); }),
});
const filters = { tasks: { q: "", status: "", priority: "" }, events: { cat: "" }, fres: { q: "", course: "" }, notes: { q: "", course: "" }, pres: { q: "" } };
document.addEventListener("input", (e) => {
  const k = e.target.dataset?.filter; if (!k) return;
  const [g, f] = k.split("."); filters[g][f] = e.target.value;
  const pos = e.target.selectionStart; rerender();
  const again = document.querySelector(`[data-filter="${k}"]`); if (again && e.target.tagName === "INPUT") { again.focus(); try { again.setSelectionRange(pos, pos); } catch {} }
});

studentPages.events = () => {
  const u = me(), cats = [...new Set(db.events.map((e) => e.category))];
  const list = db.events.filter((e) => !filters.events.cat || e.category === filters.events.cat).sort((a, b) => a.date.localeCompare(b.date));
  const colors = { Academic: "violet", Workshop: "cyan", Technical: "green", Cultural: "pink", Career: "orange" };
  return head("Events", "Find something worth showing up for.") + `<div class="toolbar"><select class="input" data-filter="events.cat" aria-label="Category"><option value="">All categories</option>${cats.map((c) => `<option ${filters.events.cat === c ? "selected" : ""}>${h(c)}</option>`).join("")}</select></div>
  <div class="grid g2">${list.map((e) => {
    const n = db.registrations.filter((r) => r.eventId === e.id).length, joined = db.registrations.some((r) => r.eventId === e.id && r.studentId === u.id), full = e.capacity && n >= e.capacity;
    return `<article class="card"><p>${tag(e.category, colors[e.category] || "violet")}${e.date < today() ? tag("Past", "orange") : ""}</p><h3 style="margin-top:10px">${h(e.title)}</h3><p style="color:var(--muted)">${h(e.description)}</p><p style="margin:12px 0"><b>${fmtDate(e.date)}</b> · ${h(e.time)}<br>${h(e.location)} · ${h(e.organizer)}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="font-size:.85rem;color:var(--muted)">${n}${e.capacity ? " / " + e.capacity : ""} registered</span>${joined ? `<button class="btn btn-sm btn-ghost" data-act="ev-leave" data-id="${e.id}">Cancel registration</button>` : `<button class="btn btn-sm btn-primary" data-act="ev-join" data-id="${e.id}" ${full ? "disabled" : ""}>${full ? "Full" : "Register"}</button>`}</div></article>`;
  }).join("")}</div>`;
};
Object.assign(ACTIONS, {
  "ev-join": (id) => { db.registrations.push({ eventId: id, studentId: me().id }); save(); rerender(); toast("You're registered"); },
  "ev-leave": (id) => { db.registrations = db.registrations.filter((r) => !(r.eventId === id && r.studentId === me().id)); save(); rerender(); toast("Registration cancelled"); },
});

const RTYPES = ["link", "note", "document", "video", "file", "other"];
const resFields = (withCourse) => [
  { k: "title", label: "Title", req: 1 },
  ...(withCourse ? [{ k: "courseId", label: "Course", type: "select", options: [["", "General"], ...db.courses.map((c) => [c.id, `${c.code} · ${c.name}`])] }] : [{ k: "subject", label: "Subject" }]),
  { k: "type", label: "Type", type: "select", options: RTYPES, def: "link" }, { k: "url", label: "Link (https://…)", type: "url" }, { k: "description", label: "Description", type: "textarea" },
];
const resCard = (r, meta, acts = "") => `<div class="item"><div class="ico bg-cyan">${icon("book", 20, "#fff")}</div><div class="grow"><h4>${h(r.title)}</h4><p>${h(r.description)}</p><p style="margin-top:6px">${tag(r.type, "cyan")}<span>${h(meta)}</span></p></div><div class="acts">${r.url ? `<a class="btn btn-sm btn-ghost" href="${h(r.url)}" target="_blank" rel="noopener noreferrer">Open</a>` : ""}${acts}</div></div>`;
let resTab = "faculty";
studentPages.resources = () => {
  const u = me(), q = (filters.fres.q || "").toLowerCase();
  const fac = db.facultyResources.filter((r) => (!filters.fres.course || String(r.courseId) === filters.fres.course) && (r.title + r.description).toLowerCase().includes(q));
  const mine = db.personalResources.filter((r) => r.studentId === u.id && (r.title + r.description + r.subject).toLowerCase().includes(q));
  return head("Resources", "Faculty material on one shelf, your private links on the other.", resTab === "mine" ? `<button class="btn btn-primary" data-act="pres-add">Add resource</button>` : "") + `
  <div class="tabs"><button class="${resTab === "faculty" ? "on" : ""}" data-act="tab-fac">From faculty</button><button class="${resTab === "mine" ? "on" : ""}" data-act="tab-mine">My study resources</button></div>
  <div class="toolbar"><input class="input" placeholder="Search" value="${h(filters.fres.q)}" data-filter="fres.q" aria-label="Search resources">${resTab === "faculty" ? `<select class="input" data-filter="fres.course" aria-label="Course"><option value="">All courses</option>${db.courses.map((c) => `<option value="${c.id}" ${filters.fres.course === String(c.id) ? "selected" : ""}>${h(c.code)}</option>`).join("")}</select>` : ""}</div>
  <div class="list">${resTab === "faculty"
    ? (fac.length ? fac.map((r) => resCard(r, `${courseLabel(r.courseId)} · ${teacher(r.teacherId)?.name}`)).join("") : empty("Nothing found", "Try another search."))
    : (mine.length ? mine.map((r) => resCard(r, r.subject, `<button class="btn btn-sm btn-ghost" data-act="pres-edit" data-id="${r.id}">Edit</button><button class="btn btn-sm btn-danger" data-act="pres-del" data-id="${r.id}">Delete</button>`)).join("") : empty("Your shelf is empty", "Add a link or note only you can see."))}</div>`;
};
Object.assign(ACTIONS, {
  "tab-fac": () => { resTab = "faculty"; rerender(); }, "tab-mine": () => { resTab = "mine"; rerender(); },
  "pres-add": () => formModal({ title: "Add study resource", fields: resFields(false), onSave: (d) => { if (!d.title.trim()) return "Give it a title."; db.personalResources.push({ id: nextId("pres"), studentId: me().id, ...d }); save(); rerender(); toast("Resource added"); } }),
  "pres-edit": (id) => { const r = db.personalResources.find((x) => x.id === id); formModal({ title: "Edit resource", fields: resFields(false), values: r, onSave: (d) => { if (!d.title.trim()) return "Give it a title."; Object.assign(r, d); save(); rerender(); toast("Saved"); } }); },
  "pres-del": (id) => confirmModal("Delete this resource?", () => { db.personalResources = db.personalResources.filter((x) => x.id !== id); save(); rerender(); toast("Resource deleted"); }),
});

studentPages.attendance = () => {
  const u = me();
  return head("Attendance", "The minimum is 75% per course. Here's where you stand.") + `<div class="list">${myCourses(u.id).map((c) => {
    const a = attendanceFor(u.id, c.id);
    return `<div class="att ${a.ok ? "" : "low"}"><div><div class="big-pct" style="color:${a.ok ? "var(--green)" : "var(--pink)"}">${a.pct}%</div><small style="color:var(--muted)">${a.attended} of ${a.total} classes</small></div>
      <div><b>${h(c.code)} · ${h(c.name)}</b><div class="meter" style="margin:8px 0"><i style="width:${Math.min(a.pct, 100)}%"></i></div><small style="color:var(--muted)">${h(teacher(c.teacherId)?.name)}</small></div>
      <div>${a.ok ? tag(`Can miss ${a.canMiss} more`, "green") : tag(`Attend next ${a.need} in a row`, "pink")}</div></div>`;
  }).join("")}</div>`;
};

studentPages.notes = () => notesPage(false);
studentPages.profile = () => profilePage();
studentPages.settings = () => settingsPage();

/* ───────── Shared: notes, profile, settings ───────── */
function notesPage(isTeacher) {
  const f = filters.notes, u = me();
  let n = db.notes.filter((x) => (!isTeacher || x.teacherId === u.id) && (!f.course || String(x.courseId) === f.course) && (x.title + x.content).toLowerCase().includes((f.q || "").toLowerCase()));
  n.sort((a, b) => b.created.localeCompare(a.created));
  return head("Notes", isTeacher ? "Publish revision notes for your courses." : "Revision notes from your faculty.", isTeacher ? `<button class="btn btn-primary" data-act="note-add">New note</button>` : "") + `
  <div class="toolbar"><input class="input" placeholder="Search notes" value="${h(f.q)}" data-filter="notes.q" aria-label="Search notes"><select class="input" data-filter="notes.course" aria-label="Course"><option value="">All courses</option>${(isTeacher ? db.courses.filter((c) => c.teacherId === u.id) : db.courses).map((c) => `<option value="${c.id}" ${f.course === String(c.id) ? "selected" : ""}>${h(c.code)}</option>`).join("")}</select></div>
  <div class="grid g2">${n.length ? n.map((x) => `<article class="card"><p>${tag(course(x.courseId)?.code || "", "orange")}<small style="color:var(--muted)">${fmtDate(x.created)} · ${h(teacher(x.teacherId)?.name)}</small></p><h3 style="margin-top:10px">${h(x.title)}</h3><p style="color:var(--muted);margin-bottom:14px">${h(x.content)}</p><div class="acts" style="display:flex;gap:6px;flex-wrap:wrap">${x.url ? `<a class="btn btn-sm btn-ghost" href="${h(x.url)}" target="_blank" rel="noopener noreferrer">Read more</a>` : ""}${isTeacher ? `<button class="btn btn-sm btn-ghost" data-act="note-edit" data-id="${x.id}">Edit</button><button class="btn btn-sm btn-danger" data-act="note-del" data-id="${x.id}">Delete</button>` : ""}</div></article>`).join("") : `<div style="grid-column:1/-1">${empty("No notes yet", isTeacher ? "Publish your first note." : "Your faculty haven't posted notes for this filter.")}</div>`}</div>`;
}
const noteFields = () => [{ k: "courseId", label: "Course", type: "select", options: db.courses.filter((c) => c.teacherId === me().id).map((c) => [c.id, `${c.code} · ${c.name}`]) }, { k: "title", label: "Title", req: 1 }, { k: "content", label: "Content", type: "textarea", req: 1 }, { k: "url", label: "Reference link", type: "url" }];
Object.assign(ACTIONS, {
  "note-add": () => formModal({ title: "New note", fields: noteFields(), submit: "Publish", onSave: (d) => { if (!d.title.trim() || !d.content.trim()) return "Add a title and some content."; db.notes.push({ id: nextId("note"), teacherId: me().id, ...d, courseId: +d.courseId, created: today() }); save(); rerender(); toast("Note published"); } }),
  "note-edit": (id) => { const n = db.notes.find((x) => x.id === id); formModal({ title: "Edit note", fields: noteFields(), values: n, onSave: (d) => { Object.assign(n, d, { courseId: +d.courseId }); save(); rerender(); toast("Saved"); } }); },
  "note-del": (id) => confirmModal("Delete this note?", () => { db.notes = db.notes.filter((x) => x.id !== id); save(); rerender(); toast("Note deleted"); }),
});

function profilePage() {
  const u = me(), st = role() === "student";
  const bind = () => {
    $("#profForm").onsubmit = (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      if (!d.name.trim()) return ($("#pErr").textContent = "Name can't be empty.");
      const mail = d.email.trim().toLowerCase();
      if ([...db.students, ...db.teachers].some((x) => x !== u && x.email === mail)) return ($("#pErr").textContent = "That email is used by another account.");
      Object.assign(u, d, { email: mail }); if (st) { u.year = +d.year; u.semester = +d.semester; } save(); toast("Profile saved"); rerender();
    };
  };
  const html = head("Profile", "Keep your details up to date.") + `<div class="grid g2" style="align-items:start"><section class="card" style="text-align:center"><div class="avatar" style="width:96px;height:96px;font-size:2rem;margin:0 auto 14px">${h(initials(u.name))}</div><h3>${h(u.name)}</h3><p style="color:var(--muted)">${st ? h(u.code) + " · Year " + u.year + ", Sem " + u.semester : h(u.title)}</p><p>${h(u.dept)}</p></section>
  <form class="card" id="profForm"><h3>Edit details</h3>
    <div class="field"><label for="p1">Full name</label><input class="input" id="p1" name="name" value="${h(u.name)}"></div>
    <div class="field"><label for="p2">Email</label><input class="input" id="p2" name="email" type="email" value="${h(u.email)}"></div>
    <div class="field"><label for="p3">Department</label><input class="input" id="p3" name="dept" value="${h(u.dept)}"></div>
    ${st ? `<div class="row"><div class="field"><label for="p4">Year</label><select class="input" id="p4" name="year">${[1, 2, 3, 4].map((y) => `<option ${u.year === y ? "selected" : ""}>${y}</option>`).join("")}</select></div><div class="field"><label for="p5">Semester</label><select class="input" id="p5" name="semester">${[1, 2, 3, 4, 5, 6, 7, 8].map((y) => `<option ${u.semester === y ? "selected" : ""}>${y}</option>`).join("")}</select></div></div>
    <div class="row"><div class="field"><label for="p6">Phone</label><input class="input" id="p6" name="phone" value="${h(u.phone)}"></div><div class="field"><label for="p7">Address</label><input class="input" id="p7" name="address" value="${h(u.address)}"></div></div>` : `<div class="field"><label for="p8">Designation</label><input class="input" id="p8" name="title" value="${h(u.title)}"></div>`}
    <div class="field"><label for="p9">Bio</label><textarea class="input" id="p9" name="bio">${h(u.bio)}</textarea></div><div class="err" id="pErr" role="alert"></div><button class="btn btn-primary">Save changes</button></form></div>`;
  profilePage.bind = bind; return html;
}
function settingsPage() {
  settingsPage.bind = () => {};
  return head("Settings", "Make CampusHub feel like yours.") + `<div class="grid g2"><section class="card"><h3>Appearance</h3><div class="toolbar"><button class="btn ${db.settings.theme === "light" ? "btn-primary" : "btn-ghost"}" data-act="set-light">Light</button><button class="btn ${db.settings.theme === "dark" ? "btn-primary" : "btn-ghost"}" data-act="set-dark">Dark</button></div></section>
  <section class="card"><h3>Notifications</h3><label style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-act="notif" ${db.settings.notifications ? "checked" : ""}> Remind me about deadlines and events</label></section>
  <section class="card"><h3>Demo data</h3><p style="color:var(--muted);margin-bottom:12px">Everything is stored in this browser. Resetting restores the original demo accounts and removes your changes.</p><button class="btn btn-danger" data-act="reset">Reset demo data</button></section></div>`;
}
Object.assign(ACTIONS, {
  "set-light": () => { db.settings.theme = "light"; save(); rerender(); }, "set-dark": () => { db.settings.theme = "dark"; save(); rerender(); },
  notif: (_, el) => { db.settings.notifications = el.checked; save(); toast(el.checked ? "Reminders on" : "Reminders off"); },
  reset: () => confirmModal("Reset all demo data?", async () => { db = await seedDb(); save(); go(""); toast("Demo data restored"); }),
});

/* ───────── Teacher pages ───────── */
const teacherPages = { profile: profilePage, settings: settingsPage };
teacherPages.dashboard = () => {
  const u = me(), cs = db.courses.filter((c) => c.teacherId === u.id), ids = new Set(cs.map((c) => c.id));
  const students = new Set(db.enrollments.filter((e) => ids.has(e.courseId)).map((e) => e.studentId));
  const risk = [];
  cs.forEach((c) => db.enrollments.filter((e) => e.courseId === c.id).forEach((e) => { const a = attendanceFor(e.studentId, c.id); if (a.total && !a.ok) risk.push({ s: student(e.studentId), c, a }); }));
  risk.sort((a, b) => a.a.pct - b.a.pct);
  return head(`Welcome, ${h(u.name)}`, "Your courses, students and attendance risks.") + `
  <div class="grid g4 keep" style="margin-bottom:16px"><div class="stat c-violet"><b>${cs.length}</b><span>Courses</span></div><div class="stat c-cyan"><b>${students.size}</b><span>Students</span></div><div class="stat c-orange"><b>${db.notes.filter((n) => n.teacherId === u.id).length}</b><span>Notes published</span></div><div class="stat c-pink"><b>${risk.length}</b><span>Attendance alerts</span></div></div>
  <div class="grid g2" style="align-items:start"><section class="card"><h3>Your courses</h3><div class="list">${cs.map((c) => `<div class="item"><div class="grow"><h4>${h(c.name)}</h4><p>${h(c.code)} · ${db.enrollments.filter((e) => e.courseId === c.id).length} students</p></div></div>`).join("")}</div></section>
  <section class="card"><h3>Students below 75%</h3>${risk.length ? `<table><thead><tr><th>Student</th><th>Course</th><th>Attendance</th></tr></thead><tbody>${risk.map((r) => `<tr><td>${h(r.s.name)}</td><td>${h(r.c.code)}</td><td>${tag(r.a.pct + "%", "pink")}</td></tr>`).join("")}</tbody></table>` : empty("All clear", "Every student is at or above 75%.")}</section></div>`;
};
let attSel = { course: 0, date: today() };
teacherPages.attendance = () => {
  const u = me(), cs = db.courses.filter((c) => c.teacherId === u.id);
  if (!cs.find((c) => c.id === attSel.course)) attSel.course = cs[0]?.id || 0;
  const list = db.enrollments.filter((e) => e.courseId === attSel.course).map((e) => student(e.studentId));
  const status = (s) => db.attendance.find((a) => a.studentId === s.id && a.courseId === attSel.course && a.date === attSel.date)?.status || "present";
  teacherPages.attendance.bind = () => {
    $("#attCourse").onchange = (e) => { attSel.course = +e.target.value; rerender(); };
    $("#attDate").onchange = (e) => { attSel.date = e.target.value || today(); rerender(); };
    $("#attSave").onclick = () => {
      document.querySelectorAll("[data-sid]").forEach((b) => {
        const sid = +b.dataset.sid, st = b.dataset.st; let rec = db.attendance.find((a) => a.studentId === sid && a.courseId === attSel.course && a.date === attSel.date);
        if (rec) rec.status = st; else db.attendance.push({ id: nextId("attendance"), studentId: sid, courseId: attSel.course, date: attSel.date, status: st });
      }); save(); toast("Attendance saved");
    };
    document.querySelectorAll("[data-sid]").forEach((b) => (b.onclick = () => { const p = b.dataset.st === "present" ? "absent" : "present"; b.dataset.st = p; b.className = "toggle " + p; b.textContent = p === "present" ? "Present" : "Absent"; }));
    $("#attAll").onclick = () => document.querySelectorAll("[data-sid]").forEach((b) => { b.dataset.st = "present"; b.className = "toggle present"; b.textContent = "Present"; });
  };
  return head("Attendance", "Mark who was in class. Tap a status to flip it.") + `<div class="toolbar"><select class="input" id="attCourse" aria-label="Course">${cs.map((c) => `<option value="${c.id}" ${c.id === attSel.course ? "selected" : ""}>${h(c.code)} · ${h(c.name)}</option>`).join("")}</select><input class="input" id="attDate" type="date" value="${attSel.date}" max="${today()}" aria-label="Date"><button class="btn btn-ghost" id="attAll">Mark all present</button><button class="btn btn-primary" id="attSave">Save attendance</button></div>
  <div class="card"><table><thead><tr><th>Student</th><th>ID</th><th>Overall</th><th>Today</th></tr></thead><tbody>${list.map((s) => { const a = attendanceFor(s.id, attSel.course), st = status(s); return `<tr><td>${h(s.name)}</td><td>${h(s.code)}</td><td>${tag(a.pct + "%", a.ok ? "green" : "pink")}</td><td><button type="button" class="toggle ${st}" data-sid="${s.id}" data-st="${st}">${st === "present" ? "Present" : "Absent"}</button></td></tr>`; }).join("")}</tbody></table></div>`;
};
teacherPages.notes = () => notesPage(true);
teacherPages.resources = () => {
  const u = me(), q = (filters.fres.q || "").toLowerCase(), list = db.facultyResources.filter((r) => r.teacherId === u.id && (r.title + r.description).toLowerCase().includes(q));
  return head("Resources", "Share links, documents and videos with your students.", `<button class="btn btn-primary" data-act="fres-add">Publish resource</button>`) + `<div class="toolbar"><input class="input" placeholder="Search" value="${h(filters.fres.q)}" data-filter="fres.q" aria-label="Search"></div><div class="list">${list.length ? list.map((r) => resCard(r, courseLabel(r.courseId), `<button class="btn btn-sm btn-ghost" data-act="fres-edit" data-id="${r.id}">Edit</button><button class="btn btn-sm btn-danger" data-act="fres-del" data-id="${r.id}">Delete</button>`)).join("") : empty("Nothing published", "Publish a resource for your students.")}</div>`;
};
Object.assign(ACTIONS, {
  "fres-add": () => formModal({ title: "Publish resource", fields: resFields(true), submit: "Publish", onSave: (d) => { if (!d.title.trim()) return "Give it a title."; db.facultyResources.push({ id: nextId("fres"), teacherId: me().id, ...d, courseId: d.courseId ? +d.courseId : null }); save(); rerender(); toast("Resource published"); } }),
  "fres-edit": (id) => { const r = db.facultyResources.find((x) => x.id === id); formModal({ title: "Edit resource", fields: resFields(true), values: r, onSave: (d) => { Object.assign(r, d, { courseId: d.courseId ? +d.courseId : null }); save(); rerender(); toast("Saved"); } }); },
  "fres-del": (id) => confirmModal("Delete this resource?", () => { db.facultyResources = db.facultyResources.filter((x) => x.id !== id); save(); rerender(); toast("Resource deleted"); }),
});
teacherPages.events = () => {
  const list = [...db.events].sort((a, b) => a.date.localeCompare(b.date));
  return head("Events", "Create and manage campus events.", `<button class="btn btn-primary" data-act="ev-add">Create event</button>`) + `<div class="list">${list.map((e) => `<div class="item"><div class="grow"><h4>${h(e.title)}</h4><p>${fmtDate(e.date)} · ${h(e.time)} · ${h(e.location)}</p><p style="margin-top:6px">${tag(e.category, "pink")}<span>${db.registrations.filter((r) => r.eventId === e.id).length}${e.capacity ? " / " + e.capacity : ""} registered</span></p></div><div class="acts"><button class="btn btn-sm btn-ghost" data-act="ev-edit" data-id="${e.id}">Edit</button><button class="btn btn-sm btn-danger" data-act="ev-del" data-id="${e.id}">Delete</button></div></div>`).join("")}</div>`;
};
const evFields = [{ k: "title", label: "Title", req: 1 }, { k: "description", label: "Description", type: "textarea" }, { k: "location", label: "Location" }, { k: "date", label: "Date", type: "date", req: 1 }, { k: "time", label: "Time (e.g. 2:00 PM)" }, { k: "category", label: "Category", type: "select", options: ["Academic", "Workshop", "Technical", "Cultural", "Career"] }, { k: "capacity", label: "Capacity", type: "number", min: 1 }, { k: "organizer", label: "Organizer" }];
Object.assign(ACTIONS, {
  "ev-add": () => formModal({ title: "Create event", fields: evFields, submit: "Create", onSave: (d) => { if (!d.title.trim() || !d.date) return "Add a title and a date."; db.events.push({ id: nextId("event"), ...d, capacity: +d.capacity || 0 }); save(); rerender(); toast("Event created"); } }),
  "ev-edit": (id) => { const e = db.events.find((x) => x.id === id); formModal({ title: "Edit event", fields: evFields, values: e, onSave: (d) => { Object.assign(e, d, { capacity: +d.capacity || 0 }); save(); rerender(); toast("Saved"); } }); },
  "ev-del": (id) => confirmModal("Delete this event?", () => { db.events = db.events.filter((x) => x.id !== id); db.registrations = db.registrations.filter((r) => r.eventId !== id); save(); rerender(); toast("Event deleted"); }),
});

/* ───────── Help, Privacy, Terms ───────── */
const FAQ = [
  ["What is the 75% attendance rule?", "Most courses require you to attend at least 75% of classes. The Attendance page shows how many more classes you can miss, or must attend in a row, to stay eligible."],
  ["Who can see my personal study resources?", "Only you. Faculty resources are published by teachers and visible to everyone; the \"My study resources\" shelf is private to your account."],
  ["I forgot my password. What now?", "This demo stores accounts in your browser, so use Settings → Reset demo data to restore the sample accounts, or create a new student account."],
  ["How do I use the AI Companion?", "Tap the rainbow button in the corner and ask anything: a study plan for this week, a topic explained, or what to do first."],
  ["Which browsers work best?", "Any current version of Chrome, Edge, Firefox or Safari."],
];
const docBody = {
  help: () => `<h1>Help &amp; Support</h1><p style="color:var(--muted);margin:8px 0 24px">Quick answers to common questions.</p>${FAQ.map(([q, a]) => `<details class="card" style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:700">${h(q)}</summary><p style="margin-top:10px;color:var(--muted)">${h(a)}</p></details>`).join("")}<p style="margin-top:24px">Still stuck? Email <a href="mailto:support@campushub.example" style="color:var(--violet);font-weight:700">support@campushub.example</a>.</p>`,
  privacy: () => `<h1>Privacy Policy</h1><p style="color:var(--muted);margin:8px 0 24px">Last updated ${new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>${[
    ["What we store", "Your name, email, student details, tasks, resources and settings. In this demo everything is saved only in your own browser and is never sent to a server."],
    ["AI Companion", "When you send a message, the text and a short summary of your tasks, events and attendance are sent to an AI provider to generate a reply. Don't share anything you wouldn't want processed this way."],
    ["Your choices", "You can edit your profile at any time and remove all data with Settings → Reset demo data, or by clearing this site's data in your browser."],
    ["Contact", "Questions about privacy? Email support@campushub.example."]].map(([t, p]) => `<h3 style="margin:22px 0 6px">${t}</h3><p style="color:var(--muted);max-width:70ch">${p}</p>`).join("")}`,
  terms: () => `<h1>Terms &amp; Conditions</h1><p style="color:var(--muted);margin:8px 0 24px">By using CampusHub you agree to the following.</p>${[
    ["Use of the service", "CampusHub is a demonstration portal for managing academic tasks, events, attendance and resources. Use it respectfully and only with accurate information."],
    ["Accounts", "You're responsible for keeping your password safe and for activity under your account."],
    ["Content", "You own the content you add. Don't upload anything unlawful, harmful or that infringes someone else's rights."],
    ["AI answers", "AI Companion can make mistakes. Check important facts, deadlines and academic rules with your institution."],
    ["No warranty", "The service is provided as is, without guarantees of availability or accuracy."]].map(([t, p]) => `<h3 style="margin:22px 0 6px">${t}</h3><p style="color:var(--muted);max-width:70ch">${p}</p>`).join("")}`,
};
const docPages = { help: docBody.help, privacy: docBody.privacy, terms: docBody.terms };
function publicDoc(r) {
  return `<header class="nav"><a href="#/">${logo()}</a><div class="nav-actions"><a class="btn btn-ghost btn-sm" href="#/login">Log in</a><a class="btn btn-primary btn-sm" href="#/join">Join free</a></div></header><main class="section" style="max-width:860px">${docBody[r]()}</main>${footer()}`;
}

/* ───────── AI Companion ───────── */
const chat = [{ role: "assistant", content: "Hi! I'm your AI Companion. Ask me for a study plan, help with a topic, or what to tackle first." }];
function portalContext() {
  const u = me(); if (!u) return "";
  if (role() === "teacher") return `Role: teacher ${u.name}. Courses: ${db.courses.filter((c) => c.teacherId === u.id).map((c) => c.code + " " + c.name).join("; ")}.`;
  const open = db.tasks.filter((t) => t.studentId === u.id && t.status !== "completed").map((t) => `${t.title} (${t.subject}, due ${t.due}, ${t.priority})`);
  const att = myCourses(u.id).map((c) => { const a = attendanceFor(u.id, c.id); return `${c.code} ${a.pct}%`; });
  const ev = db.registrations.filter((r) => r.studentId === u.id).map((r) => db.events.find((e) => e.id === r.eventId)).filter(Boolean).map((e) => `${e.title} on ${e.date}`);
  return `Role: student ${u.name}. Today: ${today()}. Open tasks: ${open.join("; ") || "none"}. Attendance: ${att.join(", ")}. Registered events: ${ev.join("; ") || "none"}.`;
}
function offlineReply(q) {
  const u = me(), s = q.toLowerCase();
  if (u && role() === "student") {
    if (/task|due|assign|homework|first/.test(s)) { const t = db.tasks.filter((x) => x.studentId === u.id && x.status !== "completed").sort((a, b) => (a.due || "9").localeCompare(b.due || "9")); return t.length ? "Start with: " + t.slice(0, 3).map((x) => `${x.title} (due ${fmtDate(x.due)})`).join(", then ") + "." : "You have no open tasks. Nice work!"; }
    if (/attend|75|miss|bunk/.test(s)) return myCourses(u.id).map((c) => { const a = attendanceFor(u.id, c.id); return `${c.code}: ${a.pct}% — ${a.ok ? "can miss " + a.canMiss : "attend next " + a.need}`; }).join("\n");
    if (/event|hackathon|workshop/.test(s)) return db.events.filter((e) => e.date >= today()).slice(0, 3).map((e) => `${e.title} on ${fmtDate(e.date)}`).join("\n");
  }
  return "";
}
function mountAI() {
  document.getElementById("aiRoot")?.remove();
  const root = document.createElement("div"); root.id = "aiRoot";
  root.innerHTML = `<button class="ai-fab" aria-label="Open AI Companion" aria-expanded="false">${icon("spark", 28, "#fff")}</button>
  <section class="ai-panel" aria-label="AI Companion"><div class="ai-head"><div><h3>AI Companion</h3><small>Study help, on demand</small></div><button aria-label="Close" data-x>×</button></div>
  <div class="ai-log" aria-live="polite"></div><div class="ai-suggest">${["Plan my week", "What should I do first?", "Explain deadlocks"].map((s) => `<button class="chip" data-s="${s}">${s}</button>`).join("")}</div>
  <form class="ai-form"><input class="input" placeholder="Ask anything…" aria-label="Message" maxlength="500" autocomplete="off"><button class="btn btn-primary btn-sm">Send</button></form></section>`;
  document.body.appendChild(root);
  const panel = $(".ai-panel", root), log = $(".ai-log", root), fab = $(".ai-fab", root), inp = $("input", root);
  const draw = () => { log.innerHTML = chat.map((m) => `<div class="msg ${m.role === "user" ? "me" : "bot"}">${h(m.content)}</div>`).join(""); log.scrollTop = log.scrollHeight; };
  const toggle = (o) => { panel.classList.toggle("open", o); fab.setAttribute("aria-expanded", o); if (o) { draw(); inp.focus(); } };
  fab.onclick = () => toggle(!panel.classList.contains("open"));
  $("[data-x]", root).onclick = () => toggle(false);
  async function send(text) {
    text = text.trim(); if (!text) return; chat.push({ role: "user", content: text }); chat.push({ role: "assistant", content: "Thinking…" }); draw();
    let reply;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: chat.slice(0, -1).filter((m) => m.content !== "Thinking…"), context: portalContext() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "unavailable");
      reply = data.reply;
    } catch (err) {
      const local = offlineReply(text);
      reply = (local ? local + "\n\n" : "") + `(AI Companion is offline: ${err.message === "unavailable" || err.message === "Failed to fetch" ? "the /api/chat service isn't reachable here" : err.message})`;
    }
    chat[chat.length - 1] = { role: "assistant", content: reply }; draw();
  }
  $("form", root).onsubmit = (e) => { e.preventDefault(); const v = inp.value; inp.value = ""; send(v); };
  root.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => send(b.dataset.s)));
}

/* ───────── Boot ───────── */
function fail(err) {
  console.error(err);
  const a = document.getElementById("app");
  if (a) a.innerHTML = `<div style="max-width:560px;margin:12vh auto;padding:24px;font-family:system-ui;line-height:1.5"><h1 style="font-size:1.6rem">CampusHub couldn't start</h1><p style="margin:10px 0">${h(err && err.message || err)}</p><button onclick="try{localStorage.removeItem('${KEY}')}catch(e){};location.hash='';location.reload()" style="padding:10px 18px;border-radius:99px;border:0;background:#6d4aff;color:#fff;font-weight:700;cursor:pointer">Clear saved data and reload</button></div>`;
}
window.addEventListener("hashchange", () => { try { render(); } catch (e) { fail(e); } });
load().then(() => { render(); window.__chBooted = true; }).catch(fail);
})();
