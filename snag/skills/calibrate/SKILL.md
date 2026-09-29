---
name: calibrate
description: Measure this tool against known-correct and known-broken pages before trusting it. Use this when someone installs snag for the first time, asks how accurate it is, doubts a finding, or after any rule change. It reports the tool being wrong before it reports anyone else being wrong.
---

# Measure the tool

This skill never edits. It measures and reports; a hook refuses Edit, Write,
MultiEdit and NotebookEdit while it runs. When a rule fails calibration the
change belongs in `ci/snag-deltas.json` in the catalogue repository, which is a
deliberate, separate act.

Run this first. An audit tool that has never been measured is an opinion with a
table.

## Two corpora, and the second one matters more

**Corpus A — the shelf's own demos.** Every practice publishes both states as a
URL, so the seventeen give 17 labelled positives and 17 labelled negatives,
already built and already verified by the catalogue's own CI:

```
.../demo.html?pattern=<slug>          the practice held      → expect `held`
.../demo.html?pattern=<slug>&off=1    the defect             → expect `missing`
```

For each practice with a runtime detector, load both, run `snagInspect()` from
`${CLAUDE_PLUGIN_ROOT}/inspect.js`, and record what the predicate said. That
gives sensitivity: does the rule fire when the defect is genuinely there.

One measured caveat, recorded in `ci/fixtures/calibration.md`: the demos are
325px stylised illustrations, not realistic markup. `hit-slop`'s demo has zero
interactive elements in either state, so it cannot calibrate a DOM-shaped
predicate at all. `concentric-corner-radii`'s is a genuine labelled pair —
outer 18, padding 14, inner 16 in the defect and exactly 4 when held, on a 44px
inner box — and the predicate separates it. `color-scheme`'s differs only on its
dark panel, so it separates on the surface check and never on `:root`, which the
demo shell declares light in both states. Check which you have before trusting a
score.

**Corpus B — `ci/fixtures/` in the catalogue repository.** Small hand-written
pages where a naive predicate fires and the fix would be wrong: tabular figures
proposed on body prose, hit-slop proposed on a target already inside a 44px
parent, concentric radii proposed on a pill inside a card, dark proposed for a
light card inside a dark page. These are the confusables made runnable.

`ci/fixtures/broken/` runs the other way, for the source predicates, which
corpus A never loads. Each page carries a defect and names the practice in its
`EXPECT:` line. Run `${CLAUDE_PLUGIN_ROOT}/bin/snag-scan <page>` on each, and
check the location too when the line names one. A CLEAR there is a false clear,
and a CLEAR is the predicate quote an `n/a` row is built on, so the survey can
call the practice not applicable on a page that has the defect.

Corpus A alone measures only sensitivity, and a predicate that returns "missing"
for everything scores perfectly on it. Corpus B is what stops that. Report both
or neither.

## What to report

```
corpus A   4 runtime detectors, 8 loads
           fired on the defect ......... n/4
           stayed quiet on the fix ..... n/4
corpus B   fixtures
           correctly abstained ......... n/n
           false positives ............. n   ← the number that matters
           known broken, fired ......... n/n
           false clears ................ n
```

Name every false positive and every false clear with its fixture, because that
is the list of places this tool would have given someone bad advice.

## When a rule fails calibration

Do not fix the fixture. Either tighten the precondition in
`ci/snag-deltas.json`, or drop the practice to a lower tier — `brief` reports a
location without proposing an edit, and that is the honest home for a predicate
that cannot separate its own two demos. Then re-run `ci/check-snag.py`, which
will hold the new shape to the rules.

## The practices with no detector

Every shelf practice has a rule; twelve have a source predicate and four a
runtime one. The rest are not a corpus failure — they report as
`unsure/needs-detector`, which is visible, counted, and never mistaken for
"checked and fine". Five of the seventeen are tier `teach` and will never have
a detector, because there is no mechanical signal to compile.
