# EXECUTION PLAN — Rumah Makan Bu Jawa — React + Firebase Rebuild

**Date:** 2026-06-25
**Spec:** docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
**Status:** draft
**Total tasks:** 12

---

## Execution Overview

### Recommended Order
```
T1 → T2, T3 (parallel) → T5, T8 (parallel) → T4 → T6 → T7 → T9 → T10 → T11, T12 (parallel)
```

> Dependency order above is **recommended** — pocket skill enforces actual parallelism and sequencing based on its routing logic.

### Parallelizable Groups
| Group | Tasks | Unblocked After |
|-------|-------|-----------------|
| Group A | T2, T3 | T1 completes |
| Group B | T5, T8 | T2+T3 completes |
| Group C | T4 | T3+T5 completes |
| Group D | T11, T12 | T10 completes |

### Constraints Reminder
**Architecture:** React + Vite + TypeScript + Tailwind CSS, Firebase (Firestore/Auth/Storage), HashRouter, component-based, service layer, TypeScript strict mode, `VITE_` env vars
**Out-of-scope:** Cart, scheduling (Hari Ini/Besok), promo management, restaurant profile (hardcoded), PWA, SSR/SSG, multi-language
**Assumptions at risk:** Max image upload 2MB, seed data via `npm run seed`, search name-only, gallery delete removes from Storage
**Sequencing:** T1 scaffold must complete first. T2 (Firebase) and T3 (UI components) can parallel. T5 (WhatsApp) and T8 (Gallery) can parallel after T2+T3. T4 (Layout) needs T3+T5. T6 (Menu) needs T2+T3+T5. T10 (Auth) blocks T11+T12.

### File Structure Map

```
Rule: Project scaffold
  Create: package.json
  Create: vite.config.ts
  Create: tsconfig.json
  Create: tailwind.config.js
  Create: postcss.config.js
  Create: .env.example
  Create: index.html
  Create: src/main.tsx
  Create: src/App.tsx
  Create: src/index.css
  Create: src/data/seed.ts
  Create: README.md

Rule: Types + Firebase + Services
  Create: src/types/index.ts
  Create: src/config/firebase.ts
  Create: src/config/app.ts
  Create: src/firebase/services/menuService.ts
  Create: src/firebase/services/categoryService.ts
  Create: src/firebase/services/galleryService.ts
  Create: src/firebase/services/storageService.ts

Rule: UI Components
  Create: src/components/ui/Button.tsx
  Create: src/components/ui/Card.tsx
  Create: src/components/ui/SectionTitle.tsx
  Create: src/components/ui/LoadingSkeleton.tsx
  Create: src/components/ui/EmptyState.tsx
  Create: src/components/ui/ErrorState.tsx
  Create: src/components/ui/Badge.tsx

Rule: Layout
  Create: src/components/layout/Navbar.tsx
  Create: src/components/layout/Footer.tsx
  Create: src/components/layout/Layout.tsx
  Create: src/components/layout/AdminLayout.tsx
  Create: src/routes/index.tsx

Rule: Utils + WhatsApp
  Create: src/utils/format.ts
  Create: src/utils/slug.ts
  Create: src/components/ui/WhatsAppButton.tsx
  Create: src/components/ui/FloatingWhatsApp.tsx

Rule: Public Menu
  Create: src/pages/MenuPage.tsx
  Create: src/components/menu/MenuGrid.tsx
  Create: src/components/menu/MenuCard.tsx
  Create: src/components/menu/MenuFilter.tsx
  Create: src/components/menu/MenuSearch.tsx
  Create: src/hooks/useMenu.ts
  Create: src/hooks/useCategories.ts

Rule: Menu Detail
  Create: src/pages/MenuDetailPage.tsx
  Create: src/components/menu/MenuDetail.tsx

Rule: Gallery
  Create: src/pages/GalleryPage.tsx
  Create: src/components/gallery/GalleryGrid.tsx
  Create: src/hooks/useGallery.ts

Rule: Home
  Create: src/pages/HomePage.tsx

Rule: Admin Auth
  Create: src/pages/admin/LoginPage.tsx
  Create: src/hooks/useAuth.ts
  Create: src/components/auth/ProtectedRoute.tsx

Rule: Admin CRUD Menu + Categories
  Create: src/pages/admin/DashboardPage.tsx
  Create: src/pages/admin/MenuManagementPage.tsx
  Create: src/pages/admin/CategoryManagementPage.tsx
  Create: src/components/admin/MenuForm.tsx
  Create: src/components/admin/MenuTable.tsx
  Create: src/components/admin/CategoryForm.tsx
  Create: src/components/admin/CategoryTable.tsx

Rule: Admin CRUD Gallery
  Create: src/pages/admin/GalleryManagementPage.tsx
  Create: src/components/admin/GalleryForm.tsx
  Create: src/components/admin/GalleryTable.tsx

Rule: Seed Data
  Create: src/data/seed.ts

Rule: Documentation
  Create: README.md
```

---

## Pocket Packets

---

### Task 1: Project Scaffold + Config + Seed + README [prereq]

## OBJECTIVE
Initialize React + Vite + TypeScript project with Tailwind CSS, configure build for GitHub Pages (HashRouter), and create base file structure.

Files:
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.env.example`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css` (Tailwind directives)
- Create: `src/data/seed.ts`
- Create: `README.md`

