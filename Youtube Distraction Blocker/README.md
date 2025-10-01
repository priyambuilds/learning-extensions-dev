# Zen YouTube

A Chrome extension that helps you maintain focus while browsing YouTube by blocking distractions and providing a zen search interface.

## Features

- **Distraction Blocking**: Hide Shorts, home feed, end-screen suggestions, comments, and sidebar
- **Zen Search**: Clean, focused search interface that replaces the YouTube home page
- **Search-only Mode**: Focused search results without sidebar distractions
- **Keyboard Shortcuts**:
  - `Alt + Z`: Toggle Zen Mode globally
  - `Alt + Shift + S`: Toggle Search-only mode
- **Smart Page Detection**: Features adapt based on current YouTube page
- **Settings Sync**: Settings automatically sync across devices
- **Dark Mode Support**: Automatic system-based theming
- **Accessibility**: Reduced motion support and keyboard navigation

## Installation

### For Development

```bash
# Clone repository
git clone <repository-url>
cd zen-youtube

# Install dependencies
npm install

# Start development server
npm run dev
```

Load the extension in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` folder

### For Production

```bash
# Build and package
npm run build
npm run zip

# The extension zip will be in .output/chrome-mv3/
```

## Usage

### Quick Start
1. Click the extension icon in Chrome toolbar
2. Enable "Zen Mode" to activate all features
3. Use "Quick Actions" for instant control of specific features
4. Access full settings via the gear icon in popup

### Keyboard Shortcuts
- **Alt + Z**: Toggle global Zen Mode
- **Alt + Shift + S**: Toggle Search-only mode
- Toast notifications will confirm command execution

### Feature Break-Down

#### Hide Shorts
Removes YouTube Shorts shelves and recommendations from home/feed pages.

#### Hide Home Feed
Replaces the YouTube homepage with a clean search interface.

#### Hide End Cards
Removes suggested videos from the end of videos.

#### Hide Comments
Removes comment sections from watch and results pages.

#### Hide Sidebar
Removes the recommendation sidebar from video watch pages.

#### Search-only Mode
Keeps search results but removes sidebar distractions (results page only).

## Settings

Access full settings via the options page or gear icon in popup:

### General
- **Zen Mode**: Global enable/disable for all features
- **Reduce Motion**: Disable animations for accessibility

### Default Features
Features that apply to all relevant YouTube pages unless page-specific overrides are configured.

### Page-specific Overrides
Configure features per YouTube page type (coming in future version).

### Backup & Reset
- **Export Settings**: Download your configuration as JSON
- **Import Settings**: Restore from a JSON file
- **Reset to Defaults**: Clear all settings

## Development

### Tech Stack
- **Framework**: WXT (Web Extension Toolkit)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: Chrome Storage API with sync support
- **Build**: Vite

### Architecture

```
src/
├── entrypoints/
│   ├── content.tsx      # Main content script with feature modules
│   ├── popup/           # Extension popup UI
│   ├── options/         # Full settings page
│   └── background.ts    # Background script for command handling
├── lib/
│   ├── storage.ts       # Settings persistence with versioning
│   ├── yt-selectors.ts  # YouTube DOM selectors and guards
│   ├── toast.ts         # Notification system
│   └── utils.ts         # Utility functions
├── types/
│   └── settings.ts      # TypeScript interfaces
└── components/          # React components
```

### Content Script Architecture

The content script uses a modular architecture:

- **YouTubeDistractionController**: Main controller
- **Feature Modules**: Individual feature implementations (HideShorts, HideComments, etc.)
- **SPA Navigation**: Automatic feature re-application on YouTube navigation
- **Settings Synchronization**: Real-time settings updates

### Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:firefox      # Firefox development

# Quality
npm run compile          # TypeScript compilation check
npm run lint             # ESLint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting

# Testing
npm run test             # Run tests in watch mode
npm run test:ui          # Visual test UI
npm run test:run         # Run tests once

# Build
npm run build            # Production build
npm run build:firefox    # Firefox build
npm run zip              # Package extension
npm run ci               # Full CI pipeline
```

## Extension Permissions

- `storage`: Settings persistence and sync
- `scripting`: Content script injection
- `activeTab`: Currently active tab access for commands
- `host_permissions`: Restricted to `*.youtube.com`

## CSP Compliance

Strict MV3 CSP: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self';`
- No `unsafe-eval`
- No remote script sources
- All code bundled and verified

## Browser Support

- **Chrome/Edge**: Full support (MV3)
- **Firefox**: Compatible with WebExtensions API
- **Other Chromium browsers**: Should work with equivalent APIs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run the CI pipeline: `npm run ci`
5. Submit a pull request

## Troubleshooting

### Content Scripts Not Working
- Ensure you're on `youtube.com` domains
- Check browser console for errors
- Verify extension permissions are granted

### Settings Not Syncing
- Check Chrome sync is enabled for extensions
- Clear extension storage and reload
- Use `Import/Export` as backup

### Build Issues
- Run `npm install` to ensure all dependencies
- Clear `.output` folder if needed
- Check Node.js and npm versions

## Version History

### v1.0.0
- Initial production release
- Complete distraction blocking suite
- Zen search interface
- Keyboard shortcuts and toast feedback
- Settings synchronization
- Dark mode and accessibility support

## License

[License information]

---

Built with ❤️ using WXT, React, and TypeScript
