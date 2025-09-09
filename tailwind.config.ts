import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand colors
        background: {
          DEFAULT: '#fafafa',
          dark: '#0f172a',
          surface: '#ffffff',
          'surface-dark': '#1e293b',
        },
        text: {
          primary: '#0f172a',      // Main text color
          secondary: '#1e293b',    // Secondary text  
          muted: '#475569',        // Muted text
          inverse: '#ffffff',      // Text on dark backgrounds
        },
        // Football field green - Primary brand color
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',          // Main brand color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Gold accent - Secondary brand color
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',          // Gold accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Stadium/neutral colors
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Status colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Legacy aliases for backward compatibility
        field: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        stadium: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        'display': ['Oswald', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4)' },
        },
      },
      backgroundImage: {
        'field-gradient': 'linear-gradient(135deg, #1a7f37 0%, #22c55e 50%, #16a34a 100%)',
        'stadium-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'field-pattern': `
          linear-gradient(135deg, #1a7f37 0%, #22c55e 50%, #16a34a 100%),
          repeating-linear-gradient(0deg, transparent 0px, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 22px),
          repeating-linear-gradient(90deg, transparent 0px, transparent 60px, rgba(255, 255, 255, 0.1) 60px, rgba(255, 255, 255, 0.1) 62px)
        `,
      },
      boxShadow: {
        'stadium': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'stadium-glow': '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
        'football-hover': '0 20px 40px rgba(34, 197, 94, 0.2), 0 10px 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
