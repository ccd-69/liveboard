const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Renderer -> Main
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    saveSoundConfig: (config) => ipcRenderer.send('save-sound-config', config),
    saveAppSettings: (settings) => ipcRenderer.send('save-app-settings', settings),
    clearAllBinds: () => ipcRenderer.send('clear-all-binds'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    // Main -> Renderer
    onUpdateButtonUI: (callback) => {
        const handler = (_event, data) => callback(data);
        ipcRenderer.on('update-button-ui', handler);
        return () => ipcRenderer.removeListener('update-button-ui', handler);
    },
    onResetAll: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('update-button-ui-reset-all', handler);
        return () => ipcRenderer.removeListener('update-button-ui-reset-all', handler);
    },
    onPlaySound: (callback) => {
        const handler = (_event, filePath) => callback(filePath);
        ipcRenderer.on('play-sound', handler);
        return () => ipcRenderer.removeListener('play-sound', handler);
    },
    onStopAllSounds: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('stop-all-sounds', handler);
        return () => ipcRenderer.removeListener('stop-all-sounds', handler);
    },
    onLoadInitialSettings: (callback) => {
        const handler = (_event, settings) => callback(settings);
        ipcRenderer.on('load-initial-settings', handler);
        return () => ipcRenderer.removeListener('load-initial-settings', handler);
    },
});
