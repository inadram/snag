#!/usr/bin/env python3
"""Deny a write while a read-only snag skill is the one running.

The prohibition used to live in review/SKILL.md's `description`, which the model
reads when it decides whether to invoke the skill and not while it works.
Measured in an isolated session: the skill fired, surveyed a file, and then
edited it.

`allowed-tools` in the frontmatter is the obvious fix and is not available — on
2.1.267 it makes the Skill invocation itself fail, so the skill never runs and
the model reaches for Write instead. The file changed anyway. This hook is the
version that works: the skill still loads, and the write is refused with a
reason the model can act on.

Two deliberate limits, both stated rather than hidden. It does not match Bash,
because a survey legitimately needs to run the bundled scripts and a
write-detecting shell matcher is guesswork; the skill body carries that
instruction instead. And it stands down the moment a human speaks again, so a
survey can never leave the rest of a session unable to edit anything.

It fails open. A hook that blocks a write because it could not parse its own
input would be worse than no hook.
"""
import json
import pathlib
import sys

READ_ONLY = ('"snag:review"', '"snag:calibrate"')
RELEASE = ('"snag:apply"',)

try:
    event = json.load(sys.stdin)
except Exception:
    sys.exit(0)

path = event.get("transcript_path") or ""
if not path or not pathlib.Path(path).exists():
    sys.exit(0)

active = False
try:
    lines = pathlib.Path(path).read_text(errors="replace").splitlines()
except OSError:
    sys.exit(0)

for line in lines:
    if '"type":"user"' in line and '"tool_result"' not in line:
        active = False
    elif '"skill"' not in line:
        continue
    elif any(s in line for s in RELEASE):
        active = False
    elif any(s in line for s in READ_ONLY):
        active = True

if active:
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason":
            "snag:review and snag:calibrate are read-only. Name the practice, the file "
            "and the line in the ledger, then hand that one finding to /snag:apply.",
    }}))
sys.exit(0)
