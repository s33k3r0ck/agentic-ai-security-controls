# Red-Team Test Results

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** TEST-01, TEST-02, TEST-03, TEST-05, PROMPT-02, PROMPT-03, PROMPT-04, CODE-01, CODE-02, CODE-03, CODE-04, CPS-02, CPS-03
> **SDLC gate:** 4 — Security Testing & Red Teaming  ·  **Family:** Testing
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Methodology

> Record the structured methodology used so the campaign is repeatable, not ad hoc (TEST-05). Name the recognized agentic procedures/benchmarks you followed (e.g., CSA agentic test suite, MAESTRO, AgentDojo, Promptfoo, or equivalent) and state how red teaming runs continuously, not only point-in-time. Link the standing methodology doc and the continuous-run schedule. Delete this guidance once filled.

- **Methodology / framework:** _<e.g., MAESTRO threat-modeling + AgentDojo task suite — example, replace>_
- **Benchmarks / procedures applied:** _<CSA agentic test suite / Promptfoo / internal corpus — list>_
- **Standing methodology doc:** _<link or path>_
- **Continuous-run cadence:** _<e.g., per-merge CI smoke + weekly full campaign + ad-hoc on model/tool change>_
- **Tooling / harness:** _<test harness, orchestration, model-under-test config>_
- **Manual vs. automated split:** _<% automated, what required a human red-teamer>_

## 2. Scope, Target & Environment

> Pin exactly what was tested so the result is bound to a release. Without a fixed target version and environment this evidence cannot back a gate decision. Note any in-scope/out-of-scope tools, connectors, and agents.

| Field | Value |
| --- | --- |
| Target system / agent | _<name>_ |
| Target version / build / commit | _<vN / git sha>_ |
| Model(s) + version | _<model name, version>_ |
| Environment | _<staging / pre-prod / isolated red-team env>_ |
| In-scope agents, tools, connectors | _<list>_ |
| Out of scope (and why) | _<list, with reason>_ |
| Campaign start date | _<YYYY-MM-DD>_ |
| Campaign end date | _<YYYY-MM-DD>_ |
| Red-team lead | _<name, role>_ |

## 3. AGT Coverage Map (TEST-01)

> TEST-01 requires every AGT risk to have at least one positive and one adversarial test. List each AGT risk and confirm both test types exist; link the test(s). Mark a risk _N/A_ only with a stated reason (e.g., no A2A surface → AGT-08 N/A). A blank cell is a coverage gap, not a pass.

| AGT risk | Name | Positive test | Adversarial test | Result | Evidence link |
| --- | --- | --- | --- | --- | --- |
| AGT-01 | Goal and intent manipulation | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-02 | Tool misuse and unsafe agency | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-03 | Identity and privilege compromise | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-04 | Sensitive disclosure and exfiltration | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-05 | Memory, RAG, vector, and context poisoning | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-06 | Insecure output handling | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-07 | Unexpected code execution / RCE | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-08 | Agent communication abuse | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-09 | Cascading hallucination and misinformation | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-10 | Human oversight and trust exploitation | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-11 | Resource overload and denial of wallet | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-12 | Supply chain compromise | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-13 | Rogue, misaligned, or deceptive agents | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-14 | Repudiation and audit gaps | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |
| AGT-15 | System prompt, secret, and policy leakage | _<id>_ | _<id>_ | _Pass / Fail / N/A_ | _<link>_ |

## 4. Fixture Corpus Exercised (TEST-02)

> TEST-02 requires a maintained adversarial fixture corpus covering the categories below. For each category, record how many fixtures ran and how many succeeded (i.e., the attack worked), and link the corpus. The prompt-injection categories map directly to PROMPT-02 (direct), PROMPT-03 (indirect), and PROMPT-04 (evasion/obfuscation) — keep those rows even if zero successes, since the gate needs proof they were tested.

| Category | Backs | Fixtures run | Attacks succeeded | Notes / examples |
| --- | --- | --- | --- | --- |
| Direct injection (policy override, false role, system-prompt extraction, refusal suppression, jailbreak) | PROMPT-02 | _<n>_ | _<n>_ | _<notes>_ |
| Indirect injection (poisoned docs, web pages, email, RAG chunks, memory, tool output, A2A messages) | PROMPT-03 | _<n>_ | _<n>_ | _<notes>_ |
| Evasion / obfuscation (encoding, homoglyphs, translation, multimodal payloads, boundary manipulation, multi-turn steering) | PROMPT-04 | _<n>_ | _<n>_ | _<notes>_ |
| Boundary manipulation | TEST-02 | _<n>_ | _<n>_ | _<notes>_ |
| Multimodal payloads (OCR, image, audio, QR) | TEST-02 | _<n>_ | _<n>_ | _<notes>_ |
| Multi-turn steering | TEST-02 | _<n>_ | _<n>_ | _<notes>_ |
| Tool / function-call abuse | TEST-02 | _<n>_ | _<n>_ | _<notes>_ |
| Agent-to-agent (A2A) | TEST-02 | _<n>_ | _<n>_ | _<notes>_ |

