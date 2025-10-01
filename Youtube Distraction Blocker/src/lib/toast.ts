// src/lib/toast.ts - Shadow-root injected toast notifications

interface ToastConfig {
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const TOAST_ID = 'zen-youtube-toast';
const STYLE_ID = 'zen-youtube-toast-styles';

const toastStyles = `
.${TOAST_ID}-container {
  position: fixed;
  z-index: 2147483647; /* Max z-index */
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
}

.${TOAST_ID} {
  background: hsl(0 0% 100% / 0.95);
  backdrop-filter: blur(80px);
  -webkit-backdrop-filter: blur(80px);
  border: 1px solid hsl(0 0% 90%);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(0 0% 15%);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-width: 300px;
  word-wrap: break-word;
}

.${TOAST_ID}.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .${TOAST_ID} {
    background: hsl(0 0% 15% / 0.95);
    border-color: hsl(0 0% 20%);
    color: hsl(0 0% 90%);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .${TOAST_ID} {
    transition: none;
  }
  .${TOAST_ID}.show {
    transform: none;
  }
}

/* Positioning */
.${TOAST_ID}-top-right { top: 20px; right: 20px; }
.${TOAST_ID}-top-left { top: 20px; left: 20px; }
.${TOAST_ID}-bottom-right { bottom: 20px; right: 20px; }
.${TOAST_ID}-bottom-left { bottom: 20px; left: 20px; }
`;

class ToastManager {
  private shadowRoot: ShadowRoot | null = null;
  private container: HTMLDivElement | null = null;
  private cleanupTimer: number | null = null;

  constructor() {
    this.createShadowRoot();
  }

  private createShadowRoot() {
    // Check if we already have a shadow root
    let container = document.getElementById(TOAST_ID + '-container') as HTMLDivElement;
    if (!container) {
      container = document.createElement('div');
      container.id = TOAST_ID + '-container';
      container.className = TOAST_ID + '-container';
      document.body.appendChild(container);
    }

    if (!container.shadowRoot) {
      this.shadowRoot = container.attachShadow({ mode: 'open' });

      // Add styles
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = toastStyles;
      this.shadowRoot.appendChild(style);

      // Create container
      this.container = document.createElement('div');
      this.shadowRoot.appendChild(this.container);
    } else {
      this.shadowRoot = container.shadowRoot;
      this.container = this.shadowRoot.querySelector('div') as HTMLDivElement;
    }
  }

  public show(config: ToastConfig) {
    if (!this.shadowRoot || !this.container) {
      this.createShadowRoot();
      if (!this.shadowRoot || !this.container) return;
    }

    // Clear any existing timer
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = TOAST_ID;
    toast.classList.add(`${TOAST_ID}-${config.position || 'top-right'}`);
    toast.textContent = config.message;

    // Add to container
    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-hide
    this.cleanupTimer = window.setTimeout(() => {
      this.hide(toast);
    }, config.duration || 3000);
  }

  private hide(toast: HTMLElement) {
    if (!toast) return;

    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300); // Match transition duration
  }
}

// Singleton instance
let toastManager: ToastManager | null = null;

export function showToast(config: ToastConfig) {
  if (!toastManager) {
    toastManager = new ToastManager();
  }
  toastManager.show(config);
}

// Command feedback helper
export function showCommandFeedback(type: string, enabled: boolean) {
  const messages = {
    'zen-mode': enabled ? '✅ Zen Mode Enabled' : '❌ Zen Mode Disabled',
    'search-only': enabled ? '🔍 Search-only Mode Enabled' : '🔍 Search-only Mode Disabled',
  };

  const message = messages[type as keyof typeof messages] || 'Command executed';
  showToast({ message, duration: 2000 });
}
