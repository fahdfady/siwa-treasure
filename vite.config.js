import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: path.resolve(__dirname, './'),
    publicDir: 'public',
    server: {
        port: 5173,
        open: true,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'src/js/game.js'),
            },
            output: {
                entryFileNames: `[name].js`,
            }
        }
    }
});