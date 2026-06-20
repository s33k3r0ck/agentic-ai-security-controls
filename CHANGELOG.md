# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) keyed
to the control set (see "Versioning" in the [README](README.md)).

## [Unreleased]

## [1.1.1] - 2026-06-21

Patch release — **control IDs unchanged** (still 114 controls / 21 Release Floor). Hardens the
evidence-package templates after a full fill-through against a realistic system, and adds the
page/DOM/serialized-client-context channel to ARCH-02.

### Changed

- **Evidence-package templates hardened** — every one of the 23 `templates/` files was filled
  end-to-end against a realistic bank-chatbot fixture (single customer-facing agent; high-risk
  actions drafted by the agent but executed out-of-band behind step-up auth; durable per-customer
  memory; a shared, customer-data-free RAG corpus; an inline input/output guard layer; regulated
  EU deployment) to find where a template could not faithfully capture what its backed controls
  require. The resulting body edits (no control-ID or structural changes) close literal
  pass-criteria omissions and add consistent guidance for four recurring patterns:
  - **Literal pass-criteria fields** now present: `agent-registry.csv` `profile`;
    `tool-inventory.csv` `sink_type` / `execution_type` / `gate_mechanism`;
    `agentic-log-standard.md` `policy_decision` / `confidence` / `output`; an Approvals/HITL-gate
    node in `agent-data-flow.md`; `tool output` + `A2A` quarantine rows in `incident-runbook.md`;
    a CPS-04 applicability block and a safe-restore check in `kill-switch-drill.md`; COMP-01
    lawful-basis and breach-notification rows in `use-case-intake.md`; a `source_version` field in
    `rag-source-registry.csv`.
  - **Inline guard / firewall layer** — a place to record enforce-vs-monitor mode per environment
    and the "guard blocks but the UI shows success" discrepancy, framed as a compensating control,
    not a replacement for server-side authorization.
  - **Action gates outside the agent** — draft/propose-only actions name where the real
    out-of-band execution gate lives (e.g. step-up auth), rather than a bare Yes/No.
  - **Isolation boundary** — name the real boundary (tenant / per-customer / per-user); single-tenant
    systems are often still multi-customer.
  - **Page/DOM/serialized client context** treated as an attacker-forgeable untrusted channel across
    the threat-model, data-flow, intake, and logging templates.
- **ARCH-02 pass criteria** now list **page/DOM/serialized client context** among the inputs that must
  be labeled untrusted (regenerated into `docs/checklist.md`).

## [1.1.0] - 2026-06-20

Minor release — **control IDs unchanged** since 1.0.0. Adds evidence-package templates and
the per-control external-framework crosswalk (Appendix F), re-grounds the MITRE ATLAS mapping
against catalog v2026.05, and lands reader/tooling and documentation fixes.

### Added

- **Evidence-package templates** — a new `templates/` directory with a guided, fill-in
  template for each of the 23 evidence artifacts named in `docs/checklist.md` §10 (intake
  record, threat model, tool inventory, permission matrix, AIBOM, red-team results,
  kill-switch drill, decommissioning playbook, …). Each carries a header block (controls
  backed, SDLC gate, family), fill-in placeholders, and inline guidance. The artifact list
  is a new `app/data.js` key (`window.CHECKLIST.templates`) that drives a generated §10
  table, a generated `templates/README.md` index, and a per-control **Evidence templates**
  block in the reader's expanded row; `build.js` validates the list and asserts every
  template file exists in `templates/`.

- **Per-control external-framework crosswalk** — a new **Appendix F** in `docs/checklist.md`,
  framework chips in the reader's expanded row, and four columns in the Excel export.
  OWASP Agentic (`T1`–`T17`) and OWASP LLM (`LLM01`–`LLM10`) are derived from each control's
  AGT risks; **MITRE ATLAS** techniques (`AML.Txxxx`, catalog v2026.05) are grounded per control
  where applicable (79 of 114 controls); per-control **source references** are derived from
  the Appendix B family guide. (NIST AI RMF / ISO 42001 / CSA AICM and AIVSS are deliberately
  not carried as empty placeholders — an accurate standard mapping is a separate, deliberate
  effort.) Backed by new `app/data.js` keys (`frameworks`, `sources`,
  `familySources`, `mappings`) validated by `build.js`; OWASP and source refs are derived,
  not stored.

### Fixed

