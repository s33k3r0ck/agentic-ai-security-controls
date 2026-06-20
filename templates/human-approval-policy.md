# Human Approval Policy

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** HITL-01, HITL-03, HITL-04, HITL-05, TOOL-04, ID-05
> **SDLC gate:** 2 — Secure Design  ·  **Family:** Human Oversight
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and intent

> State which agent(s), tools, and environments this policy governs, and the autonomy level in scope. This document is the design-time artifact that proves human oversight is specified before release (Gate 2). Name the surrounding controls it depends on (e.g. TOOL-04 policy gate, ID-05 step-up) so a reviewer can trace the chain. Keep it to a few sentences; delete this blockquote.

- **Agent(s) in scope:** _<agent / workflow names>_
- **Tools / integrations in scope:** _<MCP servers, APIs, DB/file actions>_
- **Environments:** _<prod / staging / both>_
- **Autonomy level:** _<suggest-only / approval-required / supervised-autonomy / full-autonomy>_
- **Out of scope:** _<what this policy does not cover, and where that is covered instead>_

## 2. Actions requiring human approval (HITL-04, TOOL-04)

> Enumerate every action class that must pass a human gate before execution. HITL-04 requires per-invocation approval tokens for delete, transfer, publish, spend, external-contact, and safety-relevant actions unless formally automated by policy. TOOL-04 requires irreversible, external, sensitive, permission-changing, or code-executing tool calls to pass a policy gate. For each row, decide the gate: per-invocation human approval, policy-approved automation (with the policy referenced), draft-only (the agent only proposes; real execution is gated by an external authority — name it, e.g. behind step-up auth / SCA in a downstream system), or blocked outright. Where the agent only proposes/drafts a high-risk action and real execution happens out-of-band, state that explicitly and name where the real execution gate lives — that location is the evidence, not a bare Yes/No. Anything "policy-approved automation" must name the policy and its review owner — silent auto-approval is not allowed. Add rows for any domain-specific high-impact action. Delete the EXAMPLE row.

| Action class | In-scope examples | Trigger / threshold | Gate (per-invocation approval / policy-automated / blocked) | Backing control | If policy-automated, reference |
|---|---|---|---|---|---|
| Delete | _<delete records, files, resources>_ | _<scope / count threshold>_ | _<gate>_ | HITL-04, TOOL-04 | _<policy id or N/A>_ |
| Transfer / move | _<move funds, data, ownership>_ | _<threshold>_ | _<gate>_ | HITL-04 | _<policy id or N/A>_ |
| Publish | _<post, send to customers, make public>_ | _<audience size / channel>_ | _<gate>_ | HITL-04 | _<policy id or N/A>_ |
| Spend | _<purchase, charge, commit budget>_ | _<amount threshold, e.g. > $___>_ | _<gate>_ | HITL-04 | _<policy id or N/A>_ |
| External-contact | _<email, message, call third parties>_ | _<recipient class>_ | _<gate>_ | HITL-04, TOOL-04 | _<policy id or N/A>_ |
| Safety-relevant | _<physical actuation, access control, prod config>_ | _<any>_ | _<gate>_ | HITL-04, TOOL-04 | _<policy id or N/A>_ |
| Permission / code-exec | _<grant access, run code, change IAM>_ | _<any>_ | _<gate>_ | TOOL-04 | _<policy id or N/A>_ |
| _EXAMPLE — delete this row: Issue refund_ | _Refund a customer order_ | _Amount > $200_ | _Per-invocation human approval_ | _HITL-04, TOOL-04_ | _N/A_ |

> Note the relationship to AGT-10 (human oversight and trust exploitation) and AGT-02 (tool misuse and unsafe agency): these action classes are exactly the ones where an unchecked agent does the most damage. If you mark any class "policy-automated", confirm the automation itself was risk-assessed at Gate 2.

## 3. Approval packet — what the approver sees (HITL-01)

> HITL-01 requires the approver to see action, target, source evidence, risk, policy result, and expected side effects before deciding. List the exact fields rendered in the approval UI/notification. A reviewer should be able to confirm from this table that no approval is ever a bare "Approve / Deny" with no context — that is the blind-approval failure HITL-01 prevents. Mark any field that is currently missing as a gap in §8. If an inline guard/firewall layer screens inbound prompts and/or outbound responses, record its verdict and its enforcement mode per environment (enforce / monitor / off — e.g. enforce in prod, monitor in staging): the approver/customer must see the true result, and a guard decision the UI renders as success (block-but-UI-shows-success) is a tracked discrepancy, not a pass. The guard is a COMPENSATING control and does not replace server-side authorization. For Source evidence, note if the justification originates from an untrusted channel — page / DOM / serialized client context (route, selected ids, visible balances/labels supplied by the front-end) is an attacker-forgeable untrusted channel; treat it as DATA, and client-supplied identifiers must be re-authorized server-side and never trusted for authorization (AGT-01, AGT-03). The same applies to user input, uploaded doc/OCR, RAG, and tool output.

