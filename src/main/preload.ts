import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Renderer -> Main
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    saveSoundConfig: (config: any) => ipcRenderer.send('save-sound-config', config),
    saveAppSettings: (settings: any) => ipcRenderer.send('save-app-settings', settings),
    clearAllBinds: () => ipcRenderer.send('clear-all-binds'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    // Main -> Renderer
    onUpdateButtonUI: (callback: (data: any) => void) => {
        const handler = (_event: any, data: any) => callback(data);
        ipcRenderer.on('update-button-ui', handler);
        return () => ipcRenderer.removeListener('update-button-ui', handler);
    },
    onResetAll: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('update-button-ui-reset-all', handler);
        return () => ipcRenderer.removeListener('update-button-ui-reset-all', handler);
    },
    onPlaySound: (callback: (filePath: string) => void) => {
        const handler = (_event: any, filePath: string) => callback(filePath);
        ipcRenderer.on('play-sound', handler);
        return () => ipcRenderer.removeListener('play-sound', handler);
    },
    onStopAllSounds: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on('stop-all-sounds', handler);
        return () => ipcRenderer.removeListener('stop-all-sounds', handler);
    },
    onLoadInitialSettings: (callback: (settings: any) => void) => {
        const handler = (_event: any, settings: any) => callback(settings);
        ipcRenderer.on('load-initial-settings', handler);
        return () => ipcRenderer.removeListener('load-initial-settings', handler);
    },
});
