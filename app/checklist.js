// checklist.js — reader logic for the offline checklist viewer.
// Reads window.CHECKLIST (from data.js), renders the control list, and handles
// profile filtering, search, floor-only, family vs topological "step order"
// grouping, row expansion, and click-to-mark status. All UI state is in-memory
// only (lost on refresh — no localStorage/backend). `affects` and the topological
// `level` (step order) are derived here from each control's `dependsOn`.
// AGT (id->name) is built at load from window.CHECKLIST.agt (data.js, single source);
// the in-page legend grid (#agtlegend) is rendered from it too. PROFW = profile tooltips.
// The Excel export is self-contained too: it builds a minimal XLSX OpenXML ZIP
// in the browser, with no network, backend, CDN, or npm dependency.
// See app/README.md.
var AGT = {};
var PROFW = {
  Core: 'Every agentic system with consequential output, untrusted input, or planning.',
  'Tool-Using': 'The agent calls tools, APIs, functions, MCP servers, or workflows.',
  'Tool-Using (Code Exec)':
    'Tool-using and can execute code, queries, shell, browser automation, or templates.',
  'RAG / Memory': 'Retrieves from documents/web/vector stores, or uses persistent/shared memory.',
  'Multi-Agent': 'Uses subagents, delegation, agent-to-agent messages, MCP/A2A, or orchestration.',
  Regulated: 'Has legal, contractual, residency, retention, or attestation obligations.',
  'Cyber-Physical':
    'Can actuate, gate, or override physical, OT/ICS, robotics, medical, or vehicle systems.',
};
var IC = {
  down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  right:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  note: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H7l-3 3z"/></svg>',
};
(function () {
  var C = (window.CHECKLIST && window.CHECKLIST.controls) || [];
  if (!C.length) {
    var w = document.getElementById('cll');
    if (w)
      w.innerHTML =
        '<p class="mut">No data loaded. Ensure data.js is present next to this page.</p>';
    return;
  }
  // derive affects (inverse of dependsOn) so data.js only needs dependsOn
  var _aff = {};
  C.forEach(function (c) {
    (c.dependsOn || []).forEach(function (d) {
      (_aff[d] = _aff[d] || []).push(c.id);
    });
  });
  C.forEach(function (c) {
    c.affects = (_aff[c.id] || []).slice().sort();
  });
  var GROUPS = ['Core', 'Tool-Using', 'RAG / Memory', 'Multi-Agent', 'Regulated', 'Cyber-Physical'];
  function pg(p) {
    return p.indexOf('Tool-Using') === 0 ? 'Tool-Using' : p;
  }
  var active = {};
  GROUPS.forEach(function (g) {
    active[g] = true;
  });
  var chipBtns = {};
  var q = '',
    floorOnly = false,
    mode = 'dep',
    status = Object.create(null),
    notes = Object.create(null),
    dirty = false,
    expanded = {},
    famCol = {},
    lastExport = ''; // mode defaults to 'dep' = Step order (implementation order)
  var STATES = ['', 'Pass', 'Fail', 'Partial', 'N/A']; // the clickable cycle (Accepted Risk is set out-of-band, not by click)
  var stCls = {
    Pass: 'pass',
    Fail: 'fail',
    Partial: 'partial',
    'N/A': 'na',
    'Accepted Risk': 'ar',
  };
  // Statuses accepted on Load (the documented 5-status model); maps each to its stored form
  // ("Not Applicable" normalizes to the reader's "N/A"). Anything else is an invalid status.
  var LOADST = {
    Pass: 'Pass',
    Fail: 'Fail',
    Partial: 'Partial',
    'N/A': 'N/A',
    'Not Applicable': 'N/A',
    'Accepted Risk': 'Accepted Risk',
  };
  var gc = {},
    ctrlText = {},
    byId = Object.create(null),
    idx = Object.create(null);
  GROUPS.forEach(function (g) {
    gc[g] = 0;
  });
  C.forEach(function (c, i) {
    gc[pg(c.profile)]++;
    ctrlText[c.id] = c.control;
    byId[c.id] = c;
    idx[c.id] = i;
  });
  var level = {};
  function lvl(id) {
    if (level[id] != null) return level[id];
    level[id] = 0;
    var c = byId[id];
    var ds = (c && c.dependsOn) || [];
    var m = 0;
    ds.forEach(function (d) {
      if (byId[d] && d !== id) m = Math.max(m, lvl(d) + 1);
    });
    level[id] = m;
    return m;
  }
  C.forEach(function (c) {
    lvl(c.id);
  });
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  }
  // Single-source the AGT risk model: build the tooltip map + the in-page legend from data.js.
  var AGTD = (window.CHECKLIST && window.CHECKLIST.agt) || {};
  Object.keys(AGTD).forEach(function (k) {
    AGT[k] = AGTD[k].name;
  });
  var _ael = document.getElementById('agtlegend');
  if (_ael)
    _ael.innerHTML = Object.keys(AGTD)
      .map(function (k) {
        return '<span><b>' + esc(k) + '</b> ' + esc(AGTD[k].name) + '</span>';
      })
      .join('');
  function agtTitle(s) {
    return s
      .split(/,\s*/)
      .map(function (x) {
        x = x.trim();
        return AGT[x] ? x + ' — ' + AGT[x] : x;
      })
      .join('\n');
  }
  function relChips(arr) {
    return arr
      .map(function (t) {
        return (
          '<a class="lnk" data-jump="' +
          t +
          '" title="' +
          esc(ctrlText[t] || '') +
          '">' +
          t +
          '</a>'
        );
      })
      .join('');
  }
  var chipsEl = document.getElementById('clchips');
  GROUPS.forEach(function (g) {
    var b = document.createElement('button');
    b.className = 'chip on';
    b.title = PROFW[g] || '';
    b.innerHTML = esc(g) + ' <span class="n">' + gc[g] + '</span>';
    b.onclick = function () {
      active[g] = !active[g];
      b.classList.toggle('on');
      render();
    };
    chipBtns[g] = b;
    chipsEl.appendChild(b);
  });
  var fb = document.createElement('button');
  fb.className = 'chip';
  fb.title = 'Non-Waivable Release Floor — must Pass before launch; cannot be Accepted Risk';
  fb.innerHTML =
    IC.lock +
    ' Floor only <span class="n">' +
    C.filter(function (c) {
      return c.floor;
    }).length +
    '</span>';
  fb.onclick = function () {
    floorOnly = !floorOnly;
    fb.classList.toggle('on');
    render();
  };
  chipsEl.appendChild(fb);
  var qi = document.getElementById('clq');
  qi.oninput = function () {
    q = qi.value.toLowerCase();
    render();
  };
  var ob = document.getElementById('clo');
  if (mode === 'dep') ob.classList.add('on');
  ob.onclick = function () {
    mode = mode === 'fam' ? 'dep' : 'fam';
    ob.classList.toggle('on');
    famCol = {};
    render();
  };
  document.getElementById('clx').onclick = function () {
    vis().forEach(function (c) {
      expanded[c.id] = true;
    });
    render();
  };
  document.getElementById('clc').onclick = function () {
    expanded = {};
    render();
  };
  document.getElementById('clxl').onclick = function () {
    downloadExcel();
  };
  function vis() {
    return C.filter(function (c) {
      return (
        active[pg(c.profile)] &&
        (!floorOnly || c.floor) &&
        (!q ||
          (c.id + ' ' + c.control + ' ' + c.pass + ' ' + c.evidence).toLowerCase().indexOf(q) >= 0)
      );
    });
  }
  function grpKey(c) {
    return mode === 'dep' ? 'Step ' + (level[c.id] + 1) : c.family;
  }
  function jump(t) {
    var c = byId[t];
    if (!c) return;
    var g = pg(c.profile);
    if (!active[g]) {
      active[g] = true;
      if (chipBtns[g]) chipBtns[g].classList.add('on');
    }
    if (floorOnly && !c.floor) {
      floorOnly = false;
      fb.classList.remove('on');
    }
    if (q) {
      q = '';
      qi.value = '';
    }
    expanded[t] = true;
    famCol[grpKey(c)] = false;
    render();
    var el = document.getElementById('row-' + t);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.add('hl');
      setTimeout(function () {
        el.classList.remove('hl');
      }, 1400);
    }
  }
  function rowHtml(c) {
    var st = status[c.id] || '',
      ex = expanded[c.id];
    var h =
      '<div class="row" id="row-' +
      esc(c.id) +
      '"><div class="rh" data-id="' +
      c.id +
      '">' +
      '<span class="st' +
      (stCls[st] ? ' ' + stCls[st] : '') +
      '"' +
      (st === 'Accepted Risk'
        ? ' title="Accepted Risk — time-bound waiver; set via a loaded file, not by clicking"'
        : '') +
      ' data-st="' +
      c.id +
      '">' +
      esc(st || 'set') +
      '</span>' +
      '<span class="id">' +
      c.id +
      '</span><span class="ct">' +
      esc(c.control) +
      '</span>' +
      (c.floor
        ? '<span class="fl" title="Non-Waivable Release Floor — must Pass before launch; cannot be Accepted Risk">floor</span>'
        : '') +
      (notes[c.id]
        ? '<span class="nt" title="Has a note — open the control to view or edit it">' +
          IC.note +
          '</span>'
        : '') +
      '<span class="pp" title="' +
      esc(PROFW[c.profile] || '') +
      '">' +
      esc(c.profile) +
      '</span>' +
      '<span class="chev">' +
      (ex ? IC.down : IC.right) +
      '</span></div>';
    if (ex) {
      var d =
        '<div class="dt"><b>Pass:</b> ' +
        esc(c.pass) +
        '<br><b>Evidence:</b> ' +
        esc(c.evidence) +
        ' &nbsp;&middot;&nbsp; <span class="agt" title="' +
        esc(agtTitle(c.risk)) +
        '">' +
        esc(c.risk) +
        '</span>';
      if (c.dependsOn && c.dependsOn.length) d += '<br><b>Depends on:</b> ' + relChips(c.dependsOn);
      if (c.affects && c.affects.length) d += '<br><b>Affects:</b> ' + relChips(c.affects);
      d +=
        '<div class="ne"><label for="note-' +
        esc(c.id) +
        '">Note / evidence reference</label>' +
        '<textarea class="note" id="note-' +
        esc(c.id) +
        '" data-note="' +
        esc(c.id) +
        '" placeholder="Add a note, evidence link, or waiver reference…">' +
        esc(notes[c.id] || '') +
        '</textarea></div>';
      d += '</div>';
      h += d;
    }
    return h + '</div>';
  }
  function exportControls() {
    var list = vis().slice();
    if (mode === 'dep')
      list.sort(function (a, b) {
        return level[a.id] - level[b.id] || idx[a.id] - idx[b.id];
      });
    return list;
  }
  function xmlText(v) {
    return String(v == null ? '' : v)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/[&<>]/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m];
      });
  }
  function colName(n) {
    var s = '';
    while (n > 0) {
      var m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
  function cellXml(r, c, v, style) {
    var ref = colName(c) + r,
      st = style ? ' s="' + style + '"' : '';
    if (typeof v === 'number') return '<c r="' + ref + '"' + st + '><v>' + v + '</v></c>';
    if (v == null || v === '') return '<c r="' + ref + '"' + st + '/>';
    return (
      '<c r="' +
      ref +
      '"' +
      st +
      ' t="inlineStr"><is><t xml:space="preserve">' +
      xmlText(v) +
      '</t></is></c>'
    );
  }
  function rowXml(r, vals, styles, height) {
    var h = '<row r="' + r + '"' + (height ? ' ht="' + height + '" customHeight="1"' : '') + '>';
    for (var i = 0; i < vals.length; i++) h += cellXml(r, i + 1, vals[i], styles[i] || 0);
    return h + '</row>';
  }
  function dateStamp() {
    var d = new Date(),
      p = function (n) {
        return (n < 10 ? '0' : '') + n;
      };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function statusStyle(st) {
    return { Pass: 6, Fail: 7, Partial: 8, 'N/A': 9, 'Accepted Risk': 11 }[st] || 0;
  }
  function bodyStyle(c, col) {
    var st = status[c.id] || '',
      nt = notes[c.id] || '';
    if (col === 1) return statusStyle(st) || (c.floor ? 4 : 2);
    if (col === 2) return nt ? 5 : c.floor ? 4 : 2;
    if (c.floor) return 4;
    if (st || nt) return 5;
    if (col === 0) return 10;
    if (col === 7) return 3;
    return 2;
  }
  function stylesXml() {
    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="8"><font><sz val="11"/><color rgb="FF1B1B19"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFA32D2D"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF0F6E56"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFA32D2D"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF854F0B"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FF5F5E5A"/><name val="Calibri"/></font><font><sz val="10"/><color rgb="FF185FA5"/><name val="Consolas"/></font></fonts>' +
      '<fills count="11"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F2937"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFCEBEB"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6F1FB"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE1F5EE"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFCEBEB"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFAEEDA"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFECEAE3"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3F6FB"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6F1FB"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9DCE3"/></left><right style="thin"><color rgb="FFD9DCE3"/></right><top style="thin"><color rgb="FFD9DCE3"/></top><bottom style="thin"><color rgb="FFD9DCE3"/></bottom><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="12"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="9" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="4" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="5" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="6" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="7" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf><xf numFmtId="0" fontId="7" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '<dxfs count="5"><dxf><font><b/><color rgb="FF0F6E56"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFE1F5EE"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><font><b/><color rgb="FFA32D2D"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFFCEBEB"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><font><b/><color rgb="FF854F0B"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFFAEEDA"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><font><color rgb="FF5F5E5A"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFECEAE3"/><bgColor indexed="64"/></patternFill></fill></dxf><dxf><font><b/><color rgb="FF185FA5"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFE6F1FB"/><bgColor indexed="64"/></patternFill></fill></dxf></dxfs>' +
      '<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>'
    );
  }
  function sheetXml(rows) {
    var headers = [
      'ID',
      'Status',
      'Note / evidence reference',
      'Floor',
      'Step',
      'Family',
      'Profile',
      'Control',
      'Pass criteria',
      'Evidence',
      'Risk',
      'Depends on',
      'Affects',
    ];
    var lastRow = Math.max(1, rows.length + 1),
      lastCol = headers.length,
      ref = 'A1:' + colName(lastCol) + lastRow;
    var widths = [12, 16, 38, 9, 7, 28, 22, 44, 56, 42, 24, 26, 30];
    var cols =
      '<cols>' +
      widths
        .map(function (w, i) {
          return (
            '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'
          );
        })
        .join('') +
      '</cols>';
    var h = rowXml(
      1,
      headers,
      headers.map(function () {
        return 1;
      }),
      22
    );
    rows.forEach(function (c, i) {
      var vals = [
        c.id,
        status[c.id] || '',
        notes[c.id] || '',
        c.floor ? 'Yes' : '',
        level[c.id] + 1,
        c.family,
        c.profile,
        c.control,
        c.pass,
        c.evidence,
        c.risk,
        (c.dependsOn || []).join(', '),
        (c.affects || []).join(', '),
      ];
      h += rowXml(
        i + 2,
        vals,
        vals.map(function (_, col) {
          return bodyStyle(c, col);
        })
      );
    });
    var cf = '',
      dv = '';
    if (rows.length) {
      var sr = 'B2:B' + lastRow;
      cf =
        '<conditionalFormatting sqref="' +
        sr +
        '"><cfRule type="cellIs" dxfId="0" priority="1" operator="equal"><formula>"Pass"</formula></cfRule><cfRule type="cellIs" dxfId="1" priority="2" operator="equal"><formula>"Fail"</formula></cfRule><cfRule type="cellIs" dxfId="2" priority="3" operator="equal"><formula>"Partial"</formula></cfRule><cfRule type="cellIs" dxfId="3" priority="4" operator="equal"><formula>"N/A"</formula></cfRule><cfRule type="cellIs" dxfId="4" priority="5" operator="equal"><formula>"Accepted Risk"</formula></cfRule></conditionalFormatting>';
      dv =
        '<dataValidations count="1"><dataValidation type="list" allowBlank="1" showDropDown="0" sqref="' +
        sr +
        '"><formula1>"Pass,Fail,Partial,N/A,Accepted Risk"</formula1></dataValidation></dataValidations>';
    }
    return (
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr><dimension ref="' +
      ref +
      '"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>' +
      cols +
      '<sheetData>' +
      h +
      '</sheetData><autoFilter ref="' +
      ref +
      '"/>' +
      cf +
      dv +
      '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>'
    );
  }
  var CRCT = null;
  function crc32(bytes) {
    if (!CRCT) {
      CRCT = [];
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        CRCT[n] = c >>> 0;
      }
    }
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) crc = CRCT[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function u16(n) {
    return new Uint8Array([n & 255, (n >>> 8) & 255]);
  }
  function u32(n) {
    return new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]);
  }
  function concat(parts) {
    var len = 0;
    parts.forEach(function (p) {
      len += p.length;
    });
    var out = new Uint8Array(len),
      o = 0;
    parts.forEach(function (p) {
      out.set(p, o);
      o += p.length;
    });
    return out;
  }
  function utf8(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    var t = unescape(encodeURIComponent(s)),
      out = new Uint8Array(t.length);
    for (var i = 0; i < t.length; i++) out[i] = t.charCodeAt(i);
    return out;
  }
  function zip(files) {
    var locals = [],
      centrals = [],
      offset = 0,
      now = new Date();
    var time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    var date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    files.forEach(function (f) {
      var name = utf8(f.name),
        data = utf8(f.data),
        crc = crc32(data);
      var local = concat([
        u32(0x04034b50),
        u16(20),
        u16(0),
        u16(0),
        u16(time),
        u16(date),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        name,
        data,
      ]);
      var central = concat([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(time),
        u16(date),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name,
      ]);
      locals.push(local);
      centrals.push(central);
      offset += local.length;
    });
    var cstart = offset,
      csize = centrals.reduce(function (n, p) {
        return n + p.length;
      }, 0);
    return concat(
      locals.concat(centrals, [
        concat([
          u32(0x06054b50),
          u16(0),
          u16(0),
          u16(files.length),
          u16(files.length),
          u32(csize),
          u32(cstart),
          u16(0),
        ]),
      ])
    );
  }
  function downloadExcel() {
    var rows = exportControls(),
      created = new Date().toISOString();
    if (typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
      lastExport = 'Excel export unavailable in this browser';
      render();
      return;
    }
    var files = [
      {
        name: '[Content_Types].xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      },
      {
        name: '_rels/.rels',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
      },
      {
        name: 'docProps/app.xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Agentic AI Security Controls</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Checklist</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>',
      },
      {
        name: 'docProps/core.xml',
        data:
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Agentic AI Security Controls Export</dc:title><dc:creator>Agentic AI Security Controls</dc:creator><cp:lastModifiedBy>Agentic AI Security Controls</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">' +
          xmlText(created) +
          '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' +
          xmlText(created) +
          '</dcterms:modified></cp:coreProperties>',
      },
      {
        name: 'xl/workbook.xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl" lastEdited="6" lowestEdited="6" rupBuild="14420"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="16000"/></bookViews><sheets><sheet name="Checklist" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="0"/></workbook>',
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      },
      { name: 'xl/styles.xml', data: stylesXml() },
      { name: 'xl/worksheets/sheet1.xml', data: sheetXml(rows) },
    ];
    var blob = new Blob([zip(files)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    var a = document.createElement('a'),
      url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'agentic-ai-security-controls-' + dateStamp() + '.xlsx';
    document.body.appendChild(a);
    a.click();
    lastExport = 'exported ' + rows.length + ' controls to Excel';
    render();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1000);
  }
  function render() {
    var list = vis(),
      groups = [];
    if (mode === 'dep') {
      var maxL = 0;
      list.forEach(function (c) {
        if (level[c.id] > maxL) maxL = level[c.id];
      });
      for (var L = 0; L <= maxL; L++) {
        var rows = list.filter(function (c) {
          return level[c.id] === L;
        });
        if (rows.length)
          groups.push({
            key: 'Step ' + (L + 1),
            label:
              'Step ' +
              (L + 1) +
              (L === 0 ? ' · start here (no prerequisites)' : ' · after step ' + L),
            rows: rows,
          });
      }
    } else {
      var byf = {};
      list.forEach(function (c) {
        if (!byf[c.family]) {
          byf[c.family] = [];
          groups.push({ key: c.family, label: c.family, rows: byf[c.family] });
        }
        byf[c.family].push(c);
      });
    }
    var h = '';
    groups.forEach(function (grp) {
      var col = famCol[grp.key];
      h +=
        '<div class="fam" data-f="' +
        esc(grp.key) +
        '"><h3>' +
        esc(grp.label) +
        '</h3><span class="mut">' +
        grp.rows.length +
        ' ' +
        (col ? IC.right : IC.down) +
        '</span></div>';
      if (!col)
        grp.rows.forEach(function (c) {
          h += rowHtml(c);
        });
    });
    document.getElementById('cll').innerHTML = h || '<p class="mut">No controls match.</p>';
    updateStat(list);
  }
  function updateStat(list) {
    list = list || vis();
    var fl = list.filter(function (c) {
      return c.floor;
    }).length;
    var marked = Object.keys(status).filter(function (k) {
      return status[k];
    }).length;
    var nc = Object.keys(notes).filter(function (k) {
      return notes[k];
    }).length;
    document.getElementById('clst').textContent =
      'Showing ' +
      list.length +
      ' of ' +
      C.length +
      ' controls · ' +
      fl +
      ' non-waivable' +
      (marked ? ' · ' + marked + ' marked' : '') +
      (nc ? ' · ' + nc + ' note' + (nc === 1 ? '' : 's') : '') +
      (mode === 'dep' ? ' · step order' : '') +
      (dirty ? ' · ● unsaved' : '') +
      (lastExport ? ' · ' + lastExport : '');
  }
  document.getElementById('cll').addEventListener('click', function (e) {
    var lk = e.target.closest('.lnk');
    if (lk) {
      e.stopPropagation();
      jump(lk.getAttribute('data-jump'));
      return;
    }
    var st = e.target.closest('.st');
    if (st) {
      if (st.classList.contains('ar')) return; // Accepted Risk is a deliberate waiver: set via a loaded file, not by click
      var id = st.getAttribute('data-st'),
        ns = STATES[(STATES.indexOf(status[id] || '') + 1) % STATES.length];
      if (ns) status[id] = ns;
      else delete status[id];
      dirty = true;
      render();
      return;
    }
    var rh = e.target.closest('.rh');
    if (rh) {
      var i2 = rh.getAttribute('data-id');
      expanded[i2] = !expanded[i2];
      render();
      return;
    }
    var fa = e.target.closest('.fam');
    if (fa) {
      var f2 = fa.getAttribute('data-f');
      famCol[f2] = !famCol[f2];
      render();
      return;
    }
  });
  // --- Fill-in notes + Save/Load assessment (JSON file). Notes/statuses live only
  // in this tab; nothing is persisted automatically — the JSON file is the record. ---
  var msgEl = document.getElementById('clmsg'),
    msgT;
  function flash(m, err) {
    if (!msgEl) return;
    msgEl.textContent = m;
    msgEl.className = 'msg' + (err ? ' err' : '');
    if (msgT) clearTimeout(msgT);
    msgT = setTimeout(function () {
      msgEl.textContent = '';
      msgEl.className = 'msg';
    }, 6000);
  }
  // Add/remove the header "has a note" badge for one row in place — used so note typing
  // can keep the badge correct without a full render() (which would steal textarea focus).
  function noteBadge(id, has) {
    var row = document.getElementById('row-' + id);
    var rh = row && row.querySelector('.rh');
    if (!rh) return;
    var b = rh.querySelector('.nt');
    if (has) {
      if (!b) {
        b = document.createElement('span');
        b.className = 'nt';
        b.title = 'Has a note — open the control to view or edit it';
        b.innerHTML = IC.note;
        rh.insertBefore(b, rh.querySelector('.pp'));
      }
    } else if (b) b.parentNode.removeChild(b);
  }
  // Live-update a note without re-rendering, so the textarea keeps focus/caret while typing.
  document.getElementById('cll').addEventListener('input', function (e) {
    var ta = e.target.closest('.note');
    if (!ta) return;
    var id = ta.getAttribute('data-note'),
      v = ta.value,
      prev = notes[id] || '';
    if (v === prev) return;
    if (v) notes[id] = v;
    else delete notes[id];
    if (!!v !== !!prev) noteBadge(id, !!v);
    dirty = true;
    updateStat();
  });
  // Serialize only filled-in controls, ordered by data order (orphans last) for a stable diff.
  function buildAssessment() {
    var ids = Object.create(null),
      entries = Object.create(null);
    Object.keys(status).forEach(function (k) {
      if (status[k]) ids[k] = 1;
    });
    Object.keys(notes).forEach(function (k) {
      if (notes[k]) ids[k] = 1;
    });
    Object.keys(ids)
      .sort(function (a, b) {
        return (idx[a] == null ? 1e9 : idx[a]) - (idx[b] == null ? 1e9 : idx[b]);
      })
      .forEach(function (k) {
        var e = {};
        if (status[k]) e.status = status[k];
        if (notes[k]) e.note = notes[k];
        entries[k] = e;
      });
    return {
      schema: 'agentic-ai-security-controls-assessment',
      version: 1,
      checklist: 'Canonical v1.0',
      savedAt: new Date().toISOString(),
      count: Object.keys(entries).length,
      entries: entries,
    };
  }
  var sb = document.getElementById('clsave');
  if (sb)
    sb.onclick = function () {
      var data = buildAssessment();
      if (
        !data.count &&
        !confirm('Nothing is filled in yet. Save an empty assessment file anyway?')
      )
        return;
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = 'agentic-ai-security-controls-assessment-' + data.savedAt.slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 2000);
      dirty = false;
      updateStat();
      flash(
        'Saved ' +
          data.count +
          ' entr' +
          (data.count === 1 ? 'y' : 'ies') +
          ' to ' +
          a.download +
          '.'
      );
    };
  var fi = document.getElementById('clfile'),
    lb = document.getElementById('clload');
  if (lb && fi) {
    lb.onclick = function () {
      fi.value = '';
      fi.click();
    };
    fi.onchange = function () {
      var f = fi.files && fi.files[0];
      if (!f) return;
      if (
        dirty &&
        !confirm(
          'Loading a file replaces the current statuses and notes, which are unsaved. Continue?'
        )
      )
        return;
      var r = new FileReader();
      r.onerror = function () {
        flash('Could not read the file' + (r.error ? ': ' + r.error.name : '') + '.', true);
      };
      r.onload = function () {
        var obj;
        try {
          obj = JSON.parse(r.result);
        } catch (err) {
          flash('Could not read JSON: ' + err.message, true);
          return;
        }
        var isMap = function (o) {
          return o && typeof o === 'object' && !Array.isArray(o);
        };
        var entries =
          obj && isMap(obj.entries) ? obj.entries : isMap(obj) && !obj.schema ? obj : null;
        if (!entries) {
          flash('Not a valid assessment file (no "entries").', true);
          return;
        }
        var ns = Object.create(null),
          nn = Object.create(null),
          matched = 0,
          orphan = 0,
          floorAr = 0,
          bad = 0;
        Object.keys(entries).forEach(function (k) {
          var e = entries[k];
          if (!e || typeof e !== 'object' || Array.isArray(e)) return;
          var s = e.status == null ? '' : String(e.status),
            cs;
          if (s) {
            cs = LOADST[s];
            if (typeof cs === 'string') s = cs;
            else {
              bad++;
              s = '';
            }
          } // accept the documented vocabulary; drop the rest
          if (s === 'Accepted Risk' && byId[k] && byId[k].floor) {
            floorAr++;
            s = ''; // hard-floor rule: floor controls cannot be Accepted Risk (note kept)
          }
          var nt = e.note == null ? '' : String(e.note);
          if (s) ns[k] = s;
          if (nt) nn[k] = nt;
          if (s || nt) {
            if (byId[k]) matched++;
            else orphan++;
          }
        });
        status = ns;
        notes = nn;
        dirty = false;
        render();
        flash(
          'Loaded ' +
            matched +
            ' control' +
            (matched === 1 ? '' : 's') +
            (orphan ? ' · ' + orphan + ' for unknown IDs (kept)' : '') +
            (floorAr ? ' · ' + floorAr + ' Accepted Risk on floor (dropped)' : '') +
            (bad ? ' · ' + bad + ' invalid status ignored' : '') +
            '.'
        );
      };
      r.readAsText(f);
    };
  }
  var cb = document.getElementById('clclear');
  if (cb)
    cb.onclick = function () {
      if (!Object.keys(status).length && !Object.keys(notes).length) {
        flash('Nothing to clear.');
        return;
      }
      if (
        !confirm(
          'Clear all statuses and notes? Save first if you want to keep them — this cannot be undone.'
        )
      )
        return;
      status = Object.create(null);
      notes = Object.create(null);
      dirty = true;
      render();
      flash('Cleared all statuses and notes.');
    };
  window.addEventListener('beforeunload', function (e) {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  render();
})();
