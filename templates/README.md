# Evidence-Package Templates

Fill-in templates for the **evidence package** defined in [`../docs/checklist.md`](../docs/checklist.md) §10 — the artifacts you produce to demonstrate that the controls in the **Agentic AI Security Controls** checklist are satisfied for your system.

There is one template per evidence artifact. Each is a *guided* template: it carries a header block (which controls it backs, the SDLC gate, the family), fill-in `_placeholders_`, and short guidance blockquotes explaining what each section needs and why.

## How to use

1. **Scope first.** Not every artifact applies to every system — select your applicability profiles (checklist §2) and produce only the artifacts in scope. Record a brief reason for anything you skip.
2. **Copy and fill.** Copy the template out of this folder, replace every `_placeholder_`, and **delete the guidance blockquotes** (lines starting with `>`) once the section is complete.
3. **Produce at the right gate.** Each artifact has a primary SDLC gate (see the table). Assemble the full set at **Gate 5 (Release Readiness)**.
4. **Store and reference.** Keep the completed artifact as evidence and reference it from the control's note in the interactive reader (or the `Evidence` column of the checklist).
5. **Review on cadence.** Re-check the package on the operating cadence (checklist §11) and after material change or incident.

## Formats

- **`.md`** — guided Markdown: sections, guidance blockquotes, and a sign-off table.
- **`.csv`** — a header row plus one or two rows marked `EXAMPLE — delete this row`. Delete the example rows; cells that contain commas are double-quoted.
- **`aibom.json`** — a JSON skeleton. The AI bill of materials may be delivered as JSON *or* CSV; this template is the JSON form.
- **`agent-data-flow.md`** — a Mermaid diagram starter plus a required-elements checklist. The committed deliverable is the rendered **`agent-data-flow.png`** exported from it.

> Hard-floor reminder: `residual-risk-acceptance.md` records a time-bound **Accepted Risk** waiver. It cannot be used for Non-Waivable Release Floor controls (checklist §7) — those must be `Pass`, or `Not Applicable` with recorded justification for conditional ones.

## Source of truth

This index and `docs/checklist.md` §10 are **generated** from `app/data.js` (`window.CHECKLIST.templates`) by `node build.js`. Edit the template files freely; to change the *list itself* (add, rename, or re-map an artifact), edit `app/data.js` and rerun the build. Do not hand-edit the generated table below.

