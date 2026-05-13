# VoiceMeeter Setup Guide for LiveBoard

This guide walks you through routing LiveBoard's sounds through VoiceMeeter so your microphone and soundboard are mixed together into a single virtual microphone for Discord, Zoom, OBS, games, or any other app.

---

## Prerequisites

- [VoiceMeeter Banana](https://vb-audio.com/Voicemeeter/banana.htm) (recommended) or VoiceMeeter Potato
- A working microphone
- LiveBoard installed and running

> **Tip:** After installing VoiceMeeter, **restart your PC**. Windows audio routing will not work correctly until you do.

> **No audio interface with multiple channels?** If your sound card or motherboard audio only has one stereo output, you can still route the soundboard perfectly using **VB-Cable** (a free virtual audio cable from the same makers as VoiceMeeter). See the [VB-Cable Alternative](#vb-cable-alternative-no-multi-channel-interface) section at the end of this guide.

---

## Step 1: Configure VoiceMeeter Hardware Input

1. Open **VoiceMeeter Banana**.
2. Next to **Hardware Input 1**, click the device dropdown and select your physical microphone (e.g., `Microphone (Realtek(R) Audio)`).
3. Speak into your mic. You should see the green level meter for Hardware Input 1 move.

---

## Step 2: Set VoiceMeeter as Windows Default Playback Device

1. Right-click the **speaker icon** in your Windows taskbar and choose **Sound settings**.
2. Under **Output**, select **VoiceMeeter Input (VB-Audio VoiceMeeter VAIO)**.
3. This sends all Windows audio (including LiveBoard) into VoiceMeeter's Virtual Input.

---

## Step 3: Route Audio to Your Headphones

In VoiceMeeter, you need to hear the mixed output:

1. On the far right, under **Hardware Out**, click **A1** and select your headphones or speakers.
2. Now any audio playing on your PC (including LiveBoard) will go into VoiceMeeter and come out of your headphones.

---

## Step 4: Route LiveBoard to VoiceMeeter

1. Open **LiveBoard**.
2. Click the **Settings** button (gear icon).
3. Find **Audio Output Device**.
4. Select **VoiceMeeter Input (VB-Audio VoiceMeeter VAIO)** from the dropdown.
5. Click **Save Settings**.

> If you don't see the VoiceMeeter device, close and reopen LiveBoard after installing VoiceMeeter.

---

## Step 5: Mix Microphone + Soundboard into Virtual Output

This is the key step that lets apps hear both your voice and the soundboard.

1. In VoiceMeeter, find the **B1** button under **Hardware Input 1** (your mic).
2. Click **B1** so it lights up. This sends your mic to the virtual output.
3. Find the **B1** button under **Virtual Input VAIO** (where LiveBoard is playing).
4. Click **B1** so it lights up. This sends the soundboard to the same virtual output.

> **B1** = VoiceMeeter VAIO Virtual Output. Some apps may need **B2** instead (VoiceMeeter AUX Virtual Output). If B1 doesn't show up in your target app, try B2 on both inputs instead.

---

## Step 6: Set VoiceMeeter as Your Microphone in Discord / Zoom / OBS

1. Open the app you want to use (Discord, Zoom, OBS, etc.).
2. Go to its **Audio / Voice / Microphone** settings.
3. Set the microphone/input device to **VoiceMeeter Output (VB-Audio VoiceMeeter VAIO)**.
4. Your app will now receive both your microphone and your soundboard as one mixed audio stream.

---

## Step 7: Test

1. In LiveBoard, assign a sound to a button and click it.
2. You should hear it in your headphones.
3. If you're in a voice chat, ask someone if they heard the sound.
4. If you can't hear it, double-check that **A1** under Virtual Input VAIO is enabled in VoiceMeeter.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No sound from soundboard | Make sure LiveBoard's Audio Device is set to VoiceMeeter VAIO, and A1 is enabled on Virtual Input in VoiceMeeter. |
| Friends can't hear the soundboard | Make sure B1 is enabled on Virtual Input VAIO, and your chat app is using VoiceMeeter Output as its mic. |
| I can't hear anything | Make sure A1 under Hardware Out is set to your headphones/speakers. |
| VoiceMeeter device not showing in LiveBoard | Restart LiveBoard. If still missing, restart Windows. |
| Crackling or latency | In VoiceMeeter, go to **Menu > System Settings / Options** and increase the buffer size (e.g., from 512 to 1024). |

---

## Quick Diagram

```
[Microphone] ──> [VoiceMeeter Hardware Input 1] ──┐
                                                  ├──> [B1 Virtual Output] ──> [Discord / Zoom / OBS]
[LiveBoard]  ──> [VoiceMeeter Virtual Input VAIO] ─┘
                        │
                        └──> [Hardware Out A1] ──> [Your Headphones]
```

---

## VB-Cable Alternative (No Multi-Channel Interface)

If you don't have a dedicated audio interface with multiple outputs (like a Focusrite Scarlett with separate headphone channels), you can use **VB-Cable** to route the soundboard audio cleanly. This is also useful if VoiceMeeter feels like overkill for your setup.

### What is VB-Cable?

VB-Cable is a free virtual audio device that acts like a physical cable between programs. It creates a virtual speaker and virtual microphone pair. You send LiveBoard's audio into the virtual speaker, and any app can receive it from the virtual microphone.

Download it here: [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)

### How to set it up

1. **Install VB-Cable**
   - Download and run the installer.
   - Restart your PC after installation.

2. **Route LiveBoard into VB-Cable**
   - Open **LiveBoard > Settings**.
   - Under **Audio Output Device**, select **CABLE Input (VB-Audio Virtual Cable)**.
   - Click **Save Settings**.
   - Any sound you play in LiveBoard now goes into the virtual cable.

3. **Route VB-Cable into VoiceMeeter**
   - In **VoiceMeeter Banana**, set **Hardware Input 2** (or any free input) to **CABLE Output (VB-Audio Virtual Cable)**.
   - Now LiveBoard appears as a separate input strip in VoiceMeeter, just like your microphone.

4. **Mix and send to your apps**
   - Enable **B1** on both **Hardware Input 1** (your mic) and **Hardware Input 2** (the VB-Cable).
   - In Discord / Zoom / OBS, set the microphone to **VoiceMeeter Output (VB-Audio VoiceMeeter VAIO)**.
   - Both your voice and the soundboard are now mixed together.

5. **Hear it yourself**
   - Make sure **A1** is enabled on both Hardware Input 1 and Hardware Input 2 in VoiceMeeter.
   - This sends both sources to your headphones/speakers so you can hear everything.

### Why use this instead of just VoiceMeeter VAIO?

Using VB-Cable keeps LiveBoard on its own dedicated input strip in VoiceMeeter. This lets you:
- Adjust the soundboard volume independently from your mic.
- Apply different EQ or effects to the soundboard.
- Mute the soundboard without muting yourself.
- Avoid routing all of Windows audio through VoiceMeeter (which can be confusing).

### Quick Diagram (VB-Cable Setup)

```
[Microphone] ──> [VoiceMeeter Hardware Input 1] ──┐
                                                    ├──> [B1 Virtual Output] ──> [Discord / Zoom / OBS]
[LiveBoard]  ──> [VB-CABLE Input] ──> [VoiceMeeter Hardware Input 2] ──┘
                              │
                              └──> [Hardware Out A1] ──> [Your Headphones]
```

---

## macOS Alternative: BlackHole

VoiceMeeter and VB-Cable are Windows-only. On macOS, use **BlackHole** (free, open-source) to route audio between apps.

### Prerequisites

- [BlackHole](https://github.com/ExistentialAudio/BlackHole) (2ch version is enough)
- macOS 10.11 or later

### Setup

1. **Install BlackHole**
   - Download the `.pkg` installer from the BlackHole releases page.
   - Run the installer and approve the audio driver in **System Preferences > Security & Privacy** if prompted.
   - Restart your Mac.

2. **Create a Multi-Output Device**
   - Open **Audio MIDI Setup** (search Spotlight for it).
   - Click the **+** button at the bottom left and choose **Create Multi-Output Device**.
   - Check both your physical headphones/speakers **and** **BlackHole 2ch**.
   - Optionally rename it to "LiveBoard Mix".
   - Right-click the new device and select **Use This Device for Sound Output**.

3. **Route LiveBoard into BlackHole**
   - Open **LiveBoard > Settings**.
   - Under **Audio Output Device**, select **BlackHole 2ch**.
   - Click **Save Settings**.
   - Any sound you play in LiveBoard now goes into BlackHole.

4. **Route your mic into the same virtual cable**
   - In **Audio MIDI Setup**, create an **Aggregate Device**.
   - Check your physical microphone **and** **BlackHole 2ch**.
   - In Discord / Zoom / OBS, set the input/microphone to this Aggregate Device.
   - Now the app receives both your mic and the soundboard as one stream.

### Quick Diagram (BlackHole Setup)

```
[Microphone] ──┐
               ├──> [Aggregate Device] ──> [Discord / Zoom / OBS]
[LiveBoard]  ──┘
      │
      └──> [Multi-Output Device] ──> [Your Headphones]
```

### Paid Alternative

If you want a simpler GUI, **Loopback** by Rogue Amoeba is the macOS equivalent of VoiceMeeter.

---

## Optional: Noise Gate / EQ

VoiceMeeter Banana includes a noise gate and EQ on each input:
- Click the **Intellipan** button on Hardware Input 1 for quick EQ/noise reduction.
- Click the **Gate / Comp** button for a noise gate to cut background noise when you're not talking.