| Packet field | What it shows | Source of the value | Present? (Y/N) |
|---|---|---|---|
| Action | _<the action class and verb>_ | _<orchestrator>_ | _<Y/N>_ |
| Target | _<the specific object / recipient / amount>_ | _<tool call args>_ | _<Y/N>_ |
| Source evidence | _<why the agent proposes this — retrieved docs, user request, reasoning trace>_ | _<RAG / context>_ | _<Y/N>_ |
| Risk summary | _<risk level + AGT-0x risks engaged>_ | _<risk classifier / policy>_ | _<Y/N>_ |
| Policy result | _<allow / gate / deny decision from the policy engine>_ | _<policy engine, TOOL-04 gate>_ | _<Y/N>_ |
| Guard / firewall verdict (and enforce vs monitor mode) | _<inbound/outbound guard decision + mode per environment>_ | _<inline guard / firewall layer>_ | _<Y/N>_ |
| Expected side effects | _<irreversibility, blast radius, downstream effects>_ | _<action metadata>_ | _<Y/N>_ |
| Provenance | _<initiating user / agent / session id, prompt origin; channel trust level>_ | _<identity / audit log>_ | _<Y/N>_ |

> Provenance matters because external-contact and publish actions can be triggered by prompt injection (AGT-01, goal and intent manipulation); the approver must be able to see who/what asked for the action, not just what it does.

## 4. Approver roles and step-up / independent confirmation (ID-05)

> ID-05 requires high-impact actions to have independent confirmation OR policy-approved automation, and step-up for sensitive actions. Define who is authorized to approve each action class, what authentication step-up they must pass, and how independent confirmation is satisfied. The two-human segregation-of-duties rule (the requester cannot also approve) applies to third-party-approver models; ID-05 is ALSO satisfiable by policy-approved automation + step-up (e.g. end-user self-confirmation gated by external SCA) — name that policy from §2 in the column rather than forcing a misleading "No / N/A". Tie the roles back to the action classes in §2. Delete the EXAMPLE row.

| Action class (from §2) | Authorized approver role(s) | Step-up required (re-auth / MFA / hardware key) | Independent confirmation method (second approver OR policy-approved automation) | Backing control |
|---|---|---|---|---|
| _<class>_ | _<role>_ | _<step-up method>_ | _<second approver + who / OR policy-approved automation + policy id>_ | ID-05 |
| _EXAMPLE — delete this row: Spend > $10k_ | _Finance approver (not the requester)_ | _MFA re-auth at approval time_ | _Second finance approver_ | _ID-05_ |

- **Segregation of duties rule:** _<for third-party-approver models, the agent's operator/requester may not be the approver for actions over ___ ; describe. N/A where ID-05 is met by policy-approved automation + step-up — name the policy instead>_
- **Approver identity is verified by:** _<SSO group / role assertion / hardware token>_
- **Authorization boundary / principal isolation:** _<how every action is bound to the authenticated principal and cross-principal access is denied closed>_ — name the real isolation boundary (tenant, per-customer, or per-user) and how cross-boundary access fails closed. Single-tenant systems are often still multi-customer; do not just name the credential audience. For self-authorization models this per-principal binding is the substitute control that replaces an absent second approver.

## 5. Approval tokens and binding (HITL-04)

> HITL-04 requires per-invocation approval tokens. Describe the token so a reviewer can confirm an approval cannot be replayed, reused for a different action, or forged. The key property is binding: one token authorizes exactly one action invocation with the exact parameters that were shown to the approver. If the agent mutates the parameters after approval, the token must no longer validate. Fill each field. If high-impact execution is gated outside the agent (e.g. payment-rail SCA / step-up in a downstream system), describe that external gate here instead of an agent-minted token, name where the real execution gate lives, and confirm the agent cannot execute without it (it only drafts/proposes) — that external gate is the evidence, not a bare Yes/No.

- **Token issuer / authority:** _<service that mints the token after a human approves>_
- **Bound to (must include):** _<action id, parameter hash, target, approver id, timestamp>_
- **Single-use:** _<Yes — consumed on execution; describe replay prevention>_
- **Expiry / validity window:** _<e.g. valid for N minutes; expired tokens are rejected>_
- **Re-binding on parameter change:** _<if action args change after approval, the token is invalidated and re-approval is required — describe enforcement>_
- **Verification point:** _<where the executor checks the token before the side-effecting call — e.g. the TOOL-04 policy gate>_
- **Token storage / audit:** _<approval record retained, links token → approver → action → outcome>_

## 6. Approval-fatigue controls (HITL-03)

