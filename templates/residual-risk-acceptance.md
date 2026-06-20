# Residual Risk Acceptance (Waiver)

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** GOV-04
> **SDLC gate:** 5 — Release Readiness  ·  **Family:** Governance
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

## 1. Scope and floor check

> Per GOV-04, every release defines a floor and the rules for waiving anything below it. This document records the time-bound `Accepted Risk` exceptions for THIS release. Fill the header above first, then confirm the gate.
>
> **HARD RULE (GOV-04 / `docs/checklist.md` §7):** Controls in the Non-Waivable Release Floor **CANNOT** be `Accepted Risk`. They must be `Pass` before launch — or, for the conditional floor controls only, `Not Applicable` with a written justification. If a floor control is `Fail` or `Partial`, the release is **blocked**; it cannot be waived here. Do not list floor controls in the waiver table below. Delete this guidance once you confirm the table contains no floor controls.

| Field | Value |
| --- | --- |
| Release / build identifier | _<release tag or build id>_ |
| Release floor reference | _<link or section in this release's release checklist where the floor is recorded>_ |
| Floor cleared (all floor controls Pass or justified N/A)? | _Yes / No_ |
| Number of waived controls in this document | _<n>_ |

> If "Floor cleared" is _No_, stop — the release does not pass Gate 5 and no waiver below is valid. Resolve the floor first.

## 2. Waived controls — register

> One row per waived control. List ONLY non-floor controls whose status is `Fail` or `Partial` that the release is shipping with anyway. Reference the control ID verbatim from `docs/checklist.md` (e.g. MEM-03, TOOL-05). Each row here must have a matching detail block in Section 3.

| # | Control ID | Title | Current status | Gap (what is not met) | Expiry (YYYY-MM-DD) | Remediation ticket |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | _<CTRL-ID>_ | _<control title>_ | _Fail / Partial_ | _<one-line gap>_ | _<YYYY-MM-DD>_ | _<TICKET-123>_ |
| 2 | _<CTRL-ID>_ | _<control title>_ | _Fail / Partial_ | _<one-line gap>_ | _<YYYY-MM-DD>_ | _<TICKET-456>_ |

> EXAMPLE row (delete before this becomes evidence):
> | 1 | MEM-03 | Verify long-term memory integrity | Partial | No periodic re-validation of stored memory; tampering (AGT-05) would not be detected until next manual review. | 2026-09-30 | SEC-1487 |

## 3. Waiver detail — one block per waived control

> Duplicate this block for each row in Section 2. The Section 2 register is the index; these blocks carry the substance GOV-04 requires: risk + impact, compensating controls, dual approval, expiry, and remediation ticket. Every field must be filled or the waiver is not valid.

### Waiver 1 — _<CTRL-ID>_

**Control:** _<CTRL-ID — control title>_  ·  **Current status:** _Fail / Partial_  ·  **Family / gate:** _<family>_ / _<gate>_

**Gap — what the control requires vs. what is in place**
> State precisely what the control demands and where the implementation falls short. Be specific enough that a reviewer can judge the exposure without reading the code.

_<description of the unmet requirement>_

**Risk description and impact**
> Describe the realistic failure this gap exposes, who/what it affects, and the blast radius. Where relevant, name the agentic risk id (e.g. AGT-05 memory tampering, AGT-02 tool misuse) and the affected assets, users, or downstream systems. State likelihood and impact severity.

- Risk: _<what can go wrong>_
- Affected assets / users / systems: _<scope and blast radius>_
- Related agentic risk: _<AGT-0x, or "n/a">_
- Likelihood: _Low / Medium / High_  ·  Impact severity: _Low / Medium / High_

**Compensating controls in place**
> List the concrete mitigations that reduce the residual risk while the gap remains open (e.g. tighter rate limits, additional monitoring/alerting, manual review step, scoped permissions, kill-switch). For each, note who operates it and how it is verified. "We are aware of it" is not a compensating control.

| Compensating control | How it reduces the risk | Owner | Verified by / evidence |
| --- | --- | --- | --- |
| _<mitigation>_ | _<effect on likelihood or impact>_ | _<name, role>_ | _<link to monitor, log, or test>_ |

**Residual risk after compensating controls:** _Low / Medium / High_

**Expiry and remediation**
> A waiver MUST be time-bound (GOV-04). Set an expiry date and the ticket that tracks the fix. The expiry is the date by which the control must reach `Pass` or the waiver be re-reviewed — not an open-ended grace period.

- Expiry date: _<YYYY-MM-DD>_
- Remediation ticket: _<TICKET-123 + link>_
- Planned remediation: _<one line on the fix>_

**Approvals**
> GOV-04 requires both the risk owner and the security owner to approve, with names and dates. Both approvals must be present and dated for the waiver to be valid. Approval is per-control; a person approving multiple waivers signs each block.

| Approver role | Name | Decision | Date |
| --- | --- | --- | --- |
| Risk owner | _<name, role>_ | _Approve / Reject_ | _<YYYY-MM-DD>_ |
| Security owner | _<name, role>_ | _Approve / Reject_ | _<YYYY-MM-DD>_ |

---

> Copy the block above for Waiver 2, Waiver 3, … one per waived control in Section 2. Delete this guidance line.

## 4. Review and renewal process

> GOV-04 waivers expire; this section records how they are re-checked so an `Accepted Risk` does not silently become permanent. Describe the cadence and the trigger that forces re-review, and keep the log current.

> On or before each expiry date, the risk owner and security owner re-assess the control. Outcome is one of: **Closed** (control now `Pass`, waiver retired), **Renewed** (re-approved with a new expiry and updated compensating controls — record as a new waiver block, not an edit), or **Escalated** (risk no longer acceptable; release/feature must be remediated or rolled back). An expired, un-renewed waiver is invalid and the gap reverts to a release blocker.

- Review owner (drives the renewal): _<name, role>_
- Review cadence / trigger: _<e.g. at expiry date, and on any material change to the system or its blast radius>_
- Where renewals are recorded: _<link to the next release's residual-risk-acceptance record>_

| Waived control | Expiry | Review date | Outcome (Closed / Renewed / Escalated) | New expiry (if renewed) | Reviewer |
| --- | --- | --- | --- | --- | --- |
| _<CTRL-ID>_ | _<YYYY-MM-DD>_ | _<YYYY-MM-DD>_ | _<outcome>_ | _<YYYY-MM-DD or —>_ | _<name>_ |

## Sign-off

> All listed owners must sign for this waiver record to be part of the release evidence package (GOV-04). The security owner and risk owner are mandatory; add product and compliance owners as the system and its blast radius warrant.

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Security owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Risk owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
| Compliance owner | _<name>_ | _<YYYY-MM-DD>_ | _Approve / Reject_ |
