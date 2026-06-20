# Compliance Obligation Register

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** COMP-01, COMP-02, COMP-03, COMP-04, DATA-04
> **SDLC gate:** 0 — Use-Case Intake  ·  **Family:** Compliance, Data
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and intent

> State which agentic system/release this register covers and what its in-scope use cases and data classes are. The register exists so every legal, contractual, and customer obligation that applies to this system is identified at intake (COMP-01) and tied to a control that actually enforces it (COMP-02) rather than living only as policy text. Keep this section short — the detail belongs in the table below.
> Delete this blockquote once filled.

- **System / use case in scope:** _<one-line description, e.g. "customer-support copilot with tool access to billing and CRM">_
- **Jurisdictions / markets served:** _<e.g. EU, UK, US-CA>_
- **Data classes handled:** _<e.g. PII, payment data, health data, internal confidential>_
- **Processing roles:** _<controller / processor / sub-processor, per applicable law>_
- **Out of scope (explicitly):** _<flows, data, or regions not covered by this release>_

## 2. Obligation register (COMP-01, COMP-02, COMP-03)

> This is the core artifact. List every binding obligation the system is subject to and prove each one maps to an enforcing control with named evidence. An obligation with no enforcing control ID or no evidence artifact is an open gap and must be flagged in §6, not left blank.
> Fill one row per obligation. Use the enforcing control ID from `docs/checklist.md` (e.g. COMP-02, DATA-04) — these are the technical controls that make the obligation real, satisfying COMP-02. For obligations governing high-impact or regulated decisions, the evidence artifact must be an audit trail sufficient to reconstruct the decision (COMP-03); note that requirement in the "Audit evidence required?" column.
> Delete the EXAMPLE row and this blockquote once filled.

| # | Obligation (what must be true) | Source type | Source reference | Data scope | Enforcing control ID | Evidence artifact | Audit evidence required? (COMP-03) | Owner | Next review date |
|---|--------------------------------|-------------|------------------|------------|----------------------|-------------------|------------------------------------|-------|------------------|
| _EX_ | _EXAMPLE — delete this row: EU personal data of agent conversations must be deletable on data-subject request within 30 days_ | _Regulation_ | _GDPR Art. 17_ | _EU end-user PII in conversation logs_ | _DATA-04_ | _data-retention-runbook.md; deletion-job dashboard export_ | _Yes — log deletion request + completion timestamp_ | _<name, Privacy>_ | _<YYYY-MM-DD>_ |
| _1_ | _<obligation statement>_ | _Law / Regulation / Contract / Customer commitment_ | _<citation, contract clause, or DPA section>_ | _<which data / which agent action>_ | _<COMP-0x / DATA-04 / other control ID>_ | _<filename or system reference proving enforcement>_ | _Yes / No_ | _<name, role>_ | _<YYYY-MM-DD>_ |
| _2_ | _<obligation statement>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _Yes / No_ | _<name, role>_ | _<YYYY-MM-DD>_ |

## 3. Data residency and retention (COMP-02, DATA-04)

> Residency and retention are the obligations most often asserted in policy but not actually enforced in the pipeline, so they get a dedicated table. For each data class, record where it is allowed to live, where the agent and its model/tool providers actually process and store it, the retention period, and the concrete enforcement point (DATA-04 — data minimization and residency). The "Enforcement point" must be a technical mechanism (region pinning, storage policy, retention job), not an intention. Relates to AGT-04 (sensitive disclosure and exfiltration) risk.
> Delete this blockquote once filled.

| Data class | Residency requirement (where it may be stored/processed) | Actual storage & processing locations | Retention period | Minimization applied (what is dropped / masked) | Enforcement point (DATA-04, COMP-02) | Evidence artifact |
|------------|----------------------------------------------------------|---------------------------------------|------------------|------------------------------------------------|--------------------------------------|-------------------|
| _<e.g. EU end-user PII>_ | _<e.g. EU/EEA only>_ | _<regions for app DB, log store, LLM provider, vector store>_ | _<e.g. 30 days>_ | _<e.g. payment numbers redacted before logging>_ | _<region pinning / storage policy / retention job ID>_ | _<filename / dashboard>_ |
| _<data class>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |

