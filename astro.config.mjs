import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone', // Importante para que funcione como servidor independiente
  }),
  // Las configuraciones de imagen van en la raíz de defineConfig
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    domains: [], // Agrega dominios externos si los usas
  },
  integrations: [tailwind()],
});