Steps:
1. Run `npm create vite@latest . -- --template react-ts` to scaffold project
2. Install dependencies: `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `firebase`
3. Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
4. Configure `vite.config.ts` with `base: './'` for GitHub Pages
5. Configure `tailwind.config.js` with content paths and custom theme (warm colors: cream, brown, green leaf)
6. Create `.env.example` with all `VITE_` variables
7. Create `src/index.css` with Tailwind directives
8. Update `src/App.tsx` with HashRouter placeholder
9. Create `src/data/seed.ts` with sample data for menu_categories, menu_items, gallery + seedFirestore() function
10. Add `"seed": "npx tsx src/data/seed.ts"` script to package.json
11. Create `README.md` with setup, env, Firebase, deploy instructions
12. Verify: `npm run dev` starts without errors
13. Commit: `chore(scaffold): init React + Vite + TS + Tailwind project with seed and README`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Project setup
data/menu.json — reference for data structure

## WHY THIS APPROACH
Complexity: lightweight
Justification: Standard Vite scaffold with Tailwind integration. GitHub Pages requires `base: './'` and HashRouter.

## SANDWICH CONTEXT
[CRITICAL: HashRouter required for GitHub Pages — BrowserRouter will break on refresh]
You are implementing project scaffold for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: root config files + src/main.tsx + src/App.tsx
Available after: none (prereq)
Architecture rule: Vite config must have `base: './'`, use HashRouter not BrowserRouter
[RESTATE: HashRouter required for GitHub Pages — BrowserRouter will break on refresh]

## DELIVERABLE
Verification — task is DONE when all pass:

Given project scaffolded, When run `npm run dev`, Then dev server starts without errors
Given Tailwind configured, When add Tailwind classes to App.tsx, Then styles apply
Given .env.example exists, When read file, Then all VITE_ variables listed
Given vite.config.ts, When check base, Then base is './'

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - HashRouter in App.tsx (not BrowserRouter)
  - Tailwind CSS configured and working
  - All VITE_ env vars in .env.example
  - `npm run dev` works

Must-not-have:
  - Bootstrap or any CSS framework besides Tailwind
  - BrowserRouter (breaks GitHub Pages)
  - Hardcoded Firebase config

Open question risks:
  - None for this task

Rollback note:
  - `git revert` if scaffold fails

## STOP CONDITIONS
Done when: `npm run dev` starts, Tailwind classes work, .env.example complete
Uncertain when: Vite version incompatibility
Escalate when: Tailwind v4 breaking changes

---

### Task 2: Types + Firebase Config + Services [depends: T1]

## OBJECTIVE
Define TypeScript interfaces for all Firestore collections, configure Firebase initialization, and create service layer for CRUD operations on menu_items, menu_categories, and gallery.

Files:
- Create: `src/types/index.ts`
- Create: `src/config/firebase.ts`
- Create: `src/config/app.ts`
- Create: `src/firebase/services/menuService.ts`
- Create: `src/firebase/services/categoryService.ts`
- Create: `src/firebase/services/galleryService.ts`
- Create: `src/firebase/services/storageService.ts`

Steps:
1. Create TypeScript interfaces in `src/types/index.ts`:
   - `MenuItem { id, name, slug, categoryId, categoryName, description, price, imageUrl, isFavorite, isAvailable, order, createdAt, updatedAt }`
   - `MenuCategory { id, name, slug, order, isActive, createdAt, updatedAt }`
   - `GalleryImage { id, title, imageUrl, isActive, order, createdAt }`
2. Create `src/config/firebase.ts`:
   - Import `initializeApp` from `firebase/app`
   - Import `getFirestore` from `firebase/firestore`
   - Import `getAuth` from `firebase/auth`
   - Import `getStorage` from `firebase/storage`
   - Initialize from `VITE_` env vars
   - Export `app`, `db`, `auth`, `storage`
3. Create `src/config/app.ts`:
   - Export `WHATSAPP_NUMBER` from env
   - Export `MAPS_URL`, `OPENING_HOURS` (hardcoded)
   - Export `ADMIN_EMAILS` (parsed from comma-separated env)
4. Create `src/firebase/services/menuService.ts`:
   - `getMenuItems(): Promise<MenuItem[]>`
   - `getMenuItemBySlug(slug: string): Promise<MenuItem | null>`
   - `createMenuItem(data: Omit<MenuItem, 'id'>): Promise<string>`
   - `updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void>`
   - `deleteMenuItem(id: string): Promise<void>`
5. Create `src/firebase/services/categoryService.ts`:
   - `getCategories(): Promise<MenuCategory[]>`
   - `createCategory(data: Omit<MenuCategory, 'id'>): Promise<string>`
   - `updateCategory(id: string, data: Partial<MenuCategory>): Promise<void>`
   - `deleteCategory(id: string): Promise<void>` (soft delete: set isActive=false)
6. Create `src/firebase/services/galleryService.ts`:
   - `getGalleryImages(): Promise<GalleryImage[]>`
   - `createGalleryImage(data: Omit<GalleryImage, 'id'>): Promise<string>`
   - `updateGalleryImage(id: string, data: Partial<GalleryImage>): Promise<void>`
   - `deleteGalleryImage(id: string, imageUrl: string): Promise<void>` (delete doc + Storage file)
7. Create `src/firebase/services/storageService.ts`:
   - `uploadImage(file: File, path: string): Promise<string>` (returns download URL)
   - `deleteImage(url: string): Promise<void>`
8. Verify: TypeScript compiles without errors
9. Commit: `feat(firebase): add types, config, and service layer`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Data model, Firebase integration
Firebase JS SDK docs — Firestore CRUD, Auth, Storage APIs

## WHY THIS APPROACH
Complexity: standard
Justification: Service layer abstracts Firebase operations, makes testing easier, keeps components clean.

## SANDWICH CONTEXT
[CRITICAL: All Firebase config from VITE_ env vars — never hardcode API keys]
You are implementing Firebase integration for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/types/, src/config/, src/firebase/services/
Available after: T1 (scaffold)
Architecture rule: Service layer pattern — components never call Firestore directly
[RESTATE: All Firebase config from VITE_ env vars — never hardcode API keys]

## DELIVERABLE
Verification — task is DONE when all pass:

Given types defined, When import MenuItem, Then all fields available with correct types
Given firebase.ts configured, When import db/auth/storage, Then Firebase instances ready
Given menuService, When call getMenuItems(), Then returns MenuItem[] from Firestore
Given categoryService, When call deleteCategory(), Then isActive set to false (soft delete)
Given storageService, When call uploadImage(), Then returns download URL string
Given app.ts, When import WHATSAPP_NUMBER, Then reads from VITE_RESTAURANT_WHATSAPP

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - All TypeScript interfaces match spec data model exactly
  - Firebase config from env vars only
  - Service layer abstracts all Firestore operations
  - Soft delete for categories (isActive=false, not document delete)
  - Gallery delete removes both Firestore doc AND Storage file

Must-not-have:
  - Hardcoded Firebase config
  - Direct Firestore calls from components
  - Hard delete for categories

Open question risks:
  - Max image upload size (assumed 2MB) → if wrong: report NEEDS_CONTEXT

Rollback note:
  - Revert service changes if Firebase connection fails

## STOP CONDITIONS
Done when: TypeScript compiles, all service functions exist with correct signatures
Uncertain when: Firebase project not configured yet (can mock for dev)
Escalate when: Firestore rules block operations

---

### Task 3: UI Components [depends: T1] [parallel: T2]

## OBJECTIVE
Create reusable UI components: Button, Card, SectionTitle, LoadingSkeleton, EmptyState, ErrorState, Badge.

Files:
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/SectionTitle.tsx`
- Create: `src/components/ui/LoadingSkeleton.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/ErrorState.tsx`
- Create: `src/components/ui/Badge.tsx`

