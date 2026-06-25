# Pitch Exploration: rebuild-react-firebase
Date: 2026-06-25 | Project: Rumah Makan Bu Jawa | Status: pitch-only

---

## Problem Statement
Website Rumah Makan Bu Jawa saat ini berupa HTML statis dengan data JSON lokal (`data/menu.json`). Owner tidak bisa update menu tanpa edit code dan deploy manual. Data tidak real-time. Butuh modernisasi ke React + Firebase agar data dynamic dari Firestore dan admin bisa mandiri mengelola menu.

## Root Tension
Owner butuh kesederhanaan (rumah makan kecil, satu orang manage), tapi kita bangun modern stack (React + Firebase + TypeScript). Solusi: admin UX super simple dan dead-simple, arsitektur tetap clean dan scalable.

## Key Constraints
- GitHub Pages = static hosting only, no server-side code
- Firebase config public = normal (API key bukan secret), tapi Firestore rules harus ketat
- Mobile-first wajib — pelanggan akses dari HP
- WhatsApp = satu-satunya channel order (tidak ada online payment)
- Owner mungkin tidak tech-savvy → admin harus dead simple
- Firebase Storage free tier: 5GB storage, 1GB/day download — lebih dari cukup (current images ~84KB avg)
- HashRouter required untuk SPA di GitHub Pages — tidak ada functional impact

---

## Brainstorming Methods Used

### Question Storming — deep
Key insights:
- Owner butuh bisa update menu dari HP tanpa bantuan developer = pain point utama
- "Menu Hari Ini/Besok" adalah artifact dari sistem lama, bukan universal need
- WhatsApp cart (keranjang → format pesan) adalah conversion engine yang harus dipertahankan
- Admin panel dipakai 1 orang (owner) → tidak perlu role-based complexity

### First Principles Thinking — creative
Key insights:
- Minimum true requirement: menu tampil (foto + harga + status) + tombol WhatsApp + lokasi + owner bisa update tanpa edit code
- Konsep "Menu Hari Ini/Besok" bisa di-replace dengan simple availability toggle di Firestore
- Firebase free tier lebih dari cukup untuk traffic rumah makan lokal (50-200 visitors/day vs 50K reads/day quota)

### Six Thinking Hats — structured
Key insights:
- White: 7 menu items, 4 kategori, harga 10-15rb range, WhatsApp aktif
- Yellow: Firebase realtime = update langsung terlihat, admin panel = owner mandiri
- Black: SPA di GitHub Pages = SEO kurang optimal (tapi tidak kritis untuk rumah makan lokal)
- Green: Bisa generate QR code untuk meja, bisa PWA, tapi out of scope untuk MVP

### Constraint Mapping — deep
Key insights:
- Real constraints: GitHub Pages static only, no server, image size limit
- Imagined constraints: "harus React" (bisa Vue/Svelte), "admin harus lengkap" (bisa mulai CRUD menu saja)
- Domain constraints: owner tidak tech-savvy, pelanggan dari HP, menu berubah = data dynamic

---

## Advisor Synthesis
Four methods converged on same conclusion: jangan over-engineer, fokus ke yang dipakai pelanggan. Admin panel = pain point utama owner. WhatsApp = satu-satunya ordering channel. Stack React + Firebase justified untuk developer comfort, tapi fitur harus di-trim ke essentials. Drop "Menu Hari Ini/Besok" scheduling, replace dengan simple availability toggle. Gallery/promo/profile = Phase 2.

---

## Spike Results

### Spike 1: Firebase Storage Free Tier
**Unknown:** Cukupkah 5GB storage dan 1GB/day download untuk gambar menu?
**Finding:** Current images ~84KB average. 50 menu items = 4.2MB (0.084% dari quota). 1GB/day = ~12,000 image views. Rumah makan lokal: 50-200 visitors/day.
**Implication:** Cukup. Firebase Storage bukan bottleneck.

### Spike 2: HashRouter Impact
**Unknown:** Apakah HashRouter affect WhatsApp sharing atau deep-linking?
**Finding:** HashRouter URLs (`/#/menu`) tidak affect `wa.me` links, Google Maps embed, atau deep-linking. Hanya URL sedikit lebih "ugly" dengan `#`.
**Implication:** Safe. HashRouter adalah solusi standard untuk SPA di GitHub Pages.

---

## Approach Directions

### Direction A: Full Stack Rebuild
Bangun ulang dari nol dengan React + Vite + TypeScript + Tailwind + Firebase. Public site + admin panel terintegrasi Firestore. CRUD menu, kategori, gallery, profile.
+ Clean architecture, scalable, developer-friendly
+ Admin mandiri, data real-time
− Complexity tinggi untuk project kecil, butuh waktu lama

### Direction B: Minimal Viable Rebuild
React + Vite + TypeScript + Tailwind + Firebase. Public site lengkap. Admin hanya CRUD menu + kategori. Gallery, promo, profile = Phase 2. Drop scheduling, pakai availability toggle.
+ Faster to ship, lower complexity
+ Focus ke yang dipakai: menu + WhatsApp
+ Bisa extend nanti
− Fitur lebih sedikit dari spek asli

### Direction C: Hybrid Static + Firebase
Generate static HTML dari Firestore data. Public site = pure HTML. Admin = React SPA terpisah.
+ Public site fastest, SEO lebih baik
− Dua codebase, build step tambahan complexity

---

## Open Questions for pocket-grinding
- [ ] Struktur data Firestore yang optimal untuk menu + kategori (subcollection vs flat)?
- [ ] Firebase Auth approach: email/password vs anonymous vs custom token?
- [ ] Image upload: langsung ke Firebase Storage atau via base64 di Firestore?
- [ ] WhatsApp message format: per-item vs keranjang vs both?
- [ ] Admin panel: single page atau multi-tab?
- [ ] Bagiain handle "empty state" kalau Firestore belum ada data?
- [ ] Firestore rules: bagaimana struktur yang aman untuk public read + admin write?

---

## Recommended Direction
Direction B — Minimal Viable Rebuild. Constraints menunjukkan owner butuh simplicity, bukan completeness. Stack React + Firebase justified, tapi fitur harus di-trim ke essentials. Ship fast, iterate later.

---

## Handoff Context (for pocket-grinding)
When pocket-grinding reads this doc:
- Start with this problem statement (Phase 1 context)
- Use Direction B as the working hypothesis for Phase 5 Design Proposals
- Treat Open Questions above as Phase 3 Discovery targets
- Do NOT treat Approach Directions as final architecture — validate through GWT first
- Key data from current site: 7 menu items, 4 kategori, WhatsApp 0895-4057-18033, jam 09.00-21.00 WIB
