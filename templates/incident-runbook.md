# Incident Response Runbook

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** IR-01, IR-02, IR-03, IR-04, OPS-06
> **SDLC gate:** 7 — Incident Response  ·  **Family:** Incident Response, Operations
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

> This runbook is the standing procedure a responder executes when an agent is suspected
> or confirmed compromised, misbehaving, or driving harmful downstream effects. It must be
> usable under pressure: concrete commands, named owners, and copy-pasteable steps — not
> aspirations. Keep it current; a runbook that references a decommissioned tool or an
> ex-employee is itself an incident. Re-attest it on the OPS-06 drill cadence below.

## 1. Scope and activation

> State what this runbook covers and the trigger that activates it. One runbook per agent /
> agent fleet keeps the disable and rotation steps specific enough to act on.

- **Agent(s) / fleet covered:** _<agent name(s), environments>_
- **In scope:** _<which tools, connectors, models, workflows, data stores>_
- **Out of scope / separate runbook:** _<e.g. platform-wide outage, cloud provider incident>_
- **Activates when:** _<the condition that turns a signal into a declared incident — e.g. confirmed prompt-injection-driven tool call, anomalous egress, policy bypass>_
- **Incident channel / bridge:** _<war-room link, conference bridge, ticket queue>_

## 2. Roles and contacts (OPS-06)

> OPS-06 requires named roles and reachable contacts, exercised by drills. Fill in real people
> and at least one backup each; an unreachable on-call is the most common cause of slow
> containment. Keep this table accurate between drills.

| Role | Primary | Backup | Contact (24/7) |
| --- | --- | --- | --- |
| Incident Commander | _<name>_ | _<name>_ | _<phone / pager / channel>_ |
| Security on-call | _<name>_ | _<name>_ | _<...>_ |
| Agent / platform engineer | _<name>_ | _<name>_ | _<...>_ |
| Comms / stakeholder liaison | _<name>_ | _<name>_ | _<...>_ |
| Legal / privacy (as needed) | _<name>_ | _<name>_ | _<...>_ |

> _EXAMPLE — delete this row: Incident Commander | Dana Ruiz, SRE Lead | Sam Okafor | PagerDuty "agent-sev1" / #ir-agents._

## 3. Detection and severity classification

> Capture how an incident reaches this runbook and how its severity is set. Detection sources
> tie back to monitoring and runtime controls; severity drives whether you disable immediately
> (Section 4) or contain in place. Be explicit so a responder does not have to improvise the
> sev under pressure.

**Detection sources:** _<e.g. runtime output filter alert, tool-call anomaly detector, egress / DLP alert, human report, downstream system alarm, abuse report, red-team finding>_

| Severity | Definition (fill for this agent) | Example trigger | Immediate action |
| --- | --- | --- | --- |
| SEV1 — critical | _<e.g. confirmed harmful action taken, data exfiltration, physical effect, multi-tenant impact>_ | _<...>_ | Disable now (Section 4) |
| SEV2 — high | _<e.g. compromise contained but active, single-tenant impact>_ | _<...>_ | Quarantine + assess |
| SEV3 — moderate | _<e.g. anomaly, suspected misuse, no confirmed harm>_ | _<...>_ | Investigate in place |

- **Severity declared:** _<SEV1 / SEV2 / SEV3>_  ·  **Declared by:** _<name>_  ·  **At:** _<YYYY-MM-DD HH:MM TZ>_

## 4. Containment — disable path (IR-01)

> IR-01: be able to take the agent (or a specific capability) offline fast. List the EXACT
> mechanism for each layer — the kill switch, the feature flag, the connector revoke — with the
> command, console path, or owner who can pull it. Order matters: stop new harmful actions first
> (revoke tool/connector access or pause the workflow), then take the agent down. This mitigates
> AGT-class misuse where the agent keeps acting autonomously. Record what you actually did and when.

