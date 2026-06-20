# Agentic Logging Standard

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** OPS-01, OPS-02, ARCH-06, IR-03
> **SDLC gate:** 2 — Secure Design  ·  **Family:** Operations, Architecture, Incident Response
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (the indented `>` guidance paragraphs in each section) before it becomes evidence. Keep the four header lines above (Backs controls / SDLC gate / Family) — they are part of the required header, not guidance.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and purpose

> Name the agentic system this standard governs and which components emit logs (orchestrator, sub-agents,
> tool adapters, memory store, gateways). Purpose is fixed by the controls: define the structure, integrity,
> and retention of agentic logs so any action can be reconstructed after the fact (OPS-01). State which
> deployments this version applies to and link the architecture diagram / threat model it derives from.
> Delete this guidance block once filled.

- **System / agent under standard:** _<system or agent name>_
- **Components in scope (log producers):** _<e.g. orchestrator, tool-runner, RAG retriever, memory service>_
- **Out of scope (and why):** _<components excluded + reason, or "none">_
- **Related artifacts:** _<links to architecture diagram, threat model, IR runbook>_

## 2. Required log fields (OPS-01)

> OPS-01 requires agentic logs rich enough to reconstruct what the agent did and why. Every agent action —
> reasoning step, tool call, approval, and outcome — must be recorded with the fields below. Fill the
> "Field source / how populated" column with where each value comes from in your stack (framework callback,
> middleware, tool wrapper). Mark any field "N/A — _reason_" only with a documented justification; missing
> actor/tool/decision data is what blinds incident response (IR-03) and obscures misattributed actions (AGT-14).
> Delete this guidance block once filled.

| Field | Definition | Required | Field source / how populated | Example value (delete) |
|---|---|---|---|---|
| `actor` | Human or service principal on whose behalf the agent acts | Yes | _<auth context / token claim>_ | _alice@example.com_ |
| `agent` | Identity/role of the agent or sub-agent emitting the event | Yes | _<agent registry id>_ | _support-triage-agent_ |
| `session` | Conversation / run identifier grouping related steps | Yes | _<session manager>_ | _sess-7f3a..._ |
| `goal` | Top-level task the agent is pursuing | Yes | _<task intake>_ | _"resolve ticket #4821"_ |
| `subtask` | Current step / plan node under the goal | Yes | _<planner state>_ | _"look up order status"_ |
| `tool` | Tool / function / MCP server invoked (or "reasoning" if none) | Yes | _<tool dispatcher>_ | _orders.lookup_ |
| `parameters` | Tool inputs, **sanitized/redacted** per §5 | Yes | _<tool wrapper + redactor>_ | _{order_id: "<redacted>"}_ |
| `decision` | Chosen action and, where available, rationale | Yes | _<model output / policy engine>_ | _"call orders.lookup"_ |
| `approval` | Whether human/policy approval was required, and its result | Yes | _<approval gate>_ | _required=true, approved_by=bob_ |
| `outcome` | Result, error, or rejection of the action | Yes | _<tool response handler>_ | _success / denied / error:timeout_ |
| `correlation_id` / `trace_id` | ID linking related events across components for reconstruction | Yes | _<tracing context>_ | _trace-9c1d..._ |
| `timestamp` | Event time, source clock, and timezone (UTC recommended) | Yes | _<emitter clock>_ | _2026-06-20T14:03:11Z_ |

> Add rows for any system-specific required fields (e.g. `model`, `prompt_hash`, `cost`, `policy_version`).
> Delete this guidance block once filled.

## 3. Integrity protection (OPS-02, ARCH-06)

> OPS-02 requires audit tampering to be detectable; ARCH-06 requires the audit trail to be tamper-evident
> *by design*, not by trust. State the mechanism (pick at least one) and how detection actually works — i.e.
> what verification step would catch an alteration or deletion, who runs it, and how often. "We trust the
> logging backend" is not tamper-evidence. Delete this guidance block once filled.

- **Mechanism (select all that apply):** _append-only / hash-chained / WORM storage / external ledger-backed / signed batches_
- **How tampering is detected:** _<e.g. each record carries the hash of the prior record; a daily job recomputes the chain and alerts on mismatch>_
- **Verification owner & cadence:** _<team / role>_, runs _<continuous / daily / per-release>_
- **What blocks deletion or in-place edit:** _<retention lock / IAM deny / immutability policy>_
- **Tamper-detection alert routing:** _<where a chain-break or deletion alert goes>_

| Property | Implementation | Evidence reference |
|---|---|---|
| Append-only enforced | _<how>_ | _<config / IAM policy link>_ |
| Integrity proof per record/batch | _<hash chain / signature / ledger>_ | _<verification job link>_ |
| Independent of log producers | _<sink not writable by the agent runtime>_ | _<access model link>_ |
| Tamper test performed | _<describe the test that proved detection works>_ | _<test result / ticket>_ |

