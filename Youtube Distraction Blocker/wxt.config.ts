import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  // Source root
  srcDir: 'src',

  // Framework integration (React/Vite wiring)
  modules: ['@wxt-dev/module-react'],

  // Use bundler + TS-aware aliases the WXT way
  alias: {
    '@': resolve('src'),
  },

  // Generate manifest dynamically (gives access to browser, mode, MV)
  manifest: ({ browser, manifestVersion, mode }) => {
    const isDev = mode === 'development';

    return {
      name: 'Zen YouTube',
      description: 'Minimal YouTube search experience',
      version: '1.0.0',

      // Permissions
      permissions: ['storage', 'scripting', 'activeTab'],
      host_permissions: ['*://*.youtube.com/*'],

      // Toolbar popup
      action: {
        default_title: 'Zen YouTube',
        default_popup: 'popup.html',
      },

      // Options page
      options_ui: {
        page: 'options.html',
        open_in_tab: true,
      },

      // Icons (ensure files exist or remove this block)
      icons: {
        16: 'icon/16.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },

      // MV3 CSP (WXT will drop this for MV2 targets automatically)
      ...(manifestVersion === 3 && {
        content_security_policy: {
          // Dev: enable eval-like tooling for HMR as needed; tighten in prod
          extension_pages: isDev
            ? "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules'; object-src 'self'"
            : "script-src 'self'; object-src 'self'",
        },
      }),
      commands: {
        'toggle-zen': {
          suggested_key: { default: 'Alt+Z' },
          description: 'Toggle Zen Mode',
        },
      },

      // Firefox-specific metadata
      ...(browser === 'firefox' && {
        browser_specific_settings: {
          gecko: {
            id: 'zen-youtube@example.com',
            strict_min_version: '109.0',
          },
        },
      }),
    };
  },

  // Vite build config
  vite: () => ({
    css: { postcss: './postcss.config.js' },
    build: { target: 'esnext', minify: 'esbuild' },
  }),
});