| Layer | Disable mechanism (command / console / owner) | Done? | Time (TZ) | By |
| --- | --- | --- | --- | --- |
| Agent / orchestrator | _<e.g. set `agent.enabled=false` flag / scale to 0 / kill switch>_ | ☐ | _<...>_ | _<...>_ |
| Tool(s) | _<revoke tool grant / disable tool registration>_ | ☐ | _<...>_ | _<...>_ |
| Connector(s) / integrations | _<revoke OAuth token / disable connector>_ | ☐ | _<...>_ | _<...>_ |
| Model endpoint | _<disable model route / fall back to safe model / block endpoint>_ | ☐ | _<...>_ | _<...>_ |
| Workflow / triggers | _<pause scheduler, queue, webhook, cron>_ | ☐ | _<...>_ | _<...>_ |
| Environment | _<isolate network segment / cordon namespace>_ | ☐ | _<...>_ | _<...>_ |

> _EXAMPLE — delete this row: Connector(s) | Revoke the agent's Google Workspace OAuth token in admin console > Security > API controls | ☑ | 14:07 UTC | S. Okafor._

## 5. Credential rotation and state quarantine (IR-02)

> IR-02: assume any secret the agent could read is burned, and any state it could write is
> tainted. Rotate every credential in its blast radius and quarantine its stateful surfaces so a
> poisoned memory or RAG entry cannot re-trigger the behavior after recovery. Do not "clean in
> place" trusting the agent's own outputs. Capture exactly what was rotated/quarantined.

**Credentials to rotate (IR-02):**

| Secret / credential | Where used | Rotated? | Time | By |
| --- | --- | --- | --- | --- |
| _<API keys / tokens>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |
| _<service account / OAuth>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |
| _<signing / encryption keys>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |
| _<DB / connector passwords>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |

**State to quarantine (IR-02):**

| State surface | Quarantine action | Done? | Notes |
| --- | --- | --- | --- |
| Agent memory / scratchpad | _<freeze, snapshot, then purge tainted entries>_ | ☐ | _<...>_ |
| RAG / vector store | _<isolate index, identify poisoned vectors>_ | ☐ | _<...>_ |
| Documents / knowledge base | _<flag suspect docs read-only / pull from index>_ | ☐ | _<...>_ |
| Task / job queue | _<drain or hold pending tasks, no auto-replay>_ | ☐ | _<...>_ |

## 6. Evidence preservation and blast-radius analysis (IR-03)

> IR-03: before anything is overwritten, preserve the forensic record AND map how far the
> incident reached. Snapshot first (logs roll, memory gets garbage-collected), then analyze.
> The blast radius determines who you notify and what you roll back — under-scoping it is how
> incidents recur. Record the storage location and hash of preserved evidence so it is defensible.

**Evidence preserved (snapshot before remediation continues):**

| Artifact | Preserved? | Location / reference | Hash / integrity ref |
| --- | --- | --- | --- |
| Prompts (system + user + injected) | ☐ | _<...>_ | _<...>_ |
| Context / retrieved content | ☐ | _<...>_ | _<...>_ |
| Tool calls + arguments + results | ☐ | _<...>_ | _<...>_ |
| Policy / guardrail decisions | ☐ | _<...>_ | _<...>_ |
| Approvals / human-in-the-loop records | ☐ | _<...>_ | _<...>_ |
| Agent outputs | ☐ | _<...>_ | _<...>_ |
| System / audit logs | ☐ | _<...>_ | _<...>_ |
| Affected data | ☐ | _<...>_ | _<...>_ |

**Blast radius (what / who was reached):**

| Dimension | Affected? | Detail / scope |
| --- | --- | --- |
| Users | _<yes/no>_ | _<count, identities, segments>_ |
| Tenants | _<yes/no>_ | _<which tenants>_ |
| Downstream systems | _<yes/no>_ | _<systems, actions taken on them>_ |
| Data | _<yes/no>_ | _<what was read / written / exfiltrated>_ |
| Physical / real-world effects | _<yes/no>_ | _<actuation, payments, comms sent, orders placed>_ |

