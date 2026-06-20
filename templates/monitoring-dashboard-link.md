# Monitoring Dashboard Reference

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** OPS-03, OPS-04, RES-03, RAG-06
> **SDLC gate:** 6 — Runtime Operations  ·  **Family:** Operations, Resource Control, RAG
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

> **Purpose of this artifact.** Gate 6 (Runtime Operations) requires the system to be observable in production. This file is the durable pointer to where that observation lives: the dashboards, the alert inventory, the thresholds, who is paged, and how often the alerts are reviewed. It backs OPS-03 (goal drift / rogue behaviour), OPS-04 (exfiltration / unsafe tool sequences), RES-03 (resource abuse), and RAG-06 (RAG source/embedding poisoning & drift). Where a control does not apply to this system (e.g. no RAG component, so RAG-06 is out of scope), mark it `N/A` with a one-line reason rather than leaving it blank.

## 1. Dashboard Locations

> List the durable links to the live dashboards. These must outlive the person who built them — prefer stable saved-view URLs over ad-hoc query links. If a dashboard requires special access, name the access group so an on-call engineer can request it under pressure. Note the platform and the underlying telemetry source so a reviewer can trace an alert back to raw signals.

| Dashboard | Platform | Durable URL | Telemetry source | Access group | Owner |
|---|---|---|---|---|---|
| _<e.g. Agent Behaviour Overview>_ | _<e.g. Grafana / Datadog / Splunk>_ | _<https://...>_ | _<logs / metrics store>_ | _<group>_ | _<name, role>_ |
| _<e.g. Resource & Cost>_ | _<platform>_ | _<https://...>_ | _<source>_ | _<group>_ | _<name, role>_ |
| _<e.g. RAG Pipeline Health>_ | _<platform>_ | _<https://...>_ | _<source>_ | _<group>_ | _<name, role>_ |

> _EXAMPLE row — delete:_ Agent Behaviour Overview · Grafana · https://grafana.example.com/d/agent-behaviour · loki-agentic-logs · sec-oncall · J. Doe, SRE. _(end example)_

## 2. Alert Inventory by Family

> This is the core of the evidence. Enumerate every production alert, grouped by the control it satisfies. Each alert needs a concrete signal, a threshold, a severity, the dashboard it surfaces on, and a link to its definition (the query/rule as code, so it can be reviewed and version-controlled). Coverage here is what proves the control is actually monitored, not merely intended. Every alert must map to at least one control below; if a family has no alerts, the control is not satisfied — fix the gap or record an explicit `N/A`.

### 2.1 Goal drift & rogue behaviour — OPS-03 (AGT-01, AGT-13)

> OPS-03 pass-criteria: unexpected goals, role deviations, disabled-tool attempts, policy overrides, and confidence collapse must alert. Make sure every one of those five signal types appears as a row (or is justified absent). These detect an agent quietly going off-mission (AGT-01) or losing calibration (AGT-13).

| Alert name | Signal | Threshold | Severity | Dashboard | Rule / definition link |
|---|---|---|---|---|---|
| _<name>_ | _<unexpected-goal detection>_ | _<e.g. any occurrence>_ | _<Critical / High / Medium / Low>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<role / persona deviation>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<disabled-tool invocation attempt>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<policy / guardrail override attempt>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<confidence collapse / refusal spike>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |

### 2.2 Exfiltration & unsafe tool sequences — OPS-04 (AGT-02, AGT-04)

> OPS-04 pass-criteria: a sensitive read followed by an external write, and unusual high-risk tool chains, must alert. These catch data exfiltration (AGT-04) and dangerous multi-step tool orchestration (AGT-02). Define what "sensitive source" and "external sink" mean for this system so the threshold is unambiguous.

| Alert name | Signal | Threshold | Severity | Dashboard | Rule / definition link |
|---|---|---|---|---|---|
| _<name>_ | _<sensitive read → external write sequence>_ | _<e.g. any occurrence>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<high-risk tool chain / anomalous tool ordering>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |

### 2.3 Resource / denial-of-wallet abuse — RES-03 (AGT-11)

> RES-03 pass-criteria: alerts must cover token spikes, tool-call spikes, retry storms, queue growth, memory growth, and quota depletion. This is the denial-of-wallet / resource-exhaustion surface (AGT-11). Set thresholds against an observed baseline, not a guess — note the baseline window you used.

| Alert name | Signal | Threshold | Severity | Dashboard | Rule / definition link |
|---|---|---|---|---|---|
| _<name>_ | _<token / cost spike>_ | _<e.g. > 3× rolling-7d baseline over 15 min>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<tool-call spike>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<retry storm>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<queue growth / backlog>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<memory growth>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<quota depletion>_ | _<e.g. > 80% of daily quota>_ | _<severity>_ | _<dashboard>_ | _<link>_ |

