import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import * as uiohook_module from 'uiohook-napi';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const soundConfigs = new Map();
let stopAudioBind: string | null = null;
const DEBUG = process.env.LIVEBOARD_DEBUG === '1';

// Allowed audio extensions
const ALLOWED_AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'flac']);

// Allowed theme values
const ALLOWED_THEMES = new Set([
  'void', 'solar', 'cyberpunk', 'custom',
  'matrix', 'sunset', 'ocean', 'midnight', 'cherry',
  'retro', 'synthwave', 'nord', 'dracula', 'tokyo-night',
  'gruvbox', 'forest', 'pastel', 'monokai', 'terminal',
  'high-contrast',
  'aurora', 'lava', 'ocean-waves', 'neon-pulse', 'galaxy'
]);

// Allowed grid sizes
const ALLOWED_GRID_SIZES = new Set([4, 8, 16]);

function getUIOHook() {
    if (uiohook_module.uIOhook) return uiohook_module.uIOhook;
    if (uiohook_module.default && uiohook_module.default.uIOhook) return uiohook_module.default.uIOhook;
    if (uiohook_module.default) return uiohook_module.default;
    return uiohook_module;
}

const uIOhook = getUIOHook();

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_SETTINGS = {
  gridSize: 4,
  theme: 'void',
  accentColor: '#ffcc00',
  audioDevice: 'default',
  sounds: {}
};

function isValidFilePath(filePath: string): boolean {
  if (typeof filePath !== 'string') return false;
  if (filePath.length > 4096) return false;
  // Must be absolute
  if (!path.isAbsolute(filePath)) return false;
  // Normalize and check for path traversal
  const normalized = path.normalize(filePath);
  if (normalized.includes('..')) return false;
  // Check extension
  const ext = path.extname(normalized).toLowerCase().replace('.', '');
  if (!ALLOWED_AUDIO_EXTS.has(ext)) return false;
  return true;
}

function isValidKeybind(bind: string): boolean {
  if (typeof bind !== 'string') return false;
  if (bind.length === 0 || bind.length > 100) return false;
  // Only allow alphanumeric, F-keys, modifiers, and common symbols
  const valid = /^[a-zA-Z0-9\s\-+_]+$/.test(bind);
  return valid;
}

function sanitizeSoundConfig(config: any): any | null {
  if (!config || typeof config !== 'object') return null;
  const index = Number(config.index);
  if (!Number.isInteger(index) || index < 0 || index > 255) return null;

  const result: any = { index };

  if (config.filePath != null) {
    if (!isValidFilePath(config.filePath)) return null;
    result.filePath = path.normalize(config.filePath);
  }

  if (config.keybind != null) {
    if (config.keybind !== null && !isValidKeybind(config.keybind)) return null;
    result.keybind = config.keybind;
  }

  if (config.midiBind != null) {
    if (typeof config.midiBind !== 'string' || config.midiBind.length > 50) return null;
    result.midiBind = config.midiBind;
  }

  if (config.midiAction != null) {
    if (!['trigger', 'volume', 'gain'].includes(config.midiAction)) return null;
    result.midiAction = config.midiAction;
  }

  if (config.customName != null) {
    if (typeof config.customName !== 'string' || config.customName.length > 100) return null;
    result.customName = config.customName;
  }

  if (config.gain != null) {
    const g = Number(config.gain);
    if (Number.isNaN(g) || g < 0 || g > 10) return null;
    result.gain = String(g);
  }

  return result;
}

