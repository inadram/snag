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

  const r = cs(document.documentElement).colorScheme;
  record('color-scheme',
    (r && r !== 'normal') ? [] : [{ at: ':root', colorScheme: r,
      bodyBackground: cs(document.body).backgroundColor }],
    'computed color-scheme on the document element');

  record('hit-slop',
    all.filter(e => e.matches('a[href],button,input,select,[role="button"],[tabindex]:not([tabindex="-1"])'))
       .map(e => ({ at: at(e), box: (b => [Math.round(b.width), Math.round(b.height)])(e.getBoundingClientRect()),
                    // SC 2.5.8 exempts a target already enclosed by a big enough one.
                    covered: (n => { for (n = e.parentElement; n; n = n.parentElement) {
                      const b = n.getBoundingClientRect();
                      if (b.height >= 24 && b.width >= 24 &&
                          (cs(n).cursor === 'pointer' || n.matches('a[href],button,[role="button"],li,tr')))
                        return true; } return false; })() }))
       .filter(x => x.box[0] && x.box[1] && (x.box[0] < 24 || x.box[1] < 24) && !x.covered).slice(0, 40),
    'interactive elements under 24x24 whose enclosing target is not already large enough');

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
