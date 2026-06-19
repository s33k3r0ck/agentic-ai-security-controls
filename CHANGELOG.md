# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) keyed
to the control set (see "Versioning" in the [README](README.md)).

## [Unreleased]

_Nothing yet._

## [1.0.0] - 2026-06-20

Initial public release — the _Canonical v1.0_ checklist edition.

### Added

- **114 security controls** for agentic AI systems across **21 control families**,
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

<!-- After creating the GitHub repo, set OWNER and uncomment:
[Unreleased]: https://github.com/OWNER/agentic-ai-security-controls/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/OWNER/agentic-ai-security-controls/releases/tag/v1.0.0
-->
