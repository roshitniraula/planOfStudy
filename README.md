# MNSU Honors Program — Plan of Study Dashboard

An internal tool for the Minnesota State University Mankato Honors Program that parses student Plan of Study `.docx` forms and displays them on a searchable, sortable dashboard hosted on GitHub Pages.

## Architecture

```
Plan of Study/*.docx          Student-completed Word forms (one per student)
        │
        │  GitHub Actions runs parser on push
        ▼
parser/parse.py               Reads each .docx, extracts 6 fixed tables, outputs JSON
        │
        ▼
data/*.json                   One structured JSON file per student
        │
        │  GitHub Actions builds and deploys on push to main
        ▼
web/ (Next.js static export)  Dashboard served on GitHub Pages
   ├── /              Overview: stat cards, charts, sortable student table
   ├── /finder        Find Students: filter by major, experience area, and status
   ├── /issues        Students whose forms produced parse warnings
   └── /students/[slug]  Full detail view for one student
```

**Data shape:** Each JSON file follows the `StudentRecord` type in [`web/src/lib/types.ts`](web/src/lib/types.ts). It contains student info, required/optional curriculum, and three competency sections (leadership, research, intercultural), each with an experience log, highlighted experiences, and advisor notes.

**Adding a new competency** only requires adding its key to `COMPETENCY_KEYS` and `COMPETENCY_TITLES` in [`web/src/lib/types.ts`](web/src/lib/types.ts) — every page and chart iterates from that single source of truth.

## Adding a student

1. Drop the student's completed `.docx` form into the `Plan of Study/` folder.
2. Commit and push to `main`.
3. GitHub Actions automatically runs the parser, commits the resulting JSON to `data/`, and redeploys the dashboard.
4. The student appears on the dashboard within a few minutes.

If the form has unusual formatting, a warning appears on the `/issues` page — review it manually.

## Running locally

**Parser**

```bash
pip install -r parser/requirements.txt
python parser/parse.py
```

Run from the repo root. Output JSON files land in `data/`. With no `.docx` files present, it exits cleanly with a message.

**Dashboard**

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). When `data/` is empty the dashboard renders a built-in sample student so the UI is always exercisable without real files.

**Sample data generator** (development only)

```bash
python scripts/generate_samples.py
```

Creates 20 realistic synthetic `.docx` files in `Plan of Study/`. Run this once, then run the parser to populate `data/`.

## Enabling GitHub Pages

1. Go to **Settings → Pages** in your GitHub repository.
2. Under **Source**, select **Deploy from a branch**.
3. Choose the `gh-pages` branch, `/ (root)` folder.
4. Save. The first deploy runs automatically on the next push to `main`.

The `basePath` in `next.config.ts` defaults to `/planOfStudy`. If your repo is named differently, update `NEXT_PUBLIC_BASE_PATH` in `.github/workflows/deploy.yml`.

## Known limitations

- The parser identifies table positions by index. If the form template is restructured (tables added/removed), the index offsets in `parse_competency()` will need updating and affected forms will produce parse warnings.
- Checkbox states (☒/☐) rely on Unicode characters in the DOCX XML. Unusual encoding or embedded content controls may cause them to read incorrectly — check `/issues` after each push.
- The dashboard is fully static: all data is embedded at build time. There is no live search or server-side filtering.
- The optional curriculum ("Honors with Distinction") section is only displayed on a student's detail page when entries are present.
