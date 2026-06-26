/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
          obsidian: '#050505',
          graphite: '#121212',
          emerald: '#10B981',
          emerald_bright: '#00E676',
          emerald_dark: '#047857',
          amber: '#F59E0B',
          red_neon: '#EF4444',
          text_main: '#F9FAFB',
          text_muted: '#9CA3AF',
          border_dim: 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
          'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
