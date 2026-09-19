# Driving the page

Load this only when a browser is available and the target is a URL.

## Get the inspector in

`${CLAUDE_PLUGIN_ROOT}/inspect.js` defines one function and exports nothing to
the page's globals beyond it. Read the file and evaluate its contents in the
page, then call it. It works in Claude in Chrome, the Browser pane, Playwright's
`page.evaluate`, or a pasted devtools console — it is a string of JavaScript
precisely so it does not need a bundled browser.

## It measures; it must never fix

The inspector mutates nothing, and that is not a limitation to work around.
Automatic repair of someone else's live page fixes the pixels and not the
repository: the patch lasts until reload, is absent from the next deploy, and
leaves the team believing the defect is gone while source still ships it. It is
also a category with a regulator attached — the FTC's January 2025 order against
accessiBe, final in April 2025, fined a $1M penalty over claims that an
automated overlay would make sites compliant, and the complaint alleged the
widget created barriers on the sites that installed it.

So: measure in the page, edit in the repository.

## What the page will not tell you

Several preconditions need a gesture or an intent that no probe supplies.

- **A gesture.** `grab-point-preservation`, `momentum`, `rubber-band-overscroll`
  and `semantic-zoom` need a real drag with real velocity. Synthetic events do
  not drive native behaviour, and a `WheelEvent` you dispatch yourself will not
  step a native number input. If you cannot perform the gesture,
  `unsure/needs-gesture`.
- **An intent.** Nothing distinguishes a rail that should coast from a slider, a
  split pane or a sortable row that must stop dead. `unsure/needs-intent` and
  ask the person.
- **A state that has not mounted.** A dialog that only exists after a click is
  not absent, it is unmounted. Open it and re-run, or `unsure/needs-runtime`.

## Re-run after every state change

The inspector is a snapshot. Open the menu, then inspect. Expand the row, then
inspect. A single measurement of the initial state will report a page of overlay
practices as not applicable, which is the worst kind of wrong: confident and
silent.

## Calibrate against the catalogue's own demos

Every practice publishes both states as a URL:

```
.../demo.html?pattern=<slug>          the practice held
.../demo.html?pattern=<slug>&off=1    the defect
```

That is 103 labelled positives and 103 labelled negatives. If a predicate cannot
separate those two for its own practice, it will not separate anything on a real
page. The `calibrate` skill runs that sweep.
