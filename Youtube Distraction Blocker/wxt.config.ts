import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  srcDir: 'src',

  modules: ['@wxt-dev/module-react'],

  alias: {
    '@': resolve('src'),
  },

  manifest: ({ browser, manifestVersion }) => {
    return {
      name: 'Zen YouTube',
      description: 'Minimal YouTube search experience',
      version: '1.0.0',

      permissions: ['storage', 'scripting', 'activeTab'],
      host_permissions: ['*://*.youtube.com/*'],

      action: {
        default_title: 'Zen YouTube',
        default_popup: 'popup.html',
      },

      options_ui: {
        page: 'options.html',
        open_in_tab: true,
      },

      icons: {
        16: 'icon/16.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },

      // Strict MV3 CSP: do NOT add 'unsafe-eval' or any extra script sources.
      ...(manifestVersion === 3 && {
        content_security_policy: {
          extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
        },
      }),

      commands: {
        'toggle-zen': {
          suggested_key: { default: 'Alt+Z' },
          description: 'Toggle Zen Mode',
        },
        'toggle-search-only': {
          suggested_key: { default: 'Alt+Shift+S' },
          description: 'Toggle Search-only Mode',
        },
      },

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

  vite: () => ({
    css: { postcss: './postcss.config.js' },
    build: { target: 'esnext', minify: 'esbuild' },
  }),
});