- **Corpus location / version:** _<link or path, corpus version>_
- **Fixtures added this campaign:** _<n>_

## 5. Outcome Metrics (TEST-03)

> TEST-03 requires tracking attack success rate, time-to-detect, time-to-block, time-to-contain, and the count of undetected malicious actions. These are the quantitative result of the campaign and feed the gate decision. State the measurement window and how each value was derived. An undetected count above zero is a containment/observability gap — describe it.

| Metric | Value | Target / threshold | Met? | Notes |
| --- | --- | --- | --- | --- |
| Attack success rate | _<x% (succeeded / total)>_ | _<target>_ | _Y / N_ | _<notes>_ |
| Mean time to detect (MTTD) | _<duration>_ | _<target>_ | _Y / N_ | _<notes>_ |
| Mean time to block | _<duration>_ | _<target>_ | _Y / N_ | _<notes>_ |
| Mean time to contain | _<duration>_ | _<target>_ | _Y / N_ | _<notes>_ |
| Undetected malicious actions | _<count>_ | _0_ | _Y / N_ | _<notes>_ |

> EXAMPLE row — delete: `| Attack success rate | 3.4% (7/206) | < 5% | Y | 7 successes all Medium, all fixed |`

## 6. Findings by Severity

> Record every finding, its severity, and its status against the release thresholds in §7. Critical/High findings drive the gate. Link the ticket and the regression test (§8) for each fixed path. AGT/PROMPT references tie the finding back to the risk it exercises.

| ID | Title | Severity | AGT / control | Status | Ticket | Regression test |
| --- | --- | --- | --- | --- | --- | --- |
| _F-01_ | _<short title>_ | _Critical / High / Medium_ | _<AGT-0x, PROMPT-0x>_ | _Open / Fixed / Accepted Risk_ | _<link>_ | _<id, §8>_ |
| _F-02_ | _<short title>_ | _Critical / High / Medium_ | _<AGT-0x>_ | _Open / Fixed / Accepted Risk_ | _<link>_ | _<id, §8>_ |

> EXAMPLE row — delete: `| F-01 | Indirect injection via RAG chunk triggers tool call | High | AGT-05, PROMPT-03 | Fixed | JIRA-1234 | RT-INJ-019 |`

## 7. Release-Threshold Status

> State the testing-gate verdict against the thresholds. Per the release floor: **Critical findings — zero open**; **High findings — zero open unless explicitly accepted** by the accountable risk owner with a documented, time-boxed waiver. Medium findings are tracked but do not block. If any High is accepted, link the waiver and name the approver. A failed threshold means the release does not pass Gate 4.

| Threshold | Requirement | Actual | Pass? |
| --- | --- | --- | --- |
| Critical findings | 0 open | _<count open>_ | _Y / N_ |
| High findings | 0 open unless accepted (with waiver) | _<count open / count accepted>_ | _Y / N_ |
| Medium findings | Tracked, non-blocking | _<count open>_ | _Y / N (tracked)_ |
| Undetected malicious actions | 0 | _<count>_ | _Y / N_ |

- **Accepted High findings (if any):** _<finding id(s)>_ — waiver _<link>_, approved by _<name, role>_, expires _<YYYY-MM-DD>_
- **Gate 4 verdict:** _Pass / Fail_

## 8. Regression Tests Added

> Every fixed exploit path needs a regression test so the same attack cannot silently return in a later release (closes the loop on §6 findings; aligns with the testing family's regression requirement). List each new test, the finding it locks down, and where it runs (e.g., CI suite). A fixed finding without a regression test is not fully closed.

| Regression test ID | Locks down (finding) | AGT / PROMPT | Lives in (suite / path) | Runs on |
| --- | --- | --- | --- | --- |
| _<RT-id>_ | _<F-0x>_ | _<AGT-0x, PROMPT-0x>_ | _<path>_ | _<CI trigger>_ |

> EXAMPLE row — delete: `| RT-INJ-019 | F-01 | AGT-05, PROMPT-03 | tests/redteam/indirect/ | per-merge CI |`

## Sign-off

> All listed owners must sign before this evidence backs the Gate 4 decision. The security owner is mandatory; include risk and product owners (and compliance if the system is in a regulated scope). An accepted High finding additionally requires the risk owner's signature on the waiver referenced in §7.

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Security owner (red-team lead) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Risk owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Product / system owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Compliance owner (if in scope) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / N/A_ |