> HITL-03 requires monitoring of approval volume, repeated prompts, latency, and bulk-approval patterns. Approval fatigue (AGT-10) silently degrades oversight: when approvers are flooded they rubber-stamp. Define the limits and detections that keep approval meaningful. Set real numbers, not "TBD", before release.

| Fatigue control | Setting / threshold | What happens on breach |
|---|---|---|
| Per-approver volume limit | _<max approvals / hour>_ | _<throttle / route to backup approver / alert>_ |
| Minimum decision latency | _<min seconds to read packet before Approve enables>_ | _<approval blocked until elapsed>_ |
| Bulk / batch approval | _<allowed? if yes, max items per batch and per-item visibility>_ | _<no blind bulk approval — each item shows its §3 packet>_ |
| Repeated / duplicate prompts | _<dedup window>_ | _<collapse duplicates, flag repetition>_ |
| Latency budget for approval | _<max wait before the request escalates or times out>_ | _<escalate / fail safe per §7>_ |

- **Monitoring / alerting:** _<dashboard or metric that tracks approval rate, deny rate, mean decision latency; who reviews it>_
- **No blind bulk approval rule:** _<explicit statement that bulk approval still renders each item's evidence packet (HITL-01); describe>_

## 7. Fail-safe behaviour when oversight is unavailable (HITL-05)

> HITL-05 requires that if human review cannot be obtained under degraded conditions, the system stops or falls back safely (relates to AGT-10, human oversight and trust exploitation). Define the degraded conditions and the default. The default for a high-impact action with no available approver must be safe — typically deny/hold, never auto-execute. Describe how this was drilled (HITL-05 evidence is a degraded-mode drill).

| Degraded condition | Default behaviour | Who is notified | Backing control |
|---|---|---|---|
| No approver available within latency budget | _<hold / deny / queue — NOT auto-execute>_ | _<on-call / owner>_ | HITL-05 |
| Approval service / token authority down | _<block high-impact actions; allow only safe read-only ops>_ | _<on-call>_ | HITL-05 |
| Notification channel unreachable | _<fail closed for in-scope action classes>_ | _<owner>_ | HITL-05 |
| Approver explicitly unavailable (off-hours, outage) | _<escalate to backup; else hold>_ | _<escalation path>_ | HITL-05 |
| Guard verdict and UI state disagree (e.g. guard blocks but UI shows success) | _<treat as not-approved / fail closed; reconcile before any side effect>_ | _<on-call / owner>_ | HITL-05 |

- **Fail-safe default for high-impact actions:** _<deny / hold for human — stated explicitly>_
- **Guard enforcement mode:** _<enforce vs monitor per environment; a monitor-mode guard in non-prod must never be relied on as the approval gate>_
- **Degraded-mode drill:** performed on _<YYYY-MM-DD>_ by _<name>_ — result: _<pass / findings>_; evidence at _<link>_
- **Recovery / replay:** _<how held actions are resumed once oversight returns; are they re-presented with a fresh §3 packet and new §5 token?>_

## 8. Gaps, exceptions, and accepted risk

> Record any control not fully met and how it is handled. Accepted Risk is NOT permitted on hard-floor controls — confirm whether any of HITL-01/HITL-03/HITL-04/HITL-05/TOOL-04/ID-05 is a release floor for this profile before accepting risk against it. List the gap, the compensating control, the owner, and the review date. Delete the EXAMPLE row. If there are no gaps, write "None."

| Control | Gap / exception | Compensating control | Risk decision | Owner | Review by |
|---|---|---|---|---|---|
| _<ID>_ | _<what is not met>_ | _<mitigation>_ | _<Mitigated / Accepted Risk (if permitted)>_ | _<name>_ | _<YYYY-MM-DD>_ |
| _EXAMPLE — delete this row: HITL-03_ | _No automated latency metric yet_ | _Weekly manual review of approval logs_ | _Mitigated_ | _<name>_ | _<YYYY-MM-DD>_ |

## 9. Evidence references

> Link the concrete artifacts a reviewer can inspect to verify this policy is real and enforced, not just written. These map to the checklist's stated evidence for each control (approval records, policy decision logs, approval logs, HITL monitoring, degraded-mode drill).

- Policy-engine / TOOL-04 gate config: _<link>_
- Approval UX screenshot or spec showing the §3 packet (HITL-01): _<link>_
- Approval records / token audit log sample (HITL-04, ID-05): _<link>_
- HITL monitoring dashboard (HITL-03): _<link>_
- Degraded-mode drill report (HITL-05): _<link>_

---

## Sign-off

> All listed owners review and sign before this artifact is accepted into the release evidence package. The security owner is mandatory; include risk, product, and compliance owners as they apply to the action classes in scope (e.g. compliance for spend/transfer, product for publish/external-contact).

| Role | Name | Date | Decision |
|---|---|---|---|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Risk owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
| Compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Approve with conditions_ |
