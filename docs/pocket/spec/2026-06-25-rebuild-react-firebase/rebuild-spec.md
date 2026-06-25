# Rumah Makan Bu Jawa — React + Firebase Rebuild

**Date:** 2026-06-25
**Status:** approved
**Author:** brainstorm session
**Spec path:** docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md

---

## Summary

Rebuild website Rumah Makan Bu Jawa dari HTML statis + JSON lokal ke React + Vite + TypeScript + Tailwind CSS + Firebase. Tujuan: owner bisa update menu dari HP/laptop setiap hari tanpa edit code, pelanggan bisa lihat menu + foto + harga dan pesan via WhatsApp. Deploy ke GitHub Pages.

---

## Context

### Current State
- Website statis: HTML + Bootstrap + vanilla JS + `data/menu.json`
- 7 menu items, 4 kategori (Menu Utama, Menu Sayur, Snack, Minuman)
- Admin panel: CRUD menu, penjadwalan hari ini/besok, upload gambar lokal
- Auth: hardcoded username/password di JS
- Kontak: WhatsApp 0895-4057-18033, Maps, jam 09.00-21.00 WIB

### Problem / Motivation
- Owner tidak bisa update menu tanpa edit code dan deploy manual
- Data tidak real-time, tidak ada backend
- Admin auth tidak aman (hardcoded credentials)
- Butuh modernisasi agar owner mandiri dan data dynamic

### Related Areas
- `data/menu.json` — reference for data structure
- `assets/img/` — existing menu images
- `admin.html`, `login.html` — existing admin flow reference

---

## Scope

### In-Scope
- React + Vite + TypeScript + Tailwind CSS project setup
- Firebase integration (Firestore, Auth, Storage)
- Public pages: Home (hero, menu preview, about section, gallery preview, kontak), Menu (filter + search + grid), Menu Detail (large photo, full info, WhatsApp CTA), Gallery (grid responsive)
- Floating WhatsApp button (global)
- Per-item WhatsApp CTA (pre-filled message)
- Admin panel: Login (Firebase Auth email/password), CRUD Menu, CRUD Kategori, Gallery management
- Loading skeleton, empty state, error state components
- Mobile-first responsive design
- GitHub Pages deployment (HashRouter)
- Sample seed data script untuk Firestore
- `.env.example` dan README lengkap

### Out-of-Scope
- "Menu Hari Ini/Besok" scheduling → diganti availability toggle sederhana
- Promo management → Phase 2
- Restaurant profile management → hardcoded dulu, Phase 2 dynamic
- Cart/keranjang → dihapus, per-item WhatsApp CTA saja
- Online ordering / payment → WhatsApp only
- PWA → overkill untuk MVP
- SSR/SSG untuk SEO → tidak kritis untuk rumah makan lokal
- Multi-language → Bahasa Indonesia only

---

## Architecture Constraints

- Layers: `src/` (semua layer — components, services, hooks, pages, config, types, utils)
- Must NOT touch: `data/menu.json` (legacy read-only reference)
- Patterns:
  - Component-based architecture (React functional components + hooks)
  - Service layer untuk Firebase operations (CRUD abstractions)
  - TypeScript strict mode
  - Tailwind CSS only (no Bootstrap, no CSS modules)
  - Environment variables: `VITE_` prefix untuk Firebase config
  - HashRouter untuk GitHub Pages compatibility

Architecture validation: **PASS**

---

## Data Model (Firestore)

