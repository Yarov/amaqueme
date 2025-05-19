/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Activar dark mode basado en clase
  theme: {
    extend: {
      colors: {
        primary: '#0aa43e',
        'primary-dark': '#098832',
      },
    },
  },
  plugins: [],
}