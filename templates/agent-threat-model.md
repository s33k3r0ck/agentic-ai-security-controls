# Agent Threat Model

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** ARCH-02, ARCH-03, ARCH-04, PROMPT-01
> **SDLC gate:** 1 — Architecture & Threat Modeling  ·  **Family:** Architecture
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and assumptions

> State exactly what this threat model covers so the evidence is unambiguous at review time. A threat model that does not name the agent build, its autonomy level, and its environments cannot back ARCH-02/03/04 for a specific release. Out-of-scope items must be listed so reviewers know what this artifact does *not* claim.

**Agent / system under model:** _<agent name and component>_
**Build / version covered:** _<git ref, model id, e.g. "claude-3-x @ <sha>">_
**Autonomy level:** _Assistive / Supervised / Semi-autonomous / Autonomous_
**Environments in scope:** _<dev / staging / prod; tenancy model>_
**Primary purpose / task domain:** _<one sentence>_

**Assumptions (trust we are explicitly granting):**
- _<e.g. the base model weights are trusted and not attacker-controlled>_
- _<e.g. the orchestration host OS and container runtime are trusted>_

**Out of scope (state and justify):**
- _<e.g. supply-chain integrity of dependencies — covered by SUP-0x>_
- _<e.g. physical/datacenter security — inherited from platform>_

> EXAMPLE (delete): "Covers the `support-copilot` orchestrator @ `a1b2c3d`, model `claude-3-5-sonnet`, supervised autonomy, in staging+prod multi-tenant. Out of scope: the upstream ticketing SaaS, modeled separately."

---

## 2. Trust boundaries and untrusted-input inventory (ARCH-02)

> ARCH-02 requires that **every** channel carrying content the model can read be labeled untrusted. List each input source, where it crosses into the agent's context, and confirm it is treated as untrusted (data, never instructions). Any unlisted channel is an implicit trust gap. Map each row to the AGT risk(s) it most enables. Mark rows N/A with a reason if a channel does not exist for this agent.

| Input channel | Enters context via | Untrusted? (Y/N) | Where boundary is enforced | AGT risk(s) |
|---|---|---|---|---|
| User input | _<chat / form / API param>_ | _Y_ | _<input tagging / wrapping>_ | _AGT-01, AGT-05_ |
| Files / uploads | _<attachment parser>_ | _Y_ | _<sandboxed parse + tagging>_ | _AGT-05_ |
| RAG / retrieved documents | _<retriever → context window>_ | _Y_ | _<source isolation, see RAG-0x>_ | _AGT-05_ |
| Memory / stored context | _<long-term memory store>_ | _Y_ | _<integrity check, see MEM-0x>_ | _AGT-05_ |
| Web content / browsing | _<fetch tool>_ | _Y_ | _<content sandbox + tagging>_ | _AGT-01, AGT-05_ |
| Tool / function output | _<tool result → context>_ | _Y_ | _<output wrapped as data>_ | _AGT-02, AGT-05_ |
| Email | _<inbox connector>_ | _Y_ | _<treated as data only>_ | _AGT-01, AGT-08_ |
| Media (image / audio / video) | _<multimodal input>_ | _Y_ | _<no embedded-instruction trust>_ | _AGT-01_ |
| A2A messages | _<agent-to-agent channel>_ | _Y_ | _<authn + quorum, see A2A-0x>_ | _AGT-08_ |
| _<other channel>_ | _<...>_ | _<Y/N or N/A — reason>_ | _<...>_ | _<...>_ |

> If any channel above is answered **N** (treated as trusted), it must be justified here and accepted as residual risk in §7 — do not leave a trusted-input channel unexplained.

**Untrusted-channel justifications / exceptions:** _<none, or list>_

---

## 3. Separation of instructions from data (ARCH-03)

> ARCH-03 requires that retrieved data and tool output **cannot** change policy, identity, permissions, or approval rules. Describe the mechanism that keeps the agent's governing instructions (system prompt, policy, role/identity, tool-gating, approval rules) structurally separate from any untrusted content listed in §2. This is the core defense against AGT-01 (goal and intent manipulation) and AGT-05 (memory, RAG, vector, and context poisoning).

