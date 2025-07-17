import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://amaqueme.mx/',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
});