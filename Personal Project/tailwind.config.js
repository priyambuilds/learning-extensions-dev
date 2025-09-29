/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './entrypoints/**/*.{js,ts,jsx,tsx}',
    './.wxt/**/*.{js,ts,jsx,tsx}',
    './assets/**/*.{js,ts,jsx,tsx}',
    './index.html',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for your project
        primary: {},
        gray: {},
      },
      fontFamily: {},
      spacing: {},
      animation: {},
      keyframes: {
        fadeIn: {},
        slideIn: {},
        bounceSoft: {},
      },
      boxShadow: {},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  // WXT specific configuration for browser extensions
  prefix: '', // Add prefix if you need style isolation
  corePlugins: {
    preflight: true, // Set to false if you want to disable base styles
  },
};