**Mechanism for instruction/data separation:** _<e.g. system policy held outside the model-visible window; untrusted content delivered only in clearly delimited data slots; structured tool-call interface rather than free text>_

**What untrusted content provably CANNOT alter:**

| Governed property | Cannot be changed by untrusted content because… | Verified by |
|---|---|---|
| Policy / guardrails | _<held server-side, not in editable context>_ | _<test id / design review>_ |
| Identity / role | _<bound to authenticated principal, not prompt>_ | _<test id>_ |
| Permissions / tool access | _<enforced at gateway, not by model text>_ | _<test id>_ |
| Approval / human-in-loop rules | _<out-of-model policy engine>_ | _<test id>_ |

> EXAMPLE (delete): "System policy and tool allow-list are injected by the orchestrator and never echoed into a writable slot; retrieved docs arrive only inside a `<retrieved_data>` boundary the model is instructed (and trained) to treat as untrusted reference, not commands. Verified by PROMPT-03 injection suite."

---

## 4. Containment boundaries (ARCH-04)

> ARCH-04 requires memory, tools, execution, network, filesystem, tenant data, logs, and output paths to be bounded. For each containment domain, state the boundary and what an attacker who has *already* subverted the model (assume prompt injection succeeded — see §6) still cannot reach. This is the blast-radius limiter for AGT-02 (tool misuse and unsafe agency), AGT-03 (identity and privilege compromise), and AGT-07 (unexpected code execution / RCE).

| Containment domain | Boundary / limit in place | Worst-case reach if model is subverted | AGT risk(s) | Enforcing control / link |
|---|---|---|---|---|
| Memory | _<scoped, TTL, integrity-checked>_ | _<...>_ | _AGT-05_ | _<MEM-0x>_ |
| Tools | _<allow-list, least privilege>_ | _<...>_ | _AGT-02_ | _<TOOL-0x>_ |
| Execution / code | _<sandbox, no host access>_ | _<...>_ | _AGT-07_ | _<CODE-0x>_ |
| Network egress | _<deny-by-default allow-list>_ | _<...>_ | _AGT-04, AGT-08_ | _<...>_ |
| Filesystem | _<read-only / scoped workdir>_ | _<...>_ | _AGT-07_ | _<...>_ |
| Tenant data | _<per-tenant isolation>_ | _<...>_ | _AGT-03_ | _<...>_ |
| Logs | _<no secret/PII echo, scoped access>_ | _<...>_ | _AGT-04_ | _<OPS-0x>_ |
| Output paths / sinks | _<encoded before HTML/SQL/shell>_ | _<...>_ | _AGT-06_ | _<...>_ |

**Privilege model summary:** _<who/what the agent runs as; how delegated/inherited privileges are bounded — guards AGT-03>_

---

## 5. AGT risk mapping

> Map this agent's exposure across the AGT risk model (AGT-01..AGT-15) referenced by ARCH-02/03/04 and PROMPT-01. For each AGT risk, state whether it applies, give a concrete attack scenario for this specific agent, and link the containing control(s)/test(s). The six highlighted rows (AGT-01, AGT-02, AGT-03, AGT-05, AGT-07, AGT-08) are the ones this gate's controls most directly address — do not leave them blank. Mark clearly inapplicable risks N/A with a reason; do not delete rows (a blank or removed row reads as "not considered").

