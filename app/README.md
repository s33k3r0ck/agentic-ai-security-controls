# `app/` — the interactive checklist reader (developer guide)

A self-contained, **offline** reader for **Agentic AI Security Controls** (the
canonical *Secure SDLC and Hardening Checklist for Agentic Systems*). No build
step, no server, no network: open `checklist.html` in any browser and it runs. This document is for people **editing the app or the data**. For the
end-user feature tour and the project overview, see the root [`README.md`](../README.md).

## Files and roles

| File | Role | Hand-edited? |
| --- | --- | --- |
| `data.js` | **Single source of truth** for control data (`window.CHECKLIST.controls`) and the AGT risk model (`window.CHECKLIST.agt`). | Yes — edit here. |
| `checklist.js` | Reader logic: filtering, grouping, topological step-order, status marking, per-control notes, Save/Load assessment JSON, Excel export, navigation, AGT legend. | Yes. |
| `checklist.css` | Styles and design tokens; light/dark via `prefers-color-scheme`. | Yes. |
| `checklist.html` | Page shell + the legend/glossary; loads the three files above. | Yes (the AGT grid is rendered from `data.js`; the rest of the legend is static prose). |
| `../build.js` | Regenerates the generated regions of `../docs/checklist.md` from `data.js`. | n/a (run it; don't edit output). |

`checklist.html` loads them in order:

```html
<link rel="stylesheet" href="checklist.css">
...
<script src="data.js"></script>      <!-- defines window.CHECKLIST -->
<script src="checklist.js"></script> <!-- reads window.CHECKLIST, renders -->
```

Because everything is a plain `<script>`/`<link>` with relative paths and inline
SVG icons, the page works from a `file://` URL with **zero CDN or network
requests**. Keep the four files in the same directory.

## Data flow / source of truth

```
        app/data.js  (window.CHECKLIST.controls + .agt — hand-edited)
          │
          ├── <script> ─────────────► app/checklist.html  (live reader; no build)
          │
          └── node build.js ────────► docs/checklist.md
                                        (Section 8 tables, Appendix E graph,
                                         Section 4 + Appendix D AGT tables,
                                         Appendix F framework crosswalk —
                                         inside GENERATED markers only)
```

There is **one** source of truth: `data.js`. The reader consumes it directly at
page load. The Markdown document is a *generated view* of the same data — never
hand-edit the generated regions; edit `data.js` and run `node build.js`.

## The control data model (`data.js`)

`window.CHECKLIST.controls` is an array of 114 control objects. Every control has
**exactly these nine fields** (no others; all always present):

| Field | Type | Meaning / allowed values |
| --- | --- | --- |
| `id` | string | Unique control ID, `PREFIX-NN`, e.g. `GOV-01`, `DATA-05`. The prefix is one of the 21 ID-prefixes (GOV, ARCH, COMP, TOOL, ID, PROMPT, DATA, RAG, MEM, OUT, CODE, A2A, HITL, RES, CPS, OPS, SUP, TEST, CHG, IR, DEC). |
| `family` | string | One of the **13** display family names (below). Several ID-prefixes can map to one family. This is the grouping used by the reader's family view and by the Section 8 tables. |
| `profile` | string | Applicability profile. One of 7 values: `Core`, `Tool-Using`, `Tool-Using (Code Exec)`, `RAG / Memory`, `Multi-Agent`, `Regulated`, `Cyber-Physical`. |
| `control` | string | Short imperative statement of the control ("Assign owners."). |
| `pass` | string | Pass criteria — what "done with evidence" looks like. |
| `evidence` | string | What artifact proves it. |
| `risk` | string | Usually comma-separated `AGT-NN` risk IDs (`AGT-01`..`AGT-15`), e.g. `"AGT-13, AGT-14"` — the reader resolves each token to a tooltip via its `AGT` map. **10 controls use a catch-all instead:** the literal `"All"` (GOV-04, ARCH-01, TEST-01, CHG-01, IR-03, IR-04) or `"AGT-01 through AGT-15"` (TEST-02–TEST-05); those don't resolve to per-token tooltips. Account for both forms if you parse this field. |
| `dependsOn` | string[] | IDs of prerequisite controls (may be empty `[]`). Must reference existing IDs; the graph must stay acyclic. |
| `floor` | boolean | `true` ⇒ part of the Non-Waivable Release Floor (21 controls). |

`affects` (the inverse of `dependsOn`) is **derived, never stored** — both the
reader and `build.js` compute it at load. Do not add it to `data.js`.

The **13 `family` values** (with control counts at time of writing):
`Governance` · `Architecture` · `Compliance` · `Tools and Agency` ·
`Identity and Privilege` · `Prompt Injection and Context` ·
`Data, RAG, and Memory` · `Output and Code Execution` ·
`Agent-to-Agent and Multi-Agent` · `Human Oversight` ·
`Resource Control and Cyber-Physical Safety` · `Operations and Audit` ·
`Supply Chain, Testing, Change, and Decommissioning`.

> Note the `family` vs ID-prefix distinction: e.g. `DATA-*`, `RAG-*`, and `MEM-*`
> IDs all live in the single `"Data, RAG, and Memory"` family. The root README and
> CHANGELOG phrase this as "13 control families / 21 ID prefixes": the 13 families are
> the table sections (one per family); the 21 are the ID prefixes that map onto them.

### The AGT risk model (`window.CHECKLIST.agt`)

The `AGT-01`..`AGT-15` risk taxonomy is defined **once**, as a second top-level key
in `data.js`. It is the single source for the reader's risk tooltips, the in-page
legend grid (`#agtlegend`), and — via `build.js` — the Section 4 crosswalk table and
the Appendix D quick reference in `docs/checklist.md`. Each entry is keyed by
`AGT-NN` with four required string fields:

| Field | Meaning |
| --- | --- |
| `name` | Risk-family name (e.g. "Tool misuse and unsafe agency"). |
| `failure` | One-line failure mode. |
| `owaspAgentic` | OWASP Agentic crosswalk — comma-separated `T1`–`T17` tokens. |
| `owaspLlm` | OWASP LLM Top 10 crosswalk — comma-separated `LLM01`–`LLM10`, or `Cross-cutting`. |

`build.js` checks that every `risk` token used by a control resolves to a key here
(the `All` / `AGT-01 through AGT-15` catch-alls are allowed), so a typo'd `AGT-99`
fails the build.

### External-framework crosswalk (`frameworks` / `sources` / `familySources` / `mappings`)

Four more top-level keys in `data.js` (siblings of `controls` and `agt`) drive the
per-control crosswalk to external AI-security frameworks (docs Appendix F + the reader's
expanded row):

- **`frameworks`** — metadata for each framework, each with a `status`: `derived` (OWASP
  Agentic / OWASP LLM, computed from the control's AGT risks; source refs, from
  `familySources`) or `grounded` (MITRE ATLAS, stored in `mappings`, checked against the
  ATLAS catalog). NIST AI RMF / ISO 42001 / CSA AICM and AIVSS are intentionally not
  carried (empty compliance placeholders add no value; see the note in `data.js`).
- **`sources`** — the five NotebookLM source PDFs keyed by short id.
- **`familySources`** — ID-prefix → source ids (the grounded Appendix B family guide);
  per-control source refs derive from this via the control's prefix.
- **`mappings`** — sparse map of control id → `{ atlas: [AML.Txxxx, …] }`. Only controls
  with at least one mapping appear; ATLAS ids are format-validated (`AML.TXXXX[.XXX]`).

`build.js` validates these (unknown control ids, unknown framework keys, bad ATLAS id
format, dangling source refs, missing ID-prefix entries) and regenerates the Appendix F
table. OWASP and source refs are **derived, never stored** — like `affects`.

## How the reader works (`checklist.js`)

The script is one IIFE. Key mechanics:

- **Profile chips** — six buttons (`GROUPS`): `Core`, `Tool-Using`, `RAG / Memory`,
  `Multi-Agent`, `Regulated`, `Cyber-Physical`. `pg(profile)` collapses any
  `Tool-Using*` value (including `Tool-Using (Code Exec)`) onto the single
  `Tool-Using` chip, so the 7 data values map to 6 chips. A control is visible
  only if the chip for its `pg(profile)` is active.
- **Derived `affects`** — built once from every control's `dependsOn` (inverse
  map), then sorted.
