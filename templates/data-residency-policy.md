# Data Residency Policy

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** COMP-02, DATA-04, MEM-02, RAG-05
> **SDLC gate:** 0 — Use-Case Intake  ·  **Family:** Compliance, Data, Memory, RAG
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Purpose & Scope

> State which agentic system, environment(s), and tenants this policy governs, and what it proves. The purpose is to define where each data class may be stored/processed and how residency is enforced across memory, RAG, and model providers. This is captured at **Gate 0 (Use-Case Intake)** so residency constraints are known before design, not retrofitted.

This document defines the permitted storage and processing locations for each class of data handled by _<system / agent name>_, and the technical controls that enforce those constraints. It backs **COMP-02** (enforce obligations with technical controls), **DATA-04** (data minimization and residency), **MEM-02** (isolate and encrypt memory), and **RAG-05** (isolate vector stores per tenant).

- **In scope:** _<components, data stores, model providers, tenants covered>_
- **Out of scope:** _<explicitly excluded systems/data, with reason>_
- **Governing obligations:** _<regulations / contracts / customer commitments driving residency, e.g. GDPR, sectoral, or customer DPA terms>_

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

> For each data class, the retention period and the deletion mechanism. Minimization includes time: data not needed must not be kept. Cover ephemeral state (conversation/working memory) as well as durable stores, since agent memory persists data that the team often forgets to bound.

| Data class | Store / location | Retention period | Deletion mechanism | Owner |
|---|---|---|---|---|
| _<class id>_ | _<store>_ | _<duration / "session only">_ | _<auto-expiry / job / API>_ | _<owner>_ |
| _EXAMPLE — delete this row: working_memory_ | _Agent short-term memory_ | _Session only (≤ 24h)_ | _TTL on memory store_ | _<owner>_ |

## 7. Residency Enforcement Points

> Show **where** and **how** residency is technically enforced, not merely promised. Each control below must map to a concrete mechanism and an evidence pointer (config, IaC, test, or audit log). A policy with no enforcement point is not evidence.

### 7.1 Memory Isolation & Encryption (MEM-02)

> How is agent memory (short-term, long-term, scratchpad) kept in-region, isolated per tenant, and encrypted at rest and in transit? Reference the store, key management, and the boundary that keeps one tenant's memory from another. Note relevance to **AGT-0x** memory-poisoning / cross-tenant-leak risk where applicable.

- **Memory store(s):** _<store + region>_
- **Encryption:** _at rest: <cipher / KMS key>; in transit: <TLS / mTLS>_
- **Isolation boundary:** _<per-tenant namespace / key / account>_
- **Evidence:** _<config / IaC path / test ref>_

### 7.2 Per-Tenant Vector Store Isolation (RAG-05)

> How are RAG vector stores partitioned so retrieval never crosses tenants or regions? Specify the isolation model (separate index / namespace / row-level filter) and where the vectors physically reside. Confirm retrieval queries cannot return another tenant's or another region's chunks.

- **Vector store + region:** _<store + region>_
- **Isolation model:** _<dedicated index / namespace / metadata filter — name it>_
- **Cross-tenant retrieval test:** _<test ref proving isolation holds>_
- **Evidence:** _<config / test ref>_

### 7.3 Routing Controls (COMP-02)

> The technical control that prevents an out-of-region store/process combination from §3 ever occurring at runtime — e.g. region-pinned endpoints, a routing gateway/policy engine, deny-by-default egress, request tagging by data class. This is what turns the matrix into enforcement.

- **Mechanism:** _<gateway / policy engine / endpoint pinning>_
- **Enforced rule:** _<e.g. "regulated data class → eu-* endpoints only; all else denied">_
- **Failure mode:** _<what happens on a blocked route — reject / hold / alert>_
- **Evidence:** _<policy-as-code / config / log sample ref>_

## 8. Minimization — Agent Data Access (DATA-04)

> Demonstrate the agent (and its tools/sub-agents) receive only the data needed for the task, scoped per tenant and per step. Over-broad context is both a residency and a least-privilege failure. List the access scopes and how they are constrained.

| Agent / tool / sub-agent | Data it can access | Scope constraint | Why it is needed |
|---|---|---|---|
| _<component>_ | _<data classes / fields>_ | _<tenant filter / field allowlist / redaction>_ | _<task justification>_ |

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
