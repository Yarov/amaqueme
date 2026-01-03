/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#10b981",
        "primary-dark": "#059669",
        "background-light": "#ffffff",
        "background-dark": "#101622",
        "surface-dark": "#192233",
        "surface-light": "#f8fafc",
        "text-main": "#0f172a",
        "text-muted": "#64748b"
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Work Sans", "sans-serif"]
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        'up': '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
