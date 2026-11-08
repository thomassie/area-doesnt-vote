/* Europe's Divides: Area Doesn't Vote (D3 v7), drawn into one element:

     <div id="area-doesnt-vote" data-base="https://<data host>/"></div>

   data-base       where data/*.json live (default: next to the page)
   data-header     "false" leaves out the built-in title (when the host page has its own)
   data-layout     "standalone" adds the page's own width and side gutters

   Reads data/counties.json and data/county_files.json (written by pipeline/run.py from mart.de_county_voters
   and mart.de_county_files) and the maps built from them by tools/voter_maps/build.mjs: data/maps.json
   (index), data/maps_<year>.json (Germany) and data/states_<year>.json (one state at a time).
   Styles: adv.css (scoped under .adv); colours come from the host's tokens or theme.css.
   One meaning per colour: red = far right, ink = the actual result.
   The address keeps the view: #2025, #2025-counties, #2025-by (a state's two-letter code).
   Cross-links: the lede and the note under the maps link to The Far Right in Germany (GERMANY); #counties-<year>
   opens its county map at that year. */
(function () {
  'use strict';

  const root = document.getElementById('area-doesnt-vote');
  if (!root || typeof d3 === 'undefined') return;
  const BASE = root.dataset.base ? root.dataset.base.replace(/\/?$/, '/') : '';
  root.classList.add('adv');
  if (root.dataset.layout === 'standalone') root.classList.add('adv--standalone');

  const GERMANY = 'https://thomassie.me/projects/far-right-germany/';   // companion page: parties, state elections, county and town maps
  const DOT = '<svg class="title-dot" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="5"/></svg>';
  const card = (kind, title, by, aria, pros, cons, extra = '') => `
    <article class="card card--${kind}" data-panel="${kind}">
      <header><h2>${title}</h2><p class="by">${by}</p></header>
      <svg role="img" aria-label="${aria}"></svg>
      ${extra}
      <div class="stat"></div>
      <ul class="pc">${pros.map((t) => '<li class="plus">' + t + '</li>').join('')}${cons.map((t) => '<li class="minus">' + t + '</li>').join('')}</ul>
    </article>`;
  root.innerHTML = `
<div class="masthead wrap">
  <div class="masthead__text">
    <p class="eyebrow">Europe&rsquo;s Divides</p>
    <h1>Area Doesn&rsquo;t Vote${DOT}</h1>
    <p class="lede">Election maps size every place by its land. But land doesn&rsquo;t vote, people do. Here Germany&rsquo;s federal elections are drawn four ways so that size follows the people eligible to vote, next to the usual map. The colour is the far right&rsquo;s share of the second vote. A companion to <a href="${GERMANY}">The Far Right in Germany</a>.</p>
  </div>
</div>
<div class="wrap">
  <div class="controls">
    <div class="seg seg--years" id="adv-years" role="group" aria-label="Election"></div>
    <div class="controls__bar">
      <label class="pick pick--year" for="adv-year">Election <select id="adv-year"></select></label>
      <label class="pick" for="adv-area">Show <select id="adv-area"></select></label>
      <div class="seg seg--level" id="adv-level" role="group" aria-label="Areas">
        <button type="button" data-level="states" aria-pressed="true">16 states</button>
        <button type="button" data-level="counties" aria-pressed="false">Counties</button>
      </div>
      <span class="count" id="adv-count" hidden></span>
      <div class="key" id="adv-key"></div>
    </div>
    <p class="fact" id="adv-fact" aria-live="polite"></p>
    <p class="note" id="adv-note"></p>
  </div>
  <section class="grid" id="adv-grid" aria-label="Five maps of the same result">
    ${card('land', 'Land map<span class="tag">usual</span>', 'Size: land area', 'Map by land area, coloured by far-right share',
      ['Everyone recognises it; borders and places are where they belong.'],
      ['Big, thinly populated areas dominate, whatever their number of voters.'])}
    ${card('carto', 'Contiguous cartogram', 'Size: eligible voters &middot; borders stretched, neighbours kept', 'Contiguous cartogram, area by eligible voters',
      ['Stays in one piece, and every neighbour stays a neighbour.', 'Each area matches its voters closely (<span data-err></span>).'],
      ['Shapes warp: cities balloon and the countryside thins into strips that are hard to find.'])}
    ${card('dor', 'Dorling circles', 'Size: eligible voters &middot; one circle per area, near its place', 'Dorling cartogram, one circle per area sized by eligible voters',
      ['Area is exact and easy to compare: one circle, one area.'],
      ['Borders and shapes are gone; circles drift away from their neighbours.', 'The gaps between circles look like empty land.'])}
    ${card('hex', 'Equal-voter hexagons', 'Size: one hexagon = <span data-tile></span> eligible voters', 'Tile map, each hexagon the same number of eligible voters',
      ['Countable: every tile is the same number of people, so blocks of colour compare directly.', 'Even texture with no slivers; even the smallest area gets a tile.'],
      ['Shapes are rough, and each area is rounded to whole tiles.'])}
    ${card('alpha', 'Value-by-alpha', 'Size: land area &middot; strength: eligible voters per km&sup2;', 'Map by land area, colour strength by eligible voters per square kilometre',
      ['The familiar map, undistorted.', 'Thinly populated areas fade, so big empty ones stop shouting.'],
      ['Land still takes the space, only fainter.', 'A faded dark colour can look like a strong light one.'],
      '<figure class="akey" id="adv-akey" aria-label="Colour by far-right share, strength by eligible voters per km²"></figure>')}
  </section>
  <p class="xlink" id="adv-xlink"></p>
  <details class="tableview" id="adv-table">
    <summary>Show as a table</summary>
    <div class="tablewrap"><table><thead></thead><tbody></tbody></table></div>
  </details>
</div>
<footer class="foot wrap">
  <h2>How these maps are made</h2>
  <div>
    <ul>
      <li>Size follows eligible voters (Wahlberechtigte), not votes cast, so a gap remains where turnout differs: a map sized by eligible voters shows the far right at its share among the places&rsquo; electorates, which can differ slightly from its share of the votes.</li>
      <li>&ldquo;Averaged over the picture&rdquo; is the far-right share of each area weighted by the space it takes in that map (on the value-by-alpha map: space times colour strength). On a map sized by voters it comes close to the actual result; on the land map it shows how much the picture over- or understates the far right.</li>
      <li>Contiguous cartogram: the algorithm of Dougenik, Chrisman &amp; Niemeyer (1985), repeated until areas match their voters to within 0.5% on average (at most 100 rounds). Small areas that need to grow a lot are the last to match.</li>
      <li>Dorling circles (Dorling 1996): one circle per area, its area proportional to eligible voters, pulled towards the area&rsquo;s centre and pushed apart until none overlap.</li>
      <li>Equal-voter hexagons: a grid laid over the cartogram, each area rounded to whole tiles (at least one), then tiles passed along shared borders until every area has its exact count and stays in one piece. Tiles keep their size from election to election: 25,000 eligible voters on the county map of Germany, 50,000 on the state map, and a fixed size per state on the state maps.</li>
      <li>Value-by-alpha (Roth, Woodruff &amp; Johnson 2010): the land map, its colours fading where few people live, in four classes of eligible voters per km&sup2;: under 100, 100&ndash;250, 250&ndash;1,000 and over 1,000.</li>
      <li>Counties as in the federal returning officer&rsquo;s county files, on the boundaries of election day; Berlin as one area. 1953&ndash;1987: West Germany only. The files for 1957, 1965 and 1980 count the far-right list among &ldquo;others&rdquo;, so these elections are missing; the 1961 file leaves out postal votes. Far right as on <a href="${GERMANY}">The Far Right in Germany</a>, which lists every party counted and the sources of the classification (the AfD from 2015).</li>
    </ul>
    <p class="credit">Results by county: Die Bundeswahlleiterin, <a href="https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/weitere-ergebnisse.html">Ergebnisse nach kreisfreien St&auml;dten und Landkreisen</a> (one file per federal election, 1953&ndash;2025), Wiesbaden. County boundaries: &copy; <a href="https://www.bkg.bund.de">BKG</a> (2026) <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>, VG-Hist, <a href="https://sgx.geodatenzentrum.de/web_public/gdz/datenquellen/datenquellen_vg-hist.pdf">Datenquellen</a>; changed: generalised, counties merged where the results merge them, and distorted in the cartograms. Methods: J. A. Dougenik, N. R. Chrisman &amp; D. R. Niemeyer (1985), An algorithm to construct continuous area cartograms, <em>The Professional Geographer</em> 37(1); D. Dorling (1996), <em>Area Cartograms: Their Use and Creation</em>, CATMOG 59; R. E. Roth, A. W. Woodruff &amp; Z. F. Johnson (2010), Value-by-alpha maps: an alternative technique to the cartogram, <em>The Cartographic Journal</em> 47(2).</p>
  </div>
</footer>
<div class="tooltip" id="adv-tt" role="status" hidden></div>`;
  if (root.dataset.header === 'false') root.querySelector('.masthead').remove();

  // ---------- constants ----------
  const STATES = ['SH', 'HH', 'NI', 'HB', 'NW', 'HE', 'RP', 'BW', 'BY', 'SL', 'BE', 'BB', 'MV', 'SN', 'ST', 'TH'];
  const NAMES = { SH: 'Schleswig-Holstein', HH: 'Hamburg', NI: 'Lower Saxony', HB: 'Bremen', NW: 'North Rhine-Westphalia',
    HE: 'Hesse', RP: 'Rhineland-Palatinate', BW: 'Baden-Württemberg', BY: 'Bavaria', SL: 'Saarland', BE: 'Berlin',
    BB: 'Brandenburg', MV: 'Mecklenburg-Vorpommern', SN: 'Saxony', ST: 'Saxony-Anhalt', TH: 'Thuringia' };
  const EAST = new Set(['BB', 'MV', 'SN', 'ST', 'TH']);
  const BINS = [1, 2, 5, 10, 20, 30, 40, 50];
  const BIN_LABELS = ['<1', '1–2', '2–5', '5–10', '10–20', '20–30', '30–40', '40–50', '50+'];
  const DENS = [100, 250, 1000];                 // eligible voters per km²: the value-by-alpha classes
  const ALPHA = [0.22, 0.45, 0.72, 1];           // their colour strength (as in adv.css .a0-.a3)
  const W = 600, PAD = 12;
  const NS = 'http://www.w3.org/2000/svg';

  const $ = (s) => root.querySelector(s);
  const fmt = d3.format(',');
  const pct = (x) => d3.format('.1f')(x) + '%';
  const share = (d) => (d.v ? 100 * d.r / d.v : 0);
  const binOf = (d) => 1 + d3.bisectRight(BINS, share(d));
  const dens = (d) => d.e / d.km2;
  const dclass = (d) => d3.bisectRight(DENS, dens(d));
  const short = (n) => n.split(',')[0].replace(/^(Landkreis|Kreis|Stadtkreis|Stadt)\s+/, '');
  const isCity = (n) => /,\s*(\w*\s)?(Stadt|Landeshauptstadt|Hansestadt|Wissenschaftsstadt)\b|kreisfreie Stadt|Stadtkreis/i.test(n);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- data ----------
  const cache = new Map();
  const load = (name) => {
    if (!cache.has(name)) cache.set(name, d3.json(BASE + 'data/' + name + '.json'));
    return cache.get(name);
  };
  const decode = (pk) => {
    const [kx, ky] = pk.transform.scale, [tx, ty] = pk.transform.translate;
    return pk.arcs.map((a) => {
      const out = [];
      let x = 0, y = 0;
      for (let i = 0; i < a.length; i += 2) { x += a[i]; y += a[i + 1]; out.push([x * kx + tx, y * ky + ty]); }
      return out;
    });
  };
  const decoded = new WeakMap();
  const arcsOf = (pk) => { if (!decoded.has(pk)) decoded.set(pk, decode(pk)); return decoded.get(pk); };

  let INDEX, ROWS, FILES;
  const S = { year: null, area: 'DE', level: 'states' };

  // ---------- one view: what the five maps show ----------
  async function makeView() {
    const M = await load('maps_' + S.year);
    const byU = ROWS.get(S.year);
    const counties = M.units.map((u, i) => ({ ...byU.get(u), km2: M.km2[i] }));
    const states = M.states.map((s) => {
      const cs = counties.filter((c) => c.s === s);
      return { n: NAMES[s], s, e: d3.sum(cs, (c) => c.e), v: d3.sum(cs, (c) => c.v), r: d3.sum(cs, (c) => c.r), km2: d3.sum(cs, (c) => c.km2), isState: true };
    });
    const land = arcsOf(M.land);
    if (S.area === 'DE') {
      const sIdx = new Map(M.states.map((s, i) => [s, i]));
      const byState = S.level === 'states';
      return {
        place: 'Germany', byState,
        items: byState ? states : counties,
        geoms: M.geoms,
        itemOf: byState ? (g) => sIdx.get(counties[g].s) : (g) => g,
        stateOf: (g) => counties[g].s,
        stateOfItem: byState ? (i) => M.states[i] : (i) => counties[i].s,
        land, carto: arcsOf(byState ? M.cs : M.cc),
        cartoArea: byState ? M.area.states : M.area.counties,
        err: byState ? M.err.states : M.err.counties,
        hex: byState ? M.hex.states : M.hex.counties,
        dorling: byState ? M.dorling.states : M.dorling.counties,
        labels: byState ? 'abbr' : 7,
      };
    }
    const P = (await load('states_' + S.year))[S.area];
    const items = P.units.map((i) => counties[i]);
    return {
      place: NAMES[S.area], byState: false, items,
      geoms: P.geoms,
      itemOf: (g) => g,
      stateOf: () => S.area,
      stateOfItem: () => S.area,
      land: P.arcIds.map((i) => land[i]), carto: arcsOf(P.cc),
      cartoArea: P.area, err: P.err, hex: P.hex, dorling: P.dorling,
      labels: 5,
    };
  }

  // ---------- drawing ----------
  const el = (tag, parent, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };
  const features = (V, arcs) => {
    const arc = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
    const ring = (ids) => { const pts = []; ids.forEach((i, k) => { const a = arc(i); for (let m = k ? 1 : 0; m < a.length; m++) pts.push(a[m]); }); return pts; };
    return V.geoms.map((polys, i) => ({ type: 'Feature', id: i, geometry: { type: 'MultiPolygon', coordinates: polys.map((p) => p.map(ring)) } }));
  };
  const owners = (V) => {
    if (V.owners) return V.owners;
    const o = new Map();
    V.geoms.forEach((polys, g) => polys.forEach((p) => p.forEach((r) => r.forEach((i) => {
      const k = i < 0 ? ~i : i;
      if (!o.has(k)) o.set(k, []);
      o.get(k).push(g);
    }))));
    return (V.owners = o);
  };
  const mesh = (V, arcs, keep) => {
    const lines = [];
    owners(V).forEach((gs, k) => { if (keep(gs[0], gs.length > 1 ? gs[1] : gs[0])) lines.push(arcs[k]); });
    return { type: 'MultiLineString', coordinates: lines };
  };
  const box = (x0, y0, x1, y1) => ({ type: 'Polygon', coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]] });
  const keyOf = (i) => 'i' + i;

  function labelsFor(V) {
    if (V.labels === 'abbr') return V.items.map((d, i) => [i, d.s]);
    const top = d3.range(V.items.length).sort((a, b) => V.items[b].e - V.items[a].e).slice(0, V.labels);
    const names = top.map((i) => short(V.items[i].n));
    return top.map((i, j) => {
      const dup = names.filter((n) => n === names[j]).length > 1;
      return [i, dup && !isCity(V.items[i].n) ? names[j] + ' district' : names[j]];
    });
  }
  function drawLabels(svg, V, pos) {
    const g = el('g', svg, {}), placed = [];
    labelsFor(V).forEach(([i, t]) => {      // largest first; a name that would touch one already placed is left out
      const p = pos.get(i);
      if (!p) return;
      const b = [p[0] - t.length * 4.8 - 4, p[1] - 10, p[0] + t.length * 4.8 + 4, p[1] + 10];
      if (V.labels !== 'abbr' && placed.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1])) return;
      placed.push(b);
      el('text', g, { class: 'lab', x: p[0].toFixed(1), y: p[1].toFixed(1) }).textContent = t;
    });
  }

  function polygons(svg, V, H, arcs, alpha) {
    const fs = features(V, arcs);
    const fit = d3.geoIdentity().reflectY(true).fitExtent([[PAD, PAD], [W - PAD, H - PAD]], { type: 'FeatureCollection', features: fs });
    const path = d3.geoPath(fit);
    const g = el('g', svg, {}), acc = new Map();
    fs.forEach((f, gi) => {
      const i = V.itemOf(gi), d = V.items[i];
      el('path', g, { d: path(f), class: 'k c' + binOf(d) + (alpha ? ' a' + dclass(d) : '') + (V.byState ? ' same' : ''), 'data-k': keyOf(i) });
      const a = path.area(f), c = path.centroid(f);
      if (!acc.has(i)) acc.set(i, [0, 0, 0]);
      const t = acc.get(i); t[0] += a * c[0]; t[1] += a * c[1]; t[2] += a;
    });
    if (S.area === 'DE') el('path', svg, { class: 'lines lines--state', d: path(mesh(V, arcs, (a, b) => V.stateOf(a) !== V.stateOf(b))) });
    el('path', svg, { class: 'lines lines--outline', d: path(mesh(V, arcs, (a, b) => a === b)) });
    const pos = new Map();
    acc.forEach((t, i) => pos.set(i, [t[0] / t[2], t[1] / t[2]]));
    drawLabels(svg, V, pos);
  }

  function circles(svg, V, H) {
    const C = V.dorling;
    const xs = C.flatMap((c) => [c[0] - c[2], c[0] + c[2]]), ys = C.flatMap((c) => [c[1] - c[2], c[1] + c[2]]);
    const proj = d3.geoIdentity().reflectY(true).fitExtent([[PAD, PAD], [W - PAD, H - PAD]], box(d3.min(xs), d3.min(ys), d3.max(xs), d3.max(ys)));
    const path = d3.geoPath(proj), k = proj.scale();
    el('path', svg, { class: 'lines lines--ghost', d: path(mesh(V, V.land, (a, b) => a === b)) });
    const g = el('g', svg, {}), pos = new Map();
    d3.range(C.length).sort((a, b) => C[b][2] - C[a][2]).forEach((i) => {
      const [x, y] = proj([C[i][0], C[i][1]]);
      el('circle', g, { cx: x.toFixed(1), cy: y.toFixed(1), r: Math.max(0.7, C[i][2] * k).toFixed(2), class: 'k c' + binOf(V.items[i]), 'data-k': keyOf(i) });
      pos.set(i, [x, y]);
    });
    drawLabels(svg, V, pos);
  }

  const DIRS = [[1, 0, 330, 30], [0, 1, 30, 90], [-1, 1, 90, 150], [-1, 0, 150, 210], [0, -1, 210, 270], [1, -1, 270, 330]];
  function hexagons(svg, V, H) {
    const hx = V.hex, s = hx.s, w = Math.sqrt(3) * s, h = 1.5 * s, cells = [];
    for (let i = 0; i < hx.cells.length; i += 3) cells.push({ q: hx.cells[i], r: hx.cells[i + 1], u: hx.cells[i + 2] });
    const X = (c) => w * (c.q + c.r / 2), Y = (c) => h * c.r;
    const proj = d3.geoIdentity().reflectY(true).fitExtent([[PAD, PAD], [W - PAD, H - PAD]],
      box(d3.min(cells, X) - s, d3.min(cells, Y) - s, d3.max(cells, X) + s, d3.max(cells, Y) + s));
    const rad = Math.PI / 180;
    const corner = (c, deg) => proj([X(c) + s * Math.cos(deg * rad), Y(c) + s * Math.sin(deg * rad)]);
    const P = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
    const at = new Map(cells.map((c) => [c.q + ',' + c.r, c]));
    const g = el('g', svg, {}), acc = new Map();
    let sl = '', cl = '', ol = '';
    cells.forEach((c) => {
      const corners = [30, 90, 150, 210, 270, 330].map((a) => corner(c, a));
      el('path', g, { d: 'M' + corners.map(P).join('L') + 'Z', class: 'k c' + binOf(V.items[c.u]), 'data-k': keyOf(c.u) });
      const [px, py] = proj([X(c), Y(c)]);
      if (!acc.has(c.u)) acc.set(c.u, [0, 0, 0]);
      const t = acc.get(c.u); t[0] += px; t[1] += py; t[2]++;
      DIRS.forEach(([dq, dr, a0, a1]) => {
        const n = at.get((c.q + dq) + ',' + (c.r + dr));
        const seg = 'M' + P(corner(c, a0)) + 'L' + P(corner(c, a1));
        if (!n) ol += seg;
        else if (n.u === c.u || (n.q + ',' + n.r) < (c.q + ',' + c.r)) return;     // each inner edge once
        else if (V.stateOfItem(n.u) !== V.stateOfItem(c.u)) sl += seg;
        else cl += seg;
      });
    });
    if (cl && !V.byState) el('path', svg, { class: 'lines lines--county', d: cl });
    if (sl) el('path', svg, { class: 'lines lines--state', d: sl });
    el('path', svg, { class: 'lines lines--outline', d: ol });
    const pos = new Map();
    acc.forEach((t, i) => pos.set(i, [t[0] / t[2], t[1] / t[2]]));
    drawLabels(svg, V, pos);
    return cells;
  }

  // the far-right share averaged over each picture: every area weighted by the space it takes there
  function weights(panel, V, cells) {
    if (panel === 'land') return V.items.map((d) => d.km2);
    if (panel === 'alpha') return V.items.map((d) => d.km2 * ALPHA[dclass(d)]);
    if (panel === 'carto') return V.cartoArea;
    if (panel === 'dor') return V.dorling.map((c) => c[2] * c[2]);
    const w = V.items.map(() => 0);
    cells.forEach((c) => { w[c.u]++; });
    return w;
  }

  // ---------- page ----------
  const grid = $('#adv-grid');
  const viewBoxH = (V) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const a of V.land) for (const [x, y] of a) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    return Math.round(Math.min(820, Math.max(420, (W - 2 * PAD) * (y1 - y0) / (x1 - x0) + 2 * PAD)));
  };

  async function render() {
    hide();
    grid.classList.add('loading');
    let V;
    try { V = await makeView(); } catch (err) {
      grid.classList.remove('loading');
      $('#adv-fact').textContent = 'The maps could not be loaded (' + err.message + ').';
      return;
    }
    CURRENT = V;
    const H = viewBoxH(V);
    const total = { e: d3.sum(V.items, (d) => d.e), v: d3.sum(V.items, (d) => d.v), r: d3.sum(V.items, (d) => d.r), km2: d3.sum(V.items, (d) => d.km2) };
    const result = share(total);
    let cells;
    const avgs = [];
    grid.querySelectorAll('.card').forEach((c) => {
      const panel = c.dataset.panel, svg = c.querySelector('svg');
      svg.replaceChildren();
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      if (panel === 'land') polygons(svg, V, H, V.land, false);
      if (panel === 'carto') polygons(svg, V, H, V.carto, false);
      if (panel === 'alpha') polygons(svg, V, H, V.land, true);
      if (panel === 'dor') circles(svg, V, H);
      if (panel === 'hex') cells = hexagons(svg, V, H);
      const w = weights(panel, V, cells);
      avgs.push([c, d3.sum(V.items, (d, i) => w[i] * share(d)) / d3.sum(w)]);
    });
    const top = Math.max(result, d3.max(avgs, (a) => a[1])) * 1.15 || 1;
    avgs.forEach(([c, avg]) => {
      c.querySelector('.stat').innerHTML =
        '<span>Far right, averaged over this picture: <b>' + pct(avg) + '</b> &middot; result: ' + pct(result) + '</span>' +
        '<div class="track" aria-hidden="true"><div class="track__fill" style="width:' + (100 * avg / top).toFixed(2) + '%"></div>' +
        '<div class="track__tick" style="left:' + (100 * result / top).toFixed(2) + '%"></div></div>';
    });
    $('[data-tile]').textContent = fmt(V.hex.per);
    $('[data-err]').textContent = 'on average within ' + pct(100 * V.err[1]) + ', at worst ' + pct(100 * V.err[2]);
    // above the result: their share of the land and of the voters
    const hi = V.items.filter((d) => share(d) > result);
    const word = V.byState ? (hi.length === 1 ? 'state' : 'states') : (hi.length === 1 ? 'county' : 'counties');
    $('#adv-fact').innerHTML = 'In ' + esc(V.place) + ' in ' + S.year + ', the far right won ' + pct(result) + '. The ' + hi.length + ' ' + word +
      ' where it did better cover <b>' + pct(100 * d3.sum(hi, (d) => d.km2) / total.km2) + '</b> of the land but hold <b>' +
      pct(100 * d3.sum(hi, (d) => d.e) / total.e) + '</b> of eligible voters.';
    const f = FILES.get(S.year), notes = [];
    if (S.year < 1990 && S.area === 'DE') notes.push('West Germany only: there were no free elections in the GDR, and West Berlin did not vote directly.');
    if (f && !f.post) notes.push('The ' + S.year + ' county file leaves out postal votes (' + pct(f.un) + ' of the national vote).');
    if (S.year === 2013) notes.push('The AfD counts as far right from 2015, so its 2013 result is not included.');
    $('#adv-note').textContent = notes.join(' ');
    $('#adv-note').hidden = !notes.length;
    $('#adv-count').textContent = S.area === 'DE' ? '' : V.items.length + ' counties';
    $('#adv-level').querySelector('[data-level="counties"]').textContent = ROWS.get(S.year).size + ' counties';
    $('#adv-level').querySelector('[data-level="states"]').textContent = (S.area === 'DE' ? V.byState ? V.items.length : new Set(V.items.map((d) => d.s)).size : 16) + ' states';
    $('#adv-xlink').innerHTML = '<b>Behind the colours.</b> Which lists count as far right, every state election since 1946 and what goes with the far-right vote: ' +
      '<a href="' + GERMANY + '#counties-' + S.year + '">the ' + S.year + ' county map on The Far Right in Germany</a>, with each list&rsquo;s result in every county.';
    renderTable(V);
    grid.classList.remove('loading');
  }
  let CURRENT = null;

  function renderTable(V) {
    const t = $('#adv-table table');
    const state = !V.byState;
    t.querySelector('thead').innerHTML = '<tr><th>' + (V.byState ? 'State' : 'County') + '</th>' + (state && S.area === 'DE' ? '<th>State</th>' : '') +
      '<th class="num">Eligible voters</th><th class="num">Land, km²</th><th class="num">Voters per km²</th><th class="num">Far right, %</th></tr>';
    t.querySelector('tbody').innerHTML = V.items.slice().sort((a, b) => b.e - a.e).map((d) => '<tr><td>' + esc(d.n) + '</td>' +
      (state && S.area === 'DE' ? '<td>' + esc(NAMES[d.s]) + '</td>' : '') +
      '<td class="num">' + fmt(d.e) + '</td><td class="num">' + fmt(Math.round(d.km2)) + '</td><td class="num">' + fmt(Math.round(dens(d))) +
      '</td><td class="num">' + d3.format('.1f')(share(d)) + '</td></tr>').join('');
  }

  // ---------- switches ----------
  function setYear(y) {
    S.year = y;
    $('#adv-years').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.year === y)));
    $('#adv-year').value = String(y);
    fillAreas();
  }
  function fillAreas() {
    const sel = $('#adv-area'), rows = [...ROWS.get(S.year).values()];
    const views = new Set(INDEX.states[S.year] || []);
    const counts = d3.rollup(rows, (v) => v.length, (r) => r.s);
    sel.innerHTML = '<option value="DE">Germany</option>' + STATES.map((s) => {
      let why = '';
      if (!counts.has(s)) why = s === 'BE' ? ' (no direct vote)' : EAST.has(s) ? ' (no free elections)' : ' (not yet part of the Federal Republic)';
      else if (!views.has(s)) why = counts.get(s) === 1 ? ' (one county)' : ' (' + counts.get(s) + ' counties)';
      return '<option value="' + s + '"' + (why ? ' disabled' : '') + '>' + NAMES[s] + why + '</option>';
    }).join('');
    if (S.area !== 'DE' && !views.has(S.area)) S.area = 'DE';
    sel.value = S.area;
    $('#adv-level').hidden = S.area !== 'DE';
    $('#adv-count').hidden = S.area === 'DE';
    $('#adv-level').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === S.level)));
  }
  function writeHash() {
    const h = '#' + S.year + (S.area !== 'DE' ? '-' + S.area.toLowerCase() : S.level === 'counties' ? '-counties' : '');
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  function readHash() {
    const m = /^#(\d{4})(?:-([a-z]+))?$/.exec(location.hash || '');
    if (!m || !INDEX.years.includes(+m[1])) return false;
    S.year = +m[1];
    const rest = (m[2] || '').toUpperCase();
    if (rest === 'COUNTIES') { S.area = 'DE'; S.level = 'counties'; }
    else if (STATES.includes(rest)) S.area = rest;
    else { S.area = 'DE'; S.level = 'states'; }
    return true;
  }
  async function go() {
    setYear(S.year);
    writeHash();
    await render();
  }

  // ---------- tooltip and linked highlight ----------
  const tt = $('#adv-tt');
  let hot = null;
  function info(i) {
    const V = CURRENT, d = V.items[i];
    const tiles = V.hex.cells.filter((v, j) => j % 3 === 2 && v === i).length;
    return '<p class="tt__meta">' + (d.isState ? 'State' : esc(NAMES[d.s])) + ' &middot; ' + S.year + '</p><p class="tt__title">' + esc(d.n) + '</p><dl class="tt__rows">' +
      '<div><dt>Far right</dt><dd>' + pct(share(d)) + '</dd></div>' +
      '<div><dt>Eligible voters</dt><dd>' + fmt(d.e) + '</dd></div>' +
      '<div><dt>Land</dt><dd>' + fmt(Math.round(d.km2)) + ' km²</dd></div>' +
      '<div><dt>Voters per km²</dt><dd>' + fmt(Math.round(dens(d))) + '</dd></div>' +
      '<div><dt>Hexagons</dt><dd>' + tiles + '</dd></div></dl>';
  }
  function show(k, x, y) {
    if (k !== hot) {
      grid.querySelectorAll('.is-hot').forEach((e) => e.classList.remove('is-hot'));
      grid.querySelectorAll('[data-k="' + k + '"]').forEach((e) => e.classList.add('is-hot'));
      grid.classList.add('is-focus');
      tt.innerHTML = info(+k.slice(1));
      tt.hidden = false;
      hot = k;
    }
    const r = tt.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > window.innerWidth - 8) left = Math.max(8, x - r.width - 14);
    if (top + r.height > window.innerHeight - 8) top = Math.max(8, y - r.height - 14);
    tt.style.left = left + 'px';
    tt.style.top = top + 'px';
  }
  function hide() {
    if (!hot) return;
    grid.querySelectorAll('.is-hot').forEach((e) => e.classList.remove('is-hot'));
    grid.classList.remove('is-focus');
    tt.hidden = true;
    hot = null;
  }
  grid.querySelectorAll('svg').forEach((svg) => {
    svg.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target.closest('.k');
      if (t) show(t.dataset.k, e.clientX, e.clientY); else hide();
    });
    svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
    svg.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      const t = e.target.closest('.k');
      if (t) { show(t.dataset.k, e.clientX, e.clientY); e.stopPropagation(); } else hide();
    });
  });
  document.addEventListener('pointerdown', (e) => { if (!grid.contains(e.target)) hide(); });
  window.addEventListener('scroll', () => { if (hot) hide(); }, { passive: true });

  // ---------- start ----------
  async function boot() {
    try {
      const [index, rows, files] = await Promise.all([load('maps'), load('counties'), load('county_files')]);
      INDEX = index;
      ROWS = d3.group(rows, (r) => r.y, (r) => r.u);
      ROWS.forEach((m, y) => ROWS.set(y, new Map([...m].map(([u, rs]) => [u, rs[0]]))));
      FILES = new Map(files.map((f) => [f.y, f]));
    } catch (err) {
      $('#adv-fact').textContent = 'The data could not be loaded (' + err.message + ').';
      return;
    }
    const years = INDEX.years;
    $('#adv-years').innerHTML = years.map((y) => '<button type="button" data-year="' + y + '" aria-pressed="false">' + y + '</button>').join('');
    $('#adv-year').innerHTML = years.slice().reverse().map((y) => '<option value="' + y + '">' + y + '</option>').join('');
    $('#adv-key').innerHTML = '<span class="key__title">Far right, % of second votes</span>' +
      BIN_LABELS.map((l, i) => '<span class="c' + (i + 1) + '"><i></i>' + l + '</span>').join('');
    $('#adv-akey').innerHTML = ['1,000+', '250–1,000', '100–250', '<100'].map((r, j) => '<span class="rl">' + r + '</span>' +
      BIN_LABELS.map((l, i) => '<i class="c' + (i + 1) + ' a' + (3 - j) + '"></i>').join('')).join('') +
      '<span></span><span class="cap">eligible voters per km² (rows) by far-right share (columns)</span>';
    $('#adv-years').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b && +b.dataset.year !== S.year) { S.year = +b.dataset.year; go(); }
    });
    $('#adv-year').addEventListener('change', (e) => { S.year = +e.target.value; go(); });
    $('#adv-area').addEventListener('change', (e) => { S.area = e.target.value; go(); });
    $('#adv-level').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b && b.dataset.level !== S.level) { S.level = b.dataset.level; go(); }
    });
    window.addEventListener('hashchange', () => { if (readHash()) { setYear(S.year); render(); } });
    if (!readHash()) S.year = years[years.length - 1];
    go();
  }
  boot();
})();
