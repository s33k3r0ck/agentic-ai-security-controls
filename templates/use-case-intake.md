# Use-Case Intake Record

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** GOV-01, GOV-02, GOV-03, COMP-01, CPS-01, DATA-01
> **SDLC gate:** 0 — Use-Case Intake  ·  **Family:** Governance, Compliance
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

> **Purpose of this record.** Gate 0 decides whether agentic behaviour is justified at all, and if so, how
> autonomous it may be — *before any build begins*. This record is the evidence that an informed, accountable
> decision was made up front. Complete every section; an unanswerable section is itself a signal that the
> use case is not ready to proceed. Nothing downstream (design, build, release) should rely on a control
> here being "assumed" — it must be stated and owned.

## 1. Use-Case Description and Justification

> Describe what the system does in plain language, then justify why an *agent* (autonomous tool-using,
> planning, or multi-step decision-making behaviour) is the right approach rather than a deterministic,
> scripted, or human-in-the-loop non-agentic alternative. If a non-agentic approach would meet the need,
> say so — choosing an agent adds attack surface (AGT-01 goal hijack, AGT-02 unsafe tool use) and should be
> a deliberate trade-off, not a default.

**What the system does:** _<one-paragraph description of the use case and the user/business problem it solves>_

**Why an agent (vs. a non-agentic approach):** _<justification: what agentic capability — planning, dynamic tool
selection, multi-step reasoning — is genuinely required; what was the non-agentic option and why it was rejected>_

**Expected scope of operation:** _<who/what it acts on behalf of, where it runs, expected volume/frequency>_

**Out of scope (explicitly NOT permitted):** _<actions, data, or environments deliberately excluded>_

## 2. Autonomy Level and Oversight Model (GOV-02)

> Classify the autonomy level on the A0–A3 scale and justify it. Higher autonomy = less human oversight per
> action = higher blast radius if the agent is hijacked or misbehaves (AGT-13 misalignment, AGT-09 cascading
> failure). The oversight model must state, concretely, where a human is in or on the loop. A3 (fully
> autonomous on high-risk actions) requires explicit risk acceptance — see §8.

| Field | Value |
| --- | --- |
| Proposed autonomy level | _A0 / A1 / A2 / A3_ |
| Rationale | _<why this level and not one lower>_ |
| Human oversight model | _<in-the-loop per action / on-the-loop with approval gates / out-of-loop with monitoring>_ |
| Where humans intervene | _<specific checkpoints, approval steps, kill-switch ownership>_ |

> Autonomy scale reference (delete before sign-off):
> - **A0** — Suggest only; a human performs every action.
> - **A1** — Acts with per-action human approval (human-in-the-loop).
> - **A2** — Acts autonomously within bounds; human on-the-loop, can interrupt/override.
> - **A3** — Fully autonomous on in-scope actions, including high-risk ones; human out-of-loop, post-hoc review.

## 3. Named Owners and Escalation (GOV-01)

> Every agentic system needs accountable, named human owners across product, engineering, security, and
> operations — roles alone are insufficient. List a real person (or rotation/on-call alias plus its current
> holder) and an escalation contact for incidents. Unowned agents become orphaned and unmonitored
> (see DEC zombie-agent risk at decommissioning).

| Role | Named owner | Contact | Escalation contact |
| --- | --- | --- | --- |
| Product owner | _<name>_ | _<email / handle>_ | _<who to call if unreachable>_ |
| Engineering owner | _<name>_ | _<email / handle>_ | _<...>_ |
| Security owner | _<name>_ | _<email / handle>_ | _<...>_ |
| Operations / on-call owner | _<name>_ | _<email / handle>_ | _<...>_ |

**Incident / kill-switch escalation path:** _<who can pause or disable the agent, and how, within what time>_

## 4. Data Classifications in Scope