function sanitizeAppSettings(settings: any): any | null {
  if (!settings || typeof settings !== 'object') return null;
  const result: any = {};

  if (settings.gridSize != null) {
    const gs = Number(settings.gridSize);
    if (!ALLOWED_GRID_SIZES.has(gs)) return null;
    result.gridSize = gs;
  }

  if (settings.theme != null) {
    if (!ALLOWED_THEMES.has(settings.theme)) return null;
    result.theme = settings.theme;
  }

  if (settings.accentColor != null) {
    if (typeof settings.accentColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(settings.accentColor)) {
      return null;
    }
    result.accentColor = settings.accentColor;
  }

  if (settings.audioDevice != null) {
    if (typeof settings.audioDevice !== 'string' || settings.audioDevice.length > 200) return null;
    result.audioDevice = settings.audioDevice;
  }

  if (settings.volume != null) {
    const vol = Number(settings.volume);
    if (Number.isNaN(vol) || vol < 0 || vol > 1) return null;
    result.volume = String(vol);
  }

  if (settings.stopAudioBind != null) {
    if (settings.stopAudioBind !== null && !isValidKeybind(settings.stopAudioBind)) return null;
    result.stopAudioBind = settings.stopAudioBind;
  }

  return result;
}

function loadSettings(): any {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    if (DEBUG) console.error('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(settings, null, 2));
  } catch (e) {
    if (DEBUG) console.error('Failed to save settings:', e);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      // webSecurity is kept false to allow file:// audio playback.
      // With contextIsolation + sandbox, the renderer has no Node access,
      // so the blast radius of disabling webSecurity is minimal.
      webSecurity: false,
    },
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  const settings = loadSettings();
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('load-initial-settings', settings);
  });
}

// Register a custom protocol for safe file serving (defense in depth)
app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const urlPath = decodeURIComponent(request.url.replace('app://', ''));
    if (!isValidFilePath(urlPath)) {
      callback({ error: -6 }); // net::ERR_FILE_NOT_FOUND
      return;
    }
    callback({ path: urlPath });
  });
});

ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Audio Files', extensions: Array.from(ALLOWED_AUDIO_EXTS) }]
  });
  if (canceled || filePaths.length === 0) return null;
  const chosen = filePaths[0];
  if (!chosen || !isValidFilePath(chosen)) return null;
  return chosen;
});

ipcMain.on('save-sound-config', (event, config) => {
  const sanitized = sanitizeSoundConfig(config);
  if (!sanitized) {
    if (DEBUG) console.warn('Rejected invalid sound config:', config);
    return;
  }

  const { index, filePath, keybind, midiBind, midiAction, customName, gain } = sanitized;
  soundConfigs.set(index, { filePath, keybind, midiBind, midiAction, customName, gain });

  const settings = loadSettings();
  if (!settings.sounds) {
    settings.sounds = {};
  }
  settings.sounds[index] = { filePath, keybind, midiBind, midiAction, customName, gain };
  saveSettings(settings);

  const fileName = customName || (filePath ? path.basename(filePath) : 'Sound');
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-button-ui', { index, name: fileName, bind: keybind, filePath, customName, midiBind, midiAction, gain });
  });
});

ipcMain.on('save-app-settings', (event, newSettings) => {
  const sanitized = sanitizeAppSettings(newSettings);
  if (!sanitized) {
    if (DEBUG) console.warn('Rejected invalid app settings:', newSettings);
    return;
  }
  const currentSettings = loadSettings();
  const merged = { ...currentSettings, ...sanitized };
  saveSettings(merged);
  stopAudioBind = sanitized.stopAudioBind || null;
});

ipcMain.on('clear-all-binds', (event) => {
  const settings = loadSettings();
  settings.sounds = {};
  saveSettings(settings);
  soundConfigs.clear();

  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('update-button-ui-reset-all');
  });
});

const MAIN_KEY_MAP: Record<number, string> = {
  11: '0', 2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6', 8: '7', 9: '8', 10: '9',
  82: '0', 79: '1', 80: '2', 81: '3', 75: '4', 76: '5', 77: '6', 71: '7', 72: '8', 73: '9',
  67007: '1', 61007: '1',
  29: 'Control', 3613: 'Control', 56: 'Alt', 3640: 'Alt', 42: 'Shift', 54: 'Shift', 3675: 'Command', 3676: 'Command',
  // F-Keys (uiohook keycodes)
  59: 'F1', 60: 'F2', 61: 'F3', 62: 'F4', 63: 'F5', 64: 'F6',
  65: 'F7', 66: 'F8', 67: 'F9', 68: 'F10', 87: 'F11', 88: 'F12'
};
const currentModifiers = new Set<string>();

