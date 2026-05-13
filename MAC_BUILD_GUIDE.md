# Build Guide

This guide covers how to build LiveBoard packages for Windows, macOS, and Linux.

---

## Prerequisites (All Platforms)

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Git (to clone the repo)

Clone the repository and install dependencies:

```bash
git clone https://github.com/coolcatdude/liveboard.git
cd liveboard
npm install
```

---

## Windows Build

### Build from Windows

Run one of the following commands in PowerShell or Command Prompt inside the project folder:

```bash
# Portable .exe + Installer
npm run package:win

# Or build all platforms
npm run package:all
```

### Output

- `dist/LiveBoard Setup 1.0.0.exe` — NSIS installer
- `dist/LiveBoard 1.0.0.exe` — Portable executable
- `dist/win-unpacked/` — Unpacked app folder

---

## macOS Build

**macOS packages must be built on a Mac.** You cannot build the `.dmg` or `.zip` from Windows or Linux.

### Build from macOS

1. Open **Terminal** on your Mac.
2. Navigate to the project folder:

```bash
cd /path/to/liveboard
```

3. Install dependencies:

```bash
npm install
```

4. Build the macOS package:

```bash
npm run package:mac
```

### Output

- `dist/LiveBoard-1.0.0.dmg` — macOS disk image installer
- `dist/LiveBoard-1.0.0-mac.zip` — Portable zip archive
- `dist/mac/LiveBoard.app` — Unpacked `.app` bundle

### Notes

- **Apple Silicon (M1/M2/M3)**: The build produces a universal binary supporting both `arm64` and `x64` by default.
- **First Launch**: If the app is not signed with an Apple Developer certificate, macOS will block it. Users must right-click the `.app` or `.dmg` and select **Open**, then confirm in **System Preferences > Security & Privacy**.
- **Accessibility Permissions**: The global hotkey feature requires accessibility access. The app will prompt for this on first use. Go to **System Preferences > Security & Privacy > Accessibility** and check **LiveBoard**.
- **Notarization** (optional): For distribution without the right-click workaround, you need an Apple Developer ID and must notarize the app. This requires a paid Apple Developer account and additional setup in `package.json`.

---

## Linux Build

### Build from Linux

Run the following command in a terminal inside the project folder:

```bash
npm run package:linux
```

### Output

- `dist/LiveBoard-1.0.0.AppImage` — Portable AppImage
- `dist/liveboard-1.0.0.tar.gz` — Compressed archive
- `dist/linux-unpacked/` — Unpacked app folder

### Notes

- **AppImage**: To run the AppImage, make it executable first:

```bash
chmod +x dist/LiveBoard-1.0.0.AppImage
./dist/LiveBoard-1.0.0.AppImage
```

- **Wayland**: If using a Wayland-based desktop (e.g., GNOME on Fedora), the app may run under XWayland. Native Wayland support is experimental in Electron.

---

## Build All Platforms

To build for Windows, macOS, and Linux in one go:

```bash
npm run package:all
```

**Note:** This command will fail on Windows for the macOS target, and on macOS for the Windows target if code signing is required. It is best used on a CI/CD server (like GitHub Actions) that can run all three platform builds in parallel.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm install` fails on native modules | Run `npm install` with the same Node.js version used to build the project. If using Electron 42, Node 24 is expected. |
| `electron-builder` not found | Run `npm install` to install dev dependencies. |
| macOS `.dmg` won't mount | Double-click the `.dmg`. If it says it's damaged, run `xattr -cr dist/LiveBoard-1.0.0.dmg` in Terminal. |
| macOS app is "damaged" | This is Gatekeeper. Right-click the `.app` and choose **Open**, or run `xattr -cr` on the `.app`. |
| Windows portable exe is slow to start | The portable exe extracts to a temp folder on first run. This is normal for `electron-builder` portable targets. |
| Linux AppImage won't run | Make sure `libfuse2` is installed: `sudo apt install libfuse2` (Debian/Ubuntu) or equivalent for your distro. |

---

## CI/CD (GitHub Actions)

To build all three platforms automatically on every release, you can use GitHub Actions. A basic workflow file `.github/workflows/build.yml` would look like this:

```yaml
name: Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm install
      - run: npm run package:all
      - uses: actions/upload-artifact@v4
        with:
          name: liveboard-${{ matrix.os }}
          path: dist/*
```

This will produce artifacts for Windows, macOS, and Linux on every push to `main`.
