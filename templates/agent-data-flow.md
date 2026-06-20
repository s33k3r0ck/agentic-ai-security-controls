# Agent Data-Flow Diagram

> **Evidence-package template** — Agentic AI Security Controls checklist (see `docs/checklist.md` §10).
> **Backs controls:** ARCH-01, ARCH-02, ARCH-05
> **SDLC gate:** 1 — Architecture & Threat Modeling  ·  **Family:** Architecture
> Copy this file, fill every _placeholder_, and delete the guidance blockquotes (lines starting with ">") before it becomes evidence.

**System / agent:** _<name>_  ·  **Owner:** _<name, role>_  ·  **Date:** _<YYYY-MM-DD>_  ·  **Version:** _<vN>_  ·  **Status:** _Draft / Reviewed / Approved_

---

> **What this artifact proves.** A current, accurate data-flow diagram for the agentic system. It is the primary evidence for **ARCH-01** (maintain a data-flow diagram), **ARCH-02** (untrusted inputs are visibly marked), and **ARCH-05** (egress paths are explicit and classified). It is the foundation the threat model and most downstream controls depend on, so keep it truthful and keep it current.
>
> **The committed deliverable is the rendered image — `agent-data-flow.png` — exported from the diagram below.** This `.md` file is the editable source; the `.png` is what ships in the per-release evidence package. Regenerate the `.png` whenever the diagram changes and re-export before sign-off.

## 1. Scope and assumptions

> State exactly which system/agent this diagram covers and where the boundary of the diagram sits. A diagram that quietly omits a tool, a memory store, or an egress path is worse than none — it makes the threat model lie. Name what is in scope and, explicitly, what is out of scope and why.

- **In scope:** _<which agent(s), version, environment — e.g. production tenant>_
- **Out of scope (and why):** _<adjacent systems intentionally excluded>_
- **Diagram last reconciled against the running system on:** _<YYYY-MM-DD by whom>_
- **Companion artifacts:** _<link to threat model, egress map / ARCH-05, trust-boundary list / ARCH-02>_

## 2. Starter diagram (edit this)

> Edit the Mermaid skeleton below until it reflects your real system, then export it to `agent-data-flow.png`. Keep every node ARCH-01 requires (Section 3). Wrap each trust zone in a `subgraph` so trust boundaries are visible (ARCH-02). Mark untrusted-input sources and classified egress edges with the conventions shown — do not leave them as plain arrows.
>
> Conventions used below (keep or replace consistently, then describe them in Section 6):
> - `((U))` suffix or red styling = **untrusted input** (ARCH-02)
> - `==>` thick arrows = **classified egress path** (ARCH-05)
> - `subgraph` = **trust boundary / zone**
>
> _EXAMPLE node/edge content below is illustrative — replace it with your system and delete this line._

```mermaid
flowchart TD
    %% ====== UNTRUSTED ZONE (outside the trust boundary) ======
    subgraph UNTRUSTED["Untrusted zone (ARCH-02)"]
        USER["User input ((U))"]:::untrusted
        FILES["Uploaded files ((U))"]:::untrusted
        WEB["Web / browsing ((U))"]:::untrusted
        EMAIL["Email / media ((U))"]:::untrusted
        A2A["Inbound A2A messages ((U))"]:::untrusted
        EXT["External / 3rd-party systems ((U))"]:::untrusted
    end

    %% ====== TRUSTED / CONTROLLED ZONE ======
    subgraph TRUSTED["Application trust boundary"]
        AGENT["Agent / orchestrator"]:::agent
        PROMPT["System prompt + context assembly"]:::trusted
        TOOLS["Tools / functions"]:::trusted
        APP["Host application / backend"]:::trusted
        subgraph DATAZONE["Data & retrieval zone"]
            RAG["RAG / vector store ((U) content)"]:::untrusted
            MEM["Agent memory ((U) content)"]:::untrusted
        end
    end

    %% ====== EGRESS TARGETS ======
    subgraph EGRESS["Egress targets (ARCH-05)"]
        OUTUSER["Output to user"]:::egress
        LOGS["Logs / telemetry"]:::egress
        MODEL["3rd-party model / inference API"]:::egress
        EXTOUT["External systems / partner APIs"]:::egress
    end

    %% ---- Untrusted inputs entering the boundary (ARCH-02) ----
    USER --> PROMPT
    FILES --> PROMPT
    WEB --> TOOLS
    EMAIL --> TOOLS
    A2A --> AGENT
    EXT --> TOOLS
    RAG --> PROMPT
    MEM --> AGENT

    %% ---- Internal flow ----
    PROMPT --> AGENT
    AGENT --> TOOLS
    AGENT --> APP
    AGENT --> MEM
    TOOLS --> RAG

    %% ---- Classified egress paths (ARCH-05) ----
    AGENT ==> OUTUSER
    AGENT ==> MODEL
    TOOLS ==> EXTOUT
    APP ==> LOGS

    classDef untrusted fill:#fde2e2,stroke:#c0392b,stroke-width:2px,color:#000;
    classDef trusted fill:#e8f0fe,stroke:#3367d6,color:#000;
    classDef agent fill:#fff3cd,stroke:#b8860b,stroke-width:2px,color:#000;
    classDef egress fill:#e6f4ea,stroke:#1e8e3e,stroke-width:2px,color:#000;
```

