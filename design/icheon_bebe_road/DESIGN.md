---
name: Icheon Bebe Road
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#414942'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#717971'
  outline-variant: '#c1c9bf'
  surface-tint: '#376847'
  primary: '#316342'
  on-primary: '#ffffff'
  primary-container: '#4a7c59'
  on-primary-container: '#e1ffe5'
  inverse-primary: '#9dd3aa'
  secondary: '#5f5e5a'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dc'
  on-secondary-container: '#656460'
  tertiary: '#943f2b'
  on-tertiary: '#ffffff'
  tertiary-container: '#b35641'
  on-tertiary-container: '#fff5f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9efc5'
  primary-fixed-dim: '#9dd3aa'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#1e5031'
  secondary-fixed: '#e5e2dc'
  secondary-fixed-dim: '#c9c6c1'
  on-secondary-fixed: '#1c1c18'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#7c2d1b'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  numeric-callout:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies a calm, capable travel concierge for parents navigating day trips with toddlers and infants. It rejects chaotic, infantilized pastel clutter in favor of a modern Korean lifestyle sensibility: warm, organized, tactile, and deeply reassuring. The visual language blends Japanese-Nordic lifestyle minimalism with the functional rigor of high-utility Korean mobile services. 

Every interaction must mitigate cognitive overload. Parents traveling with young children operate under high situational stress, sensory fatigue, and single-handed mobile usage constraints. The UI radiates steady competence through generous negative space, gentle organic curves, and legible information hierarchies that allow critical logistical confirmations (nursing rooms, stroller paths, baby chair availability) to be resolved at an immediate glance.

## Colors
The palette evokes the natural warmth of Icheon's agricultural landscapes and ceramic heritage, anchored by soothing organic tones.

- **Primary (`#4A7C59`):** Soft sage green representing tranquility, safe passage, and verified child-friendly spaces. Deep variant `#3D6A4B` is reserved for pressed states and emphasized text labels; light tint `#EBF3ED` serves as the primary selection surface.
- **Secondary (`#F7F4EE`):** Warm oatmeal canvas serving as card backgrounds, secondary tags, and segment track layers, paired with `#EFECE4` for structural dividers.
- **Accent (`#E77F67`):** Warm apricot coral reserved for high-priority notifications, primary itinerary highlights, bookmark toggles, and timely reminders. Accompanied by `#FDECE7` for soft celebratory backdrops.
- **Neutrals & Canvas:** Base canvas is a warm off-white (`#FAF9F5`), preventing screen glare in direct sunlight during car travel. Active container surfaces use crisp white (`#FFFFFF`) framed with subtle neutral borders (`#E8E5DF`). Text hierarchy relies on deep warm charcoal (`#2B2B2B`), warm gray (`#686560`), and light stone (`#9C9890`).
- **Facility Verification Indicators:**
  - *Confirmed Available (YES):* Forest tint `#2D8A4E` on `#EAF5ED`.
  - *Needs Confirmation (UNKNOWN):* Warm amber `#D97706` on `#FEF3C7`.
  - *Not Available (NO):* Muted slate `#9CA3AF` on `#F3F4F6`.

## Typography
Typographic rhythm relies on `Plus Jakarta Sans` for clean, geometric structural display and numerical anchors (durations, walking minutes, parking capacities), paired with `Noto Sans` (with high-fidelity Korean glyph pairing via Pretendard/SUIT system fallbacks) for high readability across dense amenity lists.

- **Numerics & Time Callouts:** Driving times, infant age limits (e.g., `24개월 이하`), and distance meters utilize `numeric-callout` to guarantee fast scanning while parked or in motion.
- **Korean Typographic Polish:** Strict negative letter-spacing (`-0.01em` to `-0.02em`) prevents loose word breaks in Korean sentences. Word break must always be set to `keep-all` (`word-break: keep-all`) to maintain clean phrase units without dangling single characters.

## Layout & Spacing
The layout uses a mobile-first fluid grid optimized for standard Korean smartphone viewports (375px to 428px width), scaling cleanly to tablet and desktop preview modes with a fixed max-width container of `480px` on mobile-web views.

