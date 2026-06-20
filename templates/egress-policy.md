# Egress Policy

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** ARCH-05, DATA-02, DATA-03, OUT-01, OPS-04
> **SDLC gate:** 2 — Secure Design  ·  **Family:** Architecture, Data, Output, Operations
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Purpose and scope

> State what this policy governs and for which system/agent. The goal of this artifact is to define allowed egress destinations and which data classes may leave through each channel, deny by default, and prove ARCH-05 (explicit egress paths), DATA-02 (restricted output channels), OUT-01 (inventoried sinks), and OPS-04 (exfiltration monitoring) are satisfied. Name the agent(s), the environments in scope (e.g. prod, staging), and call out anything explicitly out of scope. Delete this guidance when filled.

- **System / agent in scope:** _<name and brief description of the agent and its autonomy level>_
- **Environments covered:** _<e.g. production, staging>_
- **Out of scope:** _<components/channels deliberately excluded, with reason>_
- **Default posture:** **Deny by default.** Any destination or data class not explicitly allow-listed in §3 is denied.

> EXAMPLE — delete this list:
> - System / agent in scope: "Acme Support Copilot" — autonomous Tier-2 ticket triage agent
> - Environments covered: production, staging
> - Out of scope: internal-only debug console (no external reachability)

## 2. Egress destination / output sink inventory (ARCH-05, OUT-01)

> Inventory every place data can leave the agent's trust boundary. This is the OUT-01 sink inventory and the ARCH-05 egress map combined. Cover all sink categories the checklist names: users, tools, logs, external systems, and third-party model APIs — and concrete sink types such as HTML, Markdown, SQL, shell, code, config, workflow, ticket, email, and approval sinks. Each row must trace to a real, named destination. Mark whether the destination is internal or external to your trust boundary; external + sensitive data is the highest exfiltration risk (AGT-04, AGT-06). Delete this guidance when filled.

| Sink ID | Sink type | Destination (concrete) | Category (user / tool / log / external system / model API) | Internal or external | Reachable data classes | Notes |
|---------|-----------|------------------------|------------------------------------------------------------|----------------------|------------------------|-------|
| _<S-01>_ | _<e.g. email>_ | _<concrete endpoint/system>_ | _<category>_ | _<Internal / External>_ | _<data classes that can reach it>_ | _<notes>_ |
| _<S-02>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |
| _<S-03>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |

> EXAMPLE — delete this row: `S-99 | model API | Third-party LLM provider (chat completions) | model API | External | Internal-Confidential (redacted) | Prompt + retrieved context sent for inference`

## 3. Allow-list: destination × data classification × conditions (DATA-02)

> This is the core of the policy and the primary evidence for DATA-02. List every PERMITTED combination of destination (from §2) and data classification, with the conditions under which it is allowed. Everything not listed here is denied by default — do not enumerate denials. Reference your organization's data classification scheme (e.g. Public, Internal, Confidential, Restricted/PII). Conditions are concrete gates: redaction applied, user authenticated and authorized, human approval, encryption in transit, contractual/DPA coverage for third-party APIs. If a destination may receive a class only after transformation, say so in Conditions. Delete this guidance when filled.

| Sink ID (from §2) | Permitted data classification | Conditions / required controls | Approved by | Approval date |
|-------------------|-------------------------------|--------------------------------|-------------|---------------|
| _<S-01>_ | _<e.g. Public, Internal>_ | _<e.g. TLS; user authorized; DLP scan passes>_ | _<name, role>_ | _<YYYY-MM-DD>_ |
| _<S-02>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |
| _<S-03>_ | _<...>_ | _<...>_ | _<...>_ | _<...>_ |

**Default rule:** Any (destination, data classification) pair not present in this table is **DENIED**. New rows require the approval process in §5.

> EXAMPLE — delete this row: `S-99 | Internal-Confidential (redacted only) | PII/secret redaction applied (§4); provider under signed DPA; TLS 1.2+ | Jane Doe, Security Lead | 2026-06-20`

## 4. Redaction / DLP before egress

> Describe what is stripped or masked before data crosses each external sink, and the mechanism that enforces it. This is the control that lets a sensitive class appear in §3 under a "redacted only" condition. Specify: what is detected (PII, secrets/credentials, internal identifiers, customer data), the tooling/pattern set, where in the pipeline it runs (must be on the egress path, not advisory), and the fail-mode (fail-closed = block on detector error/uncertainty is strongly preferred). Tie to AGT-04. Delete this guidance when filled.

