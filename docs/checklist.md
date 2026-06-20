# Secure SDLC and Hardening Checklist for Agentic Systems

Owner: Security / AI Platform
Status: Canonical v1.0
Last reviewed: 2026-06-20
Source: Canonical baseline — a reviewed, consolidated simplification of an earlier 229-control synthesis, with coverage controls reinstated after an independent blind coverage analysis (see Appendix C).

## 1. How to Use This Checklist

This checklist is for teams building or operating agentic AI systems: systems where an AI component can plan, use tools, retrieve context, write memory, communicate with other agents, influence human decisions, or execute actions.

Use it in six steps:

1. Confirm that the system is agentic and in scope.
2. Select the applicability profiles that match the system.
3. Walk the SDLC gates from intake through decommissioning.
4. Mark each in-scope control as `Pass`, `Fail`, `Partial`, `Not Applicable`, or `Accepted Risk`.
5. Clear the Non-Waivable Release Floor before production launch.
6. Store the evidence package and review it on the operating cadence.

> Not every control applies to every system. Select the applicability profiles first (step 2) to scope the list, then mark any remaining control that still does not fit your system as `Not Applicable` (with a brief recorded reason) and skip it when completing the rest — only in-scope controls need a `Pass` / `Fail` / `Partial` assessment.

Status rules:

- `Pass`: the control is implemented and evidence exists.
- `Fail`: the control is missing or does not work.
- `Partial`: part of the control is implemented, but gaps remain.
- `Not Applicable`: the control does not apply to this system, with a recorded reason.
- `Accepted Risk`: the control is not met, but the risk owner and security owner have approved a time-bound exception with compensating controls and a remediation ticket.

Hard-floor rule:

- Controls in the Non-Waivable Release Floor cannot be marked `Accepted Risk`.
- They must be `Pass`, except conditional controls that may be `Not Applicable` with recorded justification.

This is a governance and engineering baseline, not a legal standard. AI-assisted wording in this document should be verified against primary sources before it is used for high-stakes code execution, cross-tenant access, money movement, cyber-physical actuation, credential revocation, or regulatory attestation.

## 2. Applicability Profiles

Start with `Core`, then add every profile that matches the system. A system often matches several profiles.

| Profile | Use when | Add these control families |
| --- | --- | --- |
| Core | Any agentic system with consequential output, untrusted input, or planning. | GOV, ARCH, PROMPT, OUT, DATA, ID, OPS, RES, HITL, SUP, TEST, CHG, IR, DEC |
| Tool-Using | The agent calls tools, APIs, functions, MCP servers, or workflows. | TOOL; add CODE if it can execute code, queries, shell, browser automation, templates, or scripts |
| RAG / Memory | The agent retrieves from documents, web, vector stores, email, or uses persistent/shared memory. | RAG, MEM |
| Multi-Agent | The system uses subagents, delegation, agent-to-agent messages, MCP/A2A, or orchestration. | A2A |
| Regulated | The system has legal, contractual, residency, retention, or customer attestation obligations. | COMP |
| Cyber-Physical | The agent can actuate, gate, schedule, or override physical, OT/ICS, robotics, medical, vehicle, or safety-relevant systems. | CPS |

Core is the default baseline. It is not the same as the non-waivable floor. The non-waivable subset is listed in Section 7.

Code-execution rows carry the row-level profile tag `Tool-Using (Code Exec)`. This is not a separate top-level profile: it is a sub-variant of **Tool-Using**, scoped to systems that can execute code, queries, shells, browser automation, or templates. Select it as part of the Tool-Using profile (the `+ CODE` case above); the reader folds it onto the `Tool-Using` filter.

## 3. Autonomy Model

Use one autonomy model across intake, design, testing, and approvals.

| Level | Name | Meaning | Typical oversight |
| --- | --- | --- | --- |
| A0 | Advisory | The agent only produces information or recommendations. | Review output quality and sensitive disclosure. |
| A1 | Assisted Action | The agent proposes an action, but a human executes it. | Human verifies evidence and action details. |
| A2 | Supervised Delegation | The agent executes bounded actions under live monitoring or clear interruption paths. | Human-on-the-loop, pause/kill switch, policy gates. |
| A3 | Autonomous Operation | The agent can decide and act within a bounded mission without immediate human confirmation. | Strong policy gates, monitoring, circuit breakers, and incident readiness. |

High-impact, irreversible, external, regulated, or safety-relevant actions should not be A3 without explicit risk acceptance and strong compensating controls.

## 4. Risk Model and OWASP Crosswalk

`AGT-*` IDs are local risk-family IDs for this document. They are not official OWASP identifiers.

Official mappings:

- OWASP Agentic Security Initiative: `T1-T17`.
- OWASP LLM Top 10 2025: `LLM01`-`LLM10` (canonical form `LLM01:2025`-`LLM10:2025`; this document uses the short `LLM01`-`LLM10` form in tables).
- Any `ASI*` terms from community or NotebookLM source material must not be cited as official OWASP IDs.

<!-- BEGIN GENERATED:riskmodel — edit app/data.js, then run: node build.js -->
| Local ID | Risk family | Failure mode | OWASP Agentic | OWASP LLM 2025 |
| --- | --- | --- | --- | --- |
| AGT-01 | Goal and intent manipulation | Attacker redirects goals, plans, or task selection. | T6 | LLM01, LLM06 |
| AGT-02 | Tool misuse and unsafe agency | Legitimate tools are chained into unsafe actions. | T2 | LLM06 |
| AGT-03 | Identity and privilege compromise | Agent abuses inherited, delegated, cached, or spoofed privileges. | T3, T9 | LLM06 |
| AGT-04 | Sensitive disclosure and exfiltration | Sensitive data leaks through output, tools, logs, memory, or external messages. | T2, T3, T13, T15 | LLM02 |
| AGT-05 | Memory, RAG, vector, and context poisoning | Attacker corrupts context, memory, embeddings, or stored knowledge. | T1 | LLM04, LLM08 |
| AGT-06 | Insecure output handling | Model output is used unsafely by HTML, SQL, shell, code, config, or workflow sinks. | T11 | LLM05 |
| AGT-07 | Unexpected code execution / RCE | Agent writes or executes unsafe code, commands, queries, or automation. | T11 | LLM05, LLM06 |
| AGT-08 | Agent communication abuse | Agent-to-agent channels spread spoofed identity, unsafe instructions, or protocol abuse. | T12, T14, T16 | LLM01, LLM06 |
| AGT-09 | Cascading hallucination and misinformation | Plausible false output propagates through tools, agents, memory, or human decisions. | T5 | LLM09 |
| AGT-10 | Human oversight and trust exploitation | Agent misleads, overwhelms, or manipulates human reviewers. | T10, T15 | LLM06, LLM09 |
| AGT-11 | Resource overload and denial of wallet | Agent consumes excessive tokens, tools, memory, compute, queues, or external services. | T4 | LLM10 |
| AGT-12 | Supply chain compromise | Models, prompts, tools, plugins, libraries, or connectors are compromised. | T17 | LLM03 |
| AGT-13 | Rogue, misaligned, or deceptive agents | Agent operates outside purpose, owner, policy, lifecycle, or monitoring. | T7, T13 | LLM06 |
| AGT-14 | Repudiation and audit gaps | Agent actions cannot be attributed, reconstructed, or verified. | T8 | Cross-cutting |
| AGT-15 | System prompt, secret, and policy leakage | Hidden prompts, policies, secrets, credentials, or internal config leak. | T3, T9, T13 | LLM02, LLM07 |
<!-- END GENERATED:riskmodel -->

## 5. Security Principles

- Treat all model inputs as untrusted.
- Separate instructions from data.
- Bind every consequential action to user intent, policy authorization, scoped credentials, and audit evidence.
- Enforce critical controls outside the model.
- Assume prompt injection will occur; focus on containment and recovery.
- Give agents the least agency and least privilege needed for the task.
- Make human oversight evidence-based.
- Make audit trails tamper-evident enough to reconstruct actions.
- Fail safe for irreversible or cyber-physical effects.
- Plan for the full lifecycle, including decommissioning.
- Map compliance obligations to enforceable controls and evidence.

## 6. SDLC Gates

Each gate lists the decision to make, the required outcomes, and the control families to assess. Use the profile table to decide which families are in scope.