> List every classification of data the agent can read, write, retain, or transmit. This drives downstream
> data-handling, retention, and isolation controls and feeds the compliance scope in §6. Be specific — "some
> customer data" is not evidence. Flag regulated data early; it constrains where and how the agent may run.

| Classification | In scope? | Where it appears (input / memory / tools / output) | Notes |
| --- | --- | --- | --- |
| PII | _Yes / No_ | _<...>_ | _<...>_ |
| PHI | _Yes / No_ | _<...>_ | _<...>_ |
| Secrets / credentials | _Yes / No_ | _<...>_ | _<...>_ |
| Regulated (financial / export / etc.) | _Yes / No_ | _<...>_ | _<...>_ |
| Customer / confidential business data | _Yes / No_ | _<...>_ | _<...>_ |
| Other | _<specify>_ | _<...>_ | _<...>_ |

**Isolation / access boundary:** _<what principal is data scoped to (per-tenant / per-customer / per-user / none), and where is that enforced (server-side authz / agent / model)?>_

> Name the real isolation boundary — tenant, per-customer, or per-user — and how cross-boundary access fails
> closed. Single-tenant systems are often still multi-customer; do not just name the credential audience.
> Model output must not be the authorization boundary.

**Untrusted input surfaces / channels:** _<ingest channels with a trusted/untrusted flag, e.g. user text (untrusted), page/DOM/serialized client context (untrusted), conversation history (untrusted), uploaded files / OCR (untrusted), RAG content (untrusted), tool output (untrusted)>_

> This is intake hygiene that seeds the downstream injection threat model — list every channel data enters by,
> not just the data classes above. Page / DOM / serialized client context (route, selected ids, visible
> balances/labels supplied by the front-end) is an attacker-forgeable untrusted channel. Treat it as DATA;
> client-supplied identifiers must be re-authorized server-side and never trusted for authorization (AGT-01, AGT-03).

## 5. High-Risk Actions the Agent May Take (GOV-03)

> Enumerate the high-impact actions the agent is permitted to perform. These are the actions an attacker
> would target via prompt injection or goal hijack (AGT-01) and that an unsafe tool call (AGT-02) could
> trigger. Each permitted high-risk action should map to a guardrail and (for A0/A1/A2) a human approval
> point defined in §2. If an action is NOT permitted, list it as "No" — that boundary is itself evidence.

| High-risk action category | Permitted? | Agent role | Examples in this use case | Guardrail / approval required |
| --- | --- | --- | --- | --- |
| Writes / mutations | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Deletes | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Sends (email / message / external comms) | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Approvals / sign-offs | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Code / command execution | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Configuration / infrastructure changes | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Money movement / financial transactions | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |
| Credential / access management | _Yes / No_ | _Executes / Proposes-drafts only / Confirms then executes_ | _<...>_ | _<...>_ |

> **Agent role:** where the agent only proposes/drafts a high-risk action and real execution happens
> out-of-band (e.g. behind step-up auth / SCA in a downstream system), state that explicitly and name where
> the real execution gate lives — that location is the evidence, not a bare Yes/No.
>
> **Example row (delete this example before sign-off):**
> `Money movement / financial transactions | Yes | Proposes-drafts only | Agent drafts a payment; customer executes it | Real gate is out-of-band: PSD2 SCA step-up in the payment UI, per-payment cap, new-payee cooling-off — the agent never executes.`

## 6. Compliance Scope (COMP-01)

> Capture the legal, contractual, and customer-obligation surface this use case touches. This is the input
> to later attestation and retention controls. Where an obligation does not apply, write "N/A — _<reason>_"
> rather than leaving it blank, so a reviewer can see it was considered.

