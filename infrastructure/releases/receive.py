#!/usr/bin/env python3
"""Forced-command SSH receiver for the plugin repository's publication key."""
import os
import re
import sys
import tempfile
from pathlib import Path
from publish import MAX_BUNDLE, publish_bundle

ROOT = Path("/opt/kiochan-web/releases-data")
command = re.fullmatch(r"publish (dev|prod) ([a-f0-9]{40}-[0-9]+-[0-9]+)", os.environ.get("SSH_ORIGINAL_COMMAND", ""))
if not command:
    raise SystemExit("Only a validated plugin publication command is accepted.")
ROOT.mkdir(parents=True, exist_ok=True)
descriptor, incoming = tempfile.mkstemp(prefix=".transport-", suffix=".tar.gz", dir=ROOT)
try:
    with os.fdopen(descriptor, "wb") as stream:
        total = 0
        while chunk := sys.stdin.buffer.read(1048576):
            total += len(chunk)
            if total > MAX_BUNDLE:
                raise ValueError("Publication transport exceeds its size limit.")
            stream.write(chunk)
    publish_bundle(ROOT, Path(incoming), command[1], command[2])
finally:
    Path(incoming).unlink(missing_ok=True)
