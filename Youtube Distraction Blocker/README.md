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

## Technical Architecture

### Tech Stack
- **Framework**: WXT 0.x (Web Extension Toolkit)
- **UI Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with design tokens
- **Storage**: Chrome Storage API with schema versioning and migrations
- **Build**: Vite with MV3 Manifest V3 support
- **Testing**: Vitest + JSDOM

### Core Architecture

```
src/
├── entrypoints/
│   ├── content.tsx      # Main content script with YouTubeDistractionController
│   ├── popup/App.tsx    # Compact popup with feature toggles
│   ├── options/App.tsx  # Full settings page with import/export
│   └── background.ts    # Command handling (Alt+Z, Alt+Shift+S)
├── lib/
│   ├── storage.ts       # Sync storage with schema versioning & migrations
│   ├── yt-selectors.ts  # Robust YouTube DOM selectors with guards
│   ├── toast.ts         # Shadow-root toast notifications
│   └── utils.ts         # Utility functions (cls, feature guards)
├── components/
│   ├── ZenSearch.tsx    # Full-screen search replacement
│   ├── ToggleSwitch.tsx # Accessible feature toggles
│   ├── settingsPanel.tsx # Grouped settings controls
│   └── ui/              # Reusable UI components
├── types/
│   └── settings.ts      # TypeScript interfaces and defaults
├── hooks/
│   ├── useSettings.ts   # Settings state management
│   └── useYouTubeState.ts # YouTube page state
└── styles/
    └── globals.css      # Tailwind v4 imports and design tokens
```

### Content Script Design

The content script implements a resilient `YouTubeDistractionController` with:

- **Modular Feature System**: Each distraction (Shorts, comments, etc.) is a `FeatureModule` with retry logic and DOM observation
- **SPA Navigation Handling**: Listens for YouTube's custom navigation events and URL changes
- **DOM Ready Protection**: Waits for page load before applying features
- **Settings Synchronization**: Real-time updates via Chrome Storage API
- **Error Resilience**: Try/catch with fallbacks and retry mechanisms

### Key Design Decisions

- **MV3 CSP Compliance**: Strict `script-src 'self' 'wasm-unsafe-eval'; object-src 'self';` - no `unsafe-eval`
- **Feature Guards**: All DOM operations protected by existence checks to prevent console errors
- **Storage Layer**: Schema versioning with automatic migrations and sync/local fallbacks
- **React Integration**: Shadow-root toasts and full-screen Zen search component
- **Accessibility**: WCAG AA compliance with keyboard navigation and reduced motion support

### Build & Quality Assurance

```bash
# Development
npm run dev              # HMR development with auto-reload
npm run dev:firefox      # Firefox-specific development

# Code Quality & Testing
npm run compile          # TypeScript compilation check
npm run lint             # ESLint with React and extension rules
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier code formatting

# Testing Pipeline
npm run test             # Vitest in watch mode
npm run test:ui          # Visual test runner
npm run test:run         # Single test run (CI/CD)

# Production Build
npm run build            # MV3 production build
npm run build:firefox    # Firefox MV2 build
npm run zip              # Package extension for submission

# CI/CD Pipeline
npm run ci               # Full quality gate: typecheck + lint + test + build
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

## Testing & Quality Assurance

The project includes comprehensive test coverage:

```bash
# Run all tests
npm run test:run

# Run tests in watch mode during development
npm run test

# Visual test runner
npm run test:ui
```

**Test Coverage:**
- **Storage Layer**: Schema versioning, migrations, sync/local fallbacks
- **YouTube Selectors**: Page detection, feature availability, DOM guards
- **Utility Functions**: Class name merging, type safety

**Code Quality:**
- TypeScript strict mode with comprehensive type definitions
- ESLint with React and MV3 extension rules
- Prettier code formatting
- MV3 CSP compliance (no `unsafe-eval`, no external script sources)

## Version History

### v1.0.0 (Current)
- ✅ Production-ready MV3 extension with WXT framework
- ✅ Complete distraction blocking system (Shorts, Home feed, Comments, Sidebar, End-screens)
- ✅ Zen search interface with clean minimal design
- ✅ Keyboard shortcuts (Alt+Z global toggle, Alt+Shift+S search-only mode)
- ✅ Toast notifications with shadow-root UI for command feedback
- ✅ Settings synchronization with Chrome Storage API and sync fallbacks
- ✅ Per-path feature overrides (watch, results, feed pages)
- ✅ Settings import/export with JSON backup/restore
- ✅ Dark/light mode support with system preference detection
- ✅ WCAG AA accessibility compliance, reduced motion support
- ✅ Robust SPA navigation handling with MutationObservers
- ✅ Feature guards and retry logic for DOM resilience
- ✅ Schema versioning and automatic migrations

**Bundle Size**: ~569 KB total (219 KB content script, 6+ MB options/popup UI)
**Browser Support**: Chrome 88+, Edge 88+, Firefox 109+ (WebExtensions API)

## License

[License information]

---

Built with ❤️ using WXT, React, and TypeScript