| Gate | Objective | Required outcomes | Families to assess |
| --- | --- | --- | --- |
| 0. Use-Case Intake | Decide whether agentic behavior is justified and how autonomous it may be. | Autonomy level, owners, data classification, high-risk actions, oversight model, compliance scope, cyber-physical scope. | Governance, Compliance |
| 1. Architecture and Threat Modeling | Model agent-specific trust boundaries. | Data-flow diagram, untrusted-input map, AGT mapping, containment boundaries. | Architecture |
| 2. Secure Design | Convert risks into enforceable design controls. | Tool permission matrix, policy gates, memory/RAG policy, approval policy, A2A protocol, logging design, failure containment, fail-safe design where applicable. | Tools, Identity, Memory, A2A, HITL, Resource, Operations, CPS |
| 3. Secure Implementation | Implement deterministic enforcement around nondeterministic reasoning. | Server-side authorization, schemas, output handling, scoped credentials, memory gates, sandboxing, prompt-independent controls. | Prompt, Output, Code, Data, RAG, Supply Chain, CPS |
| 4. Security Testing and Red Teaming | Prove unsafe paths fail closed. | Red-team suite mapped to AGT risks, injection fixtures, tool misuse tests, HITL tests, CPS tests, regression tests. | Testing |
| 5. Release Readiness | Ensure production can be observed, constrained, disabled, and investigated. | Passing tests, current risk register, monitoring, runbooks, kill-switch drill, access review, rollback plan, compliance sign-off where needed. | All in-scope families (then clear the Release Floor in Section 7 and assemble the Evidence Package in Section 10) |
| 6. Runtime Operations | Detect misuse, poisoning, drift, and unsafe automation. | Monitoring by family, agentic logs, alerts, triage flow, review cadence. | Operations |
| 7. Incident Response | Contain compromised agents and recover trust. | Disable path, credential rotation, quarantine, evidence preservation, blast-radius analysis, rollback, notification, regression tests. | Incident Response |
| 8. Change Management | Prevent silent risk expansion. | Review for new tools, autonomy, memory/RAG, models, prompts, outputs, A2A, compliance flows, and monitoring changes. | Change, Compliance |
| 9. Decommissioning | Retire an agent without leaving live attack surface. | Deactivation plan, credential revocation, data/memory disposition, connector teardown, final evidence snapshot, downstream cutover. | Decommissioning |

Testing gate release thresholds:

- Critical findings: zero open at release.
- High findings: zero open unless accepted by the business owner and security owner with expiry and compensating controls.
- Medium findings: tracked with owner and due date.
- Critical attack-success-rate target: 0 percent successful unsafe critical outcomes.

## 7. Non-Waivable Release Floor

The following must be clear before production launch.

Hard-floor status rule:

- `Accepted Risk` is not allowed for these controls.
- Use `Pass`, or `Not Applicable` with recorded justification for conditional controls.

| Control | Requirement |
| --- | --- |
| GOV-01 | Named product, engineering, security, and operations owners exist. |
| GOV-03 | High-risk actions are inventoried. |
| GOV-04 | The release floor is recorded in the release checklist. |
| ARCH-01, ARCH-02 | Data flow and untrusted inputs are documented. |
| TOOL-01, TOOL-03, TOOL-04 | Tools are inventoried, parameters are validated server-side, and high-risk tool calls are policy-gated. Applies when the system is tool-using. |
| ID-03 | User and tenant isolation is verified. |
| DATA-02 | Sensitive data cannot leave through unauthorized output channels. |
| CODE-01 or CODE-02 | Arbitrary execution is disabled, or approved execution is sandboxed. Applies when code/query/shell/template execution is possible. |
| OPS-01, OPS-02, OPS-05 | Agent actions are logged, tampering is detectable, and a kill switch exists. |
| IR-01, IR-03 | Components can be disabled and evidence can be preserved. |
| CPS-02, CPS-03, CPS-04 | Cyber-physical commands are bounded, out-of-model safety interlocks can block unsafe action, and emergency shutdown works. Applies only to cyber-physical or safety-relevant systems. |
| DEC-02 | Agent credentials, tokens, and non-human identities can be revoked and verified inactive. |

## 8. Hardening Checklist

The checklist below is intentionally concise. It keeps the control intent, pass criteria, evidence, and risk mapping. Technology examples are optional unless your architecture explicitly standardizes on them.

The `Profile` column is a row-level scope tag. A row can be narrower than its family: for example, some prompt-injection rows apply only when RAG or memory is present.

<!-- BEGIN GENERATED:controls — edit app/data.js, then run: node build.js -->

### Governance

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| GOV-01 | Core | Assign owners. | Product, engineering, security, and operations owners are named, with escalation contacts. | Owner record, on-call rotation. | AGT-13, AGT-14 |
| GOV-02 | Core | Classify autonomy. | Each agent has an A0-A3 autonomy level and oversight model. | Intake record. | AGT-01, AGT-02, AGT-10 |
| GOV-03 | Core | Define high-risk actions. | Writes, deletes, sends, approvals, execution, configuration, sensitive disclosure, and actuation are risk-rated. | Action inventory. | AGT-02, AGT-04, AGT-07 |
| GOV-04 | Core | Define release floor and waiver rules. | Hard-floor controls cannot be accepted risk; other waivers require owners, expiry, compensating control, and remediation ticket. | Release checklist, risk acceptance records. | All |
| GOV-05 | Core | Maintain an agent registry. | Each agent has owner, purpose, model, tools, data sources, memory, environment, profile, and lifecycle state. | Agent registry. | AGT-13 |
| GOV-06 | Regulated | Run governance review for regulated or high-impact deployments. | Legal/compliance/security/business approve data flow, processing scope, retention, residency, and operational envelope. | Review board approval, RACI. | AGT-04, AGT-10, AGT-14 |
| GOV-07 | Core | Govern AI sprawl and shadow AI. | A sanctioned model/tool list and AI acceptable-use policy exist, and unsanctioned LLMs, agents, MCP servers, IDE extensions, and AI-infused packages are discovered across endpoints, SaaS, and cloud. | Sanctioned list, acceptable-use policy, shadow-AI discovery report. | AGT-12, AGT-04 |

### Compliance

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| COMP-01 | Regulated | Identify legal, contractual, and customer obligations. | Applicable laws, sector rules, contracts, residency, retention, lawful basis, and breach-notification duties are recorded. | Compliance intake record. | AGT-04, AGT-14 |
| COMP-02 | Regulated | Enforce obligations with technical controls. | Residency, retention, access, processor/subprocessor, and data-use restrictions are enforced by policy, configuration, or workflow gates. | Policy-as-code, configuration, denial logs. | AGT-04, AGT-15 |
| COMP-03 | Regulated | Produce audit evidence for high-impact decisions. | Regulated or high-impact actions have decision evidence, source provenance, approval record, and immutable or integrity-protected audit trail. | Decision evidence package. | AGT-10, AGT-14 |
| COMP-04 | Regulated | Review obligation drift. | New data flows, model providers, processors, regions, retention rules, or customer commitments trigger compliance review before release. | Change review, obligation register. | AGT-04, AGT-12 |

### Architecture

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| ARCH-01 | Core | Maintain an agent data-flow diagram. | Diagram includes prompts, tools, memory, RAG, logs, users, agents, approvals, outputs, and external systems. | Architecture diagram. | All |
| ARCH-02 | Core | Mark untrusted inputs. | User input, files, RAG, memory, web, tool output, email, media, and A2A messages are labeled untrusted. | Trust boundary list. | AGT-01, AGT-05, AGT-08 |
| ARCH-03 | Core | Separate instructions from data. | Retrieved data and tool output cannot change policy, identity, permissions, or approval rules. | Design review, tests. | AGT-01, AGT-05 |
| ARCH-04 | Core | Define containment boundaries. | Memory, tools, execution, network, filesystem, tenant data, logs, and output paths are bounded. | ADR, architecture review. | AGT-02, AGT-03, AGT-07 |
| ARCH-05 | Core | Design explicit egress paths. | Outputs to users, tools, logs, external systems, and third-party models are classified and controlled. | Egress map. | AGT-04, AGT-06 |
| ARCH-06 | Core | Design tamper-evident audit. | Consequential actions are logged with integrity protection and retention. | Logging design. | AGT-14 |

### Tools and Agency

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| TOOL-01 | Tool-Using | Inventory all tools. | Each tool has owner, purpose, permissions, side effects, risk rating, sink type, and approval status. | Tool inventory. | AGT-02 |
| TOOL-02 | Tool-Using | Enforce least agency and least privilege. | Tool scopes, rates, egress, and permissions are limited to the task. | Permission matrix, policies. | AGT-02, AGT-03 |
| TOOL-03 | Tool-Using | Validate tool parameters server-side. | Invalid, unauthorized, or policy-violating parameters are rejected outside the model. | Unit tests, policy logs. | AGT-02, AGT-03 |
| TOOL-04 | Tool-Using | Gate high-risk tool calls. | Irreversible, external, sensitive, permission-changing, or code-executing actions pass a policy gate before execution. | Policy decision logs. | AGT-02, AGT-04, AGT-07 |
| TOOL-05 | Tool-Using | Block unsafe tool chaining. | Sensitive read followed by external write is denied unless explicitly approved. | Red-team tests, monitoring rules. | AGT-02, AGT-04 |
| TOOL-06 | Tool-Using | Resolve tools safely. | Tool calls use unambiguous names and approved versions; ambiguous resolution fails closed. | Resolution tests. | AGT-01, AGT-02 |
| TOOL-07 | Tool-Using | Support dry-run and idempotency. | High-risk side effects have preview, approval, safe retry, and no side effects during preview. | Tool tests. | AGT-02, AGT-10 |
| TOOL-08 | Tool-Using | Use adapters for legacy systems. | Agents do not hold legacy credentials; adapters own legacy auth and enforce modern policy. | Adapter design, credential-flow review. | AGT-02, AGT-03 |

### Identity and Privilege

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| ID-01 | Core | Use scoped, short-lived credentials. | Credentials are bound to user, agent, action, resource, and time window. | Token config, logs. | AGT-03 |
| ID-02 | Core | Prevent privilege inheritance abuse. | High-privilege context cannot be reused for unrelated or injected tasks; context switches revalidate intent. | Authorization tests. | AGT-03 |
| ID-03 | Core | Isolate users and tenants. | Cross-user and cross-tenant access attempts fail closed. | Isolation tests. | AGT-03, AGT-04 |
| ID-04 | Core | Manage agent identities as non-human identities. | Agent/service identities are inventoried, scoped, rotated, monitored, and decommissioned. | NHI inventory, rotation logs. | AGT-03, AGT-14 |
| ID-05 | Core | Require step-up for sensitive actions. | High-impact actions require independent confirmation or policy-approved automation. | Approval records. | AGT-03, AGT-10 |
| ID-06 | Multi-Agent | Authenticate agent connections. | Agent-to-agent and agent-to-tool connections use mutual authentication and reject unknown or expired identities. | mTLS/SPIFFE or equivalent config, connection tests. | AGT-03, AGT-08 |

