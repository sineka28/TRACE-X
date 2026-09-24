/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0',
        },
        charcoal: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          subtle: '#64748B',
          border: '#E2E8F0',
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#4338CA',
        },
        status: {
          supported: {
            text: '#065F46',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            dot: '#10B981',
          },
          partially: {
            text: '#0D9488',
            bg: '#F0FDFA',
            border: '#99F6E4',
            dot: '#14B8A6',
          },
          uncertain: {
            text: '#92400E',
            bg: '#FFFBEB',
            border: '#FDE68A',
            dot: '#F59E0B',
          },
          conflict: {
            text: '#991B1B',
            bg: '#FEF2F2',
            border: '#FECACA',
            dot: '#EF4444',
          },
          unknown: {
            text: '#334155',
            bg: '#F8FAFC',
            border: '#CBD5E1',
            dot: '#64748B',
          },
          missing: {
            text: '#C2410C',
            bg: '#FFF7ED',
            border: '#FFEDD5',
            dot: '#F97316',
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
