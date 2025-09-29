import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // Enable src directory structure
  srcDir: 'src',

  // Auto-detect browser (no hardcoded browser)
  // WXT automatically uses MV3 for Chrome, MV2 for Firefox
  modules: ['@wxt-dev/module-react'],

  // Dynamic manifest based on target browser
  manifest: ({ browser, manifestVersion }) => {
    const baseManifest = {
      name: 'My Cross-Browser Extension',
      description: 'Works seamlessly on Chrome and Firefox',
      version: '1.0.0',

      // Universal permissions (work on both browsers)
      ...(manifestVersion === 2
        ? {
            // MV2: permissions array includes host permissions
            permissions: ['activeTab', 'storage', 'scripting', 'tabs', 'https://*/*', 'http://*/*'],
          }
        : {
            // MV3: separate host_permissions array
            permissions: ['activeTab', 'storage', 'scripting'],
            host_permissions: ['https://*/*', 'http://*/*'],
          }),

      // Action configuration (auto-converts to browser_action for MV2)
      action: {
        default_title: 'My Extension',
        default_popup: 'popup.html',
      },

      // Content Security Policy
      ...(manifestVersion === 3 && {
        content_security_policy: {
          extension_pages: "script-src 'self'; object-src 'self'",
        },
      }),

      // Browser-specific configurations
      ...(browser === 'firefox' && {
        // Firefox-specific manifest additions
        browser_specific_settings: {
          gecko: {
            id: 'my-extension@example.com',
            strict_min_version: '109.0',
          },
        },
      }),
    };

    return baseManifest;
  },

  // Vite configuration for CSS processing
  vite: () => ({
    css: {
      postcss: './postcss.config.js',
    },
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      __BROWSER__: JSON.stringify(process.env.BROWSER ?? 'chrome'),
    },
  }),

  // Specify entrypoints to include (only popup and background)
  filterEntrypoints: ['popup', 'background'],
});
