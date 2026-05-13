let currentGridSize = 4;
let selectedButtonIndex = null;
let isListeningForKey = false;
let isListeningForMidi = false;
let activeModifiers = new Set();
let currentSelectedFilePath = null;

// Audio Meter State
let audioCtx = null;
let analyser = null;

// Track all active audio elements so overlapping sounds can all be stopped
const activeAudios = new Set();

const gridContainer = document.getElementById('grid-container');
const settingsBtn = document.getElementById('settings-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const settingsModal = document.getElementById('settings-modal');
const editModal = document.getElementById('edit-modal');
const gridSizeSelect = document.getElementById('grid-size');
const saveSettingsBtn = document.getElementById('save-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const closeEditModalBtn = document.getElementById('close-modal');
const saveEditBtn = document.getElementById('save-btn');
const keyBindInput = document.getElementById('key-bind-input');
const midiBindInput = document.getElementById('midi-bind-input');
const midiActionSelect = document.getElementById('midi-action');
const audioDeviceSelect = document.getElementById('audio-device');
const stopAudioBindInput = document.getElementById('stop-audio-bind');
const selectSoundBtn = document.getElementById('select-sound-btn');
const selectedFileNameDisp = document.getElementById('selected-file-name');
const themePresetSelect = document.getElementById('theme-preset');
const customColorGroup = document.getElementById('custom-color-group');
const accentColorPicker = document.getElementById('accent-color-picker');
const soundNameInput = document.getElementById('sound-name');
const soundGainInput = document.getElementById('sound-gain');
const gainValueDisp = document.getElementById('gain-value');
const masterVolumeInput = document.getElementById('master-volume');
const audioMeter = document.getElementById('audio-meter');
const stopHotkeyDisplay = document.getElementById('stop-hotkey-display');
const stopHotkeyValue = document.getElementById('stop-hotkey-value');
const checkUpdatesBtn = document.getElementById('check-updates-btn');
const appVersionSpan = document.getElementById('app-version');

function updateStopHotkeyDisplay(bind) {
    if (!stopHotkeyDisplay || !stopHotkeyValue) return;
    if (bind) {
        stopHotkeyValue.innerText = bind;
        stopHotkeyDisplay.style.display = 'flex';
    } else {
        stopHotkeyDisplay.style.display = 'none';
    }
}

const themes = {
    void: { '--bg-color': '#121212', '--card-color': '#1e1e1e', '--accent-color': '#ffcc00', '--text-color': '#ffffff', '--border-color': '#333' },
    solar: { '--bg-color': '#f0f0f0', '--card-color': '#ffffff', '--accent-color': '#007acc', '--text-color': '#333333', '--border-color': '#ccc' },
    cyberpunk: { '--bg-color': '#0d0221', '--card-color': '#261447', '--accent-color': '#ff00ff', '--text-color': '#00ffff', '--border-color': '#ff00ff' },
    matrix: { '--bg-color': '#000000', '--card-color': '#0a0a0a', '--accent-color': '#00ff41', '--text-color': '#00ff41', '--border-color': '#003b00' },
    sunset: { '--bg-color': '#1a0a2e', '--card-color': '#2d1b4e', '--accent-color': '#ff6b35', '--text-color': '#ffe4e1', '--border-color': '#ff8c69' },
    ocean: { '--bg-color': '#001f3f', '--card-color': '#003366', '--accent-color': '#00bfff', '--text-color': '#e0f7fa', '--border-color': '#005f87' },
    midnight: { '--bg-color': '#0a0e27', '--card-color': '#141b41', '--accent-color': '#c0c0c0', '--text-color': '#e0e0e0', '--border-color': '#2a3f5f' },
    cherry: { '--bg-color': '#1a0505', '--card-color': '#2e0a0a', '--accent-color': '#ff4d6d', '--text-color': '#ffe0e6', '--border-color': '#8b1c3c' },
    retro: { '--bg-color': '#1a120b', '--card-color': '#2e2015', '--accent-color': '#ffb000', '--text-color': '#ffcc80', '--border-color': '#8b5a2b' },
    synthwave: { '--bg-color': '#120a21', '--card-color': '#1f1133', '--accent-color': '#f72585', '--text-color': '#4cc9f0', '--border-color': '#7209b7' },
    nord: { '--bg-color': '#2e3440', '--card-color': '#3b4252', '--accent-color': '#88c0d0', '--text-color': '#eceff4', '--border-color': '#4c566a' },
    dracula: { '--bg-color': '#282a36', '--card-color': '#44475a', '--accent-color': '#ff79c6', '--text-color': '#f8f8f2', '--border-color': '#6272a4' },
    'tokyo-night': { '--bg-color': '#1a1b26', '--card-color': '#24283b', '--accent-color': '#7aa2f7', '--text-color': '#a9b1d6', '--border-color': '#565f89' },
    gruvbox: { '--bg-color': '#282828', '--card-color': '#3c3836', '--accent-color': '#fabd2f', '--text-color': '#ebdbb2', '--border-color': '#504945' },
    forest: { '--bg-color': '#0d1f0d', '--card-color': '#1a331a', '--accent-color': '#7cb342', '--text-color': '#dcedc8', '--border-color': '#33691e' },
    pastel: { '--bg-color': '#fce4ec', '--card-color': '#f8bbd0', '--accent-color': '#f48fb1', '--text-color': '#4a148c', '--border-color': '#f06292' },
    monokai: { '--bg-color': '#272822', '--card-color': '#3e3d32', '--accent-color': '#f92672', '--text-color': '#f8f8f2', '--border-color': '#75715e' },
    terminal: { '--bg-color': '#0c0c0c', '--card-color': '#1a1a1a', '--accent-color': '#33ff00', '--text-color': '#00ff00', '--border-color': '#004400' },
    'high-contrast': { '--bg-color': '#000000', '--card-color': '#000000', '--accent-color': '#ffff00', '--text-color': '#ffffff', '--border-color': '#ffffff' },
    aurora: { '--bg-color': '#0f2027', '--card-color': '#1a2f3a', '--accent-color': '#64ffda', '--text-color': '#e0f2f1', '--border-color': '#2c5364' },
    lava: { '--bg-color': '#1a0a0a', '--card-color': '#2e1212', '--accent-color': '#ff5722', '--text-color': '#ffccbc', '--border-color': '#7a1e00' },
    'ocean-waves': { '--bg-color': '#001f3f', '--card-color': '#002a4d', '--accent-color': '#00e5ff', '--text-color': '#e0f7fa', '--border-color': '#004080' },
    'neon-pulse': { '--bg-color': '#0a0a0a', '--card-color': '#141414', '--accent-color': '#ff00ff', '--text-color': '#ffffff', '--border-color': '#ff00ff' },
    galaxy: { '--bg-color': '#0b001a', '--card-color': '#1a0b2e', '--accent-color': '#e040fb', '--text-color': '#f3e5f5', '--border-color': '#7b1fa2' }
};

const animatedThemes = new Set(['aurora', 'lava', 'ocean-waves', 'neon-pulse', 'galaxy']);

function applyTheme(themeName, customAccent = null) {
    const root = document.documentElement;
    const theme = themes[themeName] || themes.void;
    Object.keys(theme).forEach(prop => root.style.setProperty(prop, theme[prop]));
    if (customAccent) root.style.setProperty('--accent-color', customAccent);

    // Handle animated theme classes
    document.body.classList.remove('theme-aurora', 'theme-lava', 'theme-ocean-waves', 'theme-neon-pulse', 'theme-galaxy');
    if (animatedThemes.has(themeName)) {
        document.body.classList.add(`theme-${themeName}`);
    }
}

function createGrid(size) {
    if (!gridContainer) {
        console.error('createGrid: gridContainer is null. DOM not ready?');
        return;
    }
    const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 4;
    console.log('createGrid called with size:', safeSize);
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${safeSize}, 1fr)`;
    for (let i = 0; i < safeSize * safeSize; i++) {
        const btn = document.createElement('button');
        btn.className = 'sound-btn';
        btn.innerHTML = `<span class="btn-label">Empty</span><span class="btn-bind">No Bind</span>`;
        btn.onclick = () => {
            const filePath = btn.dataset.filepath;
            if (filePath) playSound(filePath); else openEditModal(i);
        };
        btn.oncontextmenu = (e) => {
            e.preventDefault();
            showContextMenu(e, i);
        };
        gridContainer.appendChild(btn);
    }
    console.log('createGrid finished. Buttons created:', gridContainer.childElementCount);
}

function showContextMenu(e, index) {
    const existingMenu = document.getElementById('context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = 'context-menu';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;

    const editItem = document.createElement('div');
    editItem.className = 'context-menu-item';
    editItem.innerText = 'Edit Sound';
    editItem.onclick = () => {
        openEditModal(index);
        menu.remove();
    };

    const clearItem = document.createElement('div');
    clearItem.className = 'context-menu-item';
    clearItem.innerText = 'Clear Bind';
    clearItem.onclick = () => {
        window.electronAPI.saveSoundConfig({
            index: index,
            keybind: null,
            midiBind: null
        });
        menu.remove();
    };

    menu.appendChild(editItem);
    menu.appendChild(clearItem);
    document.body.appendChild(menu);

    const closeMenu = () => menu.remove();
    document.addEventListener('click', closeMenu);
    menu.addEventListener('click', (ev) => ev.stopPropagation());
}

function openEditModal(index) {
    selectedButtonIndex = index;
    editModal.style.display = 'flex';
    keyBindInput.value = '';
    keyBindInput.classList.remove('listening');
    isListeningForKey = false;
    midiBindInput.value = '';
    midiBindInput.classList.remove('listening');
    isListeningForMidi = false;
    currentSelectedFilePath = null;
    selectedFileNameDisp.innerText = 'No file selected';

    const buttons = document.querySelectorAll('.sound-btn');
    const btn = buttons[index];
    if (btn) {
        soundNameInput.value = btn.dataset.customname || '';
        soundGainInput.value = btn.dataset.gain || '1';
        gainValueDisp.innerText = (parseFloat(btn.dataset.gain || '1')).toFixed(2) + 'x';
        keyBindInput.value = btn.dataset.bind || '';
        midiBindInput.value = btn.dataset.midibind || '';
        midiActionSelect.value = btn.dataset.midiaction || 'trigger';
        currentSelectedFilePath = btn.dataset.filepath || null;
        selectedFileNameDisp.innerText = currentSelectedFilePath ? currentSelectedFilePath.split(/[\\\\/]/).pop() : 'No file selected';
    } else {
        soundNameInput.value = '';
        soundGainInput.value = '1';
        gainValueDisp.innerText = '1.00x';
        keyBindInput.value = '';
        midiBindInput.value = '';
        midiActionSelect.value = 'trigger';
    }
}

if (keyBindInput) {
    keyBindInput.onclick = () => {
        isListeningForKey = true;
        keyBindInput.value = 'Press keys...';
        keyBindInput.classList.add('listening');
        activeModifiers.clear();
    };
}

if (selectSoundBtn) {
    selectSoundBtn.onclick = async () => {
        const filePath = await window.electronAPI.openFileDialog();
        if (filePath) {
            currentSelectedFilePath = filePath;
            if (selectedFileNameDisp) selectedFileNameDisp.innerText = filePath.split(/[\\\\/]/).pop();
        }
    };
}

if (stopAudioBindInput) {
    stopAudioBindInput.onclick = () => {
        isListeningForKey = true;
        stopAudioBindInput.value = 'Press keys...';
        stopAudioBindInput.classList.add('listening');
        activeModifiers.clear();
    };
}

window.onkeydown = (e) => {
    if (!isListeningForKey) return;

    if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
    }

    if (e.ctrlKey) activeModifiers.add('Control');
    if (e.altKey) activeModifiers.add('Alt');
    if (e.shiftKey) activeModifiers.add('Shift');
    if (e.metaKey) activeModifiers.add('Command');

    const isModifier = ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key);
    if (!isModifier) {
        let key = e.key;
        if (e.code && e.code.startsWith('Digit')) {
            key = e.code.replace('Digit', '');
        } else if (e.code && e.code.startsWith('Numpad')) {
            key = e.code.replace('Numpad', '');
        }
        window.lastPressedKey = key === ' ' ? 'Space' : key;
    }
};

window.onkeyup = (e) => {
    if (!isListeningForKey) return;
    if (window.lastPressedKey) {
        let accelerator = '';
        if (activeModifiers.has('Control') && activeModifiers.has('Command')) accelerator = 'CommandOrControl';
        else if (activeModifiers.has('Control')) accelerator = 'Control';
        else if (activeModifiers.has('Command')) accelerator = 'Command';
        if (activeModifiers.has('Alt')) accelerator += (accelerator ? '+' : '') + 'Alt';
        if (activeModifiers.has('Shift')) accelerator += (accelerator ? '+' : '') + 'Shift';
        accelerator += (accelerator ? '+' : '') + window.lastPressedKey;

        if (document.activeElement === keyBindInput) {
            keyBindInput.value = accelerator;
            keyBindInput.classList.remove('listening');
        } else if (document.activeElement === stopAudioBindInput) {
            stopAudioBindInput.value = accelerator;
            stopAudioBindInput.classList.remove('listening');
        } else {
            if (isListeningForKey) {
                if (stopAudioBindInput.classList.contains('listening')) {
                    stopAudioBindInput.value = accelerator;
                    stopAudioBindInput.classList.remove('listening');
                } else if (keyBindInput.classList.contains('listening')) {
                    keyBindInput.value = accelerator;
                    keyBindInput.classList.remove('listening');
                }
            }
        }

        isListeningForKey = false;
        window.lastPressedKey = null;
        activeModifiers.clear();
    }
};

if (clearAllBtn) {
    clearAllBtn.onclick = () => {
        if (confirm('Are you sure you want to clear all keybinds and MIDI mappings?')) {
            window.electronAPI.clearAllBinds();
        }
    };
}

if (settingsBtn) {
    settingsBtn.onclick = () => {
        settingsModal.style.display = 'flex';
        if (gridSizeSelect) gridSizeSelect.value = String(currentGridSize);

        // Defer device enumeration so it doesn't interfere with select interaction
        setTimeout(async () => {
            await populateAudioDevices();
        }, 50);
    };
}

if (themePresetSelect) {
    themePresetSelect.onchange = () => {
        if (customColorGroup) customColorGroup.style.display = themePresetSelect.value === 'custom' ? 'block' : 'none';
    };
}

if (saveSettingsBtn) {
    saveSettingsBtn.onclick = () => {
        currentGridSize = parseInt(gridSizeSelect ? gridSizeSelect.value : '4');
        const theme = themePresetSelect ? themePresetSelect.value : 'void';
        const customColor = accentColorPicker ? accentColorPicker.value : '#ffcc00';
        applyTheme(theme, theme === 'custom' ? customColor : null);

        const selectedDevice = audioDeviceSelect ? audioDeviceSelect.value : 'default';

        const stopBind = stopAudioBindInput ? (stopAudioBindInput.value || null) : null;
        window.electronAPI.saveAppSettings({
            gridSize: currentGridSize,
            theme: theme,
            accentColor: customColor,
            audioDevice: selectedDevice,
            volume: masterVolumeInput ? masterVolumeInput.value : '1',
            stopAudioBind: stopBind
        });
        updateStopHotkeyDisplay(stopBind);
        createGrid(currentGridSize);
        settingsModal.style.display = 'none';
    };
}

if (closeSettingsBtn) {
    closeSettingsBtn.onclick = () => { settingsModal.style.display = 'none'; };
}

if (checkUpdatesBtn) {
    checkUpdatesBtn.onclick = () => {
        checkUpdatesBtn.innerText = 'Checking...';
        checkUpdatesBtn.disabled = true;
        window.electronAPI.checkForUpdates().then((result) => {
            if (result.updateAvailable) {
                checkUpdatesBtn.innerText = 'Update Available!';
                checkUpdatesBtn.style.borderColor = 'var(--accent-color)';
                checkUpdatesBtn.style.color = 'var(--accent-color)';
            } else {
                checkUpdatesBtn.innerText = 'No Updates Found';
            }
        }).catch((err) => {
            console.error('Update check failed:', err);
            checkUpdatesBtn.innerText = 'Check Failed';
        }).finally(() => {
            setTimeout(() => {
                checkUpdatesBtn.innerText = 'Check for Updates';
                checkUpdatesBtn.disabled = false;
                checkUpdatesBtn.style.borderColor = '';
                checkUpdatesBtn.style.color = '';
            }, 3000);
        });
    };
}

if (closeEditModalBtn) {
    closeEditModalBtn.onclick = () => { editModal.style.display = 'none'; };
}

if (soundGainInput) {
    soundGainInput.oninput = () => {
        if (gainValueDisp) gainValueDisp.innerText = parseFloat(soundGainInput.value).toFixed(2) + 'x';
    };
}

if (saveEditBtn) {
    saveEditBtn.onclick = () => {
        const bind = keyBindInput ? keyBindInput.value : '';
        const midiBind = midiBindInput ? midiBindInput.value : '';
        const midiAction = midiActionSelect ? midiActionSelect.value : 'trigger';
        const name = soundNameInput ? soundNameInput.value : '';
        const gain = soundGainInput ? soundGainInput.value : '1';
        if (currentSelectedFilePath || bind || midiBind || name || gain !== '1') {
            window.electronAPI.saveSoundConfig({
                index: selectedButtonIndex,
                filePath: currentSelectedFilePath,
                keybind: bind || null,
                midiBind: midiBind || null,
                midiAction: midiAction || 'trigger',
                customName: name || null,
                gain: gain
            });
        }
        editModal.style.display = 'none';
    };
}

window.electronAPI.onUpdateButtonUI((data) => {
    const buttons = document.querySelectorAll('.sound-btn');
    const btn = buttons[data.index];
    if (btn) {
        btn.querySelector('.btn-label').innerText = data.customName || data.name || 'Sound';
        btn.querySelector('.btn-bind').innerText = data.bind || 'No Bind';
        btn.dataset.filepath = data.filePath || '';
        btn.dataset.customname = data.customName || '';
        btn.dataset.gain = data.gain || '1';
        btn.dataset.midibind = data.midiBind || '';
        btn.dataset.midiaction = data.midiAction || 'trigger';
        btn.classList.add('active');
    }
});

window.electronAPI.onResetAll(() => {
    const buttons = document.querySelectorAll('.sound-btn');
    buttons.forEach(btn => {
        btn.querySelector('.btn-label').innerText = 'Empty';
        btn.querySelector('.btn-bind').innerText = 'No Bind';
        btn.dataset.filepath = '';
        btn.dataset.customname = '';
        btn.dataset.gain = '1';
        btn.dataset.midibind = '';
        btn.dataset.midiaction = 'trigger';
        btn.classList.remove('active');
    });
});

async function populateAudioDevices() {
    try {
        const currentValue = audioDeviceSelect.value;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        audioDeviceSelect.innerHTML = '<option value="default">Default System Device</option>';
        audioOutputs.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Output ${device.deviceId.substring(0, 5)}...`;
            audioDeviceSelect.appendChild(option);
        });
        // Restore previous selection if it still exists in the new list
        if (Array.from(audioDeviceSelect.options).some(o => o.value === currentValue)) {
            audioDeviceSelect.value = currentValue;
        }
    } catch (err) { console.error('Error populating audio devices:', err); }
}

