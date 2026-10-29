#!/usr/bin/env python3
"""
Generate patterns.json — the single shared reference for pattern and
palette metadata across the web app (TypeScript) and the terminal CLI
(visualizurrr.py).

The TypeScript pattern definitions are the source of truth for pattern
numbering, ids and names. This script reads them, joins the CLI's short
ids by pattern name, and writes patterns.json at the repo root.

Usage:
    python3 scripts/generate_patterns_json.py           # write patterns.json
    python3 scripts/generate_patterns_json.py --check   # fail if the CLI
        numbering/ids have drifted from the web data or patterns.json
        is stale (used in CI)
"""

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATTERN_FILES = [
    "fractals", "spirographs", "cellular", "physics",
    "flows", "turtle", "optics", "nature",
]


def read_web_patterns():
    patterns = []
    for name in PATTERN_FILES:
        text = (ROOT / "src" / "data" / "patterns" / f"{name}.ts").read_text()
        for m in re.finditer(
            r"id: '([^']+)',\s*\n\s*number: (\d+),\s*\n\s*name: '([^']+)',"
            r"\s*\n\s*category: '([^']+)'",
            text,
        ):
            patterns.append({
                "number": int(m.group(2)),
                "webId": m.group(1),
                "name": m.group(3),
                "category": m.group(4),
            })
    patterns.sort(key=lambda p: p["number"])
    return patterns


def read_web_palettes():
    text = (ROOT / "src" / "data" / "palettes.ts").read_text()
    return [
        {"id": m.group(1), "name": m.group(2)}
        for m in re.finditer(r"id: '([^']+)',\s*\n\s*name: '([^']+)'", text)
    ]


def read_cli():
    spec = importlib.util.spec_from_file_location("viz", ROOT / "visualizurrr.py")
    viz = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(viz)
    return viz


def build():
    viz = read_cli()
    cli_by_name = {p["name"]: p for p in viz.PATTERNS}
    patterns = []
    for web in read_web_patterns():
        cli = cli_by_name.get(web["name"])
        if cli is None:
            raise SystemExit(f"pattern {web['name']!r} exists on web but not in the CLI")
        patterns.append({**web, "cliId": cli["id"]})
    return {
        "patterns": patterns,
        "webPalettes": read_web_palettes(),
        "cliPalettes": [{"id": p["id"], "name": p["name"]} for p in viz.PALETTES],
    }


def check():
    viz = read_cli()
    data = build()
    problems = []
    by_num = {p["number"]: p for p in data["patterns"]}
    for entry in viz.PATTERNS:
        ref = by_num.get(entry["num"])
        if ref is None:
            problems.append(f"CLI pattern #{entry['num']} has no web counterpart")
        elif ref["cliId"] != entry["id"] or ref["name"] != entry["name"]:
            problems.append(
                f"#{entry['num']}: CLI has {entry['id']!r}/{entry['name']!r}, "
                f"web expects {ref['cliId']!r}/{ref['name']!r}")
    for web_id, cli_id in viz.WEB_ID_ALIASES.items():
        if not any(p["webId"] == web_id and p["cliId"] == cli_id for p in data["patterns"]):
            problems.append(f"stale alias {web_id!r} -> {cli_id!r}")
    existing = (ROOT / "patterns.json")
    if not existing.exists():
        problems.append("patterns.json is missing — run scripts/generate_patterns_json.py")
    elif json.loads(existing.read_text()) != data:
        problems.append("patterns.json is stale — run scripts/generate_patterns_json.py")
    if problems:
        print("pattern data drift detected:")
        for prob in problems:
            print(" -", prob)
        return 1
    print(f"patterns.json in sync ({len(data['patterns'])} patterns).")
    return 0


if __name__ == "__main__":
    if "--check" in sys.argv:
        sys.exit(check())
    data = build()
    (ROOT / "patterns.json").write_text(json.dumps(data, indent=2) + "\n")
    print(f"wrote patterns.json ({len(data['patterns'])} patterns, "
          f"{len(data['webPalettes'])} web palettes, {len(data['cliPalettes'])} CLI palettes)")