Steps:
1. Create `Button.tsx` with variants: primary, outline, whatsapp, danger
   - Props: `variant`, `size`, `children`, `onClick`, `disabled`, `type`, `className`, `href` (for link buttons)
   - Tailwind classes for each variant
2. Create `Card.tsx` with children slot
   - Props: `children`, `className`, `onClick`
   - Tailwind: rounded, shadow, padding
3. Create `SectionTitle.tsx` for section headers
   - Props: `kicker`, `title`, `description`
4. Create `LoadingSkeleton.tsx` for loading states
   - Props: `count` (number of skeleton items)
   - Tailwind: animate-pulse, gray placeholders
5. Create `EmptyState.tsx` for empty data
   - Props: `icon`, `title`, `description`, `action` (button)
6. Create `ErrorState.tsx` for error states
   - Props: `title`, `description`, `onRetry`
7. Create `Badge.tsx` for status badges
   - Props: `variant` (favorit, habis, available), `children`
   - Tailwind: small rounded pill with color variants
8. Verify: All components render without errors
9. Commit: `feat(ui): add reusable Button, Card, SectionTitle, LoadingSkeleton, EmptyState, ErrorState, Badge`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: States, responsive design

## WHY THIS APPROACH
Complexity: lightweight
Justification: Shared UI components ensure consistency across pages.

## SANDWICH CONTEXT
[CRITICAL: Tailwind CSS only — no Bootstrap, no CSS modules, no styled-components]
You are implementing UI components for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/components/ui/
Available after: T1 (scaffold)
Architecture rule: Tailwind CSS only, component-based
[RESTATE: Tailwind CSS only — no Bootstrap, no CSS modules, no styled-components]

## DELIVERABLE
Verification — task is DONE when all pass:

Given Button with variant="primary", When rendered, Then shows primary styled button
Given LoadingSkeleton with count=3, When rendered, Then shows 3 pulse placeholders
Given EmptyState, When rendered, Then shows icon, title, description, optional action button
Given ErrorState with onRetry, When click retry, Then calls onRetry function
Given Badge with variant="habis", When rendered, Then shows red "Habis" pill

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - All components accept className prop for customization
  - Mobile-first responsive classes
  - Warm color palette (cream, brown, green leaf, red bata)

Must-not-have:
  - Bootstrap classes
  - Inline styles (use Tailwind)
  - Hardcoded colors (use Tailwind config)

Open question risks:
  - None

## STOP CONDITIONS
Done when: All components render, accept props, Tailwind classes apply
Uncertain when: Color palette not defined in tailwind.config
Escalate when: Tailwind purges component classes

---

### Task 4: Layout Components + Routes [depends: T3, T5]

## OBJECTIVE
Create Navbar, Footer, Layout, AdminLayout components and configure React Router with HashRouter.