function updateMeter() {
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const average = sum / dataArray.length;
    const width = Math.min(100, (average / 128) * 100);

    audioMeter.style.width = width + '%';
    requestAnimationFrame(updateMeter);
}

function playSound(filePath) {
    if (!filePath) return;
    const safePath = 'app://' + encodeURIComponent(filePath);
    const selectedDevice = audioDeviceSelect.value;
    const useWebAudio = selectedDevice === 'default';

    // Get gain for this specific sound from the button dataset
    const buttons = document.querySelectorAll('.sound-btn');
    let soundGain = 1;
    for (let btn of buttons) {
        if (btn.dataset.filepath === filePath) {
            soundGain = parseFloat(btn.dataset.gain || '1');
            break;
        }
    }

    const masterVol = parseFloat(masterVolumeInput.value);

    if (useWebAudio) {
        // Web Audio path: meter visualization + gain boost via GainNode
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            updateMeter();
        }

        const audio = new Audio(safePath);
        audio.volume = masterVol;

        const sourceNode = audioCtx.createMediaElementSource(audio);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = soundGain;

        sourceNode.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioCtx.destination);

        audio.play().catch(e => console.error('Audio playback failed:', e));
        activeAudios.add(audio);
        audio.onended = () => activeAudios.delete(audio);
    } else {
        // Direct audio element path: setSinkId routes to specific device
        const audio = new Audio(safePath);
        audio.volume = Math.min(1, masterVol * soundGain);

        if (audio.setSinkId) {
            audio.setSinkId(selectedDevice).then(() => {
                audio.play().catch(e => console.error('Audio playback failed:', e));
            }).catch(e => {
                console.error('Failed to set audio sink:', e);
                audio.play().catch(e => console.error('Audio playback failed:', e));
            });
        } else {
            console.warn('setSinkId not supported; falling back to default output.');
            audio.play().catch(e => console.error('Audio playback failed:', e));
        }

        activeAudios.add(audio);
        audio.onended = () => activeAudios.delete(audio);
    }
}