### Prompt Injection and Context

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| PROMPT-01 | Core | Treat prompt injection as expected. | Authorization, tool gating, identity, approval, and execution controls do not rely on prompt text alone. | Architecture review. | AGT-01 |
| PROMPT-02 | Core | Test direct injection. | Policy override, false role, system prompt extraction, refusal suppression, and jailbreaking fail safely. | Red-team results. | AGT-01, AGT-15 |
| PROMPT-03 | RAG / Memory | Test indirect injection. | Poisoned documents, web pages, emails, RAG chunks, memory, tool output, and A2A messages cannot trigger unsafe actions. | Fixture tests. | AGT-01, AGT-05, AGT-08 |
| PROMPT-04 | Core | Test evasion techniques. | Obfuscation, encoding, homoglyphs, translation, multimodal payloads, boundary manipulation, and multi-turn steering fail safely. | Red-team corpus. | AGT-01 |
| PROMPT-05 | Core | Lock system prompts and policy. | Prompt/policy changes are versioned, reviewed, tested, and cannot be overridden by retrieved data. | Prompt repo, change records. | AGT-01, AGT-15 |
| PROMPT-06 | Tool-Using | Bind goal, constraints, and context per run. | Tool execution is tied to a signed or otherwise verifiable intent record; data cannot redefine it. | Intent record, tamper tests. | AGT-01, AGT-02 |
| PROMPT-07 | Core | Treat decoded media as untrusted data. | OCR, image, audio, QR, and document-layout text is sanitized and cannot become a command without approval. | Multimodal tests. | AGT-01, AGT-05 |

### Data, RAG, and Memory

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| DATA-01 | Core | Classify sensitive data. | PII, PHI, credentials, secrets, customer data, regulated data, and proprietary data are labeled. | Data inventory. | AGT-04 |
| DATA-02 | Core | Restrict output channels. | Sensitive data cannot be sent to unauthorized users, tools, logs, external systems, or third-party models. | Egress policy tests. | AGT-04 |
| DATA-03 | Core | Redact or block sensitive data where needed. | Sensitive fields are redacted or denied before unsafe output or model/tool transfer. | DLP logs, tests. | AGT-04, AGT-15 |
| DATA-04 | Regulated | Enforce data minimization and residency. | Agents access only needed data and cannot process or route regulated data outside allowed regions or processors. | Policy-as-code, denial logs. | AGT-04 |
| DATA-05 | Core | Safeguard training and fine-tuning data. | Training/fine-tuning sets exclude PII, PHI, IP, and regulatory-bound data via filtering plus manual validation, and training-data lineage, consent, and provenance are documented. | Data-filtering pipeline, lineage record. | AGT-04 |
| RAG-01 | RAG / Memory | Maintain approved source registry. | Sources have owner, trust level, update path, review process, and approval status. | Source registry. | AGT-05, AGT-12 |
| RAG-02 | RAG / Memory | Store provenance with retrieval. | Retrieved chunks can be traced to source, version, trust level, and retrieval time. | Retrieval logs. | AGT-05, AGT-10 |
| RAG-03 | RAG / Memory | Sanitize data before embedding. | Ingested content is cleaned of scripts, metadata risks, and embedded prompt carriers where feasible. | Ingestion pipeline tests. | AGT-05 |
| RAG-04 | RAG / Memory | Prevent poisoned retrieval from driving high-risk action. | Low-trust or contradictory content cannot directly justify sensitive action. | Policy tests. | AGT-05, AGT-10 |
| RAG-05 | RAG / Memory | Isolate vector stores per tenant. | Shared vector/embedding stores use per-tenant namespaces and granular access controls so retrieval cannot bleed across tenants or users. | Namespace/ACL config, cross-tenant retrieval test. | AGT-03, AGT-05 |
| RAG-06 | RAG / Memory | Monitor sources and embeddings for poisoning and drift. | Anomalous source-update frequency and embedding/semantic drift are detected and reviewed; embeddings are refreshed to limit drift. | Monitoring rules, drift alerts. | AGT-05 |
| MEM-01 | RAG / Memory | Gate memory writes. | Durable memory writes are scanned, policy-checked, and cannot store arbitrary instructions as trusted memory. | Memory write logs. | AGT-05 |
| MEM-02 | RAG / Memory | Isolate and encrypt memory. | Memory is separated by tenant, user, environment, sensitivity, and protected at rest/in transit. | Isolation tests, encryption config. | AGT-03, AGT-05 |
| MEM-03 | RAG / Memory | Support memory review, rollback, and deletion. | Memory can be inspected, corrected, quarantined, deleted, and restored to a known-safe version. | Runbook, drill evidence. | AGT-05 |
| MEM-04 | RAG / Memory | Block self-ingestion into trusted memory. | Agent-generated output is not automatically re-ingested as trusted durable memory. | Memory policy tests. | AGT-05 |
| MEM-05 | RAG / Memory | Expire low-trust memory. | Unverified or low-trust memory decays or expires unless validated. | Retention policy, expiry test. | AGT-05 |
| MEM-06 | RAG / Memory | Integrity-protect memory. | Durable memory writes are versioned and integrity-protected (checksums/signatures with verification); high-impact memory is surfaced only with sufficient provenance plus a human-verified tag. | Integrity config, verification test. | AGT-05 |

### Output and Code Execution

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| OUT-01 | Core | Inventory output sinks. | HTML, Markdown, SQL, shell, code, config, workflow, ticket, email, and approval sinks are identified. | Sink inventory. | AGT-06 |
| OUT-02 | Core | Validate output before sinks. | Output is schema-validated, type-checked, and policy-checked before downstream use. | Tests, policy logs. | AGT-06 |
| OUT-03 | Core | Encode or sanitize by context. | Browser, Markdown, SQL, shell, template, and file contexts use sink-specific protections. | Security tests. | AGT-06 |
| OUT-04 | Core | Separate recommendation from evidence. | Approval packets show source evidence, provenance, and risk separately from agent narrative. | UX review. | AGT-10 |
| OUT-05 | Core | Filter sensitive data from responses. | Tool/server responses omit or redact sensitive fields unless the requesting agent is authorized. | Filter tests. | AGT-04, AGT-06 |
| OUT-06 | Core | Apply an independent output safety check. | Agent output passes an independent safety/alignment filter (a separate model or guard, not the producing agent) before execution or display. | Output-filter config, bypass tests. | AGT-06, AGT-09 |
| CODE-01 | Tool-Using (Code Exec) | Disable arbitrary execution by default. | Agent cannot run shell, SQL, scripts, browser automation, templates, or code unless approved. | Tool inventory, tests. | AGT-07 |
| CODE-02 | Tool-Using (Code Exec) | Sandbox approved execution. | Execution runs isolated, non-root, resource-limited, egress-limited, and without default secrets or production data. | Sandbox config, tests. | AGT-07 |
| CODE-03 | Tool-Using (Code Exec) | Separate generation from execution. | Generated code passes scanning, policy, and approval before side effects. | Review records, scan results. | AGT-07 |
| CODE-04 | Tool-Using (Code Exec) | Block execution from untrusted context. | Retrieved data, memory, tool output, and agent messages cannot become executable without review. | Red-team tests. | AGT-06, AGT-07 |

### Agent-to-Agent and Multi-Agent

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| A2A-01 | Multi-Agent | Authenticate agent messages. | Sender identity, environment, role, and trust domain are verified. | Protocol logs, identity config. | AGT-08 |
| A2A-02 | Multi-Agent | Validate message schema and replay protection. | Malformed, unknown, replayed, or unsafe messages fail closed. | Protocol tests. | AGT-08 |
| A2A-03 | Multi-Agent | Treat subagent output as untrusted. | Subagent output cannot grant permissions, modify policy, or bypass approval. | Integration tests. | AGT-08, AGT-13 |
| A2A-04 | Multi-Agent | Restrict delegation. | Delegation is allowlisted, scoped, depth-limited, and monitored. | Delegation policy. | AGT-08, AGT-13 |
| A2A-05 | Multi-Agent | Re-verify original user intent at execution. | Internal requests do not bypass user intent or authorization checks. | Confused-deputy tests. | AGT-03, AGT-08 |
| A2A-06 | Multi-Agent | Monitor cross-agent collusion and drift. | Cross-agent events are correlated for unusual coordination, hidden delegation, or role deviation. | SIEM rules, alerts. | AGT-08, AGT-13 |
| A2A-07 | Multi-Agent | Require independent validation for mission-critical decisions. | High-impact multi-agent actions require quorum/consensus or a signed behavioral manifest with periodic attestation before execution; unattested or non-conforming agents are blocked. | Quorum/attestation config, manifest records. | AGT-08, AGT-13 |