## 7. Rollback and notification

> Reverse the agent's harmful effects where possible and inform the people who must know.
> Roll back from preserved-clean state, not from the agent's own (possibly tainted) outputs.
> Notification scope follows the Section 6 blast radius and any legal/regulatory obligations;
> log who was told and when so the obligation is demonstrably met.

**Rollback steps:**
1. _<e.g. revert downstream changes the agent made — describe the reverse operation per system>_
2. _<restore data / config from known-good backup or pre-incident snapshot>_
3. _<invalidate/recall agent-generated artifacts (messages, tickets, transactions) where reversible>_

**Notifications:**

| Who | Why / obligation | Notified? | Time | By |
| --- | --- | --- | --- | --- |
| _<affected users / tenants>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |
| _<internal leadership / IC>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |
| _<legal / privacy / regulator>_ | _<breach-notification duty if applicable>_ | ☐ | _<...>_ | _<...>_ |
| _<downstream system owners>_ | _<...>_ | ☐ | _<...>_ | _<...>_ |

## 8. Recovery and return-to-service

> Define the conditions under which the agent is allowed back. Re-enabling before root cause is
> understood (Section 9) just replays the incident. Require the disable steps from Section 4 to be
> deliberately reversed, not silently lapsed.

- **Return-to-service criteria:** _<root cause identified, fix deployed, tests passing, stakeholder sign-off>_
- **Re-enable steps:** _<reverse of Section 4, in safe order — re-grant tools last, monitor closely>_
- **Heightened monitoring window:** _<duration, what is watched, who watches>_
- **Restored by:** _<name>_  ·  **At:** _<YYYY-MM-DD HH:MM TZ>_

## 9. Lessons fed back (IR-04)

> IR-04 closes the loop: an incident that does not change the system is wasted. For each artifact
> below, record a concrete follow-up with an owner and due date, then track it to done. This is
> where one incident's findings become next release's controls and tests.

| Feedback target | Change to make | Owner | Due | Ticket |
| --- | --- | --- | --- | --- |
| Threat model | _<new threat / attack path to add>_ | _<...>_ | _<YYYY-MM-DD>_ | _<...>_ |
| Controls | _<control to add / tighten — reference checklist IDs>_ | _<...>_ | _<...>_ | _<...>_ |
| Tests | _<regression / red-team test to add>_ | _<...>_ | _<...>_ | _<...>_ |
| Monitoring / detection | _<new signal, alert, or threshold>_ | _<...>_ | _<...>_ | _<...>_ |
| Runbooks | _<this runbook or others to update>_ | _<...>_ | _<...>_ | _<...>_ |

- **Root cause:** _<concise statement of what actually went wrong>_  ·  **Contributing factors:** _<...>_

## 10. Drill record (OPS-06)

> OPS-06 requires this runbook to be exercised, not just written. Log each drill or real
> activation so the evidence shows the procedure works and stays current. Set and honor a cadence
> (e.g. quarterly tabletop, semi-annual live disable test).

- **Drill cadence:** _<e.g. quarterly tabletop + annual live containment test>_

| Date | Type (tabletop / live / real incident) | Scenario | Time-to-disable | Gaps found | Follow-ups |
| --- | --- | --- | --- | --- | --- |
| _<YYYY-MM-DD>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |

> _EXAMPLE — delete this row: 2026-03-12 | tabletop | injected tool call exfiltrating CRM data | n/a (paper) | connector revoke owner was ambiguous | assigned to platform team, ticket SEC-4821._

## Sign-off

> Security owner signs off always. Add risk, product, and compliance owners where the incident's
> blast radius or notification obligations make them accountable. Sign-off attests this runbook
> (or this activation's record) is accurate and the IR-04 follow-ups are tracked.

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
| Incident Commander | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
| Product / service owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
| Risk / compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected_ |
