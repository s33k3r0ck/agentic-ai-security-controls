#!/usr/bin/env node
// Build step: regenerate the generated regions of docs/checklist.md from app/data.js.
// app/data.js is the single source of truth for control data. The HTML reader loads
// data.js directly (no build needed for it); this script keeps the Markdown's control
// tables (Section 8), dependency graph (Appendix E), and AGT risk-model tables
// (Section 4 crosswalk + Appendix D quick reference) in sync with that data.
//
// Before generating, it VALIDATES the data and aborts (non-zero exit, no file write)
// on any error: missing/mis-typed fields, duplicate ids, dependsOn that reference an
// unknown control, dependency cycles, pipe/newline/tab characters in string fields
// (which would silently corrupt the Markdown tables), malformed AGT entries, and risk
// tokens that don't resolve to a known AGT id. `validate` is exported so a pre-commit
// hook or CI can reuse it: require('./build.js').validate(controls, agt).
// Usage: node build.js
const fs = require('fs');
const path = require('path');

function loadControls() {
  global.window = {};
  require(path.join(__dirname, 'app', 'data.js'));
  return (window.CHECKLIST && window.CHECKLIST.controls) || [];
}

// Marker-delimited region replacement: rewrites the text between BEGIN and END.
function spliceMarked(md, begin, end, body) {
  const b = md.indexOf(begin);
  if (b < 0) throw new Error(begin + ' not found');
  const e = md.indexOf(end);
  if (e < 0) throw new Error(end + ' not found');
  if (e < b) throw new Error('END before BEGIN for ' + begin);
  return md.slice(0, b + begin.length) + '\n' + body.trimEnd() + '\n' + md.slice(e);
}