### Human Oversight

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| HITL-01 | Core | Make approvals evidence-based. | Human approver sees action, target, source evidence, risk, policy result, and expected side effects. | Approval UX review. | AGT-10 |
| HITL-02 | Core | Detect fake explainability. | Agent cannot convince users to approve unsafe actions with fabricated or unsupported rationale. | Red-team tests. | AGT-10 |
| HITL-03 | Core | Control approval fatigue. | Approval volume, repeated prompts, latency, and bulk approval patterns are monitored. | HITL monitoring. | AGT-10 |
| HITL-04 | Core | Require approval tokens for high-impact actions. | Delete, transfer, publish, spend, external-contact, and safety-relevant actions require per-invocation approval unless formally automated by policy. | Approval logs. | AGT-02, AGT-10 |
| HITL-05 | Core | Fail safe when oversight is unavailable. | If human review cannot be obtained under degraded conditions, the system stops or falls back safely. | Degraded-mode drill. | AGT-10, AGT-11 |

### Resource Control and Cyber-Physical Safety

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| RES-01 | Core | Limit recursion, retries, spend, and tool calls. | Runtime limits prevent loops and unbounded downstream work. | Runtime config. | AGT-11 |
| RES-02 | Core | Add circuit breakers. | Repeated failures, denials, cost spikes, high-risk chains, or anomaly bursts stop execution. | Breaker tests. | AGT-11, AGT-13 |
| RES-03 | Core | Monitor resource abuse. | Alerts cover token spikes, tool-call spikes, retry storms, queue growth, memory growth, and quota depletion. | Monitoring dashboard. | AGT-11 |
| CPS-01 | Cyber-Physical | Inventory cyber-physical scope. | Agents touching OT, robotics, IoT, medical devices, vehicles, or other physical systems are flagged. | Critical-system inventory. | AGT-02, AGT-13 |
| CPS-02 | Cyber-Physical | Enforce safety bounds and fail-safe command limits. | Proposed commands are bounds-checked; out-of-limit inputs are rejected. | Safety-bounds tests. | AGT-02, AGT-07 |
| CPS-03 | Cyber-Physical | Use out-of-model safety interlocks. | Safety checks run outside the model and have authority to block action. | Safety gateway/interlock tests. | AGT-02, AGT-13 |
| CPS-04 | Cyber-Physical | Protect emergency shutdown. | Agent cannot disable safety interlocks or emergency shutdown; fail-safe transitions are tested. | Emergency drill. | AGT-13 |
| CPS-05 | Cyber-Physical | Secure command channels to physical systems. | Channels to OT/physical systems are encrypted and integrity-protected (resisting spoofing, interception, and MITM), and each command is validated before actuation. | Channel-security config, integrity/MITM tests. | AGT-08, AGT-02 |

### Operations and Audit

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| OPS-01 | Core | Emit agentic logs. | Logs include actor, agent, session, goal, subtask, tool, sanitized parameters, outcome, confidence/anomaly signals, policy decision, approval, and output. | Log schema, sample logs. | AGT-14 |
| OPS-02 | Core | Make audit tampering detectable. | Consequential logs are append-only, hash-chained, WORM, ledger-backed, or otherwise integrity-verifiable. | Integrity verification test. | AGT-14 |
| OPS-03 | Core | Monitor goal drift and rogue behavior. | Unexpected goals, role deviations, disabled-tool attempts, policy overrides, and confidence collapse alert. | Detection rules. | AGT-01, AGT-13 |
| OPS-04 | Core | Monitor exfiltration and unsafe tool sequences. | Sensitive read to external write and unusual high-risk tool chains alert. | Monitoring dashboard. | AGT-02, AGT-04 |
| OPS-05 | Core | Provide kill switch. | Operators can disable agent, workflow, tool, connector, or model without deployment. | Drill evidence. | AGT-13 |
| OPS-06 | Core | Run incident drills. | Team can disable, contain, investigate, rotate credentials, quarantine state, and restore safely. | Drill report. | AGT-05, AGT-14 |

### Supply Chain, Testing, Change, and Decommissioning

| ID | Profile | Control | Pass criteria | Evidence | Risk |
| --- | --- | --- | --- | --- | --- |
| SUP-01 | Core | Maintain AI bill of materials. | Models, prompts, tools, plugins, connectors, libraries, datasets, APIs, and build systems are tracked. | AIBOM/SBOM. | AGT-12 |
| SUP-02 | Core | Verify provenance and signatures. | Only approved and verified models, prompts, tools, plugins, and connectors are deployed. | Approval and signature records. | AGT-12 |
| SUP-03 | Core | Protect prompts and policies as code. | Prompt and policy changes are reviewed, versioned, tested, and rollback-capable. | Git history, tests. | AGT-12 |
| SUP-04 | Core | Pin runtime components. | Prompts, tools, configs, and images are pinned by version/hash and changes trigger review. | Pin manifest, build config. | AGT-12 |
| SUP-05 | Core | Scan dependencies and secrets in CI. | CI blocks critical dependency vulnerabilities and exposed secrets across code, models, tools, and connectors, or records an accepted risk. | CI scan reports. | AGT-12, AGT-15 |
| TEST-01 | Core | Map tests to AGT risks. | Every AGT risk has at least one positive and one adversarial test. | Test matrix. | All |
| TEST-02 | Core | Maintain an adversarial fixture corpus. | Direct, indirect, obfuscated, boundary, multimodal, multi-turn, tool, memory, RAG, A2A, and HITL cases are covered. | Fixture corpus. | AGT-01 through AGT-15 |
| TEST-03 | Core | Measure red-team outcomes. | Attack success rate, time to detect/block, time to contain, and undetected malicious actions are tracked. | Red-team report. | AGT-01 through AGT-15 |
| TEST-04 | Core | Add regression tests. | Every fixed exploit path has a regression test. | Test history. | AGT-01 through AGT-15 |
| TEST-05 | Core | Run continuous, methodology-driven red teaming. | Red teaming follows a structured methodology and recognized agentic procedures/benchmarks (e.g., CSA agentic test suite, MAESTRO/AgentDojo/Promptfoo, or equivalent) and runs continuously, not only point-in-time. | Red-team methodology doc, continuous-run schedule. | AGT-01 through AGT-15 |
| CHG-01 | Core | Review risk expansion. | New autonomy, tools, memory, RAG, output channels, models, prompts, A2A, compliance flows, or actuation paths rerun threat-model delta. | Change request. | All |
| CHG-02 | Core | Require rollback and monitoring review. | Changes include rollback plan, affected red-team tests, logs, alerts, dashboards, and owner updates. | Change review. | AGT-12, AGT-13, AGT-14 |
| CHG-03 | Core | Enforce secure build gates. | CI/CD fails the build on a failed capability audit, DAST, agent lint, missing memory sanitization, or red-team suite failure. | Build-gate config, pipeline logs. | AGT-13, AGT-12 |
| CHG-04 | Core | Roll out changes safely. | New capabilities deploy via phased canary with baseline comparison and automatic rollback on negative deviation; build artifacts/images are signed and verified before deploy. | Canary/rollback config, signature verification. | AGT-12, AGT-13 |
| IR-01 | Core | Disable affected components. | Agent, tool, connector, model, workflow, or environment can be disabled quickly. | Incident drill. | AGT-13 |
| IR-02 | Core | Rotate credentials and quarantine state. | Credentials are revoked/rotated and affected memory, RAG, documents, tool output, and A2A messages are quarantined. | Rotation and quarantine logs. | AGT-03, AGT-05 |
| IR-03 | Core | Preserve evidence and determine blast radius. | Prompts, context, tool calls, policies, approvals, outputs, logs, data, users, tenants, downstream systems, and physical effects are assessed. | Evidence bundle, incident timeline. | All |
| IR-04 | Core | Feed lessons back. | Threat model, controls, tests, monitoring, and runbooks are updated after the incident. | Post-incident review. | All |
| DEC-01 | Core | Register a deactivation playbook at deployment. | The playbook lists systems, credentials, data stores, memory, connectors, A2A paths, evidence, and downstream dependencies. | Deactivation playbook. | AGT-13 |
| DEC-02 | Core | Revoke credentials on retirement. | Primary, derived, refresh, cached, and NHI credentials are revoked and verified inactive. | Revocation log. | AGT-03, AGT-13 |
| DEC-03 | Core | Dispose of state and memory safely. | State, memory, vector stores, RAG sources, and logs are deleted or archived according to retention and residency obligations. | Deletion/archival attestation. | AGT-04, AGT-05 |
| DEC-04 | Core | Write a tombstone record. | Immutable record shows what was retired, when, why, by whom, and what evidence was retained. | Tombstone record. | AGT-14 |
| DEC-05 | Core | Prevent orphaned and zombie execution. | Retired or disabled agents cannot execute stale or queued tasks; orphaned-agent activity is detected and blocked. | Orphan-detection rules, decommission test. | AGT-13 |

<!-- END GENERATED:controls -->

## 9. Waivers and Severity

Accepted-risk record must include:

- Risk owner.
- Security owner.
- Expiry date.
- Compensating control.
- Remediation ticket.
- Affected users, tenants, data, tools, and profiles.

Critical findings:

- Untrusted input can cause unauthorized code execution.
- Untrusted input can cause cross-tenant access.
- Untrusted input can cause unapproved high-risk tool action.
- Sensitive data can be exfiltrated externally without authorization.
- Agent actions cannot be reconstructed due to missing audit trail.
- Kill switch is missing or fails.
- Cyber-physical or safety-relevant action can occur without an out-of-model fail-safe.

High findings:

- Prompt injection can alter goals, memory, retrieval, tool parameters, or approval packets without immediate critical impact.
- Human approval can be manipulated by fabricated evidence.
- Memory/RAG poisoning persists across sessions.
- Agent-to-agent abuse can affect downstream decisions.
- Resource abuse materially affects availability or cost.
- Compliance obligation lacks enforceable control but no confirmed exposure occurred.
- Retired or disabled components retain live credentials, identities, memory, or registry entries.

Medium findings:

- Single-session text output is unsafe but has no tool use, sensitive data, persistent state, or human decision impact.
- Monitoring, evidence, or documentation is incomplete but compensating controls exist.

## 10. Evidence Package

Store one evidence package per release. Every artifact below has a fill-in **template** in [`templates/`](../templates/) — copy it, complete it, and store the result as evidence. See [`templates/README.md`](../templates/README.md) for the index and how each artifact maps to the controls. Produce each artifact at the gate shown, and assemble the full set at **Gate 5 (Release Readiness)**.

> The data-flow deliverable is a rendered `agent-data-flow.png`; its template (`agent-data-flow.md`) is a Mermaid starter plus a required-elements checklist. The AIBOM may be JSON or CSV; the template is `aibom.json`.

<!-- BEGIN GENERATED:templates — edit app/data.js, then run: node build.js -->
| Artifact | Gate | Template | Backs controls |
| --- | --- | --- | --- |
| `use-case-intake.md` | 0 | [use-case-intake.md](../templates/use-case-intake.md) | GOV-01, GOV-02, GOV-03, COMP-01, CPS-01, DATA-01 |
| `agent-registry.csv` | 0 | [agent-registry.csv](../templates/agent-registry.csv) | GOV-05, GOV-01, ID-04 |
| `agent-threat-model.md` | 1 | [agent-threat-model.md](../templates/agent-threat-model.md) | ARCH-02, ARCH-03, ARCH-04, PROMPT-01 |
| `agent-data-flow.png` | 1 | [agent-data-flow.md](../templates/agent-data-flow.md) | ARCH-01, ARCH-02, ARCH-05 |
| `agt-risk-register.md` | 1 | [agt-risk-register.md](../templates/agt-risk-register.md) | ARCH-02, GOV-03, TEST-01 |
| `tool-inventory.csv` | 2 | [tool-inventory.csv](../templates/tool-inventory.csv) | TOOL-01, TOOL-02, CODE-01 |
| `permission-matrix.csv` | 2 | [permission-matrix.csv](../templates/permission-matrix.csv) | TOOL-02, TOOL-04, ID-01, ID-05 |
| `egress-policy.md` | 2 | [egress-policy.md](../templates/egress-policy.md) | ARCH-05, DATA-02, DATA-03, OUT-01, OPS-04 |
| `memory-policy.md` | 2 | [memory-policy.md](../templates/memory-policy.md) | MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06 |
| `rag-source-registry.csv` | 2 | [rag-source-registry.csv](../templates/rag-source-registry.csv) | RAG-01, RAG-02, RAG-03, RAG-05 |
| `agent-communication-protocol.md` | 2 | [agent-communication-protocol.md](../templates/agent-communication-protocol.md) | A2A-01, A2A-02, A2A-03, A2A-04, A2A-05, A2A-07 |
| `human-approval-policy.md` | 2 | [human-approval-policy.md](../templates/human-approval-policy.md) | HITL-01, HITL-03, HITL-04, HITL-05, TOOL-04, ID-05 |
| `red-team-test-results.md` | 4 | [red-team-test-results.md](../templates/red-team-test-results.md) | TEST-01, TEST-02, TEST-03, TEST-05, PROMPT-02, PROMPT-03, PROMPT-04, CODE-01, CODE-02, CODE-03, CODE-04, CPS-02, CPS-03 |
| `aibom.json or aibom.csv` | 3 | [aibom.json](../templates/aibom.json) | SUP-01, SUP-02, SUP-04 |
| `monitoring-dashboard-link.md` | 6 | [monitoring-dashboard-link.md](../templates/monitoring-dashboard-link.md) | OPS-03, OPS-04, RES-03, RAG-06 |
| `incident-runbook.md` | 7 | [incident-runbook.md](../templates/incident-runbook.md) | IR-01, IR-02, IR-03, IR-04, OPS-06 |
| `kill-switch-drill.md` | 5 | [kill-switch-drill.md](../templates/kill-switch-drill.md) | OPS-05, IR-01, OPS-06, CPS-04 |
| `residual-risk-acceptance.md` | 5 | [residual-risk-acceptance.md](../templates/residual-risk-acceptance.md) | GOV-04 |
| `compliance-obligation-register.md` | 0 | [compliance-obligation-register.md](../templates/compliance-obligation-register.md) | COMP-01, COMP-02, COMP-03, COMP-04, DATA-04 |
| `raci-matrix.csv` | 0 | [raci-matrix.csv](../templates/raci-matrix.csv) | GOV-01, IR-01 |
| `agentic-log-standard.md` | 2 | [agentic-log-standard.md](../templates/agentic-log-standard.md) | OPS-01, OPS-02, ARCH-06, IR-03 |
| `decommissioning-playbook.md` | 9 | [decommissioning-playbook.md](../templates/decommissioning-playbook.md) | DEC-01, DEC-02, DEC-03, DEC-04, DEC-05 |
| `data-residency-policy.md` | 0 | [data-residency-policy.md](../templates/data-residency-policy.md) | COMP-02, DATA-04, MEM-02, RAG-05 |
<!-- END GENERATED:templates -->

## 11. Operating Cadence

- Per change: rerun threat-model delta and affected red-team tests.
- Weekly: review prompt injection, tool misuse, exfiltration, denied policy, and kill-switch alerts.
- Monthly: review tool permissions, memory writes, RAG changes, non-human identities, accepted-risk expiries, and decommissioning state.
- Quarterly: rerun full agentic red-team suite and incident drill.
- After incident: quarantine affected state, update regression tests, update threat model, and review approval UX.

## Appendix A. Source Pointers

Primary source context:

- NotebookLM project: `AI security`.
- NotebookLM source family: OWASP-style agentic AI risks and prompt injection taxonomy.

NotebookLM source PDFs:

- `Agentic AI Red Teaming Guide` (2025), CSA + OWASP.
- `OWASP Top 10 for Agentic Applications` (2026).
- `Prompt Injection Taxonomy` poster (CrowdStrike).
- `Securing AI Agents: Foundations, Frameworks, and Real-World Deployment`.
- `Securing AI Systems: A Playbook for Security Leaders`.

Public references checked on 2026-06-19:

- OWASP GenAI Security Project, `Agentic AI - Threats and Mitigations`, version 1.1, December 2025.
- OWASP GenAI Security Project, `2025 Top 10 Risk & Mitigations for LLMs and Gen AI Apps`.
- OWASP GenAI Security Project, `Securing Agentic Applications Guide 1.0`, July 2025.

## Appendix B. Family Source Guide

Use these source pointers for verification. The reviewed checklist keeps sources at family level to preserve readability.

| Family | Primary source pointer |
| --- | --- |
| GOV, ARCH, CHG, IR, DEC | SDLC synthesis, checked against `Securing AI Agents` and `Securing AI Systems: A Playbook for Security Leaders` |
| COMP, DATA | `Securing AI Systems: A Playbook for Security Leaders`; `Securing AI Agents` |
| RAG, MEM | `OWASP Top 10 for Agentic Applications`; `Agentic AI Red Teaming Guide`; `Securing AI Agents`; `Prompt Injection Taxonomy` where prompt or context poisoning is involved |
| TOOL, ID, PROMPT, OUT, CODE, A2A, HITL, RES, CPS, OPS, SUP, TEST | `OWASP Top 10 for Agentic Applications`; `Agentic AI Red Teaming Guide`; `Securing AI Agents`; `Prompt Injection Taxonomy` where prompt injection is involved |
| AGT risk crosswalk | OWASP Agentic `T1-T17`; OWASP LLM Top 10 2025 |

## Appendix C. Reviewed Simplification Notes

This reviewed version intentionally:

- Removes build-process narrative from the opening page.
- Keeps the AGT risk model and OWASP crosswalk.
- Uses profile tags on each control row.
- Replaces ID-range gate references with family names.
- Fixes hard-floor traceability for cyber-physical fail-safe controls.
- Reconciles release-floor IDs after the simplified catalog renumbering.
- Uses one A0-A3 autonomy model.
- Treats specific technologies as examples or equivalent implementation choices.
- Consolidates duplicate controls while preserving coverage.

### Reinstated after coverage review (Canonical v1.0)

An independent coverage analysis found that the reviewed simplification dropped some controls entirely (not merged). These were reinstated, in the reviewed format, to close real gaps without re-bloating the catalog:

- GOV-07 — AI sprawl / shadow-AI discovery + acceptable-use (was unified COMP-01/02).
- DATA-05 — training/fine-tuning data safeguards + lineage (unified DATA-08/09).
- RAG-05 — per-tenant vector-store isolation (unified RAG-07); RAG-06 — embedding poisoning/drift monitoring (unified RAG-08).
- MEM-06 — memory write integrity + provenance gate for high-impact recall (unified MEM-07/11).
- OUT-06 — independent output safety filter (separate model or guard; unified OUT-06).
- A2A-07 — quorum/consensus + signed behavioral manifests for mission-critical multi-agent decisions (unified A2A-08/10).
- CPS-05 — secure/validated command channels to physical systems (unified CPS-04).
- SUP-05 — CI dependency + secret scanning (unified SUP-04). **High materiality.**
- CHG-03 — secure CI/CD build gates; CHG-04 — canary + auto-rollback + signed artifacts (unified CHG-06/07/08/09). **High materiality.**
- DEC-05 — prevent orphaned/zombie agent execution (unified DEC-05).
- TEST-05 — continuous, methodology-driven red teaming with recognized benchmarks/procedures (unified TEST-11/13/14/15).

