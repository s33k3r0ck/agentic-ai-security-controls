# Data Residency Policy

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** COMP-02, DATA-04, MEM-02, RAG-05
> **SDLC gate:** 0 — Use-Case Intake  ·  **Family:** Compliance, Data, Memory, RAG
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Purpose & Scope

> State which agentic system, environment(s), and tenants this policy governs, and what it proves. The purpose is to define where each data class may be stored/processed and how residency is enforced across memory, RAG, and model providers. This is captured at **Gate 0 (Use-Case Intake)** so residency constraints are known before design, not retrofitted.

This document defines the permitted storage and processing locations for each class of data handled by _<system / agent name>_, and the technical controls that enforce those constraints. It backs **COMP-02** (enforce obligations with technical controls), **DATA-04** (data minimization and residency), **MEM-02** (isolate and encrypt memory), and **RAG-05** (isolate vector stores per tenant / customer / user — or confirm a shared corpus holds no customer data; see §7.2).

- **Residency posture:** _<single-region / multi-region>_  ·  **Isolation boundary:** _<tenant / per-customer / per-user — name the real one>_
  > State the posture once here. Single-region single-tenant systems are often still **multi-customer**: name the actual isolation principal (do not just name the credential audience). When the posture is single-region, §3 may collapse to one region column and §7.2 may legitimately be N/A — see those sections.
- **In scope:** _<components, data stores, model providers, tenants covered>_
- **Out of scope:** _<explicitly excluded systems/data, with reason>_
- **Governing obligations:** _<regulations / contracts / customer commitments driving residency, e.g. GDPR, sectoral, or customer DPA terms>_
- **Agent-action boundary under obligation:** _<what the agent may draft/propose vs. what must execute server-side / out-of-band>_
  > Where an obligation gates a high-risk action, record the boundary the agent must not cross. Where the agent only proposes/drafts a high-risk action and real execution happens out-of-band (e.g. behind step-up auth / SCA in a downstream system), state that explicitly and name where the real execution gate lives — that location is the evidence, not a bare Yes/No. (e.g. "PSD2: agent drafts payment, SCA/execution occur server-side outside the agent.")

## 2. Data Classes

> Enumerate every class of data the agent ingests, generates, or persists. Drive the rest of the policy from this list. Tie each class to a residency obligation and the minimum the agent actually needs (DATA-04 minimization).

| Data class | Description | Sensitivity | Residency obligation | Minimization note (DATA-04) |
|---|---|---|---|---|
| _<class id>_ | _<what it is>_ | _<public / internal / confidential / regulated>_ | _<region constraint & source>_ | _<why the agent needs it / what it does not get>_ |
| _EXAMPLE — delete this row: end_user_pii_ | _Customer names, emails entered in chat_ | _Regulated_ | _EU-only per customer DPA_ | _Agent reads but never persists raw email; tokenized at ingest_ |

## 3. Allowed Regions — Data-Class × Region Matrix

> The core artifact. For each data class, mark which regions may **store** and **process** it. "Process" includes model inference, RAG retrieval, and any transient compute. An empty/blocked cell means routing controls (COMP-02) must prevent that combination. Keep region names consistent with your provider/cloud naming.

| Data class | Region _<R1>_ | Region _<R2>_ | Region _<R3>_ | Notes |
|---|---|---|---|---|
| _<class id>_ | _Store + Process / Process-only / Blocked_ | _..._ | _..._ | _<conditions>_ |
| _EXAMPLE — delete this row: end_user_pii_ | _Store + Process (eu-west-1)_ | _Blocked (us-east-1)_ | _Blocked_ | _No US processing under any condition_ |

## 4. Model / Provider Processing Regions

> List every model and inference provider and the region each request is processed in. Agentic systems often fan out to multiple models/tools — each is a residency decision point. Note whether the provider may train on, log, or retain prompts/outputs, since that can move data across borders even when the inference endpoint is in-region.

| Model / provider | Purpose | Processing region | Retains / logs prompts? | Trains on data? | Cross-border transfer? |
|---|---|---|---|---|---|
| _<provider · model name>_ | _<reasoning / embeddings / tool>_ | _<region>_ | _Yes / No — retention period_ | _Yes / No_ | _None / <mechanism, e.g. SCCs>_ |

### 4.1 Cross-Border Transfer Rules

> Document any case where data legitimately crosses a region boundary, the legal mechanism that permits it, and the safeguards. If no transfers are allowed, state that explicitly — "none permitted" is a valid, auditable answer.

