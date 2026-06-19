# Build & Review Evidence - Agentic SDLC Hardening Checklist

*Date: 2026-06-19*

This record backs the unified checklist's claim that it was "reconciled with an independent review." It documents the source material, the blind comparison method, the merge process, and post-merge corrections.

## 1. Sources

Two source checklists were merged:

- **Governance/SDLC skeleton** — `agentic-sdlc-hardening-checklist.md`. Provided the SDLC-process structure, gates, risk taxonomy, and governance/operations framing.
- **Source-grounded controls catalog** — `agentic-sdlc-hardening-checklist-claude.md`. 146 controls grounded in the "AI security" NotebookLM notebook. Grounding sources:
  - CSA/OWASP Agentic AI Red Teaming Guide 2025
  - OWASP Top 10 for Agentic Applications 2026
  - Prompt Injection Taxonomy
  - Securing AI Agents
  - Securing AI Systems: A Playbook for Security Leaders

## 2. Blind Comparison

**Method.** Seven independent reviewer agents each evaluated *both* documents with authorship stripped (anonymized as A/B). Each agent assessed one quality dimension. This was followed by an adversarial fairness check.

**Verdict.** The governance skeleton won 6 of 7 dimensions:
- SDLC-process
- Auditability
- Risk-taxonomy
- Actionability
- Grounding
- Governance/ops

The controls catalog won 1 dimension:
- Control-coverage/depth

**Decision.** Use the skeleton as the base and import the catalog's concrete controls.

## 3. Merge Method

The merge was executed by:

- **8 parallel family-merge agents** — combined skeleton structure with catalog techniques; dense items were split into atomic rows.
- **1 frame author.**
- **1 adversarial consistency/completeness verifier.**

**Result.** 213 atomic controls across 19 families, plus a 15-row AGT risk crosswalk, with 6-column tables.

## 4. Post-Merge Fixes

- Connected the HITL and RES families to gates.
- Restored two dropped controls:
  - **OPS-14** — defensive watchdog triad.
  - **TEST-16** — autonomous detection agents.
- Added forward secrecy to **A2A-01**.

## 5. v3.1 Cleanup

- Established a single canonical hard floor, referenced from Gate 5.
- Added the rule that hard-floor controls cannot be marked "Accepted Risk."
- Made pass criteria technology-neutral.
- Added applicability profiles.
- Fixed the **DEC** release-floor ID.
- Tagged synthesized controls with "SDLC synthesis" provenance.

## 6. Caveat

This review was performed by AI agents, not a human audit. Treat it as engineering due-diligence, not third-party certification.

*Dated 2026-06-19.*