Files:
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/layout/AdminLayout.tsx`
- Create: `src/routes/index.tsx`
- Modify: `src/App.tsx`

Steps:
1. Create `Navbar.tsx`:
   - Sticky top, mobile hamburger menu
   - Links: Beranda, Menu, Gallery, Kontak
   - CTA button: "Pesan Sekarang" → WhatsApp
   - Mobile: collapsible nav with smooth animation
2. Create `Footer.tsx`:
   - Copyright, WhatsApp link, Maps link
   - "Akses Admin" link
3. Create `Layout.tsx`:
   - Wraps Navbar + children + Footer + FloatingWhatsApp
4. Create `AdminLayout.tsx`:
   - Sidebar with nav: Dashboard, Menu, Kategori, Gallery
   - Logout button
   - Content area
5. Create `src/routes/index.tsx`:
   - HashRouter with routes:
     - `/` → HomePage
     - `/menu` → MenuPage
     - `/menu/:slug` → MenuDetailPage
     - `/gallery` → GalleryPage
     - `/admin/login` → LoginPage
     - `/admin` → ProtectedRoute → AdminLayout
     - `/admin/dashboard` → DashboardPage
     - `/admin/menu` → MenuManagementPage
     - `/admin/categories` → CategoryManagementPage
     - `/admin/gallery` → GalleryManagementPage
6. Update `App.tsx` to use routes
7. Verify: Navigation works, routes load correct pages
8. Commit: `feat(layout): add Navbar, Footer, Layout, AdminLayout, and routing`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Responsive design, Admin auth

## WHY THIS APPROACH
Complexity: standard
Justification: Layout components wrap all pages, routing enables SPA navigation.

## SANDWICH CONTEXT
[CRITICAL: HashRouter only — BrowserRouter breaks GitHub Pages refresh]
You are implementing layout and routing for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/components/layout/, src/routes/, src/App.tsx
Available after: T3 (UI components), T5 (FloatingWhatsApp component)
Architecture rule: HashRouter, mobile-first responsive
[RESTATE: HashRouter only — BrowserRouter breaks GitHub Pages refresh]

## DELIVERABLE
Verification — task is DONE when all pass:

Given Navbar on mobile, When click hamburger, Then nav menu expands
Given Navbar, When click "Menu" link, Then navigate to /#/menu
Given Layout, When render any page, Then Navbar on top, Footer on bottom
Given AdminLayout, When render admin page, Then sidebar + content area
Given HashRouter, When refresh on /#/menu, Then page loads correctly (no 404)

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - HashRouter (not BrowserRouter)
  - Mobile hamburger menu
  - Sticky navbar
  - All routes defined

Must-not-have:
  - BrowserRouter
  - Fixed pixel breakpoints (use Tailwind responsive)

## STOP CONDITIONS
Done when: All routes work, navbar responsive, layout wraps pages
Uncertain when: None
Escalate when: Router breaks on GitHub Pages

---

### Task 5: Utils + WhatsApp Component [depends: T2]

## OBJECTIVE
Create utility functions (formatPrice, formatWhatsAppLink, generateSlug) and WhatsApp button/floating components.

Files:
- Create: `src/utils/format.ts`
- Create: `src/utils/slug.ts`
- Create: `src/components/ui/WhatsAppButton.tsx`
- Create: `src/components/ui/FloatingWhatsApp.tsx`

Steps:
1. Create `src/utils/format.ts`:
   - `formatPrice(price: number | null): string` — returns "Hubungi kami" if null/0, else "Rp X.XXX" format
   - `formatWhatsAppLink(phone: string, message: string): string` — returns wa.me URL with encoded message
   - `formatWhatsAppMenuMessage(itemName: string, price: number | null): string` — returns "Halo Bu Jawa, saya mau pesan [nama] (Rp [harga])" or without price
2. Create `src/utils/slug.ts`:
   - `generateSlug(name: string): string` — lowercase, replace spaces with hyphens, remove special chars
3. Create `WhatsAppButton.tsx`:
   - Props: `itemName`, `price`, `className`
   - Renders Button with WhatsApp icon, onClick opens wa.me link
   - Uses `formatWhatsAppMenuMessage` and `formatWhatsAppLink`
4. Create `FloatingWhatsApp.tsx`:
   - Fixed bottom-right floating button
   - Always visible on public pages
   - Links to WhatsApp with generic message
5. Verify: formatPrice returns correct format, WhatsApp links work
6. Commit: `feat(utils): add format, slug utilities and WhatsApp components`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: WhatsApp ordering
data/menu.json — reference for price format

## WHY THIS APPROACH
Complexity: lightweight
Justification: Utils are shared across components, WhatsApp is the conversion engine.

## SANDWICH CONTEXT
[CRITICAL: WhatsApp message format must match spec exactly]
You are implementing utils and WhatsApp for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/utils/, src/components/ui/WhatsAppButton.tsx, src/components/ui/FloatingWhatsApp.tsx
Available after: T2 (types + config)
Architecture rule: Pure functions in utils, reusable components
[RESTATE: WhatsApp message format must match spec exactly]

## DELIVERABLE
Verification — task is DONE when all pass:

Given formatPrice(15000), When called, Then returns "Rp 15.000"
Given formatPrice(null), When called, Then returns "Hubungi kami"
Given formatPrice(0), When called, Then returns "Hubungi kami"
Given formatWhatsAppMenuMessage("Ayam Bakar", 15000), When called, Then returns "Halo Bu Jawa, saya mau pesan Ayam Bakar (Rp 15.000)"
Given formatWhatsAppMenuMessage("Special", null), When called, Then returns "Halo Bu Jawa, saya mau pesan Special"
Given generateSlug("Ayam Bakar"), When called, Then returns "ayam-bakar"
Given WhatsAppButton, When click, Then opens wa.me with correct message

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - formatPrice handles null, 0, and valid numbers
  - WhatsApp message matches spec format exactly
  - generateSlug produces URL-safe slugs
  - FloatingWhatsApp always visible on public pages

Must-not-have:
  - Price format without "Rp" prefix
  - WhatsApp message with empty price "(Rp )"

## STOP CONDITIONS
Done when: All format functions return correct output, WhatsApp links work
Uncertain when: None
Escalate when: wa.me links don't open WhatsApp

---

### Task 6: Public Menu Page + Filter/Search [depends: T2, T3, T5]

## OBJECTIVE
Create the public Menu page with responsive grid, category filter, search, and per-item WhatsApp CTA.

Files:
- Create: `src/pages/MenuPage.tsx`
- Create: `src/components/menu/MenuGrid.tsx`
- Create: `src/components/menu/MenuCard.tsx`
- Create: `src/components/menu/MenuFilter.tsx`
- Create: `src/components/menu/MenuSearch.tsx`
- Create: `src/hooks/useMenu.ts`
- Create: `src/hooks/useCategories.ts`

Steps:
1. Create `src/hooks/useMenu.ts`:
   - Fetches menu items from Firestore using menuService
   - Returns `{ items, loading, error }`
   - Handles empty state
2. Create `src/hooks/useCategories.ts`:
   - Fetches active categories from Firestore
   - Returns `{ categories, loading }`
3. Create `MenuCard.tsx`:
   - Props: `item: MenuItem`
   - Shows: image, name, category badge, truncated description, price/Hubungi kami, WhatsApp button
   - Badges: "Favorit" (star) if isFavorite, "Habis" if !isAvailable (dimmed card)
   - Links to detail page: `/#/menu/:slug`