| AGT id | Risk | Applies? (Y/N/NA) | Attack scenario for THIS agent | Mitigating control(s) / test(s) |
|---|---|---|---|---|
| AGT-01 | Goal and intent manipulation | _Y_ | _<injected text in a retrieved doc redirects the task>_ | _ARCH-03, PROMPT-01, PROMPT-03_ |
| AGT-02 | Tool misuse and unsafe agency | _Y_ | _<chaining read+send tools to exfiltrate>_ | _ARCH-04, TOOL-0x_ |
| AGT-03 | Identity and privilege compromise | _Y_ | _<agent reuses cached admin token across tenants>_ | _ARCH-04_ |
| AGT-04 | Sensitive disclosure and exfiltration | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-05 | Memory, RAG, vector, and context poisoning | _Y_ | _<poisoned memory entry steers future runs>_ | _ARCH-02, ARCH-03, MEM-0x, RAG-0x_ |
| AGT-06 | Insecure output handling | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-07 | Unexpected code execution / RCE | _Y_ | _<model writes shell that escapes the sandbox>_ | _ARCH-04, CODE-0x_ |
| AGT-08 | Agent communication abuse | _Y_ | _<spoofed A2A message carries unsafe instructions>_ | _ARCH-02, A2A-0x_ |
| AGT-09 | Cascading hallucination and misinformation | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-10 | _<see Appendix D>_ | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-11 | _<see Appendix D>_ | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-12 | _<see Appendix D>_ | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-13 | _<see Appendix D>_ | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-14 | _<see Appendix D>_ | _<Y/N>_ | _<...>_ | _<...>_ |
| AGT-15 | _<see Appendix D>_ | _<Y/N>_ | _<...>_ | _<...>_ |

> Refer to `docs/checklist.md` Appendix D for the authoritative AGT-01..AGT-15 names and failure modes. Do not invent AGT ids beyond AGT-15.

---

## 6. Prompt-injection assumption and out-of-model containment (PROMPT-01)

> PROMPT-01 requires you to **assume prompt injection succeeds** — authorization, tool gating, identity, approval, and execution controls must not rely on prompt text alone. State the assumption explicitly, then list the controls that hold *even when the model is fully manipulated*. This section is the proof that security does not depend on the model "behaving."

**Assumption (state verbatim):** _We assume an attacker can fully control any untrusted input in §2 and can make the model attempt any action. Security does not depend on the model resisting injection._

**Out-of-model controls that contain a successfully-injected model:**

| Enforcement point | Control (independent of prompt text) | Holds if model is manipulated? | Link / test |
|---|---|---|---|
| Authorization | _<policy engine checks principal, not prompt>_ | _Y_ | _<...>_ |
| Tool gating | _<gateway allow-list + per-tool scopes>_ | _Y_ | _<TOOL-0x>_ |
| Identity | _<bound to authenticated session>_ | _Y_ | _<...>_ |
| Approval / human-in-loop | _<out-of-model approval for high-impact actions>_ | _Y_ | _<...>_ |
| Execution | _<sandbox + egress deny-by-default>_ | _Y_ | _<CODE-0x>_ |

**Prompt-injection test coverage:** _<link to PROMPT-03 / TEST red-team suite results>_

> If any row above answers **N** (a control that relies on prompt text), that is a PROMPT-01 finding and must appear as residual risk in §7 with a remediation plan.

---

## 7. Residual risks

> List risks that remain after the controls above, with their accepted status and links to the mitigating control or test that bounds them. A threat model with zero residual risks is usually under-analyzed. Anything accepted here must follow the checklist's waiver rules — and note that hard-floor controls cannot be waived as "Accepted Risk."

| # | Residual risk | Related AGT id | Severity | Mitigating control / test | Disposition | Owner |
|---|---|---|---|---|---|---|
| 1 | _<e.g. novel injection vector not yet in test suite>_ | _AGT-01_ | _Med_ | _PROMPT-03 backlog item <link>_ | _Accepted / Open / Mitigated_ | _<name>_ |
| 2 | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |

> EXAMPLE (delete): "Multimodal injection via images is in scope but the red-team suite covers text only; tracked as TEST-backlog #142, accepted for this release at Med severity by the security owner."

---

## Sign-off

> All listed owners must sign before this artifact is "Approved" evidence for Gate 1. The security owner sign-off is mandatory; include product and risk owners as fits the system's blast radius.

| Role | Name | Date | Decision |
|---|---|---|---|
| Security owner (required) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve-with-conditions_ |
| Product / system owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Risk / compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