### Collection: `menu_categories`
```
{
  id: string (auto)
  name: string              // "Menu Utama"
  slug: string              // "menu-utama"
  order: number             // display order
  isActive: boolean         // soft delete flag
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection: `menu_items`
```
{
  id: string (auto)
  name: string              // "Ayam Bakar"
  slug: string              // "ayam-bakar" (auto from name, editable)
  categoryId: string        // reference to menu_categories
  categoryName: string      // denormalized for display
  description: string       // "Ayam Bakar Khas Jawa"
  price: number | null      // null = "Hubungi kami"
  imageUrl: string          // Firebase Storage URL
  isFavorite: boolean       // badge "Favorit" on card
  isAvailable: boolean      // false = "Habis" badge + dimmed
  order: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Collection: `gallery`
```
{
  id: string (auto)
  title: string             // "Suasana Makan Siang"
  imageUrl: string          // Firebase Storage URL
  isActive: boolean
  order: number
  createdAt: timestamp
}
```

---

## Stories + Scenarios

### Story 1: View Menu (Public)
> As a customer, I want to see the menu with photos and prices, so that I can decide what to order

**Rule 1: Menu items display complete info**
- Each item shows: photo, name, category badge, description (truncated), price, availability status, favorite badge, WhatsApp button
- Price null/0/empty → show "Hubungi kami"
- isAvailable=false → show "Habis" badge, card visually dimmed
- isFavorite=true → show "Favorit" badge (star icon)

**Rule 2: Filtering and search work**
- Category filter: click category → show only that category's items
- "Semua" filter → show all items
- Search: case-insensitive substring match on name
- Combined: filter AND search (both must match)
- Whitespace-only search → treat as empty, show all

```gherkin
Scenario: Customer views menu grid
  Given there are 7 menu items in Firestore across 4 categories
  When customer opens the Menu page
  Then all available items are displayed in a responsive grid
  And each item shows photo, name, category badge, price, and WhatsApp button

Scenario: Customer filters by category
  Given there are items in "Menu Utama" and "Snack" categories
  When customer clicks "Menu Utama" filter
  Then only Menu Utama items are displayed

Scenario: Customer searches menu
  Given there are items named "Ayam Bakar" and "Sate"
  When customer types "ayam" in search
  Then only "Ayam Bakar" is displayed (case-insensitive)

Scenario: Customer searches with no results
  Given menu has items
  When customer types "xyz" in search
  Then empty state shown with "Menu tidak ditemukan" and WhatsApp CTA

Scenario: Menu item has no price
  Given a menu item with price=null
  When customer views the menu
  Then the item displays "Hubungi kami" instead of price

Scenario: Menu item is not available
  Given a menu item with isAvailable=false
  When customer views the menu
  Then the item shows "Habis" badge and is visually dimmed

Scenario: Menu item is favorite
  Given a menu item with isFavorite=true
  When customer views the menu
  Then the item shows "Favorit" badge (star icon)

Scenario: No menu items exist
  Given Firestore menu_items collection is empty
  When customer opens the Menu page
  Then empty state displayed with "Menu belum tersedia" message and WhatsApp CTA

Scenario: Combined filter and search
  Given category "Snack" is selected and search is "sate"
  When menu renders
  Then only items matching BOTH category AND search are shown
```

---

### Story 2: View Menu Detail (Public)
> As a customer, I want to see menu detail page, so that I can see larger photo and full description

**Rule 1: Detail page shows complete information**
- URL: `/#/menu/:slug` (slug-based, shareable)
- Large photo, name, category, full description, price, availability, WhatsApp CTA

```gherkin
Scenario: Customer views menu detail
  Given a menu item "Ayam Bakar" with slug "ayam-bakar" exists
  When customer navigates to /#/menu/ayam-bakar
  Then detail page shows large photo, name, category, full description, price, and WhatsApp button

Scenario: Customer shares menu detail link
  Given customer is viewing "Ayam Bakar" detail at /#/menu/ayam-bakar
  When customer copies URL and shares
  Then friend can open the same detail page directly

Scenario: Menu item not found
  Given URL is /#/menu/non-existent-slug
  When customer opens the URL
  Then page shows "Menu tidak ditemukan" with link back to menu
```

---

### Story 3: Order via WhatsApp (Public)
> As a customer, I want to order a menu item via WhatsApp, so that I can place my order quickly

**Rule 1: WhatsApp link is pre-filled**
- Format: `https://wa.me/{number}?text={encoded_message}`
- Message with price: "Halo Bu Jawa, saya mau pesan Ayam Bakar (Rp 15.000)"
- Message without price: "Halo Bu Jawa, saya mau pesan Ayam Bakar"
- WhatsApp number from `VITE_RESTAURANT_WHATSAPP` env var

```gherkin
Scenario: Customer orders item with price
  Given menu item "Ayam Bakar" has price 15000
  When customer clicks WhatsApp button
  Then WhatsApp opens with message "Halo Bu Jawa, saya mau pesan Ayam Bakar (Rp 15.000)"

Scenario: Customer orders item without price
  Given menu item "Special" has price=null
  When customer clicks WhatsApp button
  Then WhatsApp opens with message "Halo Bu Jawa, saya mau pesan Special"
```

---

### Story 4: View Gallery (Public)
> As a customer, I want to see photos of the restaurant and food, so that I can trust the place

```gherkin
Scenario: Customer views gallery
  Given there are active gallery images in Firestore
  When customer opens Gallery section
  Then images displayed in responsive grid

Scenario: Gallery is empty
  Given no active gallery images exist
  When customer views Gallery section
  Then empty state shown with "Galeri belum tersedia"

Scenario: Gallery image inactive
  Given gallery image has isActive=false
  When customer views Gallery
  Then that image is not displayed
```

---

### Story 5: Admin Login
> As an admin, I want to login securely, so that I can manage the restaurant data

**Rule 1: Whitelist-based access**
- Firebase Auth email/password
- After auth, check email against `VITE_ADMIN_EMAILS` (comma-separated)
- Non-whitelisted email → error "Anda tidak memiliki akses admin"
- Invalid credentials → Firebase Auth error message

```gherkin
Scenario: Admin login with valid whitelisted email
  Given email "owner@gmail.com" is in VITE_ADMIN_EMAILS
  When admin enters correct email and password
  Then admin is redirected to admin dashboard

Scenario: Admin login with non-whitelisted email
  Given email "random@gmail.com" is NOT in VITE_ADMIN_EMAILS
  When admin tries to login
  Then error "Anda tidak memiliki akses admin" is shown

Scenario: Admin login with wrong password
  Given email is whitelisted
  When admin enters wrong password
  Then Firebase Auth error is shown

Scenario: Unauthenticated user accesses admin route
  Given user is not logged in
  When user navigates to /#/admin
  Then redirect to /#/admin/login
```

---

### Story 6: Admin CRUD Menu Items
> As an admin, I want to CRUD menu items, so that I can keep the menu updated daily

**Rule 1: Create**
- Fields: name (required), category (select), description, price, image upload, isFavorite, isAvailable
- Slug auto-generated from name, editable
- Image uploaded to Firebase Storage, URL stored in Firestore
- Validation: name required, category required

**Rule 2: Read**
- List all items with filters: category, availability
- Search by name
- Show image thumbnail, name, category, price, status

**Rule 3: Update**
- Edit any field
- Replace image → upload new, delete old from Storage
- Price change → reflected on public site immediately

**Rule 4: Delete**
- Remove from Firestore
- Image stays in Storage (cleanup later if needed)

```gherkin
Scenario: Admin creates new menu item
  Given admin is on menu management page
  When admin fills name "Nasi Goreng", selects "Menu Utama", sets price 15000, uploads image
  And clicks "Simpan"
  Then new menu item created in Firestore with slug "nasi-goreng"
  And image uploaded to Firebase Storage

Scenario: Admin creates item with missing name
  Given admin is on create form
  When admin leaves name empty and clicks "Simpan"
  Then validation error "Nama menu wajib diisi" shown

Scenario: Admin updates menu price
  Given menu item "Ayam Bakar" with price 15000
  When admin changes price to 18000 and saves
  Then Firestore updated, public site shows 18000

Scenario: Admin toggles availability
  Given "Ayam Bakar" is available
  When admin toggles isAvailable to false
  Then public site shows "Habis" badge on that item

Scenario: Admin deletes menu item
  Given "Sate" exists
  When admin confirms deletion
  Then item removed from Firestore

Scenario: Admin replaces menu image
  Given "Ayam Bakar" has existing image
  When admin uploads new image and saves
  Then new image URL stored in Firestore
  And old image deleted from Firebase Storage

Scenario: Session expires during edit
  Given admin is editing a menu item
  When Firebase auth token expires
  Then show re-auth prompt, not silent failure
```

---

### Story 7: Admin CRUD Categories
> As an admin, I want to CRUD categories, so that I can organize the menu

**Rule 1: Create**
- Fields: name (required), slug (auto from name), order, isActive
- Validation: name unique

**Rule 2: Update**
- Edit any field
- Rename → menu items still linked by categoryId

**Rule 3: Delete (soft)**
- Set isActive=false
- Menu items remain, category hidden from filters
- If category has items → show warning but allow soft delete

```gherkin
Scenario: Admin creates category
  Given admin is on category management
  When admin adds "Minuman" category
  Then category created, appears in menu item form dropdown

Scenario: Admin creates duplicate category
  Given "Menu Utama" exists
  When admin tries to create another "Menu Utama"
  Then error "Kategori sudah ada" shown

Scenario: Admin soft-deletes category with items
  Given "Snack" has 2 menu items
  When admin soft-deletes "Snack"
  Then category isActive set to false
  And warning shown "Kategori dinonaktifkan, 2 menu item tetap ada"
  And category hidden from public filters
  And menu items still visible (no category badge)
```

---

### Story 8: Admin Manage Gallery
> As an admin, I want to manage gallery images, so that I can showcase the restaurant

```gherkin
Scenario: Admin uploads gallery image
  Given admin is on gallery management
  When admin selects image, adds title "Suasana Makan Siang"
  And clicks "Upload"
  Then image uploaded to Firebase Storage
  And gallery document created in Firestore

Scenario: Admin deactivates gallery image
  Given "Suasana Makan Siang" is active
  When admin toggles isActive to false
  Then image hidden from public gallery

Scenario: Admin deletes gallery image
  Given gallery image exists
  When admin confirms deletion
  Then document removed from Firestore
  And image deleted from Firebase Storage
```

---

## Acceptance Criteria

```
Rule: Public menu display
  ✓ Given menu items exist, When customer opens Menu page, Then items shown in grid with photo/name/category/price/WhatsApp
  ✓ Given item price=null, When displayed, Then show "Hubungi kami"
  ✓ Given isAvailable=false, When displayed, Then show "Habis" badge + dimmed
  ✓ Given isFavorite=true, When displayed, Then show "Favorit" badge
  ✓ Given no items exist, When Menu page opened, Then empty state with WhatsApp CTA
  ✓ Given category filter selected, When applied, Then only that category shown
  ✓ Given search text entered, When applied, Then case-insensitive name match shown
  ✓ Given filter + search combined, When applied, Then AND logic (both must match)

Rule: Menu detail page
  ✓ Given slug "ayam-bakar", When /#/menu/ayam-bakar opened, Then detail page with large photo/full info/WhatsApp CTA
  ✓ Given non-existent slug, When URL opened, Then "Menu tidak ditemukan" page
  ✓ Given valid URL, When shared, Then recipient can open same page

Rule: WhatsApp ordering
  ✓ Given item with price, When WhatsApp clicked, Then message "Halo Bu Jawa, saya mau pesan [nama] (Rp [harga])"
  ✓ Given item without price, When WhatsApp clicked, Then message "Halo Bu Jawa, saya mau pesan [nama]"
  ✓ Given VITE_RESTAURANT_WHATSAPP set, When link generated, Then correct number used

Rule: Gallery display
  ✓ Given active gallery images, When Gallery viewed, Then responsive grid shown
  ✓ Given isActive=false, When Gallery viewed, Then image hidden
  ✓ Given no images, When Gallery viewed, Then empty state shown

Rule: Admin auth
  ✓ Given whitelisted email + correct password, When login, Then redirect to dashboard
  ✓ Given non-whitelisted email, When login, Then error "Anda tidak memiliki akses admin"
  ✓ Given unauthenticated, When /#/admin accessed, Then redirect to login

Rule: Admin CRUD menu
  ✓ Given valid form, When create, Then item in Firestore + image in Storage
  ✓ Given missing name, When submit, Then validation error
  ✓ Given edit price, When save, Then Firestore updated
  ✓ Given toggle isAvailable, When save, Then public site reflects change
  ✓ Given delete, When confirmed, Then removed from Firestore
  ✓ Given image replacement, When save, Then old image deleted from Storage

Rule: Admin CRUD categories
  ✓ Given valid name, When create, Then category created
  ✓ Given duplicate name, When create, Then error "Kategori sudah ada"
  ✓ Given soft delete, When confirmed, Then isActive=false, items remain
  ✓ Given category inactive, When public view, Then hidden from filters

Rule: Admin CRUD gallery
  ✓ Given image + title, When upload, Then image in Storage + doc in Firestore
  ✓ Given toggle isActive, When saved, Then public reflects change
  ✓ Given delete, When confirmed, Then removed from Firestore + Storage

Rule: Responsive design
  ✓ Given mobile viewport, When any page opened, Then layout adapts (mobile-first)
  ✓ Given desktop viewport, When any page opened, Then full layout shown

Rule: States
  ✓ Given data loading, When page opened, Then skeleton/spinner shown
  ✓ Given network error, When data fetch fails, Then error state with retry option
  ✓ Given empty data, When page opened, Then empty state with appropriate CTA
```

---

## Design Decision

**Chosen option:** Option B — Core + Gallery MVP

**Summary:** Focus ke Menu CRUD (core business) + Gallery (trust building) + Admin panel responsive. "Tentang" dan "Kontak" jadi section di Home, bukan page terpisah. Per-item WhatsApp CTA tanpa keranjang. Availability toggle sederhana menggantikan scheduling.

**Rejected options:**
- Option A (Full Feature): terlalu banyak fitur untuk MVP, scope creep risk
- Option C (Menu-First): gallery tidak ada, website terasa incomplete

**Key tradeoffs accepted:**
- "Tentang" bukan page terpisah → cukup section di Home
- Gallery basic tanpa fitur canggih (lightbox, kategori gallery)
- Restaurant profile hardcoded → Phase 2 baru dynamic
- Promo tidak ada → Phase 2

---

## Open Questions / Assumptions

| Question | Resolution | Risk if Wrong |
|----------|------------|---------------|
| Max image upload size? | assumed: 2MB, client-side validation | Large uploads could slow site / increase Storage costs |
| Image resize on upload? | assumed: no resize for MVP, just upload | Large images could slow page load |
| Accepted image formats? | assumed: jpg, png, webp | Admin confused if format rejected |
| Seed data: how applied? | assumed: separate `npm run seed` script | Owner needs help running it initially |
| Restaurant profile data source? | assumed: hardcoded in config file | Need code change to update profile |
| Gallery delete: remove from Storage? | assumed: yes, delete both Firestore doc + Storage file | Orphan images accumulate in Storage |
| Search scope? | assumed: name only, substring match | Could miss items if user searches description |
| Category order in filter? | assumed: by `order` field ascending | Random order could confuse users |

---

## Implementation Notes

- **Firebase config**: all via `VITE_` env vars, `.env.example` provided
- **Auth flow**: Firebase Auth → check email whitelist client-side (simple for MVP, server-side validation Phase 2)
- **Image upload**: direct to Firebase Storage from client, URL stored in Firestore
- **Slug generation**: auto from name (lowercase, hyphenated), editable by admin
- **WhatsApp number**: from `VITE_RESTAURANT_WHATSAPP` env var
- **Google Maps embed**: URL hardcoded in config, Phase 2 bisa dynamic
- **Opening hours**: hardcoded in config, Phase 2 bisa dynamic

---

## Rollback Plan

- Git-based: `git revert` any commit
- Firebase: no data migration, new Firestore project
- If Firebase issues: can point to different Firebase project via env vars
- If GitHub Pages issues: can deploy to Vercel/Netlify (same build output)

---

## Folder Structure

```
src/
├── assets/              # static assets (images, fonts)
├── components/
│   ├── layout/          # Navbar, Footer, Layout
│   └── ui/              # Button, Card, SectionTitle, LoadingSkeleton, EmptyState, ErrorState
├── config/
│   └── firebase.ts      # Firebase initialization
│   └── app.ts           # App config (WhatsApp number, maps URL, etc)
├── firebase/
│   └── services/        # menuService, categoryService, galleryService
├── hooks/               # useMenu, useCategories, useGallery, useAuth
├── pages/
│   ├── HomePage.tsx
│   ├── MenuPage.tsx
│   ├── MenuDetailPage.tsx
│   ├── GalleryPage.tsx
│   └── admin/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx
│       ├── MenuManagementPage.tsx
│       ├── CategoryManagementPage.tsx
│       └── GalleryManagementPage.tsx
├── routes/
│   └── index.tsx        # Route config with HashRouter
├── types/
│   └── index.ts         # TypeScript interfaces
├── utils/
│   ├── format.ts        # formatPrice, formatWhatsAppLink
│   └── slug.ts          # generateSlug
├── data/
│   └── seed.ts          # Sample seed data
├── App.tsx
└── main.tsx
```
