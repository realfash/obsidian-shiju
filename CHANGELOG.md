# Changelog

All notable changes to 拾句 Shiju will be documented in this file.

The format follows a simple Keep a Changelog style and uses semantic versioning.

## [Unreleased]

## [0.3.3] - 2026-06-09

### Changed

- Toolbar button labels in Chinese mode: 斜体 (was I), 代码 (was </>), 引用 (was "), 横线 (was —) — all now display as 2 Chinese characters.

### Fixed

- Blockquote tool button no longer jumps 2 lines below the content — cursor now stays inside `> 引用内容`, ready for immediate editing.

## [0.3.2] - 2026-06-09

### Changed

- Tag suggestions now render as a floating overlay anchored to the cursor position inside the textarea, using a textarea mirror element for pixel-accurate positioning. The overlay does not participate in document flow — content area no longer jumps when suggestions appear or disappear.

### Fixed

- Keyboard navigation (↑/↓/Enter) in suggestion overlay now scrolls only the overlay itself via `scrollItemIntoView()`, preventing accidental modal scrolling.
- Event system refactored: uses `selectionchange` + `input` + capture-phase `scroll` + `resize` with named function references (da688ing) for reliable setup/teardown across modal open/close cycles.

## [0.3.1] - 2026-06-09

### Fixed

- Concurrent write race condition: reverted to `vault.process()` atomic read-modify-write in daily note saving, eliminating silent data loss risk when near-simultaneous captures occur
- Ribbon tooltip now updates immediately when switching language in settings

## [0.3.0] - 2026-06-09

### Added

- Tag suggestion dropdown: matching highlight, keyboard navigation (↑/↓/Enter), interactive item selection
- GitHub Actions CI workflow: automated build on push and pull request
- Markdown toolbar expanded: italic, inline code, blockquote, horizontal rule buttons
- Horizontal scroll for the Markdown toolbar on mobile
- Save-and-scroll: after saving, the editor now scrolls to and positions the cursor at the inserted content
- Settings page "Reset to Defaults" button with confirmation dialog

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
