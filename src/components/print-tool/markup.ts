// Static markup for the print tool. public/print-tool/tool.js finds every element here by id,
// data-* attribute or class, so keep those names when restyling.
const ic = (d: string) =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const I = {
  scan: ic('<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>'),
  undo: ic('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  redo: ic('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>'),
  eye: ic('<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'),
  print: ic('<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
  spark: ic('<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>'),
  clip: ic('<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'),
  left: ic('<path d="m15 18-6-6 6-6"/>'),
  right: ic('<path d="m9 18 6-6-6-6"/>'),
  plus: ic('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  trash: ic('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  copy: ic('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>'),
  x: ic('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};

export const TOOL_MARKUP = `
<style id="pst"></style>
<header class="topbar">
 <div class="brand"><span class="brand-mark">${I.scan}</span><div class="brand-txt"><h1>CNIC &amp; Photo Print</h1><p>Scan · Layout · Print</p></div></div>
 <nav class="seg" aria-label="Layout mode"><button data-m="cnic">CNIC A4</button><button data-m="photo">A4</button><button data-m="setcnic" title="CNIC cards at fixed size; margins in inches decide how many fit">Set CNIC</button></nav>
 <span class="sp"></span>
 <div class="grp"><button id="undo" class="ic" title="Undo (Ctrl+Z)">${I.undo}<span class="lbl">Undo</span></button><button id="redo" class="ic" title="Redo (Ctrl+Y)">${I.redo}<span class="lbl">Redo</span></button></div>
 <div class="grp zoom"><button id="zo" title="Zoom out">−</button><button id="zl" title="Reset zoom">100%</button><button id="zi" title="Zoom in">+</button></div>
 <button id="prev" class="ic">${I.eye}<span class="lbl">Preview</span></button><button class="pri ic" id="print" title="Ctrl+P">${I.print}<span>Print</span></button>
</header>
<main>
 <div class="stage" id="stage"><div class="zw" id="zw"></div></div>
 <aside class="panel">
  <section class="sec">
   <h2>Layout</h2>
   <div class="r"><span>Paper size</span><select id="paper"><option value="4x6">4×6 in</option><option value="5x7">5×7 in</option><option value="A4">A4</option><option value="Letter">Letter</option><option value="Legal">Legal</option><option value="Other">Custom</option></select></div>
   <div class="r" id="rRows"><span>Rows per page</span><span class="step"><button id="rowM" title="Remove a row">−</button><select id="rows"></select><button id="rowP" title="Add a row">+</button></span></div>
   <div class="r" id="rCols"><span>Columns per page</span><select id="cols"></select></div>
   <div class="ro" id="ppp"></div>
   <div class="r"><span>Filename</span><select id="name"><option value="0">Off</option><option value="1">On</option></select></div>
   <div class="r" id="rGap"><span>Intervals (mm)</span><input type="number" id="gap" min="0" max="30" step="1"></div>
   <div class="r"><span>Page</span><select id="orient"><option value="p">Portrait</option><option value="l">Landscape</option></select></div>
  </section>
  <section class="sec" id="scPanel" hidden>
   <h2>Set CNIC — position</h2>
   <div class="bt"><button data-al="l" title="Start from the left side">Left</button><button data-al="c" title="Center on page">Center</button><button data-al="r" title="Start from the right side">Right</button></div>
   <h3>Margins (inches)</h3>
   <div class="mg">
    <label>Left <input type="number" id="scL" min="0" max="6" step="0.05"></label>
    <label>Right <input type="number" id="scR" min="0" max="6" step="0.05"></label>
    <label>Top <input type="number" id="scT" min="0" max="6" step="0.05"></label>
    <label>Bottom <input type="number" id="scB" min="0" max="6" step="0.05"></label>
   </div>
   <div class="sc">Choose Rows / Columns above. Cards keep the CNIC shape (up to 3.37 × 2.13 in) and shrink automatically to fit the rows, columns and margins.</div>
   <div class="bt"><button id="scReset">Reset margins</button></div>
  </section>
  <section class="sec">
   <h2>Pages</h2>
   <div class="r pager"><button id="pp" class="ic" title="Previous page">${I.left}</button><b id="pgl"></b><button id="pn" class="ic" title="Next page">${I.right}</button></div>
   <div class="bt"><button id="addpg" class="ic">${I.plus}<span>Add page</span></button><button id="delpg" class="ic">${I.trash}<span>Delete page</span></button></div>
  </section>
  <section class="sec">
   <h2>Photo</h2>
   <label class="c"><input type="checkbox" id="outline"> Draw outline for photo</label>
   <label class="c"><input type="checkbox" id="rotate"> Auto-Rotate by 90 degrees</label>
   <div class="bt"><button id="gray">Grayscale</button><button id="sepia">Sepia</button><button id="reset">Reset</button></div>
  </section>
  <section class="sec enh">
   <h2><span class="ai-badge">${I.spark}</span>AI enhance</h2>
   <label class="c"><input type="checkbox" id="enh"> Auto-enhance to 4K on upload</label>
   <div class="sc">Scanner-style clean-up: flattens and crops to the card, removes shadows and glare, sharpens text — keeps every text, number and signature unaltered.</div>
   <div class="bt"><button id="pasteBtn" class="ic">${I.clip}<span>Paste image</span></button></div>
  </section>
  <section class="sec">
   <div class="bt" id="rFill"><button id="fill" class="ic">${I.copy}<span>Copy 1st to all</span></button></div>
   <div class="bt"><button id="clear" class="ic danger">${I.x}<span>Clear all photos</span></button></div>
  </section>
  <section class="sec">
   <h2>Shortcuts</h2>
   <div class="sc">Print: Ctrl+P · Copy: Ctrl+C<br>Cut: Ctrl+X · Paste: Ctrl+V<br>Undo: Ctrl+Z · Redo: Ctrl+Y<br>Ctrl+V also uploads any image you copied (screenshot, web image, file).<br>Click a box to select it. Drag &amp; drop files onto boxes too.<br>Crop button on a photo = adjust crop (Enter = Apply, Esc = Cancel).</div>
  </section>
 </aside>
</main>

<div class="ov" id="pv" hidden>
 <div class="bar">
  <b id="pvT">Print preview</b>
  <label class="c"><input type="checkbox" id="outline2"> Outline</label>
  <span class="sp"></span>
  <button id="pvSet">Print settings</button><button class="pri ic" id="doPrint">${I.print}<span>Print</span></button><button id="pvClose">Close</button>
 </div>
 <div class="holder" id="holder"><div class="zw" id="pzw"></div></div>
 <div class="note" id="pnote"></div>
</div>

<div class="ov" id="cm" hidden>
 <div class="note"><span class="mp">Drag the 4 corner points onto the card corners — side handles move a whole edge. A magnifier shows the exact spot.</span><span class="mr">Drag the box, its corners or its sides to frame the card. Use Straighten and Rotate if it's tilted.</span> Press Apply when done.</div>
 <div class="cw" id="cwrap"><div id="cbox"><img id="cimg" alt=""><svg id="csv"><path id="cmask"/><path id="cgrid"/><polygon id="cpoly"/></svg><b class="sd" data-s="0"></b><b class="sd" data-s="1"></b><b class="sd" data-s="2"></b><b class="sd" data-s="3"></b><b class="pt" data-k="0"></b><b class="pt" data-k="1"></b><b class="pt" data-k="2"></b><b class="pt" data-k="3"></b></div></div>
 <div id="loupe" hidden><canvas width="240" height="240"></canvas></div>
 <div class="bar cbar">
  <span class="seg" role="group" aria-label="Crop method"><button data-cm="persp" title="4 corner points — straightens photos taken at an angle">Corner points</button><button data-cm="rect" title="Simple rectangle crop">Box crop</button></span>
  <label>Straighten <input type="range" id="cAng" min="-45" max="45" step="0.1" value="0"> <b id="cAngV">0.0°</b></label>
  <button id="cRotL" title="Rotate left 90°">⟲ Left</button><button id="cRotR" title="Rotate right 90°">Right ⟳</button><button id="cFlip">⇋ Flip</button>
  <span class="grp"><button id="cZo" title="Zoom out">−</button><button id="cZf" title="Fit to screen">Fit</button><button id="cZi" title="Zoom in">+</button></span>
  <button id="cAuto">Auto detect</button><button id="cFull">Reset</button>
  <span class="sp"></span>
  <button id="cCancel">Cancel</button><button class="pri" id="cApply">Apply</button>
 </div>
</div>
<div class="ov center" id="pd" hidden><div class="dlg pdlg">
 <div class="pcol">
 <b class="dlg-title">Print settings</b>
 <label>Printer <span class="step"><select id="printer"></select><button id="prAdd" title="Add printer name">+</button><button id="prDel" title="Remove selected printer">−</button></span></label>
 <label>Paper size <select id="paper2"><option value="4x6">4×6 in (101.6 × 152.4 mm)</option><option value="5x7">5×7 in (127 × 177.8 mm)</option><option value="A4">A4 (210 × 297 mm)</option><option value="Letter">Letter (215.9 × 279.4 mm)</option><option value="Legal">Legal (215.9 × 355.6 mm)</option><option value="Other">Custom…</option></select></label>
 <label id="oth" hidden>Custom W × H (mm)<span><input type="number" id="cw"> × <input type="number" id="ch"></span></label>
 <label>Paper type <select id="qual"><option>Plain</option><option>Glossy</option><option>Matte</option><option>Premium Glossy</option></select></label>
 <label>Print quality <select id="pq"><option>Draft</option><option>Standard</option><option>High</option><option>Best Photo</option></select></label>
 <label>Orientation <select id="orient2"><option value="p">Portrait</option><option value="l">Landscape</option></select></label>
 <label>Colour <select id="colour"><option value="colour">Colour</option><option value="bw">Black &amp; white</option></select></label>
 <label class="ck"><span><input type="checkbox" id="bless"> Borderless (fill page, crops edges — no stretching)</span></label>
 <label>Margins (mm) <input type="number" id="mar" min="0" max="50" step="0.5" placeholder="Auto"></label>
 <label><span><input type="radio" name="pr" value="cur" checked> Current page</span></label>
 <label><span><input type="radio" name="pr" value="all"> All pages</span></label>
 <label><span><input type="radio" name="pr" value="cus"> Custom pages</span><input id="prt" placeholder="e.g. 1,3-5"></label>
 <div class="sc" id="pinfo"></div>
 <div class="sc" id="sizeinfo"></div>
 <div class="sc" id="phelp"></div>
 <div class="bt"><button class="pri" id="pdOk">Print…</button><button id="exp">Export 300 DPI</button><button id="pdNo">Cancel</button></div>
 </div>
 <div class="pcol"><b>Live preview</b><div id="lpv"></div><div class="sc" id="lpvn"></div></div>
</div></div>
<input type="file" id="fi" accept="image/*,.pdf,application/pdf" multiple hidden>
<div id="toast" role="status" aria-live="polite"></div>
`;
