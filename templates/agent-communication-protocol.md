# Agent Communication Protocol

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** A2A-01, A2A-02, A2A-03, A2A-04, A2A-05, A2A-07
> **SDLC gate:** 2 — Secure Design  ·  **Family:** Agent-to-Agent and Multi-Agent
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and Topology

> Name every agent and trust domain that participates in this protocol. This artifact only carries evidence weight for the agents and channels listed here. If your system is single-agent (no agent-to-agent messaging), record that fact and mark the A2A controls _N/A_ with this document as the justification — do not leave them unassessed — in that case complete §1 topology + the §9 disposition table only; sections 2-8 are N/A by that declaration and may be left empty (do not delete them).
> Define "trust domain" for your deployment (e.g. same process, same tenant, partner org, third-party tool) — A2A-01 verification of trust domain depends on this being unambiguous.

**Protocol name / version:** _<protocol id, vN>_
**Transport / framing:** _<e.g. gRPC over mTLS, signed JSON over HTTPS, message bus topic>_

| Agent / role | Trust domain | Can send to | Can receive from | Notes |
| --- | --- | --- | --- | --- |
| _<orchestrator>_ | _<domain>_ | _<roles>_ | _<roles>_ | _<...>_ |
| _<subagent A>_ | _<domain>_ | _<roles>_ | _<roles>_ | _<...>_ |

> EXAMPLE — delete this row: `planner` | `tenant-internal` | `retriever, executor` | `orchestrator` | spawns retriever subagents only

## 2. Message Schema and Required Fields

> Captures `mustCapture: Message schema and required fields` and grounds A2A-02 (schema validation). Define the canonical envelope every inter-agent message MUST conform to. Each field below should map to a concrete validation rule in §4. Reference the authoritative schema file rather than re-typing it if one exists.

**Schema definition (authoritative location):** _<path/URL to schema, e.g. `schemas/a2a-message.v1.json`>_

| Field | Type | Required | Purpose | Validation rule |
| --- | --- | --- | --- | --- |
| `message_id` | _<string/uuid>_ | yes | uniqueness, replay key | _<format + uniqueness check>_ |
| `sender_id` | _<string>_ | yes | identity binding (A2A-01) | _<must match authenticated principal>_ |
| `trust_domain` | _<string>_ | yes | domain check (A2A-01) | _<allowed-domain set>_ |
| `role` | _<enum>_ | yes | role check (A2A-01) | _<allowed-role set>_ |
| `timestamp` | _<RFC3339>_ | yes | freshness / replay window (A2A-02) | _<max skew, e.g. ±N s>_ |
| `nonce` | _<string>_ | yes | replay protection (A2A-02) | _<single-use within window>_ |
| `intent_ref` | _<string>_ | _<yes/cond>_ | links to original user intent (A2A-05) | _<must resolve to a live authorization>_ |
| `payload` | _<object>_ | yes | task content (untrusted, A2A-03) | _<schema-validated; no control directives>_ |
| `signature` / `auth` | _<string>_ | yes | authentication (A2A-01) | _<verify per §3>_ |

> Add or remove rows to match your real envelope. Every "yes" field must be enforced as fail-closed in §4 — a field listed as required but not enforced is a finding, not evidence.

## 3. Authentication (A2A-01)

> Captures `Authentication: sender identity, environment, role, trust domain; mutual auth (A2A-01)`. Pass criterion: *sender identity, environment, role, and trust domain are verified.* Describe the mechanism, not just "we authenticate". A2A-01 depends on ID-04 (workload/agent identity) and ID-06 — reference those evidence artifacts here rather than restating them.
> Related risk: AGT-08 (rogue/impersonated agent). Mutual authentication means **both** ends prove identity — a one-way scheme does not satisfy this control for bidirectional channels.

