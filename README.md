# companion-module-mackie-dlzcreator

Companion module for the [Mackie DLZ Creator](https://mackie.com/dlz-creator) and DLZ Creator XS digital mixers.

[![Build Status](https://img.shields.io/github/actions/workflow/status/bitfocus/companion-module-mackie-dlzcreator/build.yml?branch=main)](https://github.com/bitfocus/companion-module-mackie-dlzcreator/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Full channel control (faders, mute, solo, pan, name, color) for all channel types
- Input gain, phantom power, and auto-mix control
- Complete EQ, compressor, gate, and de-esser control
- Aux and FX send management
- FX bus control (delay, reverb)
- Recording and media player control
- Sample pad triggering and bank selection
- Snapshot management (save/load/reset)
- Bluetooth pairing control
- Real-time feedback for mute, solo, bypass, recording, and pad states
- Dynamic variables for channel names, fader levels, gain, and system status
- Pre-built button presets for common operations
- Supports both DLZ Creator (4-input) and DLZ Creator XS (2-input) models
- Auto-detection of console model

## Requirements

- Mackie DLZ Creator or DLZ Creator XS running firmware with web UI
- Network connectivity between Companion and the mixer (same subnet)
- [Bitfocus Companion](https://bitfocus.io/companion) v3.x or later

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Watch mode
yarn dev

# Lint
yarn lint

# Format
yarn format

# Package for distribution
yarn package
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE) for details.

## Maintainers

- **Daniel Sörlöv** ([@dsorlov](https://github.com/dsorlov))
