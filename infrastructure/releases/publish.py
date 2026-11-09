#!/usr/bin/env python3
"""Publish public Markdown and packages without rebuilding the website image."""
import argparse
import contextlib
import datetime
import hashlib
import json
import os
import re
import shutil
import sys
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

SLUG = re.compile(r"[a-z0-9][a-z0-9-]{0,63}\Z")
REVISION = re.compile(r"[a-z0-9][a-z0-9.-]{0,127}\Z")
PACKAGE = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9._-]*\.zip\Z")
PRODUCER_PRODUCTS = {
    "kiochan/photoshop-panel-tools": {"panel-tools"},
    "kiochan/kio-color-picker-photoshop": {"kio-color-picker"},
    "kiochan/photoshop-run-actions": {"run-actions"},
}
MAX_BUNDLE = 536870912

def require(condition, message):
    if not condition:
        raise ValueError(message)

def string(value, limit):
    return isinstance(value, str) and 0 < len(value) <= limit and all(ord(character) >= 32 for character in value)

def release_document(path, slug):
    require(path.stat().st_size <= 262144, "Release document exceeds its size limit.")
    document = path.read_text(encoding="utf-8")
    match = re.fullmatch(r"---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)", document)
    require(match is not None and len(match[1]) <= 32768, "Expected JSON front matter and Markdown.")
    data = json.loads(match[1])
    require(isinstance(data, dict) and data.get("slug") == slug and SLUG.fullmatch(slug), "Invalid product identity.")
    for key, limit in [("title", 100), ("summary", 400), ("version", 80), ("publishedAt", 40), ("buildCommit", 40)]:
        require(string(data.get(key), limit), "Invalid release text metadata.")
    require(re.fullmatch(r"\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?", data["version"]), "Invalid version.")
    require(re.fullmatch(r"[a-f0-9]{40}", data["buildCommit"]), "Invalid build commit.")
    require(re.fullmatch(r"\d{4}-\d\d-\d\dT.*Z", data["publishedAt"]), "Invalid publication date.")
    datetime.datetime.fromisoformat(data["publishedAt"].replace("Z", "+00:00"))
    require(data.get("status") in {"trial", "stable", "experimental"}, "Invalid release status.")
    require(isinstance(data.get("compatibility"), list) and len(data["compatibility"]) <= 12 and all(string(value, 160) for value in data["compatibility"]), "Invalid compatibility targets.")
    require(isinstance(data.get("downloads"), list) and 1 <= len(data["downloads"]) <= 8, "Invalid download list.")
    ids = set()
    for file in data["downloads"]:
        require(isinstance(file, dict) and string(file.get("id"), 64) and SLUG.fullmatch(file["id"]) and file["id"] not in ids, "Duplicate or invalid download ID.")
        ids.add(file["id"])
        require(string(file.get("file"), 120) and PACKAGE.fullmatch(file["file"]) and string(file.get("label"), 100), "Invalid package filename.")
        require(type(file.get("bytes")) is int and 1 <= file["bytes"] <= 1073741824 and isinstance(file.get("sha256"), str) and re.fullmatch(r"[a-f0-9]{64}", file["sha256"]), "Invalid package integrity metadata.")
    return data

def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest() if hasattr(hashlib, "file_digest") else hash_stream(stream)

def hash_stream(stream):
    algorithm = hashlib.sha256()
    while chunk := stream.read(1048576):
        algorithm.update(chunk)
    return algorithm.hexdigest()

def catalogue(path):
    if not path.exists():
        return {"schema": 1, "products": {}}
    require(not path.is_symlink() and path.stat().st_size <= 32768, "Invalid catalogue file.")
    data = json.loads(path.read_text())
    require(isinstance(data, dict) and type(data.get("schema")) is int and data["schema"] == 1 and isinstance(data.get("products"), dict) and len(data["products"]) <= 100, "Invalid existing catalogue.")
    require(all(SLUG.fullmatch(key) and isinstance(value, str) and REVISION.fullmatch(value) for key, value in data["products"].items()), "Invalid catalogue identity.")
    return data

