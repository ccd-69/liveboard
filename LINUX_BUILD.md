# Linux Build Guide

This guide covers how to build LiveBoard for Linux from a Linux machine.

 ---

 ## Prerequisites

 - A Linux distribution (Ubuntu, Debian, Fedora, Arch, etc.)
 - [Node.js](https://nodejs.org/) LTS or v24+ (match the Electron version)
 - [npm](https://www.npmjs.com/)
 - Git
 - libfuse2 (required to run the AppImage)

 ### Install prerequisites on common distros

 **Ubuntu / Debian:**

 ```bash
 sudo apt update
 sudo apt install -y nodejs npm git libfuse2
 ```

 **Fedora:**

 ```bash
 sudo dnf install -y nodejs npm git fuse-libs
 ```

 **Arch Linux:**

 ```bash
 sudo pacman -S nodejs npm git fuse2
 ```

 ---

 ## Build Steps

 1. **Clone the repository**

    ```bash
    git clone https://github.com/coolcatdude/liveboard.git
    cd liveboard
    ```

 2. **Install dependencies**

    ```bash
    npm install
    ```

    > If native module compilation fails, ensure you have `build-essential` (Ubuntu/Debian) or `base-devel` (Arch) installed.

 3. **Build the Linux package**

    ```bash
    npm run package:linux
    ```

    This produces:
    - `dist/LiveBoard-1.0.0.AppImage` — Portable AppImage
    - `dist/liveboard-1.0.0.tar.gz` — Compressed archive
    - `dist/linux-unpacked/` — Unpacked app folder

 ---

 ## Running the App

 ### AppImage (Recommended)

 The AppImage is a single file that works on most Linux distributions without installation.

 1. Make it executable:

    ```bash
    chmod +x dist/LiveBoard-1.0.0.AppImage
    ```

 2. Run it:

    ```bash
    ./dist/LiveBoard-1.0.0.AppImage
    ```

 ### Tar.gz Archive

 Extract and run the unpacked binary directly:

 ```bash
 tar -xzf dist/liveboard-1.0.0.tar.gz
 cd linux-unpacked
 ./LiveBoard
 ```

 ### Unpacked Folder

 If you built locally, the unpacked folder is already available:

 ```bash
 ./dist/linux-unpacked/LiveBoard
 ```

 ---

 ## Troubleshooting

 | Problem | Fix |
 |---------|-----|
 | `libfuse.so.2: cannot open shared object file` | Install `libfuse2` (see prerequisites above). |
 | `npm install` fails on `uiohook-napi` | Install build tools: `sudo apt install build-essential` (Debian/Ubuntu) or `sudo dnf install gcc-c++ make` (Fedora). |
 | AppImage won't run on Wayland | The app runs under XWayland by default. If it fails, launch with: `./LiveBoard-1.0.0.AppImage --enable-features=UseOzonePlatform --ozone-platform=wayland` |
 | No audio output | Check that your audio system (PulseAudio / PipeWire / ALSA) is running. If using PipeWire, install `pipewire-alsa` and `pipewire-pulse` compatibility packages. |
 | Global hotkeys don't work | On some window managers (i3, sway, etc.), the `uiohook-napi` low-level hook may require additional permissions. Run the app from a terminal to see specific errors. |
 | Permission denied when running AppImage | Run `chmod +x dist/LiveBoard-1.0.0.AppImage` to make it executable. |

 ---

 ## Building on Windows Subsystem for Linux (WSL)

 WSL2 can build the Linux package, but **the AppImage will not run inside WSL** because it lacks a display server.

 To build on WSL for deployment to a real Linux machine:

 ```bash
 cd /mnt/c/Users/coolcatdude/Documents/electron_programs/soundboard
 npm install
 npm run package:linux
 ```

 The output in `dist/` can then be copied to a Linux system and run there.

 ---

 ## Notes

 - **Electron version**: This project uses Electron 42, which requires Node.js 24. If your distro ships an older Node version, install the latest LTS from [nodejs.org](https://nodejs.org/).
 - **Desktop integration**: The AppImage does not install a `.desktop` file by default. To add LiveBoard to your app launcher, use a tool like [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) or manually create a `.desktop` entry pointing to the AppImage path.