window.electronAPI.onPlaySound((filePath) => { playSound(filePath); });

window.electronAPI.onStopAllSounds(() => {
    activeAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    activeAudios.clear();
});

window.electronAPI.onLoadInitialSettings(async (settings) => {
    try {
        console.log('onLoadInitialSettings received:', settings);
        currentGridSize = settings.gridSize || 4;
        themePresetSelect.value = settings.theme || 'void';
        accentColorPicker.value = settings.accentColor || '#ffcc00';
        if (settings.volume) masterVolumeInput.value = settings.volume;
        stopAudioBindInput.value = settings.stopAudioBind || '';
        updateStopHotkeyDisplay(settings.stopAudioBind || null);

        applyTheme(settings.theme, settings.theme === 'custom' ? settings.accentColor : null);
        createGrid(currentGridSize);

        // Populate audio devices before restoring saved selection so the option exists
        await populateAudioDevices();
        const savedDevice = settings.audioDevice || 'default';
        const deviceExists = Array.from(audioDeviceSelect.options).some(o => o.value === savedDevice);
        if (!deviceExists && savedDevice !== 'default') {
            // Device ID may have changed between sessions; inject saved ID so the dropdown retains it
            const fallbackOption = document.createElement('option');
            fallbackOption.value = savedDevice;
            fallbackOption.text = `Saved Device (${savedDevice.substring(0, 8)}...)`;
            audioDeviceSelect.appendChild(fallbackOption);
        }
        audioDeviceSelect.value = savedDevice;

        Object.entries(settings.sounds || {}).forEach(([idx, config]) => {
            window.electronAPI.saveSoundConfig({ index: parseInt(idx), ...config });
        });
    } catch (err) {
        console.error('Error in onLoadInitialSettings:', err);
    }
});

try {
    console.log('renderer.js executing initial setup...');
    applyTheme('void');
    createGrid(currentGridSize);
    console.log('Initial setup complete.');
} catch (err) {
    console.error('Fatal error during initial setup:', err);
}
