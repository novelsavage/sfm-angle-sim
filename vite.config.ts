import {defineConfig} from 'vite';
export default defineConfig({
  base: process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, '')}/` : '/',
  build:{rollupOptions:{output:{manualChunks:{three:['three','three/addons/controls/OrbitControls.js']}}}},
});
