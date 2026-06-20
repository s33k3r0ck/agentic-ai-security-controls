# Kill-Switch Drill Record

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** OPS-05, IR-01, OPS-06, CPS-04
> **SDLC gate:** 5 — Release Readiness  ·  **Family:** Operations, Incident Response
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Purpose and scope

> State what this record proves: that a kill switch exists for the agent and was actually exercised end-to-end (scope, steps, time-to-disable, verification). One drill record covers one drill run against one release/version. Keep it factual.

This record documents a kill-switch drill for _<system / agent name>_ at version _<vN>_, exercising the ability to disable the agent (or specific components of it) without a full redeploy. It provides Gate 5 evidence for **OPS-05** (kill switch provided), **IR-01** (affected components can be disabled), the **kill-switch + cadence** portion of **OPS-06** (incident drills are run on a defined cadence — the rotate-credentials / quarantine-state / investigate / safe-restore aspects of OPS-06 are evidenced in `incident-runbook.md`), and **CPS-04** (the agent cannot disable safety interlocks / emergency shutdown — see §2a; mark `N/A` with a reason for non-cyber-physical systems).

- **Environment drilled:** _<production / staging / production-equivalent>_
- **Drill type:** _<live in production / game-day in staging / tabletop + live partial>_
- **Related incident-response runbook:** _<link or doc id>_

## 2. Kill-switch mechanisms (OPS-05)

> List every available kill-switch layer and, for each, the exact trigger and whether it works **without a full redeploy** (OPS-05 requires a fast off-switch, not a code release). Cover all layers that apply to this system: whole **agent**, individual **workflow**, **tool**, **connector**, and **model**. Mark layers that genuinely do not exist for this system as `N/A` with a reason — do not leave blanks. A missing or redeploy-only switch is a gap to record in §6. This directly bounds blast radius for a misbehaving agent (AGT-01 / AGT-02).

| Layer | Mechanism exists? | Trigger / how invoked | Who can invoke | Redeploy-free? | Notes |
|-------|-------------------|-----------------------|----------------|----------------|-------|
| Agent (whole) | _Yes / No / N/A_ | _<e.g. feature flag `agent.enabled=false` via config service>_ | _<role / on-call>_ | _Yes / No_ | _<propagation time, scope>_ |
| Workflow / task | _Yes / No / N/A_ | _<e.g. disable workflow `X` in orchestrator console>_ | _<role>_ | _Yes / No_ | _<...>_ |
| Tool / action | _Yes / No / N/A_ | _<e.g. revoke tool `send_email` in tool registry>_ | _<role>_ | _Yes / No_ | _<...>_ |
| Connector / integration | _Yes / No / N/A_ | _<e.g. rotate/revoke connector credential, close egress>_ | _<role>_ | _Yes / No_ | _<...>_ |
| Model / inference | _Yes / No / N/A_ | _<e.g. route model endpoint to deny/stub, pull API key>_ | _<role>_ | _Yes / No_ | _<...>_ |

> EXAMPLE row — delete: `| Tool / action | Yes | Set tools.payments.disabled=true in flag service, propagates in <30s | Platform on-call | Yes | Does not stop in-flight calls; see §4 |`

- **Single "stop everything" control:** _<does one action disable the whole agent? describe it, or note that layers must be triggered individually>_

> For any enforcement/guard layer (e.g. an inline input/output guard or firewall), state the kill semantics — disable vs. fail-closed — and confirm it does not fail open when the agent is partially disabled. A guard is a COMPENSATING control and does not replace server-side authorization; record its enforcement mode per environment (enforce / monitor / off — e.g. enforce in prod, monitor in staging) and whether a guard block/redaction surfaces correctly to the user and to logs (a block the UI renders as success is a tracked discrepancy, not a pass).
> For draft/propose-only tools, state what the switch does and does not stop — e.g. it stops new drafts, but where the agent only proposes/drafts a high-risk action and real execution happens out-of-band (e.g. behind step-up auth / SCA in a downstream system), that downstream execution path is separate and intentionally unaffected. Name where the real execution gate lives so a reviewer does not misread the kill as incomplete or as false assurance that execution was stopped.

