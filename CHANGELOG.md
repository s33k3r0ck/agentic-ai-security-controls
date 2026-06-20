# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) keyed
to the control set (see "Versioning" in the [README](README.md)).

## [Unreleased]

### Added

- **Per-control external-framework crosswalk** — a new **Appendix F** in `docs/checklist.md`,
  framework chips in the reader's expanded row, and four columns in the Excel export.
  OWASP Agentic (`T1`–`T17`) and OWASP LLM (`LLM01`–`LLM10`) are derived from each control's
  AGT risks; **MITRE ATLAS** techniques (`AML.Txxxx`, catalog v5.4.0) are grounded per control
  where applicable (81 of 114 controls); per-control **source references** are derived from
  the Appendix B family guide. (NIST AI RMF / ISO 42001 / CSA AICM and AIVSS are deliberately
  not carried as empty placeholders — an accurate standard mapping is a separate, deliberate
  effort.) Backed by new `app/data.js` keys (`frameworks`, `sources`,
  `familySources`, `mappings`) validated by `build.js`; OWASP and source refs are derived,
  not stored.

### Fixed

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

[Unreleased]: https://github.com/s33k3r0ck/agentic-ai-security-controls/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/s33k3r0ck/agentic-ai-security-controls/releases/tag/v1.0.0