## 4. Audit-evidence requirements for high-impact decisions (COMP-03)

> List the agent decisions or actions that are high-impact or regulated (e.g. financial, eligibility, safety, legally significant, or anything subject to a "right to explanation"). For each, record what evidence must be captured to reconstruct and defend the decision after the fact (COMP-03), where that evidence is written, and how long it is retained. This is what an auditor or regulator will ask for; if a decision type here has no durable evidence sink, it is a gap for §6.
> Delete this blockquote once filled.

| High-impact decision / action | Why regulated / high-impact | Evidence captured (inputs, reasoning, tool calls, human override) | Evidence store & format | Retention | Owner |
|-------------------------------|-----------------------------|-------------------------------------------------------------------|-------------------------|-----------|-------|
| _<e.g. automated refund > threshold>_ | _<e.g. financial-controls policy; customer-contract SLA>_ | _<e.g. prompt, retrieved context, tool inputs/outputs, final action, approver>_ | _<audit log / WORM store; JSON>_ | _<e.g. 7 years>_ | _<name, role>_ |
| _<decision / action>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<name, role>_ |

## 5. Obligation-drift review (COMP-04)

> Obligations go stale silently: a new data flow, a new model/tool provider or sub-processor, a new region, or a changed retention rule can invalidate a row above without anyone editing this register. Record the cadence and the concrete triggers that force a re-review (COMP-04), and the date the register was last reconciled against the live system. Each trigger event must be tied back to which register rows it could affect.
> Delete this blockquote once filled.

- **Scheduled review cadence:** _<e.g. quarterly + every release at Gate 0>_
- **Last reconciled against live system:** _<YYYY-MM-DD>_
- **Re-review triggers (any of these forces an update before release):**
  - [ ] New or changed **data flow** (new data class, new collection point, new export)
  - [ ] New or changed **model / inference provider**
  - [ ] New or changed **tool, processor, or sub-processor** with data access
  - [ ] New or changed **deployment / storage region**
  - [ ] Changed **retention or deletion rule**
  - [ ] New **law, regulation, contract, or customer commitment** in scope
  - [ ] _<other project-specific trigger>_

| Trigger event observed | Date | Register rows / data classes affected | Action taken | Re-reviewed by |
|------------------------|------|---------------------------------------|--------------|----------------|
| _<e.g. added new EU vector-store provider>_ | _<YYYY-MM-DD>_ | _<rows 1, 4; residency table>_ | _<re-pinned region; updated DATA-04 evidence>_ | _<name, role>_ |
| _<event>_ | _<YYYY-MM-DD>_ | _<...>_ | _<...>_ | _<name, role>_ |

## 6. Open gaps and accepted risks

> Be honest here — this is what makes the register credible. List any obligation with no enforcing control, no evidence artifact, or an overdue review, plus any obligation deliberately accepted as residual risk. Note: per the checklist, hard-floor controls cannot be carried as Accepted Risk; an unenforced floor obligation must block the release, not appear as an accepted risk.
> Delete this blockquote once filled (or write "None known" if genuinely empty).

| Gap / obligation | Affected control ID | Why open / risk if unmitigated | Disposition (Remediate by date / Accepted risk) | Owner |
|------------------|---------------------|--------------------------------|--------------------------------------------------|-------|
| _<gap>_ | _<COMP-0x / DATA-04>_ | _<...>_ | _<YYYY-MM-DD or Accepted — rationale>_ | _<name, role>_ |

## Sign-off

> All listed owners must sign before this register is accepted as evidence for the release. The security owner is mandatory; include the compliance/privacy and product/risk owners as fits the obligations registered above.
> Delete this blockquote once filled.

| Role | Name | Date | Decision (Approve / Reject / Approve with conditions) |
|------|------|------|-------------------------------------------------------|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _<decision>_ |
| Compliance / privacy owner | _<name>_ | _<YYYY-MM-DD>_ | _<decision>_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _<decision>_ |
| Risk owner | _<name>_ | _<YYYY-MM-DD>_ | _<decision>_ |