// Returns an array of human-readable error strings; empty array = data is clean.
function validate(C, agt, extra) {
  const errs = [];
  const FIELDS = [
    'id',
    'family',
    'profile',
    'control',
    'pass',
    'evidence',
    'risk',
    'dependsOn',
    'floor',
  ];
  const STR = ['id', 'family', 'profile', 'control', 'pass', 'evidence', 'risk'];
  const seen = Object.create(null);

  C.forEach((c, i) => {
    const where = (c && c.id) || 'control #' + i;
    FIELDS.forEach((f) => {
      if (!c || !(f in c)) errs.push(where + ': missing field "' + f + '"');
    });
    if (!c) return;
    STR.forEach((f) => {
      if (f in c && typeof c[f] !== 'string') {
        errs.push(where + ': field "' + f + '" must be a string');
        return;
      }
      if (typeof c[f] === 'string' && /[|\n\r\t]/.test(c[f]))
        errs.push(
          where +
            ': field "' +
            f +
            '" contains a pipe/newline/tab — would corrupt the Markdown table'
        );
    });
    if (!Array.isArray(c.dependsOn)) errs.push(where + ': "dependsOn" must be an array');
    if (typeof c.floor !== 'boolean') errs.push(where + ': "floor" must be a boolean (true/false)');
    if (c.id != null) {
      if (seen[c.id]) errs.push('duplicate id "' + c.id + '"');
      seen[c.id] = true;
    }
  });

  // dependsOn must reference existing controls (no dangling edges).
  const ids = new Set(C.map((c) => c && c.id));
  C.forEach((c) =>
    (c && Array.isArray(c.dependsOn) ? c.dependsOn : []).forEach((d) => {
      if (!ids.has(d)) errs.push(c.id + ': dependsOn references unknown control "' + d + '"');
    })
  );

  // The dependency graph must be acyclic (step-order relies on it). DFS, report the cycle path.
  const byId = {};
  C.forEach((c) => {
    if (c && c.id != null) byId[c.id] = c;
  });
  const state = {}; // 1 = on the current DFS stack, 2 = fully explored
  (function () {
    function dfs(id, path) {
      if (state[id] === 1) {
        errs.push('dependency cycle: ' + path.slice(path.indexOf(id)).concat(id).join(' -> '));
        return;
      }
      if (state[id] === 2) return;
      state[id] = 1;
      (Array.isArray(byId[id].dependsOn) ? byId[id].dependsOn : []).forEach((d) => {
        if (byId[d]) dfs(d, path.concat(id));
      });
      state[id] = 2;
    }
    C.forEach((c) => {
      if (c && c.id != null && state[c.id] == null) dfs(c.id, []);
    });
  })();

  // AGT risk model: entries well-formed, and every control's risk token resolves to a known AGT id.
  if (agt && Object.keys(agt).length) {
    const AF = ['name', 'failure', 'owaspAgentic', 'owaspLlm'];
    Object.keys(agt).forEach((k) =>
      AF.forEach((f) => {
        const v = agt[k] && agt[k][f];
        if (typeof v !== 'string' || !v) {
          errs.push('agt["' + k + '"]: missing/empty "' + f + '"');
          return;
        }
        if (/[|\n\r\t]/.test(v))
          errs.push(
            'agt["' +
              k +
              '"]: field "' +
              f +
              '" contains a pipe/newline/tab — would corrupt the Markdown table'
          );
      })
    );
    const known = new Set(Object.keys(agt));
    C.forEach((c) => {
      if (!c || typeof c.risk !== 'string') return;
      const r = c.risk.trim();
      if (r === 'All') return; // documented catch-all
      const range = r.match(/^(AGT-\d{2}) through (AGT-\d{2})$/);
      if (range) {
        // documented range catch-all — both endpoints must be real
        [range[1], range[2]].forEach((tok) => {
          if (!known.has(tok))
            errs.push((c.id || '?') + ': risk range endpoint "' + tok + '" is not a known AGT id');
        });
        return;
      }
      r.split(/,\s*/).forEach((tok) => {
        if (tok && !known.has(tok))
          errs.push((c.id || '?') + ': risk references unknown AGT id "' + tok + '"');
      });
    });
  }

  // External-framework mappings + source refs (optional; validated when build() passes them).
  if (extra) {
    const ATLAS_RE = /^AML\.T\d{4}(\.\d{3})?$/;
    const FW_KEYS = ['atlas'];
    const ctlIds = new Set(C.map((c) => c && c.id));
    const maps = extra.mappings || {};
    Object.keys(maps).forEach((id) => {
      if (!ctlIds.has(id)) errs.push('mappings: unknown control id "' + id + '"');
      const m = maps[id] || {};
      Object.keys(m).forEach((k) => {
        if (FW_KEYS.indexOf(k) < 0) {
          errs.push('mappings["' + id + '"]: unknown framework key "' + k + '"');
          return;
        }
        if (!Array.isArray(m[k])) {
          errs.push('mappings["' + id + '"].' + k + ' must be an array');
          return;
        }
        m[k].forEach((v) => {
          if (typeof v !== 'string' || !v)
            errs.push('mappings["' + id + '"].' + k + ': entries must be non-empty strings');
          else if (/[|\n\r\t]/.test(v))
            errs.push('mappings["' + id + '"].' + k + ' "' + v + '": pipe/newline/tab would corrupt the table');
          else if (k === 'atlas' && !ATLAS_RE.test(v))
            errs.push('mappings["' + id + '"].atlas: "' + v + '" is not a valid ATLAS id (AML.TXXXX[.XXX])');
        });
      });
    });
    // familySources: every control's ID-prefix must resolve, and every source ref must exist.
    const famSrc = extra.familySources || {};
    const srcs = extra.sources || {};
    C.forEach((c) => {
      if (!c || !c.id) return;
      const pfx = String(c.id).split('-')[0];
      if (!famSrc[pfx])
        errs.push('familySources: missing entry for ID-prefix "' + pfx + '" (control ' + c.id + ')');
    });
    Object.keys(famSrc).forEach((pfx) => {
      (Array.isArray(famSrc[pfx]) ? famSrc[pfx] : []).forEach((s) => {
        if (!srcs[s]) errs.push('familySources["' + pfx + '"]: unknown source ref "' + s + '"');
      });
    });
  }

  return Array.from(new Set(errs)); // de-dup (one cycle can be reached from several roots)
}

