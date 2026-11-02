# 🌿 Frontend Design System — Art Nouveau Florido

This specification defines the frontend visual identity and design tokens for the **Brand Reputation Monitoring System**, based on [`design.md`](file:///d:/bdsma-microproject/design.md).

Frontend Agent (`@vedaXD`, PC 2) must configure `frontend/` using these exact tokens, fonts, and component rules.

---

## 1. Aesthetic Identity & Philosophy

- **Theme**: Art Nouveau Florido (Belle Époque, 1890–1910).
- **Core Elements**: Whiplash curves, botanical ornament, stained-glass framing, asymmetric grid compositions, luxurious organic elegance.
- **Tension**: Organic fluidity meeting data-dense analytics without sacrificing legibility or usability.
- **Strict Constraints**:
  - ❌ **No pure black** (`#000000`) — use charcoal `#1A1A18` or deep bronze `#26241E`.
  - ❌ **No emojis in UI** — use Lucide Icons only (`lucide-react`).
  - ❌ **No 3-equal-column grids** — use asymmetric, weighted grid layouts.
  - ❌ **No AI copywriting clichés** ("Elevate", "Seamless", "Next-Gen", "Unleash").
  - ❌ **No `h-screen`** — use `min-h-[100dvh]`.

---

## 2. Color Palette & Semantic Tokens

| Token Name | Hex Code | Role | Description |
| :--- | :--- | :--- | :--- |
| `primary` / `nouveau-teal` | `#008080` | Primary Brand / Positive Accent | Deep Teal: hero highlights, primary buttons, positive metrics |
| `secondary` / `nouveau-gold` | `#CFB53B` | Luxury Accent / Borders | Old Gold: decorative borders, active indicators, chart neutral line |
| `tertiary` / `nouveau-mauve` | `#E0B0FF` | Supporting Accent | Mauve: subtle tags, badge accents |
| `neutral` / `nouveau-ivory` | `#FFFFF0` | Light Surface | Ivory: primary background, card background |
| `surface-cream` | `#FFFDD0` | Secondary Surface | Cream: header background, card hover surface |
| `nouveau-olive` | `#808000` | Positive Indicator | Olive Green: high reputation scores, success status |
| `nouveau-burgundy` | `#800020` | Negative / Anomaly Accent | Burgundy: negative sentiment, complaint tags, anomaly alerts |
| `nouveau-peacock` | `#005F9E` | Secondary Highlight | Peacock Blue: secondary links, comparison bars |
| `nouveau-charcoal` | `#1A1A18` | Body Text | Off-black: high-contrast text without harshness |

---

## 3. Typography

- **Headings & Hero**: `Quattrocento`, Weight 700
- **Body & Labels**: `Quattrocento`, Weight 400 (Body) / 500 (Labels)
- **Data & Metadata**: `JetBrains Mono`, Weight 400 / 500

### Google Fonts Import
Add to `frontend/src/app/layout.tsx` or `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Quattrocento:wght@400;700&display=swap" rel="stylesheet">
```

---

## 4. Tailwind CSS Configuration (`frontend/tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nouveau: {
          teal: '#008080',
          gold: '#CFB53B',
          mauve: '#E0B0FF',
          ivory: '#FFFFF0',
          olive: '#808000',
          burgundy: '#800020',
          peacock: '#005F9E',
          cream: '#FFFDD0',
          charcoal: '#1A1A18',
        },
      },
      fontFamily: {
        display: ['Quattrocento', 'serif'],
        body: ['Quattrocento', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        nouveau: '0 2px 12px rgba(26, 26, 24, 0.06)',
        'nouveau-gold': '0 4px 20px rgba(207, 181, 59, 0.18)',
        'nouveau-lift': '0 8px 24px rgba(0, 128, 128, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 5. Recharts Palette for Analytics

All Recharts charts must align with the Art Nouveau aesthetic:

```typescript
export const NOUVEAU_CHART_THEME = {
  sentiment: {
    positive: '#008080',   // Deep Teal
    neutral: '#CFB53B',    // Old Gold
    negative: '#800020',   // Burgundy
  },
  brands: {
    'Virgin America': '#008080',
    'Delta': '#005F9E',
    'Southwest': '#CFB53B',
    'United': '#808000',
    'American': '#A0522D',
    'US Airways': '#800020',
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFF0',
      border: '1px solid #CFB53B',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(207, 181, 59, 0.2)',
      fontFamily: 'Quattrocento, serif',
      color: '#1A1A18',
    },
  },
  grid: {
    stroke: '#E6E4D8',
    strokeDasharray: '3 3',
  },
};
```

---

## 6. Component Specs

### Primary Button
```tsx
<button className="bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-semibold px-6 py-3 rounded-[12px] shadow-nouveau transition-all duration-200 active:translate-y-[1px]">
  Explore Brands
</button>
```

### Secondary Button
```tsx
<button className="border-[1.5px] border-nouveau-gold text-nouveau-teal hover:bg-nouveau-cream font-display font-semibold px-6 py-3 rounded-[12px] transition-all duration-200">
  View Comparison
</button>
```

### Metric / Analytics Card
```tsx
<div className="bg-nouveau-ivory border border-nouveau-gold/40 rounded-[12px] p-6 shadow-nouveau hover:shadow-nouveau-gold hover:scale-[1.01] transition-all duration-300">
  <div className="flex items-center justify-between border-b border-nouveau-gold/20 pb-3 mb-4">
    <h3 className="font-display font-bold text-lg text-nouveau-charcoal">Net Sentiment Score</h3>
    <span className="font-mono text-xs px-2 py-1 rounded bg-nouveau-teal/10 text-nouveau-teal border border-nouveau-teal/30">NSS</span>
  </div>
  {/* Card Content */}
</div>
```

---

## 7. Ornate Visual Accents

Add subtle floral whiplash borders and dividers:
```css
/* Ornamental divider between dashboard sections */
.nouveau-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #CFB53B 50%, transparent 100%);
  position: relative;
  margin: 3rem 0;
}
.nouveau-divider::after {
  content: "♦";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #FFFFF0;
  padding: 0 0.5rem;
  color: #CFB53B;
  font-size: 0.85rem;
}
```
