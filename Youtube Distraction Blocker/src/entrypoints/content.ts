import '../styles/globals.css';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  cssInjectionMode : 'ui',
  runAt: "document_end",

  main() {
  
    
  },
});
