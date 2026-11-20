# Typography

The application uses Geist Sans for interface text and Geist Mono for technical identifiers and reference-entry fields. Use the existing Tailwind scale instead of arbitrary pixel sizes for new UI.

| Role                                                | Size / line height | Weight                      |
| --------------------------------------------------- | ------------------ | --------------------------- |
| Workspace page title                                | 24 / 32 px         | 600                         |
| Authentication title                                | 30 / 40 px         | 600                         |
| Section or dialog title                             | 18 / 28 px         | 600                         |
| Body, input, button, table value/header, navigation | 14 / 20 px         | 400; 500 for labels/actions |
| Metadata, hints, status badges, secondary controls  | 12 / 16 px         | 400–500                     |

Keep headings sentence case with restrained negative tracking. Do not use decorative uppercase or monospace for ordinary navigation and labels. Money and timestamps use tabular numerals. Reference IDs retain monospace; environment labels use sans-serif. Avoid decreasing text size when switching table density: density changes padding, not readability.

The November 2026 consistency pass covers global defaults, workspace headings, auth headings and supporting labels, sidebar navigation, form labels/buttons, table headings, transaction toolbar, and advanced-filter indicators. Some copied optional components (charts, picker avatars and specialized table cells) still have their original compact styles; this is not a claim that every unused reference component has been restyled.