## 2a. Emergency shutdown / safety interlocks (CPS-04)

> CPS-04 is distinct from OPS-05's off-switch: it concerns the agent being **unable to defeat an out-of-model safety mechanism** (interlock / emergency shutdown), not operators turning the agent off. If this system is not cyber-physical / safety-relevant, record the block `N/A` with a reason — do not delete it.

- **Cyber-physical / safety-relevant system?** _Yes / No_ — if **No**, record _N/A_ and state why: _<e.g. software-only agent, no physical actuation or safety interlock in scope>_

> For applicable systems only, complete the rows below (mark `N/A` with a reason for any that genuinely do not apply); evidence is an emergency drill.

| Check | Method / signal | Expected | Observed | Pass? |
|-------|-----------------|----------|----------|-------|
| Agent cannot disable / override safety interlock | _<attempt + audit log>_ | _interlock holds; override denied_ | _<...>_ | _Y / N / N/A_ |
| Fail-safe state transition tested | _<drill / simulation>_ | _system reaches fail-safe on fault_ | _<...>_ | _Y / N / N/A_ |
| Emergency shutdown invoked and verified | _<drill record / sensor signal>_ | _shutdown completes, verified_ | _<...>_ | _Y / N / N/A_ |

## 3. Drill scenario and date

> Describe the scenario that prompted the drill and when it ran. A good scenario names the trigger condition a real on-call would face (e.g. "agent is exfiltrating data via a connector", "tool loop burning budget"). Tie it to a plausible failure so the drill tests realistic behavior, not just the happy path.

- **Drill date / time (start):** _<YYYY-MM-DD HH:MM TZ>_
- **Scenario:** _<one-paragraph description of the simulated incident and which kill-switch layer(s) it targets>_
- **Trigger / detection source assumed:** _<alert, dashboard, human report — what tells on-call to pull the switch>_
- **Layers exercised this drill:** _<e.g. Agent (whole) + Connector>_
- **Pre-drill state captured:** _<link to baseline metrics / logs showing the agent active before the drill>_

## 4. Steps executed and operators (IR-01)

> Record the actual sequence run, with timestamps and the named person who did each step. This is the evidence that disabling affected components (IR-01) is a real, followable procedure — not a doc no one has run. Capture who held which role (incident commander, operator, verifier) and any step that did not go as written.

| # | Time (HH:MM:SS) | Step / action | Executed by (name, role) | Result / observation |
|---|-----------------|---------------|--------------------------|----------------------|
| 1 | _<--:--:-->_ | _<detect / declare drill, start clock>_ | _<name, role>_ | _<...>_ |
| 2 | _<--:--:-->_ | _<invoke kill switch for layer X>_ | _<name, role>_ | _<...>_ |
| 3 | _<--:--:-->_ | _<confirm propagation>_ | _<name, role>_ | _<...>_ |
| 4 | _<--:--:-->_ | _<verify inactive — see §6>_ | _<name, role>_ | _<...>_ |
| _n_ | _<--:--:-->_ | _<...>_ | _<...>_ | _<...>_ |

- **In-flight work handling:** _<were already-running tasks/tool calls allowed to finish, drained, or force-killed? what was observed?>_

## 5. Measured time-to-disable

> Report the measured elapsed time from the decision/trigger to the agent (or targeted component) being verifiably inactive. State the start and stop events explicitly so the number is reproducible. Compare against your target/SLO if one exists; a miss is a gap for §6.

| Metric | Value | Notes |
|--------|-------|-------|
| Clock start event | _<e.g. "disable command issued">_ | _<...>_ |
| Clock stop event | _<e.g. "verified inactive per §6">_ | _<...>_ |
| **Time-to-disable (measured)** | _<m:ss>_ | _<per layer if layers differ>_ |
| Target / SLO (if defined) | _<m:ss or "none defined">_ | _<met? yes / no>_ |

## 6. Verification of inactivity (IR-01)

