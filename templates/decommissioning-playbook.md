# Decommissioning Playbook

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** DEC-01, DEC-02, DEC-03, DEC-04, DEC-05
> **SDLC gate:** 9 — Decommissioning  ·  **Family:** Decommissioning
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Retirement summary

> State, in one paragraph, what is being retired and why. The goal of this gate is to retire an agent without leaving live attack surface. An agent that is "turned off" but still holds valid credentials, runs queued tasks, or owns orphaned schedules is not retired — it is an unmonitored, unowned attack surface (relates to AGT-13 / rogue-agent risk — an agent operating outside its purpose, owner, policy, lifecycle, or monitoring).

| Field | Value |
| --- | --- |
| Agent / system being retired | _<name + version>_ |
| Reason for retirement | _<sunset / replaced / merged / compromised / cost / policy>_ |
| Replacement (if any) | _<name + version, or "none — capability removed">_ |
| Planned cutover date | _<YYYY-MM-DD>_ |
| Planned full-disposal date | _<YYYY-MM-DD>_ |
| Decommission owner | _<name, role>_ |
| Approving authority | _<name, role>_ |

## 2. Deactivation inventory (DEC-01)

> **DEC-01 — Register a deactivation playbook at deployment.** This inventory should have been captured at deployment, not reconstructed now. Confirm it against live state before acting: anything missing here is a candidate orphan in section 6. List every asset the agent touches so revocation (section 3) and disposition (section 4) are provably complete. An incomplete inventory is the root cause of zombie execution.

> Mark each row's disposition target so sections 3–4 can close it. Add rows as needed. Delete the EXAMPLE row.

| Asset class | Identifier | Owner / location | Disposition target | Section |
| --- | --- | --- | --- | --- |
| _EXAMPLE — delete this row_ | _prod-agent-svc-account_ | _IAM / project acme-prod_ | _revoke + delete_ | _§3_ |
| Compute / runtime | _<service, function, container, host>_ | _<location>_ | _<stop / delete>_ | §6 |
| Credential / identity | _<see §3>_ | _<store>_ | _<revoke>_ | §3 |
| Data store | _<db, bucket, table>_ | _<location>_ | _<delete / archive>_ | §4 |
| Agent state | _<state store / session store>_ | _<location>_ | _<delete>_ | §4 |
| Memory | _<long-term / episodic memory store>_ | _<location>_ | _<delete>_ | §4 |
| Vector store / RAG source | _<index, collection>_ | _<location>_ | _<delete / detach>_ | §4 |
| Tool / connector | _<integration, MCP server, API>_ | _<location>_ | _<disconnect>_ | §3/§6 |
| Schedule / trigger | _<cron, webhook, queue>_ | _<location>_ | _<remove>_ | §6 |
| Downstream consumer | _<service / team that calls this agent>_ | _<owner>_ | _<notify / cutover>_ | §5 |
| Logs / telemetry | _<log stream, dashboard>_ | _<location>_ | _<retain per policy>_ | §4 |

## 3. Credential revocation (DEC-02)

> **DEC-02 — Revoke credentials on retirement.** Revocation must cover the full credential graph, not just the obvious API key. A single surviving refresh token, cached session, or non-human identity is enough to keep a "retired" agent alive. For every credential: revoke, then independently verify it is inactive (a failed authentication attempt, an empty grant list, or provider confirmation) — do not treat "delete requested" as "revoked".

> List every credential type. Delete the EXAMPLE row.

| Credential type | Identifier (no secrets) | Revoked? | Verified inactive? | Method / evidence | Date |
| --- | --- | --- | --- | --- | --- |
| _EXAMPLE — delete this row_ | _agent-primary-api-key (last4 ••3f)_ | _Yes_ | _Yes_ | _401 on test call; key absent from console_ | _<YYYY-MM-DD>_ |
| Primary key / token | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Derived / scoped credentials | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Refresh tokens | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Cached / session tokens | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Non-human / service identity | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Connector / tool grants (OAuth, MCP) | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Signing / encryption keys | _<id>_ | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |

> **Confirm:** _<name>_ attests that no credential listed in the §2 inventory remains usable as of _<YYYY-MM-DD HH:MM TZ>_.

## 4. State and memory disposition (DEC-03)

> **DEC-03 — Dispose of state and memory safely.** Every data surface the agent owned must be deleted or archived per the applicable data-retention / privacy policy — never silently abandoned. Be explicit about which policy governs each store, the action taken, and where archived data now lives (and who can reach it). Untracked residual state is both a privacy liability and a re-animation risk.

> List every data surface. Delete the EXAMPLE row.

| Data surface | Action (delete / archive / retain) | Governing policy | Destination (if archived) | Verified? | Date |
| --- | --- | --- | --- | --- | --- |
| _EXAMPLE — delete this row_ | _archive_ | _DataRet-2y_ | _cold-store/acme-archive (access: sec-team)_ | _Yes_ | _<YYYY-MM-DD>_ |
| Agent state store | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |
| Long-term / episodic memory | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |
| Vector store / embeddings | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |
| RAG source corpora | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |
| Operational data stores | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |
| Logs / audit trail | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |
| Backups / snapshots | _<action>_ | _<policy id>_ | _<destination>_ | _Yes / No_ | _<YYYY-MM-DD>_ |

