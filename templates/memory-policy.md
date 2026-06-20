# Memory Policy

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06
> **SDLC gate:** 2 — Secure Design  ·  **Family:** Data, RAG, and Memory
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and intent

> State which agent(s) and memory stores this policy governs and why durable memory is a security boundary here. Memory persists across turns and sessions, so a poisoned or unverified write can steer future behavior (AGT-05 — Memory Poisoning / Persistent Manipulation). Name the autonomy level and whether memory feeds high-impact actions, since that raises the bar for MEM-01/MEM-04/MEM-06.

This policy governs durable memory for _<system / agent name>_ operating at autonomy level _<supervised / semi-autonomous / autonomous>_.

- **What persists across sessions:** _<short description — e.g. user preferences, task state, learned facts>_
- **Why memory is in scope:** memory can influence later decisions and tool calls; this policy constrains what may be written, how it is isolated, reviewed, expired, and integrity-protected.
- **Out of scope:** _<e.g. ephemeral in-context scratchpad cleared each turn; transient session cache>_ — state the boundary so reviewers know what this evidence does and does not cover.

## 2. Memory stores inventory

> List every durable memory store the agent reads from or writes to, and exactly what each persists. Reviewers cannot assess MEM-02 isolation or MEM-06 integrity for stores they don't know exist. One row per store; mark anything ungoverned by this policy as a gap.

| Store ID | Type (e.g. vector DB / KV / graph / relational) | What it persists | Written by agent? | Sensitivity class | Backing control(s) |
|----------|--------------------------------------------------|------------------|-------------------|-------------------|--------------------|
| _<store-1>_ | _<type>_ | _<contents>_ | _Yes / No_ | _<public / internal / confidential / PII>_ | MEM-01, MEM-02, MEM-06 |
| _<store-2>_ | _<type>_ | _<contents>_ | _Yes / No_ | _<class>_ | _<IDs>_ |
| _EXAMPLE — delete this row: longterm-prefs_ | _Vector DB (per-user namespace)_ | _User preferences, prior task summaries_ | _Yes_ | _Confidential (may contain PII)_ | _MEM-01, MEM-02, MEM-05, MEM-06_ |

## 3. Write-gating before durable writes (MEM-01)

> Show that durable memory writes are scanned, policy-checked, and cannot store arbitrary instructions as trusted memory. Describe the gate that sits between a proposed write and the store: what it scans for (injected instructions, secrets, oversized/malformed payloads), what it rejects vs. quarantines, and what is logged. Evidence = memory write logs.

- **Gate location:** _<component / service that intercepts every durable write>_
- **Checks applied before a write is accepted:**
  - _<scan for embedded/injected instructions — content is treated as data, never as trusted directives>_
  - _<policy checks: allowed fields, size limits, schema validation, secret/PII detection>_
  - _<source-trust check: who/what proposed the write>_
- **Rejected-write handling:** _<dropped / quarantined / flagged for review>_ — see §5 for quarantine.
- **Logging:** every durable write attempt is logged with _<who, what, source, decision, timestamp>_ at _<log location>_.