> Prove the agent/component is **actually** inactive afterward — not just that the switch was flipped. Use independent signals (no new actions, no tool/connector calls, no model invocations, dropped traffic, queue draining) rather than trusting the control's own status flag. This is the core of IR-01: affected components are genuinely disabled, with evidence.

| Check | Method / signal | Expected | Observed | Pass? |
|-------|-----------------|----------|----------|-------|
| No new agent actions | _<log query / dashboard>_ | _0 actions after T_stop_ | _<...>_ | _Y/N_ |
| No tool / action calls | _<tool-registry / audit log>_ | _0 calls_ | _<...>_ | _Y/N_ |
| No connector / outbound traffic | _<egress logs / proxy>_ | _0 outbound to integration_ | _<...>_ | _Y/N_ |
| No model invocations | _<inference logs / billing meter>_ | _0 invocations_ | _<...>_ | _Y/N_ |
| In-flight tasks terminated/drained | _<queue / orchestrator state>_ | _drained / killed_ | _<...>_ | _Y/N_ |
| UI / client correctly reflects disabled state (no false success/active) | _<client check / synthetic session>_ | _disabled state shown; no false success banner_ | _<...>_ | _Y/N_ |
| Durable state stores (memory, queues, scheduled jobs) have stopped mutating | _<write logs / store diff>_ | _0 new writes after T_stop_ | _<...>_ | _Y/N_ |

- **Evidence artifacts:** _<links to log snapshots, dashboard screenshots, query outputs proving inactivity>_

## 6a. Safe restore / re-enable (OPS-06)

> A kill switch that cannot be cleanly reversed is itself an operational gap. Verify the agent/component can be safely re-enabled after the kill. The rotate-credentials / quarantine-state / investigate aspects of OPS-06 are evidenced in `incident-runbook.md`; this record covers the kill-switch and safe-restore portion.

- **Safe restore / re-enable verified:** _Yes / No / N/A_ — _<method, who re-enabled, post-restore verification that the agent resumed in a known-good state>_

## 7. Gaps found and remediation

> List every gap the drill exposed: a missing kill-switch layer, a redeploy-only switch (OPS-05 violation), a slow time-to-disable, a verification signal that was missing or ambiguous, or a runbook step that was wrong. Assign an owner and a due date. If no gaps were found, state that explicitly. Open gaps that affect a release-blocking control should be reflected at Gate 5.

| Gap | Severity | Control affected | Owner | Remediation | Due date | Status |
|-----|----------|------------------|-------|-------------|----------|--------|
| _<description>_ | _Low / Med / High_ | _OPS-05 / IR-01 / OPS-06_ | _<name>_ | _<action>_ | _<YYYY-MM-DD>_ | _Open / Closed_ |

> EXAMPLE row — delete: `| Connector kill switch requires redeploy (~12 min) | High | OPS-05 | A. Rivera | Add runtime credential revocation path | 2026-07-04 | Open |`

- **No gaps found:** _<delete this line if gaps exist; otherwise state "No gaps found during this drill">_

## 8. Drill cadence (OPS-06)

> Place this drill in the incident-drill schedule that OPS-06 requires. Record when drills run, when the last one was, and when the next is due, so this record proves a recurring practice rather than a one-off. State the cadence policy (e.g. quarterly, every major release).

- **Cadence policy:** _<e.g. every major release + quarterly>_
- **Previous drill:** _<YYYY-MM-DD, link to prior record>_
- **This drill:** _<YYYY-MM-DD>_
- **Next drill due:** _<YYYY-MM-DD>_

## Sign-off

> The security owner always signs. Add operations / incident-response and product owners as fitting this artifact. "Approved" means the kill switch is demonstrated working (OPS-05/IR-01) and the drill is logged against the cadence (OPS-06); "Approved with conditions" requires the open gaps in §7 to be tracked to closure.

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Approve with conditions / Reject_ |
| Operations / SRE owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Approve with conditions / Reject_ |
| Incident-response lead | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Approve with conditions / Reject_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Approve with conditions / Reject_ |
