# Product: Rumah Makan Bu Jawa

A static website for a Javanese home-style restaurant (warung) in Indonesia. The site serves two audiences:

**Public visitors** (`index.html`): Browse today's and tomorrow's menu, see prices and availability, and contact the restaurant to order.

**Restaurant admin** (`login.html` → `admin.html`): Manage the master menu list, schedule items for today/tomorrow, and publish changes by saving to `data/menu.json`.

## Key Characteristics
- Fully static — no backend, no database, no build step
- Deployed on GitHub Pages; updates are committed and pushed via GitHub Desktop
- All UI text is in **Bahasa Indonesia**
- Admin workflow: edit in browser → click Simpan → commit & push
- File System Access API (Chrome/Edge only) is used to write `data/menu.json` and save menu images directly from the browser
- Admin session is stored in `sessionStorage`; draft state is auto-saved to `localStorage`

## Business Rules
- Menu items belong to a `master_menu`; they are then scheduled into `menu_hari_ini` (today) or `menu_besok` (tomorrow)
- `menu_hari_ini` and `menu_besok` in the exported JSON are full snapshots (not just IDs) so the public page can read them without joining
- Internally, the admin state stores only IDs in `menu_hari_ini`/`menu_besok` arrays and resolves them against `master_menu` at render time
- Fixed categories: `Menu Utama`, `Menu Sayur`, `Minuman`, `Snack`
- Prices are stored in full Rupiah (e.g. `15000`), displayed as `Rp 15.000`
