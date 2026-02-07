import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                // トップページがある場合
                main: resolve(__dirname, 'index.html'),
                // 各アプリの入り口を指定
                cbt: resolve(__dirname, 'cbt-general/index.html'),
                mp3: resolve(__dirname, 'mp3-player/index.html'),
                text: resolve(__dirname, 'text-saver/index.html'),
            },
        },
    },
});