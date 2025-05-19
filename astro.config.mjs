import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://amaqueme.mx',
  integrations: [tailwind()],
  output: 'server' // Cambiar a servidor para rutas dinámicas
});