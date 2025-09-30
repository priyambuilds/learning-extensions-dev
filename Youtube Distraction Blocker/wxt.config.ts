import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  
  modules: ['@wxt-dev/module-react'],

  // Extensionpp will force-reload on manifest changes
  runner: {
    disabled: false,
  },

  manifest: ({ browser, manifestVersion, mode }) => {
    const isDev = mode === 'development';
    
    return {
      name: 'Zen Youtube',
      description: 'Minimal YouTube search experience - works on Chrome & Firefox',
      version: '1.0.0',
      
      // Permissions - WXT auto-adapts for MV2/MV3
      permissions: ['activeTab', 'storage', 'scripting'],
      host_permissions: ['*://*.youtube.com/*'],

      // Extension popup
      action: {
        default_title: 'Zen Youtube Settings',
        default_popup: 'popup.html',
      },

      // Content Security Policy (MV3 only, auto-ignored in MV2)
      ...(manifestVersion === 3 && {
        content_security_policy: {
          extension_pages: isDev 
            ? "script-src 'self' 'unsafe-eval'; object-src 'self'"  // Dev: allow eval for HMR
            : "script-src 'self'; object-src 'self'",               // Prod: strict
        },
      }),

      // Firefox-specific metadata
      ...(browser === 'firefox' && {
        browser_specific_settings: {
          gecko: {
            id: 'zen-youtube@example.com',
            strict_min_version: '109.0',  // Firefox 109+ for MV3
          },
        },
      }),

      // Icons (add later)
      icons: {
        16: 'icon/16.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },
    };
  },

  // Vite configuration
  vite: () => ({
    css: {
      postcss: './postcss.config.js',
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
    },
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    },
  }),

  // ❌ REMOVED: filterEntrypoints
  // WXT auto-discovers all entrypoints in src/entrypoints/
  // Don't manually filter unless you have 10+ entrypoints
});