- **MITRE ATLAS crosswalk re-grounded against catalog v2026.05** (was v5.4.0, Feb 2026), which
  added the agentic-attack technique cluster (`AML.T0080`–`AML.T0112`). 42 controls re-mapped and
  2 removed (79 mapped, down from 81); every id re-validated against the authoritative 2026.05
  catalog. Notable corrections: `DATA-05` no longer maps to `AML.T0020` (Poison Training Data — a
  poisoning-integrity technique unrelated to the control's sensitive-data governance) → `AML.T0024`;
  all six `MEM-*` controls move off generic `AML.T0070`/`AML.T0036` onto the precise
  `AML.T0080.000` (AI Agent Context Poisoning: Memory); tool/data exfiltration controls
  (`ARCH-05`, `TOOL-02`/`05`, `DATA-02`/`03`, `OPS-04`) move from the over-broad
  `AML.T0024`/`AML.T0025` to `AML.T0086` (Exfiltration via AI Agent Tool Invocation) /
  `AML.T0085` (Data from AI Services); `OUT-02`/`03` drop the ill-fitting `AML.T0067` for
  `AML.T0077` (LLM Response Rendering); `TEST-03`/`04` drop `AML.T0042` (an adversary-side
  technique no defensive measurement control mitigates). `CHG-03` keeps `AML.T0051`/`T0054`
  (its build gate runs a red-team suite). Findings raised by the Codex reviewer; verified
  control-by-control against the catalog descriptions.
- Documentation consistency pass (no control changes): aligned the reader window title
  and Excel export metadata to the **Agentic AI Security Controls** brand; reconciled the
  `docs/build-evidence.md` provenance counts (213 → 229 → ~101 → 114) with the README
  narrative it is cited from; corrected the source-notebook name, the `app/data.js`
  edition-label claim, and the reader's companion-file list in the README quick start;
  documented the `Tool-Using (Code Exec)` profile sub-variant in the canonical checklist;
  uncommented the changelog version links with the real repository owner; and added the
  repository URL to the README.
- Reader: a loaded `Accepted Risk` on a Release-Floor control is now dropped (its note kept,
  reported separately) so the reader honors the non-waivable-floor rule; **Clear** now resets
  the status/notes maps as null-prototype objects, matching the documented invariant.
- Docs: corrected "21 control families" to "13 families / 21 ID prefixes" (README, CHANGELOG),
  the reader footer's description of which `docs/checklist.md` regions are generated, a stale
  `DATA-07` example in `app/README.md`, and the "Core is always in scope" wording versus the
  reader's view-filter chips.

## [1.0.0] - 2026-06-20

Initial public release — the _Canonical v1.0_ checklist edition.

### Added

- **114 security controls** for agentic AI systems across **13 control families** (21 ID prefixes),
  organized by **10 SDLC gates** (use-case intake → decommissioning).
- **21 non-waivable Release Floor** controls that must pass before production launch
  (cannot be marked `Accepted Risk`).
- **AGT risk model** — 15 risk families crosswalked to **OWASP Agentic** (`T1`–`T17`)
  and the **OWASP LLM Top 10 2025** (`LLM01`–`LLM10`).
- **6 applicability profiles** (Core, Tool-Using, RAG / Memory, Multi-Agent, Regulated,
  Cyber-Physical) and an **A0–A3 autonomy model**.
- **Dependency graph** — 167 acyclic `depends-on` / `affects` edges, with topological
  "step order".
- `docs/checklist.md` — the canonical document (prose, gates, floor, appendices A–E);
  its control tables, risk crosswalk, and dependency graph are generated from
  `app/data.js`.
- **Offline interactive reader** (`app/checklist.html` + `checklist.js` + `checklist.css`)
  — profile filter, search, floor-only, step-order grouping (on by default), per-control
  status + note, clickable dependency links, light/dark mode; fully offline (no CDN or
  network requests).
  - **Save / Load** an assessment as a JSON file
    (`agentic-ai-security-controls-assessment-<date>.json`).
  - **Excel export** — a styled `.xlsx` of the current view with frozen header,
    autofilter, status dropdown, and conditional formatting
    (`agentic-ai-security-controls-<date>.xlsx`).
- `docs/release-flow.svg` — release-flow diagram (foundation → CI auto-gates →
  change-triggered review → release floor → runtime → periodic), embedded in the README.
- `build.js` — validates `app/data.js` (schema, duplicate IDs, dangling/cyclic
  dependencies, AGT references) and regenerates the generated regions of
  `docs/checklist.md`.
- `docs/build-evidence.md` — provenance of how the checklist was built and reviewed
  (multi-agent synthesis, blind review, coverage analysis).

[Unreleased]: https://github.com/s33k3r0ck/agentic-ai-security-controls/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/s33k3r0ck/agentic-ai-security-controls/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/s33k3r0ck/agentic-ai-security-controls/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/s33k3r0ck/agentic-ai-security-controls/releases/tag/v1.0.0
