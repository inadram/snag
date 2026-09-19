---
name: apply
description: Apply one named Finish work practice to one named place in the code. Use this only after a survey has found something missing and the person has said to fix that specific finding — "yes, add tabular figures to the dashboard numbers", "fix the concentric radii on the card", "apply that colour-scheme one". This edits source, one finding at a time; it is never the right way to sweep a page.
---

# Apply one finding

One practice, one place, one diff. The plugin's read-only skills exist so that
this one can be narrow.

```
${CLAUDE_PLUGIN_ROOT}/bin/snag-apply <slug> <file>
```

The gates live in that script rather than in this file, because a gate written
in prose is a suggestion. It refuses an unknown practice, a practice with no
authored rule, a tier that does not permit an edit, anything marked `handsOff`,
a target that does not exist, and — for `--commit` — a tier below `write` or a
dirty working tree.

## Nothing is in the write tier

Today every applicable practice is `propose`: the script prints the edit, the
way to prove the edit moved something, and the cases where applying it would be
wrong. Then it stops. You read the confusables, decide, and make the edit
yourself with the normal file tools.

That is not timidity. For most of the seventeen there is no correct patch to
emit at all — `momentum` needs to know whether a rail was meant to coast, and
`per-axis-radius-correction` needs a live scale value that exists only inside
the animation's own loop. The shelf was chosen for judgement, which is a
selection against automation. And where an edit *is* expressible, correctness
still turns on intent: the
same `font-variant-numeric` declaration is right on a live counter and wrong in
body prose. The tier is widened by editing `ci/snag-deltas.json` in the
catalogue repository, which then forces the guard to demand a `verify` clause —
deliberately, so widening is a decision someone records rather than a flag
someone passes.

## Before you write

Read the `fires wrongly when` list the script prints, and say out loud which one
you ruled out and how. If you cannot, you are not ready to make the edit.

Put the declaration in the rule that owns the element, not inline and not in a
new rule at the bottom of the file — a survey finding is not a licence to
restructure someone's stylesheet.

## After you write

Prove it moved something. Every applicable rule carries a `verify` clause that
is a measurement, not an opinion: for tabular figures, render both numeric
states and compare `offsetWidth`; for concentric radii, re-measure both radii
and the padding. An edit that changes no measurement is an edit that did
nothing, and it should be reverted rather than left in the diff looking like
progress.

Then show the pair, so they can see what they now have:

```
.../demo.html?pattern=<slug>&off=1     what it looked like
.../demo.html?pattern=<slug>           what it should look like
```
