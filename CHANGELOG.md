# Changelog

All notable changes to 拾句 Shiju will be documented in this file.

The format follows a simple Keep a Changelog style and uses semantic versioning.

## [Unreleased]

## [0.2.2] - 2026-06-07

### Changed

- Replaced newer vault file lookup calls with `getAbstractFileByPath` compatibility helpers to keep the declared minimum app version valid
- Updated the settings screen heading to use Obsidian's recommended `Setting(...).setHeading()` pattern
- Replaced the `builtin-modules` build dependency with Node's built-in `node:module` list

### Fixed

- Narrowed saved settings loading to avoid unsafe `any` assignment during plugin startup
- Removed CSS patterns flagged by community review linting, including `scrollbar-width` and `!important` toolbar overrides

## [0.2.1] - 2026-06-06

### Added

- Added a language preference setting with `Auto`, `中文`, and `English`
- Added English UI support for the modal, toolbar, buttons, notices, and settings
- Added tag suggestions sourced from existing Obsidian tags
- Added list indentation support for `Tab` and `Shift+Tab`

### Changed

- Unified plugin copy through a shared i18n layer so interface text switches consistently
- Changed the public manifest display name to `Shiju`
- Stopped tracking generated `main.js` in the repository default branch
- Moved tag suggestions into a fixed single-row area between the toolbar and the input box
- Renamed the Chinese quick-capture action label to `拾句`

### Fixed

- Fixed quick-capture modal startup order so the input area renders reliably
- Fixed iPhone third-party keyboard newline handling for list continuation
- Fixed list continuation and insertion to preserve unordered list markers like `-`, `*`, and `+`
- Fixed list toolbar actions so they can prepend markers at the start of an existing line

## [0.2.0] - 2026-06-06

### Added

- Renamed the public plugin identity to `拾句 Shiju`
- Added bilingual public README content for GitHub
- Added release checklist documentation
- Added heading level setting for the Markdown toolbar title button
- Added template-based daily note creation

### Changed

- Optimized the mobile Markdown toolbar layout for iPhone usage
- Improved the plugin structure for public release preparation

### Fixed

- Fixed daily note path token replacement so folder names like `Daily` are not corrupted
- Fixed iPhone toolbar styling by applying stronger runtime layout control
