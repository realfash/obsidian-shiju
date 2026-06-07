# Shiju 0.2.2

This patch release focuses on community review fixes so the plugin can move cleanly through the Obsidian submission process.

## Highlights

- Keeps the declared `minAppVersion` valid by replacing newer vault file lookup calls with a compatibility helper
- Updates the settings screen heading to follow Obsidian's recommended `Setting(...).setHeading()` pattern
- Replaces the deprecated `builtin-modules` dependency in the build script with Node's built-in `node:module` list

## Included fixes

- Narrows saved settings loading to avoid unsafe startup assignment warnings
- Removes CSS patterns flagged in review linting, including `scrollbar-width` and toolbar `!important` overrides

## Release Assets

- `manifest.json`
- `main.js`
- `styles.css`