| Attribute verified | Mechanism | Where enforced | Evidence reference |
| --- | --- | --- | --- |
| Sender identity | _<e.g. mTLS client cert, signed token, mesh SPIFFE ID>_ | _<component>_ | _<protocol log / identity config ref>_ |
| Environment | _<e.g. attested workload, prod-vs-test claim>_ | _<component>_ | _<ref>_ |
| Role | _<role claim source + check>_ | _<component>_ | _<ref>_ |
| Trust domain | _<domain claim + allowlist>_ | _<component>_ | _<ref>_ |

- **Mutual authentication:** _<describe how both peers authenticate, or state and justify if one-way>_
- **Identity source of truth (ID-04 / ID-06):** _<ref>_
- **Key / credential rotation:** _<frequency + mechanism>_
- **Failure behavior:** _Unauthenticated or identity-mismatched messages are rejected (fail closed)._ Evidence: _<log sample / test ref>_

## 4. Schema Validation and Replay Protection (A2A-02)

> Captures `Schema validation + replay protection; malformed/replayed/unsafe messages fail closed (A2A-02)`. Pass criterion: *malformed, unknown, replayed, or unsafe messages fail closed.* This is where you prove the §2 schema is actually enforced and that replays are rejected. A2A-02 depends on A2A-01 (authenticated sender) and ARCH-02.
> Fail closed = reject and do not act, not "log and continue". For each rejection class below, point at a test that demonstrates the failure path.

| Rejection class | Detection rule | Action on violation | Test / evidence reference |
| --- | --- | --- | --- |
| Malformed (schema mismatch) | _<validator + schema ref>_ | reject, no side effect | _<protocol test ref>_ |
| Unknown field / unknown message type | _<strict/unknown-field policy>_ | reject | _<test ref>_ |
| Replayed (duplicate `message_id`/`nonce`) | _<replay cache / window>_ | reject | _<test ref>_ |
| Stale (timestamp outside window) | _<max skew>_ | reject | _<test ref>_ |
| Unsafe payload (injected directives, oversize, etc.) | _<filter / size limit>_ | reject | _<test ref>_ |

- **Replay window / nonce store:** _<TTL, storage, scope>_
- **Default disposition for anything not explicitly allowed:** _reject (fail closed)_

## 5. Subagent Output Trust Boundary (A2A-03)

> Captures `Subagent output treated as untrusted — cannot grant permissions or modify policy (A2A-03)`. Pass criterion: *subagent output cannot grant permissions, modify policy, or bypass approval.* Subagent results are data, not instructions. Document the boundary that prevents a compromised or manipulated subagent from escalating. A2A-03 depends on ARCH-02 and ARCH-03 (privilege/architecture separation). Related risks: AGT-08, AGT-13.

- **Where subagent output enters the parent:** _<component / call site>_
- **What subagent output is allowed to do:** _<e.g. return content only, fill a typed result slot>_
- **What it is explicitly prevented from doing:** _grant/elevate permissions · change policy or config · auto-approve a gated action · select its own tools beyond allowlist_
- **Enforcement mechanism:** _<e.g. typed result contract, policy engine ignores fields from subagent role, no eval of subagent text>_
- **Evidence (integration tests):** _<test ref showing a malicious subagent result cannot escalate>_

## 6. Delegation Rules (A2A-04)

> Captures `Delegation rules: allowlist, scope, depth limit, monitoring (A2A-04)`. Pass criterion: *delegation is allowlisted, scoped, depth-limited, and monitored.* Define exactly who may delegate to whom, with what scope, how deep, and how it is watched. A2A-04 depends on TOOL-02 and ID-04. Related risks: AGT-08, AGT-13.