4. Create `MenuFilter.tsx`:
   - Props: `categories`, `selectedCategory`, `onSelect`
   - Renders "Semua" + category chips
   - Active state styling
5. Create `MenuSearch.tsx`:
   - Props: `value`, `onChange`
   - Search input with icon
   - Debounced (300ms)
6. Create `MenuGrid.tsx`:
   - Props: `items`, `loading`, `error`
   - Responsive grid: 1 col mobile, 2 tablet, 3 desktop
   - Loading: show LoadingSkeleton
   - Empty: show EmptyState
   - Error: show ErrorState with retry
7. Create `MenuPage.tsx`:
   - Combines useMenu, useCategories, MenuFilter, MenuSearch, MenuGrid
   - Filter logic: AND (category AND search)
   - Search: case-insensitive substring on name only
   - Whitespace-only search → show all
8. Verify: Menu page renders, filter works, search works, badges show
9. Commit: `feat(menu): add public Menu page with filter, search, and grid`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Public menu display
GWT: Customer views menu grid, filters by category, searches menu, etc.

## WHY THIS APPROACH
Complexity: standard
Justification: Menu is the core feature — must be polished and functional.

## SANDWICH CONTEXT
[CRITICAL: Filter + search must use AND logic, not OR]
You are implementing public Menu page for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/MenuPage.tsx, src/components/menu/, src/hooks/
Available after: T2 (services), T3 (UI), T5 (utils)
Architecture rule: Hooks for data fetching, components for presentation
[RESTATE: Filter + search must use AND logic, not OR]

## DELIVERABLE
Verification — task is DONE when all pass:

Given 7 menu items, When open Menu page, Then all items shown in grid
Given filter "Menu Utama", When click, Then only Menu Utama items shown
Given search "ayam", When type, Then only items with "ayam" in name shown (case-insensitive)
Given filter + search combined, When both active, Then AND logic applies
Given item price=null, When shown, Then "Hubungi kami" displayed
Given isAvailable=false, When shown, Then "Habis" badge + dimmed
Given isFavorite=true, When shown, Then "Favorit" badge
Given empty Firestore, When open Menu, Then empty state with WhatsApp CTA
Given search with no results, When type "xyz", Then empty state "Menu tidak ditemukan"
Given whitespace-only search, When type "   ", Then show all items

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - Responsive grid (1/2/3 cols)
  - Category filter with "Semua" option
  - Case-insensitive search on name
  - AND logic for filter + search
  - All badges (Favorit, Habis)
  - Loading, empty, error states
  - WhatsApp CTA per item

Must-not-have:
  - Search on description (name only per assumption)
  - OR logic for filter + search
  - Cart functionality

## STOP CONDITIONS
Done when: All GWT scenarios for Story 1 pass
Uncertain when: None
Escalate when: Firestore query performance issues

---

### Task 7: Menu Detail Page [depends: T6]

## OBJECTIVE
Create the Menu Detail page with large photo, full info, and WhatsApp CTA.

Files:
- Create: `src/pages/MenuDetailPage.tsx`
- Create: `src/components/menu/MenuDetail.tsx`

Steps:
1. Create `MenuDetail.tsx`:
   - Props: `item: MenuItem`
   - Large photo, name, category badge, full description, price/Hubungi kami, availability badge, favorite badge
   - WhatsApp button (large)
   - Back to menu link
2. Create `MenuDetailPage.tsx`:
   - Gets slug from URL params: `useParams<{ slug: string }>()`
   - Fetches item by slug using `getMenuItemBySlug`
   - Loading: skeleton
   - Error/Not found: "Menu tidak ditemukan" + link to menu
   - Renders MenuDetail
