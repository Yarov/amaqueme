import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    analytics: true,
    devImageService: 'sharp',
    imagesConfig: {
      sizes: [640, 750, 828, 1080, 1200, 1920],
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 60,
    },
  }),
  integrations: [tailwind()],
});