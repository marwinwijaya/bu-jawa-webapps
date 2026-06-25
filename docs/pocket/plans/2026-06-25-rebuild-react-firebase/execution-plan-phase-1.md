# Rumah Makan Bu Jawa — React + Firebase Rebuild — Project Scaffold + Config + Seed + README (Phase 1 of 3)

**Date:** 2026-06-25
**Original plan:** docs/pocket/plans/2026-06-25-rebuild-react-firebase/execution-plan.md
**Prerequisite:** None (first phase)
**Contains tasks:** {T1, T2, T3}
**Unlocks next:** Phase 2

---

## Task List

Total: 3 tasks | Prerequisite phases must be complete before starting

T1: Project Scaffold + Config + Seed + README [prereq]
T2: Types + Firebase Config + Services [depends: T1]
T3: UI Components [depends: T1] [parallel: T2]

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

## Phase Completion Gate

DONE when ALL of the following:
- Every task in this phase: status DONE
- All tests pass
- All commits created with correct format
- No task has status BLOCKED or NEEDS_CONTEXT

Hand off to Phase 2 ONLY after this gate passes.