> **Retention note:** logs and audit trail are typically *retained*, not deleted, so the tombstone (§7) and any future investigation remain provable. State this explicitly: _<what is retained, where, for how long, under which policy>_.

## 5. Downstream cutover plan

> Identify everyone and everything that depends on this agent, and how each is migrated off it before deactivation. Use the `affects` dependency graph (Appendix E) to find non-obvious consumers. A clean cutover prevents both broken downstreams and the temptation to leave the agent "running just in case" — which defeats the gate.

| Downstream consumer | Owner | Cutover action | Cutover date | Confirmed migrated? |
| --- | --- | --- | --- | --- |
| _EXAMPLE — delete this row_ | _Billing team_ | _repoint to replacement v3_ | _<YYYY-MM-DD>_ | _Yes_ |
| _<service / team>_ | _<owner>_ | _<repoint / remove / accept loss>_ | _<YYYY-MM-DD>_ | _Yes / No_ |
| _<service / team>_ | _<owner>_ | _<repoint / remove / accept loss>_ | _<YYYY-MM-DD>_ | _Yes / No_ |

> **Rollback window:** _<describe the short window during which cutover can be reversed, and the hard date after which §4 disposal makes rollback impossible>_.

## 6. Orphaned and zombie execution prevention (DEC-05)

> **DEC-05 — Prevent orphaned and zombie execution.** After deactivation, confirm the retired agent **cannot run** — not stale in-flight tasks, not queued work, not scheduled invocations, not webhook/event triggers. Every trigger from the §2 inventory must be removed or disabled and then *tested* to confirm it no longer fires. This is the control that closes the AGT-13 rogue / zombie-agent risk (an agent still executing outside its lifecycle).

| Execution path | Removed / disabled? | Verified non-firing? | Evidence | Date |
| --- | --- | --- | --- | --- |
| _EXAMPLE — delete this row_ | _Yes_ | _Yes_ | _cron deleted; scheduler shows no entry_ | _<YYYY-MM-DD>_ |
| In-flight / running tasks | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Queued / pending tasks | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Scheduled jobs / cron | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Webhooks / event triggers | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Message-queue subscriptions | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Retry / dead-letter handlers | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |
| Auto-scaling / restart policy | _Yes / No_ | _Yes / No_ | _<evidence>_ | _<YYYY-MM-DD>_ |

> **Confirm:** _<name>_ attests that the agent has no live execution path and cannot self-restart as of _<YYYY-MM-DD HH:MM TZ>_.

## 7. Tombstone record (DEC-04)

> **DEC-04 — Write a tombstone record.** This is the durable, immutable record that the agent existed and was retired deliberately. It must be written to the system inventory / registry (not just this file) so that future audits, incident responders, and dependency lookups find a clear answer instead of a mystery service. Keep it retrievable after this evidence is archived.

| Field | Value |
| --- | --- |
| What was retired | _<agent name + version + capability>_ |
| When retired (deactivated) | _<YYYY-MM-DD HH:MM TZ>_ |
| When fully disposed | _<YYYY-MM-DD>_ |
| Why retired | _<reason>_ |
| Retired by | _<name, role>_ |
| Approved by | _<name, role>_ |
| Replaced by | _<name + version, or "none">_ |
| Inventory / registry record ID | _<tombstone record id / link>_ |
| Retained-evidence location | _<link to this completed package + retained logs>_ |

## 8. Final evidence snapshot

> Capture the closing proof that this playbook was executed in full. Each item should point to verifiable evidence (a link, an attestation, a screenshot reference) rather than a bare "done".

- [ ] DEC-01 — deactivation inventory complete and reconciled against live state (§2) — _<evidence>_
- [ ] DEC-02 — all credentials revoked and verified inactive (§3) — _<evidence>_
- [ ] DEC-03 — all state/memory/vector/RAG/logs disposed per policy (§4) — _<evidence>_
- [ ] Downstream consumers cut over or accepted as lost (§5) — _<evidence>_
- [ ] DEC-05 — no live, queued, or scheduled execution path remains (§6) — _<evidence>_
- [ ] DEC-04 — tombstone written to inventory/registry (§7) — _<evidence>_
- [ ] This completed package archived to the per-release evidence store — _<location>_

> **Snapshot taken:** _<name>_ on _<YYYY-MM-DD>_ ; immutable reference: _<hash / version / link>_.

## Sign-off

> All listed owners must sign before this agent is considered fully decommissioned. The security owner is mandatory. Decision = Approve / Reject / Approve with conditions (note conditions in §1).

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Security owner (required) | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Conditions_ |
| Decommission / engineering owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Conditions_ |
| Product / service owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Conditions_ |
| Risk / compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject / Conditions_ |
