/** @type {import('tailwindcss').Config} */
// Brand tokens are the source of truth for the SnapChef design system
// (see mobile/assets/images/design-system.png). Keep this palette in sync
// with the `Brand` export in `src/constants/theme.ts`.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B1220',
          secondary: '#111827',
        },
        surface: {
          elevated: '#1F2937',
          card: '#1E293B',
        },
        brand: {
          green: '#22C55E',
          leaf: '#16A34A',
          dark: '#0F172A',
        },
        accent: {
          blue: '#3B82F6',
          amber: '#F59E0B',
          coral: '#FB7185',
          purple: '#B85CF6',
        },
        gray: {
          900: '#0B1220',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
        },
      },
      fontFamily: {
        'poppins-light': ['Poppins_300Light'],
        'poppins-regular': ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
      },
    },
  },
  plugins: [],
};