### 2.4 RAG source / embedding poisoning & drift — RAG-06 (AGT-05)

> RAG-06 pass-criteria: anomalous source-update frequency and embedding/semantic drift must be detected and reviewed, and embeddings must be refreshed to limit drift. These detect knowledge-base poisoning and silent retrieval degradation (AGT-05). If this system has no RAG / retrieval layer, mark this whole subsection `N/A` with a reason.

| Alert name | Signal | Threshold | Severity | Dashboard | Rule / definition link |
|---|---|---|---|---|---|
| _<name>_ | _<anomalous source-update frequency>_ | _<threshold>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<embedding / semantic drift>_ | _<e.g. drift score > _<value>_>_ | _<severity>_ | _<dashboard>_ | _<link>_ |
| _<name>_ | _<embedding refresh staleness>_ | _<e.g. last refresh > _<window>_>_ | _<severity>_ | _<dashboard>_ | _<link>_ |

## 3. Severity, On-Call Ownership & Escalation

> Map each severity level to a concrete paging / response path so an alert is never just a blinking light. Name the team that owns each family at runtime and the escalation step when the first responder cannot resolve it. Tie this to the incident runbook (`incident-runbook.md`) rather than restating it.

| Severity | Response target (ack / resolve) | First responder (on-call) | Escalates to | Notification channel |
|---|---|---|---|---|
| _Critical_ | _<e.g. ack 15 min / page immediately>_ | _<rota / team>_ | _<role>_ | _<pager / channel>_ |
| _High_ | _<target>_ | _<rota>_ | _<role>_ | _<channel>_ |
| _Medium_ | _<target>_ | _<rota>_ | _<role>_ | _<channel>_ |
| _Low_ | _<target>_ | _<rota>_ | _<role>_ | _<channel>_ |

**Family ownership at runtime:**

| Control family | Runtime owner (team) | Escalation owner |
|---|---|---|
| OPS-03 / OPS-04 (Operations) | _<team>_ | _<role>_ |
| RES-03 (Resource Control) | _<team>_ | _<role>_ |
| RAG-06 (RAG) | _<team>_ | _<role>_ |

## 4. Review Cadence

> Per the operating cadence (`docs/checklist.md` §11), monitoring is not fire-and-forget — alerts are reviewed on a fixed rhythm. Weekly covers exfiltration / tool-misuse / denied-policy signals (OPS-03, OPS-04, RES-03). Monthly covers RAG changes and embedding/source drift (RAG-06), alongside permission and accepted-risk review. Record who runs each review and where the minutes/output live so the review is auditable.

| Cadence | Scope | Controls reviewed | Owner | Output / record location |
|---|---|---|---|---|
| _Weekly_ | _<tool misuse, exfiltration, denied policy, goal-drift & resource alerts>_ | OPS-03, OPS-04, RES-03 | _<name, role>_ | _<link>_ |
| _Monthly_ | _<RAG source/embedding changes, drift, refresh status>_ | RAG-06 | _<name, role>_ | _<link>_ |
| _Per change_ | _<re-validate affected alerts after a release>_ | _<as affected>_ | _<name, role>_ | _<link>_ |

## 5. Coverage Confirmation

> A one-line attestation per control that its alerts exist, fire to a real owner, and were reviewed at the stated cadence. This is the summary a release reviewer reads first. Use `N/A` only with a reason recorded here.

| Control | Monitored? | Evidence (alert rows / dashboard) | Notes |
|---|---|---|---|
| OPS-03 — goal drift & rogue behaviour | _Yes / No / N/A_ | _<§2.1>_ | _<notes>_ |
| OPS-04 — exfiltration & unsafe tool sequences | _Yes / No / N/A_ | _<§2.2>_ | _<notes>_ |
| RES-03 — resource abuse | _Yes / No / N/A_ | _<§2.3>_ | _<notes>_ |
| RAG-06 — RAG source/embedding poisoning & drift | _Yes / No / N/A_ | _<§2.4>_ | _<notes>_ |

## Sign-off

> The security owner always signs. Add the operations/SRE owner (owns the dashboards and on-call) and, where a regulated or high-impact decision rides on this monitoring, a risk or compliance owner. Each signer confirms the alerts, thresholds, ownership, and cadence above are accurate for this release.

| Role | Name | Date | Decision |
|---|---|---|---|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
| Operations / SRE owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
| Risk owner (if high-impact) | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
