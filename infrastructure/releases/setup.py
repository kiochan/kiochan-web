#!/usr/bin/env python3
"""Prepare the public mount and add a restricted publisher key, preserving SSH access."""
import argparse
import os
import re
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--key", required=True)
args = parser.parse_args()
key = Path(args.key).read_text().strip()
if not re.fullmatch(r"ssh-ed25519 [A-Za-z0-9+/=]+(?: [a-zA-Z0-9._-]+)?", key):
    raise SystemExit("Expected one Ed25519 public key.")
root = Path("/opt/kiochan-web/releases-data")
if root.is_symlink():
    raise SystemExit("Release mount cannot be a link.")
root.mkdir(parents=True, exist_ok=True)
os.chmod(root, 0o755)
ssh = Path.home() / ".ssh"
ssh.mkdir(mode=0o700, exist_ok=True)
authorized = ssh / "authorized_keys"
if authorized.is_symlink():
    raise SystemExit("Authorized keys cannot be a link.")
existing = authorized.read_text() if authorized.exists() else ""
if key.split()[1] not in existing:
    with authorized.open("a") as stream:
        if existing and not existing.endswith("\n"):
            stream.write("\n")
        stream.write('restrict,command="python3 /opt/kiochan-web/releases/receive.py" ' + key + "\n")
os.chmod(authorized, 0o600)
print("Public release mount and restricted plugin publisher are configured.")
