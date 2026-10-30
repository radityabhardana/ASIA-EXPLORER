---
trigger: "landing-page, 3d-hero, color-contrast, editorial-layout, anti-ai-slop"
description: "Anti-AI Slop, High Contrast Light Theme, and Split-Screen 3D Map Composition Rules"
---

# Anti-AI Slop, High Contrast & 3D Split-Screen Layout Rules

## 1. High Contrast Light Theme Only (Ban Low-Contrast Washed-Out Beige)
- **Base Canvas**: Crisp Off-White Gallery `#fbf9f5` (never washed-out yellow or murky mud beige).
- **Primary Ink**: `#0f141a` (Jet Ink, WCAG AAA 15.2:1 contrast ratio against `#fbf9f5`).
- **Muted Ink**: `#3a4552` (8.5:1 contrast ratio, WCAG AAA).
- **Accent**: Earthy terracotta `#b84d37` with high legibility.
- **Rules**: Never use light text on light background; every piece of text must pass WCAG AAA (minimum 7:1 for body text, 4.5:1 for headings).

## 2. Zero AI-Slop & Zero Filler Policy
- **Banned Copy**:
  - Never generate decorative AI badges like `✦ 48 Negara di Peta 3D · 15 Aksara Asli · Bebas Akses Tanpa Akun`.
  - Never include promotional fluff, generic placeholder slogans, or redundant subtitle pills repeating what the UI already demonstrates.
  - Ban pseudo-poetic em-dash filler like `— gratis tanpa perlu akun`.
- **UI Element Scope**:
  - Keep landing page lean: 1) Hero 3D Map + Search + Drawer, 2) 60-second Daily Duel, 3) Sound & Script Stage, 4) Minimal Footer.
  - No static 15-photo mosaic cards when a full 48-country 3D map + live search drawer exists.
  - Study room / Leitner phrase vault spaced repetition belongs exclusively in `/dashboard`, never cluttering the public landing page.

## 3. Split-Screen 3D Map Hero Composition
- **Desktop Layout (Aspect >= 1.15)**:
  - The left column (Title, description, 48-country search bar, and regional quick-jump pills) is strictly constrained to the left rail (`left: clamp(32px, 4vw, 56px); max-width: 440px;`).
  - The 3D Asia continent must be shifted firmly to the right side of the screen (`targetX = -50` in Three.js camera rig) so its visual center is at ~68%-70% of viewport width.
  - The westernmost tip of Asia (Turkey / Anatolia / Arabia) must have at least 120px+ of negative breathing space from the right edge of the left column.
  - Underlay elements (pedestal radial glow disc and archival orbit rings) must align with the continent center (`left: 69%`).
  - Canvas controls (compass and zoom buttons) are anchored at `bottom: 32px; right: 32px;`, with 0% overlap with navbar buttons or continent landmasses.
