# Soft Sky UI baseline

## Character

Approachable and calm, not a formal banking terminal. Cloud backgrounds, denim actions, softer corners and generous information rhythm make the workspace friendly without adding neon colors, decorative gradients, emojis or fake features.

## Foundations

Use semantic tokens from `src/app/globals.css`, not feature-local hex values:

| Role         | Light value | Purpose                                  |
| ------------ | ----------- | ---------------------------------------- |
| Background   | `#F5F7FA`   | Cloud workspace canvas                   |
| Card/popover | `#FFFFFF`   | Record, table, form and overlay surfaces |
| Foreground   | `#283341`   | Soft charcoal text                       |
| Primary      | `#355D91`   | Denim actions, references and focus      |
| Accent       | `#E7EFFB`   | Pale-sky active/selected surfaces        |

Dark mode has independently chosen cloud/slate surfaces and a lighter denim foreground. Brand blue is not success: successful outcomes remain green, pending amber, and failures red. Keep icon + label for statuses.

Use `input` for interactive boundaries and `border` for quieter decorative separators. Do not weaken input or focus contrast to achieve softness. Small text must retain at least 4.5:1 contrast; required control boundaries and focus indicators at least 3:1.

## Shape and rhythm

Keep Geist/Geist Mono, 24px H1, 14px body/table labels and 12px metadata. Keep monetary values right-aligned/tabular and identifiers selectively monospace. Preserve locale formatting and UTC labels.

Radius mapping is explicit: `sm` 10px controls, `md` 12px intermediate elements, `lg` 16px panels. Outer panels can be rounded; table cells and internal grid geometry remain square. Do not use oversized pill shapes everywhere. Keep line tabs underlined and segmented tabs softly selected.

Use 16/24/32px gutters and relaxed section spacing. A subtle shadow is appropriate for the login surface and overlays, not every field/row/card. Important mobile actions retain 44px touch targets. Motion remains restrained and respects reduced-motion preferences.

## Compositions

- `WorkspaceHeader` is the standard heading/actions composition; `DashboardPageHeader` delegates to it.
- `RecordSection` provides heading/description/dividers inside one enclosing record sheet, without creating another Card. Use its quieter separators and medium-weight headings instead of nested card stacks.
- `Card` establishes a distinct surface, not every group of fields.
- `TableWorkspace` remains controlled: domains own data, filters, mutations and permissions. Sticky/pinned surfaces must stay opaque in both themes.
- `SemanticStatus` presents domain-owned status mappings. Never infer eligibility or business transitions from color.
- Preserve Base UI `render`, keyboard/focus/portal semantics, loading/error/disabled states, and en/id labels.

## Verification

`src/lib/ledger-theme.test.ts` retains its filename but validates the current Soft Sky token pairs. The browser baseline resolves `--card` independently and checks the actual pinned cell against that surface and opacity, rather than hardcoding an obsolete theme color.

Inspect screenshots of login, overview, tables, records and forms in light/dark, English/Indonesian and mobile/tablet/desktop. Check long references, focused controls, error states and horizontal overflow; color tests alone do not verify usable layout.
