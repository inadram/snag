/* The page-side detector for the Finish work shelf. It measures and returns
 * JSON. It mutates nothing.
 *
 * It carries a predicate only for a practice the plugin carries. A detector for
 * anything else can only produce a row the ledger refuses, which is worse than
 * no detector: it reads as coverage.
 *
 * This is deliberately a string of JavaScript rather than a bundled browser,
 * so it runs in whatever the session already has — Claude in Chrome, the
 * Browser pane, Playwright, a devtools console. A plugin cannot ship a browser;
 * it can ship the thing to run in one.
 *
 * It never fixes anything. Automatic repair of someone else's live page is the
 * accessibility-overlay design, which fixes the pixels and not the repository,
 * lasts until reload, and is absent from the next deploy while the team believes
 * the defect is gone. Findings go back to the agent, which edits source.
 *
 *   snagInspect()                 whole document
 *   snagInspect('.card')          one section
 *   snagInspect(element)          one element
 */
function snagInspect(target) {
  const root = typeof target === 'string' ? document.querySelector(target) : (target || document.body);
  if (!root) return { error: 'no element matched ' + target };
  const all = [root, ...root.querySelectorAll('*')];
  const cs = el => getComputedStyle(el);
  const at = el => {
    const id = el.id ? '#' + el.id : '';
    const c = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '';
    return el.tagName.toLowerCase() + id + c;
  };
  const out = { scope: at(root), elements: all.length, findings: {}, ran: [] };
  const record = (slug, hits, predicate) => {
    out.ran.push(slug);
    out.findings[slug] = { hits, predicate, count: hits.length };
  };

  const PROSE = 'p,article,blockquote,figcaption,li:not([class]),dd';
  record('tabular-numbers',
    all.filter(e => !e.children.length && /\d/.test(e.textContent || '') &&
        !cs(e).fontVariantNumeric.includes('tabular-nums') &&
        !e.closest(PROSE) &&
        // A figure in a sentence is prose whatever its container is called.
        (e.textContent || '').trim().split(/\s+/).length <= 4)
       .map(e => ({ at: at(e), text: (e.textContent || '').trim().slice(0, 24) })).slice(0, 40),
    'short non-prose leaf text containing a digit, with no tabular-nums');

  // Relative luminance, null for a mostly transparent colour, undefined for one
  // that is not rgb() and so cannot be read without guessing.
  const lum = c => {
    const m = /^rgba?\(([^)]+)\)$/.exec(c);
    if (!m) return undefined;
    const v = m[1].split(/[\s,/]+/).map(Number);
    if (v.length > 3 && v[3] < 0.5) return null;
    const [R, G, B] = v.slice(0, 3).map(x => x / 255)
      .map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  // A field is painted against the nearest opaque background behind it, not
  // the page: a light card inside a dark page is a light surface.
  const surface = e => {
    for (let n = e.parentElement; n; n = n.parentElement) {
      const l = lum(cs(n).backgroundColor);
      if (l === undefined) return null;
      if (l !== null) return { n, l };
    }
    return null;
  };
  const r = cs(document.documentElement).colorScheme;
  record('color-scheme',
    [...((r && r !== 'normal') ? [] : [{ at: ':root', colorScheme: r,
      bodyBackground: cs(document.body).backgroundColor }]),
     ...all.filter(e => e.matches('select,textarea,input:not([type="hidden"])') && e.getClientRects().length &&
                        !cs(e).colorScheme.includes('dark') && lum(cs(e).backgroundColor) > 0.5)
       .flatMap(e => { const s = surface(e);
         return s && s.l < 0.18 ? [{ at: at(e), surface: at(s.n), colorScheme: cs(e).colorScheme,
           surfaceBackground: cs(s.n).backgroundColor, fieldBackground: cs(e).backgroundColor }] : []; })
       .slice(0, 20)],
    'computed color-scheme on the document element, and native fields painted light on a dark surface whose scheme has no dark');

  // The rule counts a pseudo-element on the control itself as hit area, so a
  // ::before or ::after positioned against the control and taking presses
  // widens the box it is measured by. One on an ancestor never does: that is
  // the phantom target, not slop.
  const hitBox = e => {
    const b = e.getBoundingClientRect();
    let w = b.width, h = b.height;
    if (cs(e).position !== 'static' && e.offsetWidth) {
      const k = b.width / e.offsetWidth;
      for (const p of ['::before', '::after']) {
        const s = getComputedStyle(e, p);
        if (['none', 'normal'].includes(s.content) || s.display === 'none' ||
            s.pointerEvents === 'none' || s.position !== 'absolute') continue;
        const sum = (...v) => v.reduce((a, x) => a + (parseFloat(s[x]) || 0), 0);
        const inner = s.boxSizing === 'border-box';
        w = Math.max(w, k * (inner ? sum('width') : sum('width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth')));
        h = Math.max(h, k * (inner ? sum('height') : sum('height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth')));
      }
    }
    return [Math.round(w), Math.round(h)];
  };
  record('hit-slop',
    all.filter(e => e.matches('a[href],button,input,select,[role="button"],[tabindex]:not([tabindex="-1"])'))
       .map(e => ({ at: at(e), box: hitBox(e),
                    // SC 2.5.8 exempts a target already enclosed by a big enough one.
                    covered: (n => { for (n = e.parentElement; n; n = n.parentElement) {
                      const b = n.getBoundingClientRect();
                      if (b.height >= 24 && b.width >= 24 &&
                          (cs(n).cursor === 'pointer' || n.matches('a[href],button,[role="button"],li,tr')))
                        return true; } return false; })() }))
       .filter(x => x.box[0] && x.box[1] && (x.box[0] < 24 || x.box[1] < 24) && !x.covered).slice(0, 40),
    'interactive elements under 24x24, counting a ::before or ::after on the control itself, whose enclosing target is not already large enough');

  record('concentric-corner-radii',
    all.flatMap(e => {
      const pr = parseFloat(cs(e).borderTopLeftRadius) || 0;
      if (pr <= 0) return [];
      return [...e.children].flatMap(k => {
        const kr = parseFloat(cs(k).borderTopLeftRadius) || 0;
        const pad = parseFloat(cs(e).paddingTop) || 0;
        if (kr <= 0 || pad <= 0) return [];
        const kb = k.getBoundingClientRect();
        const deliberate = kr >= Math.min(kb.width, kb.height) / 2 - 0.5;
        return (!deliberate && Math.abs(kr - (pr - pad)) > 1)
          ? [{ at: at(k), outer: pr, padding: pad, inner: kr, wants: Math.max(0, pr - pad) }] : [];
      });
    }).slice(0, 30),
    'a rounded child of a rounded parent where inner != outer - padding, by more than 1px');




  out.note = 'Hits are candidates, not defects. Each one has to be judged against ' +
             'that rule’s confusables before it means anything. ' +
             'Practices absent from "ran" were not evaluated here and are unsure, not clear.';
  return out;
}
if (typeof module !== 'undefined') module.exports = { snagInspect };
