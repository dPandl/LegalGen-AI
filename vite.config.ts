import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      base: './',
      server: {
        port: 3010,
        host: '0.0.0.0',
        proxy: {
          '/api-law/ddg': {
            target: 'https://www.gesetze-im-internet.de',
            changeOrigin: true,
            rewrite: () => '/ddg/__5.html',
          },
          '/api-law/ihk': {
            target: 'https://www.ihk.de',
            changeOrigin: true,
            rewrite: () => '/regensburg/fachthemen/recht/online-recht-und-datenschutz/eu-datenschutzgrundverordnung/anforderungen-an-websites-nach-der-ds-gvo-4158848',
          },
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
