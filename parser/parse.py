"""
parse.py — reads every .docx in 'Plan of Study/' and writes one JSON per student to 'data/'.

Document structure (6 tables):
  0 — Student Information
  1 — Required Curriculum
  2 — Optional Curriculum (Honors with Distinction)
  3 — Leadership competency  (also contains "HONORS COMPETENCY EXPERIENCES" header)
  4 — Research, Scholarly, & Creative Activity competency
  5 — Intercultural Engagement competency

Each competency table layout (row indices from raw XML):
  Leadership (17 rows): log header row 3, log data rows 4-8,
                        highlighted header row 10, highlighted rows 11-14,
                        notes header row 15, notes data row 16
  Research / Intercultural (16 rows): log header row 2, log data rows 3-7,
                        highlighted header row 9, highlighted rows 10-13,
                        notes header row 14, notes data row 15
"""

from __future__ import annotations
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn

PLANS_DIR = Path(__file__).parent.parent / "Plan of Study"
DATA_DIR = Path(__file__).parent.parent / "data"

PLACEHOLDERS = {"Type here.", "Choose an item.", "Click or tap here to enter text.",
                "Enter your first and last name here.", "Enter your major(s) here.",
                "Paste your portfolio link here."}

PROGRESS_STAGE_LABELS = [
    "Experience is approved through list or proposal",
    "Draft of reflection has been completed",
    "Final draft has been evaluated in HONR 375/475",
    "All remaining revisions have been made",
]