> Enumerate every upstream channel that can influence a durable write and how each is neutralized before persistence. Each untrusted channel (conversation history, uploaded/OCR'd content, RAG content, page/DOM/serialized client context) is a documented injection vector (ARCH-02) and must be treated as data, never as trusted directives, before it can reach the store.

| Upstream channel that can influence a write | Trust level | Neutralized how (data-only / stripped / never persisted) |
|---------------------------------------------|-------------|----------------------------------------------------------|
| _<conversation history>_ | _<trusted / untrusted>_ | _<data-only / stripped / never persisted>_ |
| _<uploaded / OCR'd content>_ | _<trusted / untrusted>_ | _<data-only / stripped / never persisted>_ |
| _<RAG / retrieved content>_ | _<trusted / untrusted>_ | _<data-only / stripped / never persisted>_ |
| _<page / DOM / serialized client context>_ | _<trusted / untrusted>_ | _<data-only / stripped / never persisted>_ |

> If the write-gate relies on a shared guard/firewall, state its mode (enforce vs monitor) per environment and confirm a blocked write is logged as blocked and not reported as success to the UI/caller. A guard decision the UI renders as success (block-but-UI-shows-success) is a tracked discrepancy, not a pass; the guard is a COMPENSATING control and does not replace the write-gate's own checks.

| Field | Value |
|-------|-------|
| Writes scanned + policy-checked before persistence? | _Yes / No_ |
| Can free-text instructions be stored as trusted memory? | _No (required) / explain_ |
| Memory write log location | _<path / system>_ |
| Evidence link (write logs / gate config) | _<link>_ |

## 4. Isolation and encryption (MEM-02)

> Demonstrate memory is separated by tenant, user, environment, and sensitivity, and protected at rest and in transit. Cross-boundary leakage lets one user's poisoned or private memory reach another (AGT-03, AGT-05). Reference the identity/segmentation control that scopes access (ID-03). Evidence = isolation tests + encryption config. Name the real isolation boundary — tenant, per-customer, or per-user — and how cross-boundary access fails closed. Single-tenant systems are often still multi-customer; do not just name the credential audience. For a single-tenant multi-customer system, per-customer is the load-bearing boundary: mark Tenant N/A with a reason, treat the User / customer row as primary, and add the explicit fail-closed row below with a negative-test "Verified by".

| Boundary | How enforced | Verified by |
|----------|--------------|-------------|
| Tenant | _<namespace / separate index / row-level scoping; or N/A — reason>_ | _<isolation test ref>_ |
| User / customer | _<per-user / per-customer namespace / key>_ | _<test ref>_ |
| Cross-principal (foreign-id) access fails closed | _<server-side denial of foreign user/customer ids>_ | _<negative-test ref — e.g. 0 leaks>_ |
| Environment (dev/stage/prod) | _<separate stores / credentials>_ | _<test ref>_ |
| Sensitivity class | _<separate stores or access tiers per class>_ | _<test ref>_ |

- **Encryption at rest:** _<algorithm / KMS / key rotation>_
- **Encryption in transit:** _<TLS version / mTLS between agent and store>_
- **Access scoping (ID-03):** memory access is bound to _<authenticated identity / least-privilege scope>_ so an agent cannot read or write outside its boundary.
- **Cross-boundary leakage test result:** _Pass / Fail_ — _<link to isolation test evidence>_

## 5. Review, rollback, quarantine, deletion, restore (MEM-03)

> Prove memory can be inspected, corrected, quarantined, deleted, and restored to a known-safe version. This is the recovery path after a poisoning incident (links to IR-02) and depends on integrity/versioning (MEM-06) and operational logging (OPS-01). Evidence = runbook + drill evidence. Each procedure needs an owner and a tested path, not just a claim it's possible.

| Procedure | How performed | Who can invoke | Last tested (YYYY-MM-DD) | Evidence |
|-----------|---------------|----------------|--------------------------|----------|
| Inspect / review | _<UI / query / export>_ | _<role>_ | _<date>_ | _<link>_ |
| Correct / edit | _<process>_ | _<role>_ | _<date>_ | _<link>_ |
| Quarantine | _<isolate suspect entries from recall>_ | _<role>_ | _<date>_ | _<link>_ |
| Delete | _<hard delete / honors data-subject request>_ | _<role>_ | _<date>_ | _<link>_ |
| Restore to known-safe version | _<rollback mechanism, ties to MEM-06 versioning>_ | _<role>_ | _<date>_ | _<link>_ |

- **Runbook location:** _<link to memory recovery runbook>_
- **Most recent drill:** _<date>_ — outcome _<pass / issues found + remediation>_ — _<link to drill evidence>_

## 6. Block self-ingestion into trusted memory (MEM-04)

> Confirm agent-generated output is NOT automatically re-ingested as trusted durable memory. Self-ingestion creates a feedback loop where the agent's own (possibly poisoned or hallucinated) output becomes trusted ground truth (AGT-05). Show where the loop is broken and what, if anything, is allowed to promote agent output to trusted memory. Evidence = memory policy tests.

- **Default for agent-generated output:** _<not persisted as trusted / persisted only as low-trust + expiring per §7>_
- **Loop-break point:** _<where the pipeline prevents auto-promotion of model output>_
- **Promotion path (if any):** agent output becomes trusted memory only via _<explicit human verification / external validation>_ — never automatically.

| Field | Value |
|-------|-------|
| Agent output auto-ingested as trusted memory? | _No (required) / explain_ |
| Conditions that promote agent output to trusted | _<none / human-verified only>_ |
| Policy-test evidence link | _<link>_ |

## 7. Expiry and decay of low-trust memory (MEM-05)

> Show that unverified or low-trust memory decays or expires unless validated, so transient or unverified content cannot quietly become permanent (AGT-05). Depends on the trust labeling from MEM-01 and integrity/provenance from MEM-06. Evidence = retention policy + expiry test.

| Trust tier | TTL / decay rule | What revalidates / promotes it | Verified by |
|-----------|------------------|--------------------------------|-------------|
| Low-trust / unverified | _<e.g. expires after N days unless validated>_ | _<human review / external confirmation>_ | _<expiry test ref>_ |
| Verified / trusted | _<retention rule>_ | _<n/a or periodic re-attestation>_ | _<ref>_ |

- **Retention policy location:** _<link>_
- **Expiry test result:** _Pass / Fail_ — _<link showing unverified entries actually expire>_

## 8. Integrity protection (MEM-06)

> Demonstrate durable memory writes are versioned and integrity-protected (checksums/signatures with verification), and that high-impact memory is surfaced only with sufficient provenance plus a human-verified tag. This underpins rollback (MEM-03) and expiry (MEM-05) and defends against silent tampering (AGT-05). Evidence = integrity config + verification test.

- **Versioning:** _<every write versioned / append-only log / point-in-time restore>_
- **Integrity mechanism:** _<checksum / digital signature>_ — verified _<on read / on recall / on restore>_
- **High-impact recall gate:** memory that can drive high-impact actions is surfaced only when it carries _<sufficient provenance>_ **plus** a _human-verified_ tag.

> If memory cannot drive high-impact actions — e.g. high-risk actions are draft/propose-only and execution happens out-of-band behind step-up auth / SCA outside the agent — answer the recall-gate row "N/A — memory does not drive high-impact actions" with that reason rather than a misleading Yes or a bare No; state explicitly where the real execution gate lives (cross-ref §1 "whether memory feeds high-impact actions").
- **Tamper-detection behavior:** on a failed integrity check the system _<rejects / quarantines / alerts>_.

| Field | Value |
|-------|-------|
| Writes versioned? | _Yes / No_ |
| Integrity verified on use (not just on write)? | _Yes / No_ |
| High-impact memory requires provenance + human-verified tag? | _Yes / No / N/A — memory does not drive high-impact actions (state where the real execution gate lives)_ |
| Verification-test evidence link | _<link>_ |

## 9. Residual risks and accepted gaps

> Record any control not fully met, the residual risk, and the decision. Note: none of MEM-01..MEM-06 may be marked "Accepted Risk" if it is a hard-floor control for this system — confirm against `docs/checklist.md` before accepting a gap. List compensating measures where a gap is accepted.

| Control | Gap / residual risk | Compensating measure | Decision (Accept / Remediate by date) | Owner |
|---------|---------------------|----------------------|---------------------------------------|-------|
| _<MEM-0x>_ | _<description>_ | _<measure>_ | _<decision>_ | _<owner>_ |

## Sign-off

> Security owner sign-off is mandatory. Add risk and data/privacy owners because memory commonly persists PII and sensitivity-classified data (MEM-02). Delete this guidance line before submitting.

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Risk owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Data / privacy owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Product / system owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