| Obligation | Applies? | Detail / reference |
| --- | --- | --- |
| Applicable laws / regulations | _Yes / No_ | _<e.g. GDPR, HIPAA, sector regs — cite the specific obligation>_ |
| Lawful basis for processing | _Yes / No_ | _<the lawful basis relied on for each data class in scope (e.g. consent, contract, legal obligation)>_ |
| Breach / incident-notification duties | _Yes / No_ | _<notification timelines and which regulator(s) / parties must be notified>_ |
| Contractual / customer commitments | _Yes / No_ | _<contract clauses, DPAs, SLAs constraining agent behaviour>_ |
| Data residency | _Yes / No_ | _<regions where data must stay / processing must occur>_ |
| Retention / deletion requirements | _Yes / No_ | _<how long inputs, memory, logs must or must not be kept>_ |
| Attestation / audit obligations | _Yes / No_ | _<what must be attestable, to whom, how often>_ |

**Open compliance questions / sign-offs needed:** _<unresolved items and who owns closing them>_

## 7. Cyber-Physical Scope (CPS-01)

> Determine whether the agent can actuate, gate, or influence any cyber-physical or safety-relevant system.
> An agent that can move a robot, dose a patient, change a vehicle setting, or open a valve has a failure mode
> measured in physical harm, not just data loss. If any answer is "Yes", expect additional CPS-family controls
> (channel security, interlocks, fail-safe defaults) downstream and treat the use case as high-consequence.

| Cyber-physical surface | In scope? | Detail |
| --- | --- | --- |
| Operational technology (OT) / industrial control | _Yes / No_ | _<systems, actuators, what the agent can gate>_ |
| Robotics / autonomous machinery | _Yes / No_ | _<...>_ |
| Medical devices / clinical systems | _Yes / No_ | _<...>_ |
| Vehicle / transport systems | _Yes / No_ | _<...>_ |
| Safety / life-safety systems | _Yes / No_ | _<...>_ |

**Overall cyber-physical exposure:** _None / Indirect (monitors only) / Direct (actuates or gates)_

> If exposure is "Direct", state the worst-case physical outcome and the independent safety interlock that
> bounds it: _<worst-case + interlock owner>_

## 8. Go / No-Go Decision and Risk Acceptance

> Record the gate decision. A "Go" here authorizes the use case to proceed to design — it does not approve a
> build. For A3 (per §2), or for any retained high-risk action without a human approval point, a named risk
> owner must explicitly accept the residual risk; otherwise the decision is No-Go or Conditional. Conditions
> must be specific and assigned, not aspirational.

| Field | Value |
| --- | --- |
| Decision | _Go / Conditional Go / No-Go_ |
| Conditions to satisfy before next gate | _<itemized, each with an owner and due date — or "None">_ |
| A3 / high-risk residual risk acceptance required? | _Yes / No_ |
| Residual risk accepted by | _<name, role — required if "Yes" above; otherwise N/A>_ |
| Risk acceptance rationale | _<why the residual risk is acceptable, with compensating controls — or N/A>_ |
| Compensating controls / known residual discrepancies the decision relies on | _<compensating controls the Go depends on and any tracked known discrepancies — or N/A>_ |
| Decision date | _<YYYY-MM-DD>_ |
| Re-review trigger | _<scope change, autonomy increase, new high-risk action, or scheduled date>_ |

> **Compensating controls / known residual discrepancies.** If the decision leans on an inline guard /
> firewall layer, record (a) whether an inbound-prompt and/or outbound-response guard is in the path, (b) its
> enforcement mode per environment (enforce / monitor / off — e.g. enforce in prod, monitor in staging), and
> (c) whether a guard block/redaction surfaces correctly to the user and to logs. A guard decision the UI
> renders as success (block-but-UI-shows-success) is a tracked discrepancy, not a pass. The guard is a
> COMPENSATING control and does not replace server-side authorization.

## Sign-off

> All listed owners sign before this record becomes approved evidence. The security owner is mandatory; the
> risk owner is mandatory whenever §8 records an A3 / high-risk risk acceptance. Each signer's decision
> reflects their domain (e.g. compliance signs on §6, the risk owner on §8).

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Engineering owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Security owner (required) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Risk owner (required for A3 / high-risk acceptance) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
