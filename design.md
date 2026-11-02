---
version: "alpha"
name: "Art Nouveau Florido"
description: "Design an Art Nouveau floral landing page. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#008080"
  secondary: "#CFB53B"
  tertiary: "#E0B0FF"
  neutral: "#FFFFF0"
  surface: "#808000"
  accent: "#800020"
typography:
  h1:
    fontFamily: Quattrocento
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Quattrocento
    fontSize: 1rem
    fontWeight: 400
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Design an Art Nouveau floral landing page. Ideal for landing pages, saas. AI-ready template. Art Nouveau didn't ask permission. Between 1890 and 1910, it crawled across Europe like ivy on a forgotten wall — rejecting the industrial grid, insisting that beauty belonged everywhere. Mucha turned poster art into sacred geometry. Klimt buried his subjects in gold and pattern until figure and ornament became inseparable. The movement said: structure can breathe. Lines can grow.

Translating that into digital interfaces is where it gets interesting. The organic curve fights the pixel grid. Every whiplash tendril wants to break your baseline. And that tension — ornament versus usability — is exactly the point. You're not decorating a screen. You're negotiating between two impulses: the desire to fill every surface with life, and the need to let someone actually read the damn menu.

The designers who get this right treat Art Nouveau not as a skin but as a structural philosophy. The curve informs the layout. The botanical motif becomes the navigation logic. Ornament earns its place by guiding the eye, not competing with content.

- Density: 5/10 — Balanced
- Variance: 8/10 — Expressive
- Motion: 6/10 — Expressive

- **Style:** Ornate, Elegant, Organic
- **Keywords:** art nouveau, ornate, elegant, organic, floral, flowing lines, whiplash curves, nature-inspired, decorative, luxurious
- **Era:** Late 19th Century, Belle Époque
- **Light/Dark:** ✓ Full / ✗ No

## Colors

- **Deep Teal** (#008080) — Accent highlight, links and focus states
- **Old Gold** (#CFB53B) — Premium accent, decorative highlights
- **Mauve** (#E0B0FF) — Supporting palette color
- **Ivory** (#FFFFF0) — Light surface, card backgrounds
- **Olive Green** (#808000) — Success states, positive indicators
- **Burgundy** (#800020) — Extended palette, decorative use
- **Peacock Blue** (#005F9E) — Secondary accent
- **Cream** (#FFFDD0) — Secondary surface


## Typography

- **Display / Hero:** Quattrocento — Weight 700, tight tracking, used for headline impact
- **Body:** Quattrocento — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Quattrocento — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Asymmetric composition.
- **Feature sections:** Asymmetric grid with varied card sizes. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Flowing floral motifs, whiplash curves, ornate borders, stained glass patterns, elegant typography, subtle gradients, nature-inspired illustrations, delicate animations

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 480ms ease-out. Staggered cascades for lists: 100ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 12px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Moderately rounded (0.75rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Moderately rounded (0.75rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Flowing floral motifs
- Do Whiplash curves
- Do Ornate borders
- Do Stained glass patterns
- Do Elegant typography
- Do Nature-inspired illustrations


## Use Case

Landing pages, SaaS

<!-- Source: https://designmd.app/library/art-nouveau-florido · designmd.app -->