- _<transfer description, trigger condition, legal basis / safeguard, owner>_
- _<... or: "No cross-border transfers permitted for any data class.">_

## 5. Processors & Subprocessors

> Every party that stores or processes the data on your behalf, and their region. Subprocessors (sub-vendors of your processors) are the common residency gap — list them too. This supports COMP-02 (obligations are honored down the chain) and the review trigger in §9 (a new subprocessor is obligation drift).

| Party | Role (processor / subprocessor) | Data classes handled | Region(s) | DPA / contract ref |
|---|---|---|---|---|
| _<vendor name>_ | _Processor_ | _<classes>_ | _<region>_ | _<doc ref / link>_ |
| _<vendor name>_ | _Subprocessor (of <processor>)_ | _<classes>_ | _<region>_ | _<doc ref / link>_ |

## 6. Retention per Data Class (DATA-04)

> For each data class, the retention period and the deletion mechanism. Minimization includes time: data not needed must not be kept. Cover ephemeral state (conversation/working memory) as well as durable stores, since agent memory persists data that the team often forgets to bound. Do not stop at chat/memory: bound the ingested-but-transient residency surfaces too — uploaded documents and any OCR/extracted text, page/DOM/serialized client context transiting the orchestrator, and any guard/DLP-layer logs that may retain prompt content (PII).

| Data class | Store / location | Retention period | Deletion mechanism | Owner |
|---|---|---|---|---|
| _<class id>_ | _<store>_ | _<duration / "session only">_ | _<auto-expiry / job / API>_ | _<owner>_ |
| _EXAMPLE — delete this row: working_memory_ | _Agent short-term memory_ | _Session only (≤ 24h)_ | _TTL on memory store_ | _<owner>_ |
| _EXAMPLE — delete this row: uploaded_doc_ocr_ | _Document store + OCR text_ | _Bound to case lifecycle_ | _Deleted on case close / retention job_ | _<owner>_ |
| _EXAMPLE — delete this row: client_page_context_ | _Orchestrator (transient)_ | _Request only — not persisted_ | _Dropped after request_ | _<owner>_ |
| _EXAMPLE — delete this row: guard_layer_logs_ | _Guard / DLP logs (may hold prompt PII)_ | _<duration>_ | _<log-rotation / purge job>_ | _<owner>_ |

## 7. Residency Enforcement Points

> Show **where** and **how** residency is technically enforced, not merely promised. Each control below must map to a concrete mechanism and an evidence pointer (config, IaC, test, or audit log). A policy with no enforcement point is not evidence.

### 7.1 Memory Isolation & Encryption (MEM-02)

> How is agent memory (short-term, long-term, scratchpad) kept in-region, isolated, and encrypted at rest and in transit? Reference the store, key management, and the boundary that keeps one principal's memory from another. MEM-02 requires memory separated across **all four** axes below (tenant/customer, user, environment, sensitivity) — fill each, or mark N/A with a reason. Name the real isolation boundary — tenant, per-customer, or per-user — and how cross-boundary access fails closed; single-tenant systems are often still multi-customer, so do not just name the credential audience. Note relevance to **AGT-0x** memory-poisoning / cross-tenant-leak risk where applicable.

- **Memory store(s):** _<store + region>_
- **Encryption:** _at rest: <cipher / KMS key>; in transit: <TLS / mTLS>_
- **Isolation by tenant / customer:** _<per-tenant namespace / per-customer key or namespace — name it; cross-principal access fails closed>_
- **Isolation by user:** _<per-user partition — name it / N/A: reason>_
- **Isolation by environment:** _<dev / staging / prod durable memory do not share — how>_
- **Isolation by sensitivity:** _<how higher-sensitivity classes are separated / N/A: reason>_
- **Excluded from durable memory (write-gate boundary, MEM-01):** _<what is never persisted, e.g. raw PII / PAN, arbitrary instructions>_
- **Cross-customer / cross-principal memory-isolation test:** _<test ref proving foreign-id access fails closed>_
- **Evidence:** _<config / IaC path / test ref>_

### 7.2 Vector Store Isolation (RAG-05)