- **Data classes redacted / masked:** _<e.g. PII, secrets, internal hostnames>_
- **DLP / redaction mechanism:** _<tool or library, version, ruleset>_
- **Enforcement point(s):** _<where on the egress path it runs>_
- **Fail mode:** _Fail-closed (block) / Fail-open (allow)_ — _<justification if not fail-closed>_
- **Coverage gaps / known limitations:** _<e.g. free-text fields, attachments>_

| Sink ID (from §2) | Redaction/DLP applied? | Rule set / detectors | Fail mode |
|-------------------|------------------------|----------------------|-----------|
| _<S-01>_ | _Yes / No / N/A_ | _<...>_ | _Closed / Open_ |
| _<S-02>_ | _<...>_ | _<...>_ | _<...>_ |

## 5. Approval process to add a new egress destination

> Document how a new destination or a new (destination × data class) row gets added to §2/§3. An egress policy is only trustworthy if changes are controlled. Capture who can request, who must approve (security owner is mandatory; add data/privacy owner when a sensitive class is involved), what evidence the requester provides (classification, business need, redaction plan), and where the request/decision is recorded. This change control is what keeps ARCH-05 and DATA-02 valid over time. Delete this guidance when filled.

1. **Request:** _<who submits, what they provide — destination, category, data classes, business justification>_
2. **Review:** _<who reviews; required checks — classification, redaction/DLP plan, monitoring coverage in §6>_
3. **Approval:** _<required approvers; security owner mandatory; privacy/data owner if sensitive data>_
4. **Record:** _<where the approved change is logged; this file is updated and re-versioned>_
5. **Revocation:** _<how a destination is removed and traffic to it stopped>_

| Change ref | Destination requested | Data classes | Decision | Approver(s) | Date |
|------------|-----------------------|--------------|----------|-------------|------|
| _<CR-001>_ | _<...>_ | _<...>_ | _Approved / Rejected_ | _<...>_ | _<YYYY-MM-DD>_ |

## 6. Monitoring and alerting (OPS-04)

> Show how the policy is enforced and watched at runtime, not just at design time. This is the evidence for OPS-04. Two patterns must be covered explicitly: (a) sensitive-read-to-external-write — a sensitive source read followed by a write to an external sink — and (b) anomalous / high-volume egress and unusual high-risk tool chains. For each, name the detection source (logs/telemetry), the alert, the destination of the alert, and the owner/runbook. Tie to AGT-02 (tool/sequence misuse) and AGT-04 (data exfiltration). Delete this guidance when filled.

| Monitored condition | Detection source / signal | Alert / threshold | Routed to | Runbook / response owner |
|---------------------|---------------------------|-------------------|-----------|--------------------------|
| Sensitive read → external write | _<log/telemetry source>_ | _<alert rule>_ | _<channel/team>_ | _<runbook link, owner>_ |
| Anomalous / high-volume egress | _<...>_ | _<...>_ | _<...>_ | _<...>_ |
| Unsafe / high-risk tool sequence | _<...>_ | _<...>_ | _<...>_ | _<...>_ |
| Egress to non-allow-listed destination | _<...>_ | _<...>_ | _<...>_ | _<...>_ |

- **Coverage statement:** _<confirm every external sink in §2 is observable by at least one rule above; note any blind spots>_
- **Validation:** _<how/when these alerts were last tested, e.g. egress-policy tests or red-team drill, date>_

## 7. Residual risk and accepted exceptions

> Record any allow-list entry or coverage gap accepted as residual risk, with owner and expiry. Note: ARCH-05, DATA-02, OUT-01, and OPS-04 are all Core controls and may be hard-floor in your profile — accepting risk on a hard-floor control is not permitted, so an exception here must be a genuine non-floor residual, not a waiver of the control itself. If there are none, write "None." Delete this guidance when filled.

| Risk / exception | Affected sink or rule | Justification | Owner | Review / expiry date |
|------------------|-----------------------|---------------|-------|----------------------|
| _<...>_ | _<...>_ | _<...>_ | _<...>_ | _<YYYY-MM-DD>_ |

## Sign-off

> All listed roles must sign before this artifact is Approved. The security owner is mandatory. Include the data/privacy owner because egress decisions govern data leaving the trust boundary; include the product owner for business acceptance of allowed channels. Delete this guidance when filled.

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
| Data / privacy owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
| Product / system owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Changes requested_ |
