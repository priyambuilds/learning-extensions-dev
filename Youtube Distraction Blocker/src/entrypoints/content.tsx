import '../styles/globals.css';
import { createRoot } from 'react-dom/client';
import ZenSearch from '@/components/ZenSearch';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start', // earlier to prevent FOUC
  // world: 'MAIN', // optional; keep default unless you need page world
  main() {
    const MOUNT_ID = 'zen-search-root';
    const STYLE_ID = 'zen-youtube-styles';

    const onHome = () => location.pathname === '/';

    const unmount = () => {
      document.getElementById(MOUNT_ID)?.remove();
      document.getElementById(STYLE_ID)?.remove();
    };

    const inject = () => {
      // Always clean first
      unmount();

      if (!onHome()) return;

      // Hide YouTube UI
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        #page-manager, ytd-app { display: none !important; }
        body {
          background: hsl(var(--background)) !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        html { background: hsl(var(--background)) !important; }
      `;
      document.head.appendChild(style);

      // React container
      const container = document.createElement('div');
      container.id = MOUNT_ID;
      container.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
      `;
      document.body.appendChild(container);

      // Mount React
      const root = createRoot(container);
      root.render(<ZenSearch />);
    };

    // Initial inject
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject, { once: true });
    } else {
      inject();
    }

    // Handle SPA route changes (YouTube)
    let lastPath = location.pathname;
    const mo = new MutationObserver(() => {
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        inject();
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      mo.disconnect();
      unmount();
    });
  },
});
