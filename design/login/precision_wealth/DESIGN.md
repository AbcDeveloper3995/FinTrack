---
name: Precision Wealth
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#7b0020'
  on-tertiary: '#ffffff'
  tertiary-container: '#a6002f'
  on-tertiary-container: '#ffb0b4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-lg:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  metric-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the calculated clarity, control, and poise required for high-agency personal wealth tracking. Blending structural Modern Corporate ergonomics with restrained Tactile Glassmorphism, the interface prioritizes high information density without inducing cognitive fatigue. 

The aesthetic is crisp, deliberate, and premium—evoking the sensory qualities of architectural drafting tools and executive banking terminals rather than gamified consumer apps. Visual weight stems from precise spatial rhythm, razor-thin borders, and data-forward components. Negative space functions actively to isolate metrics, while rich color signaling translates complex portfolios, cash flows, and category budgets into instantaneous visual comprehension.

## Colors

The palette establishes an unambiguous fiscal taxonomy:
- **Primary Indigo (`#4338CA` / `#4F46E5`):** Reserved for system-level controls, primary call-to-actions, net-worth trajectories, and interactive navigation elements.
- **Emerald Growth (`#059669` / `#10B981`):** Applied strictly to incoming liquidity, investment yield, positive cash-flow deltas, and targets successfully achieved.
- **Crimson Outflow (`#E11D48` / `#EF4444`):** Governs outgoing transactions, recurring liabilities, portfolio drawdown, and critical deficit states.
- **Amber Warning (`#D97706` / `#F59E0B`):** Denotes threshold warnings, budget proximity limits (85%+ consumption), and pending sync states.
- **Slate Canvas (`#F8FAFC` base, `#0F172A` deep text, `#64748B` supporting metadata):** Anchors all data grids with high optical contrast while eliminating harsh pure-black eye strain.

For data visualizations, semantic colors retain their strict meaning; category breakouts utilize a desaturated secondary spectrum (e.g., slate, steel-cyan, muted violet) to prevent conflict with positive/negative indicators.

## Typography

Typography relies uniformly on **Inter** to ensure maximum glyph neutrality and geometric structure. 

Crucially, all financial figures, account IDs, transaction dates, and data tables must enforce monospaced tabular numerals via CSS: `font-variant-numeric: tabular-nums lining-nums`. This prevents optical jitter during real-time balance calculations and maintains strict vertical decimal alignment across multi-row transaction ledgers.

Headers and key balance figures use tight negative letter-spacing for an authoritative editorial impact. Metadata labels and table headers utilize uppercase, tracked-out styling (`0.04em`) to establish clear hierarchy above raw values.

## Layout & Spacing

The application employs a fixed-width fluid hybrid desktop-first grid. 

- **Desktop (1280px+):** Max canvas container constrained to `1440px` with a persistent `260px` sidebar rail. Main content surfaces across a 12-column fluid grid with `2rem` gutters. Top-level metric summary cards snap into 3- or 4-column groupings.
- **Tablet (768px – 1023px):** The sidebar transitions to an icon dock (`72px`) or off-canvas drawer. The grid condenses to 8 columns with `1.5rem` gutters.
- **Mobile (< 768px):** Single-column stack with `1rem` margins and `1rem` component gaps. Balance cards shift to swipeable carousels.

Spacing adheres to an explicit 4px baseline, with `space-md` (16px) acting as the standard cell padding for cards and `space-xs` to `space-sm` governing intra-element text and badge margins.

## Elevation & Depth

Hierarchy is established through structural layering and razor-thin containment borders rather than heavy drop shadows:

- **Surface Tier 0 (Base Canvas):** `#F8FAFC`, non-elevated.
- **Surface Tier 1 (Cards & Data Sections):** `#FFFFFF` paired with an inner-glow border (`1px solid #E2E8F0`). Shadow is ultra-diffused: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Surface Tier 2 (Hovered Rows, Popovers, Flyout Panels):** `#FFFFFF` with `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)` and a crisp outer border of `rgba(15, 23, 42, 0.08)`.
- **Surface Tier 3 (Modals & Command Palette):** Backdropped with `rgba(15, 23, 42, 0.4)` and a `blur(8px)` glass scrim. The modal card retains a 1px perimeter highlight (`inset 0 1px 0 0 rgba(255, 255, 255, 0.8)`).

## Shapes

The design system maintains a refined, modern standard radius:
- **Cards & Data Modules:** Standardized at `1rem` (16px), giving financial modules a contemporary, welcoming form without sacrificing spatial economy.
- **Inner Controls (Buttons, Inputs, Pill Badges):** Calibrated to `0.5rem` (8px) to fit tightly inside cards.
- **Status Badges & Category Tags:** Pill-shaped (`9999px`) to visually differentiate metadata from actionable rectangle targets.

## Components

### Buttons
- **Primary:** Solid `#4338CA` with white text, 8px border-radius, height 40px, padding `0 1rem`. Micro-gradient highlight on top edge (`inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`).
- **Secondary:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, text `#1E293B`. Hover shifts to `#F8FAFC` and border `#CBD5E1`.
- **Destructive:** Surface `#FFF1F2`, text `#E11D48`, hover `#FFE4E6`.

### Cards & Metrics
- Container has a 16px radius, `1px solid #E2E8F0`, and white ground. 
- Top-level metric cards display the stat label (`label-md` in `#64748B`), the prominent total (`metric-lg` with `tabular-nums`), and a trend pill below showing delta percentages.

### Status Chips & Badges
- Compact padding (`0.25rem 0.625rem`), pill geometry, font size 12px, font weight 600.
- **Income/Positive:** Background `#ECFDF5`, text `#047857`, border `1px solid #A7F3D0`.
- **Expense/Negative:** Background `#FFF1F2`, text `#BE123C`, border `1px solid #FECDD3`.
- **Warning/Near Limit:** Background `#FFFBEB`, text `#B45309`, border `1px solid #FDE68A`.

### Transaction Lists
- Multi-row data tables with a persistent light gray header (`#F8FAFC`). Row heights fixed at 56px with a `1px solid #F1F5F9` bottom divider.
- Merchant logos sit in a 36px rounded square (`radius 8px`) container with `#F1F5F9` background.
- Right-aligned values enforce `tabular-nums` font settings. Positive inflows prepend a green `+`, outflows prepend a neutral or red `−`.

### Input Fields & Controls
- Height 40px, radius 8px, border `1px solid #CBD5E1`, background `#FFFFFF`. Active focus state triggers an outer glow: `box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15)` with a border tint of `#4F46E5`.
- Checkboxes and radio buttons use `#4338CA` when selected, with smooth 150ms ease transitions.

### Progress Bars (Budgets)
- Height 6px, track background `#F1F5F9`, border radius 9999px. Fill uses solid emerald (`#10B981`), transitioning dynamically to amber (`#F59E0B`) at 85% and crimson (`#EF4444`) at 100%+ capacity.