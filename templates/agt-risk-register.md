# AGT Risk Register

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** ARCH-02, GOV-03, TEST-01
> **SDLC gate:** 1 — Architecture & Threat Modeling  ·  **Family:** Architecture, Governance
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and method

> State what this register covers so a reviewer can judge whether the analysis is complete. This is the per-system view of the 15 AGT risk families (AGT-01..AGT-15). It is the evidence that the team walked the full risk model, not a hand-picked subset.
> Tie the method back to the controls this register backs:
> - **ARCH-02 (Mark untrusted inputs):** name where untrusted/external input enters the agent (user messages, tool/RAG results, inter-agent messages, web content) — these are the surfaces most AGT rows reference.
> - **GOV-03 (Define high-risk actions):** reference the high-risk action inventory the agent can take (spend, send, delete, deploy, change permissions); high likelihood/impact rows should map to those actions.
> - **TEST-01 (Map tests to AGT risks):** every applicable risk must have a test reference, so this register and the test suite stay in lockstep.

**Agent autonomy level:** _<e.g. supervised / human-in-the-loop / autonomous>_
**Untrusted input surfaces (ARCH-02):** _<list: user input, tool outputs, RAG corpus, A2A messages, web fetch, …>_
**High-risk actions inventory (GOV-03):** _<reference doc / link>_
**Assessment participants:** _<names, roles>_
**Likelihood scale used:** _Low / Medium / High_  ·  **Impact scale used:** _Low / Medium / High_

> Delete this guidance once the fields above are filled.

---

## 2. AGT risk register

> Fill one row per AGT family — all 15 rows must be present. Do not delete rows for risks you think do not apply; instead set **Applicable = N** and put the reason in **Scenario**, mirroring the checklist status model (an N/A item still carries a justification, exactly like a control marked N/A). Leaving a row blank is not the same as marking it N/A.
> Column notes:
> - **Applicable:** _Y_ or _N_. If _N_, the Scenario cell must state why (e.g. "agent has no tool access", "no memory/RAG in this system").
> - **Scenario:** how this risk would concretely manifest in _this_ system. Reference the untrusted surface (ARCH-02) or high-risk action (GOV-03) involved.
> - **Likelihood / Impact:** _Low / Medium / High_ for the unmitigated risk, given this system.
> - **Mitigating control IDs:** the checklist control IDs that reduce this risk (e.g. `TOOL-01`, `ID-02`, `OUT-03`). Use real IDs from `docs/checklist.md`; do not invent IDs.
> - **Test ref (TEST-01):** the test case / suite ID that exercises this risk. Required for every applicable row — this is the GOV/TEST link that proves coverage.
> - **Residual risk:** _Low / Medium / High_ after the listed controls and tests. A High residual must be accepted explicitly in §3.
> - **Owner / Status:** accountable person and _Open / Mitigated / Accepted / N/A_.

| AGT id | Risk family | Applicable (Y/N) | Scenario for this system | Likelihood | Impact | Mitigating control IDs | Test ref (TEST-01) | Residual risk | Owner | Status |
|--------|-------------|:---------------:|--------------------------|:----------:|:------:|------------------------|--------------------|:------------:|-------|--------|
| AGT-01 | Goal manipulation | _Y/N_ | _<how a crafted input could redirect the agent's objective>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-02 | Tool misuse | _Y/N_ | _<agent invokes a tool with harmful/unintended parameters>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-03 | Identity / privilege | _Y/N_ | _<agent acts with excess privilege or impersonates a principal>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-04 | Sensitive disclosure / exfiltration | _Y/N_ | _<agent leaks or exfiltrates sensitive data to an output/tool>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-05 | Memory / RAG / context poisoning | _Y/N_ | _<malicious content enters memory or the retrieval corpus and steers later behavior>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-06 | Insecure output handling | _Y/N_ | _<agent output rendered/executed downstream without filtering (e.g. HTML, SQL, shell)>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-07 | Code execution / RCE | _Y/N_ | _<agent runs attacker-influenced code or escapes a sandbox>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-08 | Agent communication abuse | _Y/N_ | _<inter-agent (A2A) messages are forged, replayed, or used to coerce action>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-09 | Cascading hallucination | _Y/N_ | _<an unverified false output feeds the next step and amplifies>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-10 | Human-oversight exploitation | _Y/N_ | _<agent games the approval/HITL step or induces rubber-stamping>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-11 | Resource overload / denial-of-wallet | _Y/N_ | _<runaway loops or token/tool spend exhaust budget or rate limits>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-12 | Supply chain | _Y/N_ | _<compromised model, dependency, MCP server, or tool integration>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-13 | Rogue / deceptive agents | _Y/N_ | _<a sub-agent or peer behaves adversarially or hides its intent>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-14 | Repudiation / audit gaps | _Y/N_ | _<actions cannot be reliably attributed or reconstructed from logs>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |
| AGT-15 | System-prompt / secret / policy leakage | _Y/N_ | _<system prompt, credentials, or policy logic is extracted via the agent>_ | _L/M/H_ | _L/M/H_ | _<control IDs>_ | _<test id>_ | _L/M/H_ | _<owner>_ | _Open/Mitigated/Accepted/N/A_ |

> **EXAMPLE — delete this example.** A filled AGT-02 row for a support copilot with refund tooling might read:
> `| AGT-02 | Tool misuse | Y | Prompt-injected ticket text triggers an over-large refund via the billing tool | M | H | TOOL-01, GOV-03, OUT-03 | RT-014 | L | A. Rivera (Sec Eng) | Mitigated |`
> Delete this example before sign-off.

---

## 3. Residual risk & acceptances

> List every row whose **Residual risk** is Medium or High, or whose **Status** is _Accepted_. Each accepted residual risk needs a named accountable owner and an explicit decision — this is the bridge to GOV-03 (high-risk actions are governed, not silently allowed). Do not accept a residual risk that maps to a hard-floor control without checking the checklist's hard-floor rule; floor controls cannot be waived via "Accepted Risk".

| AGT id | Residual risk | Reason it cannot be reduced further | Accepted by (name, role) | Review-by date |
|--------|:------------:|-------------------------------------|--------------------------|----------------|
| _<AGT-0x>_ | _M/H_ | _<why; compensating controls; monitoring in place>_ | _<name, role>_ | _<YYYY-MM-DD>_ |

> If no Medium/High residual risks remain, write "None" in the first cell and delete the example placeholders. Delete this guidance once filled.

---

## 4. Coverage confirmation

> Quick self-check before sign-off. Confirm the register is complete and consistent with the controls it backs. Replace each _Y/N_ and add a note where needed.

- All 15 AGT rows (AGT-01..AGT-15) present, each marked Applicable Y or N with a reason: _Y/N_
- Untrusted input surfaces from ARCH-02 are reflected in the relevant scenarios: _Y/N_
- Every applicable row maps to at least one high-risk action or control consistent with GOV-03: _Y/N_
- Every applicable row has a test reference per TEST-01 (no applicable risk without a test): _Y/N_
- Mitigating control IDs reference real checklist IDs (no invented IDs): _Y/N_
- Residual Medium/High risks all appear in §3 with a named acceptor: _Y/N_

> Delete this guidance block once every line is answered.

---

## Sign-off

> The security owner is always required. Add the risk/product owner because residual-risk acceptances (GOV-03) are a business decision, not a security-only one. Add the QA/test owner because TEST-01 coverage is asserted here. Each signer confirms the rows in their remit are accurate and complete.

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Risk / product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| QA / test owner (TEST-01) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Compliance owner (if applicable) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