> EXAMPLE (delete this block): Records are hash-chained (`hash = H(prev_hash || canonical(record))`) and written
> to WORM object storage with a 400-day retention lock; a per-release CI job re-walks the chain for the release
> window and fails the build on any mismatch. A red-team deletion attempt in staging (TICKET-1234) was detected
> by the next chain verification run.

## 4. Retention and storage location

> Define how long logs are kept and where they live. Retention must outlast realistic detection windows so
> IR-03 blast-radius reconstruction is still possible. Capture the storage location/region (for data-residency)
> and the disposal process when retention ends. Delete this guidance block once filled.

| Item | Value |
|---|---|
| Retention period | _<e.g. 400 days hot, then N days archive>_ |
| Storage location / region | _<service, region, account/project>_ |
| Storage class / immutability window | _<e.g. WORM lock duration>_ |
| Disposal process at end of retention | _<automated lifecycle rule + who approves>_ |
| Legal/compliance hold override | _<how a hold suspends disposal>_ |

## 5. Sensitive-data handling (sanitization / redaction)

> Logs must be rich enough to reconstruct actions but must not become a new exfiltration surface. Describe what
> is redacted/tokenized before write, where redaction happens (must be *before* the log leaves the producer for
> the sink), and how you verify it. Tie sanitized `parameters` here back to §2. Note handling of prompt content
> and tool outputs that may carry secrets or PII. Delete this guidance block once filled.

- **Data classes redacted / tokenized:** _<PII, secrets/credentials, full prompts, payment data, ...>_
- **Where sanitization runs:** _<producer-side middleware before sink write>_
- **Method:** _<masking / tokenization / field allowlist / hashing>_
- **Fields exempt from redaction (and why safe):** _<e.g. correlation_id>_
- **Verification that redaction works:** _<test / scan over sample logs, owner, cadence>_
- **Residual-risk note:** _<known gaps + accepted-risk reference if any>_

## 6. Blast-radius reconstruction support (IR-03)

> IR-03 requires preserving evidence and determining blast radius during an incident. Demonstrate that the
> fields and IDs above are sufficient to answer, for a given compromised session/agent/tool: what did it touch,
> which downstream actions and tools fired, and which actors/data were affected. Reference the query path
> (correlation/trace id pivots) and where this is rehearsed. Delete this guidance block once filled.

- **Reconstruction question this log set answers:** _"given session/trace _<id>_, enumerate every tool call, approval, and outcome and the actors/resources affected."_
- **Primary pivot keys:** _correlation_id / trace_id, session, agent, actor_
- **How affected resources are enumerated:** _<e.g. join tool + parameters + outcome across the trace>_
- **Link to IR runbook step using these logs:** _<link>_
- **Reconstruction drill evidence:** _<date + result of last tabletop / replay exercise>_
- **Known reconstruction gaps:** _<fields or components that would leave a blind spot>_

## 7. Log sinks and access controls

> List every destination logs flow to and who/what can read or administer them. The sink must not be writable
> or purgeable by the agent runtime it audits (supports OPS-02/ARCH-06). Capture read access (least privilege),
> admin access, and how access to logs is itself logged. Delete this guidance block once filled.

| Sink | Purpose | Writers | Readers (least privilege) | Admin / delete rights | Access to logs itself audited? |
|---|---|---|---|---|---|
| _<sink 1>_ | _<primary audit store>_ | _<producers only>_ | _<roles>_ | _<role; immutability blocks delete>_ | _<yes/no + where>_ |
| _<sink 2>_ | _<SIEM / search>_ | _<forwarder>_ | _<roles>_ | _<role>_ | _<yes/no>_ |

> EXAMPLE row (delete): `audit-worm-bucket` | primary tamper-evident store | log-forwarder SA only | ir-responder, auditor | platform-admin (delete blocked by retention lock) | yes — bucket access logs in SIEM.

## 8. Open items and accepted risk

> Track gaps against the four controls and any accepted-risk decisions. Per the checklist, accepted risk is
> never permitted on hard-floor controls — confirm none of OPS-01/OPS-02/ARCH-06/IR-03 are being waived here.
> Delete this guidance block once filled.

| Item | Control(s) | Status (Pass / Partial / Fail / N/A) | Owner | Target date | Note |
|---|---|---|---|---|---|
| _<gap>_ | _<OPS-01 / ...>_ | _<status>_ | _<owner>_ | _<YYYY-MM-DD>_ | _<detail / accepted-risk ref>_ |

## Sign-off

> Security owner sign-off is mandatory. Add risk, product, and compliance/audit owners as fitting the artifact;
> the audit/compliance owner is expected here because integrity and retention (OPS-02, ARCH-06) carry
> regulatory weight. Each signer confirms the evidence above is accurate for the named version. Delete this
> guidance block once filled.

| Role | Name | Date | Decision |
|---|---|---|---|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve-with-conditions_ |
| Incident response owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve-with-conditions_ |
| Compliance / audit owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve-with-conditions_ |
| Product / system owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve-with-conditions_ |