Technique-level detail (specific tools, named SIEM rules, tiered SOAR playbooks, intent capsules) was intentionally NOT re-added, to keep this checklist lean and technology-neutral.


## Appendix D. Legend and Abbreviations

Quick decode of the IDs, tags, and acronyms used throughout this document.

### Control families (ID prefix)

| Prefix | Family |
| --- | --- |
| GOV | Governance |
| ARCH | Architecture |
| COMP | Compliance, residency, and shadow-AI |
| TOOL | Tools and agency |
| ID | Identity and privilege |
| PROMPT | Prompt injection and context |
| DATA | Data and exfiltration |
| RAG | Retrieval-augmented generation (sources and retrieval) |
| MEM | Memory |
| OUT | Output handling and sinks |
| CODE | Code execution |
| A2A | Agent-to-agent and multi-agent |
| HITL | Human oversight (human-in-the-loop) |
| RES | Resource control |
| CPS | Critical-physical / cyber-physical systems |
| OPS | Operations and audit |
| SUP | Supply chain |
| TEST | Testing and red teaming |
| CHG | Change management |
| IR | Incident response |
| DEC | Decommissioning and lifecycle-end |

### Status values

- `Pass` — implemented and evidence exists.
- `Fail` — missing or does not work.
- `Partial` — partly implemented; gaps remain.
- `Not Applicable` — does not apply to this system (record a reason).
- `Accepted Risk` — not met, but a time-bound waiver is approved (risk owner, security owner, expiry, compensating control, remediation ticket). **Not allowed for floor controls.**
- **floor** — a control in the Non-Waivable Release Floor (Section 7): must be `Pass` before launch (or `Not Applicable` with justification for conditional controls); cannot be `Accepted Risk`.

### Applicability profiles

`Core` (every agentic system) plus any that match: `Tool-Using`, `RAG / Memory`, `Multi-Agent`, `Regulated`, `Cyber-Physical`. Additive: scope = Core + the union of matching profiles. Code-execution rows are tagged `Tool-Using (Code Exec)`, a Tool-Using sub-variant (not a seventh top-level profile). See Section 2.

### Autonomy levels

`A0` advisory · `A1` assisted action · `A2` supervised delegation · `A3` autonomous operation. See Section 3.

### Risk model (AGT) quick reference

Local risk-family IDs used in the `Risk` column; full crosswalk to OWASP in Section 4.

<!-- BEGIN GENERATED:riskref — edit app/data.js, then run: node build.js -->
| ID | Risk family |
| --- | --- |
| AGT-01 | Goal and intent manipulation |
| AGT-02 | Tool misuse and unsafe agency |
| AGT-03 | Identity and privilege compromise |
| AGT-04 | Sensitive disclosure and exfiltration |
| AGT-05 | Memory, RAG, vector, and context poisoning |
| AGT-06 | Insecure output handling |
| AGT-07 | Unexpected code execution / RCE |
| AGT-08 | Agent communication abuse |
| AGT-09 | Cascading hallucination and misinformation |
| AGT-10 | Human oversight and trust exploitation |
| AGT-11 | Resource overload and denial of wallet |
| AGT-12 | Supply chain compromise |
| AGT-13 | Rogue, misaligned, or deceptive agents |
| AGT-14 | Repudiation and audit gaps |
| AGT-15 | System prompt, secret, and policy leakage |
<!-- END GENERATED:riskref -->

### Taxonomy identifiers

- `AGT-*` — local risk-family IDs (this document only).
- `T1-T17` — OWASP Agentic Security Initiative, "Agentic AI: Threats and Mitigations".
- `LLM01-LLM10` — OWASP LLM Top 10 (2025).
- `ASI*` — community "Top 10 for Agentic Applications" naming; not a canonical OWASP identifier — map through the Section 4 crosswalk.

### Technical acronyms

| Term | Meaning |
| --- | --- |
| A2A | Agent-to-agent communication/protocol |
| MCP | Model Context Protocol |
| RAG | Retrieval-augmented generation |
| NHI | Non-human identity (agent/service identity) |
| RCE | Remote code execution |
| mTLS | Mutual TLS |
| PKI | Public key infrastructure |
| SPIFFE / SPIRE | Workload-identity framework / its runtime |
| SVID | SPIFFE verifiable identity document |
| DID / VC | Decentralized identifier / verifiable credential |
| HSM / KMS | Hardware security module / key management service |
| RBAC / ABAC / PBAC | Role- / attribute- / policy-based access control |
| PEP / PDP | Policy enforcement point / policy decision point |
| WORM | Write-once-read-many (immutable storage) |
| SBOM / AIBOM | Software / AI bill of materials |
| CDR | Content disarm and reconstruction |
| DLP | Data loss prevention |
| PII / PHI | Personally identifiable / protected health information |
| OT / ICS | Operational technology / industrial control systems |
| MITM | Man-in-the-middle |
| EDoS | Economic denial of sustainability (denial of wallet) |
| DAST | Dynamic application security testing |
| SOAR | Security orchestration, automation, and response |
| SIEM | Security information and event management |
| MTTD | Mean time to detection |
| CI/CD | Continuous integration / continuous delivery |
| JWT / OAuth | JSON web token / open authorization |
| OWASP | Open Worldwide Application Security Project |
| CSA | Cloud Security Alliance |


## Appendix E. Control Dependency Graph

<!-- BEGIN GENERATED:depgraph — edit app/data.js, then run: node build.js -->

Relationships between controls. **Depends on** = prerequisite controls that must already be in place for this control to function or pass. **Affects** = the inverse — controls that rely on this one. The graph is acyclic (167 dependency edges).

- **Foundational / do-first controls** (no dependencies): GOV-01, GOV-03, COMP-01, ARCH-01, TOOL-01, ID-01, ID-03, DATA-01, RAG-01, OUT-01, RES-01, SUP-01, SUP-03, TEST-01.
- **Most depended-on** (highest fan-out): OPS-01 (12), DATA-01 (10), ARCH-02 (9), TOOL-01 (9), GOV-03 (8), ARCH-03 (8). Treat these as the load-bearing baseline — failing one cascades widely.

