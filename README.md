# MNSU Honors Program — Plan of Study Dashboard

An internal tool for the Minnesota State University Mankato Honors Program that parses student Plan of Study `.docx` forms and displays them on a searchable, sortable dashboard hosted on GitHub Pages.

## How to add a student

1. Drop the student's completed `.docx` form into the `Plan of Study/` folder.
2. Commit and push the file to `main`.
3. GitHub Actions automatically runs the parser, commits the resulting JSON to `data/`, and redeploys the dashboard.
4. The student appears on the dashboard within a few minutes.

If the form has unusual formatting, a warning appears on the [`/issues`](#) page — review it manually.

## How to run locally

**Parser:**

```bash
pip install -r parser/requirements.txt
python parser/parse.py
```

Run from the repo root. Output JSON files land in `data/`. With no `.docx` files present, it exits cleanly with a message and an empty `data/` directory.

**Dashboard:**

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard uses a built-in sample student when `data/` is empty, so the UI renders correctly before any real files are parsed.

## How to enable GitHub Pages

1. Go to **Settings → Pages** in your GitHub repository.
2. Under **Source**, select **Deploy from a branch**.
3. Choose the `gh-pages` branch, `/ (root)` folder.
4. Save. The first deploy runs automatically when you push to `main`.

The `basePath` in `next.config.ts` defaults to `/planOfStudy` in production. If your repo is named differently, update `NEXT_PUBLIC_BASE_PATH` in `deploy.yml`.

## Known limitations (POC)

- The parser identifies tables by their header text, not by index. If the form template is modified in ways that change column headers, fields may parse as `null` and appear on the `/issues` page.
- Cells with unusual character encoding or embedded content controls may not render their checkbox state correctly — check the `/issues` page after each push.
- The dashboard is fully static: there is no live search or server-side filtering. All data is embedded at build time.
- The optional curriculum ("Honors with Distinction") section is parsed but only displayed if entries are present.
