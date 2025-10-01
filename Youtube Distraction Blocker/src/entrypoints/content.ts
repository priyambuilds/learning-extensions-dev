import '../styles/globals.css';
import { createRoot } from 'react-dom/client';
import ZenSearch from '@/components/ZenSearch';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  cssInjectionMode : 'ui',
  runAt: "document_end",

  main() {
    // Only run on Youtube message
    if (window.location.pathname !== '/') return;
      const init = () => {
        // Remove existing overlay if it exists
        const existingOverlay = document.getElementById('zen-search-root')
        if (existingOverlay) {
          existingOverlay.remove()
        }

        // Hide Youtube's default UI
        const style = document.getElementById('style')
        style.id = 'zen-youtube-styles';
        style.textContent = `
          #page-manager,
          ytd-app {
            display: none !important;
          }
          body {
            background: hsl(var(--background)) !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          html {
            background: hsl(var(--background)) !important;
          }
        `;
        document.head.appendChild(style);
        
        // Create React container
        const container = document.createElement('div');
        container.id = 'zen-search-root';
        container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999999;
        `;
        document.body.appendChild(container);

        // Render ZenSearch
        const root = createRoot(container);
        root.render(<ZenSearch />);
      }

      // Initialize when DOM is ready
      if (document.readyState === 'loading')  {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init()
      }
    }
  },
);