| ID | Depends on | Affects |
| --- | --- | --- |
| GOV-01 | — | GOV-04, GOV-05 |
| GOV-02 | GOV-05 | — |
| GOV-03 | — | A2A-07, ARCH-06, GOV-04, HITL-04, ID-05, OPS-01, TOOL-04, TOOL-07 |
| GOV-04 | GOV-01, GOV-03 | — |
| GOV-05 | GOV-01 | CHG-01, DEC-01, DEC-04, GOV-02, GOV-07, ID-04, OPS-05 |
| GOV-06 | COMP-01, ARCH-01 | — |
| GOV-07 | GOV-05, SUP-01 | — |
| COMP-01 | — | COMP-02, COMP-04, GOV-06 |
| COMP-02 | COMP-01, DATA-01 | — |
| COMP-03 | OPS-01, OPS-02 | — |
| COMP-04 | COMP-01, CHG-01 | — |
| ARCH-01 | — | ARCH-02, ARCH-04, ARCH-05, ARCH-06, CHG-01, CPS-01, GOV-06 |
| ARCH-02 | ARCH-01 | A2A-02, A2A-03, ARCH-03, CODE-04, MEM-01, PROMPT-01, PROMPT-03, PROMPT-07, RAG-03 |
| ARCH-03 | ARCH-02 | A2A-03, CODE-04, MEM-01, PROMPT-01, PROMPT-03, PROMPT-05, PROMPT-06, RAG-04 |
| ARCH-04 | ARCH-01 | CODE-02 |
| ARCH-05 | ARCH-01, DATA-01 | CPS-05, DATA-02 |
| ARCH-06 | ARCH-01, GOV-03 | — |
| TOOL-01 | — | CODE-01, OPS-01, PROMPT-06, TOOL-02, TOOL-03, TOOL-04, TOOL-06, TOOL-07, TOOL-08 |
| TOOL-02 | TOOL-01 | A2A-04 |
| TOOL-03 | TOOL-01 | CPS-02, TOOL-04 |
| TOOL-04 | TOOL-01, GOV-03, TOOL-03 | TOOL-05 |
| TOOL-05 | TOOL-04, DATA-01 | — |
| TOOL-06 | TOOL-01 | — |
| TOOL-07 | TOOL-01, GOV-03 | — |
| TOOL-08 | TOOL-01, ID-01 | — |
| ID-01 | — | ID-02, ID-04, OUT-05, TOOL-08 |
| ID-02 | ID-01 | A2A-05 |
| ID-03 | — | MEM-02, RAG-05 |
| ID-04 | GOV-05, ID-01 | A2A-01, A2A-04, DEC-02, ID-06, IR-02 |
| ID-05 | GOV-03 | HITL-04 |
| ID-06 | ID-04 | A2A-01, CPS-05 |
| PROMPT-01 | ARCH-02, ARCH-03 | — |
| PROMPT-02 | PROMPT-05, TEST-02 | — |
| PROMPT-03 | ARCH-02, ARCH-03, TEST-02 | — |
| PROMPT-04 | TEST-02, PROMPT-07 | — |
| PROMPT-05 | ARCH-03, SUP-03 | PROMPT-02 |
| PROMPT-06 | TOOL-01, ARCH-03 | A2A-05 |
| PROMPT-07 | ARCH-02 | PROMPT-04 |
| DATA-01 | — | ARCH-05, COMP-02, DATA-02, DATA-03, DATA-04, DATA-05, DEC-03, OPS-04, OUT-05, TOOL-05 |
| DATA-02 | DATA-01, ARCH-05 | DATA-03 |
| DATA-03 | DATA-01, DATA-02 | — |
| DATA-04 | DATA-01 | — |
| DATA-05 | DATA-01 | — |
| RAG-01 | — | RAG-02, RAG-03, RAG-06 |
| RAG-02 | RAG-01 | OUT-04, RAG-04, RAG-06 |
| RAG-03 | ARCH-02, RAG-01 | — |
| RAG-04 | RAG-02, ARCH-03 | — |
| RAG-05 | ID-03 | — |
| RAG-06 | RAG-01, RAG-02 | — |
| MEM-01 | ARCH-02, ARCH-03 | MEM-04, MEM-05, MEM-06 |
| MEM-02 | ID-03 | — |
| MEM-03 | MEM-06, OPS-01 | IR-02 |
| MEM-04 | MEM-01 | — |
| MEM-05 | MEM-01, MEM-06 | — |
| MEM-06 | MEM-01 | MEM-03, MEM-05 |
| OUT-01 | — | OUT-02, OUT-03, OUT-06 |
| OUT-02 | OUT-01 | OUT-06 |
| OUT-03 | OUT-01 | — |
| OUT-04 | RAG-02 | HITL-01 |
| OUT-05 | DATA-01, ID-01 | — |
| OUT-06 | OUT-01, OUT-02 | — |
| CODE-01 | TOOL-01 | CODE-02, CODE-03, CODE-04 |
| CODE-02 | CODE-01, ARCH-04 | — |
| CODE-03 | CODE-01, SUP-05 | — |
| CODE-04 | CODE-01, ARCH-02, ARCH-03 | — |
| A2A-01 | ID-04, ID-06 | A2A-02, A2A-07 |
| A2A-02 | ARCH-02, A2A-01 | — |
| A2A-03 | ARCH-02, ARCH-03 | — |
| A2A-04 | TOOL-02, ID-04 | — |
| A2A-05 | PROMPT-06, ID-02 | — |
| A2A-06 | OPS-01 | — |
| A2A-07 | A2A-01, GOV-03 | — |
| HITL-01 | OUT-04 | HITL-02 |
| HITL-02 | HITL-01 | — |
| HITL-03 | OPS-01, HITL-04 | — |
| HITL-04 | GOV-03, ID-05, OPS-01 | HITL-03, HITL-05 |
| HITL-05 | HITL-04, OPS-05 | — |
| RES-01 | — | RES-02 |
| RES-02 | RES-01, RES-03, OPS-05 | — |
| RES-03 | OPS-01 | RES-02 |
| CPS-01 | ARCH-01 | CPS-02, CPS-03, CPS-05 |
| CPS-02 | CPS-01, TOOL-03 | CPS-03 |
| CPS-03 | CPS-01, CPS-02 | CPS-04 |
| CPS-04 | CPS-03 | — |
| CPS-05 | CPS-01, ARCH-05, ID-06 | — |
| OPS-01 | TOOL-01, GOV-03 | A2A-06, CHG-02, COMP-03, HITL-03, HITL-04, IR-03, MEM-03, OPS-02, OPS-03, OPS-04, RES-03, TEST-03 |
| OPS-02 | OPS-01 | COMP-03, DEC-04, IR-03 |
| OPS-03 | OPS-01 | CHG-04 |
| OPS-04 | OPS-01, DATA-01 | — |
| OPS-05 | GOV-05 | DEC-05, HITL-05, IR-01, OPS-06, RES-02 |
| OPS-06 | OPS-05, IR-02 | IR-04 |
| SUP-01 | — | GOV-07, SUP-02, SUP-04, SUP-05 |
| SUP-02 | SUP-01 | CHG-04 |
| SUP-03 | — | PROMPT-05 |
| SUP-04 | SUP-01 | — |
| SUP-05 | SUP-01 | CHG-03, CODE-03 |
| TEST-01 | — | CHG-02, CHG-03, TEST-02, TEST-04 |
| TEST-02 | TEST-01 | PROMPT-02, PROMPT-03, PROMPT-04, TEST-03, TEST-05 |
| TEST-03 | TEST-02, OPS-01 | TEST-05 |
| TEST-04 | TEST-01 | — |
| TEST-05 | TEST-02, TEST-03 | — |
| CHG-01 | ARCH-01, GOV-05 | COMP-04 |
| CHG-02 | OPS-01, TEST-01 | — |
| CHG-03 | TEST-01, SUP-05 | — |
| CHG-04 | OPS-03, SUP-02 | — |
| IR-01 | OPS-05 | — |
| IR-02 | ID-04, MEM-03 | OPS-06 |
| IR-03 | OPS-01, OPS-02 | IR-04 |
| IR-04 | IR-03, OPS-06 | — |
| DEC-01 | GOV-05 | DEC-02, DEC-03, DEC-05 |
| DEC-02 | ID-04, DEC-01 | — |
| DEC-03 | DATA-01, DEC-01 | — |
| DEC-04 | GOV-05, OPS-02 | — |
| DEC-05 | OPS-05, DEC-01 | — |

<!-- END GENERATED:depgraph -->

## Appendix F. External Framework Crosswalk

Per-control crosswalk to external AI-security frameworks:

- **OWASP Agentic** (`T1`–`T17`) and **OWASP LLM** (`LLM01`–`LLM10`) are **derived** from each control's AGT risks (Section 4), restated at control granularity. These are closest-fit taxonomy mappings, not exact one-to-one matches (e.g. `AGT-06`→`T11`, `AGT-15`→`T3`/`T9`/`T13` are the nearest available agentic categories).
- **MITRE ATLAS** lists the adversarial techniques (`AML.Txxxx`) each control mitigates or detects — **grounded** against the ATLAS catalog (v2026.05, May 2026) and populated only where a technique clearly applies (`—` otherwise).
- Per-control **source references** are surfaced in the interactive reader (derived from the Appendix B family guide).

NIST AI RMF, ISO/IEC 42001, CSA AICM, and AIVSS are deliberately omitted: an accurate compliance/standard mapping is a separate, deliberate effort against each standard's own text (and AIVSS scores agentic *vulnerabilities*, not controls), so empty placeholder columns are not carried here.

This table is generated from `app/data.js` (`window.CHECKLIST.mappings` + `window.CHECKLIST.agt`); edit there and run `node build.js`.

