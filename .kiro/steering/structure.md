# Project Structure

```
/
├── index.html          # Public-facing website
├── login.html          # Admin login page
├── admin.html          # Admin dashboard (requires login)
├── data/
│   └── menu.json       # Single source of truth for public menu data
├── assets/
│   ├── css/
│   │   └── style.css   # All custom styles (public + admin)
│   ├── js/
│   │   ├── site.js             # Public page logic (reads menu.json, renders marquee cards)
│   │   ├── admin-core.js       # Shared state, utilities, File System API, data normalization
│   │   ├── admin-auth.js       # Login/logout, session checks
│   │   ├── admin-render.js     # DOM rendering functions (master list, schedule boards, summary)
│   │   ├── admin-actions.js    # Event handlers and mutations (form submit, reorder, bulk add)
│   │   └── admin-main.js       # Bootstrap/init entry point for admin pages
│   ├── img/            # Menu images and static assets; referenced as `assets/img/<filename>`
│   └── vendor/         # Bootstrap 5 and Bootstrap Icons (local copies)
└── forms/              # Legacy PHP contact/booking form stubs (unused in current static setup)
```

## Architecture Patterns

### Global namespace
All admin JS shares a single `window.RMBJAdmin` object (aliased as `app`). Each file is an IIFE that reads/extends this object. Load order in `admin.html` matters: `admin-core.js` must be first.

### State shape (in-memory + localStorage)
```js
app.state = {
  metadata: { ... },
  master_menu: [ /* full menu objects */ ],
  menu_hari_ini: [ /* array of IDs */ ],
  menu_besok:    [ /* array of IDs */ ],
}
```

### Export shape (written to menu.json)
`menu_hari_ini` and `menu_besok` are expanded to full snapshots via `app.buildExportPayload()` before writing.

### Data flow
1. On load: `localStorage` draft → fallback to `fetch("data/menu.json")`
2. Every mutation calls `app.persist()` (saves to `localStorage`) then `app.renderAll()`
3. "Simpan" button calls `app.saveMainJson()` which writes to the actual file via File System Access API

### Public page
`site.js` is self-contained (no shared namespace). It fetches `data/menu.json`, filters active items, and renders scrolling marquee cards. On localhost/file:// it falls back to a `localStorage` preview key written by the admin.

## Conventions
- All user-visible strings are in Bahasa Indonesia
- IDs are positive integers; `app.nextId()` returns `max(existing ids) + 1`
- Image paths are normalized to `assets/img/<filename>` (no leading `./`)
- `image_version` is a timestamp used as a cache-busting query param
- CSS classes follow a BEM-like naming: `block-element` or `block-element--modifier` (e.g. `schedule-row`, `soft-badge is-danger`)
- Admin-only styles and public styles coexist in `style.css`, scoped by body class (`admin-body`, `login-body`, `[data-page="publik"]`)
