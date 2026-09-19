# Method notes for a whole-tree run

Load this when the target is a repository rather than one component.

## Order the work by what a reader feels

The ledger sorts by state, then by shelf membership, then by slug. Report in
that order. Someone reading a 103-row table stops after the first screen, so the
rows that matter have to be at the top: what is missing, shelf practices first.

## Sampling is a lie unless you say so

A tree of 400 components cannot be surveyed element by element. If you sample,
the ledger must still carry 103 rows and the rows have to say what was sampled —
`missing` on the strength of three components out of forty is honest only if the
row says three of forty. Silent sampling is how a survey becomes decoration.

## Frameworks change what the source can tell you

JSX and template syntax defeat selector-shaped predicates. A `className` built
from a conditional, a styled-component, a Tailwind string assembled at runtime —
none of these are readable statically with any confidence. When the source is
opaque, say `unsure/needs-runtime` and drive the real page instead. Guessing
from a class name is where a survey earns a reputation for false positives.

## Design systems invert several predicates

A page built on a component library often holds a practice in the library rather
than the page. `hit-slop` satisfied by a `<Button>` primitive is held, and
reporting it missing on every call site is noise. Check the primitive before
reporting the instance, and report the primitive once.

## The counts are not a score

Resist turning the ledger into a percentage. The catalogue is 103 practices of
which most do not apply to any given page, so a ratio is meaningless and invites
someone to chase it. The useful number is the count of `missing` rows and the
count of `unsure` rows — the second one tells you how much the tool could not
see, which is usually the more important figure.
