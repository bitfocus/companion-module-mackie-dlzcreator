# Mackie DLZ Creator

Control module for the Mackie **DLZ Creator** and **DLZ Creator XS** digital mixers.

## Configuration

| Setting | Description |
|---------|-------------|
| **Target IP** | The IP address of your DLZ Creator. Enter the IP shown on the mixer's display under Settings → Network. |
| **Port** | The port number (default: `80`). Normally you should not change this. |
| **Console Model** | Select **Auto** to detect the model automatically, or choose **DLZ Creator** / **DLZ Creator XS** manually (should always be in auto). |

## Supported Models

| Model | Inputs | Players | Virtual | Aux Buses | FX Buses |
|-------|--------|---------|---------|-----------|----------|
| DLZ Creator | 4 | 3 | — | 4 | 2 |
| DLZ Creator XS | 2 | 2 | 2 | 2 | 2 |

## Available Actions

### Channel Controls
- **Set Fader Level** — Set the fader position for any channel (inputs, players, sample, virtual, aux, FX, master)
- **Adjust Fader Level** — Relative fader adjustment (step up/down in dB)
- **Set Mute** — Mute, unmute, or toggle mute for any channel
- **Set Solo** — Solo, unsolo, or toggle solo for any channel
- **Set Pan** — Set pan position (L100 to R100)
- **Set Channel Name** — Set the display name for a channel
- **Set Channel Color** — Set the channel strip color
- **Toggle Processing Bypass** — Bypass all channel processing

Note that when controlling the fader levels, remember that the levers are not motor controlled and that means if you touch the lever on the mixer it will reset to the lever position level and not to the software controlled setting.

### Input Channel Controls
- **Set Input Gain** — Set input gain (0–80 dB)
- **Toggle Phantom Power** — Enable/disable 48V phantom power
- **Toggle Auto-Mix** — Enable/disable auto-mix for an input channel

### Player / Virtual Channel Controls
- **Set Trim** — Set trim level (−20 to +40 dB)
- **Toggle Mix-Minus** — Enable/disable mix-minus

### EQ Controls
- **Set EQ Bypass** — Bypass the entire EQ section
- **Set EQ Band Frequency** — Set EQ band frequency (20–20,000 Hz)
- **Set EQ Band Gain** — Set EQ band gain (−15 to +15 dB)
- **Set EQ Band Q** — Set EQ band Q (0.1–15)
- **Set High-Pass Filter** — Enable/disable high-pass filter and set frequency

### Dynamics Controls
- **Set Compressor Bypass/Threshold/Gain/Ratio/Attack/Release**
- **Set Gate Bypass/Threshold/Depth**
- **Set De-esser Bypass/Threshold/Frequency**

### Aux / FX Sends
- **Set Aux Send Level** — Set aux send level for any source channel
- **Mute Aux Send** — Mute/unmute an aux send
- **Set FX Send Level** — Set FX send level for any source channel

### FX Bus Controls
- **Set FX Bypass** — Bypass an FX bus
- **Set Delay Time/Feedback** — Adjust delay parameters
- **Set Reverb Pre-delay/Time** — Adjust reverb parameters

### Recording
- **Start/Stop/Pause/Continue Recording**

### Media Player
- **Play / Previous / Next Track**

### Sample Pads
- **Trigger/Release Pad** — Trigger or release a sample pad (banks 0–7, pads 0–5)
- **Select Bank** — Switch the active sample bank
- **Toggle Alt Mode** — Toggle Auto-Mix / Alt mode

### Snapshots & System
- **Save/Load Snapshot** — Save or load a named snapshot
- **Load Default Snapshot** — Reset to default snapshot
- **Factory Reset** — Full factory reset
- **Bluetooth Pair/Disconnect**

## Available Feedbacks

- **Mute State** — Highlight when a channel is muted
- **Solo State** — Highlight when a channel is soloed
- **Phantom Power** — Highlight when phantom power is active
- **EQ/Compressor/Gate/De-esser Bypass** — Show bypass state
- **FX Bypass** — Show FX bus bypass state
- **Recording State** — Highlight based on recording status
- **Player State** — Show media player status
- **Pad Active** — Highlight when a sample pad is playing
- **Channel Color** — Match button background to channel color
- **Auto-Mix State** — Show auto-mix enabled state

## Available Variables

Per-channel variables are created dynamically based on the detected model:

- `$(dlzcreator:ch_XX_name)` — Channel name
- `$(dlzcreator:ch_XX_fader_db)` — Fader level in dB
- `$(dlzcreator:ch_XX_mute)` — Mute state
- `$(dlzcreator:ch_XX_pan)` — Pan position
- `$(dlzcreator:input_X_gain_db)` — Input gain in dB
- `$(dlzcreator:rec_state)` — Recording state
- `$(dlzcreator:rec_time)` — Recording time
- `$(dlzcreator:player_name)` — Current track name
- `$(dlzcreator:firmware_version)` — Firmware version
- `$(dlzcreator:model)` — Detected model name
- `$(dlzcreator:current_bank)` — Active sample bank
