import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                main: './index.html',
                cbt: './cbt-general/index.html',
                mp3: './mp3-player/index.html',
                text: './text-saver/index.html'
            }
        }
    }
})
