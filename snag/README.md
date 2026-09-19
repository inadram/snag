# snag

A snagging survey for frontend finish — the numbered list a surveyor hands over
after walking a finished building.

Its scope is the **Finish work shelf**: seventeen practices picked by hand from
the 103 in the [House standard](https://design.inadram.studio/house-standard),
published at
[finish-work.html](https://design.inadram.studio/house-standard/finish-work.html).
Concentric and per-axis corner radii, optical glyph centring, optical alignment,
tabular figures, declared colour scheme, hit slop, damped springs, asymmetric
easing, interruptible animation, shared element morph, shared layout indicator,
grab-point preservation, momentum, rubber-band overscroll, latched semantic zoom,
thumb-clipped label inversion.

Every one of the seventeen has an authored rule, so there is no row the tool
cannot speak to. The page is the source of truth: add an eighteenth entry there
and CI demands a rule for it.

## Install

```
/plugin marketplace add https://gitlab.com/inadram/snag.git
/plugin install snag@inadram
/snag:calibrate
```

Run calibrate first. It is the one command that shows the tool being wrong
before it shows you being wrong.

To try it for one session without installing anything, download
[snag-2.1.0.zip](https://design.inadram.studio/snag/) and point Claude Code at
the archive:

```
claude --plugin-dir ./snag-2.1.0.zip
```

The skills are there for that session and nothing is written to your settings.

## The first run asks for permission

The bundled scripts live inside the plugin, which is outside your project, so
Bash asks before running them. Interactively that is one approval at the first
`/snag:review` — say yes and the survey proceeds.

Headless (`claude -p`) there is nobody to ask, so the run is refused and the
survey refuses to guess, which is correct and not useful. Grant it the resolved
absolute path:

```
ls -d ~/.claude/plugins/cache/*/snag/*        # the plugin root, including its version
```

```
Bash(/Users/you/.claude/plugins/cache/inadram/snag/2.1.0/bin/snag-scan:*)
Bash(/Users/you/.claude/plugins/cache/inadram/snag/2.1.0/bin/snag-rules:*)
Bash(/Users/you/.claude/plugins/cache/inadram/snag/2.1.0/bin/snag-ledger:*)
```

Three things about that, all measured against 2.1.267, none of them obvious:

`${CLAUDE_PLUGIN_ROOT}` is **not** expanded inside a permission rule. This file
told you to grant `Bash(${CLAUDE_PLUGIN_ROOT}/bin/snag-scan:*)` for two
versions. It reads as though it works and it is refused every time.

A glob does not match either — neither `Bash(*/bin/snag-rules:*)` nor
`Bash(//**/snag/bin/snag-rules:*)`. Only the exact path is honoured, and the
path carries the version, so an upgrade needs the grant again. That is the real
cost of the headless route and the reason the interactive approval is the one
to prefer.

And a command containing a literal `${...}` is blocked by the sandbox before
permissions are consulted at all, so the paths in the skills have to arrive
already resolved. They do: the harness expands `${CLAUDE_PLUGIN_ROOT}` when it
loads a SKILL.md, and what reaches the model is an absolute path.

Measured: the first end-to-end run against a real four-file app produced no
survey and named the three blocked commands. The end-to-end suite writes exactly
this grant before it starts, and grades the run against an expectation written
first.

## The four skills

| | |
|---|---|
| `/snag:teach` | one practice, its defect running in the browser, and the implementation brief. Spans all 103, not just the shelf — explaining needs no detector. Needs no repository. |
| `/snag:review` | the survey of the seventeen. Seventeen rows, always. Read-only, enforced by a hook rather than a promise. |
| `/snag:apply` | one named finding, in one named file, behind seven gates. |
| `/snag:calibrate` | the tool measured against known-correct and known-broken pages. |

## What it will not do

It will not sweep a page and fix it. Nothing is in the `write` tier: four of the
seventeen are `propose` — the edit is drafted and you read the diff — eight are
`brief`, and five are `teach`, where there is no mechanical signal at all.

That is not timidity, it is the shelf. These are practices chosen because they
would never be raised in review, which is a selection for judgement and
therefore a selection against automation. `momentum` needs to know whether a
rail was *meant* to coast, and nothing in the DOM distinguishes a scroller that
should coast from a split pane that must stop dead. `per-axis-radius-correction`
needs a live scale value that exists only inside the animation's own loop.

It also will not patch a running page. That fixes the pixels and not the
repository — the change lasts until reload and is absent from the next deploy,
while the team believes the defect is gone. `inspect.js` measures in the browser
and returns JSON; edits happen in source.

What the predicates actually scored, including the measurement errors, is
written up at
[design.inadram.studio/snag](https://design.inadram.studio/snag/). On the first
run, four of five hard negatives produced a false positive. The calibration
fixtures and the end-to-end suite live in the catalogue repository, which is
private; the page carries the numbers.

## Layout

```
bin/snag-rules      read one rule, or list the seventeen
bin/snag-scan       one traversal of a source tree, twelve source predicates
bin/snag-ledger     render the survey, and refuse to render a partial one
                    (SNAG_RECORD=<path> also writes the accepted rows as JSON)
bin/snag-apply      the only thing that writes, and it currently never does
inspect.js          page-side measurement, four runtime predicates, mutates nothing
hooks/              keeps review and calibrate read-only at execution time
rules.json          generated from the shelf; never edit by hand
```

MIT.