function chordFromModifiers(keyName?: string, keycode?: number): string {
  const modifiers = Array.from(currentModifiers).sort();
  let chord = '';
  if (modifiers.includes('Control') && modifiers.includes('Command')) {
    chord = 'CommandOrControl';
  } else if (modifiers.includes('Control')) {
    chord = 'Control';
  } else if (modifiers.includes('Command')) {
    chord = 'Command';
  }
  if (modifiers.includes('Alt')) {
    chord += (chord ? '+' : '') + 'Alt';
  }
  if (modifiers.includes('Shift')) {
    chord += (chord ? '+' : '') + 'Shift';
  }
  if (keycode !== undefined && (keycode === 67007 || keycode === 61007)) {
    return 'Shift+1';
  }
  if (keyName) {
    chord += (chord ? '+' : '') + keyName;
  }
  return chord;
}

function setupKeyboardHook() {
  try {
    const hook = uIOhook as any;
    if (!hook || typeof hook.on !== 'function') {
        throw new Error('uIOhook object found, but .on() method is missing.');
    }

    hook.on('keydown', (e: any) => {
      if (DEBUG) console.log(`[Raw Keydown] Keycode: ${e.keycode}`);

      const keyName = MAIN_KEY_MAP[e.keycode];

      if (['Control', 'Alt', 'Shift', 'Command'].includes(keyName || '')) {
        currentModifiers.add(keyName!);
        if (stopAudioBind && chordFromModifiers() === stopAudioBind) {
          if (DEBUG) console.log(`[Keybind] STOP AUDIO triggered by modifier!`);
          BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('stop-all-sounds');
          });
        }
        return;
      }

      if (!keyName) return;

      const chord = chordFromModifiers(keyName, e.keycode);
      if (DEBUG) console.log(`[Keybind] Detected: ${chord}`);

      if (stopAudioBind && chord === stopAudioBind) {
        if (DEBUG) console.log(`[Keybind] STOP AUDIO triggered!`);
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('stop-all-sounds');
        });
        return;
      }

      soundConfigs.forEach((config, index) => {
        if (config.keybind === chord && config.filePath) {
          if (DEBUG) console.log(`[Keybind] Match found! Playing: ${config.filePath}`);
          BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('play-sound', config.filePath);
          });
        }
      });
    });

    hook.on('keyup', (e: any) => {
      const keyName = MAIN_KEY_MAP[e.keycode];
      if (keyName && ['Control', 'Alt', 'Shift', 'Command'].includes(keyName)) {
        currentModifiers.delete(keyName);
      }
    });

    hook.start();
    if (DEBUG) console.log('Low-level keyboard hook successfully started.');
  } catch (err) {
    console.error('uIOhook Critical Failure:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  setupKeyboardHook();

  // Auto-updater: only check and notify, do not auto-install unsigned updates
  autoUpdater.checkForUpdatesAndNotify().catch((err: any) => {
    if (DEBUG) console.error('Auto-updater check failed:', err);
  });

  // Manual update check from renderer
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdatesAndNotify();
      return { updateAvailable: !!result?.updateInfo, version: result?.updateInfo?.version || null };
    } catch (err) {
      if (DEBUG) console.error('Manual update check failed:', err);
      return { updateAvailable: false, version: null, error: String(err) };
    }
  });

  const settings = loadSettings();
  stopAudioBind = settings.stopAudioBind || null;
  Object.entries(settings.sounds || {}).forEach(([idx, config]: [string, any]) => {
    soundConfigs.set(parseInt(idx), config);
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
