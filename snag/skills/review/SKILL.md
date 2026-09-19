---
name: review
description: Survey a page, a component, a section or a single element against the seventeen Finish work practices — the hand-picked finish details from the House standard: concentric and per-axis corner radii, optical glyph centring and optical alignment, tabular figures, declared colour scheme, hit slop, damped springs, asymmetric easing, interruptible animation, shared element morph and layout indicator, grab-point preservation, momentum, rubber-band overscroll, latched semantic zoom and thumb-clipped labels — and report what is held, what is missing, what is uncertain and what does not apply. Use this whenever someone asks for a UI polish pass, an interaction review, a design-quality check, a "what am I missing" on a component, a frontend craft audit, or says their page feels unfinished, cheap, janky or not quite right. Also use it before shipping a component, when reviewing a PR that touches interaction code, or when someone asks to apply the House standard to something. Read-only — it never edits.
---

# Survey a target against the standard

This skill never edits. Do not call Edit, Write, MultiEdit or NotebookEdit, and do
not write a file through a shell command either. A hook refuses the first four
while this skill is running; the shell is on your honour, because a survey needs
to run the bundled scripts and no matcher can tell `snag-scan` from `> file`.

If you find yourself arguing with the refusal, the finding belongs in the ledger
and the edit belongs to `/snag:apply`.

The output is a ledger: one row per practice, always all seventeen, in one of
five states. The refusal to drop a row is the point — an audit tool stops being
trusted the moment something can fall off the bottom without anyone noticing.

The scope is the Finish work shelf and nothing else: https://design.inadram.studio/house-standard/finish-work.html. Seventeen
practices chosen by hand for judgement, every one with an authored rule, so
there is no row the tool cannot speak to. If someone asks about a practice
outside the shelf, that is `snag:teach` — the catalogue has 103 and teaching
works for all of them.

## Scope first

Ask what the target is if it is not obvious, because the answer changes which
predicates can run at all:

- **a source tree or a file** — static predicates only; anything needing layout
  or a gesture is `unsure/needs-runtime`
- **a URL, with a browser available** — runtime predicates too, which are far
  more accurate
- **one element or selector** — narrow both, and every practice outside the
  scope is `scoped-out`, not `n/a`

Both together is the good case. Run the source scan for locations and the
runtime inspector for measurements, and reconcile.

## Run

```
${CLAUDE_PLUGIN_ROOT}/bin/snag-scan <path> --json
```

One traversal, every compiled source predicate, a line each. It prints CLEAR for
predicates that ran and did not match, not only the hits, because that CLEAR
line is the evidence a later `n/a` row depends on. It exits 2 rather than
reporting anything if it read no files — an empty result from a search that
never ran looks exactly like one that found nothing, and this repository has
shipped that bug three times.

With a browser, load `${CLAUDE_PLUGIN_ROOT}/inspect.js` into the page and call
`snagInspect()`, `snagInspect('.some-section')` or `snagInspect(element)`. It
measures and returns JSON; it mutates nothing. Read `references/runtime.md`
with the Read tool — not `cat`, which needs its own Bash grant and was refused
in testing — for the driving protocol before you start.

Then, for any practice you are judging, read its rule:

```
${CLAUDE_PLUGIN_ROOT}/bin/snag-rules <slug>
```

## Judge, do not just report

A hit is a candidate. Every rule carries a `fires wrongly when` list, and that
list is the work. On a real page the source predicates fire constantly — run against this
catalogue's own source, all twelve compiled predicates hit. A row
only becomes `missing` when you have read the confusables and ruled each one
out, and the row has to say where.

The states and what each obliges you to carry:

| state | means | must carry |
|---|---|---|
| `held` | present, and you can point at it | the line, declaration or measurement |
| `missing` | applies here, absent, confusables ruled out | the location, and how each confusable was cleared |
| `unsure` | applies, and you cannot decide | `blockedBy`: `needs-runtime`, `needs-gesture`, `needs-intent` or `needs-detector` |
| `n/a` | the precondition is provably absent, **and the predicate actually ran** | the predicate, quoted |
| `scoped-out` | excluded by the narrowing you were given | the selector or path that excluded it |

Two of those carry the design's whole honesty. An `n/a` must quote the predicate
that ran, because "clear" with nothing behind it is indistinguishable from
"forgotten". And a precondition you could not evaluate — no browser, no gesture,
a component that only mounts on click — is `unsure`, never `n/a`. A source-only
run must not report "no overlay in scope" for a dialog that mounts on click.

Every shelf practice has a rule, but not every rule has a compiled detector —
`snag-scan` carries twelve and the runtime inspector four. A practice with no
detector for the mode you ran in is `unsure/needs-detector`. Never `n/a`: the
tool could not look, which is not the same as the practice not applying.

## Render

Hand your findings to the ledger as its first argument, JSON in single quotes:

```
${CLAUDE_PLUGIN_ROOT}/bin/snag-ledger '[{"slug":"tabular-numbers","state":"missing","where":"src/Stat.tsx:22"}, ...]'
```

Do not reach for a heredoc, and do not pipe `cat` or `python3` into it. A
heredoc carrying JSON is refused by the sandbox before permissions are
consulted — "Contains brace with quote character (expansion obfuscation)" — and
a pipeline's first word has to be a command you are allowed to run, which `cat`
and `python3` may not be. Measured: a run spent five attempts on heredoc
variants and produced no survey at all. The form above is one command whose
first word is the granted path, which is the form that works. `echo '<json>' |`
also works. If a note needs an apostrophe, write the JSON to a file and pass the
path instead — the ledger takes either.

It exits non-zero on a partial survey, a state it does not recognise, an `n/a`
with no predicate, an `unsure` with no `blockedBy`, or a `held`/`missing` with
no location. If it refuses, the survey is wrong — fix the survey rather than the
ledger.

If the ledger cannot run at all — sandboxed, not approved, missing — do not
render a survey. Say what blocked it, give the exact command that needs
approval, and stop. Replaying the predicates by hand and presenting the result
as a survey drops the row-count check, the location requirement and the
needs-rule refusal all at once, which is the whole reason the ledger exists.

## Then hand over

For each `missing` row, the useful handover is the defect URL
(let them watch it), the location, and the implementation prompt from
`snag-rules <slug>` — in that order. For the `propose` tier, `snag apply` will
draft the edit.

Do not offer to fix everything. Before a whole-tree run, read
`references/method.md` with the Read tool for the parts of the method that do
not fit here.