- **Topological level / step order** — `lvl(id)` = `0` for a control with no
  prerequisites, else `max(lvl(dep)) + 1`. Memoized in `level{}`. Drives the
  **Step order** view: step 1 = no prerequisites, each later step depends only on
  earlier ones. Relies on the graph being acyclic.
- **Two render modes (`mode`)** — `'fam'` (group by `family`) and `'dep'` (**default**,
  group by `Step N`). Toggled by the **Step order** button (on at load).
- **`vis()`** — the visible set: active profile ∧ (`!floorOnly` ∨ `floor`) ∧
  search match. Search (`q`) matches against `id + control + pass + evidence`.
- **Navigation (`jump`)** — clicking a depends-on/affects chip re-enables whatever
  filter is hiding the target (its profile chip, floor-only, search), expands it,
  and scroll-highlights it.
- **Click delegation** — one listener on the list handles: `.lnk` (jump), `.st`
  (cycle status), `.rh` (toggle row expand), `.fam` (collapse/expand a group).
- **AGT legend + tooltips from data** — at load the reader builds its `AGT` id→name
  map and fills the `#agtlegend` grid from `window.CHECKLIST.agt`. Nothing about the
  risk model is hardcoded in `checklist.js` or `checklist.html` anymore.
- **External-framework crosswalk** — the expanded row renders a **Frameworks** block:
  OWASP Agentic / OWASP LLM (`deriveOwasp()` from the control's AGT risks), MITRE ATLAS
  (`atlasOf()` from `window.CHECKLIST.mappings`), and source refs (`srcRefs()` from
  `familySources`). The Excel export adds the same as four trailing columns (after
  `Affects`, so the status column stays `B`).
- **Excel export** — the **Export Excel** button downloads the current filtered view
  as a self-contained `.xlsx` workbook. The generator lives in `checklist.js` and
  writes the OpenXML worksheet, styles, metadata, and ZIP container in-browser, so it
  keeps the offline/no-dependency contract.

### Fill-in state and the assessment file (Save / Load)

Per-control assessment lives in plain JS variables inside the IIFE and is **not
auto-persisted** — there is no `localStorage` and no backend. You **Save** it to a
JSON file and **Load** it back:

- `active{}` — which profile chips are on.
- `q`, `floorOnly`, `mode` — search text, floor filter, view mode.
- `status{}` — per-control status. The clickable cycle is
  `STATES = ['', 'Pass', 'Fail', 'Partial', 'N/A']`; cycling back to `''` deletes the
  key. **`Accepted Risk` is intentionally not in the clickable cycle** (it requires an
  owner/expiry/compensating control recorded out-of-band, so it is a document/process
  status, not a click — record it in the note). It is, however, a **first-class loaded
  status**: `Load` accepts the full documented 5-status model — `Pass` · `Fail` ·
  `Partial` · `N/A` (with `Not Applicable` normalized to `N/A`) · `Accepted Risk` (via
  the `LOADST` map) — and preserves/re-emits `Accepted Risk`, rendering it as a
  non-clickable info-colored pill (`.st.ar`). Only statuses outside that set are dropped
  (counted as "invalid status ignored"). A loaded `Accepted Risk` on a **Release-Floor**
  control (`floor: true`) is also dropped — its note kept, reported as "Accepted Risk on
  floor (dropped)" — because the hard-floor rule forbids waiving floor controls. The pill
  label is `esc()`-escaped.
- `notes{}` — per-control free-text note / evidence reference, edited in a
  `<textarea>` in the expanded row. The `input` handler updates `notes{}` **without
  re-rendering** (so the textarea keeps focus and caret while you type) and only
  refreshes the status line; the row's header note badge updates on the next render.
- `dirty` — set on any status/note edit, cleared on Save or Load. Drives the
  `● unsaved` status-line marker and a `beforeunload` prompt so closing the tab with
  unsaved work warns first.
- `expanded{}`, `famCol{}` — per-row expand and per-group collapse.

**Save** (`#clsave`) serializes every filled-in control via `buildAssessment()` and
triggers a `Blob` download named `agentic-ai-security-controls-assessment-YYYY-MM-DD.json` (offline —
`URL.createObjectURL`, no network). **Load** (`#clload` → hidden `#clfile`) reads the
file with `FileReader`, parses it, and **replaces** the current state (with a confirm
if there are unsaved changes). **Clear** (`#clclear`) wipes all statuses and notes
after a confirm. Transient results show in `#clmsg`.

The assessment JSON is **separate from `data.js`** — `data.js` is the control
*template*; the file you Save is the *filled-in record*. Its shape:

```json
{
  "schema": "agentic-ai-security-controls-assessment",
  "version": 1,
  "checklist": "Canonical v1.0",
  "savedAt": "2026-06-19T12:00:00.000Z",
  "count": 2,
  "entries": {
    "GOV-01": { "status": "Pass", "note": "owner: sec; see runbook" },
    "DATA-05": { "status": "Partial", "note": "ticket #42" }
  }
}
```

Only controls with a non-empty status or note are emitted, ordered by data order
(unknown IDs last) for stable diffs. On Load, each entry is validated: a status
outside the documented vocabulary is dropped while its note is kept, and an entry
whose control ID is not in the current checklist is still kept in memory and re-saved —
so loading an assessment made against a different `data.js` never silently drops your
data (the load message reports how many matched, how many are for unknown IDs, and how
many invalid statuses were ignored). The lookup maps (`status`, `notes`, `byId`, `idx`,
and the load temporaries) are `Object.create(null)` so a malformed file can't smuggle
inherited names like `__proto__` / `constructor` into the match counts or the export
order. Load also accepts a bare `{ "ID": {…} }` map with no wrapper, but rejects a JSON
object that has a `schema` key without `entries`, an array, or an array-valued
`entries` (so it won't try to ingest, e.g., a `data.js` dump). The read itself is
guarded too: a `FileReader` error surfaces via the same message line.

The reader is a convenience for walking the list and recording a pass; the **Saved
JSON file — not the browser tab — is the artifact you keep**. For a regulated system,
fold it into your evidence package.

The Excel export is a reporting/review view of the current in-browser assessment,
not the canonical system of record. It includes active filters, current statuses,
notes, floor flags, step numbers, control text, evidence criteria, risks, and
dependency links. It highlights Non-Waivable Release Floor controls, filled status
or note rows, and status values (`Pass`, `Fail`, `Partial`, `N/A`, `Accepted Risk`);
the exported Status column keeps an Excel dropdown plus conditional formatting for
later edits.

## The build step (`build.js`)

`node build.js` (Node, no dependencies) first **validates** `data.js` (see
[Gotchas](#gotchas--what-buildjs-checks-vs-what-is-on-you) — aborts on any error
without writing), then regenerates **only** the marked regions of `docs/checklist.md`:

1. **Section 8 control tables** — grouped by `family` in data order, six columns
   (ID · Profile · Control · Pass criteria · Evidence · Risk). Spliced between
   `<!-- BEGIN GENERATED:controls ... -->` and `<!-- END GENERATED:controls -->`.
2. **Appendix E dependency graph** — edge count, the foundational (no-dependency)
   roots, the six most-depended-on controls by fan-out, and the full
   ID / Depends-on / Affects table. Spliced inside the `GENERATED:depgraph` markers.
3. **Section 4 risk-model crosswalk** and **Appendix D quick reference** — both AGT
   tables, regenerated from `window.CHECKLIST.agt`. Spliced inside the
   `GENERATED:riskmodel` and `GENERATED:riskref` markers.
4. **Appendix F framework crosswalk** — the per-control external-framework table (OWASP
   derived from AGT risks, MITRE ATLAS from `window.CHECKLIST.mappings`). Spliced inside
   the `GENERATED:crosswalk` markers.

The controls and dependency-graph regions are located by heading anchors in
`docs/checklist.md` (the Section 8 note sentence, `## 9. Waivers and Severity`,
`## Appendix E …`); the two AGT regions and the Appendix F crosswalk are located by their
explicit `BEGIN`/`END` markers. If you rename those headings or drop a marker, update `build.js` — it throws
rather than guessing. Everything outside the markers (prose, gates, and the non-AGT
legend content) is hand-maintained.

Run it after **any** edit to `data.js`, then commit `data.js` and the regenerated
`docs/checklist.md` together. The round-trip is byte-stable: re-running with no
data change produces no diff.

## How to extend

**Add a control:** append an object to `window.CHECKLIST.controls` in `data.js`
with all nine fields. Use an existing `family`/`profile` value, point `dependsOn`
at real IDs without creating a cycle, set `floor` true/false. Run `node build.js`.
The reader picks it up on the next page load automatically.

**Add a field:** add it in `data.js`, then teach `checklist.js` to render it
(e.g. in `rowHtml`) and, if it should appear in the Markdown, extend `build.js`'s
table generation. Keep `affects` derived — don't store it.

**Add a `profile` value:** if it's a new top-level profile, add it to `GROUPS` and
`PROFW` in `checklist.js` (both live there — there is no `PROFW` in `data.js`), add
a row to the root README's profile table and to the HTML legend. If it's a
`Tool-Using` sub-variant, `pg()` already folds it onto the `Tool-Using` chip — just
add it to `PROFW` in `checklist.js`.

**Add a `family`:** new `family` strings appear as new groups automatically in
both the reader and the Section 8 tables (data order). Add the prefix to the HTML
legend's family list.

**Add or edit an AGT risk:** edit `window.CHECKLIST.agt` in `data.js` (all four
fields). Run `node build.js` — it regenerates the Section 4 and Appendix D tables and
rejects any control whose `risk` references an unknown id. The reader's tooltips and
legend grid update on the next page load; no other file needs touching.

After any structural change, keep the docs in sync: reflect it in the root
`README.md` and this file, and regenerate `docs/checklist.md` with `node build.js`.

## Gotchas — what `build.js` checks vs. what is on you

`node build.js` **validates `app/data.js` and aborts** (non-zero exit, nothing
written) on any of the following — so run it after every edit. `validate` is exported
for reuse in a pre-commit hook or CI: `require('./build.js').validate(controls, agt)`.

- Missing or mis-typed fields — the nine fields must be present, `dependsOn` an array,
  `floor` a boolean.
- Duplicate `id`s.
- `dependsOn` that references a non-existent control (dangling edge).
- Dependency **cycles** (the error names the cycle path).
- A pipe, newline, or tab in any string field — these would silently corrupt the
  generated Markdown tables, so the build rejects them rather than emitting bad tables.
- A malformed AGT entry, or a `risk` token that doesn't resolve to a known `AGT-NN`
  (the `All` / `AGT-01 through AGT-15` catch-alls are allowed).

The **live reader does not run this check** — `lvl()` in `checklist.js` only guards a
direct self-loop (`d !== id`), and the browser will render a dangling or cyclic graph
with wrong step levels and no error. The validation lives in `build.js`, so the loop
is: edit `data.js` → `node build.js` (validate, then regenerate). A JS syntax error in
`data.js` is caught even earlier — it makes the `require` in `build.js` throw.

**Still on you (not checked by anything):**

- **Data order is load-bearing.** Section 8 tables and the reader's family view group
  by `family` **in data order** and list rows in array order (no sort). Append a new
  control next to its family siblings; a control whose `family` first appears late in
  the array will render its whole family group late. The byte-stable round-trip only
  holds while data order is unchanged — reordering also changes Appendix E's
  "most depended-on" line, which ties fan-out breaks by data-order index.
- **Remaining hand-synced legend content.** The AGT risk model is now single-sourced
  from `data.js` (tooltips, the `#agtlegend` grid, and both MD tables all derive from
  it). But the rest of the `checklist.html` legend is still hardcoded there only: the
  21 ID-prefixes, autonomy levels A0–A3, the T1–T17 / LLM01–LLM10 note, and the
  acronym glossary. Those are not derived from `data.js` — keep them current by hand.

## Local development

- **Run:** double-click `checklist.html`, or `open app/checklist.html`. No server
  needed.
- **Build:** `node build.js` (any recent Node; no `npm install`). It resolves paths
  via `__dirname`, so it runs from any working directory; the script lives at the
  repo root.
- **Conventions:** documentation is **English only**. Treat
  AI-synthesized control text as untrusted; verify high-stakes controls against the
  primary sources before relying on them.