def slugify(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    return re.sub(r"-+", "-", name).strip("-")


def clean(text: str | None) -> str | None:
    if text is None:
        return None
    text = text.strip()
    if not text or text in PLACEHOLDERS:
        return None
    return text


def tc_paragraphs(tc) -> list[str]:
    """Return text of each paragraph in a table cell."""
    return ["".join(r.text or "" for r in p.findall(".//" + qn("w:t")))
            for p in tc.findall(".//" + qn("w:p"))]


def tc_text(tc) -> str | None:
    return clean(" ".join(tc_paragraphs(tc)).strip())


def raw_rows(table) -> list[list]:
    """Return rows as lists of <w:tc> elements, avoiding the merged-cell bug."""
    result = []
    for tr in table._tbl.findall(".//" + qn("w:tr")):
        result.append(tr.findall(".//" + qn("w:tc")))
    return result


# ── Student info ──────────────────────────────────────────────────────────────

def parse_student_info(table) -> dict:
    rows = raw_rows(table)
    def val(row_idx, col_idx):
        try:
            return tc_text(rows[row_idx][col_idx])
        except IndexError:
            return None

    return {
        "name":                val(2, 0),
        "year":                val(2, 1),
        "date":                val(2, 2),
        "majors":              val(4, 0),
        "minors_certificates": val(4, 1),
        "expected_graduation": val(4, 2),
        "portfolio_link":      val(6, 0),
    }


# ── Curriculum ────────────────────────────────────────────────────────────────

def parse_curriculum(table, data_start_row: int) -> list:
    rows = raw_rows(table)
    entries = []
    for row in rows[data_start_row:]:
        if len(row) < 2:
            continue
        course   = tc_text(row[0])
        credits  = tc_text(row[1])
        planned  = tc_text(row[2]) if len(row) > 2 else None
        completed= tc_text(row[3]) if len(row) > 3 else None
        if course or planned or completed:
            entries.append({"course": course, "credits": credits,
                             "semester_planned": planned, "semester_completed": completed})
    return entries


# ── Competency tables ─────────────────────────────────────────────────────────

def parse_checkboxes(tc) -> list[bool]:
    """Parse ☒/☐ paragraphs in a progress-tracker cell → list[bool]."""
    results = []
    for para in tc_paragraphs(tc):
        para = para.strip()
        if not para:
            continue
        if para.startswith("☒"):
            results.append(True)
        elif para.startswith("☐"):
            results.append(False)
    return results


def parse_experience_log(rows, data_start: int, data_end: int) -> list:
    entries = []
    for row in rows[data_start:data_end]:
        if len(row) < 3:
            continue
        exp      = tc_text(row[0])
        typ      = tc_text(row[1])
        progress = tc_text(row[2])
        if exp or typ or progress:
            entries.append({"experience": exp, "type": typ, "progress": progress})
    return entries


def parse_highlighted(rows, data_start: int, data_end: int) -> list:
    entries = []
    for row in rows[data_start:data_end]:
        if len(row) < 3:
            continue
        exp = tc_text(row[0])
        typ = tc_text(row[1])

        stages = parse_checkboxes(row[2]) if len(row) > 2 else []
        while len(stages) < 4:
            stages.append(False)
        stages = stages[:4]

        # Count consecutive completed stages from stage 1
        stages_completed = 0
        for v in stages:
            if v:
                stages_completed += 1
            else:
                break

        reflection = [b for b in (parse_checkboxes(row[3]) if len(row) > 3 else []) if b]

        if exp or typ or any(stages):
            entries.append({
                "experience": exp,
                "type": typ,
                "progress_stages_completed": stages_completed,
                "progress_stages": stages,
                "reflection_topics_checked": reflection,
            })
    return entries


def parse_competency(table, is_leadership: bool) -> dict:
    """
    Leadership table has an extra 2-row header (HONORS COMPETENCY EXPERIENCES + LEADERSHIP),
    so all offsets shift by 2 compared to Research/Intercultural.
    """
    rows = raw_rows(table)
    if is_leadership:
        log_data   = (4,  9)   # rows 4-8
        hl_data    = (11, 15)  # rows 11-14
        notes_row  = 16
    else:
        log_data   = (3,  8)   # rows 3-7
        hl_data    = (10, 14)  # rows 10-13
        notes_row  = 15

    experience_log = parse_experience_log(rows, *log_data)
    highlighted    = parse_highlighted(rows, *hl_data)

    notes = None
    if notes_row < len(rows) and rows[notes_row]:
        notes = tc_text(rows[notes_row][0])

    return {"experience_log": experience_log, "highlighted": highlighted, "advisor_notes": notes}


# ── Main parse ────────────────────────────────────────────────────────────────

def parse_docx(path: Path) -> tuple[dict, list[str]]:
    warnings: list[str] = []
    doc = Document(str(path))
    tables = doc.tables

    def get(idx):
        try:
            return tables[idx]
        except IndexError:
            warnings.append(f"Expected table at index {idx}, not found")
            return None

    # Table 0 — student info
    student = {"name": None, "year": None, "date": None, "majors": None,
                "minors_certificates": None, "expected_graduation": None, "portfolio_link": None}
    t0 = get(0)
    if t0:
        student = parse_student_info(t0)

    # Table 1 — required curriculum (data starts row 2)
    required = []
    t1 = get(1)
    if t1:
        required = parse_curriculum(t1, 2)

    # Table 2 — optional curriculum (data starts row 3, after extra description row)
    optional = []
    t2 = get(2)
    if t2:
        optional = parse_curriculum(t2, 3)

    # Tables 3/4/5 — competencies
    competencies = {}
    for key, idx, is_lead in [("leadership", 3, True), ("research", 4, False), ("intercultural", 5, False)]:
        t = get(idx)
        if t:
            competencies[key] = parse_competency(t, is_lead)
        else:
            warnings.append(f"Missing {key} competency table")
            competencies[key] = {"experience_log": [], "highlighted": [], "advisor_notes": None}

    return {
        "source_file": path.name,
        "parsed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "parse_warnings": warnings,
        "student": student,
        "required_curriculum": required,
        "optional_curriculum": optional,
        "competencies": competencies,
    }, warnings


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    DATA_DIR.mkdir(exist_ok=True)
    docx_files = sorted(PLANS_DIR.glob("*.docx"))

    if not docx_files:
        print("No .docx files found in 'Plan of Study/'. data/ is empty.")
        return

    total  = len(docx_files)
    warned = 0
    used_slugs: set[str] = set()

    for path in docx_files:
        try:
            result, w = parse_docx(path)
        except Exception as e:
            print(f"  ERROR {path.name}: {e}", file=sys.stderr)
            warned += 1
            continue

        name = result["student"].get("name")
        base = slugify(name) if name else slugify(path.stem)
        slug = base
        counter = 1
        while slug in used_slugs:
            slug = f"{base}-{counter}"
            counter += 1
        used_slugs.add(slug)

        out = DATA_DIR / f"{slug}.json"
        out.write_text(json.dumps(result, indent=2), encoding="utf-8")

        if w:
            warned += 1
            print(f"  WARN {path.name}: {'; '.join(w)}")
        else:
            print(f"  OK   {path.name} -> {out.name}")

    clean_count = total - warned
    if warned:
        print(f"\nParsed {clean_count}/{total} files cleanly. {warned} files had warnings.")
    else:
        print(f"\nParsed {total}/{total} files cleanly.")


if __name__ == "__main__":
    main()