- **Touch Ergonomics:** All interactive targets mandate a strict 44x44px minimum bounding box. Key interaction points are anchored within the lower 40% of the screen to support comfortable one-handed operation while holding a child.
- **Vertical Hierarchy:** Section separation utilizes `space-xl` (32px), component internal padding utilizes `space-md` (16px) or `space-lg` (24px) for prominent spotlight cards. Micro-spacing within facility badge clusters relies on `space-xs` (4px) and `space-sm` (8px).

## Elevation & Depth
Depth is built primarily through tonal layering and delicate low-contrast outlines, avoiding heavy artificial drops. 

- **Surfaces & Borders:** Base elements sit flat on the `#FAF9F5` canvas. Elevated interactive cards use pure white `#FFFFFF` surfaces bounded by a crisp 1px border of `#E8E5DF`.
- **Ambient Shadow System:** When cards require elevation over maps or imagery, use an ultra-diffused, warm-tinted shadow: `0 4px 16px -2px rgba(74, 124, 89, 0.06), 0 2px 6px -1px rgba(43, 43, 43, 0.04)`.
- **Floating Modals & Sticky CTAs:** Bottom action bars apply a subtle upward blur: `0 -4px 20px rgba(43, 43, 43, 0.05)` with a semi-opaque backdrop blur (`rgba(250, 249, 245, 0.94)` with `backdrop-filter: blur(8px)`).

## Shapes
Shapes express approachability without veering into toy-like aesthetic:

- **Cards & Primary Modules:** Use `rounded-xl` (24px) for full-width destination cards and route step blocks, evoking organic ceramic smoothness.
- **Nested Controls & Badges:** Use `rounded-lg` (16px) for interior facility detail clusters and inner content wells.
- **Action Buttons & Facility Chips:** Pill-shaped (`9999px` radius) for status tags, filter chips, and primary bottom navigation actions to ensure friendly ergonomics and tactile affordance.

## Components

### Facility Scannable Grid (편의시설 체크)
A dedicated 2-to-4 column grid summarizing core infant logistics for each location:
- **7 Core Metrics:** 유모차 (Stroller), 수유실 (Nursing Room), 기저귀 갈이대 (Diaper Changing Table), 아기의자 (High Chair), 주차 (Parking), 화장실 (Restroom), 휴식공간 (Rest Zone).
- **State Badges:** Each item renders with its specific visual status:
  - *YES:* `#2D8A4E` icon & label on `#EAF5ED` background.
  - *확인 필요 (UNKNOWN):* `#D97706` icon & label on `#FEF3C7` background.
  - *NO:* `#9CA3AF` icon & label on `#F3F4F6` background.
- Padding is compact (`space-xs` vertical, `space-sm` horizontal) with 8px radius.

### Buttons & Interactive CTAs
- **Primary Sticky CTA:** Full-width fixed bottom button bar. 52px height, filled with primary sage `#4A7C59`, white typography (`label-lg`), and pill-shaped radius. Safe-area padding included at screen bottom.
- **Secondary Action:** Outlined in `#4A7C59` with transparent or `#FFFFFF` fill, 48px height.
- **Quick Action Icon Buttons:** 44x44px minimum hit area, 12px rounded or circular, background `#F7F4EE`.

### Itinerary Timeline Connectors (베베로드 동선)
- Linear vertical path depicting trip flow (e.g., Ceramic Park -> Baby-friendly Cafe -> Farm).
- **Milestone Nodes:** 32px circular indicators housing chronological sequence numbers or category icons.
- **Connector Line:** 2px solid `#E8E5DF` line linking nodes.
- **Transit Segment Info:** Embedded mini-pill chips between stops showing drive time and baby nap feasibility (e.g., `차량 12분 · 아기 낮잠 추천 구간`).

### Filter Chips
- **States:** Default state is `#FFFFFF` background with 1px `#E8E5DF` border and `#686560` text. Selected state transforms to primary `#EBF3ED` surface, `#4A7C59` border, and `#3D6A4B` text with an active checkmark. Height is 36px with 14px horizontal padding.

### Cards & Detail Blocks
- **Destination Card:** Top edge holds high-aspect (16:9) photo with `rounded-xl` top masking. Body section includes destination name, distance, toddler suitability tag (e.g., `18~36개월 추천`), and the scannable facility row.
- **Notice & Tip Banners (부모 안심 팁):** Soft apricot surface `#FDECE7` with `#E77F67` icon indicator highlighting ground conditions (e.g., "야외 잔디밭이라 유모차 진입 시 절충형 이상 권장").