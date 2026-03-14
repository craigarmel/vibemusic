# Story 1.2: Implement Neon Studio Design System & App Shell

Status: done

## Story

As an **artist or fan**,
I want a visually stunning dark neon interface,
so that the app feels like a premium AI music studio from the future.

## Acceptance Criteria

1. **Given** the initialized frontend project
   **When** I open the application in a browser
   **Then** the page has a deep black (#0a0a0a) background with no white flashes

2. **Given** the design system is applied
   **When** I inspect the CSS
   **Then** Tailwind custom theme vars define: cyan (#00f0ff), magenta (#ff00aa), purple (#8b5cf6), dark bg (#0a0a0a), muted gray (#a0a0a0)
   **And** Inter font is loaded and applied (bold all-caps for headings, regular for body)

3. **Given** the app shell is rendered
   **When** I view any page
   **Then** a `Layout.tsx` component wraps content with the dark theme, max-width container, and consistent padding

4. **Given** the design system components exist
   **When** I inspect the shared components
   **Then** `LoadingSpinner.tsx` renders an animated cyan spinner
   **And** `Toast.tsx` renders dismissible notification toasts (success=cyan, error=magenta)
   **And** glass morphism utility classes work (backdrop-blur, semi-transparent bg, neon borders)

## Tasks / Subtasks

- [x] Task 1: Tailwind theme and global styles (AC: #1, #2)
  - [x] 1.1: Update `index.css` with Tailwind import and CSS custom properties for theme colors
  - [x] 1.2: Add Tailwind `@theme` block to extend colors: `neon-cyan`, `neon-magenta`, `neon-purple`, `bg-dark`, `text-muted`, `bg-card`, `border-subtle`
  - [x] 1.3: Add Inter + JetBrains Mono fonts via Google Fonts CDN link in `index.html`
  - [x] 1.4: Set global body styles in index.html and CSS
  - [x] 1.5: Add glass morphism utilities (`.glass`, `.glass-strong`, `.neon-border`, `.neon-border-magenta`, `.neon-glow`, `.neon-text`) + button utilities (`.btn-primary`, `.btn-magenta`)
- [x] Task 2: Layout component (AC: #3)
  - [x] 2.1: Create `frontend/src/components/Layout.tsx` — dark themed wrapper with min-h-screen, flex column
  - [x] 2.2: Include Synthetica logo from `/images/logo.png` in header area (small, top-left)
- [x] Task 3: Shared UI components (AC: #4)
  - [x] 3.1: Create `frontend/src/components/LoadingSpinner.tsx` — animated spinning circle with cyan glow, sm/md/lg sizes
  - [x] 3.2: Create `frontend/src/components/Toast.tsx` — glass morphism card, auto-dismiss, success (cyan) and error (magenta) variants
  - [x] 3.3: Create `frontend/src/components/Slider.tsx` — styled range input with neon cyan gradient track, label and value display

## Dev Notes

### Architecture Compliance

- All shared components go in `frontend/src/components/`
- Feature-specific components go in `frontend/src/features/{feature}/`
- PascalCase for component files and names

### Technical Requirements — Tailwind v4

- Tailwind v4 uses `@theme` directive in CSS instead of `tailwind.config.js`
- Custom colors are defined with `@theme { --color-*: value; }` syntax
- Example:
  ```css
  @import "tailwindcss";

  @theme {
    --color-neon-cyan: #00f0ff;
    --color-neon-magenta: #ff00aa;
    --color-neon-purple: #8b5cf6;
    --color-bg-dark: #0a0a0a;
    --color-text-muted: #a0a0a0;
  }
  ```
- Then use as `bg-neon-cyan`, `text-neon-magenta`, `border-neon-purple` etc.

### Visual Reference (Stitch Templates)

The following Stitch mockups are in `frontend/public/templates/` — use these as EXACT visual reference:
- `dashboard-screen.png` — Left sidebar with nav icons, main content area, glass morphism cards, cyan/magenta accents
- `profile-screen.png` — Artist profile layout, stats cards, track grid, all dark with neon accents
- `camera-screen.png` — Live session with timer, camera feed area, audio visualizer bars
- `session-screen.png` — Session complete card centered, waveform, publish button gradient

**Key design patterns from mockups:**
- Sidebar: ~200px wide, dark background, nav items with icons, active item has cyan highlight
- Cards: glass morphism (dark semi-transparent bg, subtle border, rounded-xl)
- Buttons: Primary = gradient cyan-to-purple or magenta, rounded-full, bold text. Secondary = outline with cyan border
- Text: White for primary, muted gray for secondary, monospace for data/counts
- Tags/pills: small rounded-full, cyan or magenta border, uppercase small text

### Naming Conventions

- Component files: `PascalCase.tsx`
- CSS classes: Tailwind utilities, custom classes with `.` prefix in index.css

### Previous Story Intelligence

- Story 1.1 creates the Vite+React+TS scaffold — this story builds on top of it
- `index.css` already has `@import "tailwindcss"` — extend it, don't replace
- `App.tsx` is a minimal placeholder — Layout will wrap its content

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Direction]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Key Visual Elements]
- [Source: public/templates/ — Stitch mockup PNGs]
- [Source: public/images/logo.png — Synthetica logo]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Tailwind v4 @theme block defines 7 custom colors + 2 custom font families
- Glass morphism: `.glass` (light) and `.glass-strong` (heavier blur) utilities
- Neon effects: `.neon-border`, `.neon-border-magenta`, `.neon-glow`, `.neon-text`
- Button utilities: `.btn-primary` (cyan-purple gradient), `.btn-magenta` (magenta-purple gradient) with hover glow
- Layout wraps all pages with logo header and dark bg
- Toast auto-dismisses after configurable duration, transitions with opacity/translate
- Slider shows dynamic cyan fill percentage via inline style

### File List

- frontend/index.html (modified — title, fonts, favicon, body class)
- frontend/src/index.css (modified — @theme, glass, neon, button utilities)
- frontend/src/components/Layout.tsx (new)
- frontend/src/components/LoadingSpinner.tsx (new)
- frontend/src/components/Toast.tsx (new)
- frontend/src/components/Slider.tsx (new)
