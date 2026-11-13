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
   Cross-links: the introduction and the note under the maps link to The Far Right in Germany (GERMANY); #counties-<year>
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
      <header><h3>${title}</h3><p class="by">${by}</p></header>
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
  </div>
</div>
<div class="wrap">
  <section class="hero" aria-label="In short">
    <div class="hero__item">
      <p class="hero__label"><i class="hero__sw hero__sw--map"></i>Far right on the land map</p>
      <p class="hero__figure" id="adv-hero-map">&nbsp;</p>
      <p class="hero__text">its share of the <span data-hero="year"></span> federal election as the usual county map shows it, each county counting by its land</p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="hero__sw hero__sw--votes"></i>Far right among the votes</p>
      <p class="hero__figure" id="adv-hero-votes">&nbsp;</p>
      <p class="hero__text">its actual share of the second votes</p>
    </div>
    <p class="hero__why">The map makes the far right look <b data-hero="more"></b> stronger than it was. The <span data-f="de-n"></span> counties where it did better than its national result cover <b data-f="de-land"></b> of the land but hold only <b data-f="de-e"></b> of the eligible voters: big, thinly populated counties fill the map, while the cities, home to far more voters per square kilometre, shrink to small patches.</p>
  </section>
  <section class="block" aria-labelledby="adv-h-maps">
    <div class="block__rail">
      <h2 id="adv-h-maps">Five maps of the same result${DOT}</h2>
      <p>Election results are usually shown on a choropleth map: every area, be it a state, a county or a town, is coloured by a share of the vote. Such a map is quick to read and easy to make. It also has a bias built in. The eye weighs a colour by the space it covers, but land doesn&rsquo;t vote, people do.</p>
      <p>On <a href="${GERMANY}">The Far Right in Germany</a> I map the far right&rsquo;s share of the second vote in every federal election since 1953: county by county within the boundaries of election day, and town by town for 2017 to 2025, all from the federal returning officer&rsquo;s official results. There I chose choropleth maps on purpose. With 400 counties, or some 10,700 municipalities, readers first need to find their way: their own place, the regions they know, the borders between the states. The familiar map does that best.</p>
      <p>I am aware of what that map gets wrong. Big, thinly populated counties fill most of it, so wherever the far right does better in the countryside, the map makes it look stronger than it is. This page is my explainer: the same results drawn four more ways, sized by the people eligible to vote, next to the usual map, and below them what each way shows and hides.</p>
      <p>Maps can mislead by accident, through a default nobody questioned, or on purpose, to steer readers towards a conclusion the data do not support. As with charts, doing it on purpose is never acceptable. A map should show what the data say, state what it sizes and colours, and let readers check the numbers behind it. That is the standard I hold these maps to.</p>
    </div>
    <div class="block__body">
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
      <div class="grid" id="adv-grid" role="group" aria-label="Five maps of the same result">
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
      </div>
      <p class="xlink" id="adv-xlink"></p>
      <details class="tableview" id="adv-table">
        <summary>Show as a table</summary>
        <div class="tablewrap"><table><thead></thead><tbody></tbody></table></div>
      </details>
    </div>
  </section>
  <section class="block" aria-labelledby="adv-h-why">
    <div class="block__rail">
      <h2 id="adv-h-why">Why the usual map misleads${DOT}</h2>
      <p>The land map colours each area by a share of the vote. The eye, though, weighs a colour by the space it covers, and areas differ enormously in how many people live in them. In 2025 Berlin had <span data-f="be-e"></span> eligible voters on <span data-f="be-km2"></span> km&sup2;; <span data-f="big-n"></span>, Germany&rsquo;s largest county, had <span data-f="big-e"></span> on <span data-f="big-km2"></span> km&sup2;. On the land map the county takes <span data-f="big-x"></span> times Berlin&rsquo;s space with <span data-f="big-p"></span> of its voters.</p>
      <p>That matters when a party does better in the countryside. In 2025 the far right beat its national <span data-f="de-res"></span> in <span data-f="de-n"></span> counties. They cover <span data-f="de-land"></span> of Germany but hold <span data-f="de-e"></span> of its eligible voters, so the land map shows the far right at <span data-f="de-avg"></span> on average. In Saxony it won <span data-f="sn-res"></span>: the <span data-f="sn-n"></span> counties where it did better cover <span data-f="sn-land"></span> of the state, while <span data-f="sn-below"></span>, below that, hold <span data-f="sn-e"></span> of the voters on <span data-f="sn-bland"></span> of the land.</p>
      <p>The far right did better in thinly populated counties in <span data-f="bias-n"></span> of the <span data-f="bias-all"></span> elections, so the land map has nearly always made it look stronger than it was: by <span data-f="bias-25"></span> in 2025.</p>
    </div>
    <div class="block__body">
      <figure class="bias" id="adv-bias">
        <figcaption><b>How much stronger the far right looks on the land map than it was</b><span>Far-right share averaged over the land map (each county weighted by its area) against the result, Germany by county; West Germany before 1990.</span></figcaption>
        <svg viewBox="0 0 640 210" role="img" aria-label="Bar chart: the land map's far-right share relative to the result, for each federal election since 1953"></svg>
      </figure>
    </div>
  </section>
  <section class="block block--text" aria-labelledby="adv-h-ways">
    <div class="block__rail">
      <h2 id="adv-h-ways">Four ways a map can mislead, and what the experts say${DOT}</h2>
    </div>
    <div class="block__body">
      <p><b>1. Land stands in for people.</b> This is the trap above, and the US county map of 2016 is its best-known case: mostly red, although the popular vote was split almost evenly. Alberto Cairo, who teaches visual journalism at the University of Miami, opens his book <em>How Charts Lie</em> (2019) with it: the map shows territory, he writes, not how citizens voted. The cartographer Kenneth Field <a href="https://cartonerd.blogspot.com/2018/07/cartographic-hyperbole.html">made the same point</a> about the New York Times&rsquo; <a href="https://www.nytimes.com/interactive/2018/upshot/election-2016-voting-precinct-maps.html">extremely detailed map of the 2016 election</a> (2018), which coloured a precinct of 100 voters just like one of 100,000. Jonathan Crowe of <a href="https://www.maproomblog.com/2018/07/the-new-york-timess-very-detailed-map-of-the-2016-u-s-presidential-election/">The Map Room</a> replied that the map was made to be zoomed into a neighbourhood, and there it works. Both are right. A land map answers &ldquo;what happened here?&rdquo; well, and &ldquo;how did the country vote?&rdquo; badly.</p>
      <p><b>2. Winner maps keep only first place.</b> Colouring each constituency in the colour of its strongest party is the most common election map, because it matches how a constituency is won. It drops everything else: the margin, the runner-up, and everyone who voted for another party. <a href="https://www.srf.ch/news/international/deutschland-wahlen-2025/wahlen-in-deutschland-schwarzer-westen-blauer-osten-so-waehlten-die-299-wahlkreise">SRF&rsquo;s map of the 299 constituencies</a> showed a blue east, the AfD ahead in 45 of 48 eastern constituencies; yet the far right won <span data-f="east"></span> of the second votes in the five eastern states, and nearly two in three voters there chose other parties. In Germany such a map also shows the vote that matters less. Seats follow the second vote, and since the 2023 reform a constituency winner gets a seat only if the party&rsquo;s second votes cover it: in 2025, <a href="https://www.bundestag.de/dokumente/textarchiv/2025/kw09-wahlkreis-unbesetzt-1055568">23 constituency winners did not enter the Bundestag</a>. A map of shares, like the ones on this page, keeps the shades in between.</p>
      <p><b>3. Smaller areas, stronger colours.</b> The same votes look different depending on the areas they are counted in; geographers call this the modifiable areal unit problem (Stan Openshaw, 1984). Small areas show local patterns that counties average away, but they also produce the extremes. No county gave the far right half of its votes in 2025 (the highest, <span data-f="top"></span>), while on the town map of <a href="${GERMANY}#towns-2025">The Far Right in Germany</a> the AfD alone passed 50% in 100 areas. Half of those counted fewer than about 2,100 valid votes, where twenty-odd votes move the share by a point. Neither map is wrong, but a reader needs to know which areas are coloured and how many people each holds.</p>
      <p><b>4. Where the steps fall.</b> Colour classes make a map readable, but where their limits lie decides what stands out, and the darkest colours draw the eye first, whatever share they stand for. Lisa Charlotte Muth of Datawrapper <a href="https://www.datawrapper.de/blog/how-to-choose-a-color-palette-for-choropleth-maps">shows</a> how classes fitted to the data can make close values look far apart and distant ones close. Both pages here use the same nine fixed classes in every election, so colours compare across the years: in 1953 two thirds of the counties sit in the lightest class, because the far right was small.</p>
    </div>
  </section>
  <section class="block block--text" aria-labelledby="adv-h-better">
    <div class="block__rail">
      <h2 id="adv-h-better">Doing better${DOT}</h2>
    </div>
    <div class="block__body">
      <p>There is no single right map, which is why this page shows five. Sizing areas by people is the most direct fix: the physicist Mark Newman and colleagues&rsquo; <a href="https://public.websites.umich.edu/~mejn/papers/election.pdf">cartograms of US elections</a>, Karim Dou&iuml;eb&rsquo;s <a href="https://www.fastcompany.com/90572489/u-">animation</a> of the 2016 county map turning into circles, and the cartogram, circles and hexagons here. Each gives up some of the familiar shape; Muth <a href="https://www.datawrapper.de/blog/cartograms">suggests</a> a cartogram when the point is how many people are affected, and a map when the point is where. Other approaches keep the map and correct it. Field <a href="https://cartonerd.blogspot.com/2016/11/the-nyt-election-map.html">proposes</a> value-by-alpha, proportional symbols and dot maps; for the 2016 US election the Financial Times chose a dot map as a compromise between map and cartogram (<a href="https://www.maproomblog.com/2016/11/the-financial-times-searches-for-a-better-election-map/">The Map Room</a>); Jonathan Schwabish shows each area&rsquo;s share together with its number of votes in a <a href="https://jschwabish.substack.com/p/beyond-the-map-how-marimekko-charts">Marimekko chart</a>.</p>
      <p>Whatever the form, two habits help most: say what the size of each area stands for, and show the numbers behind the colours, how many people each area holds and what the result was. <a href="https://www.bloomberg.com/news/articles/2020-11-03/a-complete-guide-to-misleading-election-maps">Bloomberg&rsquo;s guide</a> to misleading election maps (2020) asks the same of readers: to look at election maps critically before trusting them.</p>
    </div>
  </section>
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
<div class="tooltip" id="adv-tt" role="status" hidden></div>
<div class="pinbar" id="adv-pin" role="status" aria-label="Selected area" hidden>
  <div class="pinbar__inner"><div class="pinbar__body"></div><button type="button" class="pinbar__close" aria-label="Clear the selection">&times;</button></div>