## 3. Required elements checklist

> The diagram is not complete until every box below is checked against the rendered `agent-data-flow.png`. These map directly to ARCH-01/02/05. If an element genuinely does not exist in your system, do not silently omit it — note it as N/A with a reason in Section 5.

**Nodes ARCH-01 requires — all present and labeled:**
- [ ] Prompts (system prompt + context assembly)
- [ ] Tools / functions the agent can call
- [ ] Agent memory store(s)
- [ ] RAG / retrieval / vector store(s)
- [ ] Logs / telemetry sinks
- [ ] Users / human actors
- [ ] Agent(s) / orchestrator
- [ ] Host application(s) / backend
- [ ] External / third-party systems

**Untrusted inputs visibly marked (ARCH-02) — risks AGT-01, AGT-05, AGT-08:**
- [ ] User input marked untrusted
- [ ] Uploaded files marked untrusted
- [ ] RAG / retrieved content marked untrusted
- [ ] Memory content marked untrusted
- [ ] Web / browsing content marked untrusted
- [ ] Tool output marked untrusted
- [ ] Email / media marked untrusted
- [ ] Inbound agent-to-agent (A2A) messages marked untrusted

**Explicit, classified egress paths (ARCH-05) — risks AGT-04, AGT-06:**
- [ ] Egress to users shown and classified
- [ ] Egress to tools shown and classified
- [ ] Egress to logs shown and classified
- [ ] Egress to external systems shown and classified
- [ ] Egress to third-party / inference models shown and classified

**Structure:**
- [ ] Trust boundaries drawn as subgraphs / zones (untrusted vs. controlled)
- [ ] A legend explains the untrusted / egress / boundary conventions (Section 6)
- [ ] `agent-data-flow.png` is exported from the current diagram and committed

## 4. Untrusted-input register (ARCH-02)

> One row per untrusted-input source in the diagram. This is the trust-boundary list ARCH-02 calls for. "Untrusted" means content an adversary could influence — treat tool output, RAG, and memory as untrusted, not just direct user input.

| Input source | Enters at (node/edge) | Untrusted because | Sanitization / handling at boundary | Related risk |
|---|---|---|---|---|
| _EXAMPLE — delete this row: Uploaded file_ | _PROMPT via FILES_ | _Attacker-controlled document content_ | _Content extraction sandbox + injection screening_ | _AGT-01_ |
| _<source>_ | _<node/edge>_ | _<why untrusted>_ | _<control / link>_ | _<AGT-0x>_ |

## 5. Egress register (ARCH-05)

> One row per egress edge (the thick `==>` arrows). Classify each path by sensitivity of what can leave and the control on it. Unclassified egress is how data exfiltration and unintended actions slip through — this register is the egress map ARCH-05 requires.

| Egress path | Destination | Data classification | Control / approval on the path | Related risk |
|---|---|---|---|---|
| _EXAMPLE — delete this row: AGENT ==> 3rd-party model_ | _Inference API_ | _Confidential — may contain user data_ | _Output filter + DLP; no secrets in context_ | _AGT-06_ |
| _<path>_ | _<destination>_ | _<class>_ | _<control / approval>_ | _<AGT-0x>_ |

## 6. Legend, conventions, and notes

> Spell out the visual conventions a reviewer needs to read the `.png` without this file. Record any element marked N/A from Section 3 with the reason, and note known gaps or assumptions a threat modeler must inherit.

- **Untrusted marking convention:** _<e.g. red fill + ((U)) suffix>_
- **Egress marking convention:** _<e.g. thick green arrows>_
- **Trust-boundary convention:** _<e.g. labeled subgraphs>_
- **Elements marked N/A (with reason):** _<list, or "none">_
- **Known gaps / assumptions for the threat model:** _<list, or "none">_

## Sign-off

> All listed owners must sign before this diagram counts as Gate 1 evidence. Replace _placeholders_ with real names and dates; record Approved / Rejected / Approved-with-conditions in the Decision column.

| Role | Name | Date | Decision |
|---|---|---|---|
| Security owner (required) | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Conditions_ |
| Architecture / engineering owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Conditions_ |
| Product owner | _<name>_ | _<YYYY-MM-DD>_ | _Approved / Rejected / Conditions_ |