3. Verify: Detail page renders, slug-based URL works, 404 for non-existent
4. Commit: `feat(menu): add Menu Detail page with slug-based routing`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Menu detail page
GWT: Customer views menu detail, shares link, item not found

## WHY THIS APPROACH
Complexity: lightweight
Justification: Detail page enables sharing specific menu items via URL.

## SANDWICH CONTEXT
[CRITICAL: URL must be slug-based (/#/menu/ayam-bakar), not Firestore ID]
You are implementing Menu Detail page for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/MenuDetailPage.tsx, src/components/menu/MenuDetail.tsx
Available after: T6 (Menu page with hooks)
Architecture rule: Fetch by slug, not by Firestore ID
[RESTATE: URL must be slug-based (/#/menu/ayam-bakar), not Firestore ID]

## DELIVERABLE
Verification — task is DONE when all pass:

Given slug "ayam-bakar", When navigate to /#/menu/ayam-bakar, Then detail page shows
Given non-existent slug, When navigate, Then "Menu tidak ditemukan" shown
Given detail page, When click WhatsApp, Then correct message with item name and price
Given detail page, When click back, Then navigate to /#/menu

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - Slug-based URL (not Firestore ID)
  - 404 handling for non-existent items
  - Large photo display
  - WhatsApp CTA with correct message format

Must-not-have:
  - Using Firestore ID in URL
  - Broken links on share

## STOP CONDITIONS
Done when: Detail page works, slug routing works, 404 handled
Uncertain when: None
Escalate when: Slug collision (two items with same slug)

---

### Task 8: Gallery Page [depends: T2, T3]

## OBJECTIVE
Create the public Gallery page with responsive image grid.

Files:
- Create: `src/pages/GalleryPage.tsx`
- Create: `src/components/gallery/GalleryGrid.tsx`
- Create: `src/hooks/useGallery.ts`

Steps:
1. Create `useGallery.ts`:
   - Fetches active gallery images from Firestore
   - Returns `{ images, loading, error }`
2. Create `GalleryGrid.tsx`:
   - Props: `images`, `loading`, `error`
   - Responsive grid: 2 cols mobile, 3 tablet, 4 desktop
   - Each image: title overlay on hover
   - Loading: skeleton
   - Empty: EmptyState "Galeri belum tersedia"
   - Error: ErrorState with retry
3. Create `GalleryPage.tsx`:
   - Uses useGallery hook
   - Renders SectionTitle + GalleryGrid
4. Verify: Gallery page renders, inactive images hidden, empty state works
5. Commit: `feat(gallery): add Gallery page with responsive grid`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Gallery display
GWT: Customer views gallery, gallery empty, image inactive

## WHY THIS APPROACH
Complexity: lightweight
Justification: Gallery builds trust through photos.

## SANDWICH CONTEXT
[CRITICAL: Only isActive=true images shown publicly]
You are implementing Gallery page for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/GalleryPage.tsx, src/components/gallery/, src/hooks/useGallery.ts
Available after: T2 (services), T3 (UI)
Architecture rule: Filter isActive=true in query, not client-side
[RESTATE: Only isActive=true images shown publicly]

## DELIVERABLE
Verification — task is DONE when all pass:

Given active gallery images, When open Gallery, Then images shown in grid
Given isActive=false image, When open Gallery, Then image NOT shown
Given no images, When open Gallery, Then empty state "Galeri belum tersedia"
Given error, When Gallery loads, Then error state with retry button

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - Responsive grid
  - Only active images shown
  - Loading, empty, error states
  - Title overlay on hover

Must-not-have:
  - Lightbox/modal (out of scope)
  - Category filter for gallery

## STOP CONDITIONS
Done when: Gallery page works, inactive images filtered, states handled
Uncertain when: None
Escalate when: Image loading performance issues

---

### Task 9: Home Page [depends: T6, T8]

## OBJECTIVE
Create the Home page composing hero, menu preview, about section, gallery preview, and contact.

Files:
- Create: `src/pages/HomePage.tsx`

Steps:
1. Create `HomePage.tsx` with sections:
   - **Hero**: Restaurant name, tagline, CTA buttons (Lihat Menu, WhatsApp)
   - **Menu Preview**: Show first 6 favorite/available items, "Lihat Semua" link
   - **About**: Short story about Rumah Makan Bu Jawa (hardcoded text)
   - **Gallery Preview**: Show first 4 gallery images, "Lihat Galeri" link
   - **Contact**: Address, opening hours, WhatsApp, Google Maps embed, CTAs
2. Use components from T3 (SectionTitle, Card, Button)
3. Use hooks from T6 (useMenu) and T8 (useGallery) for previews
4. Responsive layout for all sections
5. Verify: Home page renders, all sections visible, links work
6. Commit: `feat(home): add Home page with hero, menu preview, about, gallery, contact`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Home page sections
index.html — reference for current home page content

## WHY THIS APPROACH
Complexity: standard
Justification: Home page is the first impression, combines all sections.

## SANDWICH CONTEXT
[CRITICAL: About and Contact are sections in Home, not separate pages]
You are implementing Home page for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/HomePage.tsx
Available after: T6 (Menu), T8 (Gallery)
Architecture rule: Compose from existing hooks and components
[RESTATE: About and Contact are sections in Home, not separate pages]

## DELIVERABLE
Verification — task is DONE when all pass:

Given Home page, When load, Then hero section with name and CTAs visible
Given Home page, When scroll, Then menu preview shows first items
Given Home page, When scroll, Then about section shows story
Given Home page, When scroll, Then gallery preview shows images
Given Home page, When scroll, Then contact section with WhatsApp and Maps
Given "Lihat Menu" button, When click, Then navigate to /#/menu
Given "Lihat Galeri" link, When click, Then navigate to /#/gallery

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - All 5 sections (hero, menu preview, about, gallery, contact)
  - Mobile-first responsive
  - CTA buttons working
  - Google Maps embed

Must-not-have:
  - Separate /tentang or /kontak pages

## STOP CONDITIONS
Done when: Home page complete with all sections
Uncertain when: None
Escalate when: None

---

### Task 10: Admin Auth + Protected Routes [depends: T2]

## OBJECTIVE
Create admin login page with Firebase Auth and protect admin routes with whitelist check.

Files:
- Create: `src/pages/admin/LoginPage.tsx`
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/auth/ProtectedRoute.tsx`

Steps:
1. Create `useAuth.ts`:
   - Uses Firebase `onAuthStateChanged` listener
   - Returns `{ user, loading, isAdmin }`
   - `isAdmin` checks email against `ADMIN_EMAILS` from config
   - `login(email, password)` → signInWithEmailAndPassword + whitelist check
   - `logout()` → signOut
2. Create `LoginPage.tsx`:
   - Email + password form
   - On submit: call login()
   - Error handling: "Anda tidak memiliki akses admin" for non-whitelisted, Firebase error for wrong password
   - On success: redirect to /#/admin/dashboard
3. Create `ProtectedRoute.tsx`:
   - Checks useAuth for user + isAdmin
   - If not authenticated: redirect to /#/admin/login
   - If authenticated but not isAdmin: show error
   - If authenticated + isAdmin: render children
4. Wrap admin routes in ProtectedRoute
5. Verify: Login works, protected routes redirect, whitelist check works
6. Commit: `feat(auth): add admin login with Firebase Auth and whitelist protection`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Admin auth
GWT: Admin login with valid email, non-whitelisted email, wrong password, unauthenticated access

## WHY THIS APPROACH
Complexity: standard
Justification: Auth protects admin panel, whitelist ensures only authorized users.

## SANDWICH CONTEXT
[CRITICAL: Whitelist check is client-side (env var) — not server-side for MVP]
You are implementing admin auth for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/admin/LoginPage.tsx, src/hooks/useAuth.ts, src/components/auth/
Available after: T2 (Firebase config)
Architecture rule: Client-side whitelist check from VITE_ADMIN_EMAILS
[RESTATE: Whitelist check is client-side (env var) — not server-side for MVP]

## DELIVERABLE
Verification — task is DONE when all pass:

Given whitelisted email + correct password, When login, Then redirect to dashboard
Given non-whitelisted email, When login, Then error "Anda tidak memiliki akses admin"
Given wrong password, When login, Then Firebase error shown
Given unauthenticated, When access /#/admin, Then redirect to /#/admin/login
Given authenticated + isAdmin, When access /#/admin, Then admin layout shown

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - Firebase Auth email/password
  - Whitelist check against VITE_ADMIN_EMAILS
  - ProtectedRoute wrapping admin routes
  - Clear error messages

Must-not-have:
  - Server-side auth validation (MVP)
  - Role-based access (just email whitelist)

## STOP CONDITIONS
Done when: Login works, protected routes redirect, whitelist enforced
Uncertain when: None
Escalate when: Firebase Auth configuration issues

---

### Task 11: Admin CRUD Menu + Categories [depends: T10]

## OBJECTIVE
Create admin pages for managing menu items and categories with CRUD operations.

Files:
- Create: `src/pages/admin/DashboardPage.tsx`
- Create: `src/pages/admin/MenuManagementPage.tsx`
- Create: `src/pages/admin/CategoryManagementPage.tsx`
- Create: `src/components/admin/MenuForm.tsx`
- Create: `src/components/admin/MenuTable.tsx`
- Create: `src/components/admin/CategoryForm.tsx`
- Create: `src/components/admin/CategoryTable.tsx`

Steps:
1. Create `DashboardPage.tsx`:
   - Summary cards: total menu, total categories, total gallery, available/unavailable count
   - Quick links to management pages
2. Create `MenuTable.tsx`:
   - Table/grid showing all menu items
   - Columns: image thumbnail, name, category, price, status, actions (edit, delete)
   - Filters: category, availability
   - Search by name
3. Create `MenuForm.tsx`:
   - Fields: name, category (dropdown), description, price, image upload, isFavorite, isAvailable
   - Slug auto-generated from name (editable)
   - Image upload to Firebase Storage
   - Validation: name required, category required
   - Edit mode: pre-fill with existing data
   - Image replacement: delete old image from Storage
4. Create `CategoryTable.tsx`:
   - List of categories with name, order, isActive, actions
5. Create `CategoryForm.tsx`:
   - Fields: name, order, isActive
   - Slug auto-generated from name
   - Validation: name unique
6. Create `CategoryManagementPage.tsx`:
   - Uses CategoryTable + CategoryForm
   - Soft delete: warning if has items
7. Create `MenuManagementPage.tsx`:
   - Uses MenuTable + MenuForm
   - CRUD operations via menuService
8. Verify: All CRUD operations work, image upload works, validation works
9. Commit: `feat(admin): add Menu and Category management pages with CRUD`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Admin CRUD menu, Admin CRUD categories
GWT: Admin creates/updates/deletes menu item, creates/deletes category

## WHY THIS APPROACH
Complexity: deep
Justification: Admin panel is the owner's daily tool — must be functional and user-friendly.

## SANDWICH CONTEXT
[CRITICAL: Image replacement must delete old image from Storage]
You are implementing admin CRUD for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/admin/, src/components/admin/
Available after: T10 (auth)
Architecture rule: Service layer for all Firestore operations, Storage for images
[RESTATE: Image replacement must delete old image from Storage]

## DELIVERABLE
Verification — task is DONE when all pass:

Given admin creates menu item, When fill form + upload image, Then item in Firestore + image in Storage
Given admin creates item with missing name, When submit, Then validation error
Given admin updates price, When save, Then Firestore updated
Given admin toggles availability, When save, Then public site reflects change
Given admin deletes item, When confirm, Then removed from Firestore
Given admin replaces image, When upload new, Then old deleted from Storage
Given admin creates category, When fill form, Then category created
Given admin creates duplicate category, When submit, Then error "Kategori sudah ada"
Given admin soft-deletes category with items, When confirm, Then isActive=false, items remain

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - All CRUD operations functional
  - Image upload + delete working
  - Form validation
  - Responsive admin UI (works on mobile + desktop)
  - Soft delete for categories
  - Slug auto-generation

Must-not-have:
  - Hard delete for categories
  - Cart management
  - Scheduling (Hari Ini/Besok)

Open question risks:
  - Max image upload size (assumed 2MB) → enforce client-side

## STOP CONDITIONS
Done when: All CRUD operations work, image handling correct, validation enforced
Uncertain when: None
Escalate when: Storage quota exceeded

---

### Task 12: Admin CRUD Gallery [depends: T10] [parallel: T11]

## OBJECTIVE
Create admin gallery management page with upload, toggle active, and delete.

Files:
- Create: `src/pages/admin/GalleryManagementPage.tsx`
- Create: `src/components/admin/GalleryForm.tsx`
- Create: `src/components/admin/GalleryTable.tsx`

Steps:
1. Create `GalleryTable.tsx`:
   - Grid of gallery images with title, isActive status, actions
   - Toggle isActive button
   - Delete button with confirmation
2. Create `GalleryForm.tsx`:
   - Fields: title, image upload
   - Upload to Firebase Storage
   - Validation: title required, image required
3. Create `GalleryManagementPage.tsx`:
   - Uses GalleryTable + GalleryForm
   - CRUD operations via galleryService
   - Delete: removes from Firestore + Storage
4. Verify: Upload works, toggle works, delete works
5. Commit: `feat(admin): add Gallery management page with upload and toggle`

## REFERENCES LOADED
docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md — rule: Admin CRUD gallery
GWT: Admin uploads gallery image, deactivates, deletes

## WHY THIS APPROACH
Complexity: standard
Justification: Gallery management for showcasing restaurant.

## SANDWICH CONTEXT
[CRITICAL: Gallery delete must remove both Firestore doc AND Storage file]
You are implementing admin Gallery management for Rumah Makan Bu Jawa rebuild.
Spec: docs/pocket/spec/2026-06-25-rebuild-react-firebase/rebuild-spec.md
Design decision: Option B — Core + Gallery MVP
Files in scope: src/pages/admin/GalleryManagementPage.tsx, src/components/admin/Gallery*.tsx
Available after: T10 (auth)
Architecture rule: Delete both Firestore doc and Storage file
[RESTATE: Gallery delete must remove both Firestore doc AND Storage file]

## DELIVERABLE
Verification — task is DONE when all pass:

Given admin uploads image with title, When submit, Then image in Storage + doc in Firestore
Given admin toggles isActive, When save, Then public gallery reflects change
Given admin deletes image, When confirm, Then removed from Firestore AND Storage

Format: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## QUALITY BAR
Must-have:
  - Image upload working
  - Toggle isActive
  - Delete removes both Firestore + Storage
  - Form validation

Must-not-have:
  - Lightbox features
  - Category for gallery

## STOP CONDITIONS
Done when: All CRUD operations work, delete cleans up Storage
Uncertain when: None
Escalate when: Storage delete fails silently

---

## Plan Summary

| Task | Name | Depends | Complexity | Key Verification |
|------|------|---------|------------|-----------------|
| T1 | Project Scaffold + Seed + README | prereq | lightweight | npm run dev works, seed exists |
| T2 | Types + Firebase + Services | T1 | standard | Services return correct types |
| T3 | UI Components | T1 | lightweight | Components render with Tailwind |
| T4 | Layout + Routes | T3, T5 | standard | HashRouter works, nav responsive |
| T5 | Utils + WhatsApp | T2 | lightweight | formatPrice, WhatsApp links correct |
| T6 | Menu Page + Filter/Search | T2, T3, T5 | standard | Filter AND search work |
| T7 | Menu Detail | T6 | lightweight | Slug URL works, 404 handled |
| T8 | Gallery Page | T2, T3 | lightweight | Active images only, empty state |
| T9 | Home Page | T6, T8 | standard | All 5 sections render |
| T10 | Admin Auth | T2 | standard | Login + whitelist + protected routes |
| T11 | Admin CRUD Menu + Categories | T10 | deep | All CRUD ops, image handling |
| T12 | Admin CRUD Gallery | T10 | standard | Upload, toggle, delete |