function build() {
  const C = loadControls();
  if (!C.length) {
    console.error('No controls found in app/data.js');
    process.exit(1);
  }
  const W = global.window.CHECKLIST || {};
  const agt = W.agt || {};
  const maps = W.mappings || {};
  const familySources = W.familySources || {};
  const sources = W.sources || {};

  const errs = validate(C, agt, { mappings: maps, familySources: familySources, sources: sources });
  if (errs.length) {
    console.error(
      'app/data.js failed validation (' +
        errs.length +
        ' issue' +
        (errs.length > 1 ? 's' : '') +
        ') — aborting, docs/checklist.md not written:'
    );
    errs.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }

  // Derive affects (inverse of dependsOn).
  const aff = {};
  C.forEach((c) =>
    (c.dependsOn || []).forEach((d) => {
      (aff[d] = aff[d] || []).push(c.id);
    })
  );
  C.forEach((c) => {
    c.affects = (aff[c.id] || []).slice().sort();
  });

  // --- Section 8 control tables (grouped by family, in data order) ---
  const fams = [];
  const byf = {};
  C.forEach((c) => {
    if (!byf[c.family]) {
      byf[c.family] = [];
      fams.push(c.family);
    }
    byf[c.family].push(c);
  });
  let controlsMd = '';
  fams.forEach((f, i) => {
    controlsMd += (i ? '\n' : '') + '### ' + f + '\n\n';
    controlsMd +=
      '| ID | Profile | Control | Pass criteria | Evidence | Risk |\n| --- | --- | --- | --- | --- | --- |\n';
    byf[f].forEach((c) => {
      controlsMd +=
        '| ' +
        c.id +
        ' | ' +
        c.profile +
        ' | ' +
        c.control +
        ' | ' +
        c.pass +
        ' | ' +
        c.evidence +
        ' | ' +
        c.risk +
        ' |\n';
    });
  });

  // --- Appendix E dependency graph ---
  const idx = {};
  C.forEach((c, i) => (idx[c.id] = i));
  const edges = C.reduce((n, c) => n + (c.dependsOn ? c.dependsOn.length : 0), 0);
  const roots = C.filter((c) => !c.dependsOn || !c.dependsOn.length).map((c) => c.id);
  const top = C.slice()
    .sort((a, b) => b.affects.length - a.affects.length || idx[a.id] - idx[b.id])
    .slice(0, 6)
    .map((c) => c.id + ' (' + c.affects.length + ')');
  let dg =
    'Relationships between controls. **Depends on** = prerequisite controls that must already be in place for this control to function or pass. **Affects** = the inverse — controls that rely on this one. The graph is acyclic (' +
    edges +
    ' dependency edges).\n\n';
  dg += '- **Foundational / do-first controls** (no dependencies): ' + roots.join(', ') + '.\n';
  dg +=
    '- **Most depended-on** (highest fan-out): ' +
    top.join(', ') +
    '. Treat these as the load-bearing baseline — failing one cascades widely.\n\n';
  dg += '| ID | Depends on | Affects |\n| --- | --- | --- |\n';
  C.forEach((c) => {
    const d = c.dependsOn && c.dependsOn.length ? c.dependsOn.join(', ') : '—';
    const a = c.affects && c.affects.length ? c.affects.join(', ') : '—';
    dg += '| ' + c.id + ' | ' + d + ' | ' + a + ' |\n';
  });

  // --- AGT risk model: Section 4 crosswalk + Appendix D quick reference (from agt) ---
  const agtIds = Object.keys(agt);
  let riskmodel =
    '| Local ID | Risk family | Failure mode | OWASP Agentic | OWASP LLM 2025 |\n| --- | --- | --- | --- | --- |\n';
  agtIds.forEach((k) => {
    const a = agt[k];
    riskmodel +=
      '| ' +
      k +
      ' | ' +
      a.name +
      ' | ' +
      a.failure +
      ' | ' +
      a.owaspAgentic +
      ' | ' +
      a.owaspLlm +
      ' |\n';
  });
  let riskref = '| ID | Risk family |\n| --- | --- |\n';
  agtIds.forEach((k) => {
    riskref += '| ' + k + ' | ' + agt[k].name + ' |\n';
  });

  // --- Appendix F framework crosswalk (per-control; OWASP derived, MITRE ATLAS grounded) ---
  function deriveOwasp(risk) {
    const r = (risk || '').trim();
    if (r === 'All' || /^AGT-\d{2} through AGT-\d{2}$/.test(r))
      return { agentic: 'All (T1-T17)', llm: 'All (LLM01-LLM10)' };
    const ag = new Set(),
      lm = new Set();
    r.split(/,\s*/)
      .filter(Boolean)
      .forEach((id) => {
        const a = agt[id];
        if (!a) return;
        a.owaspAgentic.split(/,\s*/).forEach((t) => t && ag.add(t));
        a.owaspLlm.split(/,\s*/).forEach((t) => t && lm.add(t));
      });
    const ord = (set) =>
      Array.from(set).sort(
        (x, y) => parseInt(x.replace(/\D/g, '') || '0', 10) - parseInt(y.replace(/\D/g, '') || '0', 10)
      );
    return { agentic: ord(ag).join(', ') || '—', llm: ord(lm).join(', ') || '—' };
  }
  const cell = (a) => (Array.isArray(a) && a.length ? a.join(', ') : '—');
  let crosswalk =
    '| ID | OWASP Agentic | OWASP LLM | MITRE ATLAS |\n| --- | --- | --- | --- |\n';
  C.forEach((c) => {
    const ow = deriveOwasp(c.risk);
    const m = maps[c.id] || {};
    crosswalk += '| ' + c.id + ' | ' + ow.agentic + ' | ' + ow.llm + ' | ' + cell(m.atlas) + ' |\n';
  });

  // --- Splice into docs/checklist.md between region boundaries ---
  const P = path.join(__dirname, 'docs', 'checklist.md');
  let md = fs.readFileSync(P, 'utf8');
  const B1 = '<!-- BEGIN GENERATED:controls — edit app/data.js, then run: node build.js -->';
  const E1 = '<!-- END GENERATED:controls -->';
  const B2 = '<!-- BEGIN GENERATED:depgraph — edit app/data.js, then run: node build.js -->';
  const E2 = '<!-- END GENERATED:depgraph -->';

  // Region 1: from after the §8 note paragraph to just before "## 9.".
  const note = 'some prompt-injection rows apply only when RAG or memory is present.\n';
  const g9 = '\n## 9. Waivers and Severity';
  let i1 = md.indexOf(note);
  if (i1 < 0) throw new Error('Section 8 note anchor not found');
  i1 += note.length;
  const i9 = md.indexOf(g9);
  if (i9 < 0) throw new Error('"## 9." anchor not found');
  md =
    md.slice(0, i1) + '\n' + B1 + '\n\n' + controlsMd.trimEnd() + '\n\n' + E1 + '\n' + md.slice(i9);

  // Region 2: regenerate the depgraph block in place, preserving anything after the END
  // marker (e.g. Appendix F) instead of truncating to EOF.
  const eHead = '## Appendix E. Control Dependency Graph\n';
  let ie = md.indexOf(eHead);
  if (ie < 0) throw new Error('Appendix E heading not found');
  ie += eHead.length;
  const e2i = md.indexOf(E2);
  if (e2i < 0) throw new Error(E2 + ' not found');
  const afterE2 = md.slice(e2i + E2.length); // content after the depgraph block (Appendix F, etc.)
  md = md.slice(0, ie) + '\n' + B2 + '\n\n' + dg.trimEnd() + '\n\n' + E2 + afterE2;

  // Regions 3 & 4: AGT risk-model tables, delimited by explicit BEGIN/END markers.
  md = spliceMarked(
    md,
    '<!-- BEGIN GENERATED:riskmodel — edit app/data.js, then run: node build.js -->',
    '<!-- END GENERATED:riskmodel -->',
    riskmodel
  );
  md = spliceMarked(
    md,
    '<!-- BEGIN GENERATED:riskref — edit app/data.js, then run: node build.js -->',
    '<!-- END GENERATED:riskref -->',
    riskref
  );
  md = spliceMarked(
    md,
    '<!-- BEGIN GENERATED:crosswalk — edit app/data.js, then run: node build.js -->',
    '<!-- END GENERATED:crosswalk -->',
    crosswalk
  );

  fs.writeFileSync(P, md);
  console.log(
    'Validated and regenerated docs/checklist.md from app/data.js (' +
      C.length +
      ' controls, ' +
      edges +
      ' dependency edges, ' +
      agtIds.length +
      ' AGT risks, ' +
      Object.keys(maps).length +
      ' ATLAS-mapped controls).'
  );
}

module.exports = { validate, loadControls, build };
if (require.main === module) build();
