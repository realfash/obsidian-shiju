# Releasing 拾句 Shiju

This project is almost ready for a public Obsidian plugin release. Use this file as the release checklist.

## Current Identity

- Plugin name: `拾句 Shiju`
- Plugin id: `shiju`
- Current version: `0.2.0`
- Release assets: root-level `manifest.json`, `main.js`, `styles.css`

## Before Publishing

1. Move the plugin into its own GitHub repository
2. Keep the repository root clean:
   - `manifest.json`
   - `main.ts`
   - `main.js`
   - `styles.css`
   - `README.md`
   - `LICENSE`
   - `versions.json`
3. Test in a clean vault on:
   - macOS
   - iPhone
4. Confirm these flows:
   - target daily note exists
   - target daily note does not exist
   - target heading exists
   - target heading does not exist
   - template note exists
   - template note is missing

## GitHub Release

For each public version:

1. Update `manifest.json`, `package.json`, and `versions.json`
2. Run:

```bash
npm run build
```

3. Create a GitHub release tag that exactly matches the plugin version
4. Upload these assets to the release:
   - `manifest.json`
   - `main.js`
   - `styles.css`

## Community Submission

When the plugin repo is public and the first release is ready:

1. Submit the plugin through Obsidian's community plugin flow
2. Point the submission to the dedicated GitHub repository
3. Be ready to answer review feedback about:
   - plugin purpose
   - mobile behavior
   - default settings
   - known limitations

## Recommended Next Steps

- Translate the settings tab into a consistent public-facing language set
- Replace remaining private-project assumptions in defaults if needed
- Add a few screenshots or a short demo GIF for the repository page
