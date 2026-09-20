# snag

A Claude Code plugin. It surveys a page against the seventeen practices on the
**Finish work** shelf of the [House standard](https://design.inadram.studio/house-standard)
and reports what is held, what is missing, what it could not decide and what
does not apply — one row per practice, every time, with the evidence located.

Read-only by default. Nothing in it writes unattended.

```
/plugin marketplace add https://gitlab.com/inadram/snag.git
/plugin install snag@inadram
/snag:calibrate
```

Run `calibrate` first. It is the one command that shows you the tool being
wrong before it shows you being wrong.

To try it for one session without installing anything, download the archive
from [design.inadram.studio/snag](https://design.inadram.studio/snag/) and
point Claude Code at it:

```
claude --plugin-dir ./snag-2.1.0.zip
```

## What is in here

```
.claude-plugin/marketplace.json   the catalogue, so this repo is a marketplace
snag/                             the plugin itself
```

`snag/README.md` is the full documentation: what each of the four skills does,
the permission the first run asks for and why the obvious way to grant it does
not work, what the predicates scored when they were measured, and a table of the
seventeen practices where every name opens that practice's demo running live in
the browser with the practice switched off. That table is generated from the
rulepack, so it cannot drift away from what the tool actually checks.

The plugin is generated from the catalogue — `snag/rules.json` is built from
the shelf page and should never be edited by hand. This repository is a
published copy; the catalogue it comes from is private.

There are two published copies, and they are kept byte-identical:
[gitlab.com/inadram/snag](https://gitlab.com/inadram/snag), which the install
command on the site points at, and
[github.com/inadram/snag](https://github.com/inadram/snag), which exists because
the Anthropic plugin directory pins to a GitHub commit. The catalogue's build
clones both on every commit and fails if either has fallen behind `plugin/snag`,
because a stale mirror serves an old plugin without saying so.

## Where the practices live

Every one of the seventeen has a page with a live demo you can switch between
held and broken, and an implementation brief written to be handed to a coding
agent:

- the shelf — <https://design.inadram.studio/house-standard/finish-work.html>
- all 103 — <https://design.inadram.studio/house-standard/>
- this tool — <https://design.inadram.studio/snag/>

MIT.
