
"""Discover MongoDB lab source files and report integration status."""

from pathlib import Path
import re

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSIGNMENTS_DIR = PROJECT_ROOT / "assignments"

# Integration status based on the backend routes we've inspected.
EXECUTION_STATUS = {
    (7, 1): "existing-ui",
    (7, 2): "existing-ui",
    (9, 1): "benchmark-api",
    (10, 1): "interactive-local",
    (10, 2): "interactive-local",
    (11, 1): "interactive-local",
    (11, 2): "interactive-local",
    (12, 1): "guided-security",
    (12, 2): "guided-security",
    (14, 1): "monitoring-api",
}

LAB_PATTERN = re.compile(r"^lab[_-]?0*(\d+)(?:[._-]|$)", re.I)


def discover_assignments():
    assignments = []

    for chapter in range(1, 19):
        folder = ASSIGNMENTS_DIR / f"chapter_{chapter:02d}"

        for lab in (1, 2):
            files = []

            if folder.is_dir():
                for path in folder.rglob("*"):
                    if not path.is_file():
                        continue

                    if path.suffix.lower() not in {
                        ".py", ".sh", ".js", ".ipynb"
                    }:
                        continue

                    match = LAB_PATTERN.match(path.name)

                    if match and int(match.group(1)) == lab:
                        files.append(
                            path.relative_to(PROJECT_ROOT).as_posix()
                        )

            # Chapter 7 also has backend implementations.
            if chapter == 7:
                backend_file = (
                    PROJECT_ROOT / "backend" / "labs"
                    / f"lab7{lab}.py"
                )

                if backend_file.is_file():
                    files.append(
                        backend_file.relative_to(PROJECT_ROOT).as_posix()
                    )

            assignments.append({
                "chapter": chapter,
                "lab": lab,
                "title": f"Chapter {chapter} - Lab {lab}",
                "files": sorted(set(files)),
                "status": (
                    "source-present" if files else "missing-source"
                ),
                "execution": EXECUTION_STATUS.get(
                    (chapter, lab), "not-wired"
                ),
            })

    return assignments


# Preserve compatibility with the existing Flask API.
ASSIGNMENTS = discover_assignments()
