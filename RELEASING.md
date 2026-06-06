# Releasing 拾句 Shiju

This project is almost ready for a public Obsidian plugin release. Use this file as the release checklist.

## Current Identity

- Plugin name: `拾句 Shiju`
- Plugin id: `shiju`
- Current version: `0.2.0`
- Release assets: root-level `manifest.json`, `main.js`, `styles.css`

## Versioning

Use semantic versioning:

- `patch` like `0.2.1`: bug fixes, copy tweaks, layout fixes, small internal improvements
- `minor` like `0.3.0`: new user-facing features, new settings, new capture behaviors
- `major` like `1.0.0`: stable public milestone or intentionally breaking changes

Files that must stay in sync during a release:

- `manifest.json`
- `package.json`
- `versions.json`
- `CHANGELOG.md`

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

1. Update `manifest.json`, `package.json`, `versions.json`, and `CHANGELOG.md`
2. Run:

```bash
npm run build
```

3. Commit the version bump
4. Create a GitHub release tag that exactly matches the plugin version
5. Upload these assets to the release:
   - `manifest.json`
   - `main.js`
   - `styles.css`

## Suggested Release Rhythm

For most changes in this project:

1. Make the code change
2. Update the changelog entry
3. Bump the version
4. Run `npm run build`
5. Test on at least one clean vault and one mobile vault
6. Commit, tag, and publish the GitHub release

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
