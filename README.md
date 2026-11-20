# Leonida Field Guide — a GTA VI trophy guide and tracker

An offline, static web app: a guide and progress tracker for the 55 PlayStation 5
trophies of *Grand Theft Auto VI*, built for the make.fun competition.

[![entry](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
![trophies](https://img.shields.io/badge/trophies-55%20tracked-ff2d95)
![offline](https://img.shields.io/badge/offline-no%20network%20requests-b6ff3d)

## What it is

- **Tracker** — every trophy with its official name, description and grade, a checkbox per
  trophy saved in `localStorage`, progress by grade and a whole-set percentage, filters by
  kind (story, missable, collectibles, activities, online), a text search, a "hide earned"
  switch, and progress export/import as a JSON file.
- **Roadmap** — the path to the platinum in order, grouped by stage from the official
  descriptions (prologue, chapters, epilogue, then the cleanup passes), with per-stage
  progress and a **missable watch** listing every trophy that can be lost and why.
- **Guide** — each trophy's page carries a written guide in the author's own words,
  saying what to do, where and how, when it can be missed, and naming the sources the
  facts come from (PowerPyx's roadmap, PSNProfiles and Exophase lists, video walkthroughs).
- **Spoiler setting** — story trophies hide their names and descriptions until earned.

## Run it

```bash
cd app && python3 -m http.server 8130   # then open http://127.0.0.1:8130/
```

No build step, no dependencies, no network requests: the app loads only files under `app/`.

## Hand it in

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json` with the vendored make.fun frontend library:

```bash
rm -rf out && MAKEFUN_OUTPUT_DIR=out node main.ts   # outside the grader, out/ stands in for /output
```

## Layout

```
app/index.html        the shell: header, tabs, checklist pane, detail pane, roadmap pane
app/style.css         the look, one rule per line
app/js/*.js           data, progress, transfer, filters, spoiler, roadmap, detail, list, ui, app
app/data/trophies.json  the 55 official trophies with their guides and sources
app/fonts/            Anton and Bebas Neue (SIL OFL, licences beside them)
screenshots/          four real renders of the app, the first is the cover
main.ts               the entrypoint the grader runs
vendor/               the make.fun frontend library, unchanged
```

The app is released under the MIT licence in `LICENSE`.