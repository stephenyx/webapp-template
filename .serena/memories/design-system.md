# Design System - Social Cookbook App

## Overview

The Social Cookbook app uses a custom design system with warm, nostalgic colors (sage and terracotta), elegant serif headings, and generous whitespace. The visual identity balances modern web design with a handcrafted, cookbook aesthetic.

## Color Palette

### Primary: Sage Green (#617061)

A muted, earthy green that evokes natural ingredients and calm kitchen spaces.

**Full Palette:**
```javascript
sage: {
  50: '#f6f7f6',   // Lightest - backgrounds
  100: '#e3e5e3',  // Very light - subtle backgrounds
  200: '#c7cbc7',  // Light - borders, dividers
  300: '#a4aba4',  // Medium-light - disabled states
  400: '#808a80',  // Medium - placeholder text
  500: '#617061',  // BASE - primary brand color
  600: '#4d5a4d',  // Medium-dark - hover states
  700: '#3f4a3f',  // Dark - active states
  800: '#343d34',  // Very dark - headings
  900: '#2c332c',  // Darkest - emphasis
}
```

**Usage:**
- Buttons: `bg-sage-500 hover:bg-sage-600`
- Navigation: `bg-sage-50 border-sage-200`
- Text: `text-sage-800` (headings), `text-sage-700` (body)
- Focus states: `ring-sage-500`

### Accent: Terracotta (#d4674d)

A warm, earthy orange-red that suggests warmth, cooking, and passion.

**Full Palette:**
```javascript
terracotta: {
  50: '#fdf5f3',   // Lightest - backgrounds
  100: '#fbe8e4',  // Very light - subtle accents
  200: '#f7d4cc',  // Light - borders
  300: '#f0b5a9',  // Medium-light - soft highlights
  400: '#e68b78',  // Medium - interactive elements
  500: '#d4674d',  // BASE - accent brand color
  600: '#c3523d',  // Medium-dark - hover states
  700: '#a34132',  // Dark - active states
  800: '#86372d',  // Very dark - emphasis
  900: '#6e3229',  // Darkest - strong emphasis
}
```

**Usage:**
- Call-to-action buttons: `bg-terracotta-500 hover:bg-terracotta-600`
- Links: `text-terracotta-600 hover:text-terracotta-700`
- Highlights: `bg-terracotta-50 border-terracotta-200`
- Active states: `bg-terracotta-700`

### Neutral Colors

Use default Tailwind grays for neutral elements:
- Gray 50-100: Backgrounds
- Gray 200-300: Borders, dividers
- Gray 600-900: Text

## Typography

### Headings: Playfair Display (Serif)

Elegant serif font for headings, evoking traditional cookbooks and recipes.

**Source:** Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
```

**Tailwind Config:**
```javascript
fontFamily: {
  serif: ['Playfair Display', 'Georgia', 'serif'],
}
```

**Usage:**
- Page titles (h1): `font-serif text-4xl font-bold text-sage-900`
- Section headings (h2): `font-serif text-3xl font-semibold text-sage-800`
- Component titles (h3): `font-serif text-2xl font-semibold text-sage-800`

### Body: Inter (Sans-Serif)

Clean, modern sans-serif for body text and UI elements.

**Source:** Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Tailwind Config:**
```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
}
```

**Usage:**
- Body text: `font-sans text-base text-gray-700`
- UI elements: `font-sans text-sm text-gray-600`
- Buttons: `font-sans font-medium`

### Code: JetBrains Mono (Monospace)

Modern monospace font for code snippets and API examples.

**Source:** Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

**Tailwind Config:**
```javascript
fontFamily: {
  mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
}
```

**Usage:**
- Code blocks: `font-mono text-sm bg-gray-100 px-2 py-1 rounded`

## Spacing

### Generous Whitespace Philosophy

Use ample spacing to create breathing room and improve readability.

**Scale (Tailwind):**
- xs: `space-y-2` (8px) - Tight grouping
- sm: `space-y-4` (16px) - Related elements
- md: `space-y-6` (24px) - Section components
- lg: `space-y-8` (32px) - Major sections
- xl: `space-y-12` (48px) - Page sections

**Padding:**
- Cards: `p-6` or `p-8`
- Buttons: `px-6 py-3`
- Containers: `px-4 md:px-8 lg:px-12`

**Margins:**
- Between sections: `my-12` or `my-16`
- Between components: `my-6` or `my-8`

## Shadows

### Soft, Subtle Shadows

Avoid harsh shadows; use soft, natural-looking elevations.

**Tailwind Config:**
```javascript
boxShadow: {
  'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
  'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
}
```

**Usage:**
- Cards: `shadow-soft`
- Modals: `shadow-soft-lg`
- Hover states: `hover:shadow-soft-lg`

## Border Radius

### Rounded Corners (6-8px)

Consistent, moderate rounding for a friendly, approachable feel.

**Tailwind Values:**
- Default: `rounded-md` (6px) - Buttons, inputs, small cards
- Large: `rounded-lg` (8px) - Cards, modals
- Images: `rounded-lg` (8px)

**Avoid:**
- `rounded-none` (too harsh)
- `rounded-full` (too playful, except for avatars)

## Component Patterns

### Buttons

**Primary (Sage):**
```jsx
<button className="bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white font-medium px-6 py-3 rounded-md transition-colors shadow-soft">
  Button Text
</button>
```

**Accent (Terracotta):**
```jsx
<button className="bg-terracotta-500 hover:bg-terracotta-600 active:bg-terracotta-700 text-white font-medium px-6 py-3 rounded-md transition-colors shadow-soft">
  Call to Action
</button>
```

**Secondary (Outline):**
```jsx
<button className="border-2 border-sage-500 text-sage-700 hover:bg-sage-50 font-medium px-6 py-3 rounded-md transition-colors">
  Secondary Action
</button>
```

### Cards

**Recipe Card:**
```jsx
<div className="bg-white rounded-lg shadow-soft overflow-hidden hover:shadow-soft-lg transition-shadow">
  <img src="..." alt="..." className="w-full h-48 object-cover" />
  <div className="p-6 space-y-3">
    <h3 className="font-serif text-2xl font-semibold text-sage-900">Recipe Title</h3>
    <p className="font-sans text-gray-600">Description...</p>
  </div>
</div>
```

### Forms

**Input Fields:**
```jsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
  placeholder="Enter text..."
/>
```

**Labels:**
```jsx
<label className="block font-sans font-medium text-gray-700 mb-2">
  Field Label
</label>
```

## Style Keywords

### Airy
- Use generous whitespace between elements
- Avoid cramped layouts
- Give content room to breathe

### Nostalgic
- Warm colors (sage, terracotta)
- Serif headings (Playfair Display)
- Soft shadows (not harsh)
- Handcrafted feel (not overly digital)

### Elegant
- Refined typography (Playfair + Inter)
- Subtle animations (transition-colors, transition-shadow)
- Consistent spacing
- Polished details (focus states, hover effects)

### Modern
- Clean layouts (grid, flexbox)
- Responsive design (mobile-first)
- Fast performance (lazy loading, WebP images)
- Contemporary UI patterns (cards, modals)

## Tailwind Configuration

**Complete Config Snippet:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e5e3',
          200: '#c7cbc7',
          300: '#a4aba4',
          400: '#808a80',
          500: '#617061',
          600: '#4d5a4d',
          700: '#3f4a3f',
          800: '#343d34',
          900: '#2c332c',
        },
        terracotta: {
          50: '#fdf5f3',
          100: '#fbe8e4',
          200: '#f7d4cc',
          300: '#f0b5a9',
          400: '#e68b78',
          500: '#d4674d',
          600: '#c3523d',
          700: '#a34132',
          800: '#86372d',
          900: '#6e3229',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'md': '6px',
        'lg': '8px',
      },
    },
  },
};
```

## Implementation (Feature 0008)

This design system will be implemented in Feature 0008 (Polish & Testing). Key tasks:
- Update `tailwind.config.js` with custom colors and fonts
- Add Google Fonts links to `index.html`
- Audit all components for design system compliance
- Apply consistent spacing, shadows, border-radius

## Resources

- **Feature**: `features/backlog/0008-polish-testing.md`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Google Fonts**: https://fonts.google.com/
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
