# Rumah Makan Bu Jawa — React + Firebase Rebuild — Utils + WhatsApp Component (Phase 2 of 3)

**Date:** 2026-06-25
**Original plan:** docs/pocket/plans/2026-06-25-rebuild-react-firebase/execution-plan.md
**Prerequisite:** Phase 1 must be COMPLETE — all tests green, all commits created
**Contains tasks:** {T5, T8, T10, T4, T6, T11, T12}
**Unlocks next:** Phase 3

---

## Task List

Total: 7 tasks | Prerequisite phases must be complete before starting

T5: Utils + WhatsApp Component [depends: T2]
T8: Gallery Page [depends: T2, T3]
T10: Admin Auth + Protected Routes [depends: T2]
T4: Layout Components + Routes [depends: T3, T5]
T6: Public Menu Page + Filter/Search [depends: T2, T3, T5]
T11: Admin CRUD Menu + Categories [depends: T10]
T12: Admin CRUD Gallery [depends: T10] [parallel: T11]

---

## Pocket Packets

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

## Phase Completion Gate

DONE when ALL of the following:
- Every task in this phase: status DONE
- All tests pass
- All commits created with correct format
- No task has status BLOCKED or NEEDS_CONTEXT

Hand off to Phase 3 ONLY after this gate passes.
