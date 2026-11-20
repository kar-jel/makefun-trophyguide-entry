[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
![rank](https://make.fun/badge/gta6-trophy-guide-01/kar-jel/makefun-trophyguide-entry/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/kar-jel/makefun-trophyguide-entry/reward.svg)

# Leonida Field Guide

An offline GTA VI trophy guide and progress tracker for all 55 PlayStation 5 trophies. It records completion in your browser and provides written guides, sources, missable warnings, filters, and a story roadmap.

Run the static app with:

    cd app && python3 -m http.server 8130

The entrypoint hands the app in with:

    MAKEFUN_OUTPUT_DIR=out node main.ts

`main.ts` copies `app/` and `screenshots/` and creates `dossier.json` using the vendored make.fun frontend helper. `MAKEFUN_OUTPUT_DIR` defaults to `/output`.

Repository layout:

- `app/index.html` and `app/style.css`: application shell and styling
- `app/js/`: browser-side tracker, guides, filters, roadmap, and UI modules
- `app/data/trophies.json`: the 55 trophy records, guides, flags, and sources
- `screenshots/`: app screenshots
- `main.ts`: package entrypoint
- `vendor/makefun-frontend.ts`: make.fun dossier helper
- `LICENSE`: repository license
