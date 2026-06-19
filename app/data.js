// data.js — SINGLE SOURCE OF TRUTH for control data. Edit here.
// Consumed two ways: app/checklist.html loads this directly via <script> (no
// build); `node build.js` regenerates the generated regions of docs/checklist.md
// from it. See app/README.md for the full developer guide.
//
// Each entry in window.CHECKLIST.controls has exactly these 9 fields:
//   id        string    Unique "PREFIX-NN" (e.g. "GOV-01"). Prefix = one of 21
//                       ID-prefixes (GOV, ARCH, COMP, TOOL, ID, PROMPT, DATA, RAG,
//                       MEM, OUT, CODE, A2A, HITL, RES, CPS, OPS, SUP, TEST, CHG,
//                       IR, DEC).
//   family    string    One of 13 display family names (e.g. "Data, RAG, and
//                       Memory"); several prefixes can share one family.
//   profile   string    Core | Tool-Using | Tool-Using (Code Exec) | RAG / Memory
//                       | Multi-Agent | Regulated | Cyber-Physical.
//   control   string    Short imperative control statement.
//   pass      string    Pass criteria.
//   evidence  string    Evidence artifact.
//   risk      string    Usually comma-separated AGT-NN IDs (AGT-01..AGT-15); 10
//                       controls use a catch-all instead — "All" or
//                       "AGT-01 through AGT-15" (these don't resolve to tooltips).
//   dependsOn string[]  Prerequisite control IDs (must exist; keep graph acyclic).
//   floor     boolean   true = Non-Waivable Release Floor control.
// `affects` (inverse of dependsOn) is DERIVED at load — do not add it here.
window.CHECKLIST = {
  "controls": [
    {
      "id": "GOV-01",
      "family": "Governance",
      "profile": "Core",
      "control": "Assign owners.",
      "pass": "Product, engineering, security, and operations owners are named, with escalation contacts.",
      "evidence": "Owner record, on-call rotation.",
      "risk": "AGT-13, AGT-14",
      "dependsOn": [],
      "floor": true
    },
    {
      "id": "GOV-02",
      "family": "Governance",
      "profile": "Core",
      "control": "Classify autonomy.",
      "pass": "Each agent has an A0-A3 autonomy level and oversight model.",
      "evidence": "Intake record.",
      "risk": "AGT-01, AGT-02, AGT-10",
      "dependsOn": [
        "GOV-05"
      ],
      "floor": false
    },
    {
      "id": "GOV-03",
      "family": "Governance",
      "profile": "Core",
      "control": "Define high-risk actions.",
      "pass": "Writes, deletes, sends, approvals, execution, configuration, sensitive disclosure, and actuation are risk-rated.",
      "evidence": "Action inventory.",
      "risk": "AGT-02, AGT-04, AGT-07",
      "dependsOn": [],
      "floor": true
    },
    {
      "id": "GOV-04",
      "family": "Governance",
      "profile": "Core",
      "control": "Define release floor and waiver rules.",
      "pass": "Hard-floor controls cannot be accepted risk; other waivers require owners, expiry, compensating control, and remediation ticket.",
      "evidence": "Release checklist, risk acceptance records.",
      "risk": "All",
      "dependsOn": [
        "GOV-01",
        "GOV-03"
      ],
      "floor": true
    },
    {
      "id": "GOV-05",
      "family": "Governance",
      "profile": "Core",
      "control": "Maintain an agent registry.",
      "pass": "Each agent has owner, purpose, model, tools, data sources, memory, environment, profile, and lifecycle state.",
      "evidence": "Agent registry.",
      "risk": "AGT-13",
      "dependsOn": [
        "GOV-01"
      ],
      "floor": false
    },
    {
      "id": "GOV-06",
      "family": "Governance",
      "profile": "Regulated",
      "control": "Run governance review for regulated or high-impact deployments.",
      "pass": "Legal/compliance/security/business approve data flow, processing scope, retention, residency, and operational envelope.",
      "evidence": "Review board approval, RACI.",
      "risk": "AGT-04, AGT-10, AGT-14",
      "dependsOn": [
        "COMP-01",
        "ARCH-01"
      ],
      "floor": false
    },
    {
      "id": "GOV-07",
      "family": "Governance",
      "profile": "Core",
      "control": "Govern AI sprawl and shadow AI.",
      "pass": "A sanctioned model/tool list and AI acceptable-use policy exist, and unsanctioned LLMs, agents, MCP servers, IDE extensions, and AI-infused packages are discovered across endpoints, SaaS, and cloud.",
      "evidence": "Sanctioned list, acceptable-use policy, shadow-AI discovery report.",
      "risk": "AGT-12, AGT-04",
      "dependsOn": [
        "GOV-05",
        "SUP-01"
      ],
      "floor": false
    },
    {
      "id": "COMP-01",
      "family": "Compliance",
      "profile": "Regulated",
      "control": "Identify legal, contractual, and customer obligations.",
      "pass": "Applicable laws, sector rules, contracts, residency, retention, lawful basis, and breach-notification duties are recorded.",
      "evidence": "Compliance intake record.",
      "risk": "AGT-04, AGT-14",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "COMP-02",
      "family": "Compliance",
      "profile": "Regulated",
      "control": "Enforce obligations with technical controls.",
      "pass": "Residency, retention, access, processor/subprocessor, and data-use restrictions are enforced by policy, configuration, or workflow gates.",
      "evidence": "Policy-as-code, configuration, denial logs.",
      "risk": "AGT-04, AGT-15",
      "dependsOn": [
        "COMP-01",
        "DATA-01"
      ],
      "floor": false
    },
    {
      "id": "COMP-03",
      "family": "Compliance",
      "profile": "Regulated",
      "control": "Produce audit evidence for high-impact decisions.",
      "pass": "Regulated or high-impact actions have decision evidence, source provenance, approval record, and immutable or integrity-protected audit trail.",
      "evidence": "Decision evidence package.",
      "risk": "AGT-10, AGT-14",
      "dependsOn": [
        "OPS-01",
        "OPS-02"
      ],
      "floor": false
    },
    {
      "id": "COMP-04",
      "family": "Compliance",
      "profile": "Regulated",
      "control": "Review obligation drift.",
      "pass": "New data flows, model providers, processors, regions, retention rules, or customer commitments trigger compliance review before release.",
      "evidence": "Change review, obligation register.",
      "risk": "AGT-04, AGT-12",
      "dependsOn": [
        "COMP-01",
        "CHG-01"
      ],
      "floor": false
    },
    {
      "id": "ARCH-01",
      "family": "Architecture",
      "profile": "Core",
      "control": "Maintain an agent data-flow diagram.",
      "pass": "Diagram includes prompts, tools, memory, RAG, logs, users, agents, approvals, outputs, and external systems.",
      "evidence": "Architecture diagram.",
      "risk": "All",
      "dependsOn": [],
      "floor": true
    },
    {
      "id": "ARCH-02",
      "family": "Architecture",
      "profile": "Core",
      "control": "Mark untrusted inputs.",
      "pass": "User input, files, RAG, memory, web, tool output, email, media, and A2A messages are labeled untrusted.",
      "evidence": "Trust boundary list.",
      "risk": "AGT-01, AGT-05, AGT-08",
      "dependsOn": [
        "ARCH-01"
      ],
      "floor": true
    },
    {
      "id": "ARCH-03",
      "family": "Architecture",
      "profile": "Core",
      "control": "Separate instructions from data.",
      "pass": "Retrieved data and tool output cannot change policy, identity, permissions, or approval rules.",
      "evidence": "Design review, tests.",
      "risk": "AGT-01, AGT-05",
      "dependsOn": [
        "ARCH-02"
      ],
      "floor": false
    },
    {
      "id": "ARCH-04",
      "family": "Architecture",
      "profile": "Core",
      "control": "Define containment boundaries.",
      "pass": "Memory, tools, execution, network, filesystem, tenant data, logs, and output paths are bounded.",
      "evidence": "ADR, architecture review.",
      "risk": "AGT-02, AGT-03, AGT-07",
      "dependsOn": [
        "ARCH-01"
      ],
      "floor": false
    },
    {
      "id": "ARCH-05",
      "family": "Architecture",
      "profile": "Core",
      "control": "Design explicit egress paths.",
      "pass": "Outputs to users, tools, logs, external systems, and third-party models are classified and controlled.",
      "evidence": "Egress map.",
      "risk": "AGT-04, AGT-06",
      "dependsOn": [
        "ARCH-01",
        "DATA-01"
      ],
      "floor": false
    },
    {
      "id": "ARCH-06",
      "family": "Architecture",
      "profile": "Core",
      "control": "Design tamper-evident audit.",
      "pass": "Consequential actions are logged with integrity protection and retention.",
      "evidence": "Logging design.",
      "risk": "AGT-14",
      "dependsOn": [
        "ARCH-01",
        "GOV-03"
      ],
      "floor": false
    },
    {
      "id": "TOOL-01",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Inventory all tools.",
      "pass": "Each tool has owner, purpose, permissions, side effects, risk rating, sink type, and approval status.",
      "evidence": "Tool inventory.",
      "risk": "AGT-02",
      "dependsOn": [],
      "floor": true
    },
    {
      "id": "TOOL-02",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Enforce least agency and least privilege.",
      "pass": "Tool scopes, rates, egress, and permissions are limited to the task.",
      "evidence": "Permission matrix, policies.",
      "risk": "AGT-02, AGT-03",
      "dependsOn": [
        "TOOL-01"
      ],
      "floor": false
    },
    {
      "id": "TOOL-03",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Validate tool parameters server-side.",
      "pass": "Invalid, unauthorized, or policy-violating parameters are rejected outside the model.",
      "evidence": "Unit tests, policy logs.",
      "risk": "AGT-02, AGT-03",
      "dependsOn": [
        "TOOL-01"
      ],
      "floor": true
    },
    {
      "id": "TOOL-04",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Gate high-risk tool calls.",
      "pass": "Irreversible, external, sensitive, permission-changing, or code-executing actions pass a policy gate before execution.",
      "evidence": "Policy decision logs.",
      "risk": "AGT-02, AGT-04, AGT-07",
      "dependsOn": [
        "TOOL-01",
        "GOV-03",
        "TOOL-03"
      ],
      "floor": true
    },
    {
      "id": "TOOL-05",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Block unsafe tool chaining.",
      "pass": "Sensitive read followed by external write is denied unless explicitly approved.",
      "evidence": "Red-team tests, monitoring rules.",
      "risk": "AGT-02, AGT-04",
      "dependsOn": [
        "TOOL-04",
        "DATA-01"
      ],
      "floor": false
    },
    {
      "id": "TOOL-06",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Resolve tools safely.",
      "pass": "Tool calls use unambiguous names and approved versions; ambiguous resolution fails closed.",
      "evidence": "Resolution tests.",
      "risk": "AGT-01, AGT-02",
      "dependsOn": [
        "TOOL-01"
      ],
      "floor": false
    },
    {
      "id": "TOOL-07",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Support dry-run and idempotency.",
      "pass": "High-risk side effects have preview, approval, safe retry, and no side effects during preview.",
      "evidence": "Tool tests.",
      "risk": "AGT-02, AGT-10",
      "dependsOn": [
        "TOOL-01",
        "GOV-03"
      ],
      "floor": false
    },
    {
      "id": "TOOL-08",
      "family": "Tools and Agency",
      "profile": "Tool-Using",
      "control": "Use adapters for legacy systems.",
      "pass": "Agents do not hold legacy credentials; adapters own legacy auth and enforce modern policy.",
      "evidence": "Adapter design, credential-flow review.",
      "risk": "AGT-02, AGT-03",
      "dependsOn": [
        "TOOL-01",
        "ID-01"
      ],
      "floor": false
    },
    {
      "id": "ID-01",
      "family": "Identity and Privilege",
      "profile": "Core",
      "control": "Use scoped, short-lived credentials.",
      "pass": "Credentials are bound to user, agent, action, resource, and time window.",
      "evidence": "Token config, logs.",
      "risk": "AGT-03",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "ID-02",
      "family": "Identity and Privilege",
      "profile": "Core",
      "control": "Prevent privilege inheritance abuse.",
      "pass": "High-privilege context cannot be reused for unrelated or injected tasks; context switches revalidate intent.",
      "evidence": "Authorization tests.",
      "risk": "AGT-03",
      "dependsOn": [
        "ID-01"
      ],
      "floor": false
    },
    {
      "id": "ID-03",
      "family": "Identity and Privilege",
      "profile": "Core",
      "control": "Isolate users and tenants.",
      "pass": "Cross-user and cross-tenant access attempts fail closed.",
      "evidence": "Isolation tests.",
      "risk": "AGT-03, AGT-04",
      "dependsOn": [],
      "floor": true
    },
    {
      "id": "ID-04",
      "family": "Identity and Privilege",
      "profile": "Core",
      "control": "Manage agent identities as non-human identities.",
      "pass": "Agent/service identities are inventoried, scoped, rotated, monitored, and decommissioned.",
      "evidence": "NHI inventory, rotation logs.",
      "risk": "AGT-03, AGT-14",
      "dependsOn": [
        "GOV-05",
        "ID-01"
      ],
      "floor": false
    },
    {
      "id": "ID-05",
      "family": "Identity and Privilege",
      "profile": "Core",
      "control": "Require step-up for sensitive actions.",
      "pass": "High-impact actions require independent confirmation or policy-approved automation.",
      "evidence": "Approval records.",
      "risk": "AGT-03, AGT-10",
      "dependsOn": [
        "GOV-03"
      ],
      "floor": false
    },
    {
      "id": "ID-06",
      "family": "Identity and Privilege",
      "profile": "Multi-Agent",
      "control": "Authenticate agent connections.",
      "pass": "Agent-to-agent and agent-to-tool connections use mutual authentication and reject unknown or expired identities.",
      "evidence": "mTLS/SPIFFE or equivalent config, connection tests.",
      "risk": "AGT-03, AGT-08",
      "dependsOn": [
        "ID-04"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-01",
      "family": "Prompt Injection and Context",
      "profile": "Core",
      "control": "Treat prompt injection as expected.",
      "pass": "Authorization, tool gating, identity, approval, and execution controls do not rely on prompt text alone.",
      "evidence": "Architecture review.",
      "risk": "AGT-01",
      "dependsOn": [
        "ARCH-02",
        "ARCH-03"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-02",
      "family": "Prompt Injection and Context",
      "profile": "Core",
      "control": "Test direct injection.",
      "pass": "Policy override, false role, system prompt extraction, refusal suppression, and jailbreaking fail safely.",
      "evidence": "Red-team results.",
      "risk": "AGT-01, AGT-15",
      "dependsOn": [
        "PROMPT-05",
        "TEST-02"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-03",
      "family": "Prompt Injection and Context",
      "profile": "RAG / Memory",
      "control": "Test indirect injection.",
      "pass": "Poisoned documents, web pages, emails, RAG chunks, memory, tool output, and A2A messages cannot trigger unsafe actions.",
      "evidence": "Fixture tests.",
      "risk": "AGT-01, AGT-05, AGT-08",
      "dependsOn": [
        "ARCH-02",
        "ARCH-03",
        "TEST-02"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-04",
      "family": "Prompt Injection and Context",
      "profile": "Core",
      "control": "Test evasion techniques.",
      "pass": "Obfuscation, encoding, homoglyphs, translation, multimodal payloads, boundary manipulation, and multi-turn steering fail safely.",
      "evidence": "Red-team corpus.",
      "risk": "AGT-01",
      "dependsOn": [
        "TEST-02",
        "PROMPT-07"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-05",
      "family": "Prompt Injection and Context",
      "profile": "Core",
      "control": "Lock system prompts and policy.",
      "pass": "Prompt/policy changes are versioned, reviewed, tested, and cannot be overridden by retrieved data.",
      "evidence": "Prompt repo, change records.",
      "risk": "AGT-01, AGT-15",
      "dependsOn": [
        "ARCH-03",
        "SUP-03"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-06",
      "family": "Prompt Injection and Context",
      "profile": "Tool-Using",
      "control": "Bind goal, constraints, and context per run.",
      "pass": "Tool execution is tied to a signed or otherwise verifiable intent record; data cannot redefine it.",
      "evidence": "Intent record, tamper tests.",
      "risk": "AGT-01, AGT-02",
      "dependsOn": [
        "TOOL-01",
        "ARCH-03"
      ],
      "floor": false
    },
    {
      "id": "PROMPT-07",
      "family": "Prompt Injection and Context",
      "profile": "Core",
      "control": "Treat decoded media as untrusted data.",
      "pass": "OCR, image, audio, QR, and document-layout text is sanitized and cannot become a command without approval.",
      "evidence": "Multimodal tests.",
      "risk": "AGT-01, AGT-05",
      "dependsOn": [
        "ARCH-02"
      ],
      "floor": false
    },
    {
      "id": "DATA-01",
      "family": "Data, RAG, and Memory",
      "profile": "Core",
      "control": "Classify sensitive data.",
      "pass": "PII, PHI, credentials, secrets, customer data, regulated data, and proprietary data are labeled.",
      "evidence": "Data inventory.",
      "risk": "AGT-04",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "DATA-02",
      "family": "Data, RAG, and Memory",
      "profile": "Core",
      "control": "Restrict output channels.",
      "pass": "Sensitive data cannot be sent to unauthorized users, tools, logs, external systems, or third-party models.",
      "evidence": "Egress policy tests.",
      "risk": "AGT-04",
      "dependsOn": [
        "DATA-01",
        "ARCH-05"
      ],
      "floor": true
    },
    {
      "id": "DATA-03",
      "family": "Data, RAG, and Memory",
      "profile": "Core",
      "control": "Redact or block sensitive data where needed.",
      "pass": "Sensitive fields are redacted or denied before unsafe output or model/tool transfer.",
      "evidence": "DLP logs, tests.",
      "risk": "AGT-04, AGT-15",
      "dependsOn": [
        "DATA-01",
        "DATA-02"
      ],
      "floor": false
    },
    {
      "id": "DATA-04",
      "family": "Data, RAG, and Memory",
      "profile": "Regulated",
      "control": "Enforce data minimization and residency.",
      "pass": "Agents access only needed data and cannot process or route regulated data outside allowed regions or processors.",
      "evidence": "Policy-as-code, denial logs.",
      "risk": "AGT-04",
      "dependsOn": [
        "DATA-01"
      ],
      "floor": false
    },
    {
      "id": "DATA-05",
      "family": "Data, RAG, and Memory",
      "profile": "Core",
      "control": "Safeguard training and fine-tuning data.",
      "pass": "Training/fine-tuning sets exclude PII, PHI, IP, and regulatory-bound data via filtering plus manual validation, and training-data lineage, consent, and provenance are documented.",
      "evidence": "Data-filtering pipeline, lineage record.",
      "risk": "AGT-04",
      "dependsOn": [
        "DATA-01"
      ],
      "floor": false
    },
    {
      "id": "RAG-01",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Maintain approved source registry.",
      "pass": "Sources have owner, trust level, update path, review process, and approval status.",
      "evidence": "Source registry.",
      "risk": "AGT-05, AGT-12",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "RAG-02",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Store provenance with retrieval.",
      "pass": "Retrieved chunks can be traced to source, version, trust level, and retrieval time.",
      "evidence": "Retrieval logs.",
      "risk": "AGT-05, AGT-10",
      "dependsOn": [
        "RAG-01"
      ],
      "floor": false
    },
    {
      "id": "RAG-03",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Sanitize data before embedding.",
      "pass": "Ingested content is cleaned of scripts, metadata risks, and embedded prompt carriers where feasible.",
      "evidence": "Ingestion pipeline tests.",
      "risk": "AGT-05",
      "dependsOn": [
        "ARCH-02",
        "RAG-01"
      ],
      "floor": false
    },
    {
      "id": "RAG-04",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Prevent poisoned retrieval from driving high-risk action.",
      "pass": "Low-trust or contradictory content cannot directly justify sensitive action.",
      "evidence": "Policy tests.",
      "risk": "AGT-05, AGT-10",
      "dependsOn": [
        "RAG-02",
        "ARCH-03"
      ],
      "floor": false
    },
    {
      "id": "RAG-05",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Isolate vector stores per tenant.",
      "pass": "Shared vector/embedding stores use per-tenant namespaces and granular access controls so retrieval cannot bleed across tenants or users.",
      "evidence": "Namespace/ACL config, cross-tenant retrieval test.",
      "risk": "AGT-03, AGT-05",
      "dependsOn": [
        "ID-03"
      ],
      "floor": false
    },
    {
      "id": "RAG-06",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Monitor sources and embeddings for poisoning and drift.",
      "pass": "Anomalous source-update frequency and embedding/semantic drift are detected and reviewed; embeddings are refreshed to limit drift.",
      "evidence": "Monitoring rules, drift alerts.",
      "risk": "AGT-05",
      "dependsOn": [
        "RAG-01",
        "RAG-02"
      ],
      "floor": false
    },
    {
      "id": "MEM-01",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Gate memory writes.",
      "pass": "Durable memory writes are scanned, policy-checked, and cannot store arbitrary instructions as trusted memory.",
      "evidence": "Memory write logs.",
      "risk": "AGT-05",
      "dependsOn": [
        "ARCH-02",
        "ARCH-03"
      ],
      "floor": false
    },
    {
      "id": "MEM-02",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Isolate and encrypt memory.",
      "pass": "Memory is separated by tenant, user, environment, sensitivity, and protected at rest/in transit.",
      "evidence": "Isolation tests, encryption config.",
      "risk": "AGT-03, AGT-05",
      "dependsOn": [
        "ID-03"
      ],
      "floor": false
    },
    {
      "id": "MEM-03",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Support memory review, rollback, and deletion.",
      "pass": "Memory can be inspected, corrected, quarantined, deleted, and restored to a known-safe version.",
      "evidence": "Runbook, drill evidence.",
      "risk": "AGT-05",
      "dependsOn": [
        "MEM-06",
        "OPS-01"
      ],
      "floor": false
    },
    {
      "id": "MEM-04",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Block self-ingestion into trusted memory.",
      "pass": "Agent-generated output is not automatically re-ingested as trusted durable memory.",
      "evidence": "Memory policy tests.",
      "risk": "AGT-05",
      "dependsOn": [
        "MEM-01"
      ],
      "floor": false
    },
    {
      "id": "MEM-05",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Expire low-trust memory.",
      "pass": "Unverified or low-trust memory decays or expires unless validated.",
      "evidence": "Retention policy, expiry test.",
      "risk": "AGT-05",
      "dependsOn": [
        "MEM-01",
        "MEM-06"
      ],
      "floor": false
    },
    {
      "id": "MEM-06",
      "family": "Data, RAG, and Memory",
      "profile": "RAG / Memory",
      "control": "Integrity-protect memory.",
      "pass": "Durable memory writes are versioned and integrity-protected (checksums/signatures with verification); high-impact memory is surfaced only with sufficient provenance plus a human-verified tag.",
      "evidence": "Integrity config, verification test.",
      "risk": "AGT-05",
      "dependsOn": [
        "MEM-01"
      ],
      "floor": false
    },
    {
      "id": "OUT-01",
      "family": "Output and Code Execution",
      "profile": "Core",
      "control": "Inventory output sinks.",
      "pass": "HTML, Markdown, SQL, shell, code, config, workflow, ticket, email, and approval sinks are identified.",
      "evidence": "Sink inventory.",
      "risk": "AGT-06",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "OUT-02",
      "family": "Output and Code Execution",
      "profile": "Core",
      "control": "Validate output before sinks.",
      "pass": "Output is schema-validated, type-checked, and policy-checked before downstream use.",
      "evidence": "Tests, policy logs.",
      "risk": "AGT-06",
      "dependsOn": [
        "OUT-01"
      ],
      "floor": false
    },
    {
      "id": "OUT-03",
      "family": "Output and Code Execution",
      "profile": "Core",
      "control": "Encode or sanitize by context.",
      "pass": "Browser, Markdown, SQL, shell, template, and file contexts use sink-specific protections.",
      "evidence": "Security tests.",
      "risk": "AGT-06",
      "dependsOn": [
        "OUT-01"
      ],
      "floor": false
    },
    {
      "id": "OUT-04",
      "family": "Output and Code Execution",
      "profile": "Core",
      "control": "Separate recommendation from evidence.",
      "pass": "Approval packets show source evidence, provenance, and risk separately from agent narrative.",
      "evidence": "UX review.",
      "risk": "AGT-10",
      "dependsOn": [
        "RAG-02"
      ],
      "floor": false
    },
    {
      "id": "OUT-05",
      "family": "Output and Code Execution",
      "profile": "Core",
      "control": "Filter sensitive data from responses.",
      "pass": "Tool/server responses omit or redact sensitive fields unless the requesting agent is authorized.",
      "evidence": "Filter tests.",
      "risk": "AGT-04, AGT-06",
      "dependsOn": [
        "DATA-01",
        "ID-01"
      ],
      "floor": false
    },
    {
      "id": "OUT-06",
      "family": "Output and Code Execution",
      "profile": "Core",
      "control": "Apply an independent output safety check.",
      "pass": "Agent output passes an independent safety/alignment filter (a separate model or guard, not the producing agent) before execution or display.",
      "evidence": "Output-filter config, bypass tests.",
      "risk": "AGT-06, AGT-09",
      "dependsOn": [
        "OUT-01",
        "OUT-02"
      ],
      "floor": false
    },
    {
      "id": "CODE-01",
      "family": "Output and Code Execution",
      "profile": "Tool-Using (Code Exec)",
      "control": "Disable arbitrary execution by default.",
      "pass": "Agent cannot run shell, SQL, scripts, browser automation, templates, or code unless approved.",
      "evidence": "Tool inventory, tests.",
      "risk": "AGT-07",
      "dependsOn": [
        "TOOL-01"
      ],
      "floor": true
    },
    {
      "id": "CODE-02",
      "family": "Output and Code Execution",
      "profile": "Tool-Using (Code Exec)",
      "control": "Sandbox approved execution.",
      "pass": "Execution runs isolated, non-root, resource-limited, egress-limited, and without default secrets or production data.",
      "evidence": "Sandbox config, tests.",
      "risk": "AGT-07",
      "dependsOn": [
        "CODE-01",
        "ARCH-04"
      ],
      "floor": true
    },
    {
      "id": "CODE-03",
      "family": "Output and Code Execution",
      "profile": "Tool-Using (Code Exec)",
      "control": "Separate generation from execution.",
      "pass": "Generated code passes scanning, policy, and approval before side effects.",
      "evidence": "Review records, scan results.",
      "risk": "AGT-07",
      "dependsOn": [
        "CODE-01",
        "SUP-05"
      ],
      "floor": false
    },
    {
      "id": "CODE-04",
      "family": "Output and Code Execution",
      "profile": "Tool-Using (Code Exec)",
      "control": "Block execution from untrusted context.",
      "pass": "Retrieved data, memory, tool output, and agent messages cannot become executable without review.",
      "evidence": "Red-team tests.",
      "risk": "AGT-06, AGT-07",
      "dependsOn": [
        "CODE-01",
        "ARCH-02",
        "ARCH-03"
      ],
      "floor": false
    },
    {
      "id": "A2A-01",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Authenticate agent messages.",
      "pass": "Sender identity, environment, role, and trust domain are verified.",
      "evidence": "Protocol logs, identity config.",
      "risk": "AGT-08",
      "dependsOn": [
        "ID-04",
        "ID-06"
      ],
      "floor": false
    },
    {
      "id": "A2A-02",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Validate message schema and replay protection.",
      "pass": "Malformed, unknown, replayed, or unsafe messages fail closed.",
      "evidence": "Protocol tests.",
      "risk": "AGT-08",
      "dependsOn": [
        "ARCH-02",
        "A2A-01"
      ],
      "floor": false
    },
    {
      "id": "A2A-03",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Treat subagent output as untrusted.",
      "pass": "Subagent output cannot grant permissions, modify policy, or bypass approval.",
      "evidence": "Integration tests.",
      "risk": "AGT-08, AGT-13",
      "dependsOn": [
        "ARCH-02",
        "ARCH-03"
      ],
      "floor": false
    },
    {
      "id": "A2A-04",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Restrict delegation.",
      "pass": "Delegation is allowlisted, scoped, depth-limited, and monitored.",
      "evidence": "Delegation policy.",
      "risk": "AGT-08, AGT-13",
      "dependsOn": [
        "TOOL-02",
        "ID-04"
      ],
      "floor": false
    },
    {
      "id": "A2A-05",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Re-verify original user intent at execution.",
      "pass": "Internal requests do not bypass user intent or authorization checks.",
      "evidence": "Confused-deputy tests.",
      "risk": "AGT-03, AGT-08",
      "dependsOn": [
        "PROMPT-06",
        "ID-02"
      ],
      "floor": false
    },
    {
      "id": "A2A-06",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Monitor cross-agent collusion and drift.",
      "pass": "Cross-agent events are correlated for unusual coordination, hidden delegation, or role deviation.",
      "evidence": "SIEM rules, alerts.",
      "risk": "AGT-08, AGT-13",
      "dependsOn": [
        "OPS-01"
      ],
      "floor": false
    },
    {
      "id": "A2A-07",
      "family": "Agent-to-Agent and Multi-Agent",
      "profile": "Multi-Agent",
      "control": "Require independent validation for mission-critical decisions.",
      "pass": "High-impact multi-agent actions require quorum/consensus or a signed behavioral manifest with periodic attestation before execution; unattested or non-conforming agents are blocked.",
      "evidence": "Quorum/attestation config, manifest records.",
      "risk": "AGT-08, AGT-13",
      "dependsOn": [
        "A2A-01",
        "GOV-03"
      ],
      "floor": false
    },
    {
      "id": "HITL-01",
      "family": "Human Oversight",
      "profile": "Core",
      "control": "Make approvals evidence-based.",
      "pass": "Human approver sees action, target, source evidence, risk, policy result, and expected side effects.",
      "evidence": "Approval UX review.",
      "risk": "AGT-10",
      "dependsOn": [
        "OUT-04"
      ],
      "floor": false
    },
    {
      "id": "HITL-02",
      "family": "Human Oversight",
      "profile": "Core",
      "control": "Detect fake explainability.",
      "pass": "Agent cannot convince users to approve unsafe actions with fabricated or unsupported rationale.",
      "evidence": "Red-team tests.",
      "risk": "AGT-10",
      "dependsOn": [
        "HITL-01"
      ],
      "floor": false
    },
    {
      "id": "HITL-03",
      "family": "Human Oversight",
      "profile": "Core",
      "control": "Control approval fatigue.",
      "pass": "Approval volume, repeated prompts, latency, and bulk approval patterns are monitored.",
      "evidence": "HITL monitoring.",
      "risk": "AGT-10",
      "dependsOn": [
        "OPS-01",
        "HITL-04"
      ],
      "floor": false
    },
    {
      "id": "HITL-04",
      "family": "Human Oversight",
      "profile": "Core",
      "control": "Require approval tokens for high-impact actions.",
      "pass": "Delete, transfer, publish, spend, external-contact, and safety-relevant actions require per-invocation approval unless formally automated by policy.",
      "evidence": "Approval logs.",
      "risk": "AGT-02, AGT-10",
      "dependsOn": [
        "GOV-03",
        "ID-05",
        "OPS-01"
      ],
      "floor": false
    },
    {
      "id": "HITL-05",
      "family": "Human Oversight",
      "profile": "Core",
      "control": "Fail safe when oversight is unavailable.",
      "pass": "If human review cannot be obtained under degraded conditions, the system stops or falls back safely.",
      "evidence": "Degraded-mode drill.",
      "risk": "AGT-10, AGT-11",
      "dependsOn": [
        "HITL-04",
        "OPS-05"
      ],
      "floor": false
    },
    {
      "id": "RES-01",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Core",
      "control": "Limit recursion, retries, spend, and tool calls.",
      "pass": "Runtime limits prevent loops and unbounded downstream work.",
      "evidence": "Runtime config.",
      "risk": "AGT-11",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "RES-02",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Core",
      "control": "Add circuit breakers.",
      "pass": "Repeated failures, denials, cost spikes, high-risk chains, or anomaly bursts stop execution.",
      "evidence": "Breaker tests.",
      "risk": "AGT-11, AGT-13",
      "dependsOn": [
        "RES-01",
        "RES-03",
        "OPS-05"
      ],
      "floor": false
    },
    {
      "id": "RES-03",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Core",
      "control": "Monitor resource abuse.",
      "pass": "Alerts cover token spikes, tool-call spikes, retry storms, queue growth, memory growth, and quota depletion.",
      "evidence": "Monitoring dashboard.",
      "risk": "AGT-11",
      "dependsOn": [
        "OPS-01"
      ],
      "floor": false
    },
    {
      "id": "CPS-01",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Cyber-Physical",
      "control": "Inventory cyber-physical scope.",
      "pass": "Agents touching OT, robotics, IoT, medical devices, vehicles, or other physical systems are flagged.",
      "evidence": "Critical-system inventory.",
      "risk": "AGT-02, AGT-13",
      "dependsOn": [
        "ARCH-01"
      ],
      "floor": false
    },
    {
      "id": "CPS-02",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Cyber-Physical",
      "control": "Enforce safety bounds and fail-safe command limits.",
      "pass": "Proposed commands are bounds-checked; out-of-limit inputs are rejected.",
      "evidence": "Safety-bounds tests.",
      "risk": "AGT-02, AGT-07",
      "dependsOn": [
        "CPS-01",
        "TOOL-03"
      ],
      "floor": true
    },
    {
      "id": "CPS-03",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Cyber-Physical",
      "control": "Use out-of-model safety interlocks.",
      "pass": "Safety checks run outside the model and have authority to block action.",
      "evidence": "Safety gateway/interlock tests.",
      "risk": "AGT-02, AGT-13",
      "dependsOn": [
        "CPS-01",
        "CPS-02"
      ],
      "floor": true
    },
    {
      "id": "CPS-04",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Cyber-Physical",
      "control": "Protect emergency shutdown.",
      "pass": "Agent cannot disable safety interlocks or emergency shutdown; fail-safe transitions are tested.",
      "evidence": "Emergency drill.",
      "risk": "AGT-13",
      "dependsOn": [
        "CPS-03"
      ],
      "floor": true
    },
    {
      "id": "CPS-05",
      "family": "Resource Control and Cyber-Physical Safety",
      "profile": "Cyber-Physical",
      "control": "Secure command channels to physical systems.",
      "pass": "Channels to OT/physical systems are encrypted and integrity-protected (resisting spoofing, interception, and MITM), and each command is validated before actuation.",
      "evidence": "Channel-security config, integrity/MITM tests.",
      "risk": "AGT-08, AGT-02",
      "dependsOn": [
        "CPS-01",
        "ARCH-05",
        "ID-06"
      ],
      "floor": false
    },
    {
      "id": "OPS-01",
      "family": "Operations and Audit",
      "profile": "Core",
      "control": "Emit agentic logs.",
      "pass": "Logs include actor, agent, session, goal, subtask, tool, sanitized parameters, outcome, confidence/anomaly signals, policy decision, approval, and output.",
      "evidence": "Log schema, sample logs.",
      "risk": "AGT-14",
      "dependsOn": [
        "TOOL-01",
        "GOV-03"
      ],
      "floor": true
    },
    {
      "id": "OPS-02",
      "family": "Operations and Audit",
      "profile": "Core",
      "control": "Make audit tampering detectable.",
      "pass": "Consequential logs are append-only, hash-chained, WORM, ledger-backed, or otherwise integrity-verifiable.",
      "evidence": "Integrity verification test.",
      "risk": "AGT-14",
      "dependsOn": [
        "OPS-01"
      ],
      "floor": true
    },
    {
      "id": "OPS-03",
      "family": "Operations and Audit",
      "profile": "Core",
      "control": "Monitor goal drift and rogue behavior.",
      "pass": "Unexpected goals, role deviations, disabled-tool attempts, policy overrides, and confidence collapse alert.",
      "evidence": "Detection rules.",
      "risk": "AGT-01, AGT-13",
      "dependsOn": [
        "OPS-01"
      ],
      "floor": false
    },
    {
      "id": "OPS-04",
      "family": "Operations and Audit",
      "profile": "Core",
      "control": "Monitor exfiltration and unsafe tool sequences.",
      "pass": "Sensitive read to external write and unusual high-risk tool chains alert.",
      "evidence": "Monitoring dashboard.",
      "risk": "AGT-02, AGT-04",
      "dependsOn": [
        "OPS-01",
        "DATA-01"
      ],
      "floor": false
    },
    {
      "id": "OPS-05",
      "family": "Operations and Audit",
      "profile": "Core",
      "control": "Provide kill switch.",
      "pass": "Operators can disable agent, workflow, tool, connector, or model without deployment.",
      "evidence": "Drill evidence.",
      "risk": "AGT-13",
      "dependsOn": [
        "GOV-05"
      ],
      "floor": true
    },
    {
      "id": "OPS-06",
      "family": "Operations and Audit",
      "profile": "Core",
      "control": "Run incident drills.",
      "pass": "Team can disable, contain, investigate, rotate credentials, quarantine state, and restore safely.",
      "evidence": "Drill report.",
      "risk": "AGT-05, AGT-14",
      "dependsOn": [
        "OPS-05",
        "IR-02"
      ],
      "floor": false
    },
    {
      "id": "SUP-01",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Maintain AI bill of materials.",
      "pass": "Models, prompts, tools, plugins, connectors, libraries, datasets, APIs, and build systems are tracked.",
      "evidence": "AIBOM/SBOM.",
      "risk": "AGT-12",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "SUP-02",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Verify provenance and signatures.",
      "pass": "Only approved and verified models, prompts, tools, plugins, and connectors are deployed.",
      "evidence": "Approval and signature records.",
      "risk": "AGT-12",
      "dependsOn": [
        "SUP-01"
      ],
      "floor": false
    },
    {
      "id": "SUP-03",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Protect prompts and policies as code.",
      "pass": "Prompt and policy changes are reviewed, versioned, tested, and rollback-capable.",
      "evidence": "Git history, tests.",
      "risk": "AGT-12",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "SUP-04",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Pin runtime components.",
      "pass": "Prompts, tools, configs, and images are pinned by version/hash and changes trigger review.",
      "evidence": "Pin manifest, build config.",
      "risk": "AGT-12",
      "dependsOn": [
        "SUP-01"
      ],
      "floor": false
    },
    {
      "id": "SUP-05",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Scan dependencies and secrets in CI.",
      "pass": "CI blocks critical dependency vulnerabilities and exposed secrets across code, models, tools, and connectors, or records an accepted risk.",
      "evidence": "CI scan reports.",
      "risk": "AGT-12, AGT-15",
      "dependsOn": [
        "SUP-01"
      ],
      "floor": false
    },
    {
      "id": "TEST-01",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Map tests to AGT risks.",
      "pass": "Every AGT risk has at least one positive and one adversarial test.",
      "evidence": "Test matrix.",
      "risk": "All",
      "dependsOn": [],
      "floor": false
    },
    {
      "id": "TEST-02",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Maintain an adversarial fixture corpus.",
      "pass": "Direct, indirect, obfuscated, boundary, multimodal, multi-turn, tool, memory, RAG, A2A, and HITL cases are covered.",
      "evidence": "Fixture corpus.",
      "risk": "AGT-01 through AGT-15",
      "dependsOn": [
        "TEST-01"
      ],
      "floor": false
    },
    {
      "id": "TEST-03",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Measure red-team outcomes.",
      "pass": "Attack success rate, time to detect/block, time to contain, and undetected malicious actions are tracked.",
      "evidence": "Red-team report.",
      "risk": "AGT-01 through AGT-15",
      "dependsOn": [
        "TEST-02",
        "OPS-01"
      ],
      "floor": false
    },
    {
      "id": "TEST-04",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Add regression tests.",
      "pass": "Every fixed exploit path has a regression test.",
      "evidence": "Test history.",
      "risk": "AGT-01 through AGT-15",
      "dependsOn": [
        "TEST-01"
      ],
      "floor": false
    },
    {
      "id": "TEST-05",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Run continuous, methodology-driven red teaming.",
      "pass": "Red teaming follows a structured methodology and recognized agentic procedures/benchmarks (e.g., CSA agentic test suite, MAESTRO/AgentDojo/Promptfoo, or equivalent) and runs continuously, not only point-in-time.",
      "evidence": "Red-team methodology doc, continuous-run schedule.",
      "risk": "AGT-01 through AGT-15",
      "dependsOn": [
        "TEST-02",
        "TEST-03"
      ],
      "floor": false
    },
    {
      "id": "CHG-01",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Review risk expansion.",
      "pass": "New autonomy, tools, memory, RAG, output channels, models, prompts, A2A, compliance flows, or actuation paths rerun threat-model delta.",
      "evidence": "Change request.",
      "risk": "All",
      "dependsOn": [
        "ARCH-01",
        "GOV-05"
      ],
      "floor": false
    },
    {
      "id": "CHG-02",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Require rollback and monitoring review.",
      "pass": "Changes include rollback plan, affected red-team tests, logs, alerts, dashboards, and owner updates.",
      "evidence": "Change review.",
      "risk": "AGT-12, AGT-13, AGT-14",
      "dependsOn": [
        "OPS-01",
        "TEST-01"
      ],
      "floor": false
    },
    {
      "id": "CHG-03",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Enforce secure build gates.",
      "pass": "CI/CD fails the build on a failed capability audit, DAST, agent lint, missing memory sanitization, or red-team suite failure.",
      "evidence": "Build-gate config, pipeline logs.",
      "risk": "AGT-13, AGT-12",
      "dependsOn": [
        "TEST-01",
        "SUP-05"
      ],
      "floor": false
    },
    {
      "id": "CHG-04",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Roll out changes safely.",
      "pass": "New capabilities deploy via phased canary with baseline comparison and automatic rollback on negative deviation; build artifacts/images are signed and verified before deploy.",
      "evidence": "Canary/rollback config, signature verification.",
      "risk": "AGT-12, AGT-13",
      "dependsOn": [
        "OPS-03",
        "SUP-02"
      ],
      "floor": false
    },
    {
      "id": "IR-01",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Disable affected components.",
      "pass": "Agent, tool, connector, model, workflow, or environment can be disabled quickly.",
      "evidence": "Incident drill.",
      "risk": "AGT-13",
      "dependsOn": [
        "OPS-05"
      ],
      "floor": true
    },
    {
      "id": "IR-02",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Rotate credentials and quarantine state.",
      "pass": "Credentials are revoked/rotated and affected memory, RAG, documents, tool output, and A2A messages are quarantined.",
      "evidence": "Rotation and quarantine logs.",
      "risk": "AGT-03, AGT-05",
      "dependsOn": [
        "ID-04",
        "MEM-03"
      ],
      "floor": false
    },
    {
      "id": "IR-03",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Preserve evidence and determine blast radius.",
      "pass": "Prompts, context, tool calls, policies, approvals, outputs, logs, data, users, tenants, downstream systems, and physical effects are assessed.",
      "evidence": "Evidence bundle, incident timeline.",
      "risk": "All",
      "dependsOn": [
        "OPS-01",
        "OPS-02"
      ],
      "floor": true
    },
    {
      "id": "IR-04",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Feed lessons back.",
      "pass": "Threat model, controls, tests, monitoring, and runbooks are updated after the incident.",
      "evidence": "Post-incident review.",
      "risk": "All",
      "dependsOn": [
        "IR-03",
        "OPS-06"
      ],
      "floor": false
    },
    {
      "id": "DEC-01",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Register a deactivation playbook at deployment.",
      "pass": "The playbook lists systems, credentials, data stores, memory, connectors, A2A paths, evidence, and downstream dependencies.",
      "evidence": "Deactivation playbook.",
      "risk": "AGT-13",
      "dependsOn": [
        "GOV-05"
      ],
      "floor": false
    },
    {
      "id": "DEC-02",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Revoke credentials on retirement.",
      "pass": "Primary, derived, refresh, cached, and NHI credentials are revoked and verified inactive.",
      "evidence": "Revocation log.",
      "risk": "AGT-03, AGT-13",
      "dependsOn": [
        "ID-04",
        "DEC-01"
      ],
      "floor": true
    },
    {
      "id": "DEC-03",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Dispose of state and memory safely.",
      "pass": "State, memory, vector stores, RAG sources, and logs are deleted or archived according to retention and residency obligations.",
      "evidence": "Deletion/archival attestation.",
      "risk": "AGT-04, AGT-05",
      "dependsOn": [
        "DATA-01",
        "DEC-01"
      ],
      "floor": false
    },
    {
      "id": "DEC-04",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Write a tombstone record.",
      "pass": "Immutable record shows what was retired, when, why, by whom, and what evidence was retained.",
      "evidence": "Tombstone record.",
      "risk": "AGT-14",
      "dependsOn": [
        "GOV-05",
        "OPS-02"
      ],
      "floor": false
    },
    {
      "id": "DEC-05",
      "family": "Supply Chain, Testing, Change, and Decommissioning",
      "profile": "Core",
      "control": "Prevent orphaned and zombie execution.",
      "pass": "Retired or disabled agents cannot execute stale or queued tasks; orphaned-agent activity is detected and blocked.",
      "evidence": "Orphan-detection rules, decommission test.",
      "risk": "AGT-13",
      "dependsOn": [
        "OPS-05",
        "DEC-01"
      ],
      "floor": false
    }
  ]
};

// AGT risk model — SINGLE SOURCE OF TRUTH for the AGT-01..AGT-15 taxonomy.
// The reader builds its tooltip map and the HTML legend from this; `node build.js`
// regenerates the Section 4 crosswalk table and the Appendix D quick reference in
// docs/checklist.md from it. Keep AGT-01..AGT-15 in order; all four fields required
// (name, failure, owaspAgentic, owaspLlm). owaspAgentic/owaspLlm are free-text crosswalk
// strings (comma-separated tokens, or "Cross-cutting").
window.CHECKLIST.agt = {
  "AGT-01": { "name": "Goal and intent manipulation", "failure": "Attacker redirects goals, plans, or task selection.", "owaspAgentic": "T6", "owaspLlm": "LLM01, LLM06" },
  "AGT-02": { "name": "Tool misuse and unsafe agency", "failure": "Legitimate tools are chained into unsafe actions.", "owaspAgentic": "T2", "owaspLlm": "LLM06" },
  "AGT-03": { "name": "Identity and privilege compromise", "failure": "Agent abuses inherited, delegated, cached, or spoofed privileges.", "owaspAgentic": "T3, T9", "owaspLlm": "LLM06" },
  "AGT-04": { "name": "Sensitive disclosure and exfiltration", "failure": "Sensitive data leaks through output, tools, logs, memory, or external messages.", "owaspAgentic": "T2, T3, T13, T15", "owaspLlm": "LLM02" },
  "AGT-05": { "name": "Memory, RAG, vector, and context poisoning", "failure": "Attacker corrupts context, memory, embeddings, or stored knowledge.", "owaspAgentic": "T1", "owaspLlm": "LLM04, LLM08" },
  "AGT-06": { "name": "Insecure output handling", "failure": "Model output is used unsafely by HTML, SQL, shell, code, config, or workflow sinks.", "owaspAgentic": "T11", "owaspLlm": "LLM05" },
  "AGT-07": { "name": "Unexpected code execution / RCE", "failure": "Agent writes or executes unsafe code, commands, queries, or automation.", "owaspAgentic": "T11", "owaspLlm": "LLM05, LLM06" },
  "AGT-08": { "name": "Agent communication abuse", "failure": "Agent-to-agent channels spread spoofed identity, unsafe instructions, or protocol abuse.", "owaspAgentic": "T12, T14, T16", "owaspLlm": "LLM01, LLM06" },
  "AGT-09": { "name": "Cascading hallucination and misinformation", "failure": "Plausible false output propagates through tools, agents, memory, or human decisions.", "owaspAgentic": "T5", "owaspLlm": "LLM09" },
  "AGT-10": { "name": "Human oversight and trust exploitation", "failure": "Agent misleads, overwhelms, or manipulates human reviewers.", "owaspAgentic": "T10, T15", "owaspLlm": "LLM06, LLM09" },
  "AGT-11": { "name": "Resource overload and denial of wallet", "failure": "Agent consumes excessive tokens, tools, memory, compute, queues, or external services.", "owaspAgentic": "T4", "owaspLlm": "LLM10" },
  "AGT-12": { "name": "Supply chain compromise", "failure": "Models, prompts, tools, plugins, libraries, or connectors are compromised.", "owaspAgentic": "T17", "owaspLlm": "LLM03" },
  "AGT-13": { "name": "Rogue, misaligned, or deceptive agents", "failure": "Agent operates outside purpose, owner, policy, lifecycle, or monitoring.", "owaspAgentic": "T7, T13", "owaspLlm": "LLM06" },
  "AGT-14": { "name": "Repudiation and audit gaps", "failure": "Agent actions cannot be attributed, reconstructed, or verified.", "owaspAgentic": "T8", "owaspLlm": "Cross-cutting" },
  "AGT-15": { "name": "System prompt, secret, and policy leakage", "failure": "Hidden prompts, policies, secrets, credentials, or internal config leak.", "owaspAgentic": "T3, T9, T13", "owaspLlm": "LLM02, LLM07" }
};
