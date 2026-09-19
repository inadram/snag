---
name: teach
description: Explain one frontend interaction practice and show its defect running in the browser. Use this whenever someone asks what a specific interaction technique is or why it matters — safe polygon, tabular numbers, scroll anchoring, focus return, hit slop, concentric radii, rubber-band overscroll, momentum, damped springs, hover intent, inert backgrounds — or asks "why does my dropdown close when I move diagonally", "why do my numbers jitter", "why does the list jump while I read", "why does focus vanish when I close this dialog". Also use it when someone wants to see what a UI practice looks like when it is missing, or wants the implementation brief for one.
---

# Teach one practice

Someone wants to understand a practice. The catalogue has 103 of them, each with
a live demo that can be shown correct or broken from a URL, and an implementation
brief written to be handed to a coding agent.

## Find it

```
${CLAUDE_PLUGIN_ROOT}/bin/snag-rules <slug>
```

If you do not know the slug, list and grep:

```
${CLAUDE_PLUGIN_ROOT}/bin/snag-rules
${CLAUDE_PLUGIN_ROOT}/bin/snag-rules --shelf     # the seventeen on the editorial shelf
```

The reader takes a partial slug and suggests near matches, so `snag-rules focus`
is usually enough to find the one they mean.

## Show it broken before you show it fixed

Every practice has two URLs, both in the reader's output:

```
.../demo.html?pattern=<slug>&off=1     the defect
.../demo.html?pattern=<slug>           the practice held
```

Lead with the broken one. The catalogue is built on the observation that these
practices are invisible when present and obvious when absent — that is why every
record carries an `offLabel` as well as an `onLabel`. Someone who has watched the
list jump under their thumb understands scroll anchoring in a way that no
description achieves, and they will remember it.

If a browser is available, open the defect URL and describe what happens, then
open the held one and name the difference in the practice's own words — the
`off / on` pair in the reader's output is written as a mirrored pair precisely so
the flip reads as a correction. If no browser is available, give both links and
say which is which.

## Then answer the question they actually asked

The reader prints the technique, the benefit, and the implementation prompt. Use
them, but do not paste all three at someone who asked a narrow question. The
prompt is for handing to a coding agent; offer it, and give it when they want to
build the thing rather than understand it.

The `fires wrongly when` list matters more than it looks. If they are about to
apply a practice everywhere, those are the cases where it is the wrong answer,
and saying so is more useful than the practice itself.

## This skill is the one that spans everything

`snag:review` surveys the Finish work shelf — seventeen practices with authored
rules. Teaching is not limited that way: the reader carries all 103 records,
each with its demo pair and its brief, because explaining a practice needs no
detection predicate. If someone asks about something off the shelf, answer it.

The shelf is at https://design.inadram.studio/house-standard/finish-work.html and `snag-rules --shelf` lists it.