> How are RAG vector stores partitioned so retrieval never crosses the isolation boundary or regions? RAG-05 requires isolation across tenants **OR users** — name the real boundary (per-tenant / per-customer / per-user), not just per-tenant. Specify the isolation model (separate index / namespace / row-level filter) and where the vectors physically reside. Confirm retrieval queries cannot return another principal's or another region's chunks.
>
> **Branch — shared corpus:** if the corpus is shared across all principals and contains **no customer/regulated data**, per-principal partitioning is N/A. In that case the control becomes: (a) prove no customer/regulated data is embedded (corpus-content scan), and (b) source trust-tiering (RAG-01 / RAG-03). Mark the partition test **N/A with a reason** (do not delete the field, and do not invent a fake partition) — the per-customer leak risk for such systems is carried by durable memory in §7.1.

- **Vector store + region:** _<store + region>_
- **Isolation boundary:** _<per-tenant / per-customer / per-user — name it / N/A: shared corpus, no customer or regulated data>_
- **Isolation model:** _<dedicated index / namespace / metadata filter — name it / N/A: reason>_
- **Cross-boundary retrieval test:** _<test ref proving isolation holds / N/A: reason (shared corpus)>_
- **Shared-corpus content proof (if N/A above):** _<corpus-content scan ref showing no customer/regulated data embedded>_ · _**Source trust-tiering (RAG-01 / RAG-03):** <how sources are tiered>_
- **Evidence:** _<config / test ref>_

### 7.3 Routing Controls (COMP-02)

> The technical control that prevents an out-of-region store/process combination from §3 ever occurring at runtime — e.g. region-pinned endpoints, a routing gateway/policy engine, deny-by-default egress, request tagging by data class. This is what turns the matrix into enforcement.

- **Mechanism:** _<gateway / policy engine / endpoint pinning>_
- **Enforced rule:** _<e.g. "regulated data class → eu-* endpoints only; all else denied">_
- **Failure mode:** _<what happens on a blocked route — reject / hold / alert>_
- **Evidence:** _<policy-as-code / config / log sample ref>_

## 8. Minimization — Agent Data Access (DATA-04)

> Demonstrate the agent (and its tools/sub-agents) receive only the data needed for the task, scoped to the real isolation boundary and per step. Over-broad context is both a residency and a least-privilege failure. DATA-04 requires the agent cannot process or **route** regulated data outside allowed regions/processors — so record **where** each scope is enforced and whether that control is authoritative or compensating. Scope must be bound to the real principal (tenant **OR** per-customer) **server-side, fail-closed**, independent of model output; do not rely on a model/prompt-level constraint as the boundary.
>
> An **AI guard / DLP layer** is a **compensating** control, not the authorization boundary: record (a) whether an inbound-prompt and/or outbound-response guard is in the path, (b) its enforcement mode per environment (enforce / monitor / off — e.g. enforce in prod, monitor in staging), and (c) whether a guard block/redaction surfaces correctly to the user and to logs. A guard decision the UI renders as success (block-but-UI-shows-success) is a tracked discrepancy, not a pass.

| Agent / tool / sub-agent | Data it can access | Scope constraint | Enforcement location (authoritative / compensating) | Why it is needed |
|---|---|---|---|---|
| _<component>_ | _<data classes / fields>_ | _<per-customer/tenant filter / field allowlist / redaction>_ | _<server-side authz (authoritative) / model-side / guard layer (compensating)>_ | _<task justification>_ |
| _EXAMPLE — delete this row: AI guard / DLP layer_ | _<prompt + response content>_ | _<IBAN/PAN/PII detect + redact on egress>_ | _Guard layer (compensating); enforce in prod / monitor in staging — a block must not surface to the user as success_ | _<defence-in-depth on top of server-side authz>_ |

## 9. Review Cadence & Obligation-Drift Trigger

> State how often this policy is re-reviewed and the events that force an off-cycle review (obligation drift). Residency obligations change when regulations, contracts, providers, subprocessors, or regions change — any of these must re-open this policy. Tie back to COMP-02.

- **Scheduled review cadence:** _<e.g. quarterly / per-release at Gate 0>_
- **Next scheduled review:** _<YYYY-MM-DD>_
- **Off-cycle (drift) triggers:** _<e.g. new/changed subprocessor; new model/provider or region; new regulation or contract clause; new data class; customer residency commitment>_
- **Drift response owner:** _<name, role>_

## Sign-off

> All listed owners must approve before this document counts as evidence for the release. Security owner is mandatory; include data/privacy and compliance owners as the residency obligations require.

| Role | Name | Date | Decision |
|---|---|---|---|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
| Data / privacy owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
| Compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
