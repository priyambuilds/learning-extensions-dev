/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Apple-inspired color system
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Apple System Colors
        apple: {
          blue: '#007AFF',
          gray: {
            50: '#F5F5F7',
            100: '#E8E8ED',
            200: '#D2D2D7',
            300: '#B0B0B5',
            400: '#86868B',
            500: '#6E6E73',
            600: '#515154',
            700: '#3A3A3C',
            800: '#2C2C2E',
            900: '#1C1C1E',
          },
        },
      },
      // Apple typography
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', 'monospace'],
      },
      // Apple spacing scale (8pt grid)
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      // Apple-style border radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        apple: '18px', // macOS window corners
      },
      // Smooth, Apple-like animations
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      // Apple-style backdrop blur
      backdropBlur: {
        apple: '80px',
      },
      // Apple-style shadows
      boxShadow: {
        apple: '0 4px 20px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 20px 60px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
  ],
};