| Delegating role | May delegate to (allowlist) | Scope granted (≤ delegator's) | Max depth | Monitored via |
| --- | --- | --- | --- | --- |
| _<role>_ | _<allowed targets>_ | _<scoped permissions>_ | _<N>_ | _<log / alert ref>_ |

> EXAMPLE — delete this row: `orchestrator` | `retriever, summarizer` | read-only retrieval scope | `2` | A2A delegation log + SIEM rule X

- **Delegation depth limit (global):** _<N>_ — behavior on exceed: _reject (fail closed)_
- **Scope rule:** _delegated scope is a subset of the delegator's scope; no privilege gain_
- **Monitoring:** _<what is logged per delegation; where alerts fire; ties to A2A-06 / OPS-01 if applicable>_
- **Evidence (delegation policy):** _<policy ref / config ref>_

## 7. Re-Verification of Original User Intent (A2A-05)

> Captures `Re-verification of original user intent/authorization at execution (A2A-05)`. Pass criterion: *internal requests do not bypass user intent or authorization checks.* This defends against the confused-deputy problem: an internal agent-to-agent message must not be able to perform an action the originating user was never authorized to request. A2A-05 depends on PROMPT-06 and ID-02. Related risks: AGT-03, AGT-08.
> Even single-agent: if the agent makes authorized backend calls on the user's behalf, the confused-deputy / authorization re-check still applies — record where it is enforced or cross-reference the tool/identity evidence rather than marking it blanket _N/A_. Name the real isolation boundary — tenant, per-customer, or per-user — and how cross-boundary access fails closed; single-tenant systems are often still multi-customer, so do not just name the credential audience. Where the agent only proposes/drafts a high-risk action and real execution happens out-of-band (e.g. behind step-up auth / SCA in a downstream system), state that explicitly and name where the real execution gate lives — that location is the evidence, not a bare _N/A_.

- **How original user intent/authorization is carried:** _<e.g. `intent_ref` token, signed authorization context>_
- **Re-check performed at execution time:** _<what is re-verified just before the side-effecting action, by which component>_
- **Internal requests are subject to the same authorization checks as external ones:** _<describe; no internal bypass path>_
- **Confused-deputy test evidence:** _<test ref demonstrating an internal request cannot exceed the user's authorization>_

## 8. Independent Validation for Mission-Critical Decisions (A2A-07)

> Captures `Quorum/consensus or signed validation for mission-critical multi-agent actions (A2A-07)`. Pass criterion: *high-impact multi-agent actions require quorum/consensus or a signed behavioral manifest with periodic attestation before execution; unattested or non-conforming agents are blocked.* Define which actions are "mission-critical" and the independent-validation mechanism that gates them. A2A-07 depends on A2A-01 and GOV-03. Related risks: AGT-08, AGT-13.
> Pick the mechanism that fits your architecture (quorum/consensus **or** signed manifest + attestation) — both are valid; state which you use and why.

**Mission-critical action classes (gated by A2A-07):** _<list, e.g. fund movement, irreversible deletion, production deploy>_

| Critical action | Validation mechanism (quorum / signed manifest) | Threshold / attestation cadence | Block-on-fail behavior | Evidence reference |
| --- | --- | --- | --- | --- |
| _<action>_ | _<e.g. 2-of-3 independent agents / signed manifest + weekly attestation>_ | _<N-of-M or cadence>_ | _<unattested or dissenting → blocked>_ | _<quorum/attestation config, manifest record ref>_ |

- **Independence of validators:** _<how validators avoid sharing the failure mode being checked>_
- **Behavior for unattested / non-conforming agents:** _blocked from executing the critical action_
- **Evidence (quorum/attestation config, manifest records):** _<refs>_

## 9. Residual Risk and Assumptions

> Record anything not fully covered, any control marked _N/A_ with its justification, and the AGT risks (AGT-03, AGT-08, AGT-13) you consider accepted vs mitigated. A hard-floor control cannot be marked Accepted Risk — if one is unmet, it is a blocker, not residual risk.

| Item | Control | Disposition (Met / N/A / Accepted Risk) | Justification |
| --- | --- | --- | --- |
| _<item>_ | _<A2A-0x>_ | _<...>_ | _<...>_ |

## Sign-off

> Security owner sign-off is mandatory. Add product/risk owners for systems performing mission-critical multi-agent actions (A2A-07). Delete this guidance before sign-off.

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Engineering / system owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Risk / compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