</div>`;
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
    restorePin();
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

  // ---------- hover, and a selection that stays ----------
  // Hovering shows an area in all five maps; a click or tap keeps it (with its figures in a bar at the bottom of the
  // screen) until the same area is clicked again, the bar is closed or Escape is pressed. The selection follows the
  // view: it stays when the year or level changes, as long as the area exists there.
  const tt = $('#adv-tt'), bar = $('#adv-pin');
  let hot = null, pinned = null;          // hot: key shown now ('i<index>'); pinned: { id } of the kept area
  const idOf = (d) => (d.isState ? 's:' + d.s : 'u:' + d.u);
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
  function mark(k) {
    if (k === hot) return;
    grid.querySelectorAll('.is-hot').forEach((e) => e.classList.remove('is-hot'));
    if (k) grid.querySelectorAll('[data-k="' + k + '"]').forEach((e) => e.classList.add('is-hot'));
    grid.classList.toggle('is-focus', !!k);
    hot = k;
  }
  function tipAt(k, x, y) {
    tt.innerHTML = info(+k.slice(1));
    tt.hidden = false;
    const r = tt.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > window.innerWidth - 8) left = Math.max(8, x - r.width - 14);
    if (top + r.height > window.innerHeight - 8) top = Math.max(8, y - r.height - 14);
    tt.style.left = left + 'px';
    tt.style.top = top + 'px';
  }
  const pinnedKey = () => {
    if (!pinned || !CURRENT) return null;
    const i = CURRENT.items.findIndex((d) => idOf(d) === pinned.id);
    return i < 0 ? null : 'i' + i;
  };
  function pin(k) {
    pinned = { id: idOf(CURRENT.items[+k.slice(1)]) };
    tt.hidden = true;
    mark(k);
    bar.querySelector('.pinbar__body').innerHTML = info(+k.slice(1));
    bar.hidden = false;
  }
  function unpin() {
    pinned = null;
    bar.hidden = true;
    mark(null);
  }
  function hide() {             // hover ends: back to the kept area, if any
    tt.hidden = true;
    mark(pinnedKey());
  }
  function restorePin() {       // after a redraw
    hot = null;
    const k = pinnedKey();
    if (k) pin(k); else unpin();
  }
  grid.querySelectorAll('svg').forEach((svg) => {
    svg.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target.closest('.k');
      if (t) { mark(t.dataset.k); tipAt(t.dataset.k, e.clientX, e.clientY); } else hide();
    });
    svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
    svg.addEventListener('click', (e) => {
      const t = e.target.closest('.k');
      if (!t) return;
      if (pinned && pinnedKey() === t.dataset.k) unpin(); else pin(t.dataset.k);
    });
  });
  bar.querySelector('.pinbar__close').addEventListener('click', unpin);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pinned) unpin(); });
  window.addEventListener('scroll', () => { if (!tt.hidden) hide(); }, { passive: true });

  // ---------- the essay: figures from the data ----------
  async function fillEssay() {
    const y = 2025, M = await load('maps_' + y), byU = ROWS.get(y);
    if (!byU) return;
    const cs = M.units.map((u, i) => ({ ...byU.get(u), km2: M.km2[i] }));
    const sum = (a, f) => d3.sum(a, f);
    const res = (a) => 100 * sum(a, (d) => d.r) / sum(a, (d) => d.v);
    const F = {};
    const be = cs.find((d) => d.n === 'Berlin'), big = d3.greatest(cs, (d) => d.km2);
    F['be-e'] = fmt(be.e); F['be-km2'] = fmt(Math.round(be.km2));
    F['big-n'] = short(big.n); F['big-e'] = fmt(big.e); F['big-km2'] = fmt(Math.round(big.km2));
    F['big-x'] = d3.format('.1f')(big.km2 / be.km2); F['big-p'] = d3.format('.0%')(big.e / be.e);
    const r = res(cs), hi = cs.filter((d) => share(d) > r);
    F['de-res'] = pct(r); F['de-n'] = fmt(hi.length);
    F['de-land'] = pct(100 * sum(hi, (d) => d.km2) / sum(cs, (d) => d.km2)); F['de-e'] = pct(100 * sum(hi, (d) => d.e) / sum(cs, (d) => d.e));
    F['de-avg'] = pct(sum(cs, (d) => d.km2 * share(d)) / sum(cs, (d) => d.km2));
    const sn = cs.filter((d) => d.s === 'SN'), rs = res(sn), up = sn.filter((d) => share(d) > rs), down = sn.filter((d) => share(d) <= rs);
    F['sn-res'] = pct(rs); F['sn-n'] = up.length === 10 ? 'ten' : String(up.length);
    F['sn-land'] = pct(100 * sum(up, (d) => d.km2) / sum(sn, (d) => d.km2)); F['sn-bland'] = pct(100 * sum(down, (d) => d.km2) / sum(sn, (d) => d.km2));
    F['sn-e'] = pct(100 * sum(down, (d) => d.e) / sum(sn, (d) => d.e));
    const names = down.sort((a, b) => b.e - a.e).map((d) => short(d.n));
    F['sn-below'] = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names.at(-1) : names.join('');
    F.east = pct(res(cs.filter((d) => EAST.has(d.s))));
    const top = d3.greatest(cs, share);
    F.top = short(top.n) + ', ' + pct(share(top));
    const bias = INDEX.years.map((yy) => ({ y: yy, res: INDEX.land[yy][0], land: INDEX.land[yy][1] }));
    bias.forEach((b) => { b.rel = b.res ? 100 * (b.land / b.res - 1) : 0; });
    F['bias-n'] = String(bias.filter((b) => b.land > b.res).length); F['bias-all'] = String(bias.length);
    F['bias-25'] = d3.format('.0f')(bias.at(-1).rel) + '%';
    root.querySelectorAll('[data-f]').forEach((e) => { if (F[e.dataset.f] != null) e.textContent = F[e.dataset.f]; });
    // the bar chart: land map vs result, relative; one row per election, drawn to the width of its column
    const fig = $('#adv-bias'), svg = fig.querySelector('svg');
    const draw = () => {
      const Wc = Math.max(280, Math.round(fig.clientWidth)), row = 20, m = { t: 4, r: 140, b: 4, l: 44 }, Hc = m.t + m.b + row * bias.length;
      svg.setAttribute('viewBox', '0 0 ' + Wc + ' ' + Hc);
      svg.replaceChildren();
      const yB = d3.scaleBand(bias.map((b) => b.y), [m.t, Hc - m.b]).padding(0.25);
      const xS = d3.scaleLinear([Math.min(0, d3.min(bias, (b) => b.rel)), Math.max(5, d3.max(bias, (b) => b.rel))], [m.l, Wc - m.r]);
      bias.forEach((b) => {
        const x0 = xS(0), x1 = xS(b.rel), yy = yB(b.y), mid = yy + yB.bandwidth() / 2;
        el('text', svg, { class: 'bias__year', x: m.l - 8, y: mid.toFixed(1) }).textContent = b.y;
        el('rect', svg, { class: 'bias__bar' + (b.y === y ? ' is-now' : ''), x: Math.min(x0, x1).toFixed(1), y: yy.toFixed(1), width: Math.max(1, Math.abs(x1 - x0)).toFixed(1), height: yB.bandwidth().toFixed(1) });
        el('text', svg, { class: 'bias__val', x: (Math.max(x0, x1) + 6).toFixed(1), y: mid.toFixed(1) }).textContent =
          (b.rel >= 0.5 ? '+' : '') + d3.format('.0f')(b.rel) + '%  ' + d3.format('.1f')(b.land) + ' vs ' + d3.format('.1f')(b.res);
      });
      el('line', svg, { class: 'bias__zero', x1: xS(0).toFixed(1), x2: xS(0).toFixed(1), y1: m.t, y2: Hc - m.b });
    };
    draw();
    let lastW = fig.clientWidth;
    new ResizeObserver(() => { if (Math.abs(fig.clientWidth - lastW) > 4) { lastW = fig.clientWidth; draw(); } }).observe(fig);
  }

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
    const last = years[years.length - 1], [heroRes, heroMap] = INDEX.land[last];
    const big = (x) => d3.format('.1f')(x) + '<small>%</small>';
    $('#adv-hero-map').innerHTML = big(heroMap);
    $('#adv-hero-votes').innerHTML = big(heroRes);
    root.querySelector('[data-hero="year"]').textContent = last;
    root.querySelector('[data-hero="more"]').textContent = d3.format('.0f')(100 * (heroMap / heroRes - 1)) + '%';
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
    await go();
    fillEssay().catch(() => {});
  }
  boot();
})();
