# LiveBoard Version History

This file tracks all releases. To revert to any version, see the commands below.

## Tags vs. Folders

Git **tags** are the recommended way to manage versions. They act like bookmarks to specific commits. You don't need to keep separate copies of the entire codebase in folders — Git stores the full history.

## Quick Revert Commands

```bash
# View all versions
git tag

# Revert to a specific version (creates a temporary checkout)
git checkout v1.0.2

# Revert and create a new branch from that version
git checkout -b hotfix-branch v1.0.2

# Go back to latest version
git checkout master
```

## Release Notes

### v1.0.3 (current)
- **Commit:** c1866b1
- **Fix:** Preload script crash — reverted to CommonJS `require()` syntax
- **Fix:** Grid buttons now render correctly
- **Feature:** Manual "Check for Updates" button in Settings
- **Feature:** Stop Audio hotkey display in header

### v1.0.2
- **Commit:** cd273cf
- **Feature:** Added manual "Check for Updates" button to Settings modal
- **Feature:** Display current app version in Settings
- **Feature:** Stop Audio hotkey badge in header
- **Fix:** Null checks on DOM event handlers

### v1.0.1
- **Commit:** d472271
- **Feature:** Added `release`, `release:win`, `release:mac`, `release:linux` scripts
- **Chore:** Standardized publisher to `ccd-69`

### v1.0.0
- **Commit:** 28b4a3c
- **Feature:** Initial release
- Grid-based soundboard (4x4, 8x8, 16x16)
- Keyboard and MIDI keybinds per sound
- 25+ themes including animated backgrounds
- Audio device routing (VB-Cable/Voicemeeter support)
- Per-sound gain control and master volume
- Real-time audio meter visualization
- Auto-updater support

## How to Create a New Release

1. Bump the version in `package.json`
2. Commit the version bump
3. Create a tag: `git tag -a v1.0.x -m "Release v1.0.x"`
4. Push: `git push origin master && git push origin --tags`
5. Build and publish: `npm run release:win`
