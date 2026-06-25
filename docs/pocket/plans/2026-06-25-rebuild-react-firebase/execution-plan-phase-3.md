# Rumah Makan Bu Jawa — React + Firebase Rebuild — Menu Detail Page (Phase 3 of 3)

**Date:** 2026-06-25
**Original plan:** docs/pocket/plans/2026-06-25-rebuild-react-firebase/execution-plan.md
**Prerequisite:** Phase 2 must be COMPLETE — all tests green, all commits created
**Contains tasks:** {T7, T9}
**Unlocks next:** All phases complete — proceed to final validation

---

## Task List

Total: 2 tasks | Prerequisite phases must be complete before starting

T7: Menu Detail Page [depends: T6]
T9: Home Page [depends: T6, T8]

---

## Pocket Packets

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

## Phase Completion Gate

DONE when ALL of the following:
- Every task in this phase: status DONE
- All tests pass
- All commits created with correct format
- No task has status BLOCKED or NEEDS_CONTEXT

Hand off to (none — all phases complete) ONLY after this gate passes.
