#!/usr/bin/env python3
"""Prepare the public mount and add a restricted publisher key, preserving SSH access."""
import argparse
import os
import re
from publish import PRODUCER_PRODUCTS
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--key", required=True)
parser.add_argument("--repository", choices=sorted(PRODUCER_PRODUCTS), required=True)
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
# Replace only this publisher's entry, so an older unscoped forced command
# cannot retain access to a product that has moved to another repository.
entry = 'restrict,command="python3 /opt/kiochan-web/releases/receive.py --repository ' + args.repository + '" ' + key
lines = existing.splitlines()
matching = [index for index, line in enumerate(lines) if key.split()[1] in line.split()]
if len(matching) > 1:
    raise SystemExit("Duplicate publisher key entries require operator review.")
if matching:
    lines[matching[0]] = entry
else:
    lines.append(entry)
temporary = ssh / "authorized_keys.release-new"
if temporary.exists() or temporary.is_symlink():
    raise SystemExit("Unexpected temporary authorized keys file.")
with temporary.open("x") as stream:
    os.chmod(temporary, 0o600)
    stream.write("\n".join(lines) + "\n")
os.replace(temporary, authorized)
os.chmod(authorized, 0o600)
print("Public release mount and restricted plugin publisher are configured.")