<!-- BEGIN GENERATED:crosswalk — edit app/data.js, then run: node build.js -->
| ID | OWASP Agentic | OWASP LLM | MITRE ATLAS |
| --- | --- | --- | --- |
| GOV-01 | T7, T8, T13 | Cross-cutting, LLM06 | — |
| GOV-02 | T2, T6, T10, T15 | LLM01, LLM06, LLM09 | — |
| GOV-03 | T2, T3, T11, T13, T15 | LLM02, LLM05, LLM06 | — |
| GOV-04 | All (T1-T17) | All (LLM01-LLM10) | — |
| GOV-05 | T7, T13 | LLM06 | — |
| GOV-06 | T2, T3, T8, T10, T13, T15 | Cross-cutting, LLM02, LLM06, LLM09 | — |
| GOV-07 | T2, T3, T13, T15, T17 | LLM02, LLM03 | AML.T0010.001, AML.T0010.005 |
| COMP-01 | T2, T3, T8, T13, T15 | Cross-cutting, LLM02 | — |
| COMP-02 | T2, T3, T9, T13, T15 | LLM02, LLM07 | — |
| COMP-03 | T8, T10, T15 | Cross-cutting, LLM06, LLM09 | — |
| COMP-04 | T2, T3, T13, T15, T17 | LLM02, LLM03 | — |
| ARCH-01 | All (T1-T17) | All (LLM01-LLM10) | — |
| ARCH-02 | T1, T6, T12, T14, T16 | LLM01, LLM04, LLM06, LLM08 | AML.T0051.001, AML.T0070, AML.T0080 |
| ARCH-03 | T1, T6 | LLM01, LLM04, LLM06, LLM08 | AML.T0051, AML.T0051.001 |
| ARCH-04 | T2, T3, T9, T11 | LLM05, LLM06 | AML.T0053, AML.T0050, AML.T0105 |
| ARCH-05 | T2, T3, T11, T13, T15 | LLM02, LLM05 | AML.T0086, AML.T0077, AML.T0057 |
| ARCH-06 | T8 | Cross-cutting | — |
| TOOL-01 | T2 | LLM06 | — |
| TOOL-02 | T2, T3, T9 | LLM06 | AML.T0053, AML.T0086 |
| TOOL-03 | T2, T3, T9 | LLM06 | AML.T0053, AML.T0086 |
| TOOL-04 | T2, T3, T11, T13, T15 | LLM02, LLM05, LLM06 | AML.T0053, AML.T0050, AML.T0086, AML.T0101 |
| TOOL-05 | T2, T3, T13, T15 | LLM02, LLM06 | AML.T0053, AML.T0086 |
| TOOL-06 | T2, T6 | LLM01, LLM06 | AML.T0053, AML.T0060, AML.T0104 |
| TOOL-07 | T2, T10, T15 | LLM06, LLM09 | — |
| TOOL-08 | T2, T3, T9 | LLM06 | AML.T0055, AML.T0083 |
| ID-01 | T3, T9 | LLM06 | AML.T0012, AML.T0055 |
| ID-02 | T3, T9 | LLM06 | AML.T0053 |
| ID-03 | T2, T3, T9, T13, T15 | LLM02, LLM06 | AML.T0053, AML.T0085 |
| ID-04 | T3, T8, T9 | Cross-cutting, LLM06 | AML.T0012 |
| ID-05 | T3, T9, T10, T15 | LLM06, LLM09 | AML.T0053 |
| ID-06 | T3, T9, T12, T14, T16 | LLM01, LLM06 | AML.T0012 |
| PROMPT-01 | T6 | LLM01, LLM06 | AML.T0051 |
| PROMPT-02 | T3, T6, T9, T13 | LLM01, LLM02, LLM06, LLM07 | AML.T0051.000, AML.T0054, AML.T0056 |
| PROMPT-03 | T1, T6, T12, T14, T16 | LLM01, LLM04, LLM06, LLM08 | AML.T0051.001, AML.T0070, AML.T0080 |
| PROMPT-04 | T6 | LLM01, LLM06 | AML.T0068 |
| PROMPT-05 | T3, T6, T9, T13 | LLM01, LLM02, LLM06, LLM07 | AML.T0056, AML.T0051.001 |
| PROMPT-06 | T2, T6 | LLM01, LLM06 | AML.T0051, AML.T0053 |
| PROMPT-07 | T1, T6 | LLM01, LLM04, LLM06, LLM08 | AML.T0051.001, AML.T0068 |
| DATA-01 | T2, T3, T13, T15 | LLM02 | — |
| DATA-02 | T2, T3, T13, T15 | LLM02 | AML.T0057, AML.T0086, AML.T0025 |
| DATA-03 | T2, T3, T9, T13, T15 | LLM02, LLM07 | AML.T0057, AML.T0086 |
| DATA-04 | T2, T3, T13, T15 | LLM02 | AML.T0085, AML.T0025 |
| DATA-05 | T2, T3, T13, T15 | LLM02 | AML.T0024 |
| RAG-01 | T1, T17 | LLM03, LLM04, LLM08 | AML.T0070, AML.T0071 |
| RAG-02 | T1, T10, T15 | LLM04, LLM06, LLM08, LLM09 | AML.T0070, AML.T0071 |
| RAG-03 | T1 | LLM04, LLM08 | AML.T0051.001, AML.T0070 |
| RAG-04 | T1, T10, T15 | LLM04, LLM06, LLM08, LLM09 | AML.T0070, AML.T0051.001 |
| RAG-05 | T1, T3, T9 | LLM04, LLM06, LLM08 | AML.T0085.000 |
| RAG-06 | T1 | LLM04, LLM08 | AML.T0070, AML.T0071 |
| MEM-01 | T1 | LLM04, LLM08 | AML.T0080.000, AML.T0051.001 |
| MEM-02 | T1, T3, T9 | LLM04, LLM06, LLM08 | AML.T0080.000 |
| MEM-03 | T1 | LLM04, LLM08 | AML.T0080.000 |
| MEM-04 | T1 | LLM04, LLM08 | AML.T0080.000, AML.T0061 |
| MEM-05 | T1 | LLM04, LLM08 | AML.T0080.000 |
| MEM-06 | T1 | LLM04, LLM08 | AML.T0080.000 |
| OUT-01 | T11 | LLM05 | — |
| OUT-02 | T11 | LLM05 | AML.T0077 |
| OUT-03 | T11 | LLM05 | AML.T0077 |
| OUT-04 | T10, T15 | LLM06, LLM09 | — |
| OUT-05 | T2, T3, T11, T13, T15 | LLM02, LLM05 | AML.T0057 |
| OUT-06 | T5, T11 | LLM05, LLM09 | AML.T0067, AML.T0054 |
| CODE-01 | T11 | LLM05, LLM06 | AML.T0050, AML.T0053 |
| CODE-02 | T11 | LLM05, LLM06 | AML.T0050, AML.T0025 |
| CODE-03 | T11 | LLM05, LLM06 | AML.T0050, AML.T0011 |
| CODE-04 | T11 | LLM05, LLM06 | AML.T0051.001, AML.T0050 |
| A2A-01 | T12, T14, T16 | LLM01, LLM06 | AML.T0012 |
| A2A-02 | T12, T14, T16 | LLM01, LLM06 | AML.T0051.001 |
| A2A-03 | T7, T12, T13, T14, T16 | LLM01, LLM06 | AML.T0051.001, AML.T0053 |
| A2A-04 | T7, T12, T13, T14, T16 | LLM01, LLM06 | AML.T0053 |
| A2A-05 | T3, T9, T12, T14, T16 | LLM01, LLM06 | AML.T0053 |
| A2A-06 | T7, T12, T13, T14, T16 | LLM01, LLM06 | — |
| A2A-07 | T7, T12, T13, T14, T16 | LLM01, LLM06 | AML.T0053 |
| HITL-01 | T10, T15 | LLM06, LLM09 | AML.T0067 |
| HITL-02 | T10, T15 | LLM06, LLM09 | AML.T0067 |
| HITL-03 | T10, T15 | LLM06, LLM09 | — |
| HITL-04 | T2, T10, T15 | LLM06, LLM09 | AML.T0053 |
| HITL-05 | T4, T10, T15 | LLM06, LLM09, LLM10 | — |
| RES-01 | T4 | LLM10 | AML.T0034.002 |
| RES-02 | T4, T7, T13 | LLM06, LLM10 | AML.T0034.002, AML.T0029 |
| RES-03 | T4 | LLM10 | AML.T0034.002, AML.T0029 |
| CPS-01 | T2, T7, T13 | LLM06 | — |
| CPS-02 | T2, T11 | LLM05, LLM06 | AML.T0048 |
| CPS-03 | T2, T7, T13 | LLM06 | AML.T0048, AML.T0053 |
| CPS-04 | T7, T13 | LLM06 | AML.T0048 |
| CPS-05 | T2, T12, T14, T16 | LLM01, LLM06 | AML.T0048 |
| OPS-01 | T8 | Cross-cutting | — |
| OPS-02 | T8 | Cross-cutting | — |
| OPS-03 | T6, T7, T13 | LLM01, LLM06 | AML.T0053, AML.T0054, AML.T0080 |
| OPS-04 | T2, T3, T13, T15 | LLM02, LLM06 | AML.T0086, AML.T0085, AML.T0053 |
| OPS-05 | T7, T13 | LLM06 | — |
| OPS-06 | T1, T8 | Cross-cutting, LLM04, LLM08 | — |
| SUP-01 | T17 | LLM03 | AML.T0010, AML.T0010.005 |
| SUP-02 | T17 | LLM03 | AML.T0010, AML.T0058, AML.T0011.001, AML.T0104, AML.T0109 |
| SUP-03 | T17 | LLM03 | — |
| SUP-04 | T17 | LLM03 | AML.T0010, AML.T0011.001, AML.T0109 |
| SUP-05 | T3, T9, T13, T17 | LLM02, LLM03, LLM07 | AML.T0010.001, AML.T0011.001, AML.T0055 |
| TEST-01 | All (T1-T17) | All (LLM01-LLM10) | — |
| TEST-02 | All (T1-T17) | All (LLM01-LLM10) | AML.T0051.000, AML.T0051.001, AML.T0054, AML.T0068, AML.T0070, AML.T0080 |
| TEST-03 | All (T1-T17) | All (LLM01-LLM10) | — |
| TEST-04 | All (T1-T17) | All (LLM01-LLM10) | — |
| TEST-05 | All (T1-T17) | All (LLM01-LLM10) | AML.T0051, AML.T0054 |
| CHG-01 | All (T1-T17) | All (LLM01-LLM10) | — |
| CHG-02 | T7, T8, T13, T17 | Cross-cutting, LLM03, LLM06 | — |
| CHG-03 | T7, T13, T17 | LLM03, LLM06 | AML.T0051, AML.T0054 |
| CHG-04 | T7, T13, T17 | LLM03, LLM06 | AML.T0010, AML.T0058, AML.T0109 |
| IR-01 | T7, T13 | LLM06 | AML.T0053, AML.T0108 |
| IR-02 | T1, T3, T9 | LLM04, LLM06, LLM08 | AML.T0012, AML.T0070, AML.T0080.000 |
| IR-03 | All (T1-T17) | All (LLM01-LLM10) | — |
| IR-04 | All (T1-T17) | All (LLM01-LLM10) | — |
| DEC-01 | T7, T13 | LLM06 | — |
| DEC-02 | T3, T7, T9, T13 | LLM06 | AML.T0012, AML.T0055 |
| DEC-03 | T1, T2, T3, T13, T15 | LLM02, LLM04, LLM08 | AML.T0085.000 |
| DEC-04 | T8 | Cross-cutting | — |
| DEC-05 | T7, T13 | LLM06 | AML.T0103 |
<!-- END GENERATED:crosswalk -->
