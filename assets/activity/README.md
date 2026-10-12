# Profile activity artwork

The GitHub README displays a compact animated panel and switches to the mobile
layout below 640px. Visitors who prefer reduced motion receive the PNG version.
Clickable numeric evidence remains available in the collapsed contribution table.

`data.json` stores the last successful public GitHub API snapshot. The same data
drives both image variants and the linked table. Lifetime counts are grouped by
repository; the homepage repository and `qinshihu/itops-agent-platform` are
excluded. At most seven recently contributed repositories are displayed.

Run `npm ci` and `npm run update:activity` to refresh live data, or
`npm run render:activity` to regenerate artwork using the existing snapshot.
The GitHub Actions workflow uses the same commands.

The compact background was generated with the built-in ImageGen tool from the
three anime scene images supplied by the profile owner. Prompt direction: a
text-free landscape scrapbook with a coastal header, quiet ivory data area,
and street / golden-flower portraits on the right. The deliberately shorter
layout follows the owner's final compactness request.

Noto Sans SC was downloaded from `google/fonts/ofl/notosanssc`, instantiated at
weights 400 and 700, and subset for this UI. The OFL license is in `fonts/OFL.txt`.
All letters and numerals are rendered from code rather than generated image text.

GIFs use a shared palette and transparent delta frames. Only decorative glints
and petals move; contribution text and figures remain stationary. PNGs preserve
full color and are also used as reduced-motion alternatives.