def atomic_json(path, value):
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix=".catalog-")
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(value, stream, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

@contextlib.contextmanager
def publication_lock(path):
    with path.open("a+b") as stream:
        if os.name == "nt":
            import msvcrt
            if stream.tell() == 0:
                stream.write(b"0")
                stream.flush()
            stream.seek(0)
            msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(stream.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            yield
        finally:
            if os.name == "nt":
                stream.seek(0)
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(stream.fileno(), fcntl.LOCK_UN)

def unpack(bundle, stage):
    require(bundle.is_file() and bundle.stat().st_size <= MAX_BUNDLE, "Bundle is missing or too large.")
    seen = set()
    total = 0
    with tarfile.open(bundle, "r:gz") as archive:
        for count, item in enumerate(archive, 1):
            require(count <= 256, "Too many bundle entries.")
            name = item.name.rstrip("/")
            parts = PurePosixPath(name).parts
            require(name and not name.startswith("/") and "\\" not in name and all(part not in {".", ".."} and re.fullmatch(r"[a-zA-Z0-9._-]+", part) for part in parts), "Unsafe bundle path.")
            require(name not in seen and (item.isfile() or item.isdir()), "Duplicate paths and links are not supported.")
            seen.add(name)
            require(name == "bundle.json" or parts[0] == "products", "Unexpected bundle entry.")
            target = stage.joinpath(*parts)
            if item.isdir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            total += item.size
            require(0 <= item.size <= MAX_BUNDLE and total <= MAX_BUNDLE, "Expanded bundle exceeds its size limit.")
            target.parent.mkdir(parents=True, exist_ok=True)
            source = archive.extractfile(item)
            require(source is not None, "Missing bundle payload.")
            with source, target.open("xb") as output:
                shutil.copyfileobj(source, output, length=1048576)
            require(target.stat().st_size == item.size, "Incomplete bundle entry.")

def validate_product(folder, slug):
    data = release_document(folder / "release.md", slug)
    expected = {"release.md"}
    for package in data["downloads"]:
        relative = "downloads/" + package["file"]
        expected.add(relative)
        file = folder / relative
        require(file.is_file() and file.stat().st_size == package["bytes"] and digest(file) == package["sha256"], "Package integrity check failed.")
        with file.open("rb") as stream:
            require(stream.read(2) == b"PK", "Expected a ZIP package.")
    images = 0
    for file in folder.rglob("*"):
        if file.is_dir():
            continue
        relative = file.relative_to(folder).as_posix()
        if relative in expected:
            continue
        require(relative.startswith("screenshots/") and file.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"} and 0 < file.stat().st_size <= 8388608, "Unexpected release asset.")
        with file.open("rb") as stream:
            magic = stream.read(12)
        valid = (file.suffix.lower() == ".png" and magic[:8] == b"\x89PNG\r\n\x1a\n") or (file.suffix.lower() in {".jpg", ".jpeg"} and magic[:3] == b"\xff\xd8\xff") or (file.suffix.lower() == ".webp" and magic[:4] == b"RIFF" and magic[8:12] == b"WEBP")
        require(valid, "Invalid raster screenshot.")
        images += 1
        require(images <= 32, "Too many screenshots.")
    return data

def managed_directory(parent, name):
    require(REVISION.fullmatch(name), "Invalid managed directory identity.")
    target = parent / name
    require(not target.is_symlink() and target.resolve().parent == parent.resolve(), "Managed path escapes its parent.")
    return target

def publish_bundle(root, bundle, channel, revision, repository):
    require(repository in PRODUCER_PRODUCTS, "Unknown publication identity.")
    allowed_products = PRODUCER_PRODUCTS[repository]
    require(channel in {"dev", "prod"} and REVISION.fullmatch(revision), "Invalid publication channel or revision.")
    root = Path(root).resolve()
    require(root != Path(root.anchor), "Refusing a filesystem root as the release mount.")
    root.mkdir(parents=True, exist_ok=True)
    channel_root = root / "channels" / channel
    require(not (root / "channels").is_symlink() and not channel_root.is_symlink(), "Channel directories cannot be links.")
    channel_root.mkdir(parents=True, exist_ok=True)
    for public_directory in [root, root / "channels", channel_root]:
        os.chmod(public_directory, 0o755)
    with publication_lock(channel_root / ".publish.lock"):
        current = catalogue(channel_root / "catalog.json")
        with tempfile.TemporaryDirectory(prefix=".incoming-", dir=channel_root) as temporary:
            stage = Path(temporary)
            unpack(Path(bundle), stage)
            bundle_file = stage / "bundle.json"
            require(bundle_file.is_file() and bundle_file.stat().st_size <= 32768, "Missing bundle manifest.")
            manifest = json.loads(bundle_file.read_text())
            require(isinstance(manifest, dict) and manifest.get("schema") == 1 and manifest.get("repository") == repository, "Unexpected bundle producer.")
            products = manifest.get("products")
            require(isinstance(products, list) and 1 <= len(products) <= 8 and len(set(products)) == len(products) and all(isinstance(slug, str) and slug in allowed_products for slug in products), "Unexpected product list.")
            require((stage / "products").is_dir() and {p.name for p in (stage / "products").iterdir()} == set(products), "Bundle products do not match the manifest.")
            metadata = {slug: validate_product(stage / "products" / slug, slug) for slug in products}
            require(all(item["buildCommit"] == manifest.get("buildCommit") for item in metadata.values()), "Build identity mismatch.")
            for slug in products:
                versions = channel_root / "products" / slug / "versions"
                for folder in [channel_root / "products", versions.parent, versions]:
                    require(not folder.is_symlink(), "Product directories cannot be links.")
                    folder.mkdir(parents=True, exist_ok=True)
                    os.chmod(folder, 0o755)
                destination = managed_directory(versions, revision)
                require(not destination.exists(), "Revision already exists; use a unique publication identity.")
                source = stage / "products" / slug
                (source / ".release-owned.json").write_text(json.dumps({"schema": 1, "revision": revision}))
                for item in [source, *source.rglob("*")]:
                    os.chmod(item, 0o755 if item.is_dir() else 0o644)
                os.replace(source, destination)
                current["products"][slug] = revision
            # One atomic switch makes the complete channel bundle visible.
            atomic_json(channel_root / "catalog.json", current)
        # Delete only older, publisher-owned versions of products in this batch.
        # The other channel and unrelated products remain untouched.
        for slug in products:
            versions = channel_root / "products" / slug / "versions"
            for old in versions.iterdir():
                if old.name == revision or not REVISION.fullmatch(old.name) or not old.is_dir() or old.is_symlink():
                    continue
                try:
                    old = managed_directory(versions, old.name)
                    marker = old / ".release-owned.json"
                    require(marker.is_file() and not marker.is_symlink() and marker.stat().st_size <= 1024, "Missing ownership marker.")
                    require(json.loads(marker.read_text()) == {"schema": 1, "revision": old.name}, "Ownership marker mismatch.")
                    shutil.rmtree(old)
                except (OSError, ValueError):
                    print("An old managed version could not be removed; current downloads remain available.", file=sys.stderr)
        print("Published " + channel + " latest: " + ", ".join(products))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--bundle", required=True)
    parser.add_argument("--channel", choices=["dev", "prod"], required=True)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--repository", choices=sorted(PRODUCER_PRODUCTS), required=True)
    args = parser.parse_args()
    publish_bundle(args.root, args.bundle, args.channel, args.revision, args.repository)

if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, tarfile.TarError) as error:
        print("Publication failed: " + str(error), file=sys.stderr)
        sys.exit(1)