<!-- BEGIN GENERATED:index — edit app/data.js, then run: node build.js -->
| Template | Artifact | Gate | Backs controls | Description |
| --- | --- | --- | --- | --- |
| [use-case-intake.md](use-case-intake.md) | `use-case-intake.md` | 0 | GOV-01, GOV-02, GOV-03, COMP-01, CPS-01, DATA-01 | Decide whether agentic behaviour is justified and how autonomous it may be, with owners, data classes, high-risk actions, compliance and cyber-physical scope. |
| [agent-registry.csv](agent-registry.csv) | `agent-registry.csv` | 0 | GOV-05, GOV-01, ID-04 | One inventory row per deployed agent: owner, purpose, model, tools, data sources, memory, identity, and lifecycle state. |
| [agent-threat-model.md](agent-threat-model.md) | `agent-threat-model.md` | 1 | ARCH-02, ARCH-03, ARCH-04, PROMPT-01 | Agent-specific trust boundaries, untrusted-input map, AGT risk mapping, and containment boundaries. |
| [agent-data-flow.md](agent-data-flow.md) | `agent-data-flow.png` | 1 | ARCH-01, ARCH-02, ARCH-05 | Mermaid starter + required-elements checklist for the data-flow diagram (deliverable is the rendered agent-data-flow.png). |
| [agt-risk-register.md](agt-risk-register.md) | `agt-risk-register.md` | 1 | ARCH-02, GOV-03, TEST-01 | Per-system register of AGT-01..AGT-15: applicability, scenario, likelihood/impact, mitigating controls, residual risk. |
| [tool-inventory.csv](tool-inventory.csv) | `tool-inventory.csv` | 2 | TOOL-01, TOOL-02, CODE-01 | One row per tool/API/function/MCP server: owner, permissions, side effects, reversibility, risk, and gating. |
| [permission-matrix.csv](permission-matrix.csv) | `permission-matrix.csv` | 2 | TOOL-02, TOOL-04, ID-01, ID-05 | Which agent/role may perform which action on which tool/resource, with scope, credential type, and approval/step-up. |
| [egress-policy.md](egress-policy.md) | `egress-policy.md` | 2 | ARCH-05, DATA-02, DATA-03, OUT-01, OPS-04 | Allowed egress destinations and which data classes may leave through each channel; deny by default, monitor exfiltration. |
| [memory-policy.md](memory-policy.md) | `memory-policy.md` | 2 | MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06 | What the agent may persist to durable memory, and how it is gated, isolated, reviewed, expired, and integrity-protected. |
| [rag-source-registry.csv](rag-source-registry.csv) | `rag-source-registry.csv` | 2 | RAG-01, RAG-02, RAG-03, RAG-05 | One row per approved retrieval source: owner, trust level, update path, sanitization, tenant namespace, review. |
| [agent-communication-protocol.md](agent-communication-protocol.md) | `agent-communication-protocol.md` | 2 | A2A-01, A2A-02, A2A-03, A2A-04, A2A-05, A2A-07 | How agents authenticate, exchange validated messages, restrict delegation, and validate mission-critical decisions. |
| [human-approval-policy.md](human-approval-policy.md) | `human-approval-policy.md` | 2 | HITL-01, HITL-03, HITL-04, HITL-05, TOOL-04, ID-05 | Which actions need human approval, what the approver sees, approval tokens, fatigue controls, and fail-safe oversight. |
| [red-team-test-results.md](red-team-test-results.md) | `red-team-test-results.md` | 4 | TEST-01, TEST-02, TEST-03, TEST-05, PROMPT-02, PROMPT-03, PROMPT-04, CODE-01, CODE-02, CODE-03, CODE-04, CPS-02, CPS-03 | Agentic red-team campaign: methodology, AGT coverage, fixtures, outcome metrics, findings, and release-gate decision. |
| [aibom.json](aibom.json) | `aibom.json or aibom.csv` | 3 | SUP-01, SUP-02, SUP-04 | Machine-readable inventory of every model, prompt, tool, plugin, connector, library, dataset, API, and MCP server, with provenance. |
| [monitoring-dashboard-link.md](monitoring-dashboard-link.md) | `monitoring-dashboard-link.md` | 6 | OPS-03, OPS-04, RES-03, RAG-06 | Durable links to the live monitoring dashboards plus the alert inventory, thresholds, owners, and review cadence. |
| [incident-runbook.md](incident-runbook.md) | `incident-runbook.md` | 7 | IR-01, IR-02, IR-03, IR-04, OPS-06 | Step-by-step procedure to contain a compromised agent: disable, rotate, quarantine, preserve evidence, blast radius, lessons. |
| [kill-switch-drill.md](kill-switch-drill.md) | `kill-switch-drill.md` | 5 | OPS-05, IR-01, OPS-06, CPS-04 | Evidence the kill switch exists and was exercised: scope, steps, measured time-to-disable, and inactive-state verification. |
| [residual-risk-acceptance.md](residual-risk-acceptance.md) | `residual-risk-acceptance.md` | 5 | GOV-04 | Time-bound Accepted-Risk waiver record with compensating controls, dual owner approval, expiry, and remediation ticket (not for floor controls). |
| [compliance-obligation-register.md](compliance-obligation-register.md) | `compliance-obligation-register.md` | 0 | COMP-01, COMP-02, COMP-03, COMP-04, DATA-04 | Each legal/contractual/customer obligation mapped to an enforcing control, its evidence, residency/retention, owner, and review. |
| [raci-matrix.csv](raci-matrix.csv) | `raci-matrix.csv` | 0 | GOV-01, IR-01 | Responsible / Accountable / Consulted / Informed across lifecycle activities and the SDLC gates. |
| [agentic-log-standard.md](agentic-log-standard.md) | `agentic-log-standard.md` | 2 | OPS-01, OPS-02, ARCH-06, IR-03 | Required structure, integrity protection, and retention of agentic logs so consequential actions can be reconstructed. |
| [decommissioning-playbook.md](decommissioning-playbook.md) | `decommissioning-playbook.md` | 9 | DEC-01, DEC-02, DEC-03, DEC-04, DEC-05 | Retire an agent without live attack surface: deactivation, credential revocation, state disposition, tombstone, zombie prevention. |
| [data-residency-policy.md](data-residency-policy.md) | `data-residency-policy.md` | 0 | COMP-02, DATA-04, MEM-02, RAG-05 | Where each data class may be stored/processed and how residency is enforced across memory, RAG, and model providers. |
<!-- END GENERATED:index -->
