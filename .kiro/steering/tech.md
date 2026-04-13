# Tech Stack

## Core
- **Vanilla JavaScript (ES6+)** — no frameworks, no bundler, no transpiler
- **Bootstrap 5** — layout, grid, and utility classes via `assets/vendor/bootstrap/`
- **Bootstrap Icons** — icon font via `assets/vendor/bootstrap-icons/`
- **Google Fonts** — Nunito Sans + DM Serif Display, loaded from CDN

## Browser APIs Used
- `File System Access API` (`showOpenFilePicker`, `showDirectoryPicker`) — write `data/menu.json` and save images; requires Chrome or Edge
- `IndexedDB` — persist file handles across sessions so the user only picks files once
- `localStorage` — auto-save admin draft state and public preview payload
- `sessionStorage` — admin login session
- `fetch` — load `data/menu.json` on both public and admin pages

## No Build System
There is no `package.json`, bundler, compiler, or test runner. Files are served as-is.

## Common Commands
| Task | How |
|---|---|
| Run locally | Open `index.html` directly in Chrome/Edge, or serve with any static file server (e.g. `npx serve .`) |
| Deploy | Commit and push to GitHub; GitHub Pages serves `index.html` as the root |
| Update menu data | Open `login.html` in Chrome/Edge → manage menu → click **Simpan** → commit & push |

## Credentials (hardcoded, local admin only)
- Username: `admin`
- Password: `rmbujawa2026`
- Defined in `assets/js/admin-core.js` as `app.LOGIN_USERNAME` / `app.LOGIN_PASSWORD`